package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.common.UserStatus;
import com.truongsonkmhd.unetistudy.common.UserType;
import com.truongsonkmhd.unetistudy.dto.user_dto.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.mapper.user.UserRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.user.UserResponseMapper;
import com.truongsonkmhd.unetistudy.mapper.user.UserUpdateRequestMapper;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.TeacherProfile;
import com.truongsonkmhd.unetistudy.repository.auth.RoleRepository;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.TeacherProfileRepository;
import com.truongsonkmhd.unetistudy.security.MyUserDetail;
import com.truongsonkmhd.unetistudy.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside (Lazy Loading) - @Cacheable cho findById, findByUsername
 * 2. Cache Invalidation - @CacheEvict cho update, delete, changePassword
 * 3. Time-based Expiration - TTL 15 phút (cấu hình trong CacheConfiguration)
 * 4. LRU Eviction - Khi cache đầy, loại bỏ entries ít dùng nhất
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
        List<UserResponse> userList = userEntities.stream().map(entity -> UserResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .gender(entity.getGender())
                .birthday(entity.getBirthday())
                .username(entity.getUsername())
                .phone(entity.getPhone())
                .classID(entity.getClassId())
                .currentResidence(entity.getCurrentResidence())
                .contactAddress(entity.getContactAddress())
                .studentID(entity.getStudentId())
                .email(entity.getEmail())
                .build()).toList();

        UserPageResponse response = new UserPageResponse();
        response.setPageNumber(page);
        response.setPageSize(pageSize);
        response.setTotalElements(userEntities.getTotalElements());
        response.setTotalPages(userEntities.getTotalPages());
        response.setUsers(userList);
        return response;
    }

    /**
     * Cache-Aside: Lấy UserResponse by ID
     * Cache key: userId
     * TTL: 15 phút (cấu hình mặc định)
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_ID, key = "#id", unless = "#result == null")
    public UserResponse findByIdResponse(UUID id) {
        log.debug("Cache MISS - Loading user from DB: {}", id);
        return userResponseMapper.toDto(getUserEntity(id));
    }

    /**
     * Cache-Aside: Lấy User entity by ID
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #id", unless = "#result == null")
    public User findById(UUID id) {
        log.debug("Cache MISS - Loading user entity from DB: {}", id);
        return getUserEntity(id);
    }

    /**
     * Cache-Aside: Lấy User by username
     * Cache key: username
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.USER_BY_USERNAME, key = "#username", unless = "#result == null")
    public User findByUsername(String username) {
        log.debug("Cache MISS - Loading user by username from DB: {}", username);
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserResponse findByEmail(String email) {
        return null;
    }

    /**
     * Tạo user mới - không cần cache vì là dữ liệu mới
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse saveUser(UserRequest req) {
        Set<String> roleCodes = req.getRoleCodes();

        if (roleCodes == null || roleCodes.isEmpty()) {
            roleCodes = Set.of(UserType.STUDENT.getValue());
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
                .classId(req.getClassID())
                .studentId(req.getStudentID())
                .currentResidence(req.getCurrentResidence())
                .contactAddress(req.getContactAddress())
                .status(UserStatus.ACTIVE)
                .isDeleted(false)
                .build();

        user.setRoles(new HashSet<>(roles));
        User savedUser = userRepository.save(user);

        log.info("User has added successfully, userId={}", savedUser.getId());
        return userResponseMapper.toDto(savedUser);
    }

    /**
     * Cache Invalidation: Evict cache khi update user
     * Evict cả cache by ID và by username
     */
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
        userUpdateRequestMapper.partialUpdate(user, req);

        var roles = roleRepository.findAllByCodes(req.getRoles());
        user.setRoles(new HashSet<>(roles));

        User savedUser = userRepository.save(user);
        log.info("Updated user: {}", userId);

        return userResponseMapper.toDto(savedUser);
    }

    /**
     * Cache Invalidation: Evict cache khi đổi password
     */
    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#req.id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #req.id")
    })
    public UUID changePassword(UserPasswordRequest req) {
        log.info("Changing password for user: {} - Evicting cache", req.getId());

        User user = getUserEntityNoCache(req.getId());
        if (req.getPassword().equals(req.getConfirmPassword())) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        userRepository.save(user);
        log.info("Changed password for user: {}", req.getId());

        return user.getId();
    }

    /**
     * Cache Invalidation: Evict cache khi delete (soft delete)
     */
    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "#id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_ID, key = "'entity:' + #id"),
            @CacheEvict(cacheNames = CacheConstants.USER_BY_USERNAME, allEntries = true)
    })
    public UUID delete(UUID id) {
        log.info("Deleting user: {} - Evicting cache", id);

        User user = getUserEntityNoCache(id);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);

        log.info("Deleted user: {}", id);
        return id;
    }

    /**
     * Get user by ID (no cache) - dùng internal để tránh cache khi update
     */
    private User getUserEntityNoCache(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Get user by ID - có thể được cache từ caller
     */
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
    public void promoteToTeacher(UUID userId, String teacherId, String department) {
        User user = getUserEntityNoCache(userId);

        // 1. Thêm Role giáo viên
        Role teacherRole = roleRepository.findByCode(UserType.TEACHER.getValue())
                .orElseThrow(() -> new ResourceNotFoundException("Role TEACHER not found"));
        user.getRoles().add(teacherRole);

        // 2. Tạo Profile giáo viên
        TeacherProfile profile = TeacherProfile.builder()
                .teacherId(teacherId)
                .department(department)
                .user(user)
                .build();

        teacherProfileRepository.save(profile);
        userRepository.save(user);

        log.info("User {} has been promoted to TEACHER with ID: {}", userId, teacherId);
    }
}
