package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.common.AttemptStatus;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.*;
import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.model.quiz.UserAnswer;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import com.truongsonkmhd.unetistudy.service.QuizService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz")
@Slf4j(topic = "QUIZ-CONTROLLER")
@Tag(name = "quiz-controller")
@RequiredArgsConstructor
public class QuizController {

        private final QuizService quizService;

        @PostMapping("/{quizId}/start")
        public ResponseEntity<IResponseMessage> startQuiz(
                        @PathVariable UUID quizId) {
                UUID userID = UserContext.getUserID();

                UserQuizAttempt attempt = quizService.startQuizAttempt(userID, quizId);

                StartQuizResponse response = StartQuizResponse.builder()
                                .attemptId(attempt.getAttemptId())
                                .quizId(attempt.getQuiz().getId())
                                .quizTitle(attempt.getQuiz().getTitle())
                                .totalQuestions(attempt.getQuiz().getTotalQuestions())
                                .startedAt(attempt.getStartedAt())
                                .build();

                return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(response));
        }

        @GetMapping("/attempt/{attemptId}/next-question")
        public ResponseEntity<IResponseMessage> getNextQuestion(@PathVariable UUID attemptId) {
                Question question = quizService.getNextQuestion(attemptId);

                if (question == null) {
                        return ResponseEntity.ok().body(ResponseMessage.ok(null));
                }

                List<AnswerOption> answerOptions = question.getAnswers().stream()
                                .map(answer -> AnswerOption.builder()
                                                .answerId(answer.getId())
                                                .content(answer.getContent())
                                                .answerOrder(answer.getAnswerOrder())
                                                .build())
                                .sorted(Comparator.comparing(AnswerOption::getAnswerOrder))
                                .toList();
                QuestionResponse response = QuestionResponse.builder()
                                .questionId(question.getId())
                                .content(question.getContent())
                                .questionOrder(question.getQuestionOrder())
                                .timeLimitSeconds(question.getTimeLimitSeconds())
                                .answers(answerOptions)
                                .currentQuestion(question.getQuestionOrder())
                                .totalQuestions(question.getQuiz().getTotalQuestions())
                                .build();

                return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(response));
        }

        @PostMapping("/attempt/{attemptId}/submit-answer")
        public ResponseEntity<IResponseMessage> submitAnswer(
                        @PathVariable UUID attemptId,
                        @RequestBody SubmitAnswerRequest request) {

                UserAnswer userAnswer = quizService.submitAnswer(
                                attemptId,
                                request.getQuestionId(),
                                request.getSelectedAnswerIds(),
                                request.getTimeSpentSeconds());

                Question nextQuestion = quizService.getNextQuestion(attemptId);

                SubmitAnswerResponse response = SubmitAnswerResponse.builder()
                                .userAnswerId(userAnswer.getUserAnswerId())
                                .isCorrect(userAnswer.getIsCorrect())
                                .pointsEarned(userAnswer.getPointsEarned())
                                .isTimeout(userAnswer.getIsTimeout())
                                .hasNextQuestion(nextQuestion != null)
                                .build();

                return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(response));
        }

        @PostMapping("/attempt/{attemptId}/complete")
        public ResponseEntity<IResponseMessage> completeQuiz(
                        @PathVariable UUID attemptId) {

                quizService.completeQuizAttempt(attemptId);
                QuizResultResponse response = quizService.getQuizResult(attemptId);

                return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(response));
        }

        @GetMapping("/{quizId}/attempts")
        public ResponseEntity<IResponseMessage> getUserAttempts(
                        @PathVariable UUID quizId) {

                UUID userId = UserContext.getUserID();
                List<UserQuizAttempt> attempts = quizService.getUserAttempts(userId, quizId);

                List<QuizResultResponse> responses = attempts.stream()
                                .filter(attempt -> attempt.getStatus() == AttemptStatus.COMPLETED)
                                .map(attempt -> quizService.getQuizResult(attempt.getAttemptId()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(responses));
        }

        @GetMapping("/{quizId}")
        public ResponseEntity<IResponseMessage> getQuizById(@PathVariable UUID quizId) {
                return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(quizService.getQuizById(quizId)));
        }
}
