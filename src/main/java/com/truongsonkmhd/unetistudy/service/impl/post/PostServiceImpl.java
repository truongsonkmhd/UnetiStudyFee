package com.truongsonkmhd.unetistudy.service.impl.post;

import com.github.slugify.Slugify;
import com.truongsonkmhd.unetistudy.common.PostStatus;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostCardResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostDetailResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostRequest;
import com.truongsonkmhd.unetistudy.exception.payload.DataNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.post.PostRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.post.PostResponseMapper;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.post.Post;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.post.PostRepository;
import com.truongsonkmhd.unetistudy.service.PostService;
import com.truongsonkmhd.unetistudy.service.infrastructure.PocketBaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "POST-SERVICE")
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostRequestMapper postRequestMapper;
    private final PostResponseMapper postResponseMapper;
    private final PocketBaseService pocketBaseService;
    private final Slugify slugify;

    // =========================
    // CREATE
    // =========================
    @Override
    @Transactional
    public PostDetailResponse createPost(PostRequest request) {
        UUID userId = UserContext.getUserID();
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found: " + userId));

        Post post = postRequestMapper.toEntity(request);
        post.setAuthor(author);

        // Generate unique slug từ title
        String baseSlug = slugify.slugify(request.getTitle());
        post.setSlug(generateUniqueSlug(baseSlug));

        // Upload thumbnail nếu có
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            String thumbnailUrl = pocketBaseService.uploadFile("post_images", request.getThumbnailFile());
            if (thumbnailUrl != null) {
                post.setThumbnailUrl(thumbnailUrl);
            }
        }

        // Xử lý publish status
        handlePublishStatus(post, request.getIsPublished());

        // Defaults
        if (post.getViewCount() == null)
            post.setViewCount(0);
        if (post.getStatus() == null)
            post.setStatus(PostStatus.DRAFT);

        Post saved = postRepository.save(post);
        log.info("Created post: id={}, title={}, slug={}", saved.getPostId(), saved.getTitle(), saved.getSlug());

        return mapToDetailResponse(saved);
    }

    // =========================
    // UPDATE
    // =========================
    @Override
    @Transactional
    public PostDetailResponse updatePost(UUID postId, PostRequest request) {
        Post post = findPostOrThrow(postId);

        // Cập nhật fields
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSummary(request.getSummary());
        post.setCategory(request.getCategory());
        post.setTags(request.getTags());

        // Update slug nếu title thay đổi
        String newBaseSlug = slugify.slugify(request.getTitle());
        if (newBaseSlug != null && !newBaseSlug.isBlank() && !newBaseSlug.equals(post.getSlug())) {
            post.setSlug(generateUniqueSlugForUpdate(newBaseSlug, postId));
        }

        // Upload thumbnail mới nếu có
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            String thumbnailUrl = pocketBaseService.uploadFile("post_images", request.getThumbnailFile());
            if (thumbnailUrl != null) {
                post.setThumbnailUrl(thumbnailUrl);
            }
        }

        // Xử lý publish status
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus());
        }
        handlePublishStatus(post, request.getIsPublished());

        Post saved = postRepository.save(post);
        log.info("Updated post: id={}, title={}", saved.getPostId(), saved.getTitle());

        return mapToDetailResponse(saved);
    }

    // =========================
    // DELETE
    // =========================
    @Override
    @Transactional
    public UUID deletePost(UUID postId) {
        Post post = findPostOrThrow(postId);
        postRepository.delete(post);
        log.info("Deleted post: id={}, title={}", postId, post.getTitle());
        return postId;
    }

    // =========================
    // GET BY ID (Admin/Author)
    // =========================
    @Override
    @Transactional(readOnly = true)
    public PostDetailResponse getPostById(UUID postId) {
        Post post = findPostOrThrow(postId);
        return mapToDetailResponse(post);
    }

    // =========================
    // GET BY SLUG (Public - tăng view)
    // =========================
    @Override
    @Transactional
    public PostDetailResponse getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new DataNotFoundException("Post not found with slug: " + slug));

        // Tăng view count (async-safe, update trực tiếp DB)
        postRepository.incrementViewCount(post.getPostId());
        post.setViewCount(post.getViewCount() + 1); // reflect trong response

        return mapToDetailResponse(post);
    }

    // =========================
    // GET ALL (Admin/Teacher - với filter)
    // =========================
    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostCardResponse> getAllPosts(Integer page, Integer size, String q,
            String status, String category, String authorId) {
        int safePage = (page != null) ? Math.max(page, 0) : 0;
        int safeSize = (size != null) ? Math.min(Math.max(size, 1), 50) : 10;
        Pageable pageable = PageRequest.of(safePage, safeSize);

        PostStatus postStatus = parseStatus(status);
        UUID authorUUID = parseUUID(authorId);

        Page<Post> result = postRepository.findPostsWithFilters(q, postStatus, category, authorUUID, pageable);

        return PageResponse.<PostCardResponse>builder()
                .items(result.getContent().stream().map(this::mapToCardResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    // =========================
    // GET PUBLISHED (Public feed)
    // =========================
    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostCardResponse> getPublishedPosts(Integer page, Integer size,
            String q, String category) {
        int safePage = (page != null) ? Math.max(page, 0) : 0;
        int safeSize = (size != null) ? Math.min(Math.max(size, 1), 50) : 10;
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Post> result = postRepository.findPublishedPosts(q, category, pageable);

        return PageResponse.<PostCardResponse>builder()
                .items(result.getContent().stream().map(this::mapToCardResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    // =========================
    // TOGGLE PUBLISH
    // =========================
    @Override
    @Transactional
    public PostDetailResponse changePublishStatus(UUID postId, boolean published) {
        Post post = findPostOrThrow(postId);
        handlePublishStatus(post, published);

        if (published) {
            post.setStatus(PostStatus.PUBLISHED);
        } else {
            post.setStatus(PostStatus.DRAFT);
        }

        Post saved = postRepository.save(post);
        log.info("Changed publish status: id={}, published={}", postId, published);
        return mapToDetailResponse(saved);
    }

    // =========================
    // PRIVATE HELPERS
    // =========================

    private Post findPostOrThrow(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new DataNotFoundException("Post not found with id: " + postId));
    }

    /**
     * Xử lý logic publish: set publishedAt khi lần đầu publish
     */
    private void handlePublishStatus(Post post, Boolean isPublished) {
        if (Boolean.TRUE.equals(isPublished)) {
            post.setIsPublished(true);
            if (post.getPublishedAt() == null) {
                post.setPublishedAt(Instant.now());
            }
            if (post.getStatus() == PostStatus.DRAFT) {
                post.setStatus(PostStatus.PUBLISHED);
            }
        } else {
            post.setIsPublished(false);
        }
    }

    /**
     * Map entity → PostDetailResponse, kèm xử lý thumbnailUrl qua PocketBase
     */
    private PostDetailResponse mapToDetailResponse(Post post) {
        PostDetailResponse dto = postResponseMapper.toDetailDto(post);
        dto.setThumbnailUrl(pocketBaseService.toDisplayUrl(post.getThumbnailUrl()));
        return dto;
    }

    /**
     * Map entity → PostCardResponse, kèm xử lý thumbnailUrl
     */
    private PostCardResponse mapToCardResponse(Post post) {
        PostCardResponse dto = postResponseMapper.toCardDto(post);
        dto.setThumbnailUrl(pocketBaseService.toDisplayUrl(post.getThumbnailUrl()));
        return dto;
    }

    // =========================
    // SLUG GENERATION
    // =========================

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private String generateUniqueSlugForUpdate(String baseSlug, UUID postId) {
        String slug = baseSlug;
        int counter = 1;
        while (true) {
            var found = postRepository.findBySlug(slug);
            if (found.isEmpty())
                return slug;
            if (found.get().getPostId().equals(postId))
                return slug;
            slug = baseSlug + "-" + counter;
            counter++;
        }
    }

    private PostStatus parseStatus(String status) {
        if (status == null || status.isBlank())
            return null;
        try {
            return PostStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid post status: {}", status);
            return null;
        }
    }

    private UUID parseUUID(String uuidStr) {
        if (uuidStr == null || uuidStr.isBlank())
            return null;
        try {
            return UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID: {}", uuidStr);
            return null;
        }
    }
}
