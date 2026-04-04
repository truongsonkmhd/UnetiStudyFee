package com.truongsonkmhd.unetistudy.mapper.coding_submission;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CodingSubmissionMapper extends EntityMapper<CodingSubmissionResponseDTO, CodingSubmission> {


    // ENTITY -> DTO
    @Override
    CodingSubmissionResponseDTO toDto(CodingSubmission entity);

    // DTO -> ENTITY
    CodingSubmission toEntity(CodingSubmissionResponseDTO dto);

}

