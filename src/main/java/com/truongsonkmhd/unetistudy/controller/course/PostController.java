package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.post_dto.PostRequest;
import com.truongsonkmhd.unetistudy.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@Slf4j(topic = "POST-CONTROLLER")
@Tag(name = "Post Controller", description = "API quản lý bài viết (blog/post)")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }

    // =========================
    // CREATE
    // =========================
    @PostMapping(value = "/add", consumes = { "multipart/form-data" })
    @Operation(summary = "Tạo bài viết mới")
    public ResponseEntity<IResponseMessage> createPost(@Valid @ModelAttribute PostRequest request) {
        log.info("Creating new post: title={}", request.getTitle());
        return ResponseEntity.ok(ResponseMessage.CreatedSuccess(postService.createPost(request)));
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping(value = "/upd/{postId}", consumes = { "multipart/form-data" })
    @Operation(summary = "Cập nhật bài viết")
    public ResponseEntity<IResponseMessage> updatePost(@PathVariable UUID postId,
            @Valid @ModelAttribute PostRequest request) {
        log.info("Updating post: id={}", postId);
        return ResponseEntity.ok(ResponseMessage.UpdatedSuccess(postService.updatePost(postId, request)));
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/delete/{postId}")
    @Operation(summary = "Xóa bài viết")
    public ResponseEntity<IResponseMessage> deletePost(@PathVariable UUID postId) {
        log.info("Deleting post: id={}", postId);
        return ResponseEntity.ok(ResponseMessage.DeletedSuccess(postService.deletePost(postId)));
    }

    // =========================
    // GET BY ID (Admin / Author)
    // =========================
    @GetMapping("/getPostById/{postId}")
    @Operation(summary = "Lấy chi tiết bài viết theo ID (admin/author)")
    public ResponseEntity<IResponseMessage> getPostById(@PathVariable UUID postId) {
        return ResponseEntity.ok(ResponseMessage.LoadedSuccess(postService.getPostById(postId)));
    }

    // =========================
    // GET BY SLUG (Public - tăng view count)
    // =========================
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Lấy bài viết theo slug (public - tăng view)")
    public ResponseEntity<IResponseMessage> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ResponseMessage.LoadedSuccess(postService.getPostBySlug(slug)));
    }

    // =========================
    // GET ALL (Admin/Teacher - có filter)
    // =========================
    @GetMapping
    @Operation(summary = "Lấy danh sách bài viết (admin/teacher) với filter")
    public ResponseEntity<IResponseMessage> getAllPosts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String authorId) {
        return ResponseEntity.ok(
                ResponseMessage.LoadedSuccess(postService.getAllPosts(page, size, q, status, category, authorId)));
    }

    // =========================
    // GET PUBLISHED (Public feed - chỉ bài viết đã đăng)
    // =========================
    @GetMapping("/published")
    @Operation(summary = "Lấy danh sách bài viết công khai (public feed)")
    public ResponseEntity<IResponseMessage> getPublishedPosts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(
                ResponseMessage.LoadedSuccess(postService.getPublishedPosts(page, size, q, category)));
    }

    // =========================
    // TOGGLE PUBLISH
    // =========================
    @PatchMapping("/{postId}/publish")
    @Operation(summary = "Thay đổi trạng thái publish bài viết")
    public ResponseEntity<IResponseMessage> changePublishStatus(
            @PathVariable UUID postId,
            @RequestParam boolean published) {
        log.info("Changing publish status: id={}, published={}", postId, published);
        return ResponseEntity.ok(
                ResponseMessage.UpdatedSuccess(postService.changePublishStatus(postId, published)));
    }
}
