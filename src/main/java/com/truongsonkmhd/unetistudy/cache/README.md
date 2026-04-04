# Hệ thống Caching cho UnetiStudyBee

## Tổng quan

Hệ thống caching triển khai 8 chiến lược caching khác nhau để tối ưu hiệu suất ứng dụng:

1. **Cache-Aside (Lazy Loading)** - Tự động load từ DB khi cache miss
2. **Read-Through** - Tự động hóa việc truy xuất dữ liệu 
3. **Write-Through** - Ghi đồng thời vào cache và DB
4. **Write-Behind (Write-Back)** - Ghi vào cache ngay, batch ghi vào DB sau
5. **Time-based Expiration** - TTL cho các cache entries
6. **LRU (Least Recently Used)** - Eviction policy cho entries ít dùng nhất
7. **LFU (Least Frequently Used)** - Eviction policy cho entries ít truy cập nhất
8. **Cache Invalidation** - Xóa cache khi dữ liệu thay đổi

## Cấu trúc thư mục

```
src/main/java/com/truongsonkmhd/unetistudy/cache/
├── CacheConstants.java         # Hằng số cache names và TTL
├── CacheConfig.java            # Configuration properties
├── CacheManager.java           # Quản lý tất cả cache instances
├── annotation/
│   ├── CacheAside.java         # Annotation cho Cache-Aside pattern
│   ├── CacheInvalidate.java    # Annotation cho Cache Invalidation
│   └── WriteThrough.java       # Annotation cho Write-Through pattern
├── aspect/
│   └── CacheAspect.java        # AOP xử lý cache annotations
├── controller/
│   └── CacheManagementController.java  # REST API quản lý cache
├── service/
│   ├── UserCacheService.java       # Cache cho User
│   ├── CourseCacheService.java     # Cache cho Course
│   ├── QuizCacheService.java       # Cache cho Quiz
│   ├── LessonCacheService.java     # Cache cho Lesson/Exercise
│   └── ScoreWriteBehindService.java # Write-Behind cho điểm thi
└── strategy/
    ├── CacheStrategy.java          # Interface cache strategy
    ├── CacheStats.java             # Statistics class
    ├── CaffeineCacheStrategy.java  # Caffeine implementation
    └── RedisCacheStrategy.java     # Redis implementation
```

## Sử dụng

### 1. Cache-Aside Pattern (Lazy Loading)

```java
// Sử dụng UserCacheService
@Autowired
private UserCacheService userCacheService;

// Trong method
public User getUser(UUID userId) {
    return userCacheService.getUserById(userId, () -> 
        userRepository.findById(userId).orElse(null)
    );
}

// Hoặc sử dụng annotation
@CacheAside(cacheName = CacheConstants.USER_BY_ID, key = "#userId")
public User findById(UUID userId) {
    return userRepository.findById(userId).orElse(null);
}
```

### 2. Write-Through Pattern

```java
// Cập nhật user và cache đồng thời
public User updateUser(UUID userId, User user) {
    return userCacheService.updateUserWithCache(userId, user, 
        u -> userRepository.save(u)
    );
}
```

### 3. Write-Behind Pattern

```java
// Ghi điểm thi - ghi vào cache ngay, DB ghi sau
@Autowired
private ScoreWriteBehindService scoreService;

public void recordQuizScore(UserQuizAttempt attempt) {
    scoreService.recordScore(attempt);
    // Điểm được ghi vào cache ngay lập tức
    // Background thread sẽ flush vào DB định kỳ
}
```

### 4. Cache Invalidation

```java
// Sử dụng service
public void deleteUser(UUID userId, String username) {
    userRepository.deleteById(userId);
    userCacheService.evictUser(userId, username);
}

// Hoặc annotation
@CacheInvalidate(cacheName = CacheConstants.USER_BY_ID, key = "#userId") 
public void deleteUser(UUID userId) {
    userRepository.deleteById(userId);
}
```

### 5. Spring Cache Annotations

```java
// @Cacheable: Cache result của method
@Cacheable(cacheNames = CacheConstants.COURSE_PUBLISHED_TREE, key = "#slug")
public CourseTreeResponse getCourseTree(String slug) {
    return buildCourseTree(slug);
}

// @CacheEvict: Evict cache
@CacheEvict(cacheNames = CacheConstants.COURSE_PUBLISHED_TREE, key = "#slug")
public void updateCourse(String slug, Course course) {
    courseRepository.save(course);
}

// @CacheEvict với allEntries
@CacheEvict(cacheNames = CacheConstants.COURSE_CATALOG, allEntries = true)
public void refreshAllCourses() {
    // ...
}
```

## Configuration

### application.yml

```yaml
app:
  cache:
    type: caffeine              # caffeine hoặc redis
    default-ttl: 900            # TTL mặc định (giây)
    default-max-size: 1000      # Max size mặc định
    record-stats: true          # Bật thống kê
    write-behind-enabled: false # Bật write-behind
    caches:
      user_by_id:
        ttl: 900
        max-size: 1000
        eviction-policy: LRU
      course_published_tree:
        ttl: 3600               # 1 giờ cho course tree
        max-size: 500
        eviction-policy: LRU
```

## Cache Management API

### Endpoints (Admin only)

- `GET /api/v1/admin/cache/stats` - Xem thống kê tất cả caches
- `GET /api/v1/admin/cache/stats/{cacheName}` - Xem thống kê một cache
- `GET /api/v1/admin/cache/info` - Thông tin tổng quan
- `DELETE /api/v1/admin/cache/evict/{cacheName}` - Xóa một cache
- `DELETE /api/v1/admin/cache/evict-all` - Xóa tất cả caches
- `DELETE /api/v1/admin/cache/evict/users` - Xóa user caches
- `DELETE /api/v1/admin/cache/evict/courses` - Xóa course caches
- `DELETE /api/v1/admin/cache/evict/quizzes` - Xóa quiz caches
- `POST /api/v1/admin/cache/flush-writes` - Force flush write-behind buffer

## Áp dụng cho các Use Cases cụ thể

### 1. Thông tin người dùng
- **Pattern**: Cache-Aside (Lazy Loading)
- **TTL**: 15 phút
- **Eviction**: LRU

### 2. Danh sách khóa học (public)
- **Pattern**: Cache-Aside + Time-based Expiration
- **TTL**: 1 giờ
- **Eviction**: LRU

### 3. Chi tiết bài kiểm tra
- **Pattern**: Cache-Aside + Cache Invalidation
- **TTL**: 15 phút
- **Eviction**: LRU
- **Invalidation**: Khi quiz được cập nhật

### 4. Điểm thi
- **Pattern**: Write-Behind
- **Flush interval**: 10 giây
- **Batch size**: 50 entries

### 5. Roles & Permissions
- **Pattern**: Cache-Aside
- **TTL**: 6 giờ (ít thay đổi)
- **Eviction**: LFU

## Best Practices

1. **Đặt TTL phù hợp**: Dữ liệu thay đổi thường xuyên = TTL ngắn
2. **Cache Invalidation**: Luôn invalidate cache khi update/delete
3. **Key design**: Sử dụng key rõ ràng, duy nhất
4. **Monitor**: Theo dõi hit rate để điều chỉnh TTL
5. **Warm-up**: Warm up cache cho dữ liệu hot khi khởi động

## Monitoring

Xem cache statistics qua API hoặc Actuator:

```json
{
  "user_by_id": {
    "hitCount": 1234,
    "missCount": 56,
    "hitRate": 0.96,
    "estimatedSize": 500
  }
}
```
