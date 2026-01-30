import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "../views/common/NotFound";
import { HomePage } from "@/views/pages/HomePage";
import CourseLessonsAndExercises from "@/views/pages/CourseLessonsAndExercises";
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
import ClassManagementDashboard from "@/views/class_managerment/ClassManagementDashboard";
import QuizTemplateManager from "@/views/quiz_storage/QuizTemplateManager";
import WebSocketSubmission from "@/views/submission/WebSocketSubmission";
import CodingExerciseLibrary from "@/views/coding-template-exercise/CodingExerciseLibrary";
import TemplateCreate from "@/views/coding-template-exercise/TemplateCreate";
import CodingExerciseView from "@/views/coding-template-exercise/CodingExerciseView";
import CacheManagementPage from "@/views/admin_cache/CacheManagementPage";

import { ThemeProvider } from "@/components/theme-provider";
import ContestManager from "@/views/contest/ContestManager";
import CourseManager from "@/views/course_admin/CourseManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
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

          <Route
            path="/templates/create"
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <TemplateCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates/:id/edit"
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <TemplateCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates/:id/view"
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                  RoleEnum.ROLE_STUDENT,
                ]}
              >
                <CodingExerciseView />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.CREATE_COURSE}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <CourseManager />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.EDIT_COURSE}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <CourseManager />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.VIEW_COURSE}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_SYS_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                  RoleEnum.ROLE_STUDENT,
                ]}
              >
                <CourseManager />
              </ProtectedRoute>
            }
          />

          <Route element={<AppLayout />}>
            <Route path={PATHS.RANKING} element={<LeaderboardPage />} />

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
                  <ContestManager />
                </ProtectedRoute>
              }
            />

            <Route
              path={PATHS.CODING_EXERCISE_LIBRARY}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >
                  <CodingExerciseLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.QUIZ_LIBRARY}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >
                  {/* <ClassManagementDashboard /> */}
                  <QuizTemplateManager />
                </ProtectedRoute>
              }
            />

            <Route
              path={PATHS.MANAGER_CLASS}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >

                  <ClassManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.MANAGER_PERSONS}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >

                  <ContestManager />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.MANAGER_COURSES}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >
                  <CourseManager />
                </ProtectedRoute>
              }
            />


            <Route
              path={PATHS.MANAGER_CACHE}
              element={
                <ProtectedRoute
                  requiredRoles={[RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN]}
                >
                  <CacheManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.MANAGER_INTEREST}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
                    RoleEnum.ROLE_SYS_ADMIN,
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >

                  <WebSocketSubmission />
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
    </ThemeProvider>
  </QueryClientProvider >
);

export default App;
