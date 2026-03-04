package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Service quản lý cache cho Lesson và Coding Exercise
 * Áp dụng Cache-Aside và Time-based Expiration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LessonCacheService {

    private final AppCacheService appCacheService;

    // ========================
    // LESSON CACHING
    // ========================

    /**
     * Cache-Aside: Lấy lesson by ID
     */
    public CourseLesson getLessonById(UUID lessonId, Supplier<CourseLesson> loader) {
        CacheStrategy<UUID, CourseLesson> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        return cache.getOrLoad(lessonId, loader);
    }

    /**
     * Cache-Aside: Lấy lessons by module ID
     */
    @SuppressWarnings("unchecked")
    public List<CourseLesson> getLessonsByModule(UUID moduleId, Supplier<List<CourseLesson>> loader) {
        CacheStrategy<UUID, List<CourseLesson>> cache = appCacheService.getCache(CacheConstants.LESSON_BY_MODULE);
        return cache.getOrLoad(moduleId, loader);
    }

    /**
     * Lấy lesson từ cache (không load từ DB)
     */
    public Optional<CourseLesson> getCachedLessonById(UUID lessonId) {
        CacheStrategy<UUID, CourseLesson> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        return cache.get(lessonId);
    }

    /**
     * Write-Through: Cập nhật lesson và cache đồng thời
     */
    public CourseLesson updateLessonWithCache(UUID lessonId, CourseLesson lesson,
            java.util.function.Function<CourseLesson, CourseLesson> dbWriter) {
        CacheStrategy<UUID, CourseLesson> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        CourseLesson savedLesson = cache.writeThrough(lessonId, lesson, dbWriter);

        // Invalidate lesson list cache cho module
        if (savedLesson != null && savedLesson.getModule() != null) {
            invalidateLessonsByModule(savedLesson.getModule().getModuleId());
        }

        return savedLesson;
    }

    /**
     * Cache lesson
     */
    public void cacheLesson(CourseLesson lesson) {
        if (lesson == null)
            return;

        CacheStrategy<UUID, CourseLesson> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        cache.put(lesson.getLessonId(), lesson);
    }

    /**
     * Evict lesson từ cache
     */
    public void evictLesson(UUID lessonId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        cache.evict(lessonId);
        log.info("Evicted lesson from cache: {}", lessonId);
    }

    /**
     * Invalidate lessons by module cache
     */
    public void invalidateLessonsByModule(UUID moduleId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.LESSON_BY_MODULE);
        cache.evict(moduleId);
        log.debug("Invalidated lessons for module: {}", moduleId);
    }

    // ========================
    // CODING EXERCISE CACHING
    // ========================

    /**
     * Cache-Aside: Lấy coding exercise by ID
     */
    public CodingExercise getCodingExerciseById(UUID exerciseId, Supplier<CodingExercise> loader) {
        CacheStrategy<UUID, CodingExercise> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        return cache.getOrLoad(exerciseId, loader);
    }

    /**
     * Cache-Aside: Lấy coding exercises by lesson ID
     */
    @SuppressWarnings("unchecked")
    public List<CodingExercise> getCodingExercisesByLesson(UUID lessonId, Supplier<List<CodingExercise>> loader) {
        CacheStrategy<UUID, List<CodingExercise>> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_LIST);
        return cache.getOrLoad(lessonId, loader);
    }

    /**
     * Lấy coding exercise từ cache
     */
    public Optional<CodingExercise> getCachedCodingExerciseById(UUID exerciseId) {
        CacheStrategy<UUID, CodingExercise> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        return cache.get(exerciseId);
    }

    /**
     * Write-Through: Cập nhật coding exercise và cache
     */
    public CodingExercise updateCodingExerciseWithCache(UUID exerciseId, CodingExercise exercise,
            java.util.function.Function<CodingExercise, CodingExercise> dbWriter) {
        CacheStrategy<UUID, CodingExercise> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        CodingExercise savedExercise = cache.writeThrough(exerciseId, exercise, dbWriter);

        // Invalidate exercise list cache
        if (savedExercise != null && savedExercise.getContestLessons() != null) {
            savedExercise.getContestLessons().forEach(cl -> invalidateCodingExercisesByLesson(cl.getContestLessonId()));
        }

        return savedExercise;
    }

    /**
     * Cache coding exercise
     */
    public void cacheCodingExercise(CodingExercise exercise) {
        if (exercise == null)
            return;

        CacheStrategy<UUID, CodingExercise> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        cache.put(exercise.getExerciseId(), exercise);
    }

    /**
     * Evict coding exercise từ cache
     */
    public void evictCodingExercise(UUID exerciseId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        cache.evict(exerciseId);
        log.info("Evicted coding exercise from cache: {}", exerciseId);
    }

    /**
     * Invalidate coding exercises by lesson cache
     */
    public void invalidateCodingExercisesByLesson(UUID lessonId) {
        CacheStrategy<UUID, ?> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_LIST);
        cache.evict(lessonId);
        log.debug("Invalidated coding exercises for lesson: {}", lessonId);
    }

    // ========================
    // BATCH OPERATIONS
    // ========================

    /**
     * Evict tất cả lesson caches
     */
    public void evictAllLessons() {
        CacheStrategy<?, ?> lessonCache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);
        CacheStrategy<?, ?> moduleCache = appCacheService.getCache(CacheConstants.LESSON_BY_MODULE);
        CacheStrategy<?, ?> exerciseCache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);
        CacheStrategy<?, ?> exerciseListCache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_LIST);

        lessonCache.evictAll();
        moduleCache.evictAll();
        exerciseCache.evictAll();
        exerciseListCache.evictAll();

        log.info("Evicted all lessons and exercises from cache");
    }

    /**
     * Warm up lesson cache
     */
    public void warmUpLessonCache(Iterable<CourseLesson> lessons) {
        CacheStrategy<UUID, CourseLesson> cache = appCacheService.getCache(CacheConstants.LESSON_BY_ID);

        int count = 0;
        for (CourseLesson lesson : lessons) {
            cache.put(lesson.getLessonId(), lesson);
            count++;
        }

        log.info("Warmed up lesson cache with {} lessons", count);
    }

    /**
     * Warm up coding exercise cache
     */
    public void warmUpExerciseCache(Iterable<CodingExercise> exercises) {
        CacheStrategy<UUID, CodingExercise> cache = appCacheService.getCache(CacheConstants.CODING_EXERCISE_BY_ID);

        int count = 0;
        for (CodingExercise exercise : exercises) {
            cache.put(exercise.getExerciseId(), exercise);
            count++;
        }

        log.info("Warmed up coding exercise cache with {} exercises", count);
    }
}
