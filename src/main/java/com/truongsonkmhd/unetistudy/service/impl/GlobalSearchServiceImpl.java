package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.dto.a_custom.GlobalSearchResponse;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClassQuickSearchResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseQuickSearchResponse;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.service.GlobalSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlobalSearchServiceImpl implements GlobalSearchService {

    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;

    @Override
    public GlobalSearchResponse quickSearch(String q, int limit) {
        if (q == null || q.trim().isEmpty()) {
            return GlobalSearchResponse.builder()
                    .courses(List.of())
                    .classes(List.of())
                    .build();
        }

        String searchKeyword = q.trim();
        PageRequest pageRequest = PageRequest.of(0, limit);

        // Gọi song song 2 task tìm kiếm
        CompletableFuture<List<CourseQuickSearchResponse>> coursesFuture = CompletableFuture.supplyAsync(() -> {
            log.debug("Searching courses for: {}", searchKeyword);
            return courseRepository.instantSearch(searchKeyword, true, null, pageRequest);
        });

        CompletableFuture<List<ClassQuickSearchResponse>> classesFuture = CompletableFuture.supplyAsync(() -> {
            log.debug("Searching classes for: {}", searchKeyword);
            return classRepository.instantSearch(searchKeyword, pageRequest);
        });

        // Chờ cả 2 hoàn thành
        CompletableFuture.allOf(coursesFuture, classesFuture).join();

        try {
            return GlobalSearchResponse.builder()
                    .courses(coursesFuture.get())
                    .classes(classesFuture.get())
                    .build();
        } catch (Exception e) {
            log.error("Error during global quick search", e);
            throw new RuntimeException("Lỗi trong quá trình tìm kiếm tổng hợp: " + e.getMessage());
        }
    }
}
