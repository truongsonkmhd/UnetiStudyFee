import { Navigate } from "react-router-dom";
import { actionAuth } from "./context/AuthContext";
import { PATHS } from "@/constants/paths";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = actionAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
