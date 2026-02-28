import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, ChevronRight, RotateCcw, FileText, Calendar, Target, Award, Info } from 'lucide-react';
import { studentQuizService, StartQuizResponse, QuestionResponse, QuizResultResponse } from '@/services/studentQuizService';
import { QuizDTO } from '@/model/course-admin/QuizDTO';
import courseService from '@/services/courseService';

interface QuizPlayerProps {
    quizId: string;
    onComplete?: () => void;
    onBack: () => void;
}

enum QuizState {
    INTRO,
    LOADING,
    QUESTION,
    RESULT
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, onComplete, onBack }) => {
    const [state, setState] = useState<QuizState>(QuizState.INTRO);
    const [quizInfo, setQuizInfo] = useState<QuizDTO | null>(null);
    const [attempts, setAttempts] = useState<QuizResultResponse[]>([]);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);
    const [timer, setTimer] = useState<number>(-1);
    const [startTime, setStartTime] = useState<number>(Date.now());

    useEffect(() => {
        fetchQuizDetails();
    }, [quizId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === QuizState.QUESTION && currentQuestion) {
            interval = setInterval(() => {
                if (currentQuestion.timeLimitSeconds > 0) {
                    setTimer((prev) => {
                        if (prev <= 0) return 0;
                        return prev - 1;
                    });
                } else {
                    setTimer((prev) => prev + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state, currentQuestion]);

    // Tự động chuyển câu khi hết thời gian
    useEffect(() => {
        if (state === QuizState.QUESTION &&
            currentQuestion &&
            currentQuestion.timeLimitSeconds > 0 &&
            timer === 0 &&
            attemptId) {

            toast.error("Hết thời gian câu hỏi! Đang chuyển câu tiếp theo...");
            autoSubmitAnswer();
        }
    }, [timer, state, currentQuestion, attemptId]);

    const autoSubmitAnswer = async () => {
        if (!attemptId || !currentQuestion) return;

        try {
            setState(QuizState.LOADING);

            // Nộp bài với đáp án trống nếu hết giờ (cộng thêm 1 giây để đảm bảo backend nhận diện là timeout)
            const response = await studentQuizService.submitAnswer(attemptId, {
                questionId: currentQuestion.questionId,
                selectedAnswerIds: selectedAnswers,
                timeSpentSeconds: currentQuestion.timeLimitSeconds + 1
            });

            if (response.hasNextQuestion) {
                fetchNextQuestion(attemptId);
            } else {
                completeQuiz(attemptId);
            }
        } catch (error) {
            console.error("Failed to auto-submit answer", error);
            // Nếu lỗi khi auto submit, cố gắng load câu tiếp theo
            fetchNextQuestion(attemptId);
        }
    };

    const fetchQuizDetails = async () => {
        if (!quizId) return;
        try {
            const [info, history] = await Promise.allSettled([
                studentQuizService.getQuizInfo(quizId),
                studentQuizService.getUserAttempts(quizId)
            ]);

            if (info.status === 'fulfilled' && info.value) {
                console.log("Quiz Info Received:", info.value);
                setQuizInfo(info.value);
            } else if (info.status === 'rejected') {
                console.error("Failed to fetch quiz info", info.reason);
            }

            if (history.status === 'fulfilled' && history.value) {
                console.log("Attempts History Received:", history.value);
                setAttempts(history.value);
            } else if (history.status === 'rejected') {
                console.error("Failed to fetch attempts", history.reason);
            }
        } catch (error) {
            console.error("Unexpected error in fetchQuizDetails", error);
        }
    };

    const startQuiz = async () => {
        try {
            setState(QuizState.LOADING);
            const response = await studentQuizService.startQuiz(quizId);
            setAttemptId(response.attemptId);
            fetchNextQuestion(response.attemptId);
        } catch (error: any) {
            console.error("Failed to start quiz", error);
            const errorMsg = error.response?.data?.message || "Không thể bắt đầu bài kiểm tra";
            toast.error(errorMsg);
            setState(QuizState.INTRO);
        }
    };

    const fetchNextQuestion = async (currAttemptId: string) => {
        try {
            setState(QuizState.LOADING);
            const question = await studentQuizService.getNextQuestion(currAttemptId);

            if (question) {
                setCurrentQuestion(question);
                setSelectedAnswers([]);

                if (question.timeLimitSeconds > 0) {
                    setTimer(question.timeLimitSeconds);
                } else {
                    setTimer(0);
                }
                setStartTime(Date.now());
                setState(QuizState.QUESTION);
            } else {
                completeQuiz(currAttemptId);
            }
        } catch (error) {
            console.error("Failed to fetch question", error);
            toast.error("Lỗi khi tải câu hỏi");
            setState(QuizState.INTRO);
        }
    };

    const handleAnswerSelect = (answerId: string) => {
        setSelectedAnswers([answerId]);
    };

    const submitAnswer = async () => {
        if (!attemptId || !currentQuestion) return;

        if (selectedAnswers.length === 0) {
            toast.warning("Vui lòng chọn một đáp án");
            return;
        }

        try {
            setState(QuizState.LOADING);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);

            const response = await studentQuizService.submitAnswer(attemptId, {
                questionId: currentQuestion.questionId,
                selectedAnswerIds: selectedAnswers,
                timeSpentSeconds: timeSpent
            });

            if (response.hasNextQuestion) {
                fetchNextQuestion(attemptId);
            } else {
                completeQuiz(attemptId);
            }
        } catch (error) {
            console.error("Failed to submit answer", error);
            toast.error("Lỗi khi nộp bài");
            setState(QuizState.QUESTION);
        }
    };

    const completeQuiz = async (currAttemptId: string) => {
        try {
            setState(QuizState.LOADING);
            const result = await studentQuizService.completeQuiz(currAttemptId);
            setQuizResult(result);
            setState(QuizState.RESULT);
            if (onComplete) onComplete();
            fetchQuizDetails(); // Refresh history
        } catch (error) {
            console.error("Failed to complete quiz", error);
            toast.error("Lỗi khi hoàn thành bài kiểm tra");
            setState(QuizState.INTRO);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        }).replace(' lúc', ',');
    };

    if (state === QuizState.INTRO) {
        const lastAttempt = attempts.length > 0 ? attempts[0] : null;

        return (
            <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-primary" />
                        Bài kiểm tra
                    </span>
                    <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                        {quizInfo?.title || 'Đang tải thông tin...'}
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Target size={12} className="text-blue-500" />
                            Số câu hỏi
                        </span>
                        <span className="text-xl font-bold text-foreground">
                            {quizInfo?.totalQuestions || lastAttempt?.totalQuestions || 0}
                        </span>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Award size={12} className="text-emerald-500" />
                            Tổng số điểm
                        </span>
                        <span className="text-xl font-bold text-foreground">
                            {lastAttempt?.score?.toFixed(2) || "0.00"}/{quizInfo?.totalPoints?.toFixed(2) || lastAttempt?.totalPoints?.toFixed(2) || "0.00"}
                        </span>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-primary" />
                            Điểm đạt
                        </span>
                        <span className="text-xl font-bold text-foreground">
                            {quizInfo?.totalPoints?.toFixed(2) || lastAttempt?.totalPoints?.toFixed(2) || "0.00"}
                        </span>
                    </div>
                    {quizInfo?.maxAttempts ? (
                        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                <RotateCcw size={12} className="text-orange-500" />
                                Lượt làm bài
                            </span>
                            <span className="text-xl font-bold text-foreground">
                                {attempts.length} / {quizInfo.maxAttempts}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border/60">
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Câu hỏi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Tổng điểm</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Đúng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Sai</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Điểm</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Kết quả</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {attempts.length > 0 ? (
                                    attempts.map((attempt) => (
                                        <tr key={attempt.attemptId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                {formatDate(attempt.completedAt || attempt.startedAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                                                {attempt.totalQuestions || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                                                {attempt.totalPoints?.toFixed(0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-emerald-600 font-semibold">
                                                {attempt.correctAnswers || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-red-500 font-semibold">
                                                {attempt.incorrectAnswers || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center font-bold text-foreground">
                                                {attempt.score} ({Math.round(attempt.percentage)}%)
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${attempt.isPassed
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                    : 'bg-red-500/10 text-red-600 border-red-200'
                                                    }`}>
                                                    {attempt.isPassed ? 'Đạt' : 'Trượt'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10">
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                                            Chưa có lần thực hiện nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <Button
                        onClick={startQuiz}
                        disabled={quizInfo?.maxAttempts ? attempts.length >= quizInfo.maxAttempts : false}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 h-12 shadow-md flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {quizInfo?.maxAttempts && attempts.length >= quizInfo.maxAttempts ? 'Hết lượt làm' : 'Bắt đầu'}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        onClick={onBack}
                        size="lg"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-12 px-6"
                    >
                        Bỏ qua bài kiểm tra
                    </Button>
                </div>
            </div>
        );
    }

    if (state === QuizState.LOADING) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Đang chuẩn bị câu hỏi...</p>
            </div>
        );
    }

    if (state === QuizState.RESULT && quizResult) {
        return (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in zoom-in duration-300">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-2xl ${quizResult.isPassed
                    ? 'bg-emerald-500 shadow-emerald-500/20'
                    : 'bg-red-500 shadow-red-500/20'
                    }`}>
                    <span className="text-3xl font-black text-white">{Math.round(quizResult.percentage)}%</span>
                </div>

                <h2 className={`text-3xl font-bold mb-3 ${quizResult.isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                    {quizResult.isPassed ? 'Chúc mừng! Bạn đã đạt' : 'Rất tiếc! Bạn chưa đạt'}
                </h2>
                <p className="text-muted-foreground text-center mb-10 max-w-md">
                    {quizResult.isPassed
                        ? 'Bạn đã hoàn thành xuất sắc bài kiểm tra này. Hãy tiếp tục phát huy ở các bài học tiếp theo!'
                        : 'Đừng nản lòng nhé! Hãy ôn tập lại kiến thức và thử sức ở lần tiếp theo.'}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mb-10">
                    <div className="bg-muted/50 p-6 rounded-2xl flex flex-col items-center gap-1 border border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Điểm số</span>
                        <span className="text-3xl font-black text-foreground">{quizResult.score} / {quizResult.totalPoints}</span>
                    </div>
                    <div className="bg-muted/50 p-6 rounded-2xl flex flex-col items-center gap-1 border border-border/40">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Kết quả</span>
                        <span className={`text-3xl font-black ${quizResult.isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {quizResult.isPassed ? 'ĐẠT' : 'TRƯỢT'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="h-12 px-8 font-bold border-border hover:bg-muted"
                    >
                        Quay lại bài học
                    </Button>
                    <Button
                        onClick={() => setState(QuizState.INTRO)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 font-bold shadow-lg shadow-primary/20"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" /> Làm lại
                    </Button>
                </div>
            </div>
        );
    }

    if (state === QuizState.QUESTION && currentQuestion) {
        return (
            <div className="w-full flex flex-col gap-8 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-black text-foreground leading-tight">
                            Câu hỏi {currentQuestion.currentQuestion} <span className="text-muted-foreground font-normal">/ {currentQuestion.totalQuestions}</span>
                        </h3>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(currentQuestion.currentQuestion / currentQuestion.totalQuestions) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-2.5 shadow-sm">
                        <Clock size={18} className="text-primary animate-pulse" />
                        <div className="flex flex-col">
                            {currentQuestion.timeLimitSeconds > 0 && (
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-none mb-1">
                                    Thời gian câu hỏi
                                </span>
                            )}
                            <span className="font-mono text-lg font-bold text-foreground leading-none">
                                {currentQuestion.timeLimitSeconds > 0 ? (
                                    <>
                                        {timer >= 0 ? (
                                            <>
                                                {Math.floor(timer / 60)}m {timer % 60}s
                                            </>
                                        ) : "---"}
                                    </>
                                ) : (
                                    <>
                                        {timer >= 0 ? (
                                            <>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</>
                                        ) : "00:00"}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    <div className="bg-card/50 px-8 py-10 rounded-3xl border border-border/40 shadow-sm">
                        <h4 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
                            {currentQuestion.content}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQuestion.answers.map((option, index) => {
                            const label = String.fromCharCode(65 + index); // A, B, C, D
                            const isSelected = selectedAnswers.includes(option.answerId);

                            return (
                                <button
                                    key={option.answerId}
                                    onClick={() => handleAnswerSelect(option.answerId)}
                                    className={`relative group flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left ${isSelected
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-5 transition-all duration-200 ${isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                                        }`}>
                                        {label}
                                    </div>
                                    <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                                        }`}>
                                        {option.content}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                            <CheckCircle2 size={14} className="text-primary-foreground" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-border pt-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Info size={16} />
                        <span className="text-sm font-medium italic">Chọn một đáp án đúng nhất</span>
                    </div>
                    <Button
                        onClick={submitAnswer}
                        disabled={selectedAnswers.length === 0}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 group"
                    >
                        {currentQuestion.currentQuestion === currentQuestion.totalQuestions ? 'Nộp bài' : 'Tiếp tục'}
                        <ChevronRight className={`ml-2 transition-transform ${selectedAnswers.length > 0 ? 'group-hover:translate-x-1' : ''}`} />
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default QuizPlayer;
