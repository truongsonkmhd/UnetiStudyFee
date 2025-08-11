import { NavLink, useLocation } from "react-router-dom"
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
  Wrench
} from "lucide-react"

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
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Bảng Điều Khiển", url: "/", icon: BarChart3 },
  { title: "Dự Án", url: "/projects", icon: Building },
  { title: "Công Việc", url: "/tasks", icon: FolderKanban },
  { title: "Tiến Độ", url: "/timeline", icon: CalendarDays },
  { title: "Tài Liệu", url: "/documents", icon: FileText },
  { title: "Nhóm", url: "/team", icon: Users },
  { title: "Thảo Luận", url: "/discussions", icon: MessageSquare },
]

const toolsItems = [
  { title: "Mẫu", url: "/templates", icon: HardHat },
  { title: "Báo Cáo", url: "/reports", icon: FileText },
  { title: "Công Cụ", url: "/tools", icon: Wrench },
  { title: "Cài Đặt", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-construction" 
      : "hover:bg-muted transition-colors"

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">BuildManager</span>
                <span className="text-xs text-muted-foreground">Pro v2.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Điều Hướng Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools section */}
        <SidebarGroup>
          <SidebarGroupLabel>Công Cụ & Cài Đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-4 h-4" />
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
  )
}