package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonRequestDTO;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonResponseDTO;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonSummaryDTO;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseTemplateRepository;
import com.truongsonkmhd.unetistudy.repository.course.ContestLessonRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizQuestionRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.QuizTemplateRepository;
import com.truongsonkmhd.unetistudy.service.ContestLessonService;
import com.truongsonkmhd.unetistudy.mapper.lesson.ContestCodingExerciseMapper;
import com.truongsonkmhd.unetistudy.mapper.lesson.QuizDTOMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestLessonServiceImpl implements ContestLessonService {

    private final ContestLessonRepository contestLessonRepository;
    private final CodingExerciseTemplateRepository templateRepository;
    private final QuizTemplateRepository quizTemplateRepository;
    private final CodingExerciseRepository codingExerciseRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    private final ContestCodingExerciseMapper codingExerciseMapper;
    private final QuizDTOMapper quizDTOMapper;

    @Override
    @Transactional
    public ContestLessonResponseDTO addContestLesson(ContestLessonRequestDTO request) {
        ContestLesson contestLesson = ContestLesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .defaultDurationMinutes(request.getDefaultDurationMinutes())
                .totalPoints(request.getTotalPoints())
                .defaultMaxAttempts(request.getDefaultMaxAttempts())
                .passingScore(request.getPassingScore())
                .showLeaderboardDefault(request.getShowLeaderboardDefault())
                .instructions(request.getInstructions())
                .status(StatusContest.DRAFT)
                .build();

        addCodingExercisesToContest(request.getExerciseTemplateIds(), contestLesson);
        addQuizToContest(request.getQuizTemplateIds(), contestLesson);

        contestLessonRepository.save(contestLesson);

        return mapToResponseDTO(contestLesson);
    }

    @Override
    @Transactional(readOnly = true)
    public ContestLessonResponseDTO getContestLessonById(UUID id) {
        ContestLesson contestLesson = contestLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contest lesson not found with id: " + id));
        return mapToResponseDTO(contestLesson);
    }

    private ContestLessonResponseDTO mapToResponseDTO(ContestLesson contestLesson) {
        return ContestLessonResponseDTO.builder()
                .contestLessonId(contestLesson.getContestLessonId())
                .title(contestLesson.getTitle())
                .description(contestLesson.getDescription())
                .defaultDurationMinutes(contestLesson.getDefaultDurationMinutes())
                .totalPoints(contestLesson.getTotalPoints())
                .defaultMaxAttempts(contestLesson.getDefaultMaxAttempts())
                .passingScore(contestLesson.getPassingScore())
                .showLeaderboardDefault(contestLesson.getShowLeaderboardDefault())
                .instructions(contestLesson.getInstructions())
                .status(contestLesson.getStatus())
                .codingExercises(contestLesson.getCodingExercises().stream()
                        .map(codingExerciseMapper::toDto)
                        .collect(Collectors.toList()))
                .quizzes(contestLesson.getQuizzes().stream()
                        .map(quizDTOMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContestLessonResponseDTO> searchContestLessons(
            int page,
            int size,
            String q,
            StatusContest statusContest) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<ContestLesson> result = contestLessonRepository.searchContestAdvance(q, statusContest,
                pageable);

        Page<ContestLessonResponseDTO> responsePage = result.map(this::mapToResponseDTO);

        return buildPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContestLessonSummaryDTO> getPageReadyContestLessons(
            int page,
            int size,
            String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<ContestLessonSummaryDTO> result = contestLessonRepository.findSummaryByStatus(q, StatusContest.READY,
                pageable);

        return buildPageResponse(result);
    }

    private <T> PageResponse<T> buildPageResponse(
            Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .build();
    }

    public void addCodingExercisesToContest(List<UUID> exerciseTemplateIds, ContestLesson contestLesson) {

        if (exerciseTemplateIds != null && !exerciseTemplateIds.isEmpty()) {
            List<CodingExerciseTemplate> templates = templateRepository
                    .findAllById(exerciseTemplateIds);

            for (CodingExerciseTemplate template : templates) {
                CodingExercise exercise = codingExerciseRepository.findByTemplateId(template.getTemplateId())
                        .orElseGet(() -> {
                            CodingExercise newEx = template.toContestExercise();
                            newEx.setTemplateId(template.getTemplateId());
                            return codingExerciseRepository.save(newEx);
                        });

                contestLesson.addCodingExercise(exercise);
                template.incrementUsageCount();
            }
        }
    }

    @Transactional
    public void addQuizToContest(List<UUID> quizTemplateIds, ContestLesson contestLesson) {

        if (quizTemplateIds == null || quizTemplateIds.isEmpty()) {
            return;
        }

        List<QuizTemplate> templates = quizTemplateRepository.findAllById(quizTemplateIds);

        templates.forEach(template -> {
            Quiz quiz = quizQuestionRepository.findByTemplateId(template.getId())
                    .orElseGet(() -> {
                        Quiz newQuiz = template.toQuiz();
                        newQuiz.setTemplateId(template.getId());
                        return quizQuestionRepository.save(newQuiz);
                    });
            contestLesson.addQuizQuestion(quiz);
            template.incrementUsageCount();
        });
    }

    @Override
    @Transactional
    public void publishContestLesson(UUID id) {
        ContestLesson contestLesson = contestLessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contest lesson not found with id: " + id));
        contestLesson.setStatus(StatusContest.READY);
        contestLessonRepository.save(contestLesson);
    }

}