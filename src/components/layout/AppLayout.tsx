import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // nếu có sẵn; nếu không có, giữ div tròn như cũ
import { useState, useMemo } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { LogOut, User as UserIcon, Mail } from "lucide-react";
import toast from "react-hot-toast";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold text-foreground">
              Quản Lý Dự Án Xây Dựng
            </h1>

            <div className="ml-auto flex items-center gap-4">
              <UserMenu />
            </div>
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
 const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Người dùng";
  const email = user?.email || "";
  const initials = useMemo(() => {
    const n = (user?.displayName || email || "U").trim();
    const parts = n.split(/\s+/);
    return (parts[0]?.[0] || "U").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [user, email]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Đã đăng xuất");
      navigate("/auth", { replace: true });
    } catch (e: any) {
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-muted transition"
            aria-label="Tài khoản người dùng"
          >
            {/* Avatar */}
            {Avatar ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-full grid place-items-center text-white text-sm">
                {initials}
              </div>
            )}
            {/* Tên */}
            <span className="text-sm font-medium">{displayName}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="font-semibold">{displayName}</span>
            {email ? (
              <span className="text-xs text-muted-foreground">{email}</span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenProfile(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            Thông tin tài khoản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Popup chi tiết tài khoản */}
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogDescription>Xem nhanh hồ sơ tài khoản của bạn.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4">
            {Avatar ? (
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-12 h-12 bg-primary rounded-full grid place-items-center text-white text-base">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <div className="text-base font-semibold">{displayName}</div>
              {email ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {email}
                </div>
              ) : null}
            </div>
          </div>

          {/* Nếu bạn có thêm trường profile khác (role, phone...), render tại đây */}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenProfile(false)}>Đóng</Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
