import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Check, Plus, Minus, Clock, Battery, BarChart, Film, Users, ChevronLeft, Star, Calendar } from 'lucide-react';
import courseService from '@/services/courseService';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import { toast } from 'sonner';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import webSocketService from '@/services/webSocketService';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';

const CourseDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseTreeResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
    const [enrollmentStatus, setEnrollmentStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchCourse(slug);
        }
        return () => {
            if (course?.courseId) {
                webSocketService.unsubscribe(`/topic/course/${course.courseId}/enrollments`);
            }
        };
    }, [slug, course?.courseId]);

    const fetchCourse = async (courseSlug: string) => {
        try {
            setLoading(true);
            const data = await courseService.getCourseTreeBySlug(courseSlug);
            setCourse(data);

            // Fetch enrollment status if course is loaded
            if (data && data.courseId) {
                checkEnrollmentStatus(data.courseId);
                subscribeToEnrollments(data.courseId);
            }

            // Auto open first module
            if (data.modules && data.modules.length > 0) {
                setOpenModules({ [data.modules[0].moduleId]: true });
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollmentStatus = async (courseId: string) => {
        try {
            const status = await courseEnrollmentService.getEnrollmentStatus(courseId);
            if (status) {
                setEnrollmentStatus(status.status as any);
            } else {
                setEnrollmentStatus(null);
            }
        } catch (error) {
            console.error("Failed to check enrollment status", error);
        }
    };

    const subscribeToEnrollments = (courseId: string) => {
        webSocketService.subscribe(`/topic/course/${courseId}/enrollments`, (data: EnrollmentResponse) => {
            // Check if the update is for the current student
            // Note: In a real app we should compare with current student ID
            // For now, since it's a topic for this course, any approval/rejection will trigger it
            // Backend should ideally send only to the student, or we filter here
            console.log("WebSocket enrollment update:", data);

            // Re-fetch status to be sure and update UI
            checkEnrollmentStatus(courseId);

            if (data.status === 'APPROVED') {
                toast.success(`Đăng ký khóa học "${data.courseName}" của bạn đã được phê duyệt!`);
            } else if (data.status === 'REJECTED') {
                toast.error(`Đăng ký khóa học "${data.courseName}" của bạn đã bị từ chối.`);
            }
        });
    };

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleExpandAll = () => {
        if (!course) return;
        const allOpen = course.modules.reduce((acc, m) => ({ ...acc, [m.moduleId]: true }), {});
        setOpenModules(allOpen);
    };

    const [enrollmentLoading, setEnrollmentLoading] = useState(false);

    const handleEnroll = async () => {
        if (!course) return;
        try {
            setEnrollmentLoading(true);
            await courseEnrollmentService.requestEnrollment(course.courseId);
            toast.success("Đăng ký thành công! Vui lòng chờ giáo viên duyệt.");
            checkEnrollmentStatus(course.courseId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setEnrollmentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="min-h-screen flex items-center justify-center text-foreground">Course not found</div>;
    }

    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);
    // Dynamic stats
    const formattedDuration = "28h 05m"; // Duration is not yet available in CourseTreeResponse modules sum
    const studentCount = course.enrolledCount || 0;
    const rating = course.rating || 5.0; // Default to 5.0 if no rating
    const ratingCount = course.ratingCount || 0;
    const lastUpdated = course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* --- HERO HEADER SECTION --- */}
            <div className="bg-foreground text-background pt-8 pb-12 lg:pt-12 lg:pb-24 px-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />

                <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col lg:flex-row gap-8">
                    {/* Left Content of Header */}
                    <div className="flex-1 lg:max-w-[65%]">
                        {/* BreadCrumb / Back */}
                        <div className="flex items-center gap-2 mb-6 text-background/80 font-medium text-sm">
                            <button onClick={() => navigate(-1)} className="hover:text-background flex items-center gap-1 transition-colors">
                                <ChevronLeft size={16} /> Quay lại
                            </button>
                            <span className="opacity-50">/</span>
                            <span className="text-primary font-semibold uppercase tracking-wider text-xs">Phát triển Web</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                            {course.title}
                        </h1>

                        <div
                            className="text-lg text-background/90 mb-6 leading-relaxed max-w-3xl line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: course.description || course.title }}
                        />

                        {/* Meta Stats */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-background/80">
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="text-background font-bold text-base">{rating}</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= Math.round(rating) ? "currentColor" : "none"} className={i <= Math.round(rating) ? "" : "text-background/40"} />)}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users size={16} /> {studentCount.toLocaleString()} học viên
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} /> Cập nhật {lastUpdated}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT & SIDEBAR CONTAINER --- */}
            <div className="max-w-[1440px] mx-auto px-6 -mt-8 lg:-mt-16 flex flex-col lg:flex-row gap-10 relative z-20">

                {/* Left Column content */}
                <div className="flex-1 min-w-0">

                    {/* 'What you will learn' Card */}
                    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm mb-10">
                        <h2 className="text-xl lg:text-2xl font-bold mb-6 text-foreground">Bạn sẽ học được gì?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Hiểu rõ các khái niệm cốt lõi của lập trình",
                                "Xây dựng các dự án thực tế từ A-Z",
                                "Làm chủ công nghệ và best practices mới nhất",
                                "Tư duy lập trình và giải quyết vấn đề chuyên sâu",
                                "Tự tin ứng tuyển vào các công ty công nghệ lớn",
                                "Kỹ năng làm việc với Git, Terminal và Deploy",
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm lg:text-base text-card-foreground">
                                    <Check size={20} className="text-primary shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Content Accordion */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Nội dung khóa học</h2>

                        <div className="flex flex-wrap justify-between items-end mb-4 text-sm font-medium text-foreground gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                                <span className="text-foreground font-bold">{course.modules.length}</span> chương •
                                <span className="text-foreground font-bold">{totalLessons}</span> bài học •
                                <span>Thời lượng <span className="text-foreground font-bold">{formattedDuration}</span></span>
                            </div>
                            <button
                                className="text-primary font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all text-sm"
                                onClick={handleExpandAll}
                            >
                                Mở rộng tất cả
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {course.modules.map((module) => (
                                <div key={module.moduleId} className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                                    <div
                                        className="flex justify-between items-center p-4 lg:px-6 py-4 cursor-pointer bg-muted/30 hover:bg-muted/70 transition-colors select-none group"
                                        onClick={() => toggleModule(module.moduleId)}
                                    >
                                        <div className="flex items-center gap-4 font-semibold text-foreground text-base lg:text-lg">
                                            <div className={`transition-transform duration-300 ${openModules[module.moduleId] ? 'rotate-180' : ''} text-primary bg-primary/10 p-1 rounded-full group-hover:bg-primary/20`}>
                                                {openModules[module.moduleId] ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                                            </div>
                                            <span>{module.orderIndex}. {module.title}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground hidden sm:block">{module.lessons?.length || 0} bài học</span>
                                    </div>

                                    {openModules[module.moduleId] && (
                                        <ul className="border-t border-border animate-in slide-in-from-top-1 duration-200 bg-background">
                                            {module.lessons && module.lessons.map((lesson) => (
                                                <li
                                                    key={lesson.lessonId}
                                                    className="flex justify-between items-center py-3.5 px-4 pl-6 lg:pl-14 border-b border-border/50 last:border-0 hover:bg-muted transition-colors group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 text-sm lg:text-base text-foreground/80 group-hover:text-primary transition-colors">
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                            <Play size={10} className="ml-0.5 text-muted-foreground group-hover:text-primary fill-current" />
                                                        </div>
                                                        <span>{lesson.title}</span>
                                                    </div>
                                                    <span className="text-xs lg:text-sm text-muted-foreground tabular-nums">10:00</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Requirements, Instructor, etc. could go here */}

                </div>

                {/* Right Sidebar (Sticky) */}
                <div className="w-full lg:w-[380px] shrink-0 relative">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        {/* Course Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl">
                            {/* Preview Video/Image */}
                            <div
                                className="relative w-full aspect-video bg-black group cursor-pointer overflow-hidden border-b border-border"
                                onClick={() => course.videoUrl && setIsPlayingPreview(true)}
                            >
                                {isPlayingPreview && course.videoUrl ? (
                                    <video
                                        src={course.videoUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                                        <img
                                            src={course.imageUrl || "https://files.fullstack.edu.vn/f8-prod/courses/13/13.png"}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Play size={28} fill="currentColor" className="ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-base z-20 drop-shadow-md tracking-wide">
                                            Xem giới thiệu khóa học
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-3xl font-bold text-foreground">Miễn phí</span>
                                    <span className="text-muted-foreground line-through text-lg hidden">2.500.000đ</span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (enrollmentStatus === 'APPROVED') {
                                            navigate(`/course/${slug}/learn`);
                                        } else {
                                            handleEnroll();
                                        }
                                    }}
                                    disabled={enrollmentLoading || enrollmentStatus === 'PENDING'}
                                    className={`w-full py-3.5 rounded-full font-bold text-lg uppercase tracking-wide transition-all hover:shadow-lg active:scale-[0.98] mb-6 disabled:opacity-70 disabled:cursor-not-allowed
                                        ${enrollmentStatus === 'PENDING' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                                            enrollmentStatus === 'APPROVED' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                                                'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
                                >
                                    {enrollmentLoading ? "Đang xử lý..." :
                                        enrollmentStatus === 'PENDING' ? "Đợi phê duyệt" :
                                            enrollmentStatus === 'APPROVED' ? "Vào học ngay" :
                                                "Đăng ký học ngay"}
                                </button>

                                <div className="space-y-4">
                                    <p className="font-semibold text-foreground text-sm">Khóa học này bao gồm:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <BarChart size={18} className="text-foreground shrink-0" /> <span>Trình độ cơ bản</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Film size={18} className="text-foreground shrink-0" /> <span>Tổng số <b>{totalLessons}</b> bài học</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Clock size={18} className="text-foreground shrink-0" /> <span>Thời lượng <b>{formattedDuration}</b></span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Battery size={18} className="text-foreground shrink-0" /> <span>Học mọi lúc, mọi nơi</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Check size={18} className="text-foreground shrink-0" /> <span>Cấp chứng chỉ khi hoàn thành</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseDetail;
