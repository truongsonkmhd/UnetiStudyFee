package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;

import java.util.UUID;

public interface CodingExerciseService {

    CodingExercise getExerciseEntityByID(UUID exerciseId);

    UUID getLessonIDByExerciseID(UUID exerciseId);
}
