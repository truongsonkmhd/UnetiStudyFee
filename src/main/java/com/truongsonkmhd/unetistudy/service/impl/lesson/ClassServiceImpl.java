package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.dto.class_dto.ClassCourseRequest;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClassCourseResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClazzResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.CreateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.class_dto.UpdateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ClassContestResponse;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ClassInfo;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestInfo;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.EffectiveConfig;
import com.truongsonkmhd.unetistudy.mapper.user.UserResponseMapper;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.course.CourseEnrollment;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.exception.custom_exception.BusinessRuleException;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseEnrollmentRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.service.ClassService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassServiceImpl implements ClassService {

        private final ClassRepository classRepository;
        private final UserRepository userRepository;
        private final UserResponseMapper userResponseMapper;
        private final CourseRepository courseRepository;
        private final CourseEnrollmentRepository enrollmentRepository;

        private String generateInviteCode() {
                String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                StringBuilder sb = new StringBuilder();
                Random random = new Random();
                for (int i = 0; i < 8; i++) {
                        sb.append(chars.charAt(random.nextInt(chars.length())));
                }
                return sb.toString();
        }

        @Override
        public ClazzResponse saveClass(CreateClazzRequest createClazzRequest) {

                if (classRepository.findByClassCode(createClazzRequest.getClassCode()).isPresent()) {
                        throw new BusinessRuleException("Class code đã tồn tại!");
                }

                User user = userRepository.findById(createClazzRequest.getInstructorId())
                                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

                Clazz clazz = Clazz.builder()
                                .classCode(createClazzRequest.getClassCode())
                                .className(createClazzRequest.getClassName())
                                .instructor(user)
                                .startDate(createClazzRequest.getStartDate())
                                .endDate(createClazzRequest.getEndDate())
                                .maxStudents(createClazzRequest.getMaxStudents())
                                .inviteCode(generateInviteCode())
                                .build();

                Clazz clazzSaved = classRepository.save(clazz);

                return mapToResponse(clazzSaved);
        }

        @Override
        public ClazzResponse updateClass(UUID classId, UpdateClazzRequest updateClazzRequest) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));

                if (updateClazzRequest.getClassName() != null) {
                        clazz.setClassName(updateClazzRequest.getClassName());
                }
                if (updateClazzRequest.getInstructorId() != null) {
                        User instructor = userRepository.findById(updateClazzRequest.getInstructorId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
                        clazz.setInstructor(instructor);
                }
                if (updateClazzRequest.getStartDate() != null) {
                        clazz.setStartDate(updateClazzRequest.getStartDate());
                }
                if (updateClazzRequest.getEndDate() != null) {
                        clazz.setEndDate(updateClazzRequest.getEndDate());
                }
                if (updateClazzRequest.getMaxStudents() != null) {
                        clazz.setMaxStudents(updateClazzRequest.getMaxStudents());
                }
                if (updateClazzRequest.getIsActive() != null) {
                        clazz.setIsActive(updateClazzRequest.getIsActive());
                }

                Clazz saved = classRepository.save(clazz);
                return mapToResponse(saved);
        }

        @Override
        public List<ClazzResponse> getALlClass() {
                List<Clazz> classes = classRepository.findAll();

                return classes.stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public void deleteClass(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
                classRepository.delete(clazz);
        }

        @Override
        public ClazzResponse regenerateInviteCode(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
                clazz.setInviteCode(generateInviteCode());
                Clazz saved = classRepository.save(clazz);
                return mapToResponse(saved);
        }

        @Override
        @Transactional
        public void joinClass(String inviteCode, UUID studentId) {
                Clazz clazz = classRepository.findByInviteCode(inviteCode)
                                .orElseThrow(() -> new ResourceNotFoundException("Mã mời không chính xác"));

                if (clazz.getStudents().size() >= clazz.getMaxStudents()) {
                        throw new BusinessRuleException("Lớp học đã đầy!");
                }

                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin sinh viên"));

                clazz.addStudent(student);
                classRepository.save(clazz);

                // ---- Tự động enroll vào tất cả khóa học bắt buộc của lớp ----
                autoEnrollCoursesForStudent(student, clazz);
        }

        /**
         * Tự động tạo CourseEnrollment (APPROVED) cho student với tất cả required courses.
         * Skip nếu student đã enrolled (tránh duplicate).
         */
        private void autoEnrollCoursesForStudent(User student, Clazz clazz) {
                for (Course course : clazz.getRequiredCourses()) {
                        boolean alreadyEnrolled = enrollmentRepository
                                        .findByCourse_CourseIdAndStudent_Id(course.getCourseId(), student.getId())
                                        .isPresent();
                        if (!alreadyEnrolled) {
                                CourseEnrollment enrollment = CourseEnrollment.builder()
                                                .course(course)
                                                .student(student)
                                                .status(EnrollmentStatus.APPROVED)
                                                .approvedAt(Instant.now())
                                                .requestMessage("Auto-enrolled via class invite code")
                                                .build();
                                enrollmentRepository.save(enrollment);
                                // Cập nhật số lượng enrolled
                                course.setEnrolledCount(course.getEnrolledCount() + 1);
                                courseRepository.save(course);
                                log.info("[ClassService] Auto-enrolled student={} vào course={}",
                                                student.getId(), course.getCourseId());
                        }
                }
        }

        @Override
        public ClazzResponse getClassByInviteCode(String inviteCode) {
                Clazz clazz = classRepository.findByInviteCode(inviteCode)
                                .orElseThrow(() -> new ResourceNotFoundException("Mã mời không chính xác"));
                return mapToResponse(clazz);
        }

        @Override
        public List<com.truongsonkmhd.unetistudy.dto.user_dto.UserResponse> getStudentsInClass(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));

                return clazz.getStudents().stream()
                                .map(userResponseMapper::toDto)
                                .collect(Collectors.toList());
        }

        @Override
        public List<ClazzResponse> getMyClasses(UUID studentId) {
                return classRepository.findByStudents_Id(studentId).stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public ClazzResponse findById(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
                return mapToResponse(clazz);
        }

        // ======================================================
        // Class-Course Management
        // ======================================================

        @Override
        public List<ClassCourseResponse> addCoursesToClass(UUID classId, ClassCourseRequest request) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));

                List<Course> courses = courseRepository.findAllById(request.getCourseIds());
                if (courses.isEmpty()) {
                        throw new BusinessRuleException("Không tìm thấy khóa học nào hợp lệ");
                }

                courses.forEach(clazz::addRequiredCourse);
                classRepository.save(clazz);
                log.info("[ClassService] Gán {} khóa học vào lớp {}", courses.size(), classId);

                return courses.stream().map(this::mapCourseToResponse).toList();
        }

        @Override
        public void removeCourseFromClass(UUID classId, UUID courseId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

                clazz.removeRequiredCourse(course);
                classRepository.save(clazz);
                log.info("[ClassService] Gỡ khóa học {} khỏi lớp {}", courseId, classId);
        }

        @Override
        public List<ClassCourseResponse> getCoursesInClass(UUID classId) {
                Clazz clazz = classRepository.findById(classId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
                return clazz.getRequiredCourses().stream()
                                .map(this::mapCourseToResponse)
                                .toList();
        }

        private ClassCourseResponse mapCourseToResponse(Course course) {
                return ClassCourseResponse.builder()
                                .courseId(course.getCourseId())
                                .title(course.getTitle())
                                .slug(course.getSlug())
                                .imageUrl(course.getImageUrl())
                                .level(course.getLevel())
                                .category(course.getCategory())
                                .build();
        }

        private ClazzResponse mapToResponse(Clazz clazz) {
                User instructor = clazz.getInstructor();

                return ClazzResponse.builder()
                                .classId(clazz.getClassId())
                                .classCode(clazz.getClassCode())
                                .className(clazz.getClassName())
                                .inviteCode(clazz.getInviteCode())
                                .instructorId(instructor.getId())
                                .instructorName(instructor.getFullName())
                                .startDate(clazz.getStartDate())
                                .endDate(clazz.getEndDate())
                                .maxStudents(clazz.getMaxStudents())
                                .isActive(clazz.getIsActive())
                                .createdAt(clazz.getCreatedAt())
                                .updatedAt(clazz.getUpdatedAt())
                                .contests(
                                                clazz.getActiveContests().stream()
                                                                .map(this::mapContestToResponse)
                                                                .toList())
                                .build();
        }

        private ClassContestResponse mapContestToResponse(ClassContest classContest) {
                Clazz clazz = classContest.getClazz();
                ContestLesson contestLesson = classContest.getContestLesson();

                return ClassContestResponse.builder()
                                .classContestId(classContest.getClassContestId())
                                .classInfo(ClassInfo.builder()
                                                .classId(clazz.getClassId())
                                                .classCode(clazz.getClassCode())
                                                .className(clazz.getClassName())
                                                .instructorName(clazz.getInstructor().getFullName())
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
