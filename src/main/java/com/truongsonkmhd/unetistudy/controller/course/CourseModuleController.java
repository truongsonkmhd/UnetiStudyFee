package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleRequest;
import com.truongsonkmhd.unetistudy.service.CourseModuleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/course-module")
@Slf4j(topic = "COURSE-MODULE-CONTROLLER")
@Tag(name = "course module Controller")
@RequiredArgsConstructor
public class CourseModuleController {

    private final CourseModuleService lessonService;

    @GetMapping("/show-course-module")
    @Transactional
    ResponseEntity<IResponseMessage> getList() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(lessonService.getAllModule()));
    }

    @DeleteMapping("/delete/{id}")
    ResponseEntity<IResponseMessage> delete(@PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(lessonService.delete(id)));
    }

    @PutMapping("/update/{id}")
    ResponseEntity<IResponseMessage> update(@RequestBody CourseModuleRequest request, @PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(lessonService.update(id, request)));
    }

    @GetMapping("/hasSubmissions/{id}")
    ResponseEntity<IResponseMessage> hasSubmissions(@PathVariable UUID id) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(lessonService.hasSubmissions(id)));
    }

}
