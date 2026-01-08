import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import NotFound from "../views/pages/NotFound";
import { HomePage } from "@/views/home/HomePage";
import CourseLessonsAndExercises from "@/views/home/CourseLessonsAndExercises";
import VideoCoursePlayer from "@/views/home/VideoCoursePlayer";
import LeaderboardPage from "@/views/home/LeaderboardPage";

import { PATHS } from "@/constants/paths";
import AuthScreen from "@/views/login-and-registor/AuthScreen";
import { AppLayout } from "@/components/layout/AppLayout";

import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
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
        <Route
          path={PATHS.AUTH}
          element={
            <PublicRoute>
              {" "}
              <AuthScreen />
            </PublicRoute>
          }
        />

        <Route element={<AppLayout />}>
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <HomePage />
              ) : (
                <Navigate to={PATHS.AUTH} replace />
              )
            }
          />
          <Route path="/articles" element={<div>Bài viết (Sắp Ra Mắt)</div>} />
          <Route path="/ranking" element={<LeaderboardPage />} />
          <Route
            path="/createLession"
            element={<CourseLessonsAndExercises />}
          />
          <Route path="/createTest" element={<VideoCoursePlayer />} />
          <Route path="/tests" element={<div>Bài thi (Sắp Ra Mắt)</div>} />
          <Route
            path="/managerPersons"
            element={<div>Quản lý ... (Sắp Ra Mắt)</div>}
          />
          <Route
            path="/managerinterest"
            element={<div>Quản lý quyền (Sắp Ra Mắt)</div>}
          />
          <Route
            path="/classattended"
            element={<div>Lớp đã tham gia (Sắp Ra Mắt)</div>}
          />
          <Route
            path="/posthistory"
            element={<div>Lịch sử bài (Sắp Ra Mắt)</div>}
          />
          <Route path="/tutorial" element={<div>Hướng dẫn (Sắp Ra Mắt)</div>} />
          <Route path="/settings" element={<div>Cài Đặt</div>} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
