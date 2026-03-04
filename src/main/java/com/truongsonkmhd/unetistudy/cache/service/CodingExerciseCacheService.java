package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.Supplier;

/**
 * Service quản lý cache cho Coding Exercises
 * Áp dụng Programmatic Caching pattern
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CodingExerciseCacheService {

    private final AppCacheService appCacheService;

    /**
     * Cache-Aside: Lấy template by ID
     */
    public CodingExerciseTemplate getTemplateById(UUID templateId, Supplier<CodingExerciseTemplate> loader) {
        CacheStrategy<UUID, CodingExerciseTemplate> cache = appCacheService
                .getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        return cache.getOrLoad(templateId, loader);
    }

    /**
     * Cache-Aside: Lấy danh sách templates (phân trang)
     */
    public PageResponse<CodingExerciseTemplateCardResponse> getTemplatesList(String key,
            Supplier<PageResponse<CodingExerciseTemplateCardResponse>> loader) {
        CacheStrategy<String, PageResponse<CodingExerciseTemplateCardResponse>> cache = appCacheService
                .getCache(CacheConstants.CODING_EXERCISE_LIST);
        return cache.getOrLoad(key, loader);
    }

    /**
     * Cache-Aside: Lấy danh sách templates (Cursor-based)
     */
    public CursorResponse<CodingExerciseTemplateCardResponse> getTemplatesCursorList(String key,
            Supplier<CursorResponse<CodingExerciseTemplateCardResponse>> loader) {
        CacheStrategy<String, CursorResponse<CodingExerciseTemplateCardResponse>> cache = appCacheService
                .getCache(CacheConstants.CODING_EXERCISE_LIST);
        return cache.getOrLoad(key, loader);
    }

    /**
     * Xóa cache liên quan đến danh sách
     */
    public void evictTemplatesList() {
        CacheStrategy<String, ?> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_LIST);
        cache.evictAll();
        log.info("Evicted all coding exercise list caches");
    }

    /**
     * Xóa cache của một template cụ thể
     */
    public void evictTemplateById(UUID templateId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        cache.evict(templateId);

        // Luôn xóa list cache khi một item thay đổi để đảm bảo tính nhất quán (dù hơi
        // overkill)
        evictTemplatesList();

        log.info("Evicted coding exercise template cache: {}", templateId);
    }
}
