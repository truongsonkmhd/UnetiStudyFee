import React, { useEffect, useState } from 'react';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import courseEnrollmentService from '@/services/courseEnrollmentService';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
    Check,
    X,
    Clock,
    Users,
    Mail,
    IdCard,
    MessageSquare,
    Filter,
    Loader2,
    Calendar,
    ChevronRight,
    Search,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface EnrollmentManagerProps {
    courseId?: string;
}

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ courseId: propCourseId }) => {
    const { courseId: paramCourseId } = useParams<{ courseId: string }>();
    const courseId = propCourseId || paramCourseId || "";

    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>('');

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const statusParam = statusFilter === 'ALL' ? undefined : statusFilter as any;
            const response = await courseEnrollmentService.getCourseEnrollments(courseId, {
                status: statusParam,
                page: 0,
                size: 100
            });
            if (response.items) {
                setEnrollments(response.items);
            }
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
            toast.error("Không thể tải danh sách đăng ký");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchEnrollments();
        }
    }, [courseId, statusFilter]);

    const handleApprove = async (enrollmentId: string) => {
        try {
            await courseEnrollmentService.approveEnrollment(enrollmentId);
            setEnrollments(prev => prev.map(e =>
                e.enrollmentId === enrollmentId ? { ...e, status: 'APPROVED' } : e
            ));
            toast.success("Đã phê duyệt yêu cầu tham gia");
        } catch (error) {
            toast.error("Phê duyệt thất bại");
        }
    };

    const openRejectModal = (enrollmentId: string) => {
        setSelectedEnrollmentId(enrollmentId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedEnrollmentId) return;
        try {
            await courseEnrollmentService.rejectEnrollment(selectedEnrollmentId, rejectionReason);
            setEnrollments(prev => prev.map(e =>
                e.enrollmentId === selectedEnrollmentId ? { ...e, status: 'REJECTED' } : e
            ));
            setShowRejectModal(false);
            toast.success("Đã từ chối yêu cầu tham gia");
        } catch (error) {
            toast.error("Từ chối thất bại");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-[2000px] mx-auto px-6 py-8 space-y-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Quản lý Ghi danh
                        </h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                            <Users size={16} />
                            Quản lý các yêu cầu tham gia và danh sách học viên
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-muted rounded-xl border border-border">
                        {[
                            { id: 'PENDING', label: 'Chờ duyệt', icon: Clock },
                            { id: 'APPROVED', label: 'Đã duyệt', icon: Check },
                            { id: 'REJECTED', label: 'Đã từ chối', icon: X },
                            { id: 'ALL', label: 'Tất cả', icon: Filter }
                        ].map((filter) => {
                            const Icon = filter.icon;
                            const active = statusFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setStatusFilter(filter.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${active
                                            ? 'bg-background text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content Section */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 space-y-4"
                        >
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu ghi danh...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden"
                        >
                            {enrollments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Học viên</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Thời gian gởi</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Lời nhắn</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Trạng thái</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrollments.map((enrollment, index) => (
                                                <motion.tr
                                                    key={enrollment.enrollmentId}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                                {enrollment.studentName.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground">{enrollment.studentName}</span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <Mail size={12} />
                                                                    {enrollment.studentEmail}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">
                                                                    ID: {enrollment.studentCode}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                            <Calendar size={14} className="text-primary" />
                                                            {formatDate(enrollment.requestedAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="max-w-[250px] space-y-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-black tracking-widest opacity-60">
                                                                <MessageSquare size={12} />
                                                                Tin nhắn:
                                                            </div>
                                                            <p className="text-sm text-foreground line-clamp-2 italic">
                                                                {enrollment.requestMessage || "Không có lời nhắn"}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center">
                                                            <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(enrollment.status)}`}>
                                                                {enrollment.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-end gap-2">
                                                            {enrollment.status === 'PENDING' ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(enrollment.enrollmentId)}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:translate-y-[-2px] active:scale-95"
                                                                    >
                                                                        <Check size={14} strokeWidth={3} />
                                                                        Duyệt
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openRejectModal(enrollment.enrollmentId)}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                                                                    >
                                                                        <X size={14} strokeWidth={3} />
                                                                        Từ chối
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    className="p-3 text-muted-foreground hover:bg-muted rounded-xl transition-all"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <ChevronRight size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                    <div className="w-24 h-24 bg-muted/50 rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30">
                                        <IdCard size={48} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-foreground">Không tìm thấy yêu cầu nào</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            Danh sách ghi danh hiện đang trống. Thử thay đổi bộ lọc trạng thái.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reject Modal */}
                <AnimatePresence>
                    {showRejectModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowRejectModal(false)}
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-card rounded-[2.5rem] border border-border p-10 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl -mr-16 -mt-16" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Từ chối ghi danh</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Lý do từ chối</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Vui lòng cung cấp lý do để học viên biết..."
                                            className="w-full px-6 py-4 bg-muted/50 border-2 border-transparent focus:border-destructive/30 focus:bg-background rounded-2xl text-foreground font-medium outline-none transition-all placeholder:text-muted-foreground/40 min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setShowRejectModal(false)}
                                            className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleRejectConfirm}
                                            className="flex-1 py-4 bg-destructive text-white font-black rounded-2xl shadow-xl shadow-destructive/20 hover:shadow-destructive/40 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xs"
                                        >
                                            Từ chối học viên
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EnrollmentManager;
