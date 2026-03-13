package com.truongsonkmhd.unetistudy.controller.clazz;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/student/class")
@Slf4j(topic = "STUDENT-CLASS-CONTROLLER")
@Tag(name = "student class controller")
@RequiredArgsConstructor
public class StudentClassController {

    private final ClassService classService;

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

    @GetMapping("/my-classes")
    @Operation(summary = "Get all classes that a student has joined")
    public ResponseEntity<IResponseMessage> getMyClasses(@RequestParam UUID studentId) {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(classService.getMyClasses(studentId)));
    }
}
