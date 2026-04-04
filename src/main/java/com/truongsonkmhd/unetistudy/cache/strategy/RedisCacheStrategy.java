package com.truongsonkmhd.unetistudy.cache.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Implementation của CacheStrategy sử dụng Redis
 * Phù hợp cho distributed caching trong môi trường multi-instance
 * Hỗ trợ Time-based Expiration tự nhiên
 */
@Slf4j
public class RedisCacheStrategy<K, V> implements CacheStrategy<K, V> {

    private final String cacheName;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final Class<V> valueType;
    private final int defaultTtl;

    // Write-behind support
    private final boolean writeBehindEnabled;
    private final ScheduledExecutorService writeBehindExecutor;
    private final ConcurrentHashMap<K, V> writeBehindBuffer;
    private final Function<V, V> writeBehindWriter;

    // Stats tracking (Redis doesn't have built-in stats)
    private final ConcurrentAtomicStats stats = new ConcurrentAtomicStats();

    public RedisCacheStrategy(String cacheName, RedisTemplate<String, Object> redisTemplate,
            ObjectMapper objectMapper, Class<V> valueType) {
        this(cacheName, redisTemplate, objectMapper, valueType, CacheConstants.TTL_MEDIUM, null);
    }

    public RedisCacheStrategy(String cacheName, RedisTemplate<String, Object> redisTemplate,
            ObjectMapper objectMapper, Class<V> valueType, int defaultTtl,
            Function<V, V> writeBehindWriter) {
        this.cacheName = cacheName;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.valueType = valueType;
        this.defaultTtl = defaultTtl;
        this.writeBehindWriter = writeBehindWriter;
        this.writeBehindEnabled = writeBehindWriter != null;

        // Initialize write-behind components
        if (writeBehindEnabled) {
            this.writeBehindBuffer = new ConcurrentHashMap<>();
            this.writeBehindExecutor = Executors.newSingleThreadScheduledExecutor(
                    r -> new Thread(r, "redis-write-behind-" + cacheName));
            startWriteBehindFlush();
        } else {
            this.writeBehindBuffer = null;
            this.writeBehindExecutor = null;
        }
    }

    private String buildKey(K key) {
        return cacheName + ":" + key.toString();
    }

    @Override
    public Optional<V> get(K key) {
        try {
            String redisKey = buildKey(key);
            Object value = redisTemplate.opsForValue().get(redisKey);

            if (value != null) {
                stats.incrementHits();
                log.debug("[{}] Redis Cache HIT for key: {}", cacheName, key);
                return Optional.of(convertValue(value));
            }

            stats.incrementMisses();
            log.debug("[{}] Redis Cache MISS for key: {}", cacheName, key);
            return Optional.empty();

        } catch (Exception e) {
            log.error("[{}] Error getting from Redis: {}", cacheName, key, e);
            stats.incrementMisses();
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private V convertValue(Object value) {
        if (valueType.isInstance(value)) {
            return (V) value;
        }
        return objectMapper.convertValue(value, valueType);
    }

    @Override
    public void put(K key, V value) {
        put(key, value, defaultTtl);
    }

    @Override
    public void put(K key, V value, int ttlSeconds) {
        try {
            String redisKey = buildKey(key);
            redisTemplate.opsForValue().set(redisKey, value, ttlSeconds, TimeUnit.SECONDS);
            log.debug("[{}] Cached to Redis for key: {} with TTL: {}s", cacheName, key, ttlSeconds);
        } catch (Exception e) {
            log.error("[{}] Error putting to Redis: {}", cacheName, key, e);
        }
    }

    @Override
    public void evict(K key) {
        try {
            String redisKey = buildKey(key);
            redisTemplate.delete(redisKey);
            stats.incrementEvictions();
            log.debug("[{}] Evicted from Redis: {}", cacheName, key);
        } catch (Exception e) {
            log.error("[{}] Error evicting from Redis: {}", cacheName, key, e);
        }
    }

    @Override
    public void evictAll() {
        try {
            String pattern = cacheName + ":*";
            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("[{}] Evicted {} entries from Redis", cacheName, keys.size());
            }
        } catch (Exception e) {
            log.error("[{}] Error evicting all from Redis", cacheName, e);
        }
    }

    @Override
    public boolean exists(K key) {
        try {
            String redisKey = buildKey(key);
            Boolean exists = redisTemplate.hasKey(redisKey);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            log.error("[{}] Error checking existence in Redis: {}", cacheName, key, e);
            return false;
        }
    }

    @Override
    public V getOrLoad(K key, Supplier<V> loader) {
        return getOrLoad(key, loader, defaultTtl);
    }

    @Override
    public V getOrLoad(K key, Supplier<V> loader, int ttlSeconds) {
        Optional<V> cached = get(key);
        if (cached.isPresent()) {
            return cached.get();
        }

        log.debug("[{}] Cache-Aside MISS for key: {}, loading from source...", cacheName, key);
        V value = loader.get();

        if (value != null) {
            stats.incrementLoadSuccess();
            put(key, value, ttlSeconds);
        } else {
            stats.incrementLoadFailure();
        }

        return value;
    }

    @Override
    public V writeThrough(K key, V value, Function<V, V> dbWriter) {
        log.debug("[{}] Write-Through for key: {}", cacheName, key);

        V savedValue = dbWriter.apply(value);

        if (savedValue != null) {
            put(key, savedValue);
        } else {
            evict(key);
        }

        return savedValue;
    }

    @Override
    public void writeBehind(K key, V value) {
        if (!writeBehindEnabled) {
            throw new UnsupportedOperationException("Write-behind is not enabled for cache: " + cacheName);
        }

        log.debug("[{}] Write-Behind for key: {}", cacheName, key);
        put(key, value);
        writeBehindBuffer.put(key, value);
    }

    @Override
    public void refresh(K key, Supplier<V> loader) {
        log.debug("[{}] Refreshing key: {}", cacheName, key);
        evict(key);
        V newValue = loader.get();
        if (newValue != null) {
            put(key, newValue);
        }
    }

    @Override
    public CacheStats getStats() {
        return CacheStats.builder()
                .hitCount(stats.getHits())
                .missCount(stats.getMisses())
                .loadSuccessCount(stats.getLoadSuccess())
                .loadFailureCount(stats.getLoadFailure())
                .evictionCount(stats.getEvictions())
                .hitRate(stats.getHitRate())
                .missRate(stats.getMissRate())
                .build();
    }

    private void startWriteBehindFlush() {
        writeBehindExecutor.scheduleWithFixedDelay(() -> {
            try {
                flushWriteBehindBuffer();
            } catch (Exception e) {
                log.error("[{}] Error flushing write-behind buffer", cacheName, e);
            }
        }, 5, 5, TimeUnit.SECONDS);
    }

    private void flushWriteBehindBuffer() {
        if (writeBehindBuffer.isEmpty()) {
            return;
        }

        log.debug("[{}] Flushing {} entries from write-behind buffer", cacheName, writeBehindBuffer.size());

        ConcurrentHashMap<K, V> toFlush = new ConcurrentHashMap<>(writeBehindBuffer);
        writeBehindBuffer.clear();

        toFlush.forEach((key, value) -> {
            try {
                writeBehindWriter.apply(value);
            } catch (Exception e) {
                log.error("[{}] Write-behind: failed to persist key: {}", cacheName, key, e);
                writeBehindBuffer.put(key, value);
            }
        });
    }

    public void shutdown() {
        if (writeBehindExecutor != null) {
            writeBehindExecutor.shutdown();
            try {
                if (!writeBehindExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                    writeBehindExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                writeBehindExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * Thread-safe stats counter
     */
    private static class ConcurrentAtomicStats {
        private final java.util.concurrent.atomic.LongAdder hits = new java.util.concurrent.atomic.LongAdder();
        private final java.util.concurrent.atomic.LongAdder misses = new java.util.concurrent.atomic.LongAdder();
        private final java.util.concurrent.atomic.LongAdder loadSuccess = new java.util.concurrent.atomic.LongAdder();
        private final java.util.concurrent.atomic.LongAdder loadFailure = new java.util.concurrent.atomic.LongAdder();
        private final java.util.concurrent.atomic.LongAdder evictions = new java.util.concurrent.atomic.LongAdder();

        void incrementHits() {
            hits.increment();
        }

        void incrementMisses() {
            misses.increment();
        }

        void incrementLoadSuccess() {
            loadSuccess.increment();
        }

        void incrementLoadFailure() {
            loadFailure.increment();
        }

        void incrementEvictions() {
            evictions.increment();
        }

        long getHits() {
            return hits.sum();
        }

        long getMisses() {
            return misses.sum();
        }

        long getLoadSuccess() {
            return loadSuccess.sum();
        }

        long getLoadFailure() {
            return loadFailure.sum();
        }

        long getEvictions() {
            return evictions.sum();
        }

        double getHitRate() {
            long total = hits.sum() + misses.sum();
            return total > 0 ? (double) hits.sum() / total : 0.0;
        }

        double getMissRate() {
            long total = hits.sum() + misses.sum();
            return total > 0 ? (double) misses.sum() / total : 0.0;
        }
    }
}
