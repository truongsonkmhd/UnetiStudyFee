package com.truongsonkmhd.unetistudy.dto.post_dto;

import com.truongsonkmhd.unetistudy.common.PostStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO thu gọn dùng trong danh sách bài viết (card / feed).
 * Không chứa content HTML để giảm băng thông.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCardResponse {

    UUID postId;
    String title;
    String slug;
    String summary;
    String thumbnailUrl;
    String category;
    String tags;
    Integer viewCount;
    PostStatus status;
    Boolean isPublished;
    Instant publishedAt;
    Instant createdAt;

    // Author info
    UUID authorId;
    String authorName;
    String authorAvatar;
}
