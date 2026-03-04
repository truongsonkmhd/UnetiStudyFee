package com.truongsonkmhd.unetistudy.service.impl.Ai;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.AiLessonSuggestionDTO;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.model.lesson.LessonProgress;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonPrerequisiteRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonProgressRepository;
import com.truongsonkmhd.unetistudy.repository.course.QuizRepository;
import com.truongsonkmhd.unetistudy.service.AiLearningPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiLearningPathServiceImpl implements AiLearningPathService {

        private final LessonProgressRepository lessonProgressRepository;
        private final LessonPrerequisiteRepository lessonPrerequisiteRepository;
        private final QuizRepository quizAttemptRepository;
        private final CodingSubmissionRepository codingSubmissionRepository;
        private final CourseRepository courseRepository;

        @Override
        public List<AiLessonSuggestionDTO> suggestNextLessons(UUID userId, String courseSlug) {

                Course course = courseRepository.findBySlug(courseSlug)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                Map<UUID, LessonProgress> progressMap = lessonProgressRepository
                                .findByUserAndCourse(userId, course.getCourseId())
                                .stream()
                                .collect(Collectors.toMap(
                                                lp -> lp.getLesson().getLessonId(),
                                                lp -> lp));

                List<AiLessonSuggestionDTO> suggestions = new ArrayList<>();

                for (CourseModule module : course.getModules()) {
                        for (CourseLesson lesson : module.getLessons()) {

                                LessonProgress lp = progressMap.get(lesson.getLessonId());

                                // RULE 1: prerequisite chưa done
                                boolean prereqDone = lessonPrerequisiteRepository
                                                .findByLessonId(lesson.getLessonId())
                                                .stream()
                                                .allMatch(p -> progressMap
                                                                .containsKey(p.getPrerequisiteLesson().getLessonId())
                                                                && progressMap.get(
                                                                                p.getPrerequisiteLesson().getLessonId())
                                                                                .getStatus() == ProgressStatus.NOT_STARTED);

                                if (!prereqDone) {
                                        suggestions.add(AiLessonSuggestionDTO.builder()
                                                        .lessonId(lesson.getLessonId())
                                                        .lessonTitle(lesson.getTitle())
                                                        .reason("Chưa hoàn thành bài tiên quyết")
                                                        .priority(1)
                                                        .build());
                                        continue;
                                }

                                // RULE 2: quiz thấp
                                Double quizAvg = quizAttemptRepository.avgScore( lesson.getLessonId());
                                if (quizAvg != null && quizAvg < 0.6) {
                                        suggestions.add(AiLessonSuggestionDTO.builder()
                                                        .lessonId(lesson.getLessonId())
                                                        .lessonTitle(lesson.getTitle())
                                                        .reason("Quiz dưới 60%, nên ôn lại")
                                                        .priority(2)
                                                        .build());
                                }

                                // RULE 3: coding fail
                                Double acRate = codingSubmissionRepository.acRate(userId, lesson.getLessonId());
                                if (acRate != null && acRate < 0.7) {
                                        suggestions.add(AiLessonSuggestionDTO.builder()
                                                        .lessonId(lesson.getLessonId())
                                                        .lessonTitle(lesson.getTitle())
                                                        .reason("Bài code chưa ổn, cần luyện thêm")
                                                        .priority(3)
                                                        .build());
                                }

                                // RULE 4: bài mới
                                if (lp == null) {
                                        suggestions.add(AiLessonSuggestionDTO.builder()
                                                        .lessonId(lesson.getLessonId())
                                                        .lessonTitle(lesson.getTitle())
                                                        .reason("Bài học tiếp theo phù hợp")
                                                        .priority(4)
                                                        .build());
                                }
                        }
                }

                return suggestions.stream()
                                .sorted(Comparator.comparing(AiLessonSuggestionDTO::getPriority))
                                .limit(5)
                                .toList();
        }
}
