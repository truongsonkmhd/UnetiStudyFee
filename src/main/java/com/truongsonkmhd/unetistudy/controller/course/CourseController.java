package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseShowRequest;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.CourseTreeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;

import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@Slf4j(topic = "COURSE-CONTROLLER")
@Tag(name = "course Controller")
@RequiredArgsConstructor
public class CourseController {

    private final CourseTreeService courseTreeService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }

    @PostMapping(value = "/add", consumes = { "multipart/form-data" })
    @Transactional
    public ResponseEntity<IResponseMessage> addCourse(@ModelAttribute CourseShowRequest theCourse) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(courseTreeService.save(theCourse)));
    }

    @PutMapping(value = "/upd/{courseId}", consumes = { "multipart/form-data" })
    @Transactional
    public ResponseEntity<IResponseMessage> updateCourse(@PathVariable UUID courseId,
            @ModelAttribute CourseShowRequest theCourseRequest) {
        log.info("Updating course: {}", theCourseRequest);
        return ResponseEntity.ok()
                .body(ResponseMessage.UpdatedSuccess(courseTreeService.update(courseId, theCourseRequest)));
    }

    @DeleteMapping("/delete/{courseID}")
    @Transactional
    public ResponseEntity<IResponseMessage> deleteById(@PathVariable UUID courseID) {
        return ResponseEntity.ok().body(ResponseMessage.DeletedSuccess(courseTreeService.deleteById(courseID)));
    }

    @GetMapping("/getCourseById/{courseID}")
    @Transactional
    public ResponseEntity<IResponseMessage> getCourseByID(@PathVariable UUID courseID) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(courseTreeService.findById(courseID)));
    }

    @GetMapping("/{slug}/tree")
    public ResponseEntity<IResponseMessage> getCourseTreeForStudent(@PathVariable String slug) {
        return ResponseEntity.ok(
                ResponseMessage.LoadedSuccess(
                        courseTreeService.getCourseTreeDetailPublished(slug)));
    }

    @GetMapping("/getCourseBySlug/{theSlug}")
    @Transactional
    public ResponseEntity<IResponseMessage> getCourseByID(@PathVariable String theSlug) {
        return ResponseEntity.ok()
                .body(ResponseMessage.LoadedSuccess(courseTreeService.getCourseModuleByCourseSlug(theSlug)));
    }

    @GetMapping
    public ResponseEntity<IResponseMessage> getAllCourses(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(
                ResponseMessage.LoadedSuccess(courseTreeService.getAllCourses(page, size, q, status, category)));
    }

}
