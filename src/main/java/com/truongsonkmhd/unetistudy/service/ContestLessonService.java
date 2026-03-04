package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonRequestDTO;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonResponseDTO;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonSummaryDTO;
import java.util.UUID;

public interface ContestLessonService {
        ContestLessonResponseDTO addContestLesson(ContestLessonRequestDTO request);

        ContestLessonResponseDTO getContestLessonById(UUID id);

        PageResponse<ContestLessonResponseDTO> searchContestLessons(
                        int page,
                        int size,
                        String q,
                        StatusContest statusContest);

        PageResponse<ContestLessonSummaryDTO> getPageReadyContestLessons(
                        int page,
                        int size,
                        String q);

        void publishContestLesson(UUID id);
}
