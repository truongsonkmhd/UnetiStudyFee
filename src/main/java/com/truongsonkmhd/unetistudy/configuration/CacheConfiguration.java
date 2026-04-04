package com.truongsonkmhd.unetistudy.configuration;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.concurrent.TimeUnit;

/**
 * Configuration cho Spring Cache với Caffeine
 * Sử dụng cho @Cacheable, @CacheEvict, @CachePut annotations
 * 
 * Hệ thống caching triển khai các patterns:
 * 1. Cache-Aside (Lazy Loading) - Tự động load từ DB khi cache miss
 * 2. Read-Through - Tương tự Cache-Aside nhưng tự động hóa hơn
 * 3. Write-Through - Ghi đồng thời vào cache và DB
 * 4. Write-Behind - Ghi vào cache ngay, batch ghi vào DB sau
 * 5. Time-based Expiration - TTL cho các cache entries
 * 6. LRU (Least Recently Used) - Eviction policy mặc định của Caffeine
 * 7. LFU (Least Frequently Used) - Có thể cấu hình cho window sizes
 * 8. Cache Invalidation - Xóa cache khi data thay đổi
 */
@Configuration
@EnableCaching
public class CacheConfiguration {

    /**
     * Primary AppCacheService cho Spring Cache annotations
     * Sử dụng Caffeine với LRU eviction và time-based expiration
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(defaultCaffeineBuilder());

        // Đăng ký các cache names với cấu hình tùy chỉnh
        cacheManager.setCacheNames(java.util.List.of(
                CacheConstants.USER_BY_ID,
                CacheConstants.USER_BY_USERNAME,
                CacheConstants.USER_DETAILS,
                CacheConstants.COURSE_BY_ID,
                CacheConstants.COURSE_BY_SLUG,
                CacheConstants.COURSE_PUBLISHED_TREE,
                CacheConstants.COURSE_CATALOG,
                CacheConstants.COURSE_MODULES,
                CacheConstants.ALL_USERS,
                CacheConstants.QUIZ_BY_ID,
                CacheConstants.QUIZ_LIST,
                CacheConstants.QUIZ_QUESTIONS,
                CacheConstants.QUIZ_ANSWERS,
                CacheConstants.QUIZ_TEMPLATE_BY_ID,
                CacheConstants.QUIZ_TEMPLATE_LIST,
                CacheConstants.LESSON_BY_ID,
                CacheConstants.LESSON_BY_MODULE,
                CacheConstants.CODING_EXERCISE_BY_ID,
                CacheConstants.CODING_EXERCISE_LIST,
                CacheConstants.ROLES,
                CacheConstants.USER_ROLES,
                CacheConstants.CLASSES,
                CacheConstants.CONTESTS,
                CacheConstants.USER_STATS,
                CacheConstants.COURSE_STATS,
                CacheConstants.QUIZ_STATS));

        return cacheManager;
    }

    /**
     * Default Caffeine configuration
     * - LRU eviction khi đạt maximum size
     * - Time-based expiration (15 phút)
     * - Record stats để monitoring
     */
    Caffeine<Object, Object> defaultCaffeineBuilder() {
        return Caffeine.newBuilder()
                // Time-based Expiration: Entries hết hạn sau 15 phút
                .expireAfterWrite(CacheConstants.TTL_MEDIUM, TimeUnit.SECONDS)

                // LRU Eviction: Khi đạt 1000 entries, loại bỏ entries ít dùng nhất
                .maximumSize(CacheConstants.SIZE_LARGE)

                // Enable stats recording để monitoring performance
                .recordStats()

                // Initial capacity để tránh resize
                .initialCapacity(100);
    }
    Caffeine<Object, Object> longLivedCaffeineBuilder() {
        return Caffeine.newBuilder()
                .expireAfterWrite(CacheConstants.TTL_LONG, TimeUnit.SECONDS)
                .maximumSize(CacheConstants.SIZE_MEDIUM)
                .recordStats()
                .initialCapacity(50);
    }

    /**
     * Caffeine builder cho Short-lived caches (5 phút)
     * Sử dụng cho dữ liệu thay đổi thường xuyên
     */
    Caffeine<Object, Object> shortLivedCaffeineBuilder() {
        return Caffeine.newBuilder()
                .expireAfterWrite(CacheConstants.TTL_SHORT, TimeUnit.SECONDS)
                .maximumSize(CacheConstants.SIZE_LARGE)
                .recordStats()
                .initialCapacity(100);
    }

    /**
     * Caffeine builder sử dụng LFU-like behavior
     * Bằng cách kết hợp frequency và recency
     */
    Caffeine<Object, Object> frequencyBasedCaffeineBuilder() {
        return Caffeine.newBuilder()
                .expireAfterWrite(CacheConstants.TTL_MEDIUM, TimeUnit.SECONDS)
                // TinyLFU admission policy cho frequency-based eviction
                .maximumSize(CacheConstants.SIZE_MEDIUM)
                // Window size cho admission policy (mặc định 1%)
                .recordStats()
                .initialCapacity(50);
    }
}
