package com.truongsonkmhd.unetistudy.cache;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration properties cho cache
 * Có thể override qua application.yml
 */
@Configuration
@ConfigurationProperties(prefix = "app.cache")
@Getter
@Setter
public class CacheConfig {

    /**
     * Loại cache provider (caffeine, redis, composite)
     */
    private String type = "caffeine";

    /**
     * Default TTL (seconds)
     */
    private int defaultTtl = CacheConstants.TTL_MEDIUM;

    /**
     * Default max size
     */
    private int defaultMaxSize = CacheConstants.SIZE_LARGE;

    /**
     * Enable/disable cache statistics
     */
    private boolean recordStats = true;

    /**
     * Enable/disable write-behind (async write)
     */
    private boolean writeBehindEnabled = false;

    /**
     * Write-behind delay (ms)
     */
    private int writeBehindDelayMs = 5000;

    /**
     * Write-behind batch size
     */
    private int writeBehindBatchSize = 100;

    /**
     * Custom cache configurations
     * Map<cacheName, CacheSpec>
     */
    private Map<String, CacheSpec> caches = new HashMap<>();

    @Getter
    @Setter
    public static class CacheSpec {
        private int ttl = CacheConstants.TTL_MEDIUM;
        private int maxSize = CacheConstants.SIZE_LARGE;
        private boolean recordStats = true;
        private EvictionPolicy evictionPolicy = EvictionPolicy.LRU;
    }

    public enum EvictionPolicy {
        LRU, // Least Recently Used
        LFU, // Least Frequently Used
        FIFO // First In First Out
    }
}
