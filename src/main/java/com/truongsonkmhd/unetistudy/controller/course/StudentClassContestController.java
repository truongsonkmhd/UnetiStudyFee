package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestSubmissionRequest;
import com.truongsonkmhd.unetistudy.security.SecurityUtils;
import com.truongsonkmhd.unetistudy.service.ClassContestSubmissionService;
import com.truongsonkmhd.unetistudy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/student/class-contests")
@Slf4j(topic = "STUDENT-CLASS-CONTEST-CONTROLLER")
@Tag(name = "Student Class Contest Controller")
@RequiredArgsConstructor
public class StudentClassContestController {

        private final ClassContestSubmissionService submissionService;
        private final UserService userService;

        @PostMapping("/{classContestId}/start")
        @Operation(summary = "Bắt đầu bài thi")
        public ResponseEntity<IResponseMessage> startContest(@PathVariable UUID classContestId) {
                UUID userId = getCurrentUserId();
                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(
                                                submissionService.startSubmission(userId, classContestId)));
        }

        @GetMapping("/{classContestId}/session")
        @Operation(summary = "Lấy phiên thi hiện tại (nếu đang diễn ra)")
        public ResponseEntity<IResponseMessage> getSession(@PathVariable UUID classContestId) {
                UUID userId = getCurrentUserId();
                return ResponseEntity.ok(
                                ResponseMessage.LoadedSuccess(
                                                submissionService.getCurrentSession(userId, classContestId)));
        }

        @PostMapping("/submissions/{submissionId}/submit")
        @Operation(summary = "Nộp bài thi")
        public ResponseEntity<IResponseMessage> submitContest(
                        @PathVariable UUID submissionId,
                        @RequestBody ContestSubmissionRequest request) {

                var result = submissionService.submit(submissionId, request);
                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(result));
        }

        private UUID getCurrentUserId() {
                String username = SecurityUtils.getCurrentUserLogin()
                                .orElseThrow(() -> new RuntimeException("Chưa đăng nhập."));
                return userService.findByUsername(username).getId();
        }
}
