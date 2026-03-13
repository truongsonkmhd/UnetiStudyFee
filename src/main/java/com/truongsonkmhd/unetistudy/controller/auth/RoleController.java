package com.truongsonkmhd.unetistudy.controller.auth;

import com.truongsonkmhd.unetistudy.dto.role_dto.RoleRequest;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.RoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@Slf4j(topic = "ROLE-CONTROLLER")
@Tag(name = "role Controller")
@RequiredArgsConstructor
public class RoleController {

    RoleService roleService;

    @PostMapping("/create")
    ResponseEntity<IResponseMessage> create(@RequestBody RoleRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(roleService.create(request)));
    }

    @GetMapping
    ResponseEntity<IResponseMessage> getAll() {
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(roleService.getAll()));
    }

    @DeleteMapping("/{roleId}")
    ResponseEntity<IResponseMessage> delete(@PathVariable long roleId) {
        return ResponseEntity.ok().body(
                ResponseMessage.DeletedSuccess(roleService.delete(roleId)));
    }
}
