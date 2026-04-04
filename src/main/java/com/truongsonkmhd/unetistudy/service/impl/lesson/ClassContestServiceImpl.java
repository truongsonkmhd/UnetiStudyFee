package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.common.ClassContestStatus;

import com.truongsonkmhd.unetistudy.dto.contest_lesson.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassContestRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.repository.course.ContestLessonRepository;
import com.truongsonkmhd.unetistudy.service.ClassContestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassContestServiceImpl implements ClassContestService {

        private final ClassContestRepository classContestRepository;
        private final ClassRepository classRepository;
        private final ContestLessonRepository contestLessonRepository;

        /**
         * Tạo lớp thi mới
         */
        @Override
        @Transactional
        public ClassContestResponse createClassContest(CreateClassContestRequest request) {
                log.info("Creating class contest for class: {} and contest: {}",
                                request.getClassId(), request.getContestLessonId());

                // 1. Validate và lấy Class
                Clazz clazz = classRepository.findById(request.getClassId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Class not found with id: " + request.getClassId()));

                if (!clazz.getIsActive()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST, "Cannot add contest to inactive class");
                }

                // 2. Validate và lấy ContestLesson
                ContestLesson contestLesson = contestLessonRepository.findById(request.getContestLessonId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Contest lesson not found with id: " + request.getContestLessonId()));

                // 3. Kiểm tra xem contest có sẵn sàng để gán không
                if (!contestLesson.canBeAssignedToClass()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Contest is not ready to be assigned. Current status: "
                                                        + contestLesson.getStatus());
                }

                // 4. Kiểm tra trùng lặp
                boolean exists = classContestRepository.existsByClazzAndContestLesson(clazz, contestLesson);
                if (exists) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "This contest is already assigned to this class");
                }

                // 5. Kiểm tra xung đột thời gian trong cùng lớp
                validateTimeConflict(clazz, request.getScheduledStartTime(), request.getScheduledEndTime(), null);

                // 6. Tạo ClassContest
                ClassContest classContest = ClassContest.builder()
                                .clazz(clazz)
                                .contestLesson(contestLesson)
                                .scheduledStartTime(request.getScheduledStartTime())
                                .scheduledEndTime(request.getScheduledEndTime())
                                .status(ClassContestStatus.SCHEDULED)
                                .weight(request.getWeight() != null ? request.getWeight() : 1.0)
                                .maxAttemptsOverride(request.getMaxAttemptsOverride())
                                .showLeaderboardOverride(request.getShowLeaderboardOverride())
                                .instructionsOverride(request.getInstructionsOverride())
                                .passingScoreOverride(request.getPassingScoreOverride())
                                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                                .build();

                // 7. Lưu vào database
                classContest = classContestRepository.save(classContest);

                log.info("Created class contest with id: {}", classContest.getClassContestId());

                // 8. Trả về response
                return mapToResponse(classContest);
        }

        @Override
        @Transactional(readOnly = true)
        public List<ClassContestResponse> getAllClassContests() {
                return classContestRepository.findAll().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Lấy danh sách contest của một lớp
         */
        @Override
        @Transactional(readOnly = true)
        public List<ClassContestResponse> getClassContests(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

                return classContestRepository.findByClazz(clazz).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Lấy contest đang diễn ra của lớp
         */
        @Override
        @Transactional(readOnly = true)
        public List<ClassContestResponse> getOngoingContests(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

                Instant now = Instant.now();
                return classContestRepository.findByClazz(clazz).stream()
                                .filter(cc -> cc.isOngoing(now))
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Lấy contest sắp tới của lớp
         */
        @Override
        @Transactional(readOnly = true)
        public List<ClassContestResponse> getUpcomingContests(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

                Instant now = Instant.now();
                return classContestRepository.findByClazz(clazz).stream()
                                .filter(cc -> cc.isUpcoming(now))
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Cập nhật trạng thái tự động dựa trên thời gian
         */
        @Override
        @Transactional
        public Boolean updateContestStatuses(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

                Instant now = Instant.now();
                List<ClassContest> contests = classContestRepository.findByClazz(clazz);

                contests.forEach(contest -> {
                        ClassContestStatus oldStatus = contest.getStatus();
                        contest.updateStatusBasedOnTime(now);

                        if (!oldStatus.equals(contest.getStatus())) {
                                log.info("Updated contest {} status from {} to {}",
                                                contest.getClassContestId(), oldStatus, contest.getStatus());
                        }
                });

                classContestRepository.saveAll(contests);

                return true;
        }

        /**
         * Hủy contest
         */
        @Override
        @Transactional
        public ClassContestResponse cancelClassContest(UUID classContestId) {
                ClassContest classContest = classContestRepository.findById(classContestId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Class contest not found with id: " + classContestId));

                classContest.cancel();
                classContest = classContestRepository.save(classContest);

                log.info("Cancelled class contest: {}", classContestId);
                return mapToResponse(classContest);
        }

        /**
         * Đổi lịch thi
         */
        @Override
        @Transactional
        public ClassContestResponse rescheduleClassContest(
                        UUID classContestId,
                        Instant newStartTime,
                        Instant newEndTime) {

                ClassContest classContest = classContestRepository.findById(classContestId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Class contest not found with id: " + classContestId));

                // Kiểm tra xung đột thời gian mới
                validateTimeConflict(
                                classContest.getClazz(),
                                newStartTime,
                                newEndTime,
                                classContestId);

                classContest.reschedule(newStartTime, newEndTime);
                classContest = classContestRepository.save(classContest);

                log.info("Rescheduled class contest: {}", classContestId);
                return mapToResponse(classContest);
        }

        /**
         * Kiểm tra xung đột thời gian
         */
        private void validateTimeConflict(
                        Clazz clazz,
                        Instant startTime,
                        Instant endTime,
                        UUID excludeContestId) {

                List<ClassContest> existingContests = classContestRepository
                                .findByClazzAndIsActiveTrue(clazz);

                for (ClassContest existing : existingContests) {
                        // Bỏ qua contest hiện tại nếu đang update
                        if (excludeContestId != null && existing.getClassContestId().equals(excludeContestId)) {
                                continue;
                        }

                        // Kiểm tra overlap
                        boolean hasOverlap = !(endTime.isBefore(existing.getScheduledStartTime()) ||
                                        startTime.isAfter(existing.getScheduledEndTime()));

                        if (hasOverlap) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "Time conflict with contest: "
                                                                + existing.getContestLesson().getTitle());
                        }
                }
        }

        /**
         * Map entity sang response DTO
         */
        private ClassContestResponse mapToResponse(ClassContest classContest) {
                Clazz clazz = classContest.getClazz();
                ContestLesson contestLesson = classContest.getContestLesson();

                return ClassContestResponse.builder()
                                .classContestId(classContest.getClassContestId())
                                .classInfo(ClassInfo.builder()
                                                .classId(clazz.getClassId())
                                                .classCode(clazz.getClassCode())
                                                .className(clazz.getClassName())
                                                .instructorName(clazz.getInstructor().getUsername())
                                                .build())
                                .contestInfo(ContestInfo.builder()
                                                .contestLessonId(contestLesson.getContestLessonId())
                                                .title(contestLesson.getTitle())
                                                .description(contestLesson.getDescription())
                                                .defaultTotalPoints(contestLesson.getTotalPoints())
                                                .codingExerciseCount(contestLesson.getCodingExercises().size())
                                                .quizQuestionCount(contestLesson.getQuizzes().size())
                                                .build())
                                .scheduledStartTime(classContest.getScheduledStartTime())
                                .scheduledEndTime(classContest.getScheduledEndTime())
                                .durationInMinutes(classContest.getDurationInMinutes())
                                .status(classContest.getStatus())
                                .isActive(classContest.getIsActive())
                                .weight(classContest.getWeight())
                                .effectiveConfig(EffectiveConfig.builder()
                                                .maxAttempts(classContest.getEffectiveMaxAttempts())
                                                .showLeaderboard(classContest.getEffectiveShowLeaderboard())
                                                .instructions(classContest.getEffectiveInstructions())
                                                .passingScore(classContest.getEffectivePassingScore())
                                                .totalPoints(classContest.getEffectiveTotalPoints())
                                                .build())
                                .createdAt(classContest.getCreatedAt())
                                .updatedAt(classContest.getUpdatedAt())
                                .build();
        }
}