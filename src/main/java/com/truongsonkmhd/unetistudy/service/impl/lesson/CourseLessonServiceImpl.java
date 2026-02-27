package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.github.slugify.Slugify;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseLessonResponse;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.exception.payload.DataNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.lesson.CourseLessonRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.lesson.CourseLessonResponseMapper;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.*;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseTemplateRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseLessonRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseModuleRepository;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizTemplateRepository;
import com.truongsonkmhd.unetistudy.service.CourseLessonService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service quản lý Course Lesson với tích hợp Caching
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside - @Cacheable cho getLessonByModuleId, findById
 * 2. Cache Invalidation - @CacheEvict cho add, update, delete
 * 3. Time-based Expiration - TTL 15 phút
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseLessonServiceImpl implements CourseLessonService {

    private final CourseLessonRepository courseLessonRepository;
    private final CourseLessonResponseMapper courseLessonResponseMapper;
    private final CourseLessonRequestMapper courseLessonRequestMapper;
    private final CourseModuleRepository courseModuleRepository;
    private final UserRepository userRepository;
    private final QuizTemplateRepository quizTemplateRepository;
    private final CodingExerciseTemplateRepository templateRepository;

    /**
     * Cache-Aside: Lấy lessons by moduleId
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.LESSON_BY_MODULE, key = "#moduleId", unless = "#result.isEmpty()")
    public List<CourseLessonResponse> getLessonByModuleId(UUID moduleId) {
        log.debug("Cache MISS - Loading lessons for module from DB: {}", moduleId);
        return courseLessonResponseMapper.toDto(courseLessonRepository.getLessonByModuleId(moduleId));
    }

    @Override
    public List<CourseLessonResponse> getLessonByModuleIDAndSlug(UUID moduleID, String slug) {
        return courseLessonResponseMapper.toDto(courseLessonRepository.getLessonByModuleIdAndSlug(moduleID, slug));
    }

    @Override
    public List<CourseLessonResponse> getLessonAll() {
        var listCourseLesson = courseLessonRepository.findAll();
        return courseLessonResponseMapper.toDto(listCourseLesson);
    }

    /**
     * Cache Invalidation: Xóa cache related lessons khi thêm lesson mới
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = { CacheConstants.LESSON_BY_MODULE,
            CacheConstants.COURSE_PUBLISHED_TREE }, allEntries = true)
    public CourseLessonResponse addLesson(CourseLessonRequest request) {
        log.info("Adding lesson to module: {} - Evicting cache", request.getModuleId());

        CourseModule existsCourseModule = courseModuleRepository
                .findById(request.getModuleId())
                .orElseThrow(() -> new DataNotFoundException(
                        "CourseModule not found: " + request.getModuleId()));

        User user = userRepository.findById(request.getCreatorId())
                .orElseThrow(() -> new DataNotFoundException(
                        "User not found: " + request.getCreatorId()));

        CourseLesson lesson = courseLessonRequestMapper.toEntity(request);
        lesson.setCreator(user);
        lesson.setModule(existsCourseModule);

        String lessonSlug = request.getSlug();
        if (lessonSlug == null || lessonSlug.isBlank()) {
            String title = request.getTitle() != null ? request.getTitle() : "lesson";
            String baseSlug = new Slugify().slugify(title);
            lessonSlug = generateUniqueSlug(baseSlug);
        }
        lesson.setSlug(lessonSlug);

        addCodingExercisesToLesson(request.getExerciseTemplateIds(), lesson);

        addQuizToContest(request.getQuizTemplateIds(), lesson);

        CourseLesson savedLesson = courseLessonRepository.save(lesson);

        log.info("Successfully saved lesson with ID: {}", savedLesson.getLessonId());

        return courseLessonResponseMapper.toDto(savedLesson);
    }

    @Transactional
    public void addQuizToContest(List<UUID> quizTemplateIds, CourseLesson courseLesson) {

        if (quizTemplateIds == null || quizTemplateIds.isEmpty()) {
            return;
        }

        List<QuizTemplate> templates = quizTemplateRepository.findAllById(quizTemplateIds);

        templates.forEach(template -> {
            Quiz quiz = template.toQuiz();
            quiz.setTemplateId(template.getId());
            courseLesson.addQuizQuestion(quiz);
            template.incrementUsageCount();
        });
    }

    @Transactional
    public void addCodingExercisesToLesson(List<UUID> exerciseTemplateIds, CourseLesson courseLesson) {

        if (exerciseTemplateIds != null && !exerciseTemplateIds.isEmpty()) {
            List<CodingExerciseTemplate> templates = templateRepository
                    .findAllById(exerciseTemplateIds);

            for (CodingExerciseTemplate template : templates) {
                CodingExercise contestExercise = template.toContestExercise();
                contestExercise.setTemplateId(template.getTemplateId());

                for (var templateTestCase : template.getTestCases()) {
                    ExerciseTestCase testCase = ExerciseTestCase.builder()
                            .input(templateTestCase.getInput())
                            .expectedOutput(templateTestCase.getExpectedOutput())
                            .isSample(templateTestCase.getIsSample())
                            .explanation(templateTestCase.getExplanation())
                            .orderIndex(templateTestCase.getOrderIndex())
                            .build();
                    contestExercise.addTestCase(testCase);
                }

                courseLesson.addCodingExercise(contestExercise);
                template.incrementUsageCount();
            }
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.LESSON_BY_ID, key = "#theId"),
            @CacheEvict(cacheNames = CacheConstants.LESSON_BY_MODULE, allEntries = true),
            @CacheEvict(cacheNames = CacheConstants.COURSE_PUBLISHED_TREE, allEntries = true)
    })
    public CourseLessonResponse update(UUID theId, CourseLessonRequest request) {
        log.info("Updating lesson: {} - Evicting cache", theId);

        CourseLesson existing = courseLessonRepository.findById(theId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseLesson not found with id = " + theId));

        courseLessonRequestMapper.partialUpdate(existing, request);

        CourseLesson updated = courseLessonRepository.save(existing);
        return courseLessonResponseMapper.toDto(updated);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.LESSON_BY_ID, key = "#theId"),
            @CacheEvict(cacheNames = CacheConstants.LESSON_BY_MODULE, allEntries = true),
            @CacheEvict(cacheNames = CacheConstants.COURSE_PUBLISHED_TREE, allEntries = true)
    })
    public UUID delete(UUID theId) {
        log.info("Deleting lesson: {} - Evicting cache", theId);
        courseLessonRepository.deleteById(theId);
        return theId;
    }

    /**
     * Cache-Aside: Lấy lesson by ID
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.LESSON_BY_ID, key = "#id", unless = "#result == null")
    public Optional<CourseLesson> findById(UUID id) {
        log.debug("Cache MISS - Loading lesson from DB: {}", id);
        return courseLessonRepository.findById(id);
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (courseLessonRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }
}