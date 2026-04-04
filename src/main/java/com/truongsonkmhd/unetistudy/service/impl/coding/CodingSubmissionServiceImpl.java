package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionShowDTO;
import com.truongsonkmhd.unetistudy.mapper.coding_submission.CodingSubmissionShowMapper;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.service.CodingSubmissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodingSubmissionServiceImpl implements CodingSubmissionService {
    private final CodingSubmissionRepository codingSubmissionRepository;

    private final CodingSubmissionShowMapper codingSubmissionShowMapper;

    @Override
    public CodingSubmission getSubmissionById(UUID id) {
        return codingSubmissionRepository.findByIdEntity(id)
                .orElseThrow(() -> new RuntimeException("Submisson not found: " + id));
    }

    @Override
    @Transactional
    public CodingSubmission save(CodingSubmission codingSubmission) {
        return codingSubmissionRepository.save(codingSubmission);
    }

    @Override
    public List<CodingSubmissionShowDTO> getCodingSubmissionShowByUserName(String theUserName, UUID exerciseId) {
        return codingSubmissionShowMapper
                .toDto(codingSubmissionRepository.getCodingSubmissionShowByUserName(theUserName, exerciseId));
    }

    @Override
    public List<CodingSubmissionShowDTO> getCodingSubmissionShowByExerciseId(UUID exerciseId) {
        return codingSubmissionShowMapper
                .toDto(codingSubmissionRepository.getCodingSubmissionShowByExerciseId(exerciseId));
    }
}
