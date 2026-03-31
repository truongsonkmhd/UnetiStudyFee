package com.truongsonkmhd.unetistudy.repository.clazz;

import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassContestSubmissionRepository extends JpaRepository<ClassContestSubmission, UUID> {
    
    Optional<ClassContestSubmission> findByUserAndClassContestAndStatus(User user, ClassContest classContest, String status);
    
    List<ClassContestSubmission> findByUserAndClassContestOrderByStartedAtDesc(User user, ClassContest classContest);
    
    long countByUserAndClassContest(User user, ClassContest classContest);
}
