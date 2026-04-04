package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import com.truongsonkmhd.unetistudy.service.CourseLessonService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/course-lesson")
@Slf4j(topic = "LESSON-CONTROLLER")
@Tag(name = "lesson Controller")
@RequiredArgsConstructor
public class CourseLessonController {

    private final CourseLessonService lessonService;

    @GetMapping("/getAll")
    @Transactional
    ResponseEntity<IResponseMessage> getList() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(lessonService.getLessonAll()));
    }

    @GetMapping("/getLessonByModuleId/{moduleId}")
    @Transactional
    ResponseEntity<IResponseMessage> getLessonByModuleId(@PathVariable UUID moduleId) {
        return ResponseEntity.ok()
                .body(ResponseMessage.LoadedSuccess(lessonService.getLessonByModuleId(moduleId)));
    }

    @GetMapping("/getLessonByModuleIDAndSlug/{slug}/{moduleId}")
    @Transactional
    ResponseEntity<IResponseMessage> getLessonByModuleId(@PathVariable UUID moduleId, @PathVariable String slug) {
        return ResponseEntity.ok()
                .body(ResponseMessage.LoadedSuccess(lessonService.getLessonByModuleIDAndSlug(moduleId, slug)));
    }

    @PostMapping("/add")
    ResponseEntity<IResponseMessage> addLesson(@RequestBody CourseLessonRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(lessonService.addLesson(request)));
    }

    @DeleteMapping("/delete{id}")
    ResponseEntity<IResponseMessage> delete(@PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(lessonService.delete(id)));
    }

    @PutMapping("/update/{id}")
    ResponseEntity<IResponseMessage> update(@RequestBody CourseLessonRequest request, @PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(lessonService.update(id, request)));
    }

    @GetMapping("/hasSubmissions/{id}")
    ResponseEntity<IResponseMessage> hasSubmissions(@PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(lessonService.hasSubmissions(id)));
    }

}
