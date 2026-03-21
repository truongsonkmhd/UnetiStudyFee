package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.common.UserStatus;
import com.truongsonkmhd.unetistudy.common.UserType;
import com.truongsonkmhd.unetistudy.dto.user_dto.*;
import com.truongsonkmhd.unetistudy.exception.ErrorCode;
import com.truongsonkmhd.unetistudy.exception.custom_exception.InvalidDataException;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.user.UserRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.user.UserResponseMapper;
import com.truongsonkmhd.unetistudy.mapper.user.UserUpdateRequestMapper;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.TeacherProfile;
import com.truongsonkmhd.unetistudy.model.StudentProfile;
import com.truongsonkmhd.unetistudy.repository.auth.RoleRepository;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.TeacherProfileRepository;
import com.truongsonkmhd.unetistudy.repository.StudentProfileRepository;
import com.truongsonkmhd.unetistudy.security.MyUserDetail;
import com.truongsonkmhd.unetistudy.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.truongsonkmhd.unetistudy.utils.SortBuilder;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service quản lý User với tích hợp Caching
 */
@Service
@Slf4j(topic = "USER-SERVICE")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserResponseMapper userResponseMapper;
    private final UserRequestMapper userRequestMapper;
    private final UserUpdateRequestMapper userUpdateRequestMapper;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Override
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(MyUserDetail::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserPageResponse getAllUsersWithSortBy(String sortBy, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, SortBuilder.parse(sortBy));
        Page<User> users = userRepository.findAll(pageable);
        return getUserPageResponse(pageNo, pageSize, users);
    }

    @Override
    public UserPageResponse getAllUsersWithSortByMultipleColumns(int pageNo, int pageSize, List<String> sorts) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, SortBuilder.parse(sorts));
        Page<User> users = userRepository.findAll(pageable);
        return getUserPageResponse(pageNo, pageSize, users);
    }

    private UserPageResponse getUserPageResponse(int page, int pageSize, Page<User> userEntities) {
        log.info("Convert User Entity Page");
        List<UserResponse> userList = userEntities.stream()
                .map(userResponseMapper::toDto)
                .toList();

        UserPageResponse response = new UserPageResponse();
        response.setPageNumber(page);
        response.setPageSize(pageSize);
        response.setTotalElements(userEntities.getTotalElements());
        response.setTotalPages(userEntities.getTotalPages());
        response.setUsers(userList);
        return response;
    }

    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_ID, key = "#id", unless = "#result == null")
    public UserResponse findByIdResponse(UUID id) {
        return userResponseMapper.toDto(getUserEntity(id));
    }

    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #id", unless = "#result == null")
    public User findById(UUID id) {
        return getUserEntity(id);
    }

    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_USERNAME, key = "#username", unless = "#result == null")
    public User findByUsername(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserResponse findByEmail(String email) {
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse saveStudent(StudentCreateRequest req) {
        validateUniqueness(req.getUsername(), req.getEmail(), req.getStudentCode(), null);
        
        Set<String> roleCodes = resolveRoleCodes(Collections.singletonList(UserType.STUDENT.getValue()), req.getStudentCode(), null);
        List<Role> roles = roleRepository.findAllByCodes(roleCodes);
        validateAllRolesFound(roleCodes, roles);

        User user = buildNewUserFromBase(req, roles);
        User savedUser = userRepository.save(user);

        studentProfileRepository.save(StudentProfile.builder()
                .studentId(req.getStudentCode())
                .classId(req.getClassCode())
                .user(savedUser)
                .build());

        return userResponseMapper.toDto(savedUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse saveTeacher(TeacherCreateRequest req) {
        validateUniqueness(req.getUsername(), req.getEmail(), null, req.getTeacherID());

        Set<String> roleCodes = resolveRoleCodes(Collections.singletonList(UserType.TEACHER.getValue()), null, req.getTeacherID());
        List<Role> roles = roleRepository.findAllByCodes(roleCodes);
        validateAllRolesFound(roleCodes, roles);

        User user = buildNewUserFromBase(req, roles);
        User savedUser = userRepository.save(user);

        teacherProfileRepository.save(TeacherProfile.builder()
                .teacherId(req.getTeacherID())
                .department(req.getDepartment())
                .academicRank(req.getAcademicRank())
                .specialization(req.getSpecialization())
                .user(savedUser)
                .build());

        return userResponseMapper.toDto(savedUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse saveUser(@NonNull UserRequest req) {
        Set<String> inputRoleCodes = req.getRoleCodes();
        Set<String> roleCodes = new HashSet<>();

        // Chuẩn hóa role codes: loại bỏ ROLE_ prefix nếu có
        if (inputRoleCodes != null) {
            for (String code : inputRoleCodes) {
                String normalizedCode = code.startsWith("ROLE_") ? code : "ROLE_" + code;
                roleCodes.add(normalizedCode);
            }
        }

        // Tự động đồng bộ Role dựa trên thông tin Profile
        if (req.getStudentCode() != null && !req.getStudentCode().isBlank()) {
            roleCodes.add(UserType.STUDENT.getValue());
        }
        if (req.getTeacherID() != null && !req.getTeacherID().isBlank()) {
            roleCodes.add(UserType.TEACHER.getValue());
        }

        if (roleCodes.isEmpty()) {
            roleCodes.add(UserType.STUDENT.getValue());
        }

        List<Role> roles = roleRepository.findAllByCodes(roleCodes);

        if (roles.size() != roleCodes.size()) {
            Set<String> foundCodes = roles.stream()
                    .map(Role::getCode)
                    .collect(Collectors.toSet());
            Set<String> notFoundCodes = roleCodes.stream()
                    .filter(code -> !foundCodes.contains(code))
                    .collect(Collectors.toSet());

            throw new IllegalArgumentException("Roles not found: " + notFoundCodes);
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .gender(req.getGender())
                .birthday(req.getBirthday())
                .email(req.getEmail())
                .phone(req.getPhone())
                .username(req.getUserName())
                .password(passwordEncoder.encode(req.getPassword()))
                .currentResidence(req.getCurrentResidence())
                .contactAddress(req.getContactAddress())
                .status(UserStatus.ACTIVE)
                .isDeleted(false)
                .build();

        user.setRoles(new HashSet<>(roles));
        User savedUser = userRepository.save(user);

        // Lưu Profile tương ứng
        if (roleCodes.contains(UserType.STUDENT.getValue())) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .studentId(req.getStudentCode())
                    .classId(req.getClassCode())
                    .user(savedUser)
                    .build();
            studentProfileRepository.save(studentProfile);
        }

        if (roleCodes.contains(UserType.TEACHER.getValue())) {
            TeacherProfile teacherProfile = TeacherProfile.builder()
                    .teacherId(req.getTeacherID())
                    .department(req.getDepartment())
                    .academicRank(req.getAcademicRank())
                    .specialization(req.getSpecialization())
                    .user(savedUser)
                    .build();
            teacherProfileRepository.save(teacherProfile);
        }

        log.info("User has added successfully, userId={}", savedUser.getId());
        return userResponseMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#userId"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #userId"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_USERNAME, allEntries = true)
    })
    public UserResponse update(UUID userId, UserUpdateRequest req) {
        log.info("Updating user: {} - Evicting cache", userId);

        User user = getUserEntityNoCache(userId);

        // 1. Validate uniqueness for update
        validateUniquenessForExistingUser(user, req);

        // 2. Update user basic info
        userUpdateRequestMapper.partialUpdate(user, req);

        // 3. Update roles based on profiles
        Set<String> roleCodes = resolveRoleCodes(req.getRoles(), req.getStudentCode(), req.getTeacherID());
        if (!roleCodes.isEmpty()) {
            List<Role> roles = roleRepository.findAllByCodes(roleCodes);
            user.setRoles(new HashSet<>(roles));
        }

        // 4. Update Profiles
        handleProfileUpdate(user, req);

        User savedUser = userRepository.save(user);
        log.info("Updated user and profiles: {}", userId);

        return userResponseMapper.toDto(savedUser);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#req.id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #req.id")
    })
    public UUID changePassword(UserPasswordRequest req) {
        User user = getUserEntityNoCache(req.getId());
        if (req.getPassword().equals(req.getConfirmPassword())) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        userRepository.save(user);
        return user.getId();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_USERNAME, allEntries = true)
    })
    public UUID delete(UUID id) {
        User user = getUserEntityNoCache(id);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        return id;
    }

    private User getUserEntityNoCache(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getUserEntity(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public UUID findUserIDByUserName(String userName) {
        return userRepository.getUserIDByUserName(userName);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#userId"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #userId"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_USERNAME, allEntries = true)
    })
    public void promoteToTeacher(UUID userId, String teacherId, String department, String academic, String specialization) {
        User user = getUserEntityNoCache(userId);

        // 1️⃣ Remove student role
        user.getRoles().removeIf(r -> r.getCode().equalsIgnoreCase(UserType.STUDENT.getValue()));

        // 2️⃣ Add teacher role
        Role teacherRole = roleRepository.findByCode(UserType.TEACHER.getValue())
                .orElseThrow(() -> new ResourceNotFoundException("Role TEACHER not found"));
        if (!user.getRoles().contains(teacherRole)) {
            user.getRoles().add(teacherRole);
        }

        // 3️⃣ Remove StudentProfile reference to avoid ObjectDeletedException during save
        if (user.getStudentProfile() != null) {
            studentProfileRepository.delete(user.getStudentProfile());
            user.setStudentProfile(null);
        }

        // 4️⃣ Create and set TeacherProfile
        TeacherProfile profile = TeacherProfile.builder()
                .teacherId(teacherId)
                .department(department)
                .academicRank(academic)
                .specialization(specialization)
                .user(user)
                .build();
        user.setTeacherProfile(profile);

        // 5️⃣ Save user entity (cascades to TeacherProfile)
        userRepository.save(user);
    }
    @Override
    public UserPageResponse searchUsers(String keyword, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<User> users = userRepository.searchByKeyWord("%" + keyword.toLowerCase() + "%", pageable);
        return getUserPageResponse(pageNo, pageSize, users);
    }

    // ==================== HELPER METHODS (SOLID REFACTORING) ====================

    private void validateUniqueness(String username, String email, String studentCode, String teacherId) {
        if (userRepository.existsByUsername(username)) {
            throw new InvalidDataException("Tên đăng nhập đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
        }
        if (userRepository.existsByEmail(email)) {
            throw new InvalidDataException("Email đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
        }
        if (studentCode != null && !studentCode.isBlank()) {
            if (studentProfileRepository.existsByStudentId(studentCode)) {
                throw new InvalidDataException("Mã sinh viên đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
            }
        }
        if (teacherId != null && !teacherId.isBlank()) {
            if (teacherProfileRepository.existsByTeacherId(teacherId)) {
                throw new InvalidDataException("Mã giảng viên đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
            }
        }
    }

    private void validateUniquenessForNewUser(UserRequest req) {
        validateUniqueness(req.getUserName(), req.getEmail(), req.getStudentCode(), req.getTeacherID());
    }

    private User buildNewUserFromBase(BaseUserRequest req, List<Role> roles) {
        User user = User.builder()
                .fullName(req.getFullName())
                .gender(req.getGender())
                .birthday(req.getBirthday())
                .email(req.getEmail())
                .phone(req.getPhone())
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .currentResidence(req.getCurrentResidence())
                .contactAddress(req.getContactAddress())
                .status(UserStatus.ACTIVE)
                .isDeleted(false)
                .build();
        user.setRoles(new HashSet<>(roles));
        return user;
    }

    private StudentCreateRequest convertToStudentRequest(UserRequest req) {
        StudentCreateRequest student = new StudentCreateRequest();
        copyBaseFields(req, student);
        student.setStudentCode(req.getStudentCode());
        student.setClassCode(req.getClassCode());
        return student;
    }

    private TeacherCreateRequest convertToTeacherRequest(UserRequest req) {
        TeacherCreateRequest teacher = new TeacherCreateRequest();
        copyBaseFields(req, teacher);
        teacher.setTeacherID(req.getTeacherID());
        teacher.setDepartment(req.getDepartment());
        teacher.setAcademicRank(req.getAcademicRank());
        teacher.setSpecialization(req.getSpecialization());
        return teacher;
    }

    private void copyBaseFields(UserRequest source, BaseUserRequest target) {
        target.setFullName(source.getFullName());
        target.setUsername(source.getUserName());
        target.setEmail(source.getEmail());
        target.setPassword(source.getPassword());
        target.setPhone(source.getPhone());
        target.setBirthday(source.getBirthday());
        target.setGender(source.getGender());
        target.setContactAddress(source.getContactAddress());
        target.setCurrentResidence(source.getCurrentResidence());
    }

    private void validateUniquenessForExistingUser(User user, UserUpdateRequest req) {
        if (req.getUsername() != null && !req.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(req.getUsername())) {
                throw new InvalidDataException("Tên đăng nhập đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
            }
        }
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new InvalidDataException("Email đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
            }
        }
        if (req.getStudentCode() != null && !req.getStudentCode().isBlank()) {
            String currentId = user.getStudentProfile() != null ? user.getStudentProfile().getStudentId() : null;
            if (!req.getStudentCode().equals(currentId)) {
                if (studentProfileRepository.existsByStudentId(req.getStudentCode())) {
                    throw new InvalidDataException("Mã sinh viên đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
                }
            }
        }
        if (req.getTeacherID() != null && !req.getTeacherID().isBlank()) {
            String currentId = user.getTeacherProfile() != null ? user.getTeacherProfile().getTeacherId() : null;
            if (!req.getTeacherID().equals(currentId)) {
                if (teacherProfileRepository.existsByTeacherId(req.getTeacherID())) {
                    throw new InvalidDataException("Mã giảng viên đã tồn tại", ErrorCode.RESOURCE_CONFLICT);
                }
            }
        }
    }

    private Set<String> resolveRoleCodes(Collection<String> inputRoles, String studentCode, String teacherId) {
        Set<String> roleCodes = new HashSet<>();
        if (inputRoles != null) {
            for (String code : inputRoles) {
                roleCodes.add(code.startsWith("ROLE_") ? code : "ROLE_" + code);
            }
        }
        if (studentCode != null && !studentCode.isBlank()) {
            roleCodes.add(UserType.STUDENT.getValue());
        }
        if (teacherId != null && !teacherId.isBlank()) {
            roleCodes.add(UserType.TEACHER.getValue());
        }
        return roleCodes;
    }

    private void validateAllRolesFound(Set<String> requestedCodes, List<Role> foundRoles) {
        if (foundRoles.size() != requestedCodes.size()) {
            Set<String> foundCodes = foundRoles.stream().map(Role::getCode).collect(Collectors.toSet());
            Set<String> missing = requestedCodes.stream().filter(c -> !foundCodes.contains(c)).collect(Collectors.toSet());
            throw new IllegalArgumentException("Roles not found: " + missing);
        }
    }

    private User buildNewUser(UserRequest req, List<Role> roles) {
        User user = User.builder()
                .fullName(req.getFullName())
                .gender(req.getGender())
                .birthday(req.getBirthday())
                .email(req.getEmail())
                .phone(req.getPhone())
                .username(req.getUserName())
                .password(passwordEncoder.encode(req.getPassword()))
                .currentResidence(req.getCurrentResidence())
                .contactAddress(req.getContactAddress())
                .status(UserStatus.ACTIVE)
                .isDeleted(false)
                .build();
        user.setRoles(new HashSet<>(roles));
        return user;
    }

    private void handleProfileCreation(User user, UserRequest req) {
        if (req.getStudentCode() != null && !req.getStudentCode().isBlank()) {
            studentProfileRepository.save(StudentProfile.builder()
                    .studentId(req.getStudentCode())
                    .classId(req.getClassCode())
                    .user(user)
                    .build());
        }
        if (req.getTeacherID() != null && !req.getTeacherID().isBlank()) {
            teacherProfileRepository.save(TeacherProfile.builder()
                    .teacherId(req.getTeacherID())
                    .department(req.getDepartment())
                    .academicRank(req.getAcademicRank())
                    .specialization(req.getSpecialization())
                    .user(user)
                    .build());
        }
    }

    private void handleProfileUpdate(User user, UserUpdateRequest req) {
        // Handle Student Profile
        if (req.getStudentCode() != null && !req.getStudentCode().isBlank()) {
            StudentProfile profile = user.getStudentProfile() != null ? user.getStudentProfile() : new StudentProfile();
            profile.setStudentId(req.getStudentCode());
            profile.setClassId(req.getClassCode());
            profile.setUser(user);
            studentProfileRepository.save(profile);
            user.setStudentProfile(profile);
        }
        // Handle Teacher Profile
        if (req.getTeacherID() != null && !req.getTeacherID().isBlank()) {
            TeacherProfile profile = user.getTeacherProfile() != null ? user.getTeacherProfile() : new TeacherProfile();
            profile.setTeacherId(req.getTeacherID());
            profile.setDepartment(req.getDepartment());
            profile.setAcademicRank(req.getAcademicRank());
            profile.setSpecialization(req.getSpecialization());
            profile.setUser(user);
            teacherProfileRepository.save(profile);
            user.setTeacherProfile(profile);
        }
    }
}
