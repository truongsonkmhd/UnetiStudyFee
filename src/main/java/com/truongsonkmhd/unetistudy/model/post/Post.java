package com.truongsonkmhd.unetistudy.model.post;

import com.truongsonkmhd.unetistudy.common.PostStatus;
import com.truongsonkmhd.unetistudy.model.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_post", indexes = {
        @Index(name = "idx_post_author", columnList = "author_id"),
        @Index(name = "idx_post_slug", columnList = "slug"),
        @Index(name = "idx_post_status_published", columnList = "status, is_published"),
        @Index(name = "idx_post_created_at", columnList = "created_at")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_id")
    UUID postId;

    @Column(name = "title", nullable = false, length = 500)
    String title;

    @Column(name = "slug", unique = true, length = 600)
    String slug;

    /**
     * Nội dung bài viết dạng HTML (từ rich text editor)
     */
    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    /**
     * Mô tả ngắn / tóm tắt bài viết
     */
    @Column(name = "summary", length = 1000)
    String summary;

    /**
     * URL ảnh đại diện / thumbnail của bài viết (lưu từ Supabase)
     */
    @Column(name = "thumbnail_url", length = 500)
    String thumbnailUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    User author;

    @Column(name = "category", length = 100)
    String category;

    @Column(name = "tags", length = 500)
    String tags; // comma-separated tags, e.g. "java,spring,devops"

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    PostStatus status = PostStatus.DRAFT;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    Boolean isPublished = false;

    @Column(name = "published_at")
    Instant publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    Instant updatedAt;
}
