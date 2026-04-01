package com.truongsonkmhd.unetistudy.service.impl.course;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.service.CourseCatalogService;
import com.truongsonkmhd.unetistudy.cache.service.CourseCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Service quản lý Catalog khóa học với tích hợp Caching
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside - Cache danh sách courses đã publish
 * 2. Time-based Expiration - TTL 15 phút cho catalog
 * 3. LRU Eviction - Tự động loại bỏ các pages ít truy cập
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseCatalogServiceImpl implements CourseCatalogService {

    private final CourseRepository courseRepository;
    private final CourseCacheService courseCacheService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseCardResponse> getPublishedCourses(int page, int size, String q, String category) {
        log.debug("getPublishedCourses - page={}, size={}, q={}, category={}", page, size, q, category);
        // Sử dụng programmatic cache để thống nhất với CourseTreeService
        // Status mặc định là "PUBLISHED" cho catalog công khai
        return courseCacheService.getCourseCatalog(page, size, q, "PUBLISHED", category,
                () -> queryPublishedCourses(page, size, q, category));
    }

    /**
     * Logic truy vấn thực tế (chỉ gọi khi cache miss)
     */
    @Transactional(readOnly = true)
    public PageResponse<CourseCardResponse> queryPublishedCourses(int page, int size, String q, String category) {
        log.debug("Cache MISS - Loading published courses from DB: page={}, size={}, q={}, category={}", page, size, q, category);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<CourseCardResponse> result = courseRepository.findPublishedCourseCardsWithFilters(
                (q != null && !q.isBlank()) ? q.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                pageable);

        return PageResponse.<CourseCardResponse>builder()
                .items(result.getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

}