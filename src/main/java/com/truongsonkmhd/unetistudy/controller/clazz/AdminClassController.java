package com.truongsonkmhd.unetistudy.controller.clazz;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.class_dto.CreateClazzRequest;
import com.truongsonkmhd.unetistudy.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/class")
@Slf4j(topic = "ADMIN-CLASS-CONTROLLER")
@Tag(name = "admin class controller")
@RequiredArgsConstructor
public class AdminClassController {

    private final ClassService classService;

    @PostMapping("/add")
    @Operation(summary = "Create a new class")
    public ResponseEntity<IResponseMessage> createClass(@RequestBody CreateClazzRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(classService.saveClass(request)));
    }

    @GetMapping("/getAll")
    @Operation(summary = "Get all classes")
    public ResponseEntity<IResponseMessage> getAllClasses() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getALlClass()));
    }

    @PostMapping("/{classId}/regenerate-invite-code")
    @Operation(summary = "Regenerate invite code for a class")
    public ResponseEntity<IResponseMessage> regenerateInviteCode(@PathVariable UUID classId) {
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(classService.regenerateInviteCode(classId)));
    }

    @GetMapping("/{classId}/students")
    @Operation(summary = "Get list of students in a class")
    public ResponseEntity<IResponseMessage> getStudentsInClass(@PathVariable UUID classId) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getStudentsInClass(classId)));
    }
}
