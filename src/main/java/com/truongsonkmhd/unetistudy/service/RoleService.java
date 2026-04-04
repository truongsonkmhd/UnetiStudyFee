package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.role_dto.RoleRequest;
import com.truongsonkmhd.unetistudy.dto.role_dto.RoleResponse;

import java.util.List;

public interface RoleService {  
    RoleResponse create(RoleRequest request);

    List<RoleResponse> getAll();

    long delete(long roleId);
}
