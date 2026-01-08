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
import { createPortal } from "react-dom";
import {
  Search,
  Bell,
  MessageCircle,
  LogOut,
  User as UserIcon,
  Mail,
} from "lucide-react";
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
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />

          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-50 h-16 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b flex items-center gap-4 pl-4 pr-6">
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
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </main>
          </div>

          <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
            <ChatQAButton />
            <ChatQAButton2 />
          </div>
        </div>
      </SidebarProvider>
    </>
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
      className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white ring-1 ring-black/10 shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-300"
    >
      <img
        src={chatboxCuImg}
        alt="Chat"
        className="h-17 w-17 rounded-full object-cover"
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
      className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-300 text-white relative"
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
