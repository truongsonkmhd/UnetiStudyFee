import React from "react";
import { actionAuth } from "../context/AuthContext";
import { getRolesFromClaims } from "../common/getRolesAndPermissionFromClaims";
import { RoleEnum } from "../enum/RoleEnum";
import { AppLayout } from "./AppLayout";
import { StudentLayout } from "./StudentLayout";

export function RoleBasedLayout() {
    const { jwtClaims } = actionAuth();
    const roles = getRolesFromClaims(jwtClaims);

    if (roles.includes(RoleEnum.ROLE_STUDENT)) {
        return <StudentLayout />;
    }

    return <AppLayout />;
}
