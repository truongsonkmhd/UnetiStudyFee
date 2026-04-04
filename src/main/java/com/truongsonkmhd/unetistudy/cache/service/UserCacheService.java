package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Service quản lý cache cho User
 * Áp dụng Cache-Aside Pattern để cache thông tin người dùng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserCacheService {

    private final AppCacheService appCacheService;

    /**
     * Cache-Aside: Lấy user by ID
     * Nếu không có trong cache, gọi loader để load từ DB
     */
    public User getUserById(UUID userId, Supplier<User> loader) {
        CacheStrategy<UUID, User> cache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        return cache.getOrLoad(userId, loader);
    }

    /**
     * Cache-Aside: Lấy user by username
     */
    public User getUserByUsername(String username, Supplier<User> loader) {
        CacheStrategy<String, User> cache = appCacheService.getCache(CacheConstants.USER_BY_USERNAME);
        return cache.getOrLoad(username, loader);
    }

    /**
     * Lấy user từ cache (không load từ DB)
     */
    public Optional<User> getCachedUserById(UUID userId) {
        CacheStrategy<UUID, User> cache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        return cache.get(userId);
    }

    /**
     * Write-Through: Cập nhật user và cache đồng thời
     */
    public User updateUserWithCache(UUID userId, User user, java.util.function.Function<User, User> dbWriter) {
        CacheStrategy<UUID, User> cache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        User savedUser = cache.writeThrough(userId, user, dbWriter);

        // Cũng cần update cache by username
        if (savedUser != null && savedUser.getUsername() != null) {
            CacheStrategy<String, User> usernameCache = appCacheService.getCache(CacheConstants.USER_BY_USERNAME);
            usernameCache.put(savedUser.getUsername(), savedUser);
        }

        return savedUser;
    }

    /**
     * Evict user từ tất cả related caches
     */
    public void evictUser(UUID userId, String username) {
        CacheStrategy<UUID, User> idCache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        idCache.evict(userId);

        if (username != null) {
            CacheStrategy<String, User> usernameCache = appCacheService.getCache(CacheConstants.USER_BY_USERNAME);
            usernameCache.evict(username);
        }

        log.info("Evicted user from cache: {}", userId);
    }

    /**
     * Evict tất cả user caches
     */
    public void evictAllUsers() {
        CacheStrategy<?, ?> idCache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        CacheStrategy<?, ?> usernameCache = appCacheService.getCache(CacheConstants.USER_BY_USERNAME);

        idCache.evictAll();
        usernameCache.evictAll();

        log.info("Evicted all users from cache");
    }

    /**
     * Refresh user trong cache
     */
    public void refreshUser(UUID userId, Supplier<User> loader) {
        CacheStrategy<UUID, User> cache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        cache.refresh(userId, loader);
    }

    /**
     * Warm up cache với danh sách users
     */
    public void warmUpCache(Iterable<User> users) {
        CacheStrategy<UUID, User> idCache = appCacheService.getCache(CacheConstants.USER_BY_ID);
        CacheStrategy<String, User> usernameCache = appCacheService.getCache(CacheConstants.USER_BY_USERNAME);

        int count = 0;
        for (User user : users) {
            idCache.put(user.getId(), user);
            if (user.getUsername() != null) {
                usernameCache.put(user.getUsername(), user);
            }
            count++;
        }

        log.info("Warmed up user cache with {} users", count);
    }
}
