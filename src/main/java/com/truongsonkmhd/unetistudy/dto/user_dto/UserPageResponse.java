package com.truongsonkmhd.unetistudy.dto.user_dto;

import com.truongsonkmhd.unetistudy.dto.a_custom.PageResponseAbstract;
import lombok.*;

import java.io.Serializable;
import java.util.List;
@Setter
@Getter
public class UserPageResponse extends PageResponseAbstract implements Serializable {
    private List<UserResponse> users;
}
