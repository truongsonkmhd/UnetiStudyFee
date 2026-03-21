package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import com.truongsonkmhd.unetistudy.dto.progress_dto.CourseProgressSummaryResponse;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressResponse;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.model.lesson.LessonProgress;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseModuleRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonProgressRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonProgressServiceImpl implements LessonProgressService {

        private final LessonProgressRepository lessonProgressRepository;
        private final UserRepository userRepository;
        private final CourseRepository courseRepository;
        private final LessonRepository lessonRepository;
        private final CodingSubmissionRepository codingSubmissionRepository;
        private final UserQuizAttemptRepository userQuizAttemptRepository;

        @Override
        @Transactional
        public LessonProgressResponse updateProgress(UUID userId, LessonProgressRequest request) {
                log.info("Updating progress for user {} - course {} - lesson {}",
                                userId, request.getCourseId(), request.getLessonId());

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Course course = courseRepository.findById(request.getCourseId())
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                CourseLesson lesson = lessonRepository.findById(request.getLessonId())
                                .orElseThrow(() -> new RuntimeException("Lesson not found"));

                LessonProgress progress = lessonProgressRepository
                                .findByUserAndCourseAndLesson(userId, request.getCourseId(), request.getLessonId())
                                .orElse(LessonProgress.builder()
                                                .user(user)
                                                .course(course)
                                                .lesson(lesson)
                                                .build());

                if (progress.getStatus() != ProgressStatus.DONE) {
                    if (request.getStatus() == ProgressStatus.DONE) {
                        boolean canMarkDone = true;

                        // 1. Check all Coding Exercises
                        if (lesson.getCodingExercises() != null && !lesson.getCodingExercises().isEmpty()) {
                            for (CodingExercise ce : lesson.getCodingExercises()) {
                                UUID targetId = ce.getExerciseId();
                                List<CodingSubmission> submissions = codingSubmissionRepository
                                        .getCodingSubmissionShowByUserName(user.getUsername(), targetId);
                                
                                // Yêu cầu đạt ít nhất 50% số lượng test case vượt qua
                                boolean passedCoding = submissions.stream()
                                        .anyMatch(s -> {
                                            if (s.getVerdict() == SubmissionVerdict.ACCEPTED) return true;
                                            if (s.getTotalTestcases() != null && s.getTotalTestcases() > 0) {
                                                double ratio = (double) s.getPassedTestcases() / s.getTotalTestcases();
                                                return ratio >= 0.5;
                                            }
                                            return false;
                                        });
                                
                                if (!passedCoding) {
                                    canMarkDone = false;
                                    break;
                                }
                            }
                        }

                        // 2. Check all Quizzes
                        if (canMarkDone && lesson.getQuizzes() != null && !lesson.getQuizzes().isEmpty()) {
                            for (Quiz q : lesson.getQuizzes()) {
                                List<UserQuizAttempt> attempts = userQuizAttemptRepository
                                        .findByUserIdAndQuizOrderByCreatedAtDesc(userId, q);
                                
                                // Yêu cầu đạt ít nhất 50% số điểm (hoặc kết quả isPassed của hệ thống)
                                boolean passedQuiz = attempts.stream()
                                        .anyMatch(a -> (a.getPercentage() != null && a.getPercentage() >= 50.0) || Boolean.TRUE.equals(a.getIsPassed()));
                                
                                if (!passedQuiz) {
                                    canMarkDone = false;
                                    break;
                                }
                            }
                        }

                        // 3. Optional Bonus Check: If lesson has video, ensure sufficient watch percent (Optional: frontend normally sends watchedPercent = 100 for code/quiz only, so we skip heavy video math, fallback to request's watchPercent context unless 0)
                        
                        progress.setStatus(canMarkDone ? ProgressStatus.DONE : ProgressStatus.IN_PROGRESS);
                    } else {
                        progress.setStatus(request.getStatus());
                    }
                }

                if (progress.getStatus() != ProgressStatus.DONE ||
                                (request.getCompletionPercent() != null
                                                && request.getCompletionPercent() > progress.getCompletionPercent())) {
                        progress.setCompletionPercent(
                                        request.getCompletionPercent() != null ? request.getCompletionPercent() : 0);
                }

                progress.setTimeSpentSec(request.getTimeSpentSec() != null ? request.getTimeSpentSec() : 0);
                progress.setLastAccessAt(Instant.now());

                progress = lessonProgressRepository.save(progress);

                return mapToResponse(progress);
        }

        @Override
        @Transactional(readOnly = true)
        public List<LessonProgressResponse> getCourseProgress(UUID userId, UUID courseId) {
                log.info("Getting course progress for user {} - course {}", userId, courseId);

                List<LessonProgress> progressList = lessonProgressRepository.findByUserAndCourse(userId, courseId);

                return progressList.stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public CourseProgressSummaryResponse getCourseSummary(UUID userId, UUID courseId) {
                log.info("Getting course summary for user {} - course {}", userId, courseId);

                // Get course
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                // Get all lessons in the course
                List<CourseLesson> allLessons = lessonRepository.findByCourseId(courseId);
                int totalLessons = allLessons.size();

                // Get user's progress
                List<LessonProgress> progressList = lessonProgressRepository.findByUserAndCourse(userId, courseId);

                // Count by status
                long completedCount = progressList.stream()
                                .filter(p -> p.getStatus() == ProgressStatus.DONE)
                                .count();

                long inProgressCount = progressList.stream()
                                .filter(p -> p.getStatus() == ProgressStatus.IN_PROGRESS)
                                .count();

                int notStartedCount = totalLessons - progressList.size();

                // Calculate completion percentage
                double completionPercentage = totalLessons > 0
                                ? (completedCount * 100.0 / totalLessons)
                                : 0.0;

                // Get last accessed lesson
                var lastAccessed = lessonProgressRepository.findLastAccessedLesson(userId, courseId);

                CourseProgressSummaryResponse.CourseProgressSummaryResponseBuilder builder = CourseProgressSummaryResponse
                                .builder()
                                .courseId(courseId)
                                .courseSlug(course.getSlug())
                                .totalLessons(totalLessons)
                                .completedLessons((int) completedCount)
                                .inProgressLessons((int) inProgressCount)
                                .notStartedLessons(notStartedCount)
                                .completionPercentage(completionPercentage);

                // Add last accessed lesson info if exists
                if (lastAccessed.isPresent()) {
                        LessonProgress lp = lastAccessed.get();
                        CourseLesson lesson = lp.getLesson();
                        CourseModule module = lesson.getModule();

                        builder.lastAccessedLessonId(lesson.getLessonId())
                                        .lastAccessedLessonSlug(lesson.getSlug())
                                        .lastAccessedLessonTitle(lesson.getTitle())
                                        .lastAccessedModuleSlug(module != null ? module.getSlug() : null);
                }

                return builder.build();
        }

        @Override
        @Transactional(readOnly = true)
        public LessonProgressResponse getLessonProgress(UUID userId, UUID courseId, UUID lessonId) {
                log.info("Getting lesson progress for user {} - course {} - lesson {}",
                                userId, courseId, lessonId);

                return lessonProgressRepository.findByUserAndCourseAndLesson(userId, courseId, lessonId)
                                .map(this::mapToResponse)
                                .orElse(null);
        }

        private LessonProgressResponse mapToResponse(LessonProgress progress) {
                CourseLesson lesson = progress.getLesson();

                return LessonProgressResponse.builder()
                                .progressId(progress.getProgressId())
                                .userId(progress.getUser().getId())
                                .courseId(progress.getCourse().getCourseId())
                                .lessonId(lesson.getLessonId())
                                .lessonTitle(lesson.getTitle())
                                .lessonSlug(lesson.getSlug())
                                .status(progress.getStatus())
                                .watchedPercent(progress.getCompletionPercent())
                                .timeSpentSec(progress.getTimeSpentSec())
                                .lastAccessAt(progress.getLastAccessAt())
                                .createdAt(progress.getCreatedAt())
                                .updatedAt(progress.getUpdatedAt())
                                .build();
        }
}
