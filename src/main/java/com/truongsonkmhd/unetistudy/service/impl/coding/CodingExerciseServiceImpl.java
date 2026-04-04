package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.repository.coding.CodingExerciseRepository;
import com.truongsonkmhd.unetistudy.service.CodingExerciseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class CodingExerciseServiceImpl implements CodingExerciseService {

    private final CodingExerciseRepository codingExerciseRepository;

    @Override
    public CodingExercise getExerciseEntityByID(UUID exerciseId) {
        return codingExerciseRepository.getExerciseEntityById(exerciseId);
    }

    @Override
    public UUID getLessonIDByExerciseID(UUID exerciseId) {
        List<UUID> lessonIds = codingExerciseRepository.getLessonIDByExerciseID(exerciseId);
        return (lessonIds == null || lessonIds.isEmpty()) ? null : lessonIds.get(0);
    }

}
