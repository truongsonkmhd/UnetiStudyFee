import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { GlobalSearch } from "./GlobalSearch";

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
            <header className="sticky top-0 z-50 h-20 bg-background border-b border-border/50 flex items-center">
                <div className="mx-auto max-w-[2000px] w-full flex items-center justify-between px-4 sm:px-10">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 shrink-0">
                            <NavLink to={PATHS.HOME} className="flex items-center gap-2 group">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    <img src={logoIcon} alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <span className="font-black text-xl text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                                    {APP_NAME}
                                </span>
                            </NavLink>
                        </div>

                        {/* Modern Minimal Navigation */}
                        <nav className="hidden md:flex items-center gap-10 ml-8">
                            {studentNavItems.map((item) => {
                                const active = isActive(item);
                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}
                                        className={`
                                            relative flex items-center text-[13px] font-bold uppercase tracking-[0.15em] transition-all duration-300 py-1
                                            ${active
                                                ? "text-primary"
                                                : "text-muted-foreground/70 hover:text-foreground"}
                                        `}
                                    >
                                        {item.label}
                                        {active && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full"
                                            />
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                        <div className="hidden xl:block">
                            <GlobalSearch />
                        </div>

                        <div className="flex items-center gap-4 border-l border-border/50 pl-6 mr-2">
                            <ThemeToggle />
                            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted rounded-full">
                                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background"></span>
                            </button>
                        </div>

                        {/* Avatar dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-slate-800 hover:ring-blue-500/50 transition-all duration-300">
                                    <img
                                        src={jwtClaims?.avatar || defaultAvatar}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                                    />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64 bg-popover border-border text-popover-foreground p-2">
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
                    className="group relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Hỏi đáp AI
                    </span>

                </button>
                <button
                    onClick={() => navigate("/chat")}
                    title="Hỗ trợ"
                    className="relative flex items-center justify-center h-12 w-12 rounded-full bg-slate-800 border border-slate-700 hover:scale-105 transition-all"
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
