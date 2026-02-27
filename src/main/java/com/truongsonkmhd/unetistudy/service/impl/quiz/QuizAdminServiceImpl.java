package com.truongsonkmhd.unetistudy.service.impl.quiz;

import com.truongsonkmhd.unetistudy.cache.service.QuizCacheService;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizAdminDTO;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.Answer;
import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.repository.course.ContestLessonRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.AnswerRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuestionRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizQuestionRepository;
import com.truongsonkmhd.unetistudy.service.QuizAdminService;
import com.truongsonkmhd.unetistudy.repository.quiz.UserAnswerRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service quản lý Quiz với tích hợp Programmatic Caching sử dụng
 * QuizCacheService.
 * 
 * Ưu điểm:
 * 1. Kiểm soát luồng ghi dữ liệu (Write-Through) thông tin hơn.
 * 2. Invalidation chính xác cho từng đối tượng (Granular Invalidation).
 * 3. Dễ dàng debug và monitor thông qua log loader.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizAdminServiceImpl implements QuizAdminService {

    private final QuizQuestionRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ContestLessonRepository contestLessonRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;
    private final QuizCacheService quizCacheService;

    /**
     * Programmatic Cache Invalidation & Write-Through
     */
    @Override
    @Transactional
    public QuizAdminDTO.QuizResponse updateQuiz(UUID quizId, QuizAdminDTO.UpdateQuizRequest request) {
        log.info("Updating quiz: {} using programmatic cache", quizId);

        // Sử dụng Write-Through: Lưu DB và Cập nhật Cache trong cùng một flow
        Quiz updatedQuiz = quizCacheService.updateQuizWithCache(quizId, null, (ignored) -> {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            if (request.getTitle() != null)
                quiz.setTitle(request.getTitle());
            if (request.getPassScore() != null)
                quiz.setPassScore(request.getPassScore());
            if (request.getIsPublished() != null) {
                if (request.getIsPublished() && !validateQuizBeforePublish(quiz)) {
                    throw new RuntimeException("Quiz validation failed. Cannot publish.");
                }
                quiz.setIsPublished(request.getIsPublished());
            }
            if (request.getMaxAttempts() != null)
                quiz.setMaxAttempts(request.getMaxAttempts());
            return quizRepository.save(quiz);
        });

        List<Question> questions = questionRepository.findByQuizOrderByQuestionOrderAsc(updatedQuiz);
        return mapToQuizResponse(updatedQuiz, questions);
    }

    /**
     * Programmatic Invalidation
     */
    @Override
    @Transactional
    public void deleteQuiz(UUID quizId) {
        log.info("Deleting quiz: {} - Programmatic eviction", quizId);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quiz.getIsPublished()) {
            throw new RuntimeException("Cannot delete published quiz");
        }

        UUID contestLessonId = quiz.getContestLesson() != null ? quiz.getContestLesson().getContestLessonId() : null;

        // Clean up student data for the entire quiz
        userAnswerRepository.deleteSelectedAnswerReferencesByQuizId(quizId);
        userAnswerRepository.deleteByQuizId(quizId);
        userQuizAttemptRepository.deleteByQuizId(quizId);

        quizRepository.delete(quiz);

        // Chủ động xóa tất cả cache liên quan sau khi delete thành công
        quizCacheService.evictQuizAndRelated(quizId, contestLessonId);
    }

    /**
     * Cache-Aside Programmatic: Get one
     */
    @Override
    @Transactional(readOnly = true)
    public QuizAdminDTO.QuizResponse getQuizById(UUID quizId) {
        log.debug("Fetching quiz by ID: {} (Programmatic Cache)", quizId);

        return quizCacheService.getQuizResponseById(quizId, () -> {
            log.debug("Cache MISS - Executing DB Loader for quiz detail: {}", quizId);
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            List<Question> questions = questionRepository.findByQuizOrderByQuestionOrderAsc(quiz);
            return mapToQuizResponse(quiz, questions);
        });
    }

    /**
     * Cache-Aside Programmatic: Get all
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuizAdminDTO.QuizSummaryResponse> getAllQuizzes(UUID contestLessonId) {
        log.debug("Fetching quizzes for contest: {} (Programmatic Cache)", contestLessonId);

        return quizCacheService.getQuizzesByContestLesson(contestLessonId, () -> {
            log.debug("Cache MISS - Loading quiz list from DB");
            ContestLesson contestLesson = contestLessonRepository.findById(contestLessonId)
                    .orElseThrow(() -> new RuntimeException("Contest lesson not found"));

            return quizRepository.findByContestLessonAndIsPublishedTrue(contestLesson)
                    .stream()
                    .map(this::mapToQuizSummaryResponse)
                    .collect(Collectors.toList());
        });
    }

    /**
     * Programmatic Invalidation khi quản lý Question/Answer
     */
    @Override
    @Transactional
    public QuizAdminDTO.QuestionResponse addQuestion(QuizAdminDTO.AddQuestionRequest request) {
        log.info("Adding question - Invaliding quiz cache: {}", request.getQuizId());

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quiz.getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        if (request.getAnswers().stream().noneMatch(QuizAdminDTO.CreateAnswerRequest::getIsCorrect)) {
            throw new RuntimeException("Question must have at least one correct answer");
        }

        long questionCount = questionRepository.countByQuiz(quiz);
        int nextOrder = (int) questionCount + 1;

        Question question = Question.builder()
                .quiz(quiz)
                .content(request.getContent())
                .questionOrder(nextOrder)
                .timeLimitSeconds(request.getTimeLimitSeconds())
                .points(request.getPoints())
                .build();

        question = questionRepository.save(question);

        for (QuizAdminDTO.CreateAnswerRequest aReq : request.getAnswers()) {
            Answer answer = Answer.builder()
                    .question(question)
                    .content(aReq.getContent())
                    .answerOrder(aReq.getAnswerOrder())
                    .isCorrect(aReq.getIsCorrect())
                    .build();
            answerRepository.save(answer);
        }

        quiz.setTotalQuestions(quiz.getTotalQuestions() + 1);
        quizRepository.save(quiz);

        // Xóa cache vì Quiz đã thay đổi metadata (số câu hỏi) và danh sách câu hỏi
        quizCacheService.evictQuiz(quiz.getId());

        return mapToQuestionResponse(question);
    }

    @Override
    @Transactional
    public QuizAdminDTO.QuestionResponse updateQuestion(UUID questionId, QuizAdminDTO.UpdateQuestionRequest request) {
        log.info("Updating question - Invaliding question cache: {}", questionId);

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (question.getQuiz().getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        if (request.getContent() != null)
            question.setContent(request.getContent());
        if (request.getQuestionOrder() != null)
            question.setQuestionOrder(request.getQuestionOrder());
        if (request.getTimeLimitSeconds() != null)
            question.setTimeLimitSeconds(request.getTimeLimitSeconds());
        if (request.getPoints() != null)
            question.setPoints(request.getPoints());

        question = questionRepository.save(question);

        // Xóa cache danh sách câu hỏi của Quiz này
        quizCacheService.evictQuizQuestions(question.getQuiz().getId());

        return mapToQuestionResponse(question);
    }

    @Override
    @Transactional
    public void deleteQuestion(UUID questionId) {
        log.info("Deleting question - Invaliding quiz cache: {}", questionId);

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (question.getQuiz().getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        Quiz quiz = question.getQuiz();

        // Clean up student results for this question
        userAnswerRepository.deleteSelectedAnswerReferencesByQuestionId(questionId);
        userAnswerRepository.deleteByQuestionId(questionId);

        questionRepository.delete(question);

        quiz.setTotalQuestions(quiz.getTotalQuestions() - 1);
        quizRepository.save(quiz);

        List<Question> remainingQuestions = questionRepository.findByQuizOrderByQuestionOrderAsc(quiz);
        for (int i = 0; i < remainingQuestions.size(); i++) {
            remainingQuestions.get(i).setQuestionOrder(i + 1);
        }
        questionRepository.saveAll(remainingQuestions);

        // Đồng bộ lại Cache
        quizCacheService.evictQuiz(quiz.getId());
    }

    @Override
    @Transactional
    public QuizAdminDTO.AnswerResponse addAnswer(QuizAdminDTO.AddAnswerRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (question.getQuiz().getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        List<Answer> existingAnswers = answerRepository.findByQuestionOrderByAnswerOrderAsc(question);
        int nextOrder = existingAnswers.size() + 1;

        Answer answer = Answer.builder()
                .question(question)
                .content(request.getContent())
                .answerOrder(nextOrder)
                .isCorrect(request.getIsCorrect())
                .build();

        answer = answerRepository.save(answer);

        // Xóa cache câu hỏi vì đáp án đã thay đổi
        quizCacheService.evictQuizQuestions(question.getQuiz().getId());

        return mapToAnswerResponse(answer);
    }

    @Override
    @Transactional
    public QuizAdminDTO.AnswerResponse updateAnswer(UUID answerId, QuizAdminDTO.UpdateAnswerRequest request) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        if (answer.getQuestion().getQuiz().getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        if (request.getContent() != null)
            answer.setContent(request.getContent());
        if (request.getAnswerOrder() != null)
            answer.setAnswerOrder(request.getAnswerOrder());
        if (request.getIsCorrect() != null)
            answer.setIsCorrect(request.getIsCorrect());

        answer = answerRepository.save(answer);

        List<Answer> answers = answerRepository.findByQuestionOrderByAnswerOrderAsc(answer.getQuestion());
        if (answers.stream().noneMatch(Answer::getIsCorrect)) {
            throw new RuntimeException("Question must have at least one correct answer");
        }

        quizCacheService.evictQuizQuestions(answer.getQuestion().getQuiz().getId());

        return mapToAnswerResponse(answer);
    }

    @Override
    @Transactional
    public void deleteAnswer(UUID answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        if (answer.getQuestion().getQuiz().getIsPublished()) {
            throw new RuntimeException("Cannot modify published quiz");
        }

        Question question = answer.getQuestion();
        List<Answer> existingAnswers = answerRepository.findByQuestionOrderByAnswerOrderAsc(question);

        if (existingAnswers.size() <= 2) {
            throw new RuntimeException("Question must have at least 2 answers");
        }

        // Clean up selected answer references first
        userAnswerRepository.deleteSelectedAnswerReferences(answerId);

        answerRepository.delete(answer);

        List<Answer> remainingAnswers = answerRepository.findByQuestionOrderByAnswerOrderAsc(question);
        for (int i = 0; i < remainingAnswers.size(); i++) {
            remainingAnswers.get(i).setAnswerOrder(i + 1);
        }
        answerRepository.saveAll(remainingAnswers);

        quizCacheService.evictQuizQuestions(question.getQuiz().getId());
    }

    // ========================
    // HELPER METHODS
    // ========================

    private boolean validateQuizBeforePublish(Quiz quiz) {
        List<Question> questions = questionRepository.findByQuizOrderByQuestionOrderAsc(quiz);

        if (questions.isEmpty()) {
            return false;
        }

        for (Question question : questions) {
            List<Answer> answers = answerRepository.findByQuestionOrderByAnswerOrderAsc(question);
            if (answers.size() < 2)
                return false;
            if (answers.stream().noneMatch(Answer::getIsCorrect))
                return false;
        }

        return true;
    }

    private QuizAdminDTO.QuizResponse mapToQuizResponse(Quiz quiz, List<Question> questions) {
        return QuizAdminDTO.QuizResponse.builder()
                .quizId(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .totalQuestions(quiz.getTotalQuestions())
                .passScore(quiz.getPassScore())
                .isPublished(quiz.getIsPublished())
                .maxAttempts(quiz.getMaxAttempts())
                .contestLessonId(quiz.getContestLesson() != null ? quiz.getContestLesson().getContestLessonId() : null)
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .questions(questions.stream()
                        .map(this::mapToQuestionResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private QuizAdminDTO.QuestionResponse mapToQuestionResponse(Question question) {
        List<Answer> answers = answerRepository.findByQuestionOrderByAnswerOrderAsc(question);

        return QuizAdminDTO.QuestionResponse.builder()
                .questionId(question.getId())
                .content(question.getContent())
                .questionOrder(question.getQuestionOrder())
                .timeLimitSeconds(question.getTimeLimitSeconds())
                .points(question.getPoints())
                .answers(answers.stream()
                        .map(this::mapToAnswerResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private QuizAdminDTO.AnswerResponse mapToAnswerResponse(Answer answer) {
        return QuizAdminDTO.AnswerResponse.builder()
                .answerId(answer.getId())
                .content(answer.getContent())
                .answerOrder(answer.getAnswerOrder())
                .isCorrect(answer.getIsCorrect())
                .build();
    }

    private QuizAdminDTO.QuizSummaryResponse mapToQuizSummaryResponse(Quiz quiz) {
        return QuizAdminDTO.QuizSummaryResponse.builder()
                .quizId(quiz.getId())
                .title(quiz.getTitle())
                .totalQuestions(quiz.getTotalQuestions())
                .passScore(quiz.getPassScore())
                .isPublished(quiz.getIsPublished())
                .maxAttempts(quiz.getMaxAttempts())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }
}