import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

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
} from "lucide-react";
import { chatboxCuImg } from "@/assets";
import { actionAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { PATHS } from "@/constants/paths";

import defaultAvatar from "@/assets/img/avatar-default.png";

export function AppLayout() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { jwtClaims, logout } = actionAuth();

  console.log("AppLayout render with JWT claims:=-=-=-=-=", jwtClaims);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

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
          <header className="sticky top-0 z-50 h-16 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b flex items-center gap-4 pl-4 pr-6">
            {/* left */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>

            {/* center search */}
            <form
              onSubmit={onSearchSubmit}
              className="flex-1 flex justify-center"
            >
              <div className="flex items-center gap-2 rounded-full border border-muted-foreground/20 px-3 py-2 shadow-sm w-full max-w-md">
                <Search className="w-5 h-5 opacity-60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm khóa học, bài viết, video, ..."
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <Mail className="w-5 h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition">
                    <img
                      src={getAvatarSrc(jwtClaims.userInfor?.avatar)}
                      alt={jwtClaims.userInfor?.fullName}
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10"
                      draggable={false}
                    />
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="text-sm font-semibold text-foreground">
                        {jwtClaims.userInfor?.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {jwtClaims.userInfor?.classId}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-black/10">
                        <img
                          src={getAvatarSrc(jwtClaims.userInfor?.avatar)}
                          alt={jwtClaims.userInfor?.fullName}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {jwtClaims.userInfor?.fullName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {jwtClaims.userInfor?.classId}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => navigate(PATHS.PROFILE_PAGE)}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/classattended")}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Lớp học
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
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
          <ChatQAButton />
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
      className="relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-white ring-1 ring-black/10 shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-300"
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
