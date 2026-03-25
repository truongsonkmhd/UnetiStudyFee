package com.truongsonkmhd.unetistudy.mapper.user;

import com.truongsonkmhd.unetistudy.dto.user_dto.UserUpdateRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserUpdateRequestMapper extends EntityMapper<UserUpdateRequest, User> {

    // Map UserUpdateRequest to User entity
    @Override
    @Mapping(target = "id", ignore = true) // ID is not updated
    @Mapping(target = "password", ignore = true) // Password is not updated
    @Mapping(target = "isDeleted", ignore = true) // isDeleted is not updated
    @Mapping(target = "status", ignore = true) // UserStatus is not updated
    @Mapping(target = "token", ignore = true) // Token is not updated
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserUpdateRequest dto);

    // Map User entity to UserUpdateRequest DTO
    @Override
    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRolesToDto")
    UserUpdateRequest toDto(User entity);

    @Override
    @Named("partialUpdate")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "token", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    void partialUpdate(@MappingTarget User user, UserUpdateRequest userUpdateRequest);

    // Custom mapping for roles (Set<Role> to List<String>)
    @Named("mapRolesToDto")
    default List<String> mapRolesToDto(Set<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .filter(Objects::nonNull)
                .map(Role::getName) // Assuming Role has a 'name' field
                .collect(Collectors.toList());
    }
}