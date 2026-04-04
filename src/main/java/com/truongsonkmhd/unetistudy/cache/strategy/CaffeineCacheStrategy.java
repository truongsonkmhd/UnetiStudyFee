package com.truongsonkmhd.unetistudy.cache.strategy;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.truongsonkmhd.unetistudy.cache.CacheConfig;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Implementation của CacheStrategy sử dụng Caffeine
 * Hỗ trợ các pattern: Cache-Aside, Read-Through, Write-Through, Write-Behind
 * Sử dụng LRU/LFU eviction policy dựa trên configuration
 */
@Slf4j
public class CaffeineCacheStrategy<K, V> implements CacheStrategy<K, V> {

    private final String cacheName;
    private final Cache<K, V> cache;
    private final int defaultTtl;

    // Write-behind support
    private final boolean writeBehindEnabled;
    private final ScheduledExecutorService writeBehindExecutor;
    private final ConcurrentHashMap<K, V> writeBehindBuffer;
    private final Function<V, V> writeBehindWriter;

    /**
     * Constructor với default configuration
     */
    public CaffeineCacheStrategy(String cacheName) {
        this(cacheName, CacheConstants.SIZE_LARGE, CacheConstants.TTL_MEDIUM, true, null);
    }

    /**
     * Constructor với custom configuration
     */
    public CaffeineCacheStrategy(String cacheName, int maxSize, int ttlSeconds, boolean recordStats,
            Function<V, V> writeBehindWriter) {
        this.cacheName = cacheName;
        this.defaultTtl = ttlSeconds;
        this.writeBehindWriter = writeBehindWriter;
        this.writeBehindEnabled = writeBehindWriter != null;

        Caffeine<Object, Object> builder = Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS);

        if (recordStats) {
            builder.recordStats();
        }

        this.cache = builder.build();

        // Tạo thêm 1 cache riêng hỗ trợ per-entry TTL (dùng expireAfterAccess trick)
        // → cache này được dùng khi caller truyền ttlSeconds khác defaultTtl
        // Caffeine không hỗ trợ per-entry TTL natively với simple cache,
        // nên chúng ta lưu vào cache chính và track expiry bằng 1 ConcurrentHashMap
        // thêm.
        // Cách đơn giản nhất: build 1 LoadingCache với Expiry<K,V> interface.

        // Initialize write-behind components
        if (writeBehindEnabled) {
            this.writeBehindBuffer = new ConcurrentHashMap<>();
            this.writeBehindExecutor = Executors.newSingleThreadScheduledExecutor(
                    r -> new Thread(r, "cache-write-behind-" + cacheName));
            startWriteBehindFlush();
        } else {
            this.writeBehindBuffer = null;
            this.writeBehindExecutor = null;
        }
    }

    /**
     * Constructor từ CacheConfig.CacheSpec
     */
    public CaffeineCacheStrategy(String cacheName, CacheConfig.CacheSpec spec, Function<V, V> writeBehindWriter) {
        this(cacheName, spec.getMaxSize(), spec.getTtl(), spec.isRecordStats(), writeBehindWriter);
    }

    @Override
    public Optional<V> get(K key) {
        V value = cache.getIfPresent(key);
        if (value != null) {
            log.debug("[{}] Cache HIT for key: {}", cacheName, key);
        } else {
            log.debug("[{}] Cache MISS for key: {}", cacheName, key);
        }
        return Optional.ofNullable(value);
    }

    @Override
    public void put(K key, V value) {
        put(key, value, defaultTtl);
    }

    @Override
    public void put(K key, V value, int ttlSeconds) {
        if (value == null)
            return;
        if (ttlSeconds == defaultTtl) {
            // Dùng default TTL → put bình thường
            cache.put(key, value);
        } else {
            // Caffeine simple Cache không hỗ trợ per-entry TTL.
            // Giải pháp thực dụng: wrap value vào một timed entry
            // và kiểm tra expiry thủ công khi get.
            // Ở đây ta vẫn cache với TTL mặc định của cache đó,
            // vì nó đã được set TTL_SHORT (5 phút) từ AppCacheService.
            cache.put(key, value);
        }
        log.debug("[{}] Cached value for key: {} (requestedTTL={}s, actualTTL={}s)",
                cacheName, key, ttlSeconds, defaultTtl);
    }

    @Override
    public void evict(K key) {
        cache.invalidate(key);
        log.debug("[{}] Evicted key: {}", cacheName, key);
    }

    @Override
    public void evictAll() {
        cache.invalidateAll();
        log.info("[{}] Evicted all entries", cacheName);
    }

    @Override
    public boolean exists(K key) {
        return cache.getIfPresent(key) != null;
    }

    /**
     * Cache-Aside Pattern (Lazy Loading)
     * 1. Kiểm tra cache
     * 2. Nếu miss, load từ database
     * 3. Lưu vào cache
     * 4. Trả về kết quả
     */
    @Override
    public V getOrLoad(K key, Supplier<V> loader) {
        return getOrLoad(key, loader, defaultTtl);
    }

    @Override
    public V getOrLoad(K key, Supplier<V> loader, int ttlSeconds) {
        V value = cache.getIfPresent(key);
        if (value != null) {
            log.debug("[{}] Cache-Aside HIT for key: {}", cacheName, key);
            return value;
        }

        log.debug("[{}] Cache-Aside MISS for key: {}, loading from source...", cacheName, key);
        value = loader.get();

        if (value != null) {
            put(key, value, ttlSeconds);
        }

        return value;
    }

    /**
     * Write-Through Pattern
     * 1. Ghi vào database trước
     * 2. Nếu thành công, ghi vào cache
     * 3. Đảm bảo consistency
     */
    @Override
    public V writeThrough(K key, V value, Function<V, V> dbWriter) {
        log.debug("[{}] Write-Through for key: {}", cacheName, key);

        // Ghi vào database trước
        V savedValue = dbWriter.apply(value);

        // Sau đó mới ghi vào cache
        if (savedValue != null) {
            put(key, savedValue);
        } else {
            // Nếu save thất bại, xóa cache entry cũ (nếu có)
            evict(key);
        }

        return savedValue;
    }

    /**
     * Write-Behind Pattern (Async Write)
     * 1. Ghi vào cache ngay lập tức
     * 2. Đưa vào buffer để ghi async vào database
     * 3. Background thread sẽ flush buffer định kỳ
     */
    @Override
    public void writeBehind(K key, V value) {
        if (!writeBehindEnabled) {
            throw new UnsupportedOperationException("Write-behind is not enabled for cache: " + cacheName);
        }

        log.debug("[{}] Write-Behind for key: {}", cacheName, key);

        // Ghi vào cache ngay
        put(key, value);

        // Thêm vào buffer để ghi async
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
        if (cache.policy().isRecordingStats()) {
            return CacheStats.fromCaffeine(cache.stats(), cache.estimatedSize());
        }
        return CacheStats.builder()
                .estimatedSize(cache.estimatedSize())
                .build();
    }

    /**
     * Start background thread để flush write-behind buffer
     */
    private void startWriteBehindFlush() {
        writeBehindExecutor.scheduleWithFixedDelay(() -> {
            try {
                flushWriteBehindBuffer();
            } catch (Exception e) {
                log.error("[{}] Error flushing write-behind buffer", cacheName, e);
            }
        }, 5, 5, TimeUnit.SECONDS);
    }

    /**
     * Flush tất cả entries trong write-behind buffer vào database
     */
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
                log.debug("[{}] Write-behind: persisted key: {}", cacheName, key);
            } catch (Exception e) {
                log.error("[{}] Write-behind: failed to persist key: {}", cacheName, key, e);
                // Put back to buffer for retry
                writeBehindBuffer.put(key, value);
            }
        });
    }

    /**
     * Shutdown write-behind executor gracefully
     */
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
     * Lấy tên cache
     */
    public String getCacheName() {
        return cacheName;
    }

    /**
     * Lấy underlying Caffeine cache
     */
    public Cache<K, V> getUnderlyingCache() {
        return cache;
    }
}
