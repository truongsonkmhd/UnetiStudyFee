package com.truongsonkmhd.unetistudy.cache.annotation;

import java.lang.annotation.*;

/**
 * Custom annotation để invalidate cache sau khi method thực thi
 * Sử dụng cho các operation thay đổi dữ liệu (create, update, delete)
 */
@Target({ ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CacheInvalidate {

    /**
     * Tên cache cần invalidate
     */
    String cacheName();

    /**
     * SpEL expression cho cache key cần evict
     * Ví dụ: "#id" hoặc "#user.id"
     */
    String key() default "";

    /**
     * Evict tất cả entries trong cache
     */
    boolean allEntries() default false;

    /**
     * Evict trước hay sau khi thực thi method
     */
    boolean beforeInvocation() default false;
}
