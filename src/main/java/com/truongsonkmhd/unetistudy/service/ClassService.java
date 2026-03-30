package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.class_dto.ClassCourseRequest;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClassCourseResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClazzResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.CreateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface ClassService {
    ClazzResponse saveClass(CreateClazzRequest createClazzRequest);

    List<ClazzResponse> getALlClass();

    ClazzResponse regenerateInviteCode(UUID classId);

    void joinClass(String inviteCode, UUID studentId);

    ClazzResponse getClassByInviteCode(String inviteCode);

    List<UserResponse> getStudentsInClass(UUID classId);

    List<ClazzResponse> getMyClasses(UUID studentId);
    
    ClazzResponse findById(UUID classId);

    // ====== Class-Course Management ======
    /** Giáo viên gán nhiều khóa học bắt buộc vào lớp */
    List<ClassCourseResponse> addCoursesToClass(UUID classId, ClassCourseRequest request);

    /** Giáo viên gỡ 1 khóa học khỏi lớp */
    void removeCourseFromClass(UUID classId, UUID courseId);

    /** Lấy danh sách khóa học bắt buộc của lớp */
    List<ClassCourseResponse> getCoursesInClass(UUID classId);
}
