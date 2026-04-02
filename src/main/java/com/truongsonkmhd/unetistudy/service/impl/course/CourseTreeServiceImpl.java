package com.truongsonkmhd.unetistudy.service.impl.course;

import com.github.slugify.Slugify;
import com.truongsonkmhd.unetistudy.cache.service.CourseCacheService;
import com.truongsonkmhd.unetistudy.common.CourseStatus;
import com.truongsonkmhd.unetistudy.common.YouTubeUtils;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseDTO;
import com.truongsonkmhd.unetistudy.dto.course_dto.*;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;
import com.truongsonkmhd.unetistudy.exception.payload.DataNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.course.CourseModuleRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.course.CourseModuleResponseMapper;
import com.truongsonkmhd.unetistudy.mapper.course.CourseRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.course.CourseResponseMapper;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserAnswerRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizTemplateRepository;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseTemplateRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseModuleRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonRepository;
import com.truongsonkmhd.unetistudy.repository.course.QuizRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizTemplateRepository;
import com.truongsonkmhd.unetistudy.service.CourseTreeService;
import com.truongsonkmhd.unetistudy.service.infrastructure.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseTreeServiceImpl implements CourseTreeService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final CodingExerciseRepository codingExerciseRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final QuizRepository quizRepository;
    private final CodingExerciseTemplateRepository codingExerciseTemplateRepository;
    private final QuizTemplateRepository quizTemplateRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;
    private final UserRepository userRepository;
    private final CourseResponseMapper courseResponseMapper;
    private final CourseRequestMapper courseRequestMapper;
    private final CourseModuleRequestMapper courseModuleRequestMapper;
    private final CourseModuleResponseMapper courseModuleResponseMapper;
    private final Slugify slugify;
    private final SupabaseStorageService storageService;
    private final CourseCacheService courseCacheService;

    private static final Comparator<Integer> NULL_SAFE_INT = Comparator.nullsLast(Integer::compareTo);

    @Override
    @Transactional(readOnly = true)
    public CourseTreeResponse findById(UUID theId) {
        log.debug("findById - ID: {}", theId);
        // Sử dụng programmatic cache thay cho annotation
        Course course = courseCacheService.getCourseById(theId, () -> {
            log.debug("Cache MISS - Loading course from DB: {}", theId);
            return courseRepository.findById(theId)
                    .orElseThrow(() -> new RuntimeException("Course not found with id =" + theId));
        });
        return courseResponseMapper.toDto(course);
    }

    @Override
    @Transactional
    public CourseTreeResponse save(@NonNull CourseShowRequest req) {

        UUID userID = UserContext.getUserID();
        User instructor = userRepository.findById(userID)
                .orElseThrow(() -> new DataNotFoundException("Instructor not found: " + userID));

        Course course = courseRequestMapper.toEntity(req);
        course.setInstructor(instructor);

        if (req.getVideoUrl() != null && !req.getVideoUrl().isBlank()) {
            String ytVideoId = YouTubeUtils.extractVideoId(req.getVideoUrl());
            course.setYoutubeVideoId(ytVideoId);
            course.setVideoUrl(ytVideoId != null
                    ? YouTubeUtils.toEmbedUrl(ytVideoId)
                    : req.getVideoUrl());
        }

        if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
            String pbUrl = storageService.uploadFile("course_images", req.getImageFile());
            if (pbUrl != null) {
                course.setImageUrl(pbUrl);
            }
        }

        String baseSlug = slugify.slugify(req.getTitle());
        course.setSlug(generateUniqueSlug(baseSlug));

        if (course.getEnrolledCount() == null)
            course.setEnrolledCount(0);
        if (course.getRating() == null)
            course.setRating(java.math.BigDecimal.ZERO);
        if (course.getRatingCount() == null)
            course.setRatingCount(0);

        if (course.getStatus() == null)
            course.setStatus(CourseStatus.DRAFT);
        if (course.getIsPublished() == null)
            course.setIsPublished(req.getIsPublished() != null ? req.getIsPublished() : false);

        if (Boolean.TRUE.equals(course.getIsPublished())) {
            if (course.getPublishedAt() == null) {
                course.setPublishedAt(
                        req.getPublishedAt() != null ? req.getPublishedAt() : java.time.LocalDateTime.now());
            }
        } else {
            course.setPublishedAt(null);
        }

        course.setModules(new ArrayList<>());
        if (req.getModules() != null) {
            syncModules(course, req.getModules(), instructor);
        }

        Course saved = courseRepository.save(course);
        // Evict toàn bộ related caches một cách tập trung
        courseCacheService.evictCourseCompletely(saved.getCourseId(), saved.getSlug());
        return getCourseTree(saved.getSlug(), userRepository.findRolesByUserId(instructor.getId()));
    }

    @Override
    @Transactional
    public CourseTreeResponse update(UUID courseId, CourseShowRequest req) {
        log.info("Updating course: {}", courseId);
        UUID userID = UserContext.getUserID();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new DataNotFoundException("Course not found: " + courseId));
        if (userID != null) {
            User instructor = userRepository.findById(userID)
                    .orElseThrow(() -> new DataNotFoundException("Instructor not found: " + userID));
            course.setInstructor(instructor);
        }

        // fields
        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setShortDescription(req.getShortDescription());
        course.setLevel(req.getLevel());
        course.setCategory(req.getCategory());
        course.setSubCategory(req.getSubCategory());
        course.setDuration(req.getDuration());
        course.setCapacity(req.getCapacity());
        course.setRequirements(req.getRequirements());
        course.setObjectives(req.getObjectives());
        course.setSyllabus(req.getSyllabus());
        course.setStatus(req.getStatus());
        course.setIsPublished(req.getIsPublished());
        course.setPublishedAt(req.getPublishedAt());

        // Cập nhật YouTube URL giới thiệu khóa học
        if (req.getVideoUrl() != null && !req.getVideoUrl().isBlank()) {
            String ytVideoId = YouTubeUtils.extractVideoId(req.getVideoUrl());
            course.setYoutubeVideoId(ytVideoId);
            course.setVideoUrl(ytVideoId != null
                    ? YouTubeUtils.toEmbedUrl(ytVideoId)
                    : req.getVideoUrl());
        }

        // Upload/Update course image if exists
        if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
            String oldImageUrl = course.getImageUrl();
            String pbUrl = storageService.uploadFile("course_images", req.getImageFile());
            if (pbUrl != null) {
                course.setImageUrl(pbUrl);
                // 3. Delete OLD image from storage if upload new one successfully
                if (oldImageUrl != null && !oldImageUrl.isBlank()) {
                    storageService.deleteFile(oldImageUrl);
                }
            }
        }

        // slug update (optional)
        String newBaseSlug = slugify.slugify(req.getTitle());
        if (newBaseSlug != null && !newBaseSlug.isBlank()) {
            if (!newBaseSlug.equals(course.getSlug())) {
                course.setSlug(generateUniqueSlugForUpdate(newBaseSlug, course.getCourseId()));
            }
        }

        // upsert tree
        syncModules(course, req.getModules(), course.getInstructor());

        Course saved = courseRepository.save(course);
        // Evict toàn bộ related caches
        courseCacheService.evictCourseCompletely(saved.getCourseId(), saved.getSlug());
        return getCourseTree(saved.getSlug(), userRepository.findRolesByUserId(course.getInstructor().getId()));
    }

    /**
     * Cache Invalidation: Evict cache khi delete course
     */
    @Override
    @Transactional
    public UUID deleteById(UUID theId) {
        log.info("Deleting course: {}", theId);
        Course course = courseRepository.findById(theId)
                .orElseThrow(() -> new DataNotFoundException("course not found: " + theId));

        if (course.getImageUrl() != null && !course.getImageUrl().isBlank()) {
            storageService.deleteFile(course.getImageUrl());
        }

        for (CourseModule module : course.getModules()) {
            cleanupStudentDataForModule(module);
        }

        courseRepository.deleteById(course.getCourseId());
        // Evict toàn bộ related caches
        courseCacheService.evictCourseCompletely(course.getCourseId(), course.getSlug());
        return theId;
    }

    /**
     * Cache-Aside: Lấy modules by course slug
     */
    @Override
    public List<CourseModuleResponse> getCourseModuleByCourseSlug(String theSlug) {
        log.debug("getCourseModuleByCourseSlug - Slug: {}", theSlug);
        // TODO: Có thể chuyển việc cache Module lẻ tẻ này vào CourseCacheService nếu
        // cần tối ưu sâu hơn
        // Hiện tại chỉ xóa annotation để đồng nhất programmatic approach
        return courseModuleResponseMapper.toDto(courseModuleRepository.getCourseModuleByCourseSlug(theSlug));
    }

    @Override
    public PageResponse<CourseCardResponse> getAllCourses(Integer page, Integer size, String q, String status,
            String category) {
        log.debug("getAllCourses - page={}, size={}, q={}, status={}, category={}", page, size, q, status, category);
        return queryCourseCatalog(page, size, q, status, category);
    }

    /**
     * Thực hiện query thực sự từ DB — chỉ được gọi khi cache MISS.
     * Tách riêng thành method có @Transactional để Spring proxy hoạt động đúng.
     */
    @Transactional(readOnly = true)
    public PageResponse<CourseCardResponse> queryCourseCatalog(Integer page, Integer size, String q, String status,
            String category) {
        log.debug("Cache MISS - Loading course catalog from DB");
        int safePage = (page != null) ? Math.max(page, 0) : 0;
        int safeSize = (size != null) ? Math.min(Math.max(size, 1), 50) : 10;

        Pageable pageable = PageRequest.of(safePage, safeSize);
        CourseStatus courseStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                courseStatus = CourseStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid course status: {}", status);
            }
        }
        UUID instructorId = UserContext.getUserID();

        Page<CourseCardResponse> result = courseRepository.findCourseCardsWithFilters(q, courseStatus, category, instructorId,
                pageable);
        return PageResponse.<CourseCardResponse>builder()
                .items(result.getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseTreeResponse getCourseTreeDetailPublished(String slug) {
        return courseCacheService.getCoursePublishedTree(slug, () -> {
            UUID userId = UserContext.getUserID();
            Set<Role> roles = (userId != null) ? userRepository.findRolesByUserId(userId) : Collections.emptySet();
            return getCourseTree(slug, roles);
        });
    }

    private CourseTreeResponse getCourseTree(String slug, Set<Role> roles) {
        if (slug == null || slug.isBlank()) {
            throw new DataNotFoundException("Course slug must not be null or empty");
        }
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new DataNotFoundException("Course not found with slug: " + slug));

        UUID courseId = course.getCourseId();

        List<CourseModule> courseModule = courseModuleRepository.findModulesByCourseId(courseId);
        List<UUID> moduleIds = courseModule.stream().map(CourseModule::getModuleId).toList();

        List<CourseLesson> lessons = lessonRepository.findLessonsByModuleIds(moduleIds);

        List<UUID> lessonIds = lessons.stream().map(CourseLesson::getLessonId).toList();

        List<CodingExercise> exercises = codingExerciseRepository.findExercisesByLessonIds(lessonIds);

        List<Quiz> quizzes = quizRepository.findQuizzesByLessonIds(lessonIds);

        Map<UUID, List<CodingExercise>> exByLesson = new HashMap<>();
        exercises.forEach(e -> {
            e.getCourseLessons().forEach(cl -> {
                exByLesson.computeIfAbsent(cl.getLessonId(), k -> new ArrayList<>()).add(e);
            });
        });

        Map<UUID, List<Quiz>> quizByLesson = new HashMap<>();
        quizzes.forEach(q -> {
            q.getCourseLessons().forEach(cl -> {
                quizByLesson.computeIfAbsent(cl.getLessonId(), k -> new ArrayList<>()).add(q);
            });
        });

        return mapCourse(course, courseModule, lessons, roles, exByLesson, quizByLesson);
    }

    // =========================
    // MAPPING (FILTER INSIDE)
    // =========================

    private CourseTreeResponse mapCourse(Course course, List<CourseModule> courseModule,
            List<CourseLesson> courseLessons, Set<Role> roles, Map<UUID, List<CodingExercise>> exByLesson,
            Map<UUID, List<Quiz>> quizByLesson) {

        List<CourseModuleResponse> modules = courseModule.stream()
                .sorted(Comparator.comparing(CourseModule::getOrderIndex, NULL_SAFE_INT))
                .filter(m -> !isOnlyStudent(roles) || allowPublished(m.getIsPublished()))
                .map(m -> mapModule(m, courseLessons, roles, exByLesson, quizByLesson))
                .toList();

        String videoId = course.getYoutubeVideoId();
        String embedUrl = YouTubeUtils.toEmbedUrl(videoId);
        String finalVideoUrl = (embedUrl != null)
                ? embedUrl
                : storageService.toDisplayUrl(course.getVideoUrl());

        return CourseTreeResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .shortDescription(course.getShortDescription())
                .level(course.getLevel())
                .category(course.getCategory())
                .subCategory(course.getSubCategory())
                .duration(course.getDuration())
                .capacity(course.getCapacity())
                .requirements(course.getRequirements())
                .objectives(course.getObjectives())
                .syllabus(course.getSyllabus())
                .publishedAt(course.getPublishedAt())
                .isPublished(course.getIsPublished())
                .status(course.getStatus())
                .imageUrl(storageService.toDisplayUrl(course.getImageUrl()))
                .videoUrl(finalVideoUrl)
                .youtubeVideoId(videoId)
                .embedUrl(embedUrl)
                .modules(modules)
                .enrolledCount(course.getEnrolledCount() != null ? course.getEnrolledCount() : 0)
                .rating(course.getRating() != null ? course.getRating().doubleValue() : 0.0)
                .ratingCount(course.getRatingCount() != null ? course.getRatingCount() : 0)
                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt()
                        : (course.getPublishedAt() != null ? course.getPublishedAt().toInstant(java.time.ZoneOffset.UTC)
                                : java.time.Instant.now()))
                .build();
    }

    private CourseModuleResponse mapModule(CourseModule m, List<CourseLesson> courseLessons, Set<Role> roles,
            Map<UUID, List<CodingExercise>> exByLesson, Map<UUID, List<Quiz>> quizByLesson) {

        List<CourseLessonResponse> lessons = courseLessons.stream()
                .filter(l -> l.getModule() != null && l.getModule().getModuleId().equals(m.getModuleId()))
                .sorted(Comparator.comparing(CourseLesson::getOrderIndex, NULL_SAFE_INT))
                .filter(l -> !isOnlyStudent(roles) || allowLessonForStudent(l))
                .map(l -> mapLesson(l, exByLesson, quizByLesson))
                .toList();

        return new CourseModuleResponse(
                m.getModuleId(),
                m.getTitle(),
                m.getOrderIndex(),
                m.getIsPublished(),
                lessons);
    }

    private CourseLessonResponse mapLesson(CourseLesson courseLesson,
            Map<UUID, List<CodingExercise>> exByLesson, Map<UUID, List<Quiz>> quizByLesson) {

        List<CodingExerciseDTO> coding = exByLesson.getOrDefault(courseLesson.getLessonId(), List.of()).stream()
                .filter(e -> allowPublished(e.getIsPublished()))
                .map(this::mapCoding)
                .toList();

        List<QuizDTO> quizzes = quizByLesson.getOrDefault(courseLesson.getLessonId(), List.of()).stream()
                .filter(q -> allowPublished(q.getIsPublished()))
                .map(this::mapQuiz)
                .toList();

        // Xác định cách build video URL:
        // - Nếu có youtubeVideoId → dùng YouTube embed
        // - Nếu không → fallback: dùng Supabase display URL (cũ)
        String videoId = courseLesson.getYoutubeVideoId();
        String embedUrl = com.truongsonkmhd.unetistudy.common.YouTubeUtils.toEmbedUrl(videoId);
        String finalVideoUrl = (embedUrl != null)
                ? embedUrl
                : storageService.toDisplayUrl(courseLesson.getVideoUrl());

        return CourseLessonResponse.builder()
                .lessonId(courseLesson.getLessonId())
                .title(courseLesson.getTitle())
                .orderIndex(courseLesson.getOrderIndex())
                .lessonType(courseLesson.getLessonType())
                .isPreview(courseLesson.getIsPreview())
                .isPublished(courseLesson.getIsPublished())
                .videoUrl(finalVideoUrl) // Trả về embed URL
                .youtubeVideoId(videoId) // Video ID thuần (nullable)
                .embedUrl(embedUrl) // Embed URL thuần (nullable)
                .description(courseLesson.getDescription())
                .content(courseLesson.getContent())
                .slug(courseLesson.getSlug())
                .codingExercises(coding)
                .quizzes(quizzes)
                .build();
    }

    private CodingExerciseDTO mapCoding(CodingExercise e) {
        if (e == null)
            return null;

        return CodingExerciseDTO.builder()
                .exerciseId(e.getExerciseId())
                .templateId(e.getTemplateId())
                .contestLessonId(
                        e.getContestLessons().isEmpty() ? null : e.getContestLessons().get(0).getContestLessonId())
                .title(e.getTitle())
                .description(e.getDescription())
                .programmingLanguage(e.getProgrammingLanguage())
                .difficulty(e.getDifficulty())
                .points(e.getPoints())
                .isPublished(Boolean.TRUE.equals(e.getIsPublished()))
                .timeLimitMs(e.getTimeLimitMs())
                .memoryLimitMb(e.getMemoryLimitMb())
                .slug(e.getSlug())
                .inputFormat(e.getInputFormat())
                .outputFormat(e.getOutputFormat())
                .constraintName(e.getConstraintName())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private QuizDTO mapQuiz(Quiz q) {
        if (q == null)
            return null;

        return QuizDTO.builder()
                .quizId(q.getId())
                .templateId(q.getTemplateId())
                .title(q.getTitle())
                .totalQuestions(q.getTotalQuestions())
                .passScore(q.getPassScore())
                .isPublished(Boolean.TRUE.equals(q.getIsPublished()))
                .maxAttempts(q.getMaxAttempts())
                .templateId(q.getTemplateId())
                .build();
    }

    // =========================
    // UPDATE TREE HELPERS
    // =========================

    private void syncModules(Course course, List<CourseModuleRequest> moduleRequests, User instructor) {
        if (moduleRequests == null)
            moduleRequests = List.of();

        Map<UUID, CourseModule> existing = new HashMap<>();
        for (CourseModule m : course.getModules()) {
            existing.put(m.getModuleId(), m);
        }

        List<CourseModule> newList = new ArrayList<>();

        for (CourseModuleRequest mr : moduleRequests) {
            UUID moduleId = mr.getModuleId();
            CourseModule module;

            if (moduleId != null && existing.containsKey(moduleId)) {
                module = existing.get(moduleId);
                existing.remove(moduleId); // Mark as kept
                module.setTitle(mr.getTitle());
                module.setDescription(mr.getDescription());
                module.setOrderIndex(mr.getOrderIndex());
                module.setDuration(mr.getDuration());
                module.setIsPublished(mr.getIsPublished());
                module.setSlug(mr.getSlug());
            } else {
                module = courseModuleRequestMapper.toEntity(mr);
                module.setCourse(course);
            }

            syncLessons(module, mr.getLessons(), instructor);
            newList.add(module);
        }

        // Cleanup student data for removed modules
        for (CourseModule removedModule : existing.values()) {
            cleanupStudentDataForModule(removedModule);
        }

        course.getModules().clear();
        course.getModules().addAll(newList);
    }

    private void cleanupStudentDataForModule(CourseModule module) {
        userAnswerRepository.deleteSelectedAnswerReferencesByModuleId(module.getModuleId());
        userAnswerRepository.deleteByModuleId(module.getModuleId());
        userQuizAttemptRepository.deleteByModuleId(module.getModuleId());

        for (CourseLesson lesson : module.getLessons()) {
            for (CodingExercise ex : lesson.getCodingExercises()) {
                codingSubmissionRepository.deleteByExerciseId(ex.getExerciseId());
            }
        }
    }

    private void syncLessons(CourseModule module, List<CourseLessonRequest> courseLessonRequests, User instructor) {
        if (courseLessonRequests == null)
            courseLessonRequests = List.of();

        Map<UUID, CourseLesson> existing = new HashMap<>();
        for (CourseLesson l : module.getLessons()) {
            existing.put(l.getLessonId(), l);
        }

        List<CourseLesson> newList = new ArrayList<>();

        for (CourseLessonRequest lr : courseLessonRequests) {
            UUID lessonId = lr.getLessonId();
            CourseLesson lesson;

            if (lessonId != null && existing.containsKey(lessonId)) {
                lesson = existing.get(lessonId);
            } else {
                lesson = new CourseLesson();
                lesson.setLessonId(null);
                lesson.setModule(module);
                lesson.setCreator(instructor);
            }

            if (lesson.getCreator() == null) {
                lesson.setCreator(instructor);
            }

            lesson.setTitle(lr.getTitle());
            lesson.setDescription(lr.getDescription());
            lesson.setLessonType(lr.getLessonType());
            lesson.setContent(lr.getContent());
            lesson.setVideoUrl(lr.getVideoUrl());
            lesson.setOrderIndex(lr.getOrderIndex());
            lesson.setIsPreview(Boolean.TRUE.equals(lr.getIsPreview()));
            lesson.setIsPublished(Boolean.TRUE.equals(lr.getIsPublished()));

            String lessonSlug = lr.getSlug();
            if (lessonSlug == null || lessonSlug.isBlank()) {
                String title = lr.getTitle() != null ? lr.getTitle() : "lesson";
                String baseSlug = slugify.slugify(title);
                lessonSlug = generateUniqueLessonSlug(baseSlug);
            }
            lesson.setSlug(lessonSlug);

            // === Xử lý YouTube Video URL ===
            if (lr.getVideoUrl() != null && !lr.getVideoUrl().isBlank()) {
                String ytVideoId = com.truongsonkmhd.unetistudy.common.YouTubeUtils
                        .extractVideoId(lr.getVideoUrl().trim());
                if (ytVideoId != null) {
                    lesson.setYoutubeVideoId(ytVideoId);
                    lesson.setVideoUrl(com.truongsonkmhd.unetistudy.common.YouTubeUtils.toEmbedUrl(ytVideoId)); // Lưu
                                                                                                                // embed
                                                                                                                // URL
                                                                                                                // trực
                                                                                                                // tiếp
                } else {
                    // Không phải YouTube URL hợp lệ - có thể báo lỗi hoặc bỏ qua
                    lesson.setVideoUrl(lr.getVideoUrl().trim());
                    lesson.setYoutubeVideoId(null);
                }
            }

            syncLessonExercises(lesson, lr.getExerciseTemplateIds());
            syncLessonQuizzes(lesson, lr.getQuizTemplateIds());

            newList.add(lesson);
        }

        module.getLessons().clear();
        module.getLessons().addAll(newList);
    }

    private void syncLessonExercises(CourseLesson lesson, List<UUID> exerciseTemplateIds) {
        if (exerciseTemplateIds == null)
            return;

        Set<UUID> newTemplateIds = new HashSet<>(exerciseTemplateIds);

        List<CodingExercise> toRemove = lesson.getCodingExercises().stream()
                .filter(ex -> ex.getTemplateId() == null || !newTemplateIds.contains(ex.getTemplateId()))
                .collect(Collectors.toList());

        for (CodingExercise ex : toRemove) {
            codingSubmissionRepository.deleteByExerciseId(ex.getExerciseId());
            lesson.removeCodingExercise(ex);
        }

        List<CodingExercise> orderedList = new ArrayList<>();
        Map<UUID, CodingExercise> remainingByTemplate = lesson.getCodingExercises().stream()
                .filter(ex -> ex.getTemplateId() != null)
                .collect(Collectors.toMap(CodingExercise::getTemplateId, ex -> ex, (a, b) -> a));

        for (UUID templateId : exerciseTemplateIds) {
            if (remainingByTemplate.containsKey(templateId)) {
                orderedList.add(remainingByTemplate.get(templateId));
            } else {
                codingExerciseTemplateRepository.findById(templateId).ifPresent(template -> {
                    CodingExercise exercise = template.toContestExercise();
                    exercise.setTemplateId(template.getTemplateId());
                    exercise.getCourseLessons().add(lesson);

                    orderedList.add(exercise);
                    template.incrementUsageCount();
                    codingExerciseTemplateRepository.save(template);
                });
            }
        }

        lesson.getCodingExercises().clear();
        lesson.getCodingExercises().addAll(orderedList);
    }

    private void syncLessonQuizzes(CourseLesson lesson, List<UUID> quizTemplateIds) {
        if (quizTemplateIds == null)
            return;
        Set<UUID> newTemplateIds = new HashSet<>(quizTemplateIds);

        List<Quiz> toRemove = lesson.getQuizzes().stream()
                .filter(q -> q.getTemplateId() == null || !newTemplateIds.contains(q.getTemplateId()))
                .collect(Collectors.toList());

        for (Quiz quiz : toRemove) {
            userAnswerRepository.deleteSelectedAnswerReferencesByQuizId(quiz.getId());
            userAnswerRepository.deleteByQuizId(quiz.getId());
            userQuizAttemptRepository.deleteByQuizId(quiz.getId());
            lesson.removeQuizQuestion(quiz);
        }

        List<Quiz> orderedList = new ArrayList<>();
        Map<UUID, Quiz> remainingByTemplate = lesson.getQuizzes().stream()
                .filter(q -> q.getTemplateId() != null)
                .collect(Collectors.toMap(Quiz::getTemplateId, q -> q, (a, b) -> a));

        for (UUID templateId : quizTemplateIds) {
            if (remainingByTemplate.containsKey(templateId)) {
                // Keep existing instance
                orderedList.add(remainingByTemplate.get(templateId));
            } else {
                // Add new instance from template
                quizTemplateRepository.findById(templateId).ifPresent(template -> {
                    Quiz quiz = template.toQuiz();
                    quiz.setTemplateId(template.getId());
                    quiz.getCourseLessons().add(lesson);

                    orderedList.add(quiz);
                    template.incrementUsageCount();
                    quizTemplateRepository.save(template);
                });
            }
        }

        // 5. Update the lesson's quizzes list
        lesson.getQuizzes().clear();
        lesson.getQuizzes().addAll(orderedList);
    }

    // =========================
    // SLUG
    // =========================

    public String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (courseRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    public String generateUniqueSlugForUpdate(String baseSlug, UUID courseId) {
        String slug = baseSlug;
        int counter = 1;

        while (true) {
            Optional<Course> found = courseRepository.findBySlug(slug);
            if (found.isEmpty())
                return slug;
            if (found.get().getCourseId().equals(courseId))
                return slug;

            slug = baseSlug + "-" + counter;
            counter++;
        }
    }

    private String generateUniqueLessonSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (lessonRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    // =========================
    // FILTER HELPERS
    // =========================
    private boolean isOnlyStudent(Set<Role> roles) {
        if (roles == null || roles.isEmpty())
            return true;
        return roles.stream()
                .allMatch(r -> com.truongsonkmhd.unetistudy.common.UserType.STUDENT.getValue().equals(r.getCode()));
    }

    private boolean allowPublished(Boolean flag) {
        return Boolean.TRUE.equals(flag);
    }

    private boolean allowLessonForStudent(CourseLesson l) {
        return Boolean.TRUE.equals(l.getIsPublished()) || Boolean.TRUE.equals(l.getIsPreview());
    }
}
