import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Send,
    Lightbulb,
    Trophy,
    Clock,
    Database,
    ChevronDown,
    Terminal,
    FileText,
    History,
    Languages,
    History as HistoryIcon,
    Settings2,
    Beaker,
    Copy,
    Check
} from 'lucide-react';
import Editor from "@monaco-editor/react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import codingExerciseService from '@/services/codingExercise';
import webSocketService from '@/services/webSocketService';
import authService from '@/services/AuthService';
import { Difficulty } from '@/model/coding-template/Difficulty';
import { toast } from 'sonner';
import { AlertCircle as AlertIcon, CheckCircle, XCircle, Clock as ClockIcon, Loader2 } from 'lucide-react';

type Verdict =
    | "PENDING"
    | "RUNNING"
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT_EXCEEDED"
    | "MEMORY_LIMIT_EXCEEDED"
    | string;

type TestCaseResult = {
    testCaseId?: string;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    verdict?: string;
    runtimeMs?: number;
    memoryKb?: number;
    error?: string;
    message?: string;
};

type SubmissionDTO = {
    submissionId?: string;
    verdict?: Verdict;
    passedTestcases?: number;
    totalTestcases?: number;
    score?: number;
    runtimeMs?: number | null;
    memoryKb?: number | null;
    language?: string | null;
    submittedAt?: string | number | Date | null;
    testCaseResults?: TestCaseResult[];
};

const VERDICT_CONFIG: Record<string, any> = {
    PENDING: { icon: ClockIcon, color: "text-gray-500", bg: "bg-gray-100", label: "Đang chờ" },
    RUNNING: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-100", label: "Đang chấm", animate: "animate-spin" },
    ACCEPTED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Được chấp nhận" },
    WRONG_ANSWER: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Câu trả lời sai" },
    COMPILATION_ERROR: { icon: AlertIcon, color: "text-orange-500", bg: "bg-orange-100", label: "Lỗi biên dịch" },
    RUNTIME_ERROR: { icon: AlertIcon, color: "text-red-500", bg: "bg-red-100", label: "Lỗi runtime" },
    TIME_LIMIT_EXCEEDED: { icon: ClockIcon, color: "text-yellow-500", bg: "bg-yellow-100", label: "Vượt quá thời gian" },
    MEMORY_LIMIT_EXCEEDED: { icon: AlertIcon, color: "text-purple-500", bg: "bg-purple-100", label: "Vượt quá bộ nhớ" },
};

const CodingExerciseView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseSlug = searchParams.get('courseSlug');
    const [exerciseDetail, setExerciseDetail] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
    const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
    const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
    const activeTestCaseIndexRef = React.useRef(0);
    const [activeResultCaseIndex, setActiveResultCaseIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [caseResults, setCaseResults] = useState<Record<number, TestCaseResult>>({});
    const [isRunningCase, setIsRunningCase] = useState(false);

    // Filtered sample test cases to be used throughout the UI
    const sampleCases = (exerciseDetail?.exerciseTestCases || []).filter((tc: any) => tc.isSample);

    const formatContent = (text: string) => {
        if (!text) return '';
        // Unescape literal \n or \t strings that might come from the API
        return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Đã sao chép vào bộ nhớ tạm');
    };


    useEffect(() => {
        const claims = authService.getJwtClaimDecoded();
        const userId = claims?.userID || (claims as any)?.userID;

        if (userId) {
            webSocketService.connect();

            // Subscribe to submission updates
            const subDestination = `/queue/submission/${userId}`;
            webSocketService.subscribe(subDestination, (data) => {
                if (data.submissionId && data.verdict) {
                    setSubmission(data);
                    if (!["PENDING", "RUNNING"].includes(data.verdict)) {
                        setIsSubmitting(false);
                        setConsoleTab('result');
                        setActiveResultCaseIndex(0);
                        if (data.verdict === 'ACCEPTED') {
                            toast.success(`Chúc mừng! Bạn đã vượt qua tất cả test case. (+${data.score || 0} điểm)`);
                        } else {
                            toast.error(`Kết quả: ${data.verdict}`);
                        }
                    }
                } else if (data.status && data.submissionId) {
                    setSubmission(prev => prev ? { ...prev, verdict: data.status } : { verdict: data.status });
                }
            });

            // Subscribe to run updates
            const runDestination = `/queue/run/${userId}`;
            webSocketService.subscribe(runDestination, (data) => {
                console.log('Received run update via WebSocket:', data);

                // Trạng thái (RUNNING, ERROR...)
                if (data.runId && data.status) {
                    if (data.status === 'RUNNING') {
                        setIsRunningCase(true);
                    } else if (data.status === 'ERROR') {
                        setIsRunningCase(false);
                        toast.error('Có lỗi xảy ra khi thực thi mã');
                    }
                }
                // Kết quả (trả về JudgeRunResponseDTO hoặc Object kết quả)
                else {
                    const result = data;
                    const currentIndex = activeTestCaseIndexRef.current;
                    const tcResult: TestCaseResult = result.testCaseResults?.[currentIndex]
                        || result.testCaseResults?.[0]
                        || {
                        verdict: result.status || result.verdict,
                        actualOutput: result.output,
                        message: result.message,
                        error: result.error,
                        runtimeMs: result.runtimeMs,
                        memoryKb: result.memoryKb
                    };

                    setCaseResults(prev => ({ ...prev, [currentIndex]: tcResult }));
                    setSubmission(prev => {
                        const existing = prev?.testCaseResults ? [...prev.testCaseResults] : [];
                        existing[currentIndex] = tcResult;
                        const totalPass = existing.filter(ex => ex?.verdict === 'ACCEPTED').length;
                        return {
                            ...prev,
                            verdict: tcResult.verdict,
                            testCaseResults: existing,
                            passedTestcases: totalPass,
                            totalTestcases: sampleCases.length
                        };
                    });
                    setActiveResultCaseIndex(currentIndex);
                    setIsRunningCase(false);

                    if (tcResult.verdict === 'ACCEPTED' || tcResult.verdict === 'SUCCESS') {
                        toast.success('Case ' + (currentIndex + 1) + ' đã vượt qua!');
                    } else {
                        toast.error('Case ' + (currentIndex + 1) + ' chưa đạt. Kiểm tra lại!');
                    }
                }
            });

            return () => {
                webSocketService.unsubscribe(subDestination);
                webSocketService.unsubscribe(runDestination);
            };
        } else {
            console.warn('User ID not found, WebSocket will not subscribe');
        }
    }, []);

    const loadExercise = async (targetId: string) => {
        try {
            let data: any;
            if (courseSlug) {
                const response = await codingExerciseService.getExerciseDetail(targetId);
                data = response;
                console.log('API response for exercise detail:', data);
            } else {
                data = await codingExerciseTemplateService.getById(targetId);
            }

            console.log('Loaded exercise data:', data);
            if (data) {
                setExerciseDetail(data);
                setCode(data.initialCode || '');
                setSelectedLanguage(data.programmingLanguage || 'Java');
            }
        } catch (error) {
            console.error('Error loading exercise:', error);
            toast.error('Không thể tải dữ liệu bài tập');

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadExercise(id);
        }
    }, [id, courseSlug]);


    const handleRunCurrentCase = async () => {
        const targetExerciseId = exerciseDetail?.exerciseId || exerciseDetail?.templateId;
        if (!targetExerciseId) return;

        const currentCase = sampleCases[activeTestCaseIndex];
        if (!currentCase) {
            console.error('No current case found for index:', activeTestCaseIndex);
            return;
        }

        setIsRunningCase(true);
        setConsoleTab('result');
        setConsoleOutput(`Đang chuẩn bị chạy Case ${activeTestCaseIndex + 1}...`);

        try {
            // Trigger run - result will come via WebSocket
            await codingExerciseService.runSingleTestCase(
                targetExerciseId,
                code,
                selectedLanguage,
                currentCase.input,
                currentCase.testCaseId
            );
            setConsoleOutput(`Yêu cầu chạy mã đã được gửi. Đang chờ kết quả...`);
        } catch (error: any) {
            console.error('Run error:', error);
            const msg = error.message || 'Lỗi không xác định';
            setConsoleOutput('Lỗi: ' + msg);
            toast.error('Có lỗi khi gửi yêu cầu chạy code');
            setIsRunningCase(false);
        }
    };

    const handleSubmit = async () => {
        const targetExerciseId = exerciseDetail?.exerciseId || exerciseDetail?.templateId;
        if (!targetExerciseId) return;

        setIsSubmitting(true);
        setSubmission({ verdict: 'PENDING' });
        setActiveTestCaseIndex(0);
        setConsoleOutput('Đang gửi bài lên hệ thống đánh giá...');

        try {
            const result = await codingExerciseService.submitCode(
                targetExerciseId,
                code,
                selectedLanguage
            );
            console.log('Submit success:', result);
            setSubmission(result);
            setConsoleOutput('Bài đã được gửi. Đang chờ kết quả từ Judge...');
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Có lỗi khi nộp bài');
            setIsSubmitting(false);
            setSubmission(null);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-200 font-medium">Đang tải môi trường lập trình...</p>
                </div>
            </div>
        );
    }

    if (!exerciseDetail) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white">Không tìm thấy bài tập.</div>;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] overflow-hidden">
            {/* Navigation Header */}
            <header className="h-12 flex items-center justify-between px-4 bg-[#282828] border-b border-[#3e3e3e] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (courseSlug) {
                                navigate(`/learn/${courseSlug}`);
                            } else {
                                navigate('/codingExerciseLibrary');
                            }
                        }}
                        className="p-1.5 hover:bg-[#3e3e3e] rounded-md transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">Bài tập:</span>
                        <span className="text-sm font-semibold truncate max-w-[300px]">{exerciseDetail.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 gap-2">
                        <Lightbulb size={16} />
                        <span className="hidden sm:inline">Gợi ý</span>
                    </Button>
                    <div className="h-4 w-px bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#3e3e3e]">
                        <Trophy size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-400">{exerciseDetail.points} pts</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left Side: Problem Info */}
                    <ResizablePanel defaultSize={40} minSize={25}>
                        <div className="h-full flex flex-col bg-[#1a1a1a]">
                            <Tabs defaultValue="description" className="h-full flex flex-col">
                                <div className="px-2 pt-2 bg-[#282828]">
                                    <TabsList className="bg-transparent border-b-0 gap-1 h-9">
                                        <TabsTrigger
                                            value="description"
                                            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-t-lg rounded-b-none border-b-0 h-full gap-2 px-4"
                                        >
                                            <FileText size={14} />
                                            Câu hỏi
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="solution"
                                            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-t-lg rounded-b-none border-b-0 h-full gap-2 px-4"
                                        >
                                            <Lightbulb size={14} />
                                            Giải pháp
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="submissions"
                                            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-t-lg rounded-b-none border-b-0 h-full gap-2 px-4"
                                        >
                                            <HistoryIcon size={14} />
                                            Lịch sử nộp
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <TabsContent value="description" className="h-full m-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-6 space-y-6">
                                                <div>
                                                    <h1 className="text-2xl font-bold mb-3">{exerciseDetail.title}</h1>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={`${exerciseDetail.difficulty === Difficulty.EASY ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            exerciseDetail.difficulty === Difficulty.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                            } hover:bg-transparent font-bold`}>
                                                            {exerciseDetail.difficulty}
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Clock size={14} />
                                                            {exerciseDetail.timeLimitMs}ms
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Database size={14} />
                                                            {exerciseDetail.memoryLimitMb}MB
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-code:text-indigo-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                                                    {/* We can use a markdown renderer here, for now just replace newlines */}
                                                    {exerciseDetail.description.split('\n').map((line: string, i: number) => (
                                                        <p key={i} className="mb-4 leading-relaxed whitespace-pre-wrap">
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>

                                                {/* Test Cases Section */}
                                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                                    <h3 className="text-md font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Beaker size={16} className="text-indigo-500" />
                                                        Test Cases
                                                    </h3>

                                                    <div className="flex flex-wrap gap-2">
                                                        {sampleCases.map((tc: any, idx: number) => {
                                                            const result = submission?.testCaseResults?.[idx];
                                                            const isPassed = result?.verdict === 'ACCEPTED';
                                                            const isFailed = result && result.verdict !== 'ACCEPTED';

                                                            return (
                                                                <Button
                                                                    key={idx}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setActiveTestCaseIndex(idx);
                                                                        activeTestCaseIndexRef.current = idx;
                                                                        if (submission?.testCaseResults?.[idx]) {
                                                                            setActiveResultCaseIndex(idx);
                                                                        }
                                                                    }}
                                                                    className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTestCaseIndex === idx
                                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                        : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                                                                        } ${isPassed ? 'border-l-2 border-l-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : isFailed ? 'border-l-2 border-l-rose-500' : ''}`}
                                                                >
                                                                    {isPassed ? (
                                                                        <CheckCircle size={12} className="text-emerald-500" />
                                                                    ) : isFailed ? (
                                                                        <XCircle size={12} className="text-rose-500" />
                                                                    ) : (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                                                    )}
                                                                    Case {idx + 1}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>

                                                    {sampleCases[activeTestCaseIndex] && (
                                                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                                            {(() => {
                                                                const result = submission?.testCaseResults?.[activeTestCaseIndex];
                                                                if (!result) return null;
                                                                const isPassed = result.verdict === 'ACCEPTED';
                                                                return (
                                                                    <div className={`p-3 rounded-xl border flex items-center justify-between ${isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-1.5 rounded-lg ${isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                                                {isPassed ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                                                                            </div>
                                                                            <div>
                                                                                <div className={`text-xs font-black uppercase tracking-tight ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                    {isPassed ? 'Đã vượt qua (Passed)' : result.verdict || 'Chưa đạt'}
                                                                                </div>
                                                                                <div className="text-[10px] text-slate-500 font-bold">
                                                                                    {result.runtimeMs != null ? `${result.runtimeMs}ms` : ''} {result.memoryKb != null ? `• ${(result.memoryKb / 1024).toFixed(2)}MB` : ''}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 border-indigo-500/20"
                                                                                onClick={() => {
                                                                                    setConsoleTab('result');
                                                                                    setActiveResultCaseIndex(activeTestCaseIndex);
                                                                                }}
                                                                            >
                                                                                Chi tiết kết quả
                                                                            </Button>
                                                                            <Button
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                disabled={isRunningCase || isRunning}
                                                                                className="h-7 text-[10px] font-black uppercase bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1.5"
                                                                                onClick={handleRunCurrentCase}
                                                                            >
                                                                                {isRunningCase ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
                                                                                Chạy Case này
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                            {(!submission?.testCaseResults?.[activeTestCaseIndex] && !caseResults[activeTestCaseIndex]) && (
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        disabled={isRunningCase || isRunning}
                                                                        className="h-8 px-4 text-xs font-black uppercase bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 shadow-lg shadow-indigo-900/20"
                                                                        onClick={handleRunCurrentCase}
                                                                    >
                                                                        {isRunningCase ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                                                        Chạy thử Case này
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            <div className="space-y-2 relative group/tc">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-[13px] font-black text-slate-500 uppercase tracking-wider">Đầu vào:</div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 opacity-0 group-hover/tc:opacity-100 transition-opacity"
                                                                        onClick={() => copyToClipboard(sampleCases[activeTestCaseIndex].input)}
                                                                    >
                                                                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                                    </Button>
                                                                </div>
                                                                <pre className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                                                    {formatContent(sampleCases[activeTestCaseIndex].input)}
                                                                </pre>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-wider">Đầu ra mong đợi</div>
                                                                <pre className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                                                    {formatContent(sampleCases[activeTestCaseIndex].expectedOutput)}
                                                                </pre>
                                                            </div>
                                                            {sampleCases[activeTestCaseIndex].explanation && (
                                                                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1">Explanation:</div>
                                                                    <p className="text-xs text-slate-400 italic leading-relaxed">
                                                                        {sampleCases[activeTestCaseIndex].explanation}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="solution" className="h-full m-0 flex items-center justify-center">
                                        <div className="text-center p-8 space-y-4">
                                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                                <Lightbulb size={32} className="text-amber-500" />
                                            </div>
                                            <h3 className="text-lg font-bold">Giải pháp tối ưu</h3>
                                            <p className="text-slate-400 max-w-xs mx-auto">Sử dụng mảng động với cấu trúc Resize logic để tối ưu hóa thời gian O(1) trung bình cho pushback.</p>
                                            <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">Xem mã giải</Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="submissions" className="h-full m-0">
                                        <div className="p-6">
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                                <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                                <p>Bạn chưa có lượt nộp bài nào.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-[1.5px] bg-[#3e3e3e] hover:bg-indigo-500 transition-colors" />

                    <ResizablePanel defaultSize={60} minSize={30}>
                        <div className="h-full flex flex-col bg-[#1a1a1a]">
                            <div className="h-10 flex items-center justify-between px-3 bg-[#282828] border-b border-[#3e3e3e]">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#3e3e3e] rounded-md shadow-inner">
                                        <Languages size={14} className="text-indigo-400" />
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">
                                            {selectedLanguage}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-hidden relative">
                                <Editor
                                    height="100%"
                                    language={selectedLanguage.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.toLowerCase()}
                                    theme="vs-dark"
                                    value={formatContent(code)}
                                    onChange={(value) => setCode(value || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 16, bottom: 16 },
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        fontLigatures: true,
                                    }}
                                />
                            </div>

                            <div className="shrink-0 bg-[#282828] border-t border-[#3e3e3e]">
                                {consoleOutput && (
                                    <div className="p-4 border-b border-[#3e3e3e] min-h-[250px] max-h-[400px] overflow-y-auto">
                                        <Tabs value={consoleTab} onValueChange={(v: any) => setConsoleTab(v)} className="w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <TabsList className="bg-transparent border-b-0 gap-4 h-8 p-0">
                                                    <TabsTrigger
                                                        value="result"
                                                        className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none border-b-2 border-transparent h-full px-0 font-bold text-xs uppercase tracking-widest text-slate-500"
                                                    >
                                                        Kết quả thực thi
                                                    </TabsTrigger>
                                                </TabsList>

                                            </div>

                                            <TabsContent value="result" className="mt-0 space-y-4">
                                                {submission ? (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                                        <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                                                            <div className="flex items-center gap-3">
                                                                {(() => {
                                                                    const verdict = submission.verdict || "PENDING";
                                                                    const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.PENDING;
                                                                    const Icon = config.icon;
                                                                    return (
                                                                        <>
                                                                            <div className={`p-2 rounded-lg ${config.bg}`}>
                                                                                <Icon className={`w-5 h-5 ${config.color} ${config.animate || ""}`} />
                                                                            </div>
                                                                            <div>
                                                                                <div className={`font-black text-sm uppercase tracking-tight ${config.color}`}>{config.label}</div>
                                                                                <div className="text-[10px] text-slate-500 font-bold">
                                                                                    {submission.runtimeMs != null ? `${submission.runtimeMs}ms` : '---'} • {submission.memoryKb != null ? `${(submission.memoryKb / 1024).toFixed(2)}MB` : '---'}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[13px] text-slate-500 font-bold uppercase mb-0.5">Test cases</div>
                                                                <div className="text-sm font-black text-white">
                                                                    {submission.passedTestcases || 0} / {submission.totalTestcases || 0}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {submission.testCaseResults && submission.testCaseResults.length > 0 ? (
                                                            <div className="space-y-4">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {submission.testCaseResults.map((tc, idx) => {
                                                                        if (!tc) return null;
                                                                        return (
                                                                            <Button
                                                                                key={idx}
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setActiveResultCaseIndex(idx)}
                                                                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeResultCaseIndex === idx
                                                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                                                                                    }`}
                                                                            >
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${tc?.verdict === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                                Case {idx + 1}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {submission.testCaseResults[activeResultCaseIndex] && (
                                                                    <div className="space-y-4 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div className="space-y-1.5">
                                                                                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                                                    <Terminal size={12} className="text-indigo-400" />
                                                                                    Đầu vào
                                                                                </div>
                                                                                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap min-h-[44px]">
                                                                                    {formatContent(submission.testCaseResults[activeResultCaseIndex].input || sampleCases[activeResultCaseIndex]?.input || '')}
                                                                                </pre>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                                                    <Play size={12} className="text-amber-400" />
                                                                                    Kết quả
                                                                                </div>
                                                                                <pre className={`bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap min-h-[44px] ${(submission.testCaseResults[activeResultCaseIndex] as any).verdict === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                                    {formatContent(submission.testCaseResults[activeResultCaseIndex].actualOutput || (submission.testCaseResults[activeResultCaseIndex] as any).output || 'N/A')}
                                                                                </pre>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                                                    <CheckCircle size={12} className="text-emerald-400" />
                                                                                    Mong đợi
                                                                                </div>
                                                                                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap min-h-[44px]">
                                                                                    {formatContent(submission.testCaseResults[activeResultCaseIndex].expectedOutput || sampleCases[activeResultCaseIndex]?.expectedOutput || '')}
                                                                                </pre>
                                                                            </div>
                                                                        </div>

                                                                        {submission.testCaseResults[activeResultCaseIndex].message && (
                                                                            <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                                                                                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Thông báo:</div>
                                                                                <pre className="bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/10 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                                                                                    {submission.testCaseResults[activeResultCaseIndex].message}
                                                                                </pre>
                                                                            </div>
                                                                        )}

                                                                        {submission.testCaseResults[activeResultCaseIndex].error && (
                                                                            <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                                                                                <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Chi tiết lỗi:</div>
                                                                                <pre className="bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 text-[11px] font-mono text-rose-400 overflow-x-auto">
                                                                                    {submission.testCaseResults[activeResultCaseIndex].error}
                                                                                </pre>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raw Output / Logs:</div>
                                                                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap mt-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 italic leading-relaxed">
                                                                    {consoleOutput}
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {submission.verdict === 'ACCEPTED' && courseSlug && (
                                                            <div className="pt-2">
                                                                <Button
                                                                    onClick={() => navigate(`/learn/${courseSlug}?jumpNext=true`)}
                                                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-tight gap-2 py-6 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                                                >
                                                                    Tiếp theo <ChevronRight size={18} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-4">
                                                        <Loader2 size={32} className="animate-spin opacity-20 text-indigo-500" />
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 animate-pulse">Waiting for code execution...</div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}

                                <div className="h-14 px-4 flex items-center justify-between">
                                    <button
                                        onClick={() => setConsoleOutput(prev => prev ? '' : 'Console đang sẵn sàng...')}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Bảng điểu khiển
                                        <ChevronDown size={16} className={`transition-transform ${consoleOutput ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className="flex items-center gap-3">

                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isRunning}
                                            className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
                                            Nộp bài
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main >
        </div >
    );
};

export default CodingExerciseView;
