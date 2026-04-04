package com.truongsonkmhd.unetistudy.service.impl.quiz;

import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.quiz.QuizTemplateMapper;
import com.truongsonkmhd.unetistudy.model.quiz.*;
import com.truongsonkmhd.unetistudy.model.quiz.template.AnswerTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuestionTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizTemplateRepository;
import com.truongsonkmhd.unetistudy.service.QuizTemplateService;
import com.truongsonkmhd.unetistudy.utils.PageResponseBuilder;
import com.truongsonkmhd.unetistudy.validator.QuizTemplateValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.truongsonkmhd.unetistudy.cache.service.QuizTemplateCacheService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service quản lý Quiz Templates với tích hợp Caching
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside - Cache template details và danh sách
 * 2. Cache Invalidation - Evict cache khi create/update/delete
 * 3. Time-based Expiration - TTL 15 phút
 * 4. LRU Eviction - Loại bỏ templates ít dùng
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizTemplateServiceImpl implements QuizTemplateService {

    private final QuizTemplateRepository templateRepository;
    private final QuizTemplateMapper templateMapper;
    private final QuizTemplateValidator templateValidator;
    private final QuizTemplateCacheService templateCacheService;

    /**
     * Tạo template mới - Evict list caches
     */
    @Override
    @Transactional
    public QuizTemplateDTO.DetailResponse createTemplate(QuizTemplateDTO.CreateRequest request, String createdBy) {
        log.info("Creating quiz template: {} - Programmatic eviction", request.getTemplateName());

        QuizTemplate template = templateMapper.toEntity(request, createdBy);
        QuizTemplate savedTemplate = templateRepository.save(template);

        // Xóa list cache
        templateCacheService.evictTemplatesList();

        log.info("Quiz template created successfully with ID: {}", savedTemplate.getId());
        return templateMapper.toDetailResponse(savedTemplate);
    }

    /**
     * Cache Invalidation: Evict cache khi update template
     */
    @Override
    @Transactional
    public QuizTemplateDTO.DetailResponse updateTemplate(UUID templateId, QuizTemplateDTO.UpdateRequest request) {
        log.info("Updating quiz template: {} - Programmatic eviction", templateId);

        QuizTemplate template = findTemplateOrThrow(templateId);
        templateValidator.validateVersion(template, request.getVersion());

        if (request.getTemplateName() != null) {
            template.setTitle(request.getTemplateName());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            template.setCategory(request.getCategory());
        }
        if (request.getThumbnailUrl() != null) {
            template.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getPassScore() != null) {
            template.setPassScore(request.getPassScore());
        }
        if (request.getMaxAttempts() != null) {
            template.setMaxAttempts(request.getMaxAttempts());
        }
        if (request.getIsActive() != null) {
            template.setIsActive(request.getIsActive());
        }

        QuizTemplate updatedTemplate = templateRepository.save(template);

        // Xóa cache
        templateCacheService.evictTemplate(templateId);

        log.info("Quiz template updated successfully: {}", templateId);
        return templateMapper.toDetailResponse(updatedTemplate);
    }

    /**
     * Cache-Aside: Lấy template by ID
     * Cache key: templateId
     * TTL: 15 phút
     */
    @Override
    @Transactional(readOnly = true)
    public QuizTemplateDTO.DetailResponse getTemplateById(UUID templateId) {
        log.debug("Fetching quiz template by ID: {} (Programmatic Cache)", templateId);

        return templateCacheService.getTemplateById(templateId, () -> {
            log.debug("Cache MISS - Loading quiz template from DB: {}", templateId);
            QuizTemplate template = templateRepository.findByIdWithQuestionsAndAnswers(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz template not found with ID: " + templateId));
            return templateMapper.toDetailResponse(template);
        });
    }

    /**
     * Cache-Aside: Tìm kiếm templates
     * Cache key: các params tìm kiếm
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuizTemplateDTO.Response> searchTemplates(
            int page, int size, String category, Boolean isActive, String searchTerm) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String normalizedCategory = (category != null && category.trim().isEmpty()) ? null : category;
        String normalizedSearchTerm = (searchTerm != null && searchTerm.trim().isEmpty()) ? null : searchTerm;

        String cacheKey = String.format("search:%d:%d:%s:%s:%s",
                safePage, safeSize, (normalizedCategory != null ? normalizedCategory : ""),
                (isActive != null ? isActive : ""), (normalizedSearchTerm != null ? normalizedSearchTerm : ""));

        log.debug("Searching templates: {} (Programmatic Cache)", cacheKey);

        return templateCacheService.getTemplatesSearch(cacheKey, () -> {
            log.debug("Cache MISS - Searching templates from DB");
            Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
            try {
                Page<QuizTemplate> templatePage = templateRepository.searchTemplates(
                        normalizedCategory,
                        isActive,
                        normalizedSearchTerm,
                        pageable);

                log.info("Query executed - Found {} templates", templatePage.getTotalElements());

                Page<QuizTemplateDTO.Response> responsePage = templatePage.map(template -> {
                    try {
                        return templateMapper.toResponse(template);
                    } catch (Exception e) {
                        log.error("Error mapping template ID: {} to response", template.getId(), e);
                        throw new RuntimeException("Error mapping template: " + template.getId(), e);
                    }
                });

                return PageResponseBuilder.build(responsePage);
            } catch (Exception e) {
                log.error("Error searching templates", e);
                throw new RuntimeException("Failed to search templates", e);
            }
        });
    }

    /**
     * Cache-Aside: Lấy most used templates
     * Cache dài hơn vì ít thay đổi
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuizTemplateDTO.Response> getMostUsedTemplates() {
        log.debug("Fetching most used templates (Programmatic Cache)");
        return templateCacheService.getMostUsedTemplates(() -> {
            log.debug("Cache MISS - Loading most used templates");
            return templateRepository.findTop10ByIsActiveTrueOrderByUsageCountDesc()
                    .stream()
                    .map(templateMapper::toResponse)
                    .collect(Collectors.toList());
        });
    }

    /**
     * Cache-Aside: Lấy tất cả categories
     * Cache dài vì categories ít thay đổi
     */
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.debug("Fetching all categories (Programmatic Cache)");
        return templateCacheService.getAllCategories(() -> {
            log.debug("Cache MISS - Loading all categories");
            return templateRepository.findAllCategories();
        });
    }

    /**
     * Tạo quiz từ template - Evict cache vì usage count thay đổi
     */
    @Override
    @Transactional
    public Quiz createQuizFromTemplate(UUID templateId) {
        log.info("Creating quiz from template: {} - Programmatic eviction", templateId);

        QuizTemplate template = templateRepository.findByIdWithQuestionsAndAnswers(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz template not found with ID: " + templateId));

        templateValidator.validateForQuizCreation(template);

        template.incrementUsageCount();
        templateRepository.save(template);

        // Evict cache
        templateCacheService.evictTemplate(templateId);

        Quiz quiz = templateMapper.templateToQuiz(template);

        log.info("Quiz created from template successfully. Template usage count: {}", template.getUsageCount());
        return quiz;
    }

    /**
     * Toggle status - Evict caches
     */
    @Override
    @Transactional
    public boolean toggleTemplateStatus(UUID templateId, boolean isActive) {
        log.info("Toggling template status: {} to {} - Programmatic eviction", templateId, isActive);

        QuizTemplate template = findTemplateOrThrow(templateId);
        template.setIsActive(isActive);
        templateRepository.save(template);

        // Xóa cache
        templateCacheService.evictTemplate(templateId);

        log.info("Template status toggled successfully");
        return true;
    }

    /**
     * Soft delete - Evict caches
     */
    @Override
    @Transactional
    public boolean deleteTemplate(UUID templateId) {
        log.info("Soft deleting quiz template: {} - Programmatic eviction", templateId);

        QuizTemplate template = findTemplateOrThrow(templateId);
        template.softDelete();
        templateRepository.save(template);

        // Xóa cache
        templateCacheService.evictTemplate(templateId);

        log.info("Quiz template soft deleted successfully");
        return true;
    }

    /**
     * Duplicate template - Evict list cache
     */
    @Override
    @Transactional
    public QuizTemplateDTO.DetailResponse duplicateTemplate(UUID templateId, String newName) {
        log.info("Duplicating template: {} with new name: {} - Programmatic eviction", templateId, newName);

        QuizTemplate original = templateRepository.findByIdWithQuestionsAndAnswers(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz template not found with ID: " + templateId));

        QuizTemplate duplicate = QuizTemplate.builder()
                .title(newName != null && !newName.trim().isEmpty() ? newName : original.getTitle() + " (Copy)")
                .description(original.getDescription())
                .category(original.getCategory())
                .thumbnailUrl(original.getThumbnailUrl())
                .passScore(original.getPassScore())
                .maxAttempts(original.getMaxAttempts())
                .createdBy(original.getCreatedBy())
                .isActive(true)
                .isDeleted(false)
                .build();

        original.getQuestionTemplates().forEach(qt -> {
            QuestionTemplate duplicateQuestion = QuestionTemplate.builder()
                    .content(qt.getContent())
                    .questionOrder(qt.getQuestionOrder())
                    .timeLimitSeconds(qt.getTimeLimitSeconds())
                    .points(qt.getPoints())
                    .build();

            duplicate.addQuestionTemplate(duplicateQuestion);

            qt.getAnswerTemplates().forEach(at -> {
                AnswerTemplate duplicateAnswer = AnswerTemplate.builder()
                        .content(at.getContent())
                        .isCorrect(at.getIsCorrect())
                        .answerOrder(at.getAnswerOrder())
                        .build();
                duplicateQuestion.addAnswerTemplate(duplicateAnswer);
            });
        });

        QuizTemplate savedDuplicate = templateRepository.save(duplicate);

        // Xóa list cache
        templateCacheService.evictTemplatesList();

        log.info("Template duplicated successfully with ID: {}", savedDuplicate.getId());

        return templateMapper.toDetailResponse(savedDuplicate);
    }

    private QuizTemplate findTemplateOrThrow(UUID templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz template not found with ID: " + templateId));
    }
}