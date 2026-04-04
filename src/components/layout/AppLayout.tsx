import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Mail,
  LogOut,
  User as UserIcon,
  MessageCircle,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { chatboxCuImg } from "@/assets";
import { actionAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { PATHS } from "@/constants/paths";
import { getRolesFromClaims } from "../common/getRolesAndPermissionFromClaims";

import defaultAvatar from "@/assets/img/avatar-default.png";


export function AppLayout() {
  const navigate = useNavigate();

  const { jwtClaims, logout } = actionAuth();

  console.log("AppLayout render with JWT claims:=-=-=-=-=", jwtClaims);


  const getAvatarSrc = (avatarUrl?: unknown): string => {
    if (typeof avatarUrl !== "string") return defaultAvatar;

    const url = avatarUrl.trim();
    return url.length > 0 ? url : defaultAvatar;
  };

  const handleLogout = () => {
    const logoutPromise = logout();
    toast.promise(logoutPromise, {
      loading: "Đang đăng xuất...",
      success: () => {
        navigate("/auth", { replace: true });
        return "Đã đăng xuất thành công!";
      },
      error: (err) => {
        console.error("Logout failed:", err);
        return "Đăng xuất thất bại, vui lòng thử lại.";
      },
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <header className="sticky top-0 z-50 h-20 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b flex items-center gap-4 pl-4 pr-6">
            {/* left */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>

            {/* center placeholder to keep balance */}
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
              </Button>


              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-slate-800 hover:ring-blue-500/50 transition-all duration-300">
                    <img
                      src={getAvatarSrc(jwtClaims?.avatar)}
                      alt={jwtClaims?.userName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                      draggable={false}
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 bg-popover border-border text-popover-foreground p-2">
                  <div className="flex items-center gap-3 px-3 py-4 mb-2 bg-muted/50 rounded-xl">
                    <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-blue-500">
                      <img
                        src={getAvatarSrc(jwtClaims?.avatar)}
                        alt={jwtClaims?.userName}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div>
                      <p className="text-base font-black text-foreground">{jwtClaims?.userName || "Người dùng"}</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{getRolesFromClaims(jwtClaims)?.[0] || jwtClaims?.classId || "Hệ thống"}</p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={() => navigate(PATHS.PROFILE_PAGE)}
                    className="rounded-lg py-2.5 focus:bg-muted"
                  >
                    <UserIcon className="mr-3 h-4 w-4 text-blue-500" /> Hồ sơ cá nhân
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => navigate("/classattended")}
                    className="rounded-lg py-2.5 focus:bg-muted"
                  >
                    <MessageCircle className="mr-3 h-4 w-4 text-purple-500" /> Lớp học tham gia
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg py-2.5 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Floating buttons */}
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
          <ChatQAButton2 />
        </div>
      </div>
    </SidebarProvider>
  );
}

function ChatQAButton2() {
  const navigate = useNavigate();
  const [unread] = useState<number>(0);

  return (
    <button
      onClick={() => navigate("/chat")}
      title="Chat hỏi đáp"
      aria-label="Chat hỏi đáp"
      className="relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-card ring-1 ring-border shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <img
        src={chatboxCuImg}
        alt="Chat"
        className="h-12 w-12 rounded-full object-cover"
        draggable={false}
      />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] leading-5 rounded-full text-center shadow">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

function ChatQAButton() {
  const navigate = useNavigate();
  const [unread] = useState<number>(0);

  return (
    <button
      onClick={() => navigate("/chat")}
      title="Chat hỏi đáp"
      aria-label="Chat hỏi đáp"
      className="relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-300 text-white"
    >
      <MessageCircle className="h-6 w-6" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] leading-5 rounded-full text-center shadow">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}
