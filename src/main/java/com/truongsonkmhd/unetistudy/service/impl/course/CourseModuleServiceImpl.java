package com.truongsonkmhd.unetistudy.service.impl.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleRequest;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleResponse;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.course.CourseModuleRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.course.CourseModuleResponseMapper;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseModuleRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import com.truongsonkmhd.unetistudy.service.CourseModuleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseModuleServiceImpl implements CourseModuleService {

    private final CourseModuleRepository courseModuleRepository;

    private final CourseModuleResponseMapper courseModuleResponseMapper;

    private final CourseModuleRequestMapper courseModuleRequestMapper;

    private final CodingSubmissionRepository codingSubmissionRepository;

    private final UserQuizAttemptRepository userQuizAttemptRepository;

    @Override
    public List<CourseModuleResponse> getAllModule() {
        var listCourseModule = courseModuleRepository.findAll();
        return courseModuleResponseMapper.toDto(listCourseModule);
    }

    @Override
    @Transactional
    public CourseModuleResponse update(UUID theId, CourseModuleRequest request) {
        CourseModule existing = courseModuleRepository.findById(theId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseModule not found with id = " + theId));
        courseModuleRequestMapper.partialUpdate(existing, request);
        CourseModule updated = courseModuleRepository.save(existing);
        return courseModuleResponseMapper.toDto(updated);
    }

    @Override
    public UUID delete(UUID theId) {
        courseModuleRepository.deleteById(theId);
        return theId;
    }

    @Override
    public boolean hasSubmissions(UUID moduleId) {
        log.debug("Checking if module {} has student submissions", moduleId);
        boolean hasCodingSubmissions = codingSubmissionRepository.existsByExerciseCourseLessonModuleModuleId(moduleId);
        if (hasCodingSubmissions)
            return true;
        return userQuizAttemptRepository.existsByQuizCourseLessonModuleModuleId(moduleId);
    }
}
