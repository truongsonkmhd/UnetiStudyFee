import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Users,
    Calendar,
    BookOpen,
    Trophy,
    MessageSquare,
    ChevronLeft,
    Clock,
    LayoutDashboard,
    FileText,
    Star,
    CheckCircle2,
    Code2,
    Play,
    Lock,
    ArrowRight,
    Video,
    Zap,
    PlayCircle,
    Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, Avatar, Badge, Empty } from 'antd';
import classService from '@/services/classService';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const ClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [clazz, setClazz] = useState<ClazzResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState('2');
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!classId) return;
            try {
                setLoading(true);
                const res = await classService.student.getById(classId);
                setClazz(res);
            } catch (err) {
                console.error("Failed to fetch class detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [classId]);

    // Load danh sách khóa học của lớp
    useEffect(() => {
        if (!classId) return;
        setLoadingCourses(true);
        classService.student.getCoursesInClass(classId)
            .then(data => setCourses(data || []))
            .catch(err => console.error('Failed to fetch class courses', err))
            .finally(() => setLoadingCourses(false));
    }, [classId]);

    const handleOpenCourse = (slug: string) => {
        navigate(`/course/${slug}/learn`);
    };

    const handleJoinExam = (examId: string) => {
        if (!classId) return;
        navigate(`/my-classes/${classId}/exam/${examId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
                </div>
            </div>
        );
    }

    if (!clazz) return <div className="p-20 text-center text-white">Class not found</div>;



    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30 pb-20 overflow-x-hidden">


            <div className="max-w-full mx-auto px-6 relative z-10 pt-8">
                {/* Back Button */}
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <ChevronLeft size={18} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Quay lại lớp học</span>
                </motion.button>

                {/* Hero Section */}
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <Badge status={clazz.isActive ? "processing" : "default"} color={clazz.isActive ? "#10b981" : "#64748b"} />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${clazz.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {clazz.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                                    </span>
                                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Mã lớp: {clazz.classCode}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent leading-tight">
                                    {clazz.className}
                                </h1>

                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar size={56} className="ring-2 ring-primary/20 p-0.5 bg-slate-800" src={`https://ui-avatars.com/api/?name=${clazz.instructorName}&background=4f46e5&color=fff`} />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] uppercase text-slate-500 font-black tracking-widest">Giảng viên Chủ nhiệm</p>
                                            <p className="text-base font-bold text-white tracking-wide">{clazz.instructorName}</p>
                                        </div>
                                    </div>

                                    <div className="h-12 w-[1px] bg-white/10 hidden md:block" />

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] uppercase text-slate-500 font-black tracking-widest">Ngày khai giảng</p>
                                            <p className="text-base font-bold text-white tracking-wide">
                                                {clazz.startDate ? dayjs(clazz.startDate).format('DD/MM/YYYY') : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 p-4 md:p-8 min-h-[600px]">
                    <Tabs
                        defaultActiveKey="2"
                        onChange={setActiveTab}
                        className="custom-classroom-tabs"
                        tabBarStyle={{ marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <TabPane
                            tab={
                                <span className="flex items-center gap-2 px-4 py-2">
                                    <LayoutDashboard size={18} /> Lộ trình
                                </span>
                            }
                            key="1"
                        >
                            {(() => {
                                type Phase = {
                                    phase: number;
                                    title: string;
                                    description: string;
                                    type: 'video' | 'lesson' | 'coding' | 'exam';
                                    duration: string;
                                    startDate: string;
                                    endDate: string;
                                    status: 'completed' | 'current' | 'locked';
                                };

                                const phases: Phase[] = [
                                    {
                                        phase: 1,
                                        title: 'Giới thiệu khóa học',
                                        description: 'Tổng quan về nội dung, mục tiêu và phương pháp học tập.',
                                        type: 'video',
                                        duration: '15 phút',
                                        startDate: '01/03',
                                        endDate: '07/03',
                                        status: 'completed',
                                    },
                                    {
                                        phase: 2,
                                        title: 'Kiến thức nền tảng',
                                        description: 'Nắm vững các khái niệm cốt lõi và nguyên lý cơ bản.',
                                        type: 'lesson',
                                        duration: '45 phút',
                                        startDate: '08/03',
                                        endDate: '14/03',
                                        status: 'completed',
                                    },
                                    {
                                        phase: 3,
                                        title: 'Bài tập thực hành',
                                        description: 'Áp dụng kiến thức vào bài tập lập trình và trắc nghiệm.',
                                        type: 'coding',
                                        duration: '60 phút',
                                        startDate: '15/03',
                                        endDate: '21/03',
                                        status: 'current',
                                    },
                                    {
                                        phase: 4,
                                        title: 'Dự án thực chiến',
                                        description: 'Xây dựng dự án hoàn chỉnh tổng hợp toàn bộ kiến thức.',
                                        type: 'coding',
                                        duration: '90 phút',
                                        startDate: '22/03',
                                        endDate: '28/03',
                                        status: 'locked',
                                    },
                                    {
                                        phase: 5,
                                        title: 'Kiểm tra đánh giá',
                                        description: 'Bài kiểm tra tổng hợp đánh giá mức độ hoàn thành.',
                                        type: 'exam',
                                        duration: '30 phút',
                                        startDate: '29/03',
                                        endDate: '04/04',
                                        status: 'locked',
                                    },
                                ];

                                const getColor = (type: string) => {
                                    switch (type) {
                                        case 'video': return { gradient: 'from-sky-500 to-cyan-400', glow: 'shadow-sky-500/40', text: 'text-sky-400', bg: 'bg-sky-500', light: 'bg-sky-500/10', border: 'border-sky-500/30', ring: 'ring-sky-500/20' };
                                        case 'lesson': return { gradient: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500', light: 'bg-violet-500/10', border: 'border-violet-500/30', ring: 'ring-violet-500/20' };
                                        case 'coding': return { gradient: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500', light: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/20' };
                                        case 'exam': return { gradient: 'from-amber-500 to-orange-400', glow: 'shadow-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500', light: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/20' };
                                        default: return { gradient: 'from-indigo-500 to-blue-400', glow: 'shadow-indigo-500/40', text: 'text-indigo-400', bg: 'bg-indigo-500', light: 'bg-indigo-500/10', border: 'border-indigo-500/30', ring: 'ring-indigo-500/20' };
                                    }
                                };

                                const getIcon = (type: string) => {
                                    switch (type) {
                                        case 'video': return Video;
                                        case 'lesson': return BookOpen;
                                        case 'coding': return Code2;
                                        case 'exam': return Trophy;
                                        default: return FileText;
                                    }
                                };


                                return (
                                    <div className="py-6">
                                        {/* Horizontal Timeline */}
                                        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                                            <div className="flex items-start gap-0" style={{ minWidth: phases.length * 240 }}>
                                                {phases.map((item, index) => {
                                                    const Icon = getIcon(item.type);
                                                    const colors = getColor(item.type);
                                                    const isCompleted = item.status === 'completed';
                                                    const isCurrent = item.status === 'current';
                                                    const isLocked = item.status === 'locked';
                                                    const isLast = index === phases.length - 1;

                                                    return (
                                                        <motion.div
                                                            key={item.phase}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.5, delay: index * 0.12 }}
                                                            className="flex items-start shrink-0"
                                                            style={{ width: isLast ? 220 : undefined }}
                                                        >
                                                            {/* Phase Column */}
                                                            <div className="flex flex-col items-center" style={{ width: 220 }}>
                                                                {/* Top: Phase Circle + Connector */}
                                                                <div className="flex items-center w-full">
                                                                    {/* Left connector */}
                                                                    {index > 0 && (
                                                                        <div className="flex-1 h-[3px] relative">
                                                                            <div className={`absolute inset-0 rounded-full ${isCompleted || isCurrent
                                                                                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 opacity-80'
                                                                                : 'bg-slate-700/40'
                                                                                }`} />
                                                                        </div>
                                                                    )}
                                                                    {index === 0 && <div className="flex-1" />}

                                                                    {/* Circle */}
                                                                    <div className="relative shrink-0">
                                                                        <div className={`
                                                                            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative z-10
                                                                            ${isCompleted
                                                                                ? `bg-gradient-to-br ${colors.gradient} shadow-xl ${colors.glow} text-white`
                                                                                : isCurrent
                                                                                    ? `bg-gradient-to-br ${colors.gradient} shadow-2xl ${colors.glow} text-white ring-4 ${colors.ring}`
                                                                                    : 'bg-slate-800 border-2 border-slate-600/50 text-slate-500'
                                                                            }
                                                                        `}>
                                                                            {isCompleted ? (
                                                                                <CheckCircle2 size={28} strokeWidth={2.5} />
                                                                            ) : isCurrent ? (
                                                                                <>
                                                                                    <Icon size={26} />
                                                                                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.gradient} animate-ping opacity-15`} />
                                                                                </>
                                                                            ) : isLocked ? (
                                                                                <Lock size={22} />
                                                                            ) : (
                                                                                <span className="text-xl font-black">{item.phase}</span>
                                                                            )}
                                                                        </div>
                                                                        {/* Phase number label */}
                                                                        <div className={`
                                                                            absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black z-20 border-2 border-[#0f172a]
                                                                            ${isCompleted
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : isCurrent
                                                                                    ? `bg-gradient-to-br ${colors.gradient} text-white`
                                                                                    : 'bg-slate-700 text-slate-400'
                                                                            }
                                                                        `}>
                                                                            {item.phase}
                                                                        </div>
                                                                    </div>

                                                                    {/* Right connector */}
                                                                    {!isLast ? (
                                                                        <div className="flex-1 h-[3px] relative">
                                                                            <div className={`absolute inset-0 rounded-full ${isCompleted
                                                                                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 opacity-80'
                                                                                : 'bg-slate-700/40'
                                                                                }`} />
                                                                            {/* Animated dot */}
                                                                            {isCurrent && (
                                                                                <motion.div
                                                                                    animate={{ x: [0, 60, 0] }}
                                                                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                                                                    className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${colors.gradient} shadow-md ${colors.glow}`}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex-1" />
                                                                    )}
                                                                </div>

                                                                {/* Time badge */}
                                                                <div className={`mt-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isCompleted
                                                                    ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400/80'
                                                                    : isCurrent
                                                                        ? `${colors.light} ${colors.border} ${colors.text}`
                                                                        : 'bg-slate-800/40 border-slate-700/30 text-slate-500'
                                                                    }`}>
                                                                    <Calendar size={9} />
                                                                    {item.startDate} — {item.endDate}
                                                                </div>

                                                                {/* Content Card */}
                                                                <div className={`
                                                                    mt-4 w-[200px] rounded-2xl border p-4 text-center transition-all duration-300
                                                                    ${isCompleted
                                                                        ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                                                        : isCurrent
                                                                            ? `bg-white/[0.06] border-white/10 shadow-lg ${colors.glow}`
                                                                            : 'bg-white/[0.02] border-white/[0.03] opacity-50'
                                                                    }
                                                                    ${!isLocked ? 'cursor-pointer hover:scale-[1.02]' : ''}
                                                                `}>
                                                                    {/* Status badge */}
                                                                    <div className="flex justify-center mb-3">
                                                                        {isCompleted && (
                                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                                                <CheckCircle2 size={8} /> Hoàn thành
                                                                            </span>
                                                                        )}
                                                                        {isCurrent && (
                                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1 animate-pulse">
                                                                                <Zap size={8} /> Đang học
                                                                            </span>
                                                                        )}
                                                                        {isLocked && (
                                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-full border border-slate-500/20 flex items-center gap-1">
                                                                                <Lock size={8} /> Chưa mở
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Title */}
                                                                    <h4 className={`text-sm font-black mb-1.5 leading-tight ${isLocked ? 'text-slate-500' : 'text-white'
                                                                        }`}>
                                                                        {item.title}
                                                                    </h4>

                                                                    {/* Description */}
                                                                    <p className="text-[11px] text-slate-400/80 font-medium leading-relaxed line-clamp-2 mb-3">
                                                                        {item.description}
                                                                    </p>

                                                                    {/* Duration */}
                                                                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                                        <Clock size={9} /> {item.duration}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Scroll hint for mobile */}
                                        <div className="flex justify-center mt-4 md:hidden">
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                <ArrowRight size={10} /> Vuốt để xem thêm
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </TabPane>

                        {/* Tab Khóa học */}
                        <TabPane
                            tab={
                                <span className="flex items-center gap-2 px-4 py-2">
                                    <BookOpen size={18} /> Khóa học
                                    {courses.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black">
                                            {courses.length}
                                        </span>
                                    )}
                                </span>
                            }
                            key="0"
                        >
                            <div className="max-w-full mx-auto py-8">
                                {loadingCourses ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                                        ))}
                                    </div>
                                ) : courses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {courses.map((course, i) => (
                                            <motion.div
                                                key={course.courseId}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                                onClick={() => handleOpenCourse(course.slug)}
                                                className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden"
                                            >
                                                {/* Glow effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                                                <div className="relative z-10 flex items-start gap-4">
                                                    {/* Thumbnail */}
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                                                        {course.imageUrl ? (
                                                            <img
                                                                src={course.imageUrl}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-indigo-400">
                                                                <Layers size={28} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors leading-snug mb-1.5 line-clamp-2">
                                                            {course.title}
                                                        </h4>
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            {course.level && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                                                                    {course.level}
                                                                </span>
                                                            )}
                                                            {course.category && (
                                                                <span className="text-[9px] font-bold text-slate-500 truncate">
                                                                    {course.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Play button */}
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                        <PlayCircle size={20} />
                                                    </div>
                                                </div>

                                                {/* Bottom divider */}
                                                <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Bắt đầu học ngay</span>
                                                    <ArrowRight size={12} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty
                                        description={
                                            <span className="text-slate-500 font-black uppercase tracking-widest text-xs">
                                                Chưa có khóa học nào được giao
                                            </span>
                                        }
                                    />
                                )}
                            </div>
                        </TabPane>

                        <TabPane
                            tab={
                                <span className="flex items-center gap-2 px-4 py-2">
                                    <Trophy size={20} /> Bài thi
                                </span>
                            }
                            key="2"
                        >
                            <div className="max-w-full mx-auto py-10">
                                {(() => {
                                    // Lọc bỏ bài thi đã hết thời gian
                                    const now = new Date();
                                    const activeContests = (clazz.contests || []).filter(contest => {
                                        if (!contest.scheduledEndTime) return true;
                                        return new Date(contest.scheduledEndTime) >= now;
                                    });

                                    const getContestStatus = (contest: any) => {
                                        const now = new Date();
                                        const start = contest.scheduledStartTime ? new Date(contest.scheduledStartTime) : null;
                                        const end = contest.scheduledEndTime ? new Date(contest.scheduledEndTime) : null;

                                        if (start && now < start) return { label: 'Sắp diễn ra', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
                                        if (end && now > end) return { label: 'Đã kết thúc', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
                                        return { label: 'Đang diễn ra', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
                                    };

                                    return activeContests.length > 0 ? (
                                        <div className="space-y-4">
                                            {activeContests.map((contest, i) => {
                                                const status = getContestStatus(contest);
                                                const isUpcoming = status.label === 'Sắp diễn ra';
                                                return (
                                                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                                <Trophy size={28} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">
                                                                        {contest.contestInfo?.title || "BÀI THI CHƯA CÓ TIÊU ĐỀ"}
                                                                    </h4>
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${status.color}`}>
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-2">
                                                                    {contest.contestInfo?.description || "Không có mô tả"}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-1">
                                                                    <span className="flex items-center gap-1 text-amber-500/80"><Clock size={12} /> {contest.durationInMinutes} phút</span>
                                                                    <span className="flex items-center gap-1 text-indigo-400/80"><Star size={12} /> Hệ số: {contest.weight}</span>
                                                                    <span className="flex items-center gap-1 text-slate-400"><LayoutDashboard size={12} /> {contest.contestInfo?.codingExerciseCount || 0} BT / {contest.contestInfo?.quizQuestionCount || 0} Quiz</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleJoinExam(contest.classContestId)}
                                                            disabled={isUpcoming}
                                                            className={`px-6 py-3 rounded-2xl border text-sm font-black transition-all ${isUpcoming
                                                                ? 'border-slate-700 text-slate-500 cursor-not-allowed'
                                                                : 'border-white/10 text-white hover:bg-white hover:text-black'
                                                                }`}
                                                        >
                                                            {isUpcoming ? 'CHƯA MỞ' : 'THAM GIA'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <Empty description={<span className="text-slate-500 font-black uppercase tracking-widest text-xs">Hiện tại chưa có bài tập nào</span>} />
                                    );
                                })()}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>

            <style>{`
                .custom-classroom-tabs .ant-tabs-nav::before {
                    border-bottom: none !important;
                }
                .custom-classroom-tabs .ant-tabs-tab {
                    color: #94a3b8 !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    font-size: 11px !important;
                    transition: all 0.3s ease !important;
                    padding: 12px 0 !important;
                }
                .custom-classroom-tabs .ant-tabs-tab-active {
                    color: #fff !important;
                }
                .custom-classroom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #fff !important;
                }
                .custom-classroom-tabs .ant-tabs-tab:hover {
                    color: #fff !important;
                }
                .custom-classroom-tabs .ant-tabs-ink-bar {
                    background: #4f46e5 !important;
                    height: 3px !important;
                    border-radius: 3px 3px 0 0 !important;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.6) !important;
                }
            `}</style>
        </div>
    );
};

export default ClassDetail;
