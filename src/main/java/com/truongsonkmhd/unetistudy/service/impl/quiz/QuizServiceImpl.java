package com.truongsonkmhd.unetistudy.service.impl.quiz;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.service.ScoreWriteBehindService;
import com.truongsonkmhd.unetistudy.common.AttemptStatus;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.Answer;
import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.model.quiz.UserAnswer;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizResultResponse;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuestionResult;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.AnswerDetail;
import com.truongsonkmhd.unetistudy.repository.quiz.*;
import com.truongsonkmhd.unetistudy.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý Quiz attempts với tích hợp Caching
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside - Cache câu hỏi và đáp án
 * 2. Write-Behind - Ghi điểm thi async để giảm tải DB
 * 3. Time-based Expiration - TTL cho questions cache
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizServiceImpl implements QuizService {

        private final QuizQuestionRepository quizRepository;
        private final QuestionRepository questionRepository;
        private final AnswerRepository answerRepository;
        private final UserQuizAttemptRepository attemptRepository;
        private final UserAnswerRepository userAnswerRepository;
        private final ScoreWriteBehindService scoreWriteBehindService;
        private final com.truongsonkmhd.unetistudy.service.LessonProgressService lessonProgressService;

        @Override
        @Transactional
        public UserQuizAttempt startQuizAttempt(UUID userId, UUID quizId) {
                Quiz quiz = getQuizCached(quizId);

                if (!quiz.getIsPublished()) {
                        throw new RuntimeException("Quiz is not published");
                }

                if (quiz.getMaxAttempts() != null && quiz.getMaxAttempts() > 0) {
                        long attemptCount = attemptRepository.countByUserIdAndQuiz(userId, quiz);
                        if (attemptCount >= quiz.getMaxAttempts()) {
                                throw new RuntimeException("Maximum attempts reached for this quiz ("
                                                + quiz.getMaxAttempts() + ")");
                        }
                }

                UserQuizAttempt attempt = UserQuizAttempt.builder()
                                .userId(userId)
                                .quiz(quiz)
                                .startedAt(Instant.now())
                                .status(AttemptStatus.IN_PROGRESS)
                                .build();

                return attemptRepository.save(attempt);
        }

        /**
         * Cache-Aside: Lấy quiz từ cache hoặc DB
         */
        @Cacheable(cacheNames = CacheConstants.QUIZ_BY_ID, key = "'entity:' + #quizId", unless = "#result == null")
        public Quiz getQuizCached(UUID quizId) {
                log.debug("Cache MISS - Loading quiz entity from DB: {}", quizId);
                return quizRepository.findById(quizId)
                                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        }

        /**
         * Cache-Aside: Lấy questions của quiz từ cache
         */
        @Override
        @Transactional(readOnly = true)
        public Question getNextQuestion(UUID attemptId) {
                log.debug("Getting next question for attempt: {}", attemptId);

                UserQuizAttempt attempt = attemptRepository.findById(attemptId)
                                .orElseThrow(() -> new RuntimeException("Attempt not found"));

                Set<UUID> answeredQuestionIds = attempt.getUserAnswers().stream()
                                .map(ua -> ua.getQuestion().getId())
                                .collect(Collectors.toSet());

                List<Question> questions = getQuestionsCached(attempt.getQuiz().getId());

                return questions.stream()
                                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                                .findFirst()
                                .orElse(null);
        }

        /**
         * Cache-Aside: Lấy danh sách questions từ cache
         */
        @Cacheable(cacheNames = CacheConstants.QUIZ_QUESTIONS, key = "'list:' + #quizId")
        public List<Question> getQuestionsCached(UUID quizId) {
                log.debug("Cache MISS - Loading questions from DB for quiz: {}", quizId);
                Quiz quiz = quizRepository.findById(quizId)
                                .orElseThrow(() -> new RuntimeException("Quiz not found"));
                return questionRepository.findByQuizOrderByQuestionOrderAsc(quiz);
        }

        @Override
        @Transactional
        public UserAnswer submitAnswer(UUID attemptId, UUID questionId,
                        Set<UUID> selectedAnswerIds,
                        Integer timeSpentSeconds) {
                UserQuizAttempt attempt = attemptRepository.findById(attemptId)
                                .orElseThrow(() -> new RuntimeException("Attempt not found"));

                Question question = questionRepository.findById(questionId)
                                .orElseThrow(() -> new RuntimeException("Question not found"));

                boolean isTimeout = question.getTimeLimitSeconds() != null && question.getTimeLimitSeconds() > 0
                                && timeSpentSeconds > question.getTimeLimitSeconds();

                Set<Answer> selectedAnswers = new HashSet<>();
                if (selectedAnswerIds != null && !selectedAnswerIds.isEmpty()) {
                        selectedAnswers = new HashSet<>(answerRepository.findAllById(selectedAnswerIds));
                }

                Set<UUID> correctAnswerIds = question.getAnswers().stream()
                                .filter(Answer::getIsCorrect)
                                .map(Answer::getId)
                                .collect(Collectors.toSet());

                boolean isCorrect = !isTimeout && correctAnswerIds.equals(selectedAnswerIds);
                double pointsEarned = isCorrect ? question.getPoints() : 0.0;

                UserAnswer userAnswer = UserAnswer.builder()
                                .attempt(attempt)
                                .question(question)
                                .selectedAnswers(selectedAnswers)
                                .isCorrect(isCorrect)
                                .pointsEarned(pointsEarned)
                                .timeSpentSeconds(timeSpentSeconds)
                                .isTimeout(isTimeout)
                                .build();

                attempt.addUserAnswer(userAnswer);
                return userAnswerRepository.save(userAnswer);
        }

        /**
         * Write-Behind: Hoàn thành quiz và ghi điểm
         * Điểm được ghi vào cache ngay lập tức
         * Background thread sẽ flush vào DB định kỳ
         */
        @Override
        @Transactional
        public UserQuizAttempt completeQuizAttempt(UUID attemptId) {
                log.info("Completing quiz attempt: {}", attemptId);

                UserQuizAttempt attempt = attemptRepository.findById(attemptId)
                                .orElseThrow(() -> new RuntimeException("Attempt not found"));

                // Tính điểm
                double totalScore = attempt.getUserAnswers().stream()
                                .mapToDouble(UserAnswer::getPointsEarned)
                                .sum();

                List<Question> questions = getQuestionsCached(attempt.getQuiz().getId());
                double totalPossiblePoints = questions.stream()
                                .mapToDouble(Question::getPoints)
                                .sum();

                double percentage = totalPossiblePoints > 0
                                ? (totalScore / totalPossiblePoints) * 100
                                : 0.0;

                Double passScoreThreshold = attempt.getQuiz().getPassScore();
                if (passScoreThreshold == null) {
                        passScoreThreshold = 50.0;
                }

                boolean isPassed = percentage >= passScoreThreshold;

                attempt.setScore(totalScore);
                attempt.setTotalPoints(totalPossiblePoints);
                attempt.setPercentage(percentage);
                attempt.setIsPassed(isPassed);
                attempt.setCompletedAt(Instant.now());
                attempt.setStatus(AttemptStatus.COMPLETED);

                // Update Lesson Progress for all lessons containing this quiz
                if (isPassed && attempt.getQuiz().getCourseLessons() != null) {
                        for (CourseLesson lesson : attempt.getQuiz().getCourseLessons()) {
                                try {
                                        if (lesson.getModule() != null && lesson.getModule().getCourse() != null) {
                                                lessonProgressService.updateProgress(attempt.getUserId(),
                                                                com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest
                                                                                .builder()
                                                                                .courseId(lesson.getModule().getCourse()
                                                                                                .getCourseId())
                                                                                .lessonId(lesson.getLessonId())
                                                                                .status(com.truongsonkmhd.unetistudy.common.ProgressStatus.DONE)
                                                                                .watchedPercent(100)
                                                                                .timeSpentSec(0)
                                                                                .build());
                                        }
                                } catch (Exception e) {
                                        log.error("Failed to update lesson progress after quiz completion for lesson: "
                                                        + lesson.getLessonId(), e);
                                }
                        }
                }

                // Lưu vào DB ngay (vì cần ID)
                UserQuizAttempt savedAttempt = attemptRepository.save(attempt);

                // Write-Behind: Ghi vào cache để tracking và analytics
                // Có thể dùng cho việc aggregate scores sau
                scoreWriteBehindService.recordScore(savedAttempt);

                log.info("Quiz attempt completed: attemptId={}, score={}, passed={}",
                                attemptId, totalScore, isPassed);

                return savedAttempt;
        }

        @Override
        @Transactional(readOnly = true)
        public List<UserQuizAttempt> getUserAttempts(UUID userId, UUID quizId) {
                Quiz quiz = getQuizCached(quizId);
                return attemptRepository.findByUserIdAndQuizOrderByCreatedAtDesc(userId, quiz);
        }

        @Override
        @Transactional(readOnly = true)
        public QuizDTO getQuizById(UUID quizId) {
                Quiz quiz = getQuizCached(quizId);
                List<Question> questions = getQuestionsCached(quiz.getId());
                double totalPoints = questions.stream().mapToDouble(Question::getPoints).sum();

                return QuizDTO.builder()
                                .quizId(quiz.getId())
                                .title(quiz.getTitle())
                                .totalQuestions(quiz.getTotalQuestions())
                                .passScore(quiz.getPassScore())
                                .isPublished(quiz.getIsPublished())
                                .maxAttempts(quiz.getMaxAttempts())
                                .totalPoints(totalPoints)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public QuizResultResponse getQuizResult(UUID attemptId) {
                UserQuizAttempt attempt = attemptRepository.findById(attemptId)
                                .orElseThrow(() -> new RuntimeException("Attempt not found"));

                List<QuestionResult> questionResults = attempt.getUserAnswers().stream()
                                .map(userAnswer -> {
                                        List<AnswerDetail> answerDetails = userAnswer.getQuestion()
                                                        .getAnswers().stream()
                                                        .map(answer -> AnswerDetail.builder()
                                                                        .answerId(answer.getId())
                                                                        .content(answer.getContent())
                                                                        .isCorrect(answer.getIsCorrect())
                                                                        .isSelected(userAnswer.getSelectedAnswers()
                                                                                        .contains(answer))
                                                                        .build())
                                                        .collect(Collectors.toList());

                                        return QuestionResult.builder()
                                                        .questionId(userAnswer.getQuestion().getId())
                                                        .questionContent(userAnswer.getQuestion().getContent())
                                                        .isCorrect(userAnswer.getIsCorrect())
                                                        .pointsEarned(userAnswer.getPointsEarned())
                                                        .maxPoints(userAnswer.getQuestion().getPoints())
                                                        .timeSpentSeconds(userAnswer.getTimeSpentSeconds())
                                                        .isTimeout(userAnswer.getIsTimeout())
                                                        .answers(answerDetails)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                int totalQuestionsCount = attempt.getQuiz().getTotalQuestions();
                int correctlyAnsweredCount = (int) attempt.getUserAnswers().stream().filter(UserAnswer::getIsCorrect)
                                .count();
                int incorrectlyAnsweredCount = attempt.getUserAnswers().size() - correctlyAnsweredCount;

                return QuizResultResponse.builder()
                                .attemptId(attempt.getAttemptId())
                                .score(attempt.getScore())
                                .totalPoints(attempt.getTotalPoints())
                                .percentage(attempt.getPercentage())
                                .isPassed(attempt.getIsPassed())
                                .startedAt(attempt.getStartedAt())
                                .completedAt(attempt.getCompletedAt())
                                .totalQuestions(totalQuestionsCount)
                                .correctAnswers(correctlyAnsweredCount)
                                .incorrectAnswers(incorrectlyAnsweredCount)
                                .questionResults(questionResults)
                                .build();
        }
}