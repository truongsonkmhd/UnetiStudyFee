package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;

import java.util.List;
import java.util.UUID;

public interface QuizTemplateService {

    QuizTemplateDTO.DetailResponse createTemplate(QuizTemplateDTO.CreateRequest request, String createdBy);

    QuizTemplateDTO.DetailResponse updateTemplate(UUID templateId, QuizTemplateDTO.UpdateRequest request);

    QuizTemplateDTO.DetailResponse getTemplateById(UUID templateId);

    // Page<QuizTemplateDTO.Response> getActiveTemplates(Pageable pageable);

    PageResponse<QuizTemplateDTO.Response> searchTemplates(int page, int size, String category, Boolean isActive,
            String searchTerm);

    // Page<QuizTemplateDTO.Response> getTemplatesByCategory(String category,
    // Pageable pageable);

    List<QuizTemplateDTO.Response> getMostUsedTemplates();

    List<String> getAllCategories();

    Quiz createQuizFromTemplate(UUID templateId);

    boolean toggleTemplateStatus(UUID templateId, boolean isActive);

    boolean deleteTemplate(UUID templateId);

    QuizTemplateDTO.DetailResponse duplicateTemplate(UUID templateId, String newName);

}
