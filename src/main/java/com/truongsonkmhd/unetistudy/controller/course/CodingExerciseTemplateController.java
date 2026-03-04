package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateDTO;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.CodingExerciseTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/coding-exercise-template")
@Slf4j(topic = "coding-exercise")
@Tag(name = "Coding Exercise Controller")
@RequiredArgsConstructor
public class CodingExerciseTemplateController {

        private final CodingExerciseTemplateService codingExerciseTemplateService;

        // ========== CREATE ==========

        @PostMapping("")
        @Operation(summary = "Create new coding exercise template")
        public ResponseEntity<IResponseMessage> createTemplate(
                        @RequestBody CodingExerciseTemplateDTO dto) {
                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(codingExerciseTemplateService.save(dto)));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update coding exercise template")
        public ResponseEntity<IResponseMessage> updateTemplate(
                        @PathVariable UUID id,
                        @RequestBody CodingExerciseTemplateDTO dto) {
                return ResponseEntity.ok(
                                ResponseMessage.UpdatedSuccess(codingExerciseTemplateService.update(id, dto)));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get coding exercise template by id")
        public ResponseEntity<IResponseMessage> getById(
                        @PathVariable UUID id) {
                return ResponseEntity.ok(
                                ResponseMessage.CreatedSuccess(codingExerciseTemplateService.getById(id)));
        }

        @GetMapping("")
        @Operation(summary = "Get published templates (offset pagination)")
        public ResponseEntity<PageResponse<CodingExerciseTemplateCardResponse>> getPublishedTemplates(
                        @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") int size) {

                return ResponseEntity.ok(codingExerciseTemplateService.getPublishedTemplates(page, size));
        }

        @GetMapping("/search")
        @Operation(summary = "Search published templates with filters")
        public ResponseEntity<IResponseMessage> searchTemplates(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false) Difficulty difficulty,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) String language) {
                return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(
                                codingExerciseTemplateService.searchTemplates(page, size, q, difficulty, category,
                                                language)));
        }

        @GetMapping("/search/all")
        @Operation(summary = "Search all templates (admin only)")
        public ResponseEntity<IResponseMessage> searchAllTemplates(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false) Difficulty difficulty,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) String language,
                        @RequestParam(required = false) Boolean published) {

                return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(
                                codingExerciseTemplateService.searchAllTemplates(page, size, q, difficulty, category,
                                                language, published)));
        }

        // ========== CURSOR PAGINATION ==========

        @GetMapping("/cursor")
        @Operation(summary = "Get published templates (cursor pagination for infinite scroll)")
        public ResponseEntity<CursorResponse<CodingExerciseTemplateCardResponse>> getTemplatesCursor(
                        @Parameter(description = "Cursor for next page (from previous response)") @RequestParam(required = false) String cursor,
                        @Parameter(description = "Page size (max 30)") @RequestParam(defaultValue = "10") int size) {

                return ResponseEntity.ok(codingExerciseTemplateService.getPublishedTemplatesCursor(cursor, size));
        }

        @GetMapping("/cursor/search")
        @Operation(summary = "Search templates with cursor pagination")
        public ResponseEntity<CursorResponse<CodingExerciseTemplateCardResponse>> searchTemplatesCursor(
                        @RequestParam(required = false) String cursor,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false) Difficulty difficulty,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) String language) {

                return ResponseEntity.ok(
                                codingExerciseTemplateService.searchTemplatesCursor(cursor, size, q, difficulty,
                                                category, language));
        }
}