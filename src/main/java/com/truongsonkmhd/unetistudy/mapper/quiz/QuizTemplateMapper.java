package com.truongsonkmhd.unetistudy.mapper.quiz;

import com.truongsonkmhd.unetistudy.dto.quiz_dto.AnswerTemplateDTO;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuestionTemplateDTO;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import com.truongsonkmhd.unetistudy.model.quiz.*;
import com.truongsonkmhd.unetistudy.model.quiz.template.AnswerTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuestionTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class QuizTemplateMapper {

    public QuizTemplateDTO.Response toResponse(QuizTemplate template) {
        if (template == null)
            return null;

        return QuizTemplateDTO.Response.builder()
                .templateId(template.getId())
                .templateName(template.getTitle())
                .description(template.getDescription())
                .category(template.getCategory())
                .thumbnailUrl(template.getThumbnailUrl())
                .passScore(template.getPassScore())

                .isActive(template.getIsActive())
                .usageCount(template.getUsageCount())
                .totalQuestions(template.getQuestionTemplates() != null ? template.getQuestionTemplates().size() : 0)
                .createdBy(template.getCreatedBy())
                .version(template.getVersion())
                .maxAttempts(template.getMaxAttempts())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    public QuizTemplateDTO.DetailResponse toDetailResponse(QuizTemplate template) {
        if (template == null)
            return null;

        return QuizTemplateDTO.DetailResponse.builder()
                .templateId(template.getId())
                .templateName(template.getTitle())
                .description(template.getDescription())
                .category(template.getCategory())
                .thumbnailUrl(template.getThumbnailUrl())
                .passScore(template.getPassScore())

                .isActive(template.getIsActive())
                .usageCount(template.getUsageCount())
                .createdBy(template.getCreatedBy())
                .version(template.getVersion())
                .maxAttempts(template.getMaxAttempts())
                .questions(template.getQuestionTemplates() != null ? template.getQuestionTemplates().stream()
                        .map(this::toQuestionResponse)
                        .collect(Collectors.toList()) : null)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    private QuestionTemplateDTO.Response toQuestionResponse(QuestionTemplate question) {
        return QuestionTemplateDTO.Response.builder()
                .questionTemplateId(question.getId())
                .content(question.getContent())
                .questionOrder(question.getQuestionOrder())
                .timeLimitSeconds(question.getTimeLimitSeconds())
                .points(question.getPoints())
                .answers(question.getAnswerTemplates() != null ? question.getAnswerTemplates().stream()
                        .map(this::toAnswerResponse)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    private AnswerTemplateDTO.Response toAnswerResponse(AnswerTemplate answer) {
        return AnswerTemplateDTO.Response.builder()
                .answerTemplateId(answer.getId())
                .content(answer.getContent())
                .isCorrect(answer.getIsCorrect())
                .answerOrder(answer.getAnswerOrder())
                .build();
    }

    public QuizTemplate toEntity(QuizTemplateDTO.CreateRequest request, String createdBy) {
        QuizTemplate template = QuizTemplate.builder()
                .title(request.getTemplateName())
                .description(request.getDescription())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .passScore(request.getPassScore())
                .maxAttempts(request.getMaxAttempts())
                .createdBy(createdBy)
                .build();

        if (request.getQuestions() != null) {
            request.getQuestions().forEach(q -> {
                QuestionTemplate questionTemplate = toQuestionEntity(q);
                template.addQuestionTemplate(questionTemplate);

                if (q.getAnswers() != null) {
                    q.getAnswers().forEach(a -> {
                        AnswerTemplate answerTemplate = toAnswerEntity(a);
                        questionTemplate.addAnswerTemplate(answerTemplate);
                    });
                }
            });
        }

        return template;
    }

    private QuestionTemplate toQuestionEntity(QuestionTemplateDTO.CreateRequest request) {
        return QuestionTemplate.builder()
                .content(request.getContent())
                .questionOrder(request.getQuestionOrder())
                .timeLimitSeconds(request.getTimeLimitSeconds())
                .points(request.getPoints())
                .build();
    }

    private AnswerTemplate toAnswerEntity(AnswerTemplateDTO.CreateRequest request) {
        return AnswerTemplate.builder()
                .content(request.getContent())
                .isCorrect(request.getIsCorrect())
                .answerOrder(request.getAnswerOrder())
                .build();
    }

    // Convert template to actual Quiz
    public Quiz templateToQuiz(QuizTemplate template) {
        Quiz quiz = Quiz.builder()
                .title(template.getTitle())
                .description(template.getDescription())
                .totalQuestions(template.getQuestionTemplates().size())
                .passScore(template.getPassScore())

                .maxAttempts(template.getMaxAttempts())
                .category(template.getCategory())
                .thumbnailUrl(template.getThumbnailUrl())
                .templateId(template.getId())
                .isPublished(true)
                .build();

        template.getQuestionTemplates().forEach(qt -> {
            Question question = Question.builder()
                    .content(qt.getContent())
                    .questionOrder(qt.getQuestionOrder())
                    .timeLimitSeconds(qt.getTimeLimitSeconds())
                    .points(qt.getPoints())
                    .build();

            quiz.addQuestion(question);

            qt.getAnswerTemplates().forEach(at -> {
                Answer answer = Answer.builder()
                        .content(at.getContent())
                        .isCorrect(at.getIsCorrect())
                        .answerOrder(at.getAnswerOrder())
                        .build();
                question.addAnswer(answer);
            });
        });

        return quiz;
    }
}