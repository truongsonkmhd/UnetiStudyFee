package com.truongsonkmhd.unetistudy.repository.auth;

import com.truongsonkmhd.unetistudy.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    @Query("SELECT r FROM Role r WHERE r.code IN :codes AND r.isDeleted = false AND r.isActivated = true")
    List<Role> findAllByCodes(@Param("codes") Collection<String> codes);

    @Query("SELECT r FROM Role r WHERE r.code = :code AND r.isDeleted = false AND r.isActivated = true")
    Optional<Role> findByCode(@Param("code") String code);
}
