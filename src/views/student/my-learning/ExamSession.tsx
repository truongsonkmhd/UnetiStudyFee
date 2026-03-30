import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Send,
    Flag,
    LayoutGrid,
    Timer,
    Code2,
    BookOpen,
    Play,
    CheckCircle2,
    Trophy,
    ExternalLink,
    Award,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress, Button, Tag, Modal, Tooltip, Select } from 'antd';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';
import { studentClassContestService } from '@/services/studentClassContestService';
import { ContestSessionResponse, CodingAnswer } from '@/types/contest';

const SUPPORTED_LANGUAGES = [
    { label: 'Java', value: 'java' },
    { label: 'Python', value: 'python' },
    { label: 'C++', value: 'cpp' },
    { label: 'JavaScript', value: 'javascript' },
];

const ExamSession: React.FC = () => {
    const { classId, examId } = useParams<{ classId: string; examId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<ContestSessionResponse | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Tách riêng state cho quiz và coding
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
    const [codingAnswers, setCodingAnswers] = useState<Record<string, CodingAnswer>>({});

    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const autoSubmittedRef = useRef(false);

    // Track trạng thái coding exercises đã hoàn thành
    const [codingCompleted, setCodingCompleted] = useState<Record<string, boolean>>({});

    // Trạng thái hiển thị kết quả sau khi nộp bài
    const [showResult, setShowResult] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);

    // ─── Load Session ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!examId) return;

        const loadSession = async () => {
            try {
                // Thử lấy session đang diễn ra, nếu không có thì bắt đầu mới
                let data: ContestSessionResponse | null = null;
                try {
                    data = await studentClassContestService.getSession(examId);
                } catch (sessionError: any) {
                    // Kiểm tra nếu lỗi do hết lượt làm bài (400/409 IllegalStateException)
                    const statusCode = sessionError?.statusCode || sessionError?.response?.status;
                    const message = sessionError?.message || sessionError?.response?.data?.message || '';

                    if (statusCode === 400 || statusCode === 409) {
                        // Đã hết lượt thi → hiện thông báo và quay lại
                        toast.error(message || 'Bạn đã hết số lượt làm bài cho bài thi này.');
                        navigate(-1);
                        return;
                    }
                    // Không có session đang diễn ra → bắt đầu mới
                    data = null;
                }

                if (!data) {
                    data = await studentClassContestService.startContest(examId);
                }

                setSession(data);
                setTimeLeft(data.timeLeftSeconds);

                // Khởi tạo coding answers với initialCode
                const initCoding: Record<string, CodingAnswer> = {};
                data.items
                    .filter(item => item.type === 'CODING')
                    .forEach(item => {
                        initCoding[item.id] = {
                            code: item.initialCode ?? '',
                            language: item.programmingLanguage?.toLowerCase() ?? 'java',
                        };
                    });
                setCodingAnswers(initCoding);

            } catch (error: any) {
                console.error('Lỗi khi tải bài thi:', error);
                const message = error?.message || error?.response?.data?.message || '';
                const statusCode = error?.statusCode || error?.response?.status;

                if (message.includes('hết số lần') || message.includes('hết số lượt') || statusCode === 400) {
                    toast.error(message || 'Bạn đã hết số lượt làm bài cho bài thi này.');
                } else if (statusCode === 403) {
                    toast.error(message || 'Bạn không có quyền truy cập bài thi này.');
                } else {
                    toast.error(message || 'Không thể tải thông tin bài thi. Vui lòng thử lại sau.');
                }
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, [examId]);

    // Lắng nghe khi quay lại từ trang coding exercise (focus event)
    const handleWindowFocus = useCallback(() => {
        if (!session) return;
        // Kiểm tra coding exercises và cập nhật trạng thái hoàn thành
        const codingItems = session.items.filter(item => item.type === 'CODING');
        codingItems.forEach(item => {
            // Đánh dấu là đã hoàn thành khi focus lại (user đã quay về từ trang coding)
            const storageKey = `coding_completed_${examId}_${item.id}`;
            const completed = localStorage.getItem(storageKey);
            if (completed === 'true') {
                setCodingCompleted(prev => ({ ...prev, [item.id]: true }));
            }
        });
    }, [session, examId]);

    useEffect(() => {
        window.addEventListener('focus', handleWindowFocus);
        return () => window.removeEventListener('focus', handleWindowFocus);
    }, [handleWindowFocus]);

    // ─── Timer ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (loading || !session || showResult) return;
        if (timeLeft <= 0) {
            if (!autoSubmittedRef.current) {
                autoSubmittedRef.current = true;
                handleAutoSubmit();
            }
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, session, showResult]);

    // ─── Helpers ─────────────────────────────────────────────────────────────────
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const answeredCount = (session?.items ?? []).filter(q => {
        if (q.type === 'QUIZ') return (quizAnswers[q.id]?.length ?? 0) > 0;
        if (q.type === 'CODING') return codingCompleted[q.id] === true;
        return (codingAnswers[q.id]?.code ?? '').trim().length > 0;
    }).length;

    // ─── Mở trang thi lập trình ─────────────────────────────────────────────────
    const handleOpenCodingExercise = (item: any) => {
        // Lưu trạng thái đang thi coding
        const storageKey = `coding_in_exam_${examId}_${item.id}`;
        localStorage.setItem(storageKey, 'true');

        // Mở trang thi lập trình với exerciseId/templateId
        const exerciseId = item.id;
        const url = `/templates/${exerciseId}/view?fromExam=${examId}&classId=${classId}`;
        window.open(url, '_blank');

        toast.info('Đã mở trang thi lập trình. Sau khi nộp bài coding, hãy quay lại đây để tiếp tục.');
    };

    // Đánh dấu coding exercise đã hoàn thành
    const markCodingAsCompleted = (itemId: string) => {
        const storageKey = `coding_completed_${examId}_${itemId}`;
        localStorage.setItem(storageKey, 'true');
        setCodingCompleted(prev => ({ ...prev, [itemId]: true }));
        toast.success('Bài tập lập trình đã được ghi nhận hoàn thành!');
    };

    // ─── Handlers ────────────────────────────────────────────────────────────────
    const handleAutoSubmit = async () => {
        toast.info('Thời gian đã hết! Bài làm đang được tự động nộp.');
        await executeSubmit();
    };

    const executeSubmit = async () => {
        if (!session) return;
        try {
            const result = await studentClassContestService.submitContest(session.submissionId, {
                quizAnswers,
                codingAnswers,
            });

            // Hiển thị kết quả sau khi nộp bài
            setSubmissionResult(result);
            setShowResult(true);
            toast.success('Nộp bài thành công!');
        } catch {
            toast.error('Lỗi khi nộp bài. Vui lòng thử lại!');
        }
    };

    const toggleFlag = (index: number) => {
        const newFlagged = new Set(flagged);
        if (newFlagged.has(index)) newFlagged.delete(index);
        else newFlagged.add(index);
        setFlagged(newFlagged);
    };

    const handleFinish = () => {
        if (!session) return;
        const total = session.items.length;
        const answered = answeredCount;
        const unanswered = total - answered;

        // Kiểm tra coding exercises chưa hoàn thành
        const codingItems = session.items.filter(i => i.type === 'CODING');
        const codingNotDone = codingItems.filter(i => !codingCompleted[i.id]);

        Modal.confirm({
            title: 'Bạn có chắc chắn muốn nộp bài?',
            content: (
                <div className="space-y-2 mt-2">
                    <p>✅ Đã hoàn thành: <strong>{answered}/{total}</strong> câu</p>
                    {unanswered > 0 && (
                        <p className="text-orange-500">⚠️ Còn <strong>{unanswered}</strong> câu chưa trả lời</p>
                    )}
                    {codingNotDone.length > 0 && (
                        <p className="text-red-500">🔴 Còn <strong>{codingNotDone.length}</strong> bài lập trình chưa hoàn thành</p>
                    )}
                </div>
            ),
            okText: 'Nộp bài',
            cancelText: 'Tiếp tục làm bài',
            centered: true,
            okButtonProps: { danger: unanswered > 0 },
            onOk: executeSubmit,
        });
    };

    // ─── Màn hình kết quả sau khi nộp bài ────────────────────────────────────────
    const ResultScreen = () => {
        const quizItems = session?.items.filter(i => i.type === 'QUIZ') || [];
        const codingItems = session?.items.filter(i => i.type === 'CODING') || [];

        const quizAnsweredCount = quizItems.filter(q => (quizAnswers[q.id]?.length ?? 0) > 0).length;
        const codingCompletedCount = codingItems.filter(c => codingCompleted[c.id]).length;

        const totalQuizPoints = quizItems.reduce((sum, q) => sum + (q.points || 0), 0);
        const totalCodingPoints = codingItems.reduce((sum, c) => sum + (c.points || 0), 0);

        // Tính điểm quiz (giả sử backend trả về score)
        const quizScore = submissionResult?.quizScore ?? 0;
        const codingScore = submissionResult?.codingScore ?? 0;
        const totalScore = submissionResult?.totalScore ?? (quizScore + codingScore);
        const maxScore = submissionResult?.maxScore ?? (totalQuizPoints + totalCodingPoints);

        const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        const isPassed = submissionResult?.passed ?? (scorePercent >= 50);

        return (
            <div className="fixed inset-0 bg-[#020617] text-slate-200 flex items-center justify-center z-[1000]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-lg w-full mx-4"
                >
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 text-center">
                        {/* Icon */}
                        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${isPassed
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/30'
                            : 'bg-amber-500/20 border-2 border-amber-500/30'
                            }`}>
                            {isPassed
                                ? <Trophy size={48} className="text-emerald-400" />
                                : <Award size={48} className="text-amber-400" />
                            }
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-black text-white mb-2">
                            {isPassed ? 'HOÀN THÀNH XUẤT SẮC!' : 'ĐÃ NỘP BÀI!'}
                        </h2>
                        <p className="text-slate-400 font-medium mb-8">
                            {session?.title}
                        </p>

                        {/* Score Circle */}
                        <div className="relative w-40 h-40 mx-auto mb-8">
                            <svg className="transform -rotate-90 w-40 h-40" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="42" fill="none"
                                    stroke={isPassed ? '#10b981' : '#f59e0b'}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${scorePercent * 2.64} 264`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{totalScore}</span>
                                <span className="text-xs text-slate-500 font-bold">/ {maxScore} điểm</span>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {quizItems.length > 0 && (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen size={14} className="text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trắc Nghiệm</span>
                                    </div>
                                    <p className="text-lg font-black text-white">{quizScore} <span className="text-xs text-slate-500">/ {totalQuizPoints}</span></p>
                                    <p className="text-[10px] text-slate-500 font-bold">
                                        {quizAnsweredCount}/{quizItems.length} câu đã trả lời
                                    </p>
                                </div>
                            )}
                            {codingItems.length > 0 && (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code2 size={14} className="text-purple-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lập Trình</span>
                                    </div>
                                    <p className="text-lg font-black text-white">{codingScore} <span className="text-xs text-slate-500">/ {totalCodingPoints}</span></p>
                                    <p className="text-[10px] text-slate-500 font-bold">
                                        {codingCompletedCount}/{codingItems.length} bài đã hoàn thành
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${isPassed
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-amber-500/10 border border-amber-500/30'
                            }`}>
                            {isPassed
                                ? <CheckCircle2 size={16} className="text-emerald-400" />
                                : <XCircle size={16} className="text-amber-400" />
                            }
                            <span className={`text-sm font-black uppercase tracking-widest ${isPassed ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                {isPassed ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu'}
                            </span>
                        </div>

                        {/* Back Button */}
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Quay lại lớp học
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // ─── Loading ──────────────────────────────────────────────────────────────────
    if (loading || !session) return (
        <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse tracking-widest uppercase text-xs">Đang tải bài thi...</p>
            </div>
        </div>
    );

    // ─── Hiển thị kết quả ────────────────────────────────────────────────────────
    if (showResult) {
        return <ResultScreen />;
    }

    const questions = session.items;
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = (idx: number) => {
        const q = questions[idx];
        if (q.type === 'QUIZ') return (quizAnswers[q.id]?.length ?? 0) > 0;
        if (q.type === 'CODING') return codingCompleted[q.id] === true;
        return (codingAnswers[q.id]?.code ?? '').trim().length > 0;
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-[#020617] text-slate-200 flex flex-col z-[1000] overflow-hidden">

            {/* ── Header ── */}
            <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                        title="Quay lại"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white line-clamp-1">
                            {session.title}
                        </h2>
                        {session.description && (
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter line-clamp-1">
                                {session.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-colors ${timeLeft < 300
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}>
                        <Timer size={18} className={timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-indigo-400'} />
                        <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Nộp bài */}
                    <Button
                        type="primary"
                        size="large"
                        icon={<Send size={16} />}
                        onClick={handleFinish}
                        className="h-11 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                    >
                        Nộp bài
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* ── Sidebar ── */}
                <aside className="w-72 border-r border-white/5 bg-slate-900/20 flex flex-col shrink-0 overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <LayoutGrid size={13} /> Danh sách câu hỏi
                            </h3>
                            <span className="text-[11px] font-black text-indigo-400">
                                {answeredCount}/{questions.length}
                            </span>
                        </div>
                        <Progress
                            percent={Math.round((answeredCount / questions.length) * 100)}
                            showInfo={false}
                            strokeColor="#4f46e5"
                            trailColor="rgba(255,255,255,0.05)"
                            strokeWidth={5}
                        />
                    </div>

                    {/* Grid câu hỏi */}
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => (
                                <Tooltip
                                    key={q.id}
                                    title={`Câu ${i + 1} - ${q.type === 'QUIZ' ? 'Trắc nghiệm' : 'Lập trình'}${q.type === 'CODING' && codingCompleted[q.id] ? ' ✅' : ''}`}
                                    placement="right"
                                >
                                    <button
                                        onClick={() => setCurrentQuestionIndex(i)}
                                        className={`
                                            h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-black transition-all relative gap-0.5
                                            ${currentQuestionIndex === i
                                                ? 'ring-2 ring-indigo-500 bg-indigo-500/10 text-white'
                                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }
                                            ${isAnswered(i) ? 'border-b-2 border-emerald-500' : ''}
                                        `}
                                    >
                                        <span>{i + 1}</span>
                                        {q.type === 'CODING'
                                            ? <Code2 size={8} className={codingCompleted[q.id] ? 'text-emerald-400' : 'text-purple-400'} />
                                            : <BookOpen size={8} className="text-blue-400" />
                                        }
                                        {flagged.has(i) && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                                        )}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Chú thích */}
                    <div className="p-4 border-t border-white/5 bg-slate-900/40">
                        <div className="space-y-2">
                            {[
                                { color: 'bg-blue-400', label: 'Trắc nghiệm' },
                                { color: 'bg-purple-400', label: 'Lập trình' },
                                { color: 'border-b-2 border-emerald-500 bg-white/5', label: 'Đã trả lời', border: true },
                                { color: 'bg-red-500', label: 'Đã đánh dấu', dot: true },
                            ].map(({ color, label, dot }) => (
                                <div key={label} className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {dot
                                        ? <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                        : <div className={`w-2 h-2 rounded-sm ${color}`} />
                                    }
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            {/* Question Header */}
                            <div className="px-10 pt-8 pb-4 shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Tag
                                            color={currentQuestion.type === 'QUIZ' ? 'blue' : 'purple'}
                                            className="m-0 uppercase font-black tracking-widest rounded-lg px-3 py-0.5"
                                        >
                                            {currentQuestion.type === 'QUIZ' ? (
                                                <span className="flex items-center gap-1"><BookOpen size={11} /> Trắc nghiệm</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><Code2 size={11} /> Lập trình</span>
                                            )}
                                        </Tag>
                                        <span className="text-xs font-black text-slate-500 uppercase">
                                            Câu {currentQuestionIndex + 1} / {questions.length}
                                        </span>
                                        <span className="text-xs font-bold text-amber-500">
                                            {currentQuestion.points} điểm
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleFlag(currentQuestionIndex)}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg ${flagged.has(currentQuestionIndex)
                                                ? 'text-red-400 bg-red-500/10'
                                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Flag size={13} className={flagged.has(currentQuestionIndex) ? 'fill-red-400' : ''} />
                                        {flagged.has(currentQuestionIndex) ? 'Đã đánh dấu' : 'Đánh dấu'}
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-white leading-relaxed">
                                    {currentQuestion.content}
                                </h3>
                            </div>

                            {/* ── QUIZ: Multiple choice ── */}
                            {currentQuestion.type === 'QUIZ' ? (
                                <div className="px-10 pb-8 flex-1">
                                    <div className="grid grid-cols-1 gap-3 mt-4">
                                        {currentQuestion.options?.map((option, optIdx) => {
                                            const selected = quizAnswers[currentQuestion.id]?.includes(option.id);
                                            const label = String.fromCharCode(65 + optIdx); // A, B, C, D
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setQuizAnswers(prev => ({
                                                        ...prev,
                                                        [currentQuestion.id]: [option.id]
                                                    }))}
                                                    className={`
                                                        group flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left
                                                        ${selected
                                                            ? 'border-indigo-500 bg-indigo-500/8 shadow-lg shadow-indigo-500/10'
                                                            : 'border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all shrink-0
                                                        ${selected
                                                            ? 'bg-indigo-500 text-white scale-105 shadow-md shadow-indigo-500/30'
                                                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                                        }
                                                    `}>
                                                        {selected ? <CheckCircle2 size={16} /> : label}
                                                    </div>
                                                    <span className={`font-medium leading-relaxed transition-colors ${selected ? 'text-white' : 'text-slate-300'
                                                        }`}>
                                                        {option.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                            ) : (
                                /* ── CODING: Redirect to coding exercise page ── */
                                <div className="flex-1 flex flex-col items-center justify-center px-10 pb-8">
                                    <div className="max-w-md w-full text-center">
                                        {codingCompleted[currentQuestion.id] ? (
                                            /* Đã hoàn thành coding */
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                                                    <CheckCircle2 size={40} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-emerald-400 uppercase tracking-widest mb-2">
                                                        Đã hoàn thành
                                                    </h4>
                                                    <p className="text-slate-400 font-medium text-sm">
                                                        Bài tập lập trình này đã được nộp thành công. Điểm sẽ được cộng vào kết quả tổng.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenCodingExercise(currentQuestion)}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/5 transition-all mx-auto"
                                                >
                                                    <ExternalLink size={16} />
                                                    Xem lại bài làm
                                                </button>
                                            </motion.div>
                                        ) : (
                                            /* Chưa hoàn thành coding */
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center mx-auto">
                                                    <Code2 size={40} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                                                        Bài tập lập trình
                                                    </h4>
                                                    <p className="text-slate-400 font-medium text-sm mb-2">
                                                        {currentQuestion.title || currentQuestion.content}
                                                    </p>
                                                    <p className="text-slate-500 text-xs">
                                                        Bạn cần mở trang thi lập trình để viết code và nộp bài. Sau khi nộp xong, hãy quay lại đánh dấu hoàn thành.
                                                    </p>
                                                </div>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => handleOpenCodingExercise(currentQuestion)}
                                                        className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-purple-500/20"
                                                    >
                                                        <ExternalLink size={18} />
                                                        Mở trang thi lập trình
                                                    </button>
                                                    <button
                                                        onClick={() => markCodingAsCompleted(currentQuestion.id)}
                                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-emerald-500/30 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        Đánh dấu đã nộp bài lập trình
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Footer Navigation ── */}
                    <div className="h-18 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-10 py-4 shrink-0">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            <ChevronLeft size={16} /> Câu trước
                        </button>

                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">
                            {isAnswered(currentQuestionIndex) && (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            )}
                            {currentQuestionIndex + 1} / {questions.length}
                        </div>

                        <button
                            onClick={
                                currentQuestionIndex === questions.length - 1
                                    ? handleFinish
                                    : () => setCurrentQuestionIndex(prev => prev + 1)
                            }
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            {currentQuestionIndex === questions.length - 1 ? (
                                <>Hoàn thành <Play size={14} /></>
                            ) : (
                                <>Câu tiếp theo <ChevronRight size={16} /></>
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExamSession;
