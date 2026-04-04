package com.truongsonkmhd.unetistudy.cache.aspect;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.annotation.CacheAside;
import com.truongsonkmhd.unetistudy.cache.annotation.CacheInvalidate;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Optional;

/**
 * AOP Aspect để tự động xử lý cache annotations
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class CacheAspect {

    private final AppCacheService appCacheService;
    private final ExpressionParser parser = new SpelExpressionParser();

    /**
     * Xử lý @CacheAside annotation
     * Implement Cache-Aside (Lazy Loading) pattern
     */
    @Around("@annotation(cacheAside)")
    @SuppressWarnings("unchecked")
    public Object handleCacheAside(ProceedingJoinPoint joinPoint, CacheAside cacheAside) throws Throwable {
        String cacheName = cacheAside.cacheName();
        String keyExpression = cacheAside.key();
        int ttl = cacheAside.ttl();
        boolean cacheNull = cacheAside.cacheNull();

        // Parse cache key từ SpEL expression
        Object key = parseKey(joinPoint, keyExpression);
        if (key == null) {
            log.warn("Cache key is null, skipping cache for: {}.{}",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName());
            return joinPoint.proceed();
        }

        // Lấy cache
        CacheStrategy<Object, Object> cache = appCacheService.getCache(cacheName);
        if (cache == null) {
            log.warn("Cache not found: {}, proceeding without cache", cacheName);
            return joinPoint.proceed();
        }

        // Kiểm tra cache trước
        Optional<Object> cachedValue = cache.get(key);
        if (cachedValue.isPresent()) {
            log.debug("Cache HIT for key: {} in cache: {}", key, cacheName);
            return cachedValue.get();
        }

        // Cache miss - gọi method gốc
        log.debug("Cache MISS for key: {} in cache: {}, loading...", key, cacheName);
        Object result = joinPoint.proceed();

        // Lưu vào cache
        if (result != null || cacheNull) {
            cache.put(key, result, ttl);
            log.debug("Cached result for key: {} in cache: {}", key, cacheName);
        }

        return result;
    }

    /**
     * Xử lý @CacheInvalidate annotation
     * Implement Cache Invalidation pattern
     */
    @Around("@annotation(cacheInvalidate)")
    @SuppressWarnings("unchecked")
    public Object handleCacheInvalidate(ProceedingJoinPoint joinPoint, CacheInvalidate cacheInvalidate)
            throws Throwable {
        String cacheName = cacheInvalidate.cacheName();
        String keyExpression = cacheInvalidate.key();
        boolean allEntries = cacheInvalidate.allEntries();
        boolean beforeInvocation = cacheInvalidate.beforeInvocation();

        // Lấy cache
        CacheStrategy<Object, Object> cache = appCacheService.getCache(cacheName);
        if (cache == null) {
            log.warn("Cache not found for invalidation: {}", cacheName);
            return joinPoint.proceed();
        }

        // Evict trước khi thực thi (nếu cấu hình)
        if (beforeInvocation) {
            evictFromCache(joinPoint, cache, cacheName, keyExpression, allEntries);
        }

        // Thực thi method gốc
        Object result = joinPoint.proceed();

        // Evict sau khi thực thi (mặc định)
        if (!beforeInvocation) {
            evictFromCache(joinPoint, cache, cacheName, keyExpression, allEntries);
        }

        return result;
    }

    private void evictFromCache(ProceedingJoinPoint joinPoint, CacheStrategy<Object, Object> cache,
            String cacheName, String keyExpression, boolean allEntries) {
        if (allEntries) {
            cache.evictAll();
            log.info("Evicted all entries from cache: {}", cacheName);
        } else if (keyExpression != null && !keyExpression.isEmpty()) {
            Object key = parseKey(joinPoint, keyExpression);
            if (key != null) {
                cache.evict(key);
                log.debug("Evicted key: {} from cache: {}", key, cacheName);
            }
        }
    }

    /**
     * Parse SpEL expression để lấy cache key
     */
    private Object parseKey(ProceedingJoinPoint joinPoint, String keyExpression) {
        if (keyExpression == null || keyExpression.isEmpty()) {
            return null;
        }

        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            String[] paramNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();

            EvaluationContext context = new StandardEvaluationContext();

            // Thêm parameters vào context
            if (paramNames != null) {
                for (int i = 0; i < paramNames.length; i++) {
                    context.setVariable(paramNames[i], args[i]);
                }
            }

            // Thêm các shorthand
            if (args.length > 0) {
                context.setVariable("p0", args[0]);
                context.setVariable("arg0", args[0]);
                if (args.length > 1) {
                    context.setVariable("p1", args[1]);
                    context.setVariable("arg1", args[1]);
                }
            }

            return parser.parseExpression(keyExpression).getValue(context);

        } catch (Exception e) {
            log.error("Failed to parse cache key expression: {}", keyExpression, e);
            return null;
        }
    }
}
