package com.truongsonkmhd.unetistudy.cache.strategy;

import lombok.Builder;
import lombok.Data;

/**
 * Statistics về cache performance
 */
@Data
@Builder
public class CacheStats {

    private long hitCount;
    private long missCount;
    private long loadSuccessCount;
    private long loadFailureCount;
    private long evictionCount;
    private long estimatedSize;
    private double hitRate;
    private double missRate;
    private long averageLoadPenalty; // nanoseconds

    public static CacheStats empty() {
        return CacheStats.builder()
                .hitCount(0)
                .missCount(0)
                .loadSuccessCount(0)
                .loadFailureCount(0)
                .evictionCount(0)
                .estimatedSize(0)
                .hitRate(0.0)
                .missRate(0.0)
                .averageLoadPenalty(0)
                .build();
    }

    public static CacheStats fromCaffeine(com.github.benmanes.caffeine.cache.stats.CacheStats stats, long size) {
        double total = stats.hitCount() + stats.missCount();
        return CacheStats.builder()
                .hitCount(stats.hitCount())
                .missCount(stats.missCount())
                .loadSuccessCount(stats.loadSuccessCount())
                .loadFailureCount(stats.loadFailureCount())
                .evictionCount(stats.evictionCount())
                .estimatedSize(size)
                .hitRate(total > 0 ? stats.hitCount() / total : 0.0)
                .missRate(total > 0 ? stats.missCount() / total : 0.0)
                .averageLoadPenalty((long) stats.averageLoadPenalty())
                .build();
    }
}
