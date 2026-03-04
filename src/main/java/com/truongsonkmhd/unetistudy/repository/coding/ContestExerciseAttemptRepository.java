package com.truongsonkmhd.unetistudy.repository.coding;

import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContestExerciseAttemptRepository extends JpaRepository<ContestExerciseAttempt, UUID> {
    // LẤY RA SỐ LẦN LÀM BÀI (Attempt) CỦA USER
    @Query("""
    SELECT cea
    FROM ContestExerciseAttempt cea
    WHERE cea.user.id = :userID 
      AND cea.exerciseID = :exerciseID
      AND cea.exerciseType = :exerciseType
      AND cea.attemptNumber = (
          SELECT MAX(c2.attemptNumber)
          FROM ContestExerciseAttempt c2
          WHERE c2.user.id = :userID AND c2.exerciseID = :exerciseID
      )
    """)
    ContestExerciseAttempt getAttemptInfoDTOByUserIDAndExerciseID(@Param("userID") UUID userID,
                                                                  @Param("exerciseID") UUID exerciseID,
                                                                  @Param("exerciseType") String exerciseType);


}
