package com.truongsonkmhd.unetistudy.cache;

/**
 * Hằng số định nghĩa các cache name và TTL trong hệ thống
 * Quản lý tập trung tất cả cache để dễ dàng maintain
 */
public final class CacheConstants {

    private CacheConstants() {
        // Prevent instantiation
    }

    // ========================
    // CACHE NAMES
    // ========================

    // User caches
    public static final String USER_BY_ID = "user_by_id";
    public static final String USER_BY_USERNAME = "user_by_username";
    public static final String USER_DETAILS = "user_details";
    public static final String ALL_USERS = "all_users";

    // Course caches
    public static final String COURSE_BY_ID = "course_by_id";
    public static final String COURSE_BY_SLUG = "course_by_slug";
    public static final String COURSE_PUBLISHED_TREE = "course_published_tree";
    /**
     * Cache cho danh sách khóa học (trang chủ, tìm kiếm, quản trị).
     * Key bao gồm các tham số phân trang và bộ lọc.
     * TTL: 5 phút.
     */
    public static final String COURSE_CATALOG = "course_catalog";

    public static final String COURSE_MODULES = "course_modules";

    // Quiz caches
    public static final String QUIZ_BY_ID = "quiz_by_id";
    public static final String QUIZ_LIST = "quiz_list";
    public static final String QUIZ_QUESTIONS = "quiz_questions";
    public static final String QUIZ_ANSWERS = "quiz_answers";

    // Quiz Template caches
    public static final String QUIZ_TEMPLATE_BY_ID = "quiz_template_by_id";
    public static final String QUIZ_TEMPLATE_LIST = "quiz_template_list";

    // Lesson caches
    public static final String LESSON_BY_ID = "lesson_by_id";
    public static final String LESSON_BY_MODULE = "lesson_by_module";

    // Coding Exercise caches
    public static final String CODING_EXERCISE_BY_ID = "coding_exercise_by_id";
    public static final String CODING_EXERCISE_LIST = "coding_exercise_list";

    // Role & Permission caches
    public static final String ROLES = "roles";
    public static final String PERMISSIONS = "permissions";
    public static final String USER_ROLES = "user_roles";

    // Statistics caches
    public static final String USER_STATS = "user_stats";
    public static final String COURSE_STATS = "course_stats";
    public static final String QUIZ_STATS = "quiz_stats";

    // Class & Contest caches
    public static final String CLASSES = "classes";
    public static final String CONTESTS = "contests";

    // Post (blog) caches
    public static final String POST_BY_ID = "post_by_id";
    public static final String POST_BY_SLUG = "post_by_slug";
    public static final String POST_CATALOG = "post_catalog";
    public static final String POST_PUBLISHED = "post_published";

    // ========================
    // CACHE TTL (seconds)
    // ========================

    // Short-lived caches (1-5 minutes) - cho dữ liệu thay đổi thường xuyên
    public static final int TTL_VERY_SHORT = 60; // 1 minute
    public static final int TTL_SHORT = 300; // 5 minutes

    // Medium-lived caches (15-30 minutes) - cho dữ liệu thay đổi trung bình
    public static final int TTL_MEDIUM = 900; // 15 minutes
    public static final int TTL_MEDIUM_LONG = 1800; // 30 minutes

    // Long-lived caches (1-6 hours) - cho dữ liệu ít thay đổi
    public static final int TTL_LONG = 3600; // 1 hour
    public static final int TTL_VERY_LONG = 21600; // 6 hours

    // Static caches (1 day+) - cho dữ liệu gần như không thay đổi
    public static final int TTL_STATIC = 86400; // 24 hours

    // ========================
    // CACHE SIZE LIMITS
    // ========================

    public static final int SIZE_SMALL = 100;
    public static final int SIZE_MEDIUM = 500;
    public static final int SIZE_LARGE = 1000;
    public static final int SIZE_EXTRA_LARGE = 5000;

    // ========================
    // KEY PREFIXES
    // ========================

    public static final String PREFIX_USER = "user:";
    public static final String PREFIX_COURSE = "course:";
    public static final String PREFIX_QUIZ = "quiz:";
    public static final String PREFIX_LESSON = "lesson:";
    public static final String PREFIX_STATS = "stats:";
    public static final String PREFIX_POST = "post:";
}