package com.truongsonkmhd.unetistudy.repository;

import com.truongsonkmhd.unetistudy.model.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, UUID> {
    boolean existsByTeacherId(String teacherId);
}
