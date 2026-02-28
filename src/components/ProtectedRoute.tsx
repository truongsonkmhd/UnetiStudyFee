import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import { actionAuth } from "./context/AuthContext";
import PageLoader from "@/views/common/PageLoader";
import { RoleEnum } from "./enum/RoleEnum";
import { PermissionEnum } from "./enum/PermissionEnum";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleEnum[];
  requiredPermissions?: PermissionEnum[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = actionAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.AUTH} replace state={{ from: location }} />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
