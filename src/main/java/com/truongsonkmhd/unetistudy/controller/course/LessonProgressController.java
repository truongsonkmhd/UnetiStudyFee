package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.progress_dto.CourseProgressSummaryResponse;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressResponse;
import com.truongsonkmhd.unetistudy.service.LessonProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Learning Progress", description = "APIs for tracking student learning progress")
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @PostMapping
    @Operation(summary = "Update lesson progress", description = "Update or create progress for a lesson")
    public ResponseEntity<IResponseMessage> updateProgress(
            @Valid @RequestBody LessonProgressRequest request) {

        UUID userId  = UserContext.getUserID();
        log.info("User {} updating progress for lesson {}", userId, request.getLessonId());

        LessonProgressResponse response = lessonProgressService.updateProgress(userId, request);
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(response));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get course progress", description = "Get all lesson progress for a course")
    public ResponseEntity<IResponseMessage> getCourseProgress(

            @PathVariable UUID courseId) {

        UUID userId = UserContext.getUserID();
        log.info("User {} getting progress for course {}", userId, courseId);

        List<LessonProgressResponse> progressList = lessonProgressService.getCourseProgress(userId, courseId);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(progressList));
    }

    @GetMapping("/course/{courseId}/summary")
    @Operation(summary = "Get course progress summary", description = "Get progress summary with completion stats and last accessed lesson")
    public ResponseEntity<IResponseMessage> getCourseSummary(

            @PathVariable UUID courseId) {

        UUID userId = UserContext.getUserID();
        log.info("User {} getting summary for course {}", userId, courseId);

        CourseProgressSummaryResponse summary = lessonProgressService.getCourseSummary(userId, courseId);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(summary));
    }

    @GetMapping("/course/{courseId}/lesson/{lessonId}")
    @Operation(summary = "Get lesson progress", description = "Get progress for a specific lesson")
    public ResponseEntity<IResponseMessage> getLessonProgress(

            @PathVariable UUID courseId,
            @PathVariable UUID lessonId) {

        UUID userId = UserContext.getUserID();
        log.info("User {} getting progress for lesson {} in course {}", userId, lessonId, courseId);

        LessonProgressResponse progress = lessonProgressService.getLessonProgress(userId, courseId, lessonId);

        if (progress == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(progress));
    }
}
