package com.truongsonkmhd.unetistudy.dto.post_dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.truongsonkmhd.unetistudy.common.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO nhận dữ liệu từ client khi tạo / cập nhật bài viết.
 * Dùng @ModelAttribute vì có file upload (multipart/form-data).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 500, message = "Tiêu đề không được vượt quá 500 ký tự")
    String title;

    /**
     * Nội dung HTML từ rich text editor (Sumernote / TinyMCE / Quill)
     */
    String content;

    /**
     * Tóm tắt ngắn hiển thị ở danh sách
     */
    @Size(max = 1000, message = "Tóm tắt không được vượt quá 1000 ký tự")
    String summary;

    @Size(max = 100, message = "Category không được vượt quá 100 ký tự")
    String category;

    /**
     * Tags dạng chuỗi phân cách bằng dấu phẩy, ví dụ: "java,spring,devops"
     */
    @Size(max = 500, message = "Tags không được vượt quá 500 ký tự")
    String tags;

    /**
     * Trạng thái bài viết: DRAFT | PUBLISHED | ARCHIVED
     */
    PostStatus status;

    /**
     * true => đăng ngay; false => lưu nháp
     */
    Boolean isPublished;

    /**
     * File ảnh thumbnail - không serialize JSON, chỉ dùng với multipart
     */
    @JsonIgnore
    MultipartFile thumbnailFile;
}
