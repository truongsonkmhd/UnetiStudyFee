package com.truongsonkmhd.unetistudy.repository;

import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("select u from User u left join u.studentProfile s where u.status = 'ACTIVE' " +
            "and (lower(u.fullName) like :keyword" +
            " or lower(u.username) like :keyword" +
            " or lower(u.phone) like :keyword" +
            " or lower(u.email) like :keyword" +
            " or lower(s.studentId) like :keyword)")
    Page<User> searchByKeyWord(@Param("keyword") String keyword, Pageable pageable);

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findById(UUID id);

    Optional<User> findByPhone(String phone);

    Optional<User> findByStudentProfile_StudentId(String studentID);

    @Query("select  u from User u join u.token t where t.refreshToken = :refreshToken")
    Optional<User> findByRefreshToken(@Param("refreshToken") String refreshToken);
    // đây lầ cách lấy ở userRepo , nhưng ta nên lấy ở TokenRepository để đỡ phình to class (áp dụng SOLID)

    @Query("""
           select distinct u
           from User u
           left join fetch u.roles
           where u.username = :userName
             and u.isDeleted = :isDeleted
           """)
    Optional<User> getByUsernameAndIsDeletedWithRoles(@Param("userName") String userName,
                                                      @Param("isDeleted") Boolean isDeleted);
   //(left join "fetch") Dùng fetch để giải quyết N+1 problem và đảm bảo dữ liệu quan hệ được load cùng lúc.
    @Query("select u from User u where u.username = :userName")
    Optional<User> findByUserName(@Param("userName") String userName);

    @Query("SELECT u.id FROM User u WHERE u.username = :userName")
    UUID getUserIDByUserName(@Param("userName") String userName);

    @Query("""
    select r
    from User u
    join u.roles r
    where u.id = :userId
""")
    Set<Role> findRolesByUserId(@Param("userId") UUID userId);
}
