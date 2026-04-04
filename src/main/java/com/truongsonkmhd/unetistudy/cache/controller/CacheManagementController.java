package com.truongsonkmhd.unetistudy.cache.controller;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.service.*;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStats;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để quản lý và monitor caches
 * Chỉ dành cho ADMIN
 */
@RestController
@RequestMapping("/api/admin/managerment-cache")
@RequiredArgsConstructor
@Tag(name = "Cache Management", description = "APIs để quản lý và monitor cache")
public class CacheManagementController {

    private final AppCacheService appCacheService;
    private final UserCacheService userCacheService;
    private final CourseCacheService courseCacheService;
    private final LessonCacheService lessonCacheService;
    private final ScoreWriteBehindService scoreWriteBehindService;

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê tất cả caches")
    public ResponseEntity<IResponseMessage> getAllCacheStats() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(appCacheService.getAllStats()));
    }

    @GetMapping("/stats/{cacheName}")
    @Operation(summary = "Lấy thống kê của một cache cụ thể")
    public ResponseEntity<IResponseMessage> getCacheStats(@PathVariable String cacheName) {
        var cache = appCacheService.getCache(cacheName);
        if (cache == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(cache.getStats()));
    }

    @GetMapping("/info")
    @Operation(summary = "Lấy thông tin tổng quan về caches")
    public ResponseEntity<IResponseMessage> getCacheInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("totalCaches", appCacheService.getCacheCount());
        info.put("writeBehindBufferSize", scoreWriteBehindService.getBufferSize());
        info.put("hasPendingWrites", scoreWriteBehindService.hasPendingScores());
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(info));
    }

    @DeleteMapping("/evict/{cacheName}")
    @Operation(summary = "Xóa tất cả entries trong một cache")
    public ResponseEntity<IResponseMessage> evictCache(@PathVariable String cacheName) {
        var cache = appCacheService.getCache(cacheName);
        if (cache == null) {
            return ResponseEntity.notFound().build();
        }
        cache.evictAll();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "Cache " + cacheName + " evicted successfully")));
    }

    @DeleteMapping("/evict-all")
    @Operation(summary = "Xóa tất cả caches")
    public ResponseEntity<IResponseMessage> evictAllCaches() {
        appCacheService.evictAll();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "All caches evicted successfully")));
    }

    @DeleteMapping("/evict/users")
    @Operation(summary = "Xóa tất cả user caches")
    public ResponseEntity<IResponseMessage> evictUserCaches() {
        userCacheService.evictAllUsers();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "User caches evicted successfully")));
    }

    @DeleteMapping("/evict/courses")
    @Operation(summary = "Xóa tất cả course caches")
    public ResponseEntity<IResponseMessage> evictCourseCaches() {
        courseCacheService.evictAllCourses();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "Course caches evicted successfully")));
    }


    @DeleteMapping("/evict/lessons")
    @Operation(summary = "Xóa tất cả lesson caches")
    public ResponseEntity<IResponseMessage> evictLessonCaches() {
        lessonCacheService.evictAllLessons();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "Lesson caches evicted successfully")));
    }

    @PostMapping("/flush-writes")
    @Operation(summary = "Force flush write-behind buffer")
    public ResponseEntity<IResponseMessage> flushWriteBehind() {
        int beforeSize = scoreWriteBehindService.getBufferSize();
        scoreWriteBehindService.forceFlush();
        int afterSize = scoreWriteBehindService.getBufferSize();

        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(Map.of(
                "message", "Write-behind buffer flushed",
                "beforeSize", beforeSize,
                "afterSize", afterSize)));
    }

    @DeleteMapping("/evict/published-trees")
    @Operation(summary = "Invalidate tất cả published course tree caches")
    public ResponseEntity<IResponseMessage> invalidatePublishedTrees() {
        courseCacheService.invalidateAllPublishedTrees();
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(Map.of("message", "Published tree caches invalidated successfully")));
    }
}
