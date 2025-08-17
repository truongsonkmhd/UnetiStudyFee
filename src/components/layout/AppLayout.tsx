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
import { useState } from "react";
import {
  LogOut,
  User as UserIcon,
  Mail,
  Search,
  Bell,
  MessageCircle,
} from "lucide-react"; // ⟵ thêm MessageCircle
import AuthDialog from "@/views/login-and-registor/AuthDialog";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { chatboxCuImg } from "@/assets";

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
          <header
            className="sticky top-0 z-50 h-16 bg-card/80 backdrop-blur
                     supports-[backdrop-filter]:bg-card/60 border-b
                     flex items-center gap-4 pl-4 pr-6"
          >
            {/* Trái: Toggle + tiêu đề */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            {/* Giữa: Search */}
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

        {/* Nút chat nổi góc phải dưới */}
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
      className="
        inline-flex items-center justify-center
        h-14 w-14 rounded-full
        bg-white ring-1 ring-black/10
        shadow-lg hover:shadow-xl
        transition-transform duration-200 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-violet-300
      "
    >
      <img
        src={chatboxCuImg}
        alt="Chat"
        className="h-17 w-17 rounded-full object-cover"
        draggable={false}
      />
      {unread > 0 && (
        <span
          className="
            absolute -top-1 -right-1 min-w-[20px] h-5 px-1
            bg-red-500 text-white text-[11px] leading-5
            rounded-full text-center shadow
          "
        >
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
      className="
        inline-flex items-center justify-center
        h-14 w-14 rounded-full
        bg-gradient-to-br from-indigo-500 to-violet-600
        shadow-lg hover:shadow-xl
        transition-transform duration-200 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-violet-300
        text-white
        relative
      "
    >
      <MessageCircle className="h-6 w-6" />
      {unread > 0 && (
        <span
          className="
            absolute -top-1 -right-1 min-w-[20px] h-5 px-1
            bg-red-500 text-white text-[11px] leading-5
            rounded-full text-center shadow
          "
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<null | "login" | "signup">(null);

  // demo auth
  const isAuthenticated = false;
  const userName = "TS";

  return (
    <div className="flex items-center gap-5">
      {/* Nếu chưa đăng nhập */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen("signup")}
            className="rounded-full px-4"
          >
            Đăng ký
          </Button>
          <Button
            onClick={() => setOpen("login")} // mở dialog
            className="rounded-full px-4 hover:opacity-90"
          >
            Đăng nhập
          </Button>
          {open && (
            <AuthDialog
              mode={open}
              onClose={() => setOpen(null)}
              onSwitch={(m) => setOpen(m)} // cho phép chuyển trong dialog
            />
          )}{" "}
        </div>
      )}

      {/* Nếu đã đăng nhập */}
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          {/* Nút Khóa học của tôi */}
          <button
            onClick={() => navigate("/my-courses")}
            className="flex items-center gap-1 text-sm font-medium"
          >
            Khóa học của tôi
          </button>

          {/* Nút chuông thông báo */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative"
          >
            <Bell className="w-6 h-6" />
            {/* Badge số thông báo */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              3
            </span>
          </button>

          {/* Dropdown avatar */}
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
              <DropdownMenuItem
                onClick={() => {
                  /* TODO: logout */
                }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
