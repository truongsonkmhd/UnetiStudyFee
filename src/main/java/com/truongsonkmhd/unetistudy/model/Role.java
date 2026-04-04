package com.truongsonkmhd.unetistudy.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_role")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // phù hợp với PostgreSQL
    @Column(name = "id")
    Long id;
    @Column(name = "name")
    String name;
    @Column(name = "code")
    String code;
    @Column(name = "description")
    String description;
    @Column(name = "is_deleted")
    Boolean isDeleted;
    @Column(name = "is_activated")
    Boolean isActivated;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "roles")
    Set<User> users = new HashSet<>();

}
