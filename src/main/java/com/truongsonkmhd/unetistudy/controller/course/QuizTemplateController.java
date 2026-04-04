package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.service.QuizTemplateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/quiz-templates")
@Slf4j(topic = "QUIZ-TEMPLATE-CONTROLLER")
@Tag(name = "quiz-template-controller")
@RequiredArgsConstructor
public class QuizTemplateController {

        private final QuizTemplateService quizTemplateService;

        // ================= CREATE =================
        @PostMapping
        public ResponseEntity<IResponseMessage> createTemplate(
                        @RequestBody QuizTemplateDTO.CreateRequest request) {

                String createdBy = UserContext.getUserID().toString();

                QuizTemplateDTO.DetailResponse response = quizTemplateService.createTemplate(request, createdBy);

                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(response));
        }

        // ================= UPDATE =================
        @PutMapping("/{templateId}")
        public ResponseEntity<IResponseMessage> updateTemplate(
                        @PathVariable UUID templateId,
                        @RequestBody QuizTemplateDTO.UpdateRequest request) {

                QuizTemplateDTO.DetailResponse response = quizTemplateService.updateTemplate(templateId, request);

                return ResponseEntity.ok(
                                ResponseMessage.UpdatedSuccess(response));
        }

        // ================= GET BY ID =================
        @GetMapping("/{templateId}")
        public ResponseEntity<IResponseMessage> getTemplateById(
                        @PathVariable UUID templateId) {

                QuizTemplateDTO.DetailResponse response = quizTemplateService.getTemplateById(templateId);

                return ResponseEntity.ok(
                                ResponseMessage.LoadedSuccess(response));
        }

        // ================= GET ACTIVE TEMPLATES =================
        // @GetMapping("/active")
        // public ResponseEntity<IResponseMessage> getActiveTemplates(Pageable pageable)
        // {
        //
        // Page<QuizTemplateDTO.Response> response =
        // quizTemplateService.getActiveTemplates(pageable);
        //
        // return ResponseEntity.ok(
        // ResponseMessage.LoadedSuccess(response)
        // );
        // }

        // ================= SEARCH =================
        @GetMapping("/search")
        public ResponseEntity<IResponseMessage> searchTemplates(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) Boolean isActive,
                        @RequestParam(required = false) String searchTerm) {
                return ResponseEntity.ok(
                                ResponseMessage.LoadedSuccess(quizTemplateService.searchTemplates(page, size,
                                                category, isActive, searchTerm)));
        }

        // ================= GET BY CATEGORY =================
        // @GetMapping("/category/{category}")
        // public ResponseEntity<IResponseMessage> getTemplatesByCategory(
        // @PathVariable String category,
        // Pageable pageable) {
        //
        // Page<QuizTemplateDTO.Response> response =
        // quizTemplateService.getTemplatesByCategory(category, pageable);
        //
        // return ResponseEntity.ok(
        // ResponseMessage.LoadedSuccess(response)
        // );
        // }

        // ================= MOST USED =================
        @GetMapping("/most-used")
        public ResponseEntity<IResponseMessage> getMostUsedTemplates() {

                List<QuizTemplateDTO.Response> response = quizTemplateService.getMostUsedTemplates();

                return ResponseEntity.ok(
                                ResponseMessage.LoadedSuccess(response));
        }

        // ================= GET ALL CATEGORIES =================
        @GetMapping("/categories")
        public ResponseEntity<IResponseMessage> getAllCategories() {

                List<String> response = quizTemplateService.getAllCategories();

                return ResponseEntity.ok(
                                ResponseMessage.LoadedSuccess(response));
        }

        // ================= CREATE QUIZ FROM TEMPLATE =================
        @PostMapping("/{templateId}/create-quiz")
        public ResponseEntity<IResponseMessage> createQuizFromTemplate(
                        @PathVariable UUID templateId) {

                Quiz quiz = quizTemplateService.createQuizFromTemplate(templateId);

                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(quiz.getId()));
        }

        // ================= TOGGLE STATUS =================
        @PatchMapping("/{templateId}/status")
        public ResponseEntity<IResponseMessage> toggleTemplateStatus(
                        @PathVariable UUID templateId,
                        @RequestParam boolean isActive) {
                return ResponseEntity.ok(
                                ResponseMessage.UpdatedSuccess(
                                                quizTemplateService.toggleTemplateStatus(templateId, isActive)));
        }

        // ================= DUPLICATE =================
        @PostMapping("/{templateId}/duplicate")
        public ResponseEntity<IResponseMessage> duplicateTemplate(
                        @PathVariable UUID templateId,
                        @RequestParam String newName) {

                QuizTemplateDTO.DetailResponse response = quizTemplateService.duplicateTemplate(templateId, newName);

                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(response));
        }

        // ================= DELETE =================
        @PatchMapping("/{templateId}")
        public ResponseEntity<IResponseMessage> deleteTemplate(
                        @PathVariable UUID templateId) {

                quizTemplateService.deleteTemplate(templateId);

                return ResponseEntity.ok(
                                ResponseMessage.DeletedSuccess(quizTemplateService.deleteTemplate(templateId)));
        }
}
