import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import classService from '@/services/classService';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import { actionAuth } from '@/components/context/AuthContext';

const MyClasses: React.FC = () => {
    const [myClasses, setMyClasses] = useState<ClazzResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { jwtClaims } = actionAuth();

    const fetchMyClasses = async () => {
        if (!jwtClaims?.userID) return;
        setLoading(true);
        try {
            const classes = await classService.student.getMyClasses(jwtClaims.userID);
            setMyClasses(classes || []);
        } catch (error) {
            console.error("Failed to fetch my classes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClasses();
    }, [jwtClaims?.userID]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[2000px] mx-auto px-6 py-12 md:py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {loading ? (
                        [1, 2].map(i => (
                            <div key={i} className="h-[200px] w-full rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
                        ))
                    ) : myClasses.length > 0 ? (
                        myClasses.map((cls, index) => (
                            <motion.div
                                key={cls.classId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group"
                            >
                                <div className="relative bg-card/40 backdrop-blur-xl rounded-[2rem] p-8 border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cls.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                    }`}>
                                                    {cls.isActive ? 'Đang hoạt động' : 'Kết thúc'}
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 text-[10px] font-black text-muted-foreground tracking-widest">
                                                    #{cls.classCode}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
                                                {cls.className}
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                                        <Users size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-muted-foreground/60 tracking-wider">Giảng viên</span>
                                                        <span className="text-foreground">{cls.instructorName}</span>
                                                    </div>
                                                </div>
                                                {cls.startDate && (
                                                    <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase text-muted-foreground/60 tracking-wider">Thời gian</span>
                                                            <span className="text-foreground">
                                                                {new Date(cls.startDate).toLocaleDateString('vi-VN')}
                                                                {cls.endDate ? ` – ${new Date(cls.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-border/30 flex items-center justify-between">
                                            <div className="flex items-center gap-2 group/link cursor-pointer">
                                                <span className="text-sm font-black text-primary group-hover/link:underline">CHI TIẾT LỚP HỌC</span>
                                                <ArrowRight size={14} className="text-primary group-hover/link:translate-x-1 transition-transform" />
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform duration-500">
                                                <GraduationCap size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors duration-500" />
                                </div>
                            </motion.div>
                        )
                        )) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50"
                        >
                            <div className="w-24 h-24 bg-card rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-border/50 group hover:scale-110 transition-transform duration-500">
                                <GraduationCap className="text-violet-500 h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3">Chưa có lớp học nào</h3>
                            <p className="text-muted-foreground max-w-sm mb-10 font-medium">Bạn cần có mã tham gia từ giảng viên để có thể vào các lớp học này.</p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => navigate('/join-class')}
                                    className="px-10 py-6 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-2xl transition-all"
                                >
                                    THAM GIA LỚP HỌC
                                </Button>
                                <Button
                                    onClick={() => navigate('/home')}
                                    variant="outline"
                                    className="px-10 py-6 font-black rounded-2xl transition-all"
                                >
                                    KHÁM PHÁ KHÓA HỌC
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyClasses;
