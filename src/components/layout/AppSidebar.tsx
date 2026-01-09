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
  socialIcon,
  testIcon,
} from "@/assets";
import { APP_NAME } from "@/utils/config";
import { Role, ROLES } from "@/types/Auth";
import { PATHS } from "@/constants/paths";
import { actionAuth } from "../context/AuthContext";
import { hasAnyRole } from "../common/getRolesAndPermissionFromClaims";

//img

const navigationItems: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: Role[];
}[] = [
  { title: "Trang chủ", url: PATHS.HOME, icon: homepageIcon },
  { title: "Bài viết", url: PATHS.ARTICLES, icon: socialIcon },
  { title: "Bảng xếp hạng", url: PATHS.RANKING, icon: rankingIcon },

  {
    title: "Tạo bài giảng",
    url: PATHS.CREATE_LESSON,
    icon: createLessionIcon,
    requiredRoles: [Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN, Role.ROLE_TEACHER],
  },
  {
    title: "Tạo bài thi",
    url: PATHS.CREATE_TEST,
    icon: createTestIcon,
    requiredRoles: [Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN, Role.ROLE_TEACHER],
  },

  {
    title: "Quản lý sinh viên và giáo viên",
    url: PATHS.MANAGER_PERSONS,
    icon: managerIcon,
    requiredRoles: [Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN],
  },
  {
    title: "Quản lý quyền",
    url: PATHS.MANAGER_INTEREST,
    icon: quyenIcon,
    requiredRoles: [Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN],
  },
];

const history: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: Role[];
}[] = [
  {
    title: "Lớp đã tham gia",
    url: PATHS.CLASS_ATTENDED,
    icon: classIcon,
    requiredRoles: [Role.ROLE_STUDENT, Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN],
  },
  {
    title: "Lịch sử bài",
    url: PATHS.POST_HISTORY,
    icon: historyTestIcon,
    requiredRoles: [Role.ROLE_STUDENT, Role.ROLE_ADMIN, Role.ROLE_SYS_ADMIN],
  },
];

const toolsItems: {
  title: string;
  url: string;
  icon: string;
  requiredRoles?: Role[];
}[] = [
  { title: "Hướng dẫn", url: "/tutorial", icon: smartIcon },
  { title: "Cài Đặt", url: "/settings", icon: settingIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const { jwtClaims } = actionAuth();

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-medium shadow-construction"
      : "hover:bg-muted transition-colors";

  const visibleNavItems = navigationItems.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles)
  );

  const visibleHistory = history.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles)
  );

  const visibleTools = toolsItems.filter((i) =>
    hasAnyRole(jwtClaims, i.requiredRoles)
  );
  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
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
          <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
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
          <SidebarGroupLabel>Lịch sử</SidebarGroupLabel>
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
          <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
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
