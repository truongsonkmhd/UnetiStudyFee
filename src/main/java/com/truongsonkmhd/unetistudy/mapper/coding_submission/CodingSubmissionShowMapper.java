package com.truongsonkmhd.unetistudy.mapper.coding_submission;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionShowDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CodingSubmissionShowMapper extends EntityMapper<CodingSubmissionShowDTO, CodingSubmission> {

    @Override
    @Mapping(source = "exercise.title", target = "exerciseName")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "verdict", target = "status")
    @Mapping(source = "passedTestcases", target = "testCasesPassed")
    @Mapping(source = "totalTestcases", target = "totalTestCases")
    CodingSubmissionShowDTO toDto(CodingSubmission entity);

    @Override
    @Mapping(source = "exerciseName", target = "exercise.title")
    @Mapping(source = "userName", target = "user.username")
    @Mapping(source = "status", target = "verdict")
    @Mapping(source = "testCasesPassed", target = "passedTestcases")
    @Mapping(source = "totalTestCases", target = "totalTestcases")
    CodingSubmission toEntity(CodingSubmissionShowDTO dto);
}
