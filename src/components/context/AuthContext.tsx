import authService from "@/services/AuthService";
import { JwtClaims } from "@/types/JwtClaims";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { getRolesFromClaims } from "../common/getRolesAndPermissionFromClaims";
import { RegisterPayload } from "@/model/payload/RegisterPayload";
import { LoginPayload } from "@/types/auth";

interface AuthContextType {
  jwtClaims: JwtClaims | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  forgot: () => void;
  signUp: (payload: RegisterPayload) => Promise<void>;
  isLoading: boolean;
  hasRole: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtClaims, setJwtClaims] = useState<JwtClaims | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const jwtClaims = authService.getJwtClaimDecoded();
      if (jwtClaims) {
        setJwtClaims(jwtClaims);
      }
    } catch (error) {
      console.error("Không thể decode JWT claims:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    await authService.login(payload);
    const claims = authService.getJwtClaimDecoded();
    setJwtClaims(claims);
  };

  const logout = async () => {
    await authService.logout();
    setJwtClaims(null);
  };

  const forgot = () => {
    authService.logout();
    setJwtClaims(null);
  };

  const signUp = async (payload: RegisterPayload) => {
    await authService.signUp(payload);
    const claims = authService.getJwtClaimDecoded();
    setJwtClaims(claims);
  };

  const hasRole = (allowedRoles: string[]): boolean => {
    if (!jwtClaims?.scope?.length) return false;

    const roleContain = getRolesFromClaims(jwtClaims).filter(
      Boolean
    ) as string[];

    return allowedRoles.some((role) => roleContain.includes(role));
  };

  const value = {
    jwtClaims,
    isAuthenticated: !!jwtClaims,
    login,
    logout,
    forgot,
    signUp,
    isLoading,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const actionAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng bên trong một AuthProvider");
  }
  return context;
};
