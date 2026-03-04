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
    Search,
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
} from "lucide-react";
import { chatboxCuImg, logoIcon } from "@/assets";
import { actionAuth } from "@/components/context/AuthContext";
import { toast } from "sonner";
import { PATHS } from "@/constants/paths";
import defaultAvatar from "@/assets/img/avatar-default.png";
import { APP_NAME } from "@/utils/config";

interface SidebarItem {
    label: string;
    icon: React.ReactNode;
    to: string;
    matchExact?: boolean;
}

const studentNavItems: SidebarItem[] = [
    {
        label: "Trang chủ",
        icon: <Home className="w-5 h-5" />,
        to: PATHS.HOME,
        matchExact: true,
    },
    {
        label: "Khóa học",
        icon: <BookOpen className="w-5 h-5" />,
        to: PATHS.MY_ENROLLMENTS,
        matchExact: true,
    },
    {
        label: "Lớp học",
        icon: <GraduationCap className="w-5 h-5" />,
        to: `${PATHS.MY_ENROLLMENTS}?tab=classes`,
        matchExact: false,
    },
    {
        label: "Xếp hạng",
        icon: <Trophy className="w-5 h-5" />,
        to: PATHS.RANKING,
        matchExact: true,
    },
    {
        label: "Lịch sử",
        icon: <FileText className="w-5 h-5" />,
        to: PATHS.POST_HISTORY,
        matchExact: true,
    },
];

function StudentSidebar() {
    const location = useLocation();

    const isActive = (item: SidebarItem) => {
        const [pathName, queryStr] = item.to.split("?");
        if (queryStr) {
            const params = new URLSearchParams(queryStr);
            const currentParams = new URLSearchParams(location.search);
            return (
                location.pathname === pathName &&
                [...params.entries()].every(([k, v]) => currentParams.get(k) === v)
            );
        }
        if (item.matchExact) {
            return location.pathname === pathName;
        }
        return location.pathname.startsWith(pathName);
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-[70px] bg-card border-r border-border flex flex-col items-center pt-4 pb-6 z-40 gap-1 shadow-sm">
            {/* Logo */}
            <NavLink to={PATHS.HOME} className="mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                        src={logoIcon}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                    />
                </div>
            </NavLink>

            <div className="w-8 border-t border-border mb-2" />

            {/* Nav items */}
            <nav className="flex flex-col items-center gap-1 w-full px-2">
                {studentNavItems.map((item) => {
                    const active = isActive(item);
                    return (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={[
                                "flex flex-col items-center justify-center gap-1 w-full py-2.5 px-1 rounded-xl transition-all duration-200 group",
                                active
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            ].join(" ")}
                        >
                            <span className={active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}>
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-bold leading-none tracking-tight text-center">
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom spacer - Settings */}
            <div className="mt-auto flex flex-col items-center gap-1 w-full px-2">
                <NavLink
                    to={PATHS.SETTINGS}
                    className={({ isActive }) =>
                        [
                            "flex flex-col items-center justify-center gap-1 w-full py-2.5 px-1 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        ].join(" ")
                    }
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-[9px] font-bold leading-none">Cài đặt</span>
                </NavLink>
            </div>
        </aside>
    );
}

export function StudentLayout() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const { jwtClaims, logout } = actionAuth();

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
        <div className="min-h-screen flex w-full bg-background">
            {/* Student Sidebar */}
            <StudentSidebar />

            {/* Main content area - offset by sidebar width */}
            <div className="flex-1 flex flex-col ml-[70px]">
                {/* HEADER */}
                <header className="sticky top-0 z-50 h-16 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-b border-border flex items-center gap-4 px-6 shadow-sm">
                    {/* Brand */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-sm text-foreground uppercase tracking-wide hidden md:block">
                            {APP_NAME}
                        </span>
                    </div>

                    {/* Search */}
                    <form onSubmit={onSearchSubmit} className="flex-1 flex justify-center">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 w-full max-w-lg transition-all focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/10">
                            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Tìm kiếm khóa học, bài viết, video, ..."
                                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                            />
                        </div>
                    </form>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle />

                        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>

                        {/* Avatar dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors">
                                    <img
                                        src={defaultAvatar}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {jwtClaims?.userName || "Sinh viên"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Sinh viên</p>
                                </div>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => navigate(PATHS.PROFILE_PAGE)}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Hồ sơ của tôi
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => navigate(PATHS.MY_ENROLLMENTS)}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Khóa học của tôi
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => navigate(`${PATHS.MY_ENROLLMENTS}?tab=classes`)}>
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Lớp học của tôi
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* MAIN */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Floating chat button */}
            <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
                <button
                    onClick={() => navigate("/chat")}
                    title="Chat hỏi đáp"
                    className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200 text-white"
                >
                    <MessageCircle className="h-5 w-5" />
                </button>
                <button
                    onClick={() => navigate("/chat")}
                    title="Hỗ trợ"
                    className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-card ring-1 ring-border shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
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
