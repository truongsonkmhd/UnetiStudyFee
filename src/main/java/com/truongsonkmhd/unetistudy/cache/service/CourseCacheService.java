package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseTreeResponse;
import com.truongsonkmhd.unetistudy.model.course.Course;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Service quản lý cache cho Course
 * Áp dụng Cache-Aside, Read-Through và Time-based Expiration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseCacheService {

    private final AppCacheService appCacheService;

    /**
     * Cache-Aside: Lấy course by ID
     */
    public Course getCourseById(UUID courseId, Supplier<Course> loader) {
        CacheStrategy<UUID, Course> cache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        return cache.getOrLoad(courseId, loader);
    }

    /**
     * Cache-Aside: Lấy course by slug
     */
    public Course getCourseBySlug(String slug, Supplier<Course> loader) {
        CacheStrategy<String, Course> cache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);
        return cache.getOrLoad(slug, loader);
    }

    /**
     * Cache-Aside với custom TTL: Lấy course tree (published)
     * Cache lâu hơn vì dữ liệu published ít thay đổi
     */
    public CourseTreeResponse getCoursePublishedTree(String slug, Supplier<CourseTreeResponse> loader) {
        CacheStrategy<String, CourseTreeResponse> cache = appCacheService
                .getCache(CacheConstants.COURSE_PUBLISHED_TREE);
        return cache.getOrLoad(slug, loader, CacheConstants.TTL_LONG); // 1 hour
    }

    /**
     * Lấy course từ cache (không load từ DB)
     */
    public Optional<Course> getCachedCourseById(UUID courseId) {
        CacheStrategy<UUID, Course> cache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        return cache.get(courseId);
    }

    /**
     * Write-Through: Cập nhật course và cache đồng thời
     */
    public Course updateCourseWithCache(UUID courseId, Course course,
            java.util.function.Function<Course, Course> dbWriter) {
        CacheStrategy<UUID, Course> cache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        Course savedCourse = cache.writeThrough(courseId, course, dbWriter);

        // Cũng cần update cache by slug và invalidate published tree
        if (savedCourse != null) {
            if (savedCourse.getSlug() != null) {
                CacheStrategy<String, Course> slugCache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);
                slugCache.put(savedCourse.getSlug(), savedCourse);
            }

            // Invalidate published tree vì có thể đã thay đổi
            invalidatePublishedTree(savedCourse.getSlug());
        }

        return savedCourse;
    }

    /**
     * Put course vào cache
     */
    public void cacheCourse(Course course) {
        if (course == null)
            return;

        CacheStrategy<UUID, Course> idCache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        idCache.put(course.getCourseId(), course);

        if (course.getSlug() != null) {
            CacheStrategy<String, Course> slugCache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);
            slugCache.put(course.getSlug(), course);
        }
    }

    /**
     * Put course tree vào cache
     */
    public void cacheCourseTree(String slug, CourseTreeResponse courseTree) {
        CacheStrategy<String, CourseTreeResponse> cache = appCacheService
                .getCache(CacheConstants.COURSE_PUBLISHED_TREE);
        cache.put(slug, courseTree);
    }

    /**
     * Evict course từ tất cả related caches (ID, Slug, Tree, Modules, Catalog)
     */
    public void evictCourseCompletely(UUID courseId, String slug) {
        log.info("Starting complete eviction for course: {} (slug: {})", courseId, slug);

        // 1. Evict by ID
        if (courseId != null) {
            CacheStrategy<UUID, Object> idCache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
            if (idCache != null) {
                idCache.evict(courseId);
            }
        }

        // 2. Evict by Slug & Published Tree
        if (slug != null) {
            CacheStrategy<String, Object> slugCache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);
            if (slugCache != null) {
                slugCache.evict(slug);
            }
            invalidatePublishedTree(slug);

            // 3. Evict Modules
            CacheStrategy<String, Object> moduleCache = appCacheService.getCache(CacheConstants.COURSE_MODULES);
            if (moduleCache != null) {
                moduleCache.evict(slug);
            }
        }

        // 4. Invalidate Catalog Listing
        invalidateAllCourseCatalog();

        log.info("Finished complete eviction for course: {}", courseId);
    }

    /**
     * Invalidate published tree cache
     */
    public void invalidatePublishedTree(String slug) {
        if (slug != null) {
            CacheStrategy<String, CourseTreeResponse> treeCache = appCacheService
                    .getCache(CacheConstants.COURSE_PUBLISHED_TREE);
            treeCache.evict(slug);
            log.debug("Invalidated published tree for slug: {}", slug);
        }
    }

    /**
     * Invalidate ALL published tree caches
     */
    public void invalidateAllPublishedTrees() {
        CacheStrategy<?, ?> treeCache = appCacheService.getCache(CacheConstants.COURSE_PUBLISHED_TREE);
        treeCache.evictAll();
        log.info("Invalidated all published tree caches");
    }

    /**
     * Evict tất cả course caches
     */
    public void evictAllCourses() {
        CacheStrategy<?, ?> idCache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        CacheStrategy<?, ?> slugCache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);
        CacheStrategy<?, ?> treeCache = appCacheService.getCache(CacheConstants.COURSE_PUBLISHED_TREE);

        idCache.evictAll();
        slugCache.evictAll();
        treeCache.evictAll();

        log.info("Evicted all courses from cache");
    }

    /**
     * Refresh course trong cache
     */
    public void refreshCourse(UUID courseId, Supplier<Course> loader) {
        CacheStrategy<UUID, Course> cache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        cache.refresh(courseId, loader);
    }

    /**
     * Warm up cache với danh sách courses
     */
    public void warmUpCache(Iterable<Course> courses) {
        CacheStrategy<UUID, Course> idCache = appCacheService.getCache(CacheConstants.COURSE_BY_ID);
        CacheStrategy<String, Course> slugCache = appCacheService.getCache(CacheConstants.COURSE_BY_SLUG);

        int count = 0;
        for (Course course : courses) {
            idCache.put(course.getCourseId(), course);
            if (course.getSlug() != null) {
                slugCache.put(course.getSlug(), course);
            }
            count++;
        }

        log.info("Warmed up course cache with {} courses", count);
    }

    // ========================
    // COURSE CATALOG (getAllCourses)
    // ========================

    /**
     * Cache-Aside cho getAllCourses (phân trang, filter).
     * Key được tạo từ tất cả tham số: "page:size:q:status:category"
     * TTL ngắn (TTL_SHORT = 5 phút) vì danh sách hay thay đổi.
     *
     * @param page     số trang (null → 0)
     * @param size     kích thước trang (null → 10)
     * @param q        từ khóa tìm kiếm
     * @param status   trạng thái khóa học
     * @param category danh mục
     * @param loader   Supplier để load từ DB khi cache miss
     * @return PageResponse chứa danh sách CourseCardResponse
     */
    public PageResponse<CourseCardResponse> getCourseCatalog(
            Integer page, Integer size, String q, String status, String category,
            Supplier<PageResponse<CourseCardResponse>> loader) {

        String cacheKey = buildCatalogKey(page, size, q, status, category);
        CacheStrategy<String, PageResponse<CourseCardResponse>> cache = appCacheService
                .getCache(CacheConstants.COURSE_CATALOG);

        if (cache == null) {
            log.warn("Cache '{}' not initialized, loading from DB directly", CacheConstants.COURSE_CATALOG);
            return loader.get();
        }

        return cache.getOrLoad(cacheKey, loader, CacheConstants.TTL_SHORT);
    }

    /**
     * Xóa toàn bộ course_all_list cache.
     * Gọi khi có course mới được tạo, cập nhật hoặc xóa.
     */
    public void invalidateAllCourseCatalog() {
        CacheStrategy<?, ?> cache = appCacheService.getCache(CacheConstants.COURSE_CATALOG);
        if (cache != null) {
            cache.evictAll();
            log.info("Invalidated all course catalog cache entries");
        }
    }

    /**
     * Xóa 1 entry cụ thể trong course_all_list cache (ít dùng).
     */
    public void invalidateCourseCatalog(Integer page, Integer size, String q, String status, String category) {
        String cacheKey = buildCatalogKey(page, size, q, status, category);
        CacheStrategy<String, ?> cache = appCacheService.getCache(CacheConstants.COURSE_CATALOG);
        if (cache != null) {
            cache.evict(cacheKey);
            log.debug("Invalidated course catalog cache key: {}", cacheKey);
        }
    }

    /**
     * Tạo cache key từ các tham số filter/pagination.
     * Null/blank được chuẩn hóa thành "_" để tránh key trùng.
     */
    private String buildCatalogKey(Integer page, Integer size, String q, String status, String category) {
        return String.join(":",
                page != null ? page.toString() : "0",
                size != null ? size.toString() : "10",
                (q != null && !q.isBlank()) ? q.toLowerCase().trim() : "_",
                (status != null && !status.isBlank()) ? status.toUpperCase() : "_",
                (category != null && !category.isBlank()) ? category.toLowerCase() : "_");
    }
}
