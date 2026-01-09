import { User } from "@/model/User";
import authService from "@/services/AuthService";
import { LoginData, LoginPayload } from "@/types/Auth";
import { JwtClaims } from "@/types/JwtClaims";
import { Permission } from "@/types/Permission";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { getRolesFromClaims } from "../common/getRolesAndPermissionFromClaims";

interface AuthContextType {
  jwtClaims: JwtClaims | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  forgot: () => void;
  signUp: () => Promise<void>;
  isLoading: boolean;
  hasRole: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtClaims, setJwtClaims] = useState<JwtClaims | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(
      "AuthProvider mounting, checking existing token...423423423432"
    );
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

  const signUp = async () => {
    authService.signUp();
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
