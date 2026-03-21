import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import classService from '@/services/classService';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import { actionAuth } from '@/components/context/AuthContext';
import { toast } from 'sonner';
import { PATHS } from '@/constants/paths';

const JoinClass = () => {
    const [searchParams] = useSearchParams();
    const inviteCode = searchParams.get('code');
    const navigate = useNavigate();
    const { jwtClaims } = actionAuth();

    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [classInfo, setClassInfo] = useState<ClazzResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!inviteCode) {
            setError("Mã mời không hợp lệ hoặc thiếu.");
            setLoading(false);
            return;
        }

        const fetchClassInfo = async () => {
            try {
                setLoading(true);
                const res = await classService.student.getByInviteCode(inviteCode);
                if (res) {
                    setClassInfo(res);
                } else {
                    setError("Không tìm thấy thông tin lớp học.");
                }
            } catch (err: any) {
                console.error("Error fetching class info:", err);
                setError(err.message || "Có lỗi xảy ra khi tải thông tin lớp học.");
            } finally {
                setLoading(false);
            }
        };

        fetchClassInfo();
    }, [inviteCode]);

    const handleJoin = async () => {
        try {
            setJoining(true);
            await classService.student.joinClass(inviteCode, jwtClaims.userID);
            toast.success("Tham gia lớp học thành công!");
            navigate(PATHS.MY_ENROLLMENTS);
        } catch (err: any) {
            console.error("Error joining class:", err);
            toast.error(err.message || "Không thể tham gia lớp học.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Đang kiểm tra mã mời...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Có lỗi xảy ra</h2>
                    <p className="text-muted-foreground mb-8">{error}</p>
                    <button
                        onClick={() => navigate(PATHS.HOME)}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">


            <div className="max-w-xl w-full bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 bg-card/80">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Tham gia lớp học</h1>
                    <p className="text-muted-foreground">Bạn được mời tham gia vào lớp học sau:</p>
                </div>

                {classInfo && (
                    <div className="space-y-6 mb-10">
                        <div className="bg-muted/30 border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4 text-center">{classInfo.className}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border text-muted-foreground">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Giảng viên</p>
                                        <p className="font-semibold text-foreground">{classInfo.instructorName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border text-muted-foreground">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Mã lớp</p>
                                        <p className="font-semibold text-foreground">{classInfo.classCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 col-span-full">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border text-muted-foreground">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Thời gian</p>
                                        <p className="font-semibold text-foreground">
                                            {new Date(classInfo.startDate!).toLocaleDateString('vi-VN')}
                                            {classInfo.endDate ? ` - ${new Date(classInfo.endDate).toLocaleDateString('vi-VN')}` : ' (không thời hạn)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-500">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">Lớp học này đang mở cho người mới tham gia.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {joining ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Xác nhận tham gia
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate(PATHS.HOME)}
                        disabled={joining}
                        className="w-full py-4 text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50 rounded-2xl transition-all"
                    >
                        Để sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinClass;
