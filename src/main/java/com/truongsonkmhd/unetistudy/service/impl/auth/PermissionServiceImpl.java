package com.truongsonkmhd.unetistudy.service.impl.auth;

import com.truongsonkmhd.unetistudy.dto.permission_dto.PermissionRequest;
import com.truongsonkmhd.unetistudy.dto.permission_dto.PermissionResponse;
import com.truongsonkmhd.unetistudy.mapper.permission.PermissionRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.permission.PermissionResponseMapper;
import com.truongsonkmhd.unetistudy.model.Permission;
import com.truongsonkmhd.unetistudy.repository.auth.PermissionRepository;
import com.truongsonkmhd.unetistudy.service.PermissionService;
import com.truongsonkmhd.unetistudy.service.impl.BaseCrudService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PermissionServiceImpl extends BaseCrudService<Permission, Long, PermissionRepository>
        implements PermissionService {

    private final PermissionRequestMapper permissionRequestMapper;
    private final PermissionResponseMapper permissionResponseMapper;

    public PermissionServiceImpl(PermissionRepository repository,
            PermissionRequestMapper permissionRequestMapper,
            PermissionResponseMapper permissionResponseMapper) {
        super(repository, "Permission");
        this.permissionRequestMapper = permissionRequestMapper;
        this.permissionResponseMapper = permissionResponseMapper;
    }
    @Override
    public PermissionResponse create(PermissionRequest request) {
        Permission permission = permissionRequestMapper.toEntity(request);
        permission = repository.save(permission);
        return permissionResponseMapper.toDto(permission);
    }

    public PermissionResponse update(long id, PermissionRequest request) {
        Permission existing = findByIdOrThrow(id);
        permissionRequestMapper.partialUpdate(existing, request);
        Permission updated = repository.save(existing);
        return permissionResponseMapper.toDto(updated);
    }

    @Override
    public List<PermissionResponse> getAll() {
        List<PermissionResponse> result  = permissionResponseMapper.toDto(repository.findAll());
        return result;
    }
    @Override
    public long delete(long permissionId) {
        deleteById(permissionId);
        return permissionId;
    }
}
