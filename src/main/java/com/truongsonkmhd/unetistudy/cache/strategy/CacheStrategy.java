package com.truongsonkmhd.unetistudy.cache.strategy;

import java.util.Optional;
import java.util.function.Supplier;

/**
 * Interface định nghĩa các chiến lược caching
 * Implement các pattern: Cache-Aside, Read-Through, Write-Through, Write-Behind
 */
public interface CacheStrategy<K, V> {

    /**
     * Lấy giá trị từ cache
     * 
     * @param key Cache key
     * @return Optional chứa giá trị nếu có
     */
    Optional<V> get(K key);

    /**
     * Lưu giá trị vào cache
     * 
     * @param key   Cache key
     * @param value Giá trị cần lưu
     */
    void put(K key, V value);

    /**
     * Lưu giá trị vào cache với TTL tùy chỉnh
     * 
     * @param key        Cache key
     * @param value      Giá trị cần lưu
     * @param ttlSeconds Thời gian sống (giây)
     */
    void put(K key, V value, int ttlSeconds);

    /**
     * Xóa giá trị khỏi cache
     * 
     * @param key Cache key
     */
    void evict(K key);

    /**
     * Xóa tất cả giá trị trong cache
     */
    void evictAll();

    /**
     * Kiểm tra key có tồn tại trong cache không
     * 
     * @param key Cache key
     * @return true nếu tồn tại
     */
    boolean exists(K key);

    /**
     * Cache-Aside Pattern (Lazy Loading)
     * Tự động load từ database nếu cache miss
     * 
     * @param key    Cache key
     * @param loader Function để load dữ liệu từ database
     * @return Giá trị từ cache hoặc database
     */
    V getOrLoad(K key, Supplier<V> loader);

    /**
     * Cache-Aside Pattern với TTL tùy chỉnh
     */
    V getOrLoad(K key, Supplier<V> loader, int ttlSeconds);

    /**
     * Write-Through Pattern
     * Ghi đồng thời vào cache và database
     * 
     * @param key      Cache key
     * @param value    Giá trị cần ghi
     * @param dbWriter Function để ghi vào database
     * @return Giá trị đã ghi
     */
    V writeThrough(K key, V value, java.util.function.Function<V, V> dbWriter);

    /**
     * Write-Behind Pattern (Async Write)
     * Ghi vào cache ngay, ghi vào database sau (async)
     * 
     * @param key   Cache key
     * @param value Giá trị cần ghi
     */
    void writeBehind(K key, V value);

    /**
     * Refresh cache entry
     * 
     * @param key    Cache key
     * @param loader Function để load dữ liệu mới
     */
    void refresh(K key, Supplier<V> loader);

    /**
     * Lấy statistics của cache
     * 
     * @return CacheStats object
     */
    CacheStats getStats();
}
