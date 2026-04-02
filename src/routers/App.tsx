import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "../views/common/NotFound";
import { HomePage } from "@/views/pages/HomePage";
import LeaderboardPage from "@/views/pages/LeaderboardPage";
import { PATHS } from "@/constants/paths";
import AuthScreen from "@/views/login-and-registor/AuthScreen";
import { RoleBasedLayout } from "@/components/layout/RoleBasedLayout";
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
import ManagerPerson from "@/views/pages/manager_person/ManagerPerson";
import CourseManager from "@/views/course_admin/CourseManager";
import EnrollmentManager from "@/views/teacher/enrollment-manager/EnrollmentManager";
import MyCourses from "@/views/student/my-learning/MyCourses";
import MyClasses from "@/views/student/my-learning/MyClasses";
import CourseDetail from "@/views/student/course-detail/CourseDetail";
import CourseLearn from "@/views/student/course-learn/CourseLearn";
import JoinClass from "@/views/student/JoinClass";
import ClassDetail from "@/views/student/my-learning/ClassDetail";
import ExamSession from "@/views/student/my-learning/ExamSession";
import TutorialPage from "@/views/pages/TutorialPage";
import SettingsPage from "@/views/pages/SettingsPage";

import { RippleEffect } from "@/components/common/RippleEffect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Sonner />
        <RippleEffect />
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
                  RoleEnum.ROLE_TEACHER,
                  RoleEnum.ROLE_STUDENT,
                ]}
              >
                <CourseManager />
              </ProtectedRoute>
            }
          />

          <Route
            path={PATHS.ENROLLMENT_MANAGER}
            element={
              <ProtectedRoute
                requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                ]}
              >
                <EnrollmentManager />
              </ProtectedRoute>
            }
          />



          <Route path={PATHS.COURSE_DETAIL} element={<CourseDetail />} />
          <Route path={PATHS.COURSE_LEARN} element={<CourseLearn />} />
          <Route
            path={PATHS.CLASS_DETAIL}
            element={
              <ProtectedRoute requiredRoles={[
                RoleEnum.ROLE_ADMIN,
                RoleEnum.ROLE_TEACHER,
                RoleEnum.ROLE_STUDENT]}>
                <ClassDetail />
              </ProtectedRoute>
            }
          />


          <Route
            path={PATHS.EXAM_SESSION}
            element={
              <ProtectedRoute requiredRoles={[
                RoleEnum.ROLE_ADMIN,
                RoleEnum.ROLE_TEACHER,
                RoleEnum.ROLE_STUDENT]}>
                <ExamSession />
              </ProtectedRoute>
            }
          />

          <Route element={<RoleBasedLayout />}>
            <Route path={PATHS.RANKING} element={<LeaderboardPage />} />

            <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />

            <Route path={PATHS.HOME} element={<HomePage />} />
            <Route
              path={PATHS.CREATE_TEST}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
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
                    RoleEnum.ROLE_TEACHER,
                  ]}
                >
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
                  ]}
                >
                  <ManagerPerson />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.MANAGER_COURSES}
              element={
                <ProtectedRoute
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN,
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
                  requiredRoles={[
                    RoleEnum.ROLE_ADMIN
                  ]}
                >
                  <CacheManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={PATHS.CLASS_ATTENDED}
              element={
                <ProtectedRoute requiredRoles={[RoleEnum.ROLE_STUDENT]}>
                  <WebSocketSubmission />
                </ProtectedRoute>
              }
            />

            <Route
              path={PATHS.TUTORIAL}
              element={<TutorialPage />}
            />
            <Route path={PATHS.SETTINGS} element={<SettingsPage />} />

            <Route
              path={PATHS.MY_ENROLLMENTS}
              element={
                <ProtectedRoute requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                  RoleEnum.ROLE_STUDENT]}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path={PATHS.MY_CLASSES}
              element={
                <ProtectedRoute requiredRoles={[
                  RoleEnum.ROLE_ADMIN,
                  RoleEnum.ROLE_TEACHER,
                  RoleEnum.ROLE_STUDENT]}>
                  <MyClasses />
                </ProtectedRoute>
              }
            />

            <Route
              path={PATHS.JOIN_CLASS}
              element={
                <ProtectedRoute requiredRoles={[RoleEnum.ROLE_STUDENT, RoleEnum.ROLE_TEACHER]}>
                  <JoinClass />
                </ProtectedRoute>
              }
            />

          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider >
);

export default App;
