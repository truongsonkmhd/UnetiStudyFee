package com.truongsonkmhd.unetistudy.controller;

import com.truongsonkmhd.unetistudy.dto.user_dto.UserPageResponse;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserResponse;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserPasswordRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.StudentCreateRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.TeacherCreateRequest;
import com.truongsonkmhd.unetistudy.dto.user_dto.UserUpdateRequest;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller")
@Slf4j(topic = "USER_CONTROLLER")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    // có 3 cách khởi tạo bind
    // c1: sử dụng toán tử new
    // c2 RequiredArgsConstructor
    UserService userService;
    // như ví dụ dưới (đỡ p viết dòng này:)
    /*
     * public UserController(UserService userService){
     * this.userService = userService;
     * }
     */
    // c3: sử dụng @Autowired
    /*
     * @Autowired
     * private final UserService userService;
     */

    @Operation(summary = "Get User Sorted", description = "API retrieve user sorted ")
    @GetMapping("/List")
    ResponseEntity<IResponseMessage> getAllUsersWithSortBy(@RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0", required = false) int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("Request get all users with sort by");

        UserPageResponse listAllUsersWithSortBy = userService.getAllUsersWithSortBy(sortBy, pageNo, pageSize);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(listAllUsersWithSortBy));
    }

    @Operation(summary = "Get User Sorted multiple column", description = "API retrieve user sorted multiple column")
    @GetMapping("/List_sort_multiple")
    ResponseEntity<IResponseMessage> getAllUsersWithSortByMultipleColumns(
            @RequestParam(required = false) List<String> sort,
            @RequestParam(defaultValue = "0", required = false) int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("Request get all of users with sort by multiple column");
        return ResponseEntity.ok().body(ResponseMessage
                .LoadedSuccess(userService.getAllUsersWithSortByMultipleColumns(pageNo, pageSize, sort)));

    }

    @Operation(summary = "Get user detail", description = "API retrieve user detail by ID from database")
    @GetMapping("/{userId}")
    public ResponseEntity<IResponseMessage> getUserDetail(@PathVariable UUID userId) {
        log.info("Get user detail by ID: {}", userId);
        UserResponse userDetailById = userService.findByIdResponse(userId);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(userDetailById));
    }

    @Operation(summary = "Create User", description = "API add new user to database (Legacy/Generic)")
    @PostMapping("/add")
    ResponseEntity<IResponseMessage> createUser(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(userService.saveUser(request)));
    }

    @Operation(summary = "Create Student", description = "API add new student to database")
    @PostMapping("/add-student")
    ResponseEntity<IResponseMessage> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(userService.saveStudent(request)));
    }

    @Operation(summary = "Create Teacher", description = "API add new teacher to database")
    @PostMapping("/add-teacher")
    ResponseEntity<IResponseMessage> createTeacher(@Valid @RequestBody TeacherCreateRequest request) {
        return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(userService.saveTeacher(request)));
    }

    @Operation(summary = "Update User", description = "API update user to database")
    @PutMapping("/upd/{userId}")
    ResponseEntity<IResponseMessage> updateUser(@PathVariable UUID userId, @RequestBody UserUpdateRequest request) {
        log.info("Updating user: {}", request);
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(userService.update(userId, request)));
    }

    @Operation(summary = "Deactivate User", description = "API deactivate (soft delete) user from database")
    @DeleteMapping("del/{userId}")
    ResponseEntity<IResponseMessage> deleteUser(@PathVariable("userId") UUID userId) {
        log.info("Deleting user: {}", userId);
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess(userService.delete(userId)));

    }

    @Operation(summary = "Change Password", description = "API change password user to database")
    @PatchMapping("/change-pwd")
    ResponseEntity<IResponseMessage> changePassword(@RequestBody UserPasswordRequest request) {
        log.info("Changing password for user: {}", request);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(userService.changePassword(request)));
    }

    @Operation(summary = "Promote to Teacher", description = "API promote a student to a teacher role")
    @PostMapping("/promote-teacher/{userId}")
    ResponseEntity<IResponseMessage> promoteToTeacher(@PathVariable UUID userId,
            @RequestBody com.truongsonkmhd.unetistudy.dto.user_dto.TeacherPromotionRequest request) {
        log.info("Promoting user {} to teacher", userId);
        userService.promoteToTeacher(userId, request.getTeacherId(), request.getDepartment(), request.getAcademicRank(), request.getSpecialization());
        return ResponseEntity.ok().body(ResponseMessage.UpdatedSuccess("User promoted to teacher successfully"));
    }

    @Operation(summary = "Search Users", description = "API search users by keyword (name, username, email, phone, studentId)")
    @GetMapping("/search")
    ResponseEntity<IResponseMessage> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Request search users by keyword: {}", keyword);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(userService.searchUsers(keyword, page, size)));
    }
}
