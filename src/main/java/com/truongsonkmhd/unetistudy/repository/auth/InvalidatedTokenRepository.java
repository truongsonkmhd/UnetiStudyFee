package com.truongsonkmhd.unetistudy.repository.auth;

import com.truongsonkmhd.unetistudy.model.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
