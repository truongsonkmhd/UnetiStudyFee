import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import NotFound from "../views/common/NotFound";
import { HomePage } from "@/views/pages/HomePage";
import CourseLessonsAndExercises from "@/views/pages/CourseLessonsAndExercises";
import VideoCoursePlayer from "@/views/pages/VideoCoursePlayer";
import LeaderboardPage from "@/views/pages/LeaderboardPage";

import { PATHS } from "@/constants/paths";
import AuthScreen from "@/views/login-and-registor/AuthScreen";
import { AppLayout } from "@/components/layout/AppLayout";

import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
import ProfilePage from "@/views/profile/ProfilePage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleEnum } from "@/components/enum/RoleEnum";
// import PrivateRoute from "@/components/PrivateRoute"; // nếu bạn có

const queryClient = new QueryClient();

// demo (sau này lấy từ auth context)
const isAuthenticated = false;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Routes>
        <Route path="/" element={<Navigate to={PATHS.AUTH} replace />} />

        <Route
          path={PATHS.AUTH}
          element={
            <PublicRoute>
              {" "}
              <AuthScreen />
            </PublicRoute>
          }
        />
        <Route path={PATHS.PROFILE_PAGE} element={<ProfilePage />} />

        <Route element={<AppLayout />}>
          <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />

          <Route path={PATHS.HOME} element={<HomePage />} />

          <Route path={PATHS.RANKING} element={<LeaderboardPage />} />
          <Route
            path={PATHS.CREATE_LESSON}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <CourseLessonsAndExercises />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CREATE_TEST}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <VideoCoursePlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CREATE_TEST}
            element={<div>Bài thi (Sắp Ra Mắt)</div>}
          />
          <Route
            path={PATHS.MANAGER_PERSONS}
            element={
              <ProtectedRoute
                requiredRoles={[RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN]}
              >
                <div>Quản lý ... (Sắp Ra Mắt)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.MANAGER_INTEREST}
            element={
              <ProtectedRoute
                requiredRoles={[RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN]}
              >
                <div>Quản lý quyền (Sắp Ra Mắt)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CLASS_ATTENDED}
            element={
              <ProtectedRoute requiredRoles={[RoleEnum.ROLE_STUDENT]}>
                <div>Lớp đã tham gia (Sắp Ra Mắt)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.POST_HISTORY}
            element={
              <ProtectedRoute requiredRoles={[RoleEnum.ROLE_STUDENT]}>
                <div>Lịch sử bài (Sắp Ra Mắt)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.TUTORIAL}
            element={<div>Hướng dẫn (Sắp Ra Mắt)</div>}
          />
          <Route path={PATHS.SETTINGS} element={<div>Cài Đặt</div>} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
