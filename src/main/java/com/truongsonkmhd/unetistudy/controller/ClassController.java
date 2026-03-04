package com.truongsonkmhd.unetistudy.controller;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.class_dto.CreateClazzRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserResponse;
import com.truongsonkmhd.unetistudy.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/class")
@Slf4j(topic = "CLASS-CONTROLLER")
@Tag(name = "class controller")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @PostMapping("/add")
    public ResponseEntity<IResponseMessage> createClass(@RequestBody CreateClazzRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(classService.saveClass(request)));
    }

    @GetMapping("/getAll")
    public ResponseEntity<IResponseMessage> getAllClasses() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getALlClass()));
    }

    @PostMapping("/{classId}/regenerate-invite-code")
    @Operation(summary = "Regenerate invite code for a class")
    public ResponseEntity<IResponseMessage> regenerateInviteCode(@PathVariable UUID classId) {
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(classService.regenerateInviteCode(classId)));
    }

    @PostMapping("/join")
    @Operation(summary = "Join a class using invite code")
    public ResponseEntity<IResponseMessage> joinClass(@RequestParam String inviteCode, @RequestParam UUID studentId) {
        classService.joinClass(inviteCode, studentId);
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess("Joined class successfully"));
    }

    @GetMapping("/get-by-invite-code")
    @Operation(summary = "Get class info by invite code")
    public ResponseEntity<IResponseMessage> getClassByInviteCode(@RequestParam String inviteCode) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getClassByInviteCode(inviteCode)));
    }

    @GetMapping("/{classId}/students")
    @Operation(summary = "Get list of students in a class")
    public ResponseEntity<IResponseMessage> getStudentsInClass(@PathVariable UUID classId) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getStudentsInClass(classId)));
    }

    @GetMapping("/my-classes")
    @Operation(summary = "Get all classes that a student has joined")
    public ResponseEntity<IResponseMessage> getMyClasses(@RequestParam UUID studentId) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getMyClasses(studentId)));
    }

}
