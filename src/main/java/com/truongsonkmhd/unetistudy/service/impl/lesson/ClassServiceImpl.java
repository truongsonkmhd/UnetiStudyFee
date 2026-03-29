package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.dto.class_dto.ClazzResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.CreateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.class_dto.UpdateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ClassContestResponse;
import com.truongsonkmhd.unetistudy.mapper.user.UserResponseMapper;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.exception.custom_exception.BusinessRuleException;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.service.ClassService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
                return ClassContestResponse.builder()
                                .classContestId(classContest.getClassContestId())
                                .scheduledEndTime(classContest.getScheduledEndTime())
                                .scheduledStartTime(classContest.getScheduledStartTime())
                                .durationInMinutes(classContest.getDurationInMinutes())
                                .status(classContest.getStatus())
                                .isActive(classContest.getIsActive())
                                .weight(classContest.getWeight())
                                .createdAt(classContest.getCreatedAt())
                                .updatedAt(classContest.getUpdatedAt())
                                .build();
        }

}
