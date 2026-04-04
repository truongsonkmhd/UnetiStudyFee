package com.truongsonkmhd.unetistudy.service.impl.auth;

import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.dto.role_dto.RoleRequest;
import com.truongsonkmhd.unetistudy.dto.role_dto.RoleResponse;
import com.truongsonkmhd.unetistudy.mapper.role.RoleRequestMapper;
import com.truongsonkmhd.unetistudy.mapper.role.RoleResponseMapper;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.repository.auth.RoleRepository;
import com.truongsonkmhd.unetistudy.service.RoleService;
import com.truongsonkmhd.unetistudy.service.impl.BaseCrudService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

/**
 * Service quản lý Role với tích hợp Caching
 * 
 * Cache Patterns áp dụng:
 * 1. Cache-Aside - @Cacheable cho getAll
 * 2. Cache Invalidation - @CacheEvict cho create, delete
 * 3. Long-lived Caching - TTL 6 giờ
 */
@Service
@Slf4j
public class RoleServiceImpl extends BaseCrudService<Role, Long, RoleRepository> implements RoleService {

    private final RoleRequestMapper roleRequestMapper;
    private final RoleResponseMapper roleResponseMapper;

    public RoleServiceImpl(RoleRepository repository,
            RoleRequestMapper roleRequestMapper,
            RoleResponseMapper roleResponseMapper) {
        super(repository, "Role");
        this.roleRequestMapper = roleRequestMapper;
        this.roleResponseMapper = roleResponseMapper;
    }

    /**
     * Cache Invalidation: Xóa cache roles khi tạo mới
     */
    @Transactional
    @Override
    @CacheEvict(cacheNames = CacheConstants.ROLES, allEntries = true)
    public RoleResponse create(RoleRequest request) {
        log.info("Creating role: {} - Evicting cache", request.getName());
        var role = roleRequestMapper.toEntity(request);

        role = repository.save(role);
        return roleResponseMapper.toDto(role);
    }

    /**
     * Cache-Aside: Lấy tất cả roles
     * TTL: 6 giờ
     */
    @Override
    @Cacheable(cacheNames = CacheConstants.ROLES, key = "'all'")
    public List<RoleResponse> getAll() {
        log.debug("Cache MISS - Loading all roles from DB");
        return repository.findAll()
                .stream()
                .map(roleResponseMapper::toDto)
                .toList();
    }

    /**
     * Cache Invalidation: Xóa cache roles và user roles khi có thay đổi liên quan
     * đến role
     */
    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConstants.ROLES, allEntries = true),
            @CacheEvict(cacheNames = CacheConstants.USER_ROLES, allEntries = true)
    })
    public long delete(long roleId) {
        log.info("Deleting role: {} - Evicting related caches", roleId);
        deleteById(roleId);
        return roleId;
    }
}
