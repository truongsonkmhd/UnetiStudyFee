import { NavLink, useLocation } from "react-router-dom";
import {
  Building,
  FolderKanban,
  CalendarDays,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  HardHat,
  Wrench,
  DollarSign,
  icons,
} from "lucide-react";

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

//img

const navigationItems = [
  { title: "Trang chủ", url: "/home", icon: homepageIcon },
  { title: "Bài viết", url: "/articles", icon: socialIcon },
  { title: "Bảng xếp hạng", url: "/ranking", icon: rankingIcon },
  { title: "Tạo bài giảng", url: "/createLession", icon: createLessionIcon },
  { title: "Tạo bài thi", url: "/createTest", icon: createTestIcon },
  { title: "Bài thi", url: "/tests", icon: testIcon },
  {
    title: "Quản lý sinh viên và giáo viên",
    url: "/managerPersons",
    icon: managerIcon,
  },
  { title: "Quản lý quyền", url: "/managerinterest", icon: quyenIcon },
];

const history = [
  { title: "Lớp đã tham gia", url: "/classattended", icon: classIcon },
  { title: "Lịch sử bài", url: "/posthistory", icon: historyTestIcon },
];

const toolsItems = [
  { title: "Hướng dẫn", url: "/tutorial", icon: smartIcon },
  { title: "Cài Đặt", url: "/settings", icon: settingIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-medium shadow-construction"
      : "hover:bg-muted transition-colors";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo section */}
        {/* Logo section: giữ kích thước logo cố định */}
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

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
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

        <div className="mx-2 my-2 border-t rounded-full border-gray-300"></div>

        <SidebarGroup>
          <SidebarGroupLabel>Lịch sử</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {history.map((item) => (
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

        <div className="mx-2 my-2 border-t rounded-full border-gray-300"></div>

        {/* Tools section */}
        <SidebarGroup>
          <SidebarGroupLabel>Hướng dẫn & Cài Đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
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
