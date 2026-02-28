import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  classIcon,
  createLessionIcon,
  createTestIcon,
  historyTestIcon,
  homepageIcon,
  logoIcon,
  managerIcon,
  quyenIcon,
  rankingIcon,
  settingIcon,
  smartIcon,
} from "@/assets";
import { APP_NAME } from "@/utils/config";
import { PATHS } from "@/constants/paths";
import { actionAuth } from "../context/AuthContext";
import { getRolesFromClaims, hasAnyPermission, hasAnyRole } from "../common/getRolesAndPermissionFromClaims";
import { RoleEnum } from "../enum/RoleEnum";
import { PermissionEnum } from "../enum/PermissionEnum";

const navigationItems: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: RoleEnum[];
  requiredPermissions?: PermissionEnum[];
}[] = [
    { title: "Trang chủ", url: PATHS.HOME, icon: homepageIcon },
    { title: "Bảng xếp hạng", url: PATHS.RANKING, icon: rankingIcon },
    {
      title: "Tạo bài giảng",
      url: PATHS.CREATE_LESSON,
      icon: createLessionIcon,
      requiredPermissions: [PermissionEnum.COURSE_CREATE, PermissionEnum.COURSE_UPDATE],
    },
    {
      title: "Tạo bài thi",
      url: PATHS.CREATE_TEST,
      icon: createTestIcon,
      requiredPermissions: [PermissionEnum.QUIZ_CREATE, PermissionEnum.QUIZ_UPDATE],
    },
    {
      title: "Kho bài code",
      url: PATHS.CODING_EXERCISE_LIBRARY,
      icon: createTestIcon,
      requiredPermissions: [PermissionEnum.EXERCISE_MANAGE],
    },
    {
      title: "Kho bài quiz",
      url: PATHS.QUIZ_LIBRARY,
      icon: createTestIcon,
      requiredPermissions: [PermissionEnum.QUIZ_MANAGE],
    },
    {
      title: "Quản lý lớp thi",
      url: PATHS.MANAGER_CLASS,
      icon: createTestIcon,
      requiredRoles: [
        RoleEnum.ROLE_ADMIN,
        RoleEnum.ROLE_SYS_ADMIN,
        RoleEnum.ROLE_TEACHER,
      ],
    },
    {
      title: "Quản lý sinh viên và giáo viên",
      url: PATHS.MANAGER_PERSONS,
      icon: managerIcon,
      requiredPermissions: [PermissionEnum.USER_MANAGE],
    },
    {
      title: "Quản lý Cache",
      url: PATHS.MANAGER_CACHE,
      icon: smartIcon,
      requiredPermissions: [PermissionEnum.CACHE_MANAGE],
    },
    {
      title: "Quản lý quyền",
      url: PATHS.MANAGER_INTEREST,
      icon: quyenIcon,
      requiredPermissions: [PermissionEnum.SYSTEM_CONFIG],
    },
    {
      title: "Quản lý khóa học",
      url: PATHS.MANAGER_COURSES,
      icon: classIcon,
      requiredPermissions: [PermissionEnum.COURSE_VIEW, PermissionEnum.COURSE_UPDATE],
    },
    {
      title: "Quản lý đăng ký học",
      url: PATHS.MY_ENROLLMENTS,
      icon: classIcon,
      requiredRoles: [
        RoleEnum.ROLE_ADMIN,
        RoleEnum.ROLE_SYS_ADMIN,
        RoleEnum.ROLE_TEACHER,
      ],
    },
    {
      title: "Quản lý bài viết",
      url: PATHS.CREATE_POST,
      icon: createLessionIcon,
      requiredPermissions: [PermissionEnum.POST_CREATE, PermissionEnum.POST_UPDATE],
    },
  ];

const history: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: RoleEnum[];
}[] = [
    {
      title: "Lớp đã tham gia",
      url: PATHS.CLASS_ATTENDED,
      icon: classIcon,
      requiredRoles: [
        RoleEnum.ROLE_STUDENT,
        RoleEnum.ROLE_ADMIN,
        RoleEnum.ROLE_SYS_ADMIN,
      ],
    },
    {
      title: "Lịch sử bài",
      url: PATHS.POST_HISTORY,
      icon: historyTestIcon,
      requiredRoles: [
        RoleEnum.ROLE_STUDENT,
        RoleEnum.ROLE_ADMIN,
        RoleEnum.ROLE_SYS_ADMIN,
      ],
    },
  ];

const toolsItems: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: RoleEnum[];
}[] = [
    { title: "Hướng dẫn", url: "/tutorial", icon: smartIcon },
    { title: "Cài Đặt", url: "/settings", icon: settingIcon },
  ];

/** ====== ROLE THEME ====== */
type RoleTheme = {
  sidebarBg: string; // màu nền sidebar
  activeItem: string; // màu item active
  groupLabel?: string;
};

const ROLE_THEME: Record<string, RoleTheme> = {
  [RoleEnum.ROLE_SYS_ADMIN]: {
    sidebarBg: "bg-red-50/50 dark:bg-red-950/20",
    activeItem: "bg-red-600 text-white font-medium shadow dark:bg-red-500",
    groupLabel: "text-red-700 dark:text-red-400",
  },
  [RoleEnum.ROLE_ADMIN]: {
    sidebarBg: "bg-blue-50/50 dark:bg-blue-950/20",
    activeItem: "bg-blue-600 text-white font-medium shadow dark:bg-blue-500",
    groupLabel: "text-blue-700 dark:text-blue-400",
  },
  [RoleEnum.ROLE_TEACHER]: {
    sidebarBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    activeItem: "bg-emerald-600 text-white font-medium shadow dark:bg-emerald-500",
    groupLabel: "text-emerald-700 dark:text-emerald-400",
  },
  [RoleEnum.ROLE_STUDENT]: {
    sidebarBg: "bg-purple-50/50 dark:bg-purple-950/20",
    activeItem: "bg-purple-600 text-white font-medium shadow dark:bg-purple-500",
    groupLabel: "text-purple-700 dark:text-purple-400",
  },
};

function pickThemeByRoles(userRoles: string[] | undefined): RoleTheme {
  const roles = userRoles ?? [];
  // ưu tiên quyền cao trước
  const priority = [
    RoleEnum.ROLE_SYS_ADMIN,
    RoleEnum.ROLE_ADMIN,
    RoleEnum.ROLE_TEACHER,
    RoleEnum.ROLE_STUDENT,
  ];

  const best = priority.find((r) => roles.includes(r));
  return (
    (best && ROLE_THEME[best]) || {
      sidebarBg: "bg-card",
      activeItem: "bg-primary text-primary-foreground font-medium shadow",
      groupLabel: "text-muted-foreground",
    }
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const { jwtClaims } = actionAuth();

  // tuỳ bạn đang lưu roles ở đâu trong claims
  // ví dụ: jwtClaims.scope: string (dạng space-separated)
  const userRoles = getRolesFromClaims(jwtClaims);
  const theme = pickThemeByRoles(userRoles);

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string) =>
    [
      "flex items-center gap-2 rounded-md px-3 py-2",
      isActive(path) ? theme.activeItem : "hover:bg-muted transition-colors",
    ].join(" ");

  const visibleNavItems = navigationItems.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles) &&
    hasAnyPermission(jwtClaims, i.requiredPermissions)
  );

  const visibleHistory = history.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles)
  );

  const visibleTools = toolsItems.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles)
  );

  const ROLE_SIDEBAR_THEME: Record<string, string> = {
    [RoleEnum.ROLE_SYS_ADMIN]: "bg-red-600 text-white",
    [RoleEnum.ROLE_ADMIN]: "bg-blue-600 text-white",
    [RoleEnum.ROLE_TEACHER]: "bg-emerald-600 text-white",
    [RoleEnum.ROLE_STUDENT]: "bg-purple-600 text-white",
  };

  function getSidebarTheme(roles: string[] | undefined) {
    if (!roles) return "bg-slate-900 text-white";

    if (roles.includes(RoleEnum.ROLE_SYS_ADMIN))
      return ROLE_SIDEBAR_THEME[RoleEnum.ROLE_SYS_ADMIN];

    if (roles.includes(RoleEnum.ROLE_ADMIN))
      return ROLE_SIDEBAR_THEME[RoleEnum.ROLE_ADMIN];

    if (roles.includes(RoleEnum.ROLE_TEACHER))
      return ROLE_SIDEBAR_THEME[RoleEnum.ROLE_TEACHER];

    if (roles.includes(RoleEnum.ROLE_STUDENT))
      return ROLE_SIDEBAR_THEME[RoleEnum.ROLE_STUDENT];

    return "bg-slate-900 text-white";
  }

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent
        className={[
          theme.sidebarBg,
          "border-r border-border transition-colors",
        ].join(" ")}
      >
        <div
          className={[
            "h-16 border-b flex items-center",
            isCollapsed ? "justify-center px-0" : "justify-start px-4",
          ].join(" ")}
        >
          <img
            src={logoIcon}
            alt="Logo"
            className="w-10 h-10 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col ml-3">
              <span className="font-semibold text-sm text-foreground">
                {APP_NAME}
              </span>
              <span className="text-xs text-muted-foreground">
                Học để làm chủ tri thức
              </span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={theme.groupLabel}>
            Tổng quan
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <img src={item.icon} alt="" className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-2 my-2 border-t rounded-full border-gray-300" />

        <SidebarGroup>
          <SidebarGroupLabel className={theme.groupLabel}>
            Lịch sử
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleHistory.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <img src={item.icon} alt="" className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={theme.groupLabel}>
            Công cụ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <img src={item.icon} alt="" className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
