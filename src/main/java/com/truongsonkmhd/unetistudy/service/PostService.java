package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostCardResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostDetailResponse;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostRequest;

import java.util.UUID;

/**
 * Service interface cho chức năng quản lý bài viết (Post/Blog).
 */
public interface PostService {

    /**
     * Tạo bài viết mới
     *
     * @param request DTO chứa thông tin bài viết & file thumbnail
     * @return PostDetailResponse của bài viết vừa tạo
     */
    PostDetailResponse createPost(PostRequest request);

    /**
     * Cập nhật bài viết
     *
     * @param postId  ID bài viết cần cập nhật
     * @param request DTO chứa thông tin chỉnh sửa
     * @return PostDetailResponse sau khi cập nhật
     */
    PostDetailResponse updatePost(UUID postId, PostRequest request);

    /**
     * Xóa bài viết theo ID
     *
     * @param postId ID bài viết cần xóa
     * @return ID vừa xóa
     */
    UUID deletePost(UUID postId);

    /**
     * Lấy chi tiết bài viết theo ID (dùng cho admin/tác giả)
     *
     * @param postId ID bài viết
     * @return PostDetailResponse
     */
    PostDetailResponse getPostById(UUID postId);

    /**
     * Lấy chi tiết bài viết theo Slug - tăng view count
     *
     * @param slug Slug của bài viết
     * @return PostDetailResponse
     */
    PostDetailResponse getPostBySlug(String slug);

    /**
     * Lấy danh sách bài viết với filter (dành cho admin/teacher: thấy cả DRAFT)
     *
     * @param page     Trang hiện tại (0-indexed)
     * @param size     Số phần tử mỗi trang (max 50)
     * @param q        Từ khóa tìm kiếm theo title / summary
     * @param status   Lọc theo status (DRAFT | PUBLISHED | ARCHIVED)
     * @param category Lọc theo category
     * @param authorId Lọc theo tác giả (UUID dạng String)
     * @return PageResponse<PostCardResponse>
     */
    PageResponse<PostCardResponse> getAllPosts(Integer page, Integer size, String q,
            String status, String category, String authorId);

    /**
     * Lấy danh sách bài viết công khai - chỉ PUBLISHED (dành cho user / trang chủ)
     *
     * @param page     Trang hiện tại
     * @param size     Số phần tử mỗi trang
     * @param q        Từ khóa tìm kiếm
     * @param category Lọc theo category
     * @return PageResponse<PostCardResponse>
     */
    PageResponse<PostCardResponse> getPublishedPosts(Integer page, Integer size,
            String q, String category);

    /**
     * Publish hoặc unpublish bài viết nhanh (không cần gửi toàn bộ request)
     *
     * @param postId    ID bài viết
     * @param published true = publish, false = unpublish về DRAFT
     * @return PostDetailResponse sau khi thay đổi
     */
    PostDetailResponse changePublishStatus(UUID postId, boolean published);
}
