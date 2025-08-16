import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { LogOut, User as UserIcon, Mail, Search } from "lucide-react";

export function AppLayout() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-card flex items-center gap-4 pl-4 pr-6">
            {/* Trái: Toggle + tiêu đề */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <form
              onSubmit={onSearchSubmit}
              className="flex-1 flex justify-center"
            >
              <div className="flex items-center gap-2 rounded-full border border-muted-foreground/20 px-3 py-1.5 shadow-sm w-full max-w-md">
                <Search className="w-5 h-5 opacity-60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm khóa học, bài viết, video, ..."
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
              </div>
            </form>
            {/* Giữa: Search */}
            <UserMenu />


          </header>


          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function UserMenu() {
  const navigate = useNavigate();

  // state & handlers riêng cho UserMenu

  // demo auth
  const isAuthenticated = false;
  const userName = "TS";

  return (
    <div className="flex items-center gap-4">
      {/* Ô tìm kiếm */}


      {/* Nếu chưa đăng nhập */}
      {!isAuthenticated && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="text-sm font-medium hover:underline"
          >
            Đăng ký
          </button>
          <Button
            onClick={() => navigate("/login")}
            className="rounded-full px-4 bg-primary text-primary-foreground hover:opacity-90"
          >
            Đăng nhập
          </Button>
        </div>
      )}

      {/* Nếu đã đăng nhập */}
      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="w-4 h-4 mr-2" /> Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/inbox")}>
              <Mail className="w-4 h-4 mr-2" /> Hộp thư
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {/* TODO: logout */ }}>
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
