export const PATHS = {
  AUTH: "/auth",

  //page
  HOME: "/home",
  REGISTER: "/register",
  RANKING: "/ranking",
  CREATE_LESSON: "/createLession",
  CREATE_TEST: "/createTest",
  CODING_EXERCISE_LIBRARY: "/codingExerciseLibrary",
  QUIZ_LIBRARY: "/quizLibrary",
  SETTINGS: "/settings",
  TUTORIAL: "/tutorial",
  POST_HISTORY: "/posthistory",
  CLASS_ATTENDED: "/classattended",
  MANAGER_INTEREST: "/managerinterest",
  MANAGER_PERSONS: "/managerPersons",
  MANAGER_CLASS: "/managerClass",
  MANAGER_CACHE: "/managerCache",
  MANAGER_COURSES: "/managerCourses",
  CREATE_COURSE: "/managerCourses/create",
  EDIT_COURSE: "/managerCourses/edit/:id",
  /* Course & Enrollments */
  MY_ENROLLMENTS: "/my-enrollments",
  COURSE_DETAIL: "/course/:slug",
  ENROLLMENT_MANAGER: "/managerCourses/:courseId/enrollments", /* Nested under course manager usually, or separate */

  VIEW_COURSE: "/managerCourses/view/:id",


  //other
  PROFILE_PAGE: "/profilePage",
  UNAUTHORIZED: "/unauthorized",
  ADD_CONTEST: "/addContest",
};
