package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.contest_lesson.ClassContestResponse;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.CreateClassContestRequest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ClassContestService {
    ClassContestResponse createClassContest(CreateClassContestRequest request);

    List<ClassContestResponse> getAllClassContests();

    List<ClassContestResponse> getClassContests(UUID classId);

    List<ClassContestResponse> getOngoingContests(UUID classId);

    List<ClassContestResponse> getUpcomingContests(UUID classId);

    Boolean updateContestStatuses(UUID classId);

    ClassContestResponse cancelClassContest(UUID classContestId);

    ClassContestResponse rescheduleClassContest(
            UUID classContestId,
            Instant newStartTime,
            Instant newEndTime);

}
