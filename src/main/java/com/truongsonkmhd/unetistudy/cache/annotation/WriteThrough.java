package com.truongsonkmhd.unetistudy.cache.annotation;

import java.lang.annotation.*;

/**
 * Custom annotation để áp dụng Write-Through pattern
 * Ghi đồng thời vào cache và database
 */
@Target({ ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface WriteThrough {

    /**
     * Tên cache
     */
    String cacheName();

    /**
     * SpEL expression cho cache key
     */
    String key();
}
