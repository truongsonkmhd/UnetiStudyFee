package com.truongsonkmhd.unetistudy.controller.auth;

import com.truongsonkmhd.unetistudy.dto.permission_dto.PermissionRequest;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.PermissionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/permissions")
@Slf4j(topic = "PERMISSION-CONTROLLER")
@Tag(name = "permission Controller")
@RequiredArgsConstructor
public class PermissionController {

    PermissionService permissionService;

    @PostMapping("/create")
    ResponseEntity<IResponseMessage> create(@RequestBody PermissionRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(permissionService.create(request)));
    }

    @PutMapping("/update/{permissionId}")
    ResponseEntity<IResponseMessage> update(@RequestBody PermissionRequest request, @PathVariable long permissionId) {
        return ResponseEntity.ok()
                .body(ResponseMessage.UpdatedSuccess(permissionService.update(permissionId, request)));
    }

    @GetMapping
    ResponseEntity<IResponseMessage> getAll() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(permissionService.getAll()));
    }

    @DeleteMapping("/{permissionId}")
    ResponseEntity<IResponseMessage> delete(@PathVariable long permissionId) {
        return ResponseEntity.ok().body(
                ResponseMessage.DeletedSuccess(permissionService.delete(permissionId)));
    }

}
