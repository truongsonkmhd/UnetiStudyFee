package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.cache.service.CodingExerciseCacheService;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateDTO;
import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;
import com.truongsonkmhd.unetistudy.model.coding_template.ExerciseTemplateTestCase;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseTemplateRepository;
import com.truongsonkmhd.unetistudy.service.CodingExerciseTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.utils.PageResponseBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Service quản lý Coding Exercise Templates với tích hợp Programmatic Caching
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CodingExerciseTemplateServiceImpl implements CodingExerciseTemplateService {

    private final CodingExerciseTemplateRepository repository;
    private final CodingExerciseCacheService exerciseCacheService;

    /**
     * Cache-Aside Programmatic: Lấy template by ID
     */
    @Override
    @Transactional(readOnly = true)
    public CodingExerciseTemplate getById(UUID templateId) {
        log.debug("Fetching coding exercise template by ID: {} (Programmatic Cache)", templateId);
        return exerciseCacheService.getTemplateById(templateId, () -> {
            log.debug("Cache MISS - Loading template from DB: {}", templateId);
            return repository.findById(templateId)
                    .orElseThrow(() -> new RuntimeException("CodingExerciseTemplate not found: " + templateId));
        });
    }

    @Override
    @Transactional
    public CodingExerciseTemplate save(CodingExerciseTemplateDTO dto) {
        log.info("Creating coding exercise template: {}", dto.getTitle());

        CodingExerciseTemplate template = new CodingExerciseTemplate();
        mapDtoToEntity(dto, template);

        CodingExerciseTemplate saved = repository.save(template);

        // Xóa cache sau khi lưu thành công
        exerciseCacheService.evictTemplatesList();

        return saved;
    }

    @Override
    @Transactional
    public CodingExerciseTemplate update(UUID id, CodingExerciseTemplateDTO dto) {
        log.info("Updating coding exercise template: {}", id);

        CodingExerciseTemplate template = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodingExerciseTemplate not found: " + id));

        // Clear existing test cases to replace with new ones
        template.getExerciseTestCases().clear();
        mapDtoToEntity(dto, template);

        CodingExerciseTemplate saved = repository.save(template);

        // Xóa cache sau khi cập nhật thành công
        exerciseCacheService.evictTemplatesList();
        exerciseCacheService.evictTemplateById(id);

        return saved;
    }

    private void mapDtoToEntity(CodingExerciseTemplateDTO dto, CodingExerciseTemplate template) {
        template.setCategory(dto.getCategory());
        template.setTags(dto.getTags());
        template.setTitle(dto.getTitle());
        template.setDescription(dto.getDescription());
        template.setProgrammingLanguage(dto.getProgrammingLanguage());
        template.setDifficulty(dto.getDifficulty());
        template.setPoints(dto.getPoints() != null ? dto.getPoints() : 0);
        template.setIsPublished(Boolean.TRUE.equals(dto.getIsPublished()));
        template.setTimeLimitMs(dto.getTimeLimitMs() != null ? dto.getTimeLimitMs() : 1000);
        template.setMemoryLimitMb(dto.getMemoryLimitMb() != null ? dto.getMemoryLimitMb() : 256);
        template.setInitialCode(dto.getInitialCode());
        template.setSolutionCode(dto.getSolutionCode());
        template.setSlug(dto.getSlug());
        template.setInputFormat(dto.getInputFormat());
        template.setOutputFormat(dto.getOutputFormat());
        template.setConstraintName(dto.getConstraintName());

        int orderIndex = 1;
        if (dto.getExerciseTestCases() != null) {
            for (ExerciseTestCasesDTO tcDto : dto.getExerciseTestCases()) {
                ExerciseTemplateTestCase testCase = ExerciseTemplateTestCase.builder()
                        .template(template)
                        .input(tcDto.getInput())
                        .expectedOutput(tcDto.getExpectedOutput())
                        .isSample(Boolean.TRUE.equals(tcDto.getIsSample()))
                        .explanation(tcDto.getExplanation())
                        .orderIndex(tcDto.getOrderIndex() != null ? tcDto.getOrderIndex() : orderIndex++)
                        .build();

                template.addTestCase(testCase);
            }
        }
    }

    /**
     * Cache-Aside Programmatic: Lấy danh sách templates đã publish
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<CodingExerciseTemplateCardResponse> getPublishedTemplates(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        String cacheKey = "published:" + safePage + ":" + safeSize;
        log.debug("Fetching published templates: {} (Programmatic Cache)", cacheKey);

        return exerciseCacheService.getTemplatesList(cacheKey, () -> {
            log.debug("Cache MISS - Loading published templates from DB");
            Pageable pageable = PageRequest.of(safePage, safeSize);
            Page<CodingExerciseTemplateCardResponse> result = repository.findPublishedTemplates(pageable);

            return PageResponseBuilder.build(result);
        });
    }

    /**
     * Cache-Aside Programmatic: Tìm kiếm templates
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<CodingExerciseTemplateCardResponse> searchTemplates(
            int page, int size, String q, Difficulty difficulty, String category, String language) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        String cacheKey = String.format("search:%d:%d:%s:%s:%s:%s",
                safePage, safeSize, (q != null ? q : ""),
                (difficulty != null ? difficulty : ""),
                (category != null ? category : ""),
                (language != null ? language : ""));

        log.debug("Searching templates: {} (Programmatic Cache)", cacheKey);

        return exerciseCacheService.getTemplatesList(cacheKey, () -> {
            log.debug("Cache MISS - Searching templates from DB");
            Pageable pageable = PageRequest.of(safePage, safeSize);
            Page<CodingExerciseTemplateCardResponse> result = repository.searchTemplates(q, difficulty, category,
                    language, pageable);

            return PageResponseBuilder.build(result);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CodingExerciseTemplateCardResponse> searchAllTemplates(
            int page, int size, String q, Difficulty difficulty,
            String category, String language, Boolean published) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        String cacheKey = String.format("all:%d:%d:%s:%s:%s:%s:%s",
                safePage, safeSize, (q != null ? q : ""),
                (difficulty != null ? difficulty : ""),
                (category != null ? category : ""),
                (language != null ? language : ""),
                (published != null ? published : ""));

        log.debug("Searching all templates: {} (Programmatic Cache)", cacheKey);

        return exerciseCacheService.getTemplatesList(cacheKey, () -> {
            log.debug("Cache MISS - Searching all templates from DB");
            Pageable pageable = PageRequest.of(safePage, safeSize);
            Page<CodingExerciseTemplateCardResponse> result = repository.searchAllTemplates(
                    q, difficulty, category, language, published, pageable);

            return PageResponseBuilder.build(result);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CursorResponse<CodingExerciseTemplateCardResponse> getPublishedTemplatesCursor(
            String cursor, int size) {

        int safeSize = Math.min(Math.max(size, 1), 30);
        String cacheKey = "published:cursor:" + (cursor != null ? cursor : "init") + ":" + safeSize;

        log.debug("Fetching published templates (cursor): {} (Programmatic Cache)", cacheKey);

        return exerciseCacheService.getTemplatesCursorList(cacheKey, () -> {
            log.debug("Cache MISS - Loading published templates (cursor) from DB");
            Instant createdAt = null;
            UUID lastId = null;

            if (cursor != null && !cursor.isBlank()) {
                try {
                    String decoded = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
                    String[] parts = decoded.split("\\|");
                    if (parts.length == 2) {
                        long epoch = Long.parseLong(parts[0]);
                        createdAt = Instant.ofEpochMilli(epoch);
                        lastId = UUID.fromString(parts[1]);
                    }
                } catch (Exception e) {
                    // Invalid cursor
                }
            }

            Pageable pageable = PageRequest.of(0, safeSize + 1);
            Page<CodingExerciseTemplateCardResponse> result;

            if (createdAt == null || lastId == null) {
                result = repository.findPublishedTemplates(pageable);
            } else {
                result = repository.findPublishedTemplatesAfterCursor(createdAt, lastId, pageable);
            }

            return buildCursorResponse(result.getContent(), safeSize);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CursorResponse<CodingExerciseTemplateCardResponse> searchTemplatesCursor(
            String cursor, int size, String q, Difficulty difficulty,
            String category, String language) {

        int safeSize = Math.min(Math.max(size, 1), 30);
        String cacheKey = String.format("search:cursor:%s:%d:%s:%s:%s:%s",
                (cursor != null ? cursor : "init"), safeSize,
                (q != null ? q : ""),
                (difficulty != null ? difficulty : ""),
                (category != null ? category : ""),
                (language != null ? language : ""));

        log.debug("Searching templates (cursor): {} (Programmatic Cache)", cacheKey);

        return exerciseCacheService.getTemplatesCursorList(cacheKey, () -> {
            log.debug("Cache MISS - Searching templates (cursor) from DB");
            Instant createdAt = null;
            UUID lastId = null;

            if (cursor != null && !cursor.isBlank()) {
                try {
                    String decoded = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
                    String[] parts = decoded.split("\\|");
                    if (parts.length == 2) {
                        long epoch = Long.parseLong(parts[0]);
                        createdAt = Instant.ofEpochMilli(epoch);
                        lastId = UUID.fromString(parts[1]);
                    }
                } catch (Exception e) {
                    // Invalid cursor
                }
            }

            Pageable pageable = PageRequest.of(0, safeSize + 1);
            Page<CodingExerciseTemplateCardResponse> result;

            if (createdAt == null || lastId == null) {
                result = repository.searchTemplates(q, difficulty, category, language, pageable);
            } else {
                result = repository.searchTemplatesAfterCursor(
                        q, difficulty, category, language, createdAt, lastId, pageable);
            }

            return buildCursorResponse(result.getContent(), safeSize);
        });
    }

    private CursorResponse<CodingExerciseTemplateCardResponse> buildCursorResponse(
            List<CodingExerciseTemplateCardResponse> items, int requestedSize) {

        boolean hasNext = items.size() > requestedSize;
        if (hasNext) {
            items = items.subList(0, requestedSize);
        }

        String nextCursor = null;
        if (hasNext && !items.isEmpty()) {
            CodingExerciseTemplateCardResponse last = items.get(items.size() - 1);
            long epoch = last.getCreatedAt().toEpochMilli();
            String raw = epoch + "|" + last.getTemplateId();
            nextCursor = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        }

        return CursorResponse.<CodingExerciseTemplateCardResponse>builder()
                .items(items)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }
}