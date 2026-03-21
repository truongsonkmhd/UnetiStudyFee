import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Send, 
    AlertCircle,
    Flag,
    CheckCircle2,
    LayoutGrid,
    Timer,
    Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress, Button, Tag, Space, Modal, Tooltip } from 'antd';
import { toast } from 'sonner';

const ExamSession: React.FC = () => {
    const { classId, examId } = useParams<{ classId: string; examId: string }>();
    const navigate = useNavigate();
    
    // Mock State
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    
    const questions = [
        {
            id: 1,
            type: 'quiz',
            title: 'Câu hỏi 1',
            content: 'Trong Java, từ khóa nào được dùng để kế thừa một lớp?',
            options: [
                { id: 'A', text: 'implements' },
                { id: 'B', text: 'extends' },
                { id: 'C', text: 'inherit' },
                { id: 'D', text: 'using' }
            ]
        },
        {
            id: 2,
            type: 'code',
            title: 'Câu hỏi 2',
            content: 'Viết chương trình tính tổng hai số nguyên A và B.',
            language: 'java'
        },
        {
            id: 3,
            type: 'quiz',
            title: 'Câu hỏi 3',
            content: 'Độ phức tạp thời gian của thuật toán Sắp xếp nhanh (QuickSort) trong trường hợp tốt nhất là gì?',
            options: [
                { id: 'A', text: 'O(n)' },
                { id: 'B', text: 'O(n log n)' },
                { id: 'C', text: 'O(n^2)' },
                { id: 'D', text: 'O(log n)' }
            ]
        }
    ];

    // Timer Effect
    useEffect(() => {
        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleAutoSubmit = () => {
        toast.info("Thời gian đã hết! Bài làm đang được tự động nộp.");
        // Submit logic
    };

    const toggleFlag = (index: number) => {
        const newFlagged = new Set(flagged);
        if (newFlagged.has(index)) newFlagged.delete(index);
        else newFlagged.add(index);
        setFlagged(newFlagged);
    };

    const handleFinish = () => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn nộp bài?',
            content: `Bạn đã hoàn thành ${Object.keys(answers).length}/${questions.length} câu hỏi.`,
            okText: 'Nộp bài',
            cancelText: 'Tiếp tục làm bài',
            centered: true,
            className: 'custom-modal-dark',
            onOk: () => {
                toast.success("Nộp bài thành công!");
                navigate(-1);
            }
        });
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 bg-[#020617] text-slate-200 flex flex-col z-[1000] overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Kiểm tra giữa kỳ</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Lập trình Java căn bản</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                        <Timer size={18} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'} />
                        <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<Send size={16} />}
                        onClick={handleFinish}
                        className="h-11 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        Nộp bài
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-80 border-r border-white/5 bg-slate-900/20 flex flex-col shrink-0 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                <LayoutGrid size={14} /> Danh sách câu hỏi
                            </h3>
                            <span className="text-xs font-bold text-primary">{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
                        </div>
                        <Progress 
                            percent={(Object.keys(answers).length / questions.length) * 100} 
                            showInfo={false}
                            strokeColor="#4f46e5"
                            trailColor="rgba(255,255,255,0.05)"
                            strokeWidth={6}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                        <div className="grid grid-cols-4 gap-3">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(i)}
                                    className={`
                                        h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all relative
                                        ${currentQuestionIndex === i ? 'ring-2 ring-primary bg-primary/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}
                                        ${answers[i] ? 'border-b-2 border-emerald-500' : ''}
                                    `}
                                >
                                    {i + 1}
                                    {flagged.has(i) && (
                                        <div className="absolute -top-1 -right-1">
                                            <Flag size={10} className="fill-red-500 text-red-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-slate-900/40">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" /> Đã trả lời
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="w-3 h-3 rounded bg-white/5 border border-white/10" /> Chưa trả lời
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500" /> Đã đánh dấu
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <Tag color={currentQuestion.type === 'quiz' ? 'blue' : 'purple'} className="m-0 uppercase font-black tracking-widest rounded-lg px-3 py-1">
                                        {currentQuestion.type === 'quiz' ? 'Trắc nghiệm' : 'Lập trình'}
                                    </Tag>
                                    <div className="h-4 w-[1px] bg-white/10" />
                                    <span className="text-sm font-black text-slate-500 uppercase">Câu hỏi {currentQuestionIndex + 1}</span>
                                </div>
                                <button 
                                    onClick={() => toggleFlag(currentQuestionIndex)}
                                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${flagged.has(currentQuestionIndex) ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <Flag size={14} className={flagged.has(currentQuestionIndex) ? 'fill-red-500' : ''} />
                                    {flagged.has(currentQuestionIndex) ? 'Đã đánh dấu' : 'Đánh dấu câu hỏi'}
                                </button>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-10 leading-relaxed">
                                {currentQuestion.content}
                            </h3>

                            {/* Response Options */}
                            {currentQuestion.type === 'quiz' ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options?.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option.id }))}
                                            className={`
                                                group flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left
                                                ${answers[currentQuestionIndex] === option.id 
                                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                                                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]'}
                                            `}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all
                                                ${answers[currentQuestionIndex] === option.id 
                                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' 
                                                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}
                                            `}>
                                                {option.id}
                                            </div>
                                            <span className={`text-lg font-bold transition-colors ${answers[currentQuestionIndex] === option.id ? 'text-white' : 'text-slate-300'}`}>
                                                {option.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                                        <Monitor size={40} />
                                    </div>
                                    <h4 className="text-xl font-black text-white mb-2">Trình soạn thảo Code</h4>
                                    <p className="text-slate-500 max-w-md mb-8">Bài thi này yêu cầu bạn lập trình ngôn ngữ {currentQuestion.language?.toUpperCase()}. Nhấn vào nút bên dưới để mở trình soạn thảo.</p>
                                    <Button size="large" type="primary" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest">Mở Editor</Button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Footer Nav */}
                    <div className="h-20 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-12 shrink-0">
                        <button 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            <ChevronLeft size={16} /> Câu trước
                        </button>

                        <div className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">
                            Hoàn thành {currentQuestionIndex + 1} / {questions.length}
                        </div>

                        <button 
                            onClick={currentQuestionIndex === questions.length - 1 ? handleFinish : () => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-2 text-primary hover:text-indigo-400 transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'} <ChevronRight size={16} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExamSession;
