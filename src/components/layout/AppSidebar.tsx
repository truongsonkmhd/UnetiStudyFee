import React from "react";
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
  classContestIcon,
  classIcon,
  codingIcon,
  createLessionIcon,
  createTestIcon,
  historyTestIcon,
  homepageIcon,
  logoIcon,
  managerIcon,
  quizIcon,
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

const navigationGroups: {
  label: string;
  items: {
    title: string;
    url: string;
    icon: string;
    requiredRoles?: RoleEnum[];
  }[];
}[] = [
    {
      label: "Tổng quan",
      items: [
        { title: "Trang chủ", url: PATHS.HOME, icon: homepageIcon },
        { title: "Hướng dẫn", url: "/tutorial", icon: smartIcon },
      ],
    },
    {
      label: "Kho bài tập",
      items: [
        {
          title: "Kho bài lập trình",
          url: PATHS.CODING_EXERCISE_LIBRARY,
          icon: codingIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN, RoleEnum.ROLE_TEACHER],
        },
        {
          title: "Kho bài trắc nghiệm",
          url: PATHS.QUIZ_LIBRARY,
          icon: quizIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN, RoleEnum.ROLE_TEACHER],
        },
      ],
    },
    {
      label: "Quản lý",
      items: [
        {
          title: "Quản lý bài thi",
          url: PATHS.CREATE_TEST,
          icon: createTestIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN, RoleEnum.ROLE_TEACHER],
        },
        {
          title: "Quản lý lớp học",
          url: PATHS.MANAGER_CLASS,
          icon: classContestIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN, RoleEnum.ROLE_TEACHER],
        },
        {
          title: "Quản lý khóa học",
          url: PATHS.MANAGER_COURSES,
          icon: classIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN, RoleEnum.ROLE_TEACHER],
        },
        {
          title: "Quản lý người dùng",
          url: PATHS.MANAGER_PERSONS,
          icon: managerIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN],
        },
        {
          title: "Quản lý phân quyền",
          url: PATHS.MANAGER_INTEREST,
          icon: quyenIcon,
          requiredRoles: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_SYS_ADMIN],
        },
        {
          title: "Quản lý Cache",
          url: PATHS.MANAGER_CACHE,
          icon: smartIcon,
          requiredRoles: [RoleEnum.ROLE_SYS_ADMIN],
        },
      ],
    },
    {
      label: "Cá nhân",
      items: [
        {
          title: "Khóa học của tôi",
          url: PATHS.MY_ENROLLMENTS,
          icon: classIcon,
          requiredRoles: [RoleEnum.ROLE_STUDENT],
        },
        {
          title: "Lớp học của tôi",
          url: PATHS.MY_CLASSES,
          icon: classIcon,
          requiredRoles: [RoleEnum.ROLE_STUDENT],
        },
        {
          title: "Quản lý đăng ký học",
          url: PATHS.MY_ENROLLMENTS,
          icon: classIcon,
          requiredRoles: [RoleEnum.ROLE_STUDENT],
        },
      ],
    },
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

  const userRoles = getRolesFromClaims(jwtClaims);
  const theme = pickThemeByRoles(userRoles);

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const getNavClassName = (path: string) =>
    [
      "flex items-center gap-4 rounded-xl px-4 py-3",
      isActive(path) ? theme.activeItem : "hover:bg-muted transition-all duration-200",
    ].join(" ");

  const ROLE_SIDEBAR_THEME: Record<string, string> = {
    [RoleEnum.ROLE_SYS_ADMIN]: "bg-red-600 text-white",
    [RoleEnum.ROLE_ADMIN]: "bg-blue-600 text-white",
    [RoleEnum.ROLE_TEACHER]: "bg-emerald-600 text-white",
    [RoleEnum.ROLE_STUDENT]: "bg-purple-600 text-white",
  };

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
            "h-20 border-b flex items-center",
            isCollapsed ? "justify-center px-0" : "justify-start px-5",
          ].join(" ")}
        >
          <img
            src={logoIcon}
            alt="Logo"
            className="w-12 h-12 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col ml-4">
              <span className="font-black text-xl text-blue-600 dark:text-blue-400 tracking-tight">
                {APP_NAME}
              </span>
            </div>
          )}
        </div>

        {navigationGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => hasAnyRole(jwtClaims, item.requiredRoles));
          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={group.label}>
              <SidebarGroup>
                <SidebarGroupLabel className={`${theme.groupLabel} text-sm font-bold uppercase tracking-widest mb-2 mt-2`}>
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={getNavClassName(item.url)}
                          >
                            <img src={item.icon} alt="" className="w-7 h-7" />
                            {!isCollapsed && (
                              <span className="text-base font-medium">
                                {item.title}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {groupIdx < navigationGroups.length - 1 && (
                <div className="mx-4 my-1 border-t border-border opacity-50" />
              )}
            </React.Fragment>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

