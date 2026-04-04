package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.CourseApprovalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("")
@Slf4j(topic = "COURSE-APPROVAL-CONTROLLER")
@Tag(name = "course_approval Controller")
@RequiredArgsConstructor
public class CourseApprovalController {

    private final CourseApprovalService approvalService;

    @PostMapping("/admin/courses/{id}/submit-approval")
    public ResponseEntity<IResponseMessage> submit(@PathVariable UUID id,
            @RequestBody(required = false) NoteRequest req) {
        return ResponseEntity.ok().body(ResponseMessage
                .CreatedSuccess(approvalService.submitForApproval(id, req != null ? req.note() : null)));
    }

    @GetMapping("/published/scroll")
    @Transactional
    public ResponseEntity<IResponseMessage> pending() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(approvalService.getListCourseByStatus()));
    }

    @PostMapping("/admin/courses/{id}/approve")
    public ResponseEntity<IResponseMessage> approve(@PathVariable UUID id,
            @RequestBody(required = false) NoteRequest req) {
        return ResponseEntity.ok().body(
                ResponseMessage.CreatedSuccess(approvalService.approve(id, req != null ? req.note() : null)));
    }

    @PostMapping("/admin/courses/{id}/reject")
    public ResponseEntity<IResponseMessage> reject(@PathVariable UUID id,
            @RequestBody(required = false) RejectRequest req) {
        return ResponseEntity.ok()
                .body(ResponseMessage.CreatedSuccess(approvalService.reject(id, req.reason())));
    }

    public record NoteRequest(String note) {
    }

    public record RejectRequest(String reason) {
    }

}
