package com.truongsonkmhd.unetistudy.cache.annotation;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;

import java.lang.annotation.*;

/**
 * Custom annotation để áp dụng Cache-Aside pattern
 * Tự động cache kết quả của method
 */
@Target({ ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CacheAside {

    /**
     * Tên cache
     */
    String cacheName();

    /**
     * SpEL expression cho cache key
     * Ví dụ: "#id" hoặc "#user.id"
     */
    String key();

    /**
     * TTL in seconds
     */
    int ttl() default CacheConstants.TTL_MEDIUM;

    /**
     * Có nên refresh cache khi về null không
     */
    boolean cacheNull() default false;
}
