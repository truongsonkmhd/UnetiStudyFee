package com.truongsonkmhd.unetistudy.dto.post_dto;

import com.truongsonkmhd.unetistudy.common.PostStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO trả về chi tiết đầy đủ một bài viết (dùng cho trang chi tiết & edit).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostDetailResponse {

    UUID postId;
    String title;
    String slug;

    /**
     * Nội dung HTML đầy đủ
     */
    String content;
    String summary;
    String thumbnailUrl;
    String category;
    String tags;
    Integer viewCount;
    PostStatus status;
    Boolean isPublished;
    Instant publishedAt;
    Instant createdAt;
    Instant updatedAt;

    // Author info (denormalized)
    UUID authorId;
    String authorName;
    String authorAvatar;
}
