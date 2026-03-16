import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Bell,
    LogOut,
    User as UserIcon,
    Home,
    Trophy,
    BookOpen,
    GraduationCap,
    FileText,
    Settings,
    MessageCircle,
    Zap,
    Crown,
    ChevronDown,
    Search,
} from "lucide-react";
import { chatboxCuImg, logoIcon } from "@/assets";
import { actionAuth } from "@/components/context/AuthContext";
import { toast } from "sonner";
import { PATHS } from "@/constants/paths";
import defaultAvatar from "@/assets/img/avatar-default.png";
import { APP_NAME } from "@/utils/config";
import { Button } from "@/components/ui/button";

interface NavItem {
    label: string;
    description?: string;
    to: string;
    matchExact?: boolean;
    badge?: string;
}

const studentNavItems: NavItem[] = [
    {
        label: "Trang chủ",
        to: PATHS.HOME,
        matchExact: true,
    },
    {
        label: "Khóa học của tôi",
        to: PATHS.MY_ENROLLMENTS,
        matchExact: true,
    },
    {
        label: "Lớp học của tôi",
        to: PATHS.MY_CLASSES,
        matchExact: true
    },
    {
        label: "Xếp hạng",
        to: PATHS.RANKING,
        matchExact: true
    },
];

export function StudentLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [q, setQ] = useState("");
    const { jwtClaims, logout } = actionAuth();

    const isActive = (item: NavItem) => {
        return location.pathname === item.to;
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
        <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
            <header className="sticky top-0 z-50 h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center shadow-sm dark:shadow-2xl dark:shadow-black/20">
                <div className="mx-auto max-w-[2000px] w-full flex items-center justify-between px-4 sm:px-10">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 shrink-0">
                            <NavLink to={PATHS.HOME} className="flex items-center gap-2 group">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                    <img src={logoIcon} alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <span className="font-black text-2xl bg-gradient-to-r from-primary to-slate-400 dark:from-white bg-clip-text text-transparent uppercase tracking-tighter hidden lg:block">
                                    {APP_NAME}
                                </span>
                            </NavLink>
                        </div>

                        {/* NAV AS TABS (Dịch sang trái) */}
                        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                            {studentNavItems.map((item) => {
                                const active = isActive(item);
                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}
                                        className={[
                                            "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-base font-bold transition-all duration-300 transform",
                                            active
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-100"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 px-4 py-2.5 text-base font-bold text-slate-400 hover:text-white transition-colors">
                                        Thêm <ChevronDown className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                                    <DropdownMenuItem onClick={() => navigate(PATHS.SETTINGS)} className="focus:bg-muted">
                                        <Settings className="mr-2 h-4 w-4" /> Cài đặt
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden xl:flex items-center relative group">
                            <Search className="absolute left-4 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-64 bg-muted/50 border border-border/50 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-background transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/50">
                            <ThemeToggle />

                            <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                            </button>
                        </div>

                        {/* Avatar dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-slate-800 hover:ring-blue-500/50 transition-all duration-300">
                                    <img
                                        src={jwtClaims?.avatar || defaultAvatar}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover shadow-xl ring-2 ring-border"
                                    />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64 bg-popover border-border text-popover-foreground p-2 shadow-2xl">
                                <div className="flex items-center gap-3 px-3 py-4 mb-2 bg-muted/50 rounded-xl">
                                    <img src={jwtClaims?.avatar || defaultAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
                                    <div>
                                        <p className="text-base font-black text-foreground">{jwtClaims?.userName || "Sinh viên"}</p>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Premium Member</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem onClick={() => navigate(PATHS.PROFILE_PAGE)} className="rounded-lg py-2.5 focus:bg-muted">
                                    <UserIcon className="mr-3 h-4 w-4 text-blue-500" /> Hồ sơ cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(PATHS.MY_ENROLLMENTS)} className="rounded-lg py-2.5 focus:bg-muted">
                                    <BookOpen className="mr-3 h-4 w-4 text-emerald-500" /> Khóa học của tôi
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(PATHS.MY_CLASSES)} className="rounded-lg py-2.5 focus:bg-muted">
                                    <GraduationCap className="mr-3 h-4 w-4 text-purple-500" /> Lớp học của tôi
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem onClick={handleLogout} className="rounded-lg py-2.5 text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col pt-4">
                <main className="flex-1 overflow-y-auto pb-20">
                    <Outlet />
                </main>
            </div>
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
                <button
                    onClick={() => navigate("/chat")}
                    title="Trợ lý AI"
                    className="group relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Hỏi đáp AI
                    </span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </button>
                <button
                    onClick={() => navigate("/chat")}
                    title="Hỗ trợ"
                    className="relative flex items-center justify-center h-12 w-12 rounded-full bg-slate-800 border border-slate-700 shadow-xl hover:scale-105 transition-all"
                >
                    <img
                        src={chatboxCuImg}
                        alt="Chat"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                </button>
            </div>
        </div>
    );
}
