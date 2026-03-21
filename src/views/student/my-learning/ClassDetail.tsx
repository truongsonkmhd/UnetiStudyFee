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
    ShieldCheck,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Tag, Avatar, Tooltip, Progress, Badge, Empty, Spin } from 'antd';
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


            <div className="max-w-7xl mx-auto px-6 relative z-10 pt-8">
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
                                            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Giảng viên Chủ nhiệm</p>
                                            <p className="text-base font-bold text-white tracking-wide">{clazz.instructorName}</p>
                                        </div>
                                    </div>

                                    <div className="h-12 w-[1px] bg-white/10 hidden md:block" />

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Ngày khai giảng</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Placeholder for Lessons */}
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <FileText size={20} />
                                            </div>
                                            <Tag color="cyan">Chương {i}</Tag>
                                        </div>
                                        <h4 className="text-lg font-black text-white mb-2 group-hover:text-primary transition-colors">Thiết kế hệ thống Layer {i}</h4>
                                        <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-6">Lớp học này sẽ giúp bạn hiểu sâu về các nguyên lý thiết kế ứng dụng...</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                <Clock size={14} /> 45 phút
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(avatar => (
                                                    <Avatar key={avatar} size={24} className="border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${avatar + i}`} />
                                                ))}
                                                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold">+12</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabPane>

                        <TabPane
                            tab={
                                <span className="flex items-center gap-2 px-4 py-2">
                                    <Trophy size={18} /> Bài thi
                                </span>
                            }
                            key="2"
                        >
                            <div className="max-w-4xl mx-auto py-10">
                                {clazz.contests && clazz.contests.length > 0 ? (
                                    <div className="space-y-4">
                                        {clazz.contests.map((contest, i) => (
                                            <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                        <Trophy size={28} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-1">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> {contest.durationInMinutes} phút</span>
                                                            <span className="flex items-center gap-1"><Star size={12} /> Hệ số: {contest.weight}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleJoinExam(contest.classContestId)}
                                                    className="px-6 py-3 rounded-2xl border border-white/10 text-white text-sm font-black hover:bg-white hover:text-black transition-all"
                                                >
                                                    THAM GIA
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty description={<span className="text-slate-500 font-black uppercase tracking-widest text-xs">Hiện tại chưa có bài tập nào</span>} />

                                )}
                            </div>
                        </TabPane>

                        <TabPane
                            tab={
                                <span className="flex items-center gap-2 px-4 py-2">
                                    <MessageSquare size={18} /> Thảo luận
                                </span>
                            }
                            key="3"
                        >
                            <div className="max-w-4xl mx-auto py-20 text-center">
                                <div className="w-20 h-20 rounded-full bg-violet-600/20 text-violet-600 flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Không gian thảo luận</h3>
                                <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Nơi chia sẻ kiến thức, đặt câu hỏi cho giảng viên và thảo luận cùng bạn bè cùng lớp.</p>
                                <button className="px-8 py-4 rounded-2xl bg-violet-600 font-black text-white text-sm uppercase tracking-widest hover:bg-violet-700 transition-all">
                                    BẮT ĐẦU CHIA SẺ
                                </button>
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
