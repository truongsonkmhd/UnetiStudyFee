package com.truongsonkmhd.unetistudy.mapper.role;

import com.truongsonkmhd.unetistudy.dto.role_dto.RoleRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.Role;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RoleRequestMapper extends EntityMapper<RoleRequest, Role> {
    @Override
    @Mapping(target = "users", ignore = true)
    Role toEntity(RoleRequest dto);

    @Override
    RoleRequest toDto(Role entity);

    @Override
    @Named("partialUpdate")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "users", ignore = true)
    void partialUpdate(@MappingTarget Role entity, RoleRequest dto);
}
