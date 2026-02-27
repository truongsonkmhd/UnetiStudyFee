package com.truongsonkmhd.unetistudy.mapper.post;

import com.truongsonkmhd.unetistudy.dto.post_dto.PostRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.post.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper chuyển đổi PostRequest → Post entity.
 * Các field cần xử lý logic riêng (slug, thumbnailUrl, author, timestamps)
 * sẽ được ignore ở đây và set thủ công trong service.
 */
@Mapper(componentModel = "spring")
public interface PostRequestMapper extends EntityMapper<PostRequest, Post> {

    @Override
    @Mapping(target = "postId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true) // set sau khi upload PocketBase
    @Mapping(target = "author", ignore = true) // set từ UserContext trong service
    @Mapping(target = "viewCount", constant = "0")
    @Mapping(target = "isPublished", expression = "java(dto.getIsPublished() != null ? dto.getIsPublished() : false)")
    @Mapping(target = "status", expression = "java(dto.getStatus() != null ? dto.getStatus() : com.truongsonkmhd.unetistudy.common.PostStatus.DRAFT)")
    @Mapping(target = "publishedAt", ignore = true) // set trong service dựa trên isPublished
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Post toEntity(PostRequest dto);

    /**
     * toDto: PostRequest không cần map ngược từ Post (không dùng trong thực tế)
     */
    @Override
    @Mapping(target = "thumbnailFile", ignore = true)
    PostRequest toDto(Post entity);

    @Override
    @Mapping(target = "postId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void partialUpdate(@MappingTarget Post entity, PostRequest dto);
}
