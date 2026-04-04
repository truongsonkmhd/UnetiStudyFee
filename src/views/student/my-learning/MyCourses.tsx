import React, { useEffect, useState } from 'react';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Calendar, LayoutGrid, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/views/pages/component/CourseCard';
import { CourseCardResponse } from '@/model/course-admin/CourseCardResponse';
import { EmptyState } from '@/components/common/EmptyState';

type CourseSubTab = 'joined' | 'requests';

const MyCourses: React.FC = () => {
    const [courseSubTab, setCourseSubTab] = useState<CourseSubTab>('joined');
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchMyEnrollments();
    }, []);

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

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[300px] w-full rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/50" />
                    ))}
                </div>
            );
        }

        if (courseSubTab === 'joined') {
            const joinedEnrollments = enrollments.filter(e => e.status === 'APPROVED');
            if (joinedEnrollments.length > 0) {
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {joinedEnrollments.map((enrollment, index) => {
                            const courseCard: CourseCardResponse = {
                                courseId: enrollment.courseId,
                                title: enrollment.courseName,
                                slug: enrollment.slug,
                                shortDescription: '',
                                isPublished: true,
                                totalModules: enrollment.totalModules || 0,
                                enrolledCount: enrollment.enrolledCount || 0,
                                capacity: enrollment.capacity || 0,
                                imageUrl: enrollment.imageUrl,
                                instructorName: enrollment.instructorName,
                            };
                            return (
                                <motion.div
                                    key={enrollment.enrollmentId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                                >
                                    <CourseCard course={courseCard} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                );
            }
            return (
                <EmptyState
                    title="Hành trình mới đang chờ bạn"
                    description="Khám phá hàng ngàn khóa học chất lượng để bắt đầu nâng tầm kiến thức ngay hôm nay."
                />
            );
        } else {
            const requestEnrollments = enrollments.filter(e => e.status !== 'APPROVED');
            if (requestEnrollments.length > 0) {
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {requestEnrollments.map((enrollment, index) => (
                            <motion.div
                                key={enrollment.enrollmentId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="relative bg-card/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col justify-between">
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest ${getStatusClasses(enrollment.status)}`}>
                                                {getStatusIcon(enrollment.status)}
                                                {enrollment.status === 'PENDING' ? 'Đang chờ duyệt' : 'Đã từ chối'}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] bg-muted/30 px-4 py-2 rounded-full">
                                                <Calendar size={14} className="text-primary" />
                                                {new Date(enrollment.requestedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-black text-foreground mb-6 group-hover:text-primary transition-colors leading-tight tracking-tight">
                                            {enrollment.courseName}
                                        </h3>

                                        {enrollment.status === 'REJECTED' && enrollment.rejectionReason && (
                                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-destructive/5 border border-destructive/10 text-sm font-medium text-destructive mt-6">
                                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <span className="text-[10px] uppercase font-black opacity-60 block">Lý do từ chối:</span>
                                                    <p>{enrollment.rejectionReason}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 flex items-center justify-between gap-4 relative z-10">
                                        <div className="text-sm font-bold text-muted-foreground/60 italic">
                                            {enrollment.status === 'PENDING' ? 'Hồ sơ đang được xem xét...' : 'Vui lòng liên hệ hỗ trợ để biết thêm chi tiết'}
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                            <BookOpen size={28} />
                                        </div>
                                    </div>


                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                );
            }
            return (
                <EmptyState
                    title="Chưa có yêu cầu nào"
                    description="Các yêu cầu đăng ký khóa học của bạn sẽ hiển thị chi tiết tại đây để bạn tiện theo dõi."

                />
            );
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">


            <div className="max-w-[2000px] mx-auto px-4 sm:px-10 py-12 md:py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-3 mb-16 p-2 bg-muted/40 rounded-[2rem] w-fit border border-border/50"
                >
                    {[
                        { id: 'joined', label: 'Khóa học đã tham gia', icon: LayoutGrid },
                        { id: 'requests', label: 'Trạng thái đăng ký', icon: ListChecks }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = courseSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setCourseSubTab(tab.id as CourseSubTab)}
                                className={`relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-500 ${active
                                    ? 'bg-blue-600 text-white'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {active && (
                                    <motion.div
                                        layoutId="tabBackground"
                                        className="absolute inset-0 bg-blue-600 rounded-[1.5rem] -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={courseSubTab}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="min-h-[500px]"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyCourses;
