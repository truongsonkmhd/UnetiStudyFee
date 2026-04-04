package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateDTO;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;

import java.util.UUID;

public interface CodingExerciseTemplateService {
        CodingExerciseTemplate getById(UUID templateId);

        CodingExerciseTemplate save(CodingExerciseTemplateDTO codingExercise);

        CodingExerciseTemplate update(UUID id, CodingExerciseTemplateDTO dto);

        PageResponse<CodingExerciseTemplateCardResponse> getPublishedTemplates(
                        int page, int size);

        PageResponse<CodingExerciseTemplateCardResponse> searchTemplates(
                        int page, int size, String q, Difficulty difficulty,
                        String category, String language);

        PageResponse<CodingExerciseTemplateCardResponse> searchAllTemplates(
                        int page, int size, String q, Difficulty difficulty,
                        String category, String language, Boolean published);

        CursorResponse<CodingExerciseTemplateCardResponse> getPublishedTemplatesCursor(
                        String cursor, int size);

        CursorResponse<CodingExerciseTemplateCardResponse> searchTemplatesCursor(
                        String cursor, int size, String q, Difficulty difficulty,
                        String category, String language);
        CodingExerciseTemplate togglePublish(UUID id, boolean published);
}
