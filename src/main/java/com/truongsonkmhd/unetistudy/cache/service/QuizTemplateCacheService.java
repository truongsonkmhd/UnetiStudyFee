package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Service quản lý cache cho Quiz Template
 * Áp dụng Programmatic Caching pattern
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizTemplateCacheService {

    private final AppCacheService appCacheService;

    /**
     * Cache-Aside: Lấy template detail by ID
     */
    public QuizTemplateDTO.DetailResponse getTemplateById(UUID templateId,
            Supplier<QuizTemplateDTO.DetailResponse> loader) {
        CacheStrategy<UUID, QuizTemplateDTO.DetailResponse> cache = appCacheService
                .getCache(CacheConstants.QUIZ_TEMPLATE_BY_ID);
        return cache.getOrLoad(templateId, loader);
    }

    /**
     * Cache-Aside: Lấy danh sách templates (phân trang/search)
     */
    public PageResponse<QuizTemplateDTO.Response> getTemplatesSearch(String key,
            Supplier<PageResponse<QuizTemplateDTO.Response>> loader) {
        CacheStrategy<String, PageResponse<QuizTemplateDTO.Response>> cache = appCacheService
                .getCache(CacheConstants.QUIZ_TEMPLATE_LIST);
        return cache.getOrLoad(key, loader);
    }

    /**
     * Cache-Aside: Lấy most used templates
     */
    public List<QuizTemplateDTO.Response> getMostUsedTemplates(Supplier<List<QuizTemplateDTO.Response>> loader) {
        CacheStrategy<String, List<QuizTemplateDTO.Response>> cache = appCacheService
                .getCache(CacheConstants.QUIZ_TEMPLATE_LIST);
        return cache.getOrLoad("most_used", loader);
    }

    /**
     * Cache-Aside: Lấy tất cả categories
     */
    public List<String> getAllCategories(Supplier<List<String>> loader) {
        CacheStrategy<String, List<String>> cache = appCacheService
                .getCache(CacheConstants.QUIZ_TEMPLATE_LIST);
        return cache.getOrLoad("categories", loader);
    }

    /**
     * Xóa cache của một template cụ thể
     */
    public void evictTemplate(UUID templateId) {
        evictTemplateById(templateId);
    }

    public void evictTemplateById(UUID templateId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.QUIZ_TEMPLATE_BY_ID);
        cache.evict(templateId);

        // Luôn xóa list cache khi một item thay đổi để đảm bảo tính nhất quán
        evictTemplatesList();

        log.info("Evicted quiz template cache: {}", templateId);
    }

    /**
     * Xóa cache liên quan đến danh sách
     */
    public void evictTemplatesList() {
        CacheStrategy<String, ?> cache = appCacheService.getCache(CacheConstants.QUIZ_TEMPLATE_LIST);
        cache.evictAll();
        log.info("Evicted all quiz template list caches");
    }
}
