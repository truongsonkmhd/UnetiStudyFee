import React, { useEffect, useState } from 'react';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Users, Calendar, GraduationCap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classService from '@/services/classService';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import { actionAuth } from '@/components/context/AuthContext';

type TabId = 'courses' | 'classes';

const MyEnrollments: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabId) === 'classes' ? 'classes' : 'courses';

    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [myClasses, setMyClasses] = useState<ClazzResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [classesLoading, setClassesLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { jwtClaims } = actionAuth();

    const fetchMyEnrollments = async () => {
        setLoading(true);
        try {
            const response = await courseEnrollmentService.getMyEnrollments(undefined, 0, 100);
            if (response.items) {
                setEnrollments(response.items);
            }
        } catch (error) {
            console.error("Failed to fetch my enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyClasses = async () => {
        if (!jwtClaims?.userID) return;
        setClassesLoading(true);
        try {
            const classes = await classService.getMyClasses(jwtClaims.userID);
            setMyClasses(classes || []);
        } catch (error) {
            console.error("Failed to fetch my classes", error);
        } finally {
            setClassesLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEnrollments();
        fetchMyClasses();
    }, []);

    // Sync tab with URL query param
    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabId;
        if (tabParam === 'classes' || tabParam === 'courses') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const goToCourse = (slug: string) => {
        navigate(`/course/${slug}/learn`);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'REJECTED': return <XCircle className="h-4 w-4 text-destructive" />;
            case 'PENDING': return <Clock className="h-4 w-4 text-amber-500" />;
            default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const tabs = [
        { id: 'courses' as TabId, label: 'Khóa học', icon: BookOpen, count: enrollments.length },
        { id: 'classes' as TabId, label: 'Lớp học', icon: GraduationCap, count: myClasses.length },
    ];

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-center md:text-left"
                >
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Học tập của tôi</h1>
                    <p className="text-muted-foreground mt-2">Theo dõi tiến độ và bắt đầu học tập ngay hôm nay.</p>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex gap-2 mb-8 bg-muted/40 p-1.5 rounded-2xl w-fit border border-border"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${isActive
                                        ? 'bg-background text-foreground shadow-md border border-border'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted-foreground/20 text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'courses' ? (
                        <motion.div
                            key="courses"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid gap-6"
                                    >
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 w-full rounded-2xl bg-muted animate-pulse" />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid gap-6"
                                    >
                                        {enrollments.length > 0 ? (
                                            enrollments.map((enrollment, index) => (
                                                <motion.div
                                                    key={enrollment.enrollmentId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index * 0.1, 0.5) }}
                                                    className="group relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusClasses(enrollment.status)}`}>
                                                                    {getStatusIcon(enrollment.status)}
                                                                    {enrollment.status}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 italic">
                                                                    <Clock size={12} />
                                                                    Đăng ký: {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                                                                {enrollment.courseName}
                                                            </h3>

                                                            {enrollment.status === 'REJECTED' && enrollment.rejectionReason && (
                                                                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-xs text-destructive">
                                                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                                    <p><strong>Lý do từ chối:</strong> {enrollment.rejectionReason}</p>
                                                                </div>
                                                            )}

                                                            {enrollment.status === 'APPROVED' && (
                                                                <Button
                                                                    onClick={() => goToCourse(enrollment.slug)}
                                                                    className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20"
                                                                >
                                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                                    VÀO HỌC NGAY
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                                                <BookOpen size={32} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center p-20 text-center bg-card rounded-[2.5rem] border border-dashed border-border"
                                            >
                                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                                    <BookOpen className="text-muted-foreground h-10 w-10" />
                                                </div>
                                                <h3 className="text-xl font-black text-foreground">Bạn chưa tham gia khóa học nào</h3>
                                                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Hãy khám phá danh mục khóa học để bắt đầu hành trình chinh phục kiến thức!</p>
                                                <Button
                                                    onClick={() => navigate('/home')}
                                                    variant="outline"
                                                    className="mt-8 border-border hover:bg-muted font-bold rounded-xl"
                                                >
                                                    KHÁM PHÁ KHÓA HỌC
                                                </Button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="classes"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <AnimatePresence mode="wait">
                                {classesLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid gap-6"
                                    >
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 w-full rounded-2xl bg-muted animate-pulse" />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid gap-6"
                                    >
                                        {myClasses.length > 0 ? (
                                            myClasses.map((cls, index) => (
                                                <motion.div
                                                    key={cls.classId}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index * 0.1, 0.5) }}
                                                    className="group relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1 space-y-3">
                                                            {/* Status badge */}
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${cls.isActive
                                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                        : 'bg-muted text-muted-foreground border-border'
                                                                    }`}>
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    {cls.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                    #{cls.classCode}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                                                                {cls.className}
                                                            </h3>

                                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Users className="w-4 h-4" />
                                                                    GV: <strong className="text-foreground">{cls.instructorName}</strong>
                                                                </span>
                                                                {cls.startDate && (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Calendar className="w-4 h-4" />
                                                                        {new Date(cls.startDate).toLocaleDateString('vi-VN')}
                                                                        {cls.endDate ? ` – ${new Date(cls.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 flex items-center justify-center text-violet-500 border border-violet-500/10">
                                                                <GraduationCap size={32} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center p-20 text-center bg-card rounded-[2.5rem] border border-dashed border-border"
                                            >
                                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                                    <GraduationCap className="text-muted-foreground h-10 w-10" />
                                                </div>
                                                <h3 className="text-xl font-black text-foreground">Bạn chưa tham gia lớp học nào</h3>
                                                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Sử dụng mã mời từ giảng viên để tham gia lớp học của bạn.</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyEnrollments;
