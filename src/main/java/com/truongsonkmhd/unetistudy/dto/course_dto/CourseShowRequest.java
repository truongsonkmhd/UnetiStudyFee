package com.truongsonkmhd.unetistudy.dto.course_dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.truongsonkmhd.unetistudy.common.CourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseShowRequest {
    String title; // Tiêu đề khóa học
    String description; // Mô tả chi tiết
    String shortDescription; // Mô tả ngắn
    String level; // Trình độ
    String category; // Danh mục chính
    String subCategory; // Danh mục phụ
    Integer duration; // Thời lượng (phút)
    Integer capacity; // Sức chứa
    @Builder.Default
    Integer enrolledCount = 0;
    @JsonIgnore
    MultipartFile imageFile; // File ảnh thumbnail (vẫn giữ upload Supabase)
    String videoUrl; // YouTube URL giới thiệu khóa học (thay thế videoFile)
    CourseStatus status;
    String requirements; // Yêu cầu đầu vào
    String objectives; // Mục tiêu học tập
    String syllabus; // Đề cương
    
    @Builder.Default
    List<String> learningOutcomes = new ArrayList<>(); // Bạn sẽ học được gì
    Boolean isPublished; // Có xuất bản ngay không
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime publishedAt;

    @Builder.Default // neu khong co ccai nay thi khi = new ArrayList<>() mac dinh van la null
    List<CourseModuleRequest> modules = new ArrayList<>();
}
