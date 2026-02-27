package com.truongsonkmhd.unetistudy.repository.post;

import com.truongsonkmhd.unetistudy.common.PostStatus;
import com.truongsonkmhd.unetistudy.model.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Tìm kiếm bài viết với filter động (q, status, category, authorId)
     * Chỉ admin/teacher thấy DRAFT; user thường chỉ thấy PUBLISHED.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE (:q IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%'))
                                OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:status IS NULL OR p.status = :status)
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
              AND (:authorId IS NULL OR p.author.id = :authorId)
            ORDER BY p.createdAt DESC
            """)
    Page<Post> findPostsWithFilters(
            @Param("q") String q,
            @Param("status") PostStatus status,
            @Param("category") String category,
            @Param("authorId") UUID authorId,
            Pageable pageable);

    /**
     * Chỉ lấy bài viết đã PUBLISHED - dành cho public feed
     */
    @Query("""
            SELECT p FROM Post p
            WHERE p.isPublished = true AND p.status = 'PUBLISHED'
              AND (:q IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
            ORDER BY p.publishedAt DESC
            """)
    Page<Post> findPublishedPosts(
            @Param("q") String q,
            @Param("category") String category,
            Pageable pageable);

    /**
     * Tăng view count
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.postId = :postId")
    void incrementViewCount(@Param("postId") UUID postId);
}
