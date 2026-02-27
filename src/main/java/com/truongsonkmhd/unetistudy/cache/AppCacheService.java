package com.truongsonkmhd.unetistudy.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStats;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.cache.strategy.CaffeineCacheStrategy;
import com.truongsonkmhd.unetistudy.cache.strategy.RedisCacheStrategy;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Factory để tạo và quản lý các cache instances
 * Hỗ trợ cả Caffeine (local) và Redis (distributed)
 */
@Slf4j
@Component
public class AppCacheService {

    private final CacheConfig cacheConfig;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // Registry để quản lý tất cả cache instances
    private final ConcurrentHashMap<String, CacheStrategy<?, ?>> cacheRegistry = new ConcurrentHashMap<>();

    public AppCacheService(CacheConfig cacheConfig,
            RedisTemplate<String, Object> redisTemplate,
            ObjectMapper objectMapper) {
        this.cacheConfig = cacheConfig;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;

        // Pre-create common caches
        initializeDefaultCaches();
    }

    /**
     * Khởi tạo các cache mặc định
     */
    private void initializeDefaultCaches() {
        log.info("Initializing default caches with provider: {}", cacheConfig.getType());

        // User caches
        createCaffeineCache(CacheConstants.USER_BY_ID, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.USER_BY_USERNAME, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.USER_DETAILS, CacheConstants.SIZE_LARGE, CacheConstants.TTL_SHORT);

        // Course caches
        createCaffeineCache(CacheConstants.COURSE_BY_ID, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.COURSE_BY_SLUG, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.COURSE_PUBLISHED_TREE, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_LONG);
        createCaffeineCache(CacheConstants.COURSE_MODULES, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);
        // Cache danh sách khóa học (Catalog & Admin List)
        createCaffeineCache(CacheConstants.COURSE_CATALOG, CacheConstants.SIZE_LARGE, CacheConstants.TTL_SHORT);

        // Quiz caches
        createCaffeineCache(CacheConstants.QUIZ_BY_ID, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.QUIZ_LIST, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.QUIZ_QUESTIONS, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);

        // Template caches
        createCaffeineCache(CacheConstants.QUIZ_TEMPLATE_BY_ID, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.QUIZ_TEMPLATE_LIST, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_MEDIUM);

        // Lesson caches
        createCaffeineCache(CacheConstants.LESSON_BY_ID, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.LESSON_BY_MODULE, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);

        // Coding exercise caches
        createCaffeineCache(CacheConstants.CODING_EXERCISE_BY_ID, CacheConstants.SIZE_MEDIUM,
                CacheConstants.TTL_MEDIUM);
        createCaffeineCache(CacheConstants.CODING_EXERCISE_LIST, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM);

        // Role & Permission caches (longer TTL - rarely change)
        createCaffeineCache(CacheConstants.ROLES, CacheConstants.SIZE_SMALL, CacheConstants.TTL_VERY_LONG);
        createCaffeineCache(CacheConstants.PERMISSIONS, CacheConstants.SIZE_SMALL, CacheConstants.TTL_VERY_LONG);
        createCaffeineCache(CacheConstants.USER_ROLES, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_LONG);

        // Statistics caches
        createCaffeineCache(CacheConstants.USER_STATS, CacheConstants.SIZE_LARGE, CacheConstants.TTL_SHORT);
        createCaffeineCache(CacheConstants.COURSE_STATS, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_SHORT);
        createCaffeineCache(CacheConstants.QUIZ_STATS, CacheConstants.SIZE_MEDIUM, CacheConstants.TTL_SHORT);

        log.info("Initialized {} default caches", cacheRegistry.size());
    }

    /**
     * Tạo Caffeine cache
     */
    public <K, V> CacheStrategy<K, V> createCaffeineCache(String cacheName, int maxSize, int ttlSeconds) {
        return createCaffeineCache(cacheName, maxSize, ttlSeconds, null);
    }

    /**
     * Tạo Caffeine cache với write-behind support
     */
    @SuppressWarnings("unchecked")
    public <K, V> CacheStrategy<K, V> createCaffeineCache(String cacheName, int maxSize, int ttlSeconds,
            Function<V, V> writeBehindWriter) {
        CaffeineCacheStrategy<K, V> cache = new CaffeineCacheStrategy<>(
                cacheName, maxSize, ttlSeconds, cacheConfig.isRecordStats(), writeBehindWriter);
        cacheRegistry.put(cacheName, cache);
        log.debug("Created Caffeine cache: {} (maxSize={}, ttl={}s)", cacheName, maxSize, ttlSeconds);
        return cache;
    }

    /**
     * Tạo Redis cache
     */
    public <K, V> CacheStrategy<K, V> createRedisCache(String cacheName, Class<V> valueType, int ttlSeconds) {
        return createRedisCache(cacheName, valueType, ttlSeconds, null);
    }

    /**
     * Tạo Redis cache với write-behind support
     */
    @SuppressWarnings("unchecked")
    public <K, V> CacheStrategy<K, V> createRedisCache(String cacheName, Class<V> valueType, int ttlSeconds,
            Function<V, V> writeBehindWriter) {
        RedisCacheStrategy<K, V> cache = new RedisCacheStrategy<>(
                cacheName, redisTemplate, objectMapper, valueType, ttlSeconds, writeBehindWriter);
        cacheRegistry.put(cacheName, cache);
        log.debug("Created Redis cache: {} (ttl={}s)", cacheName, ttlSeconds);
        return cache;
    }

    /**
     * Lấy cache instance by name
     */
    @SuppressWarnings("unchecked")
    public <K, V> CacheStrategy<K, V> getCache(String cacheName) {
        return (CacheStrategy<K, V>) cacheRegistry.get(cacheName);
    }

    /**
     * Lấy hoặc tạo cache
     */
    @SuppressWarnings("unchecked")
    public <K, V> CacheStrategy<K, V> getOrCreateCache(String cacheName, int maxSize, int ttlSeconds) {
        return (CacheStrategy<K, V>) cacheRegistry.computeIfAbsent(cacheName,
                name -> new CaffeineCacheStrategy<>(name, maxSize, ttlSeconds, cacheConfig.isRecordStats(), null));
    }

    /**
     * Xóa cache theo name pattern
     */
    public void evictCachesByPattern(String pattern) {
        cacheRegistry.forEach((name, cache) -> {
            if (name.matches(pattern)) {
                cache.evictAll();
                log.info("Evicted cache: {}", name);
            }
        });
    }

    /**
     * Xóa tất cả caches
     */
    public void evictAll() {
        cacheRegistry.values().forEach(CacheStrategy::evictAll);
        log.info("Evicted all caches");
    }

    /**
     * Lấy statistics của tất cả caches
     */
    public Map<String, CacheStats> getAllStats() {
        Map<String, CacheStats> stats = new HashMap<>();
        cacheRegistry.forEach((name, cache) -> {
            stats.put(name, cache.getStats());
        });
        return stats;
    }

    /**
     * Lấy số lượng caches
     */
    public int getCacheCount() {
        return cacheRegistry.size();
    }

    /**
     * Kiểm tra cache có tồn tại không
     */
    public boolean hasCache(String cacheName) {
        return cacheRegistry.containsKey(cacheName);
    }

    /**
     * Xóa cache khỏi registry
     */
    public void removeCache(String cacheName) {
        CacheStrategy<?, ?> cache = cacheRegistry.remove(cacheName);
        if (cache != null) {
            cache.evictAll();
            if (cache instanceof CaffeineCacheStrategy) {
                ((CaffeineCacheStrategy<?, ?>) cache).shutdown();
            } else if (cache instanceof RedisCacheStrategy) {
                ((RedisCacheStrategy<?, ?>) cache).shutdown();
            }
            log.info("Removed cache: {}", cacheName);
        }
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down all caches...");
        cacheRegistry.forEach((name, cache) -> {
            try {
                if (cache instanceof CaffeineCacheStrategy) {
                    ((CaffeineCacheStrategy<?, ?>) cache).shutdown();
                } else if (cache instanceof RedisCacheStrategy) {
                    ((RedisCacheStrategy<?, ?>) cache).shutdown();
                }
            } catch (Exception e) {
                log.error("Error shutting down cache: {}", name, e);
            }
        });
        log.info("All caches shut down");
    }
}
