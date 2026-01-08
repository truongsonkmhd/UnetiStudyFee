import apiService from "@/apis/apiService";
import { User } from "@/model/User";
import { LoginData, LoginPayload } from "@/types/Auth";

const LOGIN_ENDPOINT = "/authenticate";
const LOGOUT_ENDPOINT = "/authenticate/logout";

const authService = {
  login: async (payload: LoginPayload): Promise<LoginData> => {
    const response = await apiService.post<LoginData>(LOGIN_ENDPOINT, payload);

    if (response && response.token) {
      const storage = payload.isRememberMe ? localStorage : sessionStorage;
      storage.setItem("access_token", response.token);
      storage.setItem("refresh_token", response.refreshToken);
      storage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiService.post<string>(LOGOUT_ENDPOINT);

      console.log("Server logout successful.");
    } catch (error) {
      console.error(
        "Lỗi khi gọi API đăng xuất, nhưng vẫn sẽ tiếp tục xóa token ở client:",
        error
      );
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("capital-project-options");
      localStorage.removeItem("debug");
      localStorage.removeItem("design-steps-options");
      localStorage.removeItem("field-project-options");
      localStorage.removeItem("phase-templates:v1");
      localStorage.removeItem("pocketbase_auth");
      localStorage.removeItem("project-group-options");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");

      sessionStorage.removeItem("capital-project-options");
      sessionStorage.removeItem("debug");
      sessionStorage.removeItem("design-steps-options");
      sessionStorage.removeItem("field-project-options");
      sessionStorage.removeItem("phase-templates:v1");
      sessionStorage.removeItem("pocketbase_auth");
      sessionStorage.removeItem("project-group-options");

      console.log("Client tokens cleared.");
    }
  },

  signUp: () => {
    console.log("sign");
  },

  getCurrentUser: (): User | null => {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (e) {
        console.error("Lỗi khi parse dữ liệu người dùng:", e);
        return null;
      }
    }
    return null;
  },
};

export default authService;
