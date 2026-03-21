package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionShowDTO;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;

import java.util.List;
import java.util.UUID;

public interface CodingSubmissionService {
    CodingSubmission save(CodingSubmission codingSubmission);

    List<CodingSubmissionShowDTO> getCodingSubmissionShowByUserName(String theUserName, UUID exerciseId);
    List<CodingSubmissionShowDTO> getCodingSubmissionShowByExerciseId(UUID exerciseId);

    CodingSubmission getSubmissionById(UUID id);
}
