import { User } from "@/model/User";
import authService from "@/services/AuthService";
import { LoginPayload } from "@/types/Auth";
import { Permission } from "@/types/Permission";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const forgot = () => {
    authService.logout();
    setUser(null);
  };

  const signUp = async () => {
    authService.signUp();
  };

  const hasRole = (allowedRoles: string[]): boolean => {
    if (!user?.roles?.length) return false;

    // role code từ user (vd: "ADMIN", "TEACHER"...)
    const userRoleCodes = user.roles
      .map((r) => r?.code)
      .filter(Boolean) as string[];

    return allowedRoles.some((role) => userRoleCodes.includes(role));
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng bên trong một AuthProvider");
  }
  return context;
};
