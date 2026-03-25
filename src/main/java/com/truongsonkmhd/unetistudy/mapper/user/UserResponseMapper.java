package com.truongsonkmhd.unetistudy.mapper.user;

import com.truongsonkmhd.unetistudy.dto.user_dto.UserResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.User;
import org.mapstruct.*;


@Mapper(componentModel = "spring")
public interface UserResponseMapper extends EntityMapper<UserResponse, User> {
    @Override
    @Mapping(target = "studentID", source = "studentProfile.studentId")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "classID", source = "studentProfile.classId")
    @Mapping(target = "teacherID", source = "teacherProfile.teacherId")
    @Mapping(target = "department", source = "teacherProfile.department")
    @Mapping(target = "academicRank", source = "teacherProfile.academicRank")
    @Mapping(target = "specialization", source = "teacherProfile.specialization")
//    @Mapping(target = "avatar" , source = "v")
    UserResponse toDto(User entity);

    @Override
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserResponse dto);
}
