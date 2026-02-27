package com.truongsonkmhd.unetistudy.mapper.post;

import com.truongsonkmhd.unetistudy.dto.post_dto.PostDetailResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostCardResponse;
import com.truongsonkmhd.unetistudy.model.post.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper chuyển đổi Post entity → Response DTOs.
 */
@Mapper(componentModel = "spring")
public interface PostResponseMapper {

    /**
     * Map sang PostDetailResponse (có content HTML đầy đủ)
     */
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "authorAvatar", source = "author.avatar")
    PostDetailResponse toDetailDto(Post post);

    /**
     * Map sang PostCardResponse (không có content, dùng trong danh sách)
     */
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "authorAvatar", source = "author.avatar")
    PostCardResponse toCardDto(Post post);

    List<PostCardResponse> toCardDtoList(List<Post> posts);
}
