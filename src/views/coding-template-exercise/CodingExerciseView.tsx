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
    Code2
} from 'lucide-react';
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
};

const VERDICT_CONFIG: Record<string, any> = {
    PENDING: { icon: ClockIcon, color: "text-gray-500", bg: "bg-gray-100", label: "Đang chờ" },
    RUNNING: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-100", label: "Đang chấm", animate: "animate-spin" },
    ACCEPTED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Accepted" },
    WRONG_ANSWER: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Wrong Answer" },
    COMPILATION_ERROR: { icon: AlertIcon, color: "text-orange-500", bg: "bg-orange-100", label: "Compilation Error" },
    RUNTIME_ERROR: { icon: AlertIcon, color: "text-red-500", bg: "bg-red-100", label: "Runtime Error" },
    TIME_LIMIT_EXCEEDED: { icon: ClockIcon, color: "text-yellow-500", bg: "bg-yellow-100", label: "TLE" },
    MEMORY_LIMIT_EXCEEDED: { icon: AlertIcon, color: "text-purple-500", bg: "bg-purple-100", label: "MLE" },
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


    useEffect(() => {
        const claims = authService.getJwtClaimDecoded();
        const userId = claims?.userID || (claims as any)?.userID;

        if (userId) {
            webSocketService.connect();
            const destination = `/queue/submission/${userId}`;
            webSocketService.subscribe(destination, (data) => {

                if (data.submissionId && data.verdict) {
                    setSubmission(data);
                    if (!["PENDING", "RUNNING"].includes(data.verdict)) {
                        setIsSubmitting(false);
                        if (data.verdict === 'ACCEPTED') {
                            toast.success(`Chúc mừng! Bạn đã vượt qua tất cả test case. (+${data.score || 0} điểm)`);
                        } else {
                            toast.error(`Kết quả: ${data.verdict}`);
                        }
                    }
                } else if (data.status) {
                    setSubmission(prev => prev ? { ...prev, verdict: data.status } : { verdict: data.status });
                }
            });

            return () => {
                webSocketService.unsubscribe(destination);
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
            // Mock data for demo if API fails
            const mockData: any = {
                exerciseId: targetId,
                title: "Design Dynamic Array (Resizable Array)",
                description: "Design a **Dynamic Array** class, such as an `ArrayList` in Java or a `vector` in C++.\n\nYour `DynamicArray` class should support the following operations:\n\n- `DynamicArray(int capacity)` will initialize an empty array with a capacity of `capacity`, where `capacity > 0`.\n- `int get(int i)` will return the element at index `i`. Assume that index `i` is valid.\n- `void set(int i, int n)` will set the element at index `i` to `n`. Assume that index `i` is valid.\n- `void pushback(int n)` will push the element `n` to the end of the array.\n- `int popback()` will pop and return the element at the end of the array. Assume that the array is non-empty.\n- `void resize()` will double the capacity of the array.\n- `int getSize()` will return the number of elements in the array.\n- `int getCapacity()` will return the capacity of the array.\n\nIf we call `void pushback(int n)` but the array is full, we should resize the array first.",
                programmingLanguage: "Python",
                difficulty: "EASY",
                points: 100,
                isPublished: true,
                timeLimitMs: 1000,
                memoryLimitMb: 256,
                initialCode: "class DynamicArray:\n    \n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, i: int) -> int:\n        pass\n\n    def set(self, i: int, n: int) -> None:\n        pass\n\n    def pushback(self, n: int) -> None:\n        pass\n\n    def popback(self) -> int:\n        pass\n\n    def resize(self) -> None:\n        pass\n\n    def getSize(self) -> int:\n        pass\n\n    def getCapacity(self) -> int:\n        pass",
                slug: "design-dynamic-array",
                exerciseTestCases: []
            };
            setExerciseDetail(mockData);
            setCode(mockData.initialCode);
            setSelectedLanguage(mockData.programmingLanguage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadExercise(id);
        }
    }, [id, courseSlug]);

    const handleRunCode = async () => {
        const targetExerciseId = exerciseDetail?.exerciseId || exerciseDetail?.templateId;
        if (!targetExerciseId) return;

        setIsRunning(true);
        setConsoleOutput('Đăng biên dịch và chạy thử các test case công khai...');

        try {
            const result = await codingExerciseService.runCode(
                targetExerciseId,
                code,
                selectedLanguage
            );
            console.log('Run result:', result);
            setConsoleOutput(result.output || 'Không có kết quả đầu ra');
        } catch (error: any) {
            console.error('Run error:', error);
            setConsoleOutput(`Lỗi thực thi: ${error.message || 'Lỗi không xác định'}`);
            toast.error('Có lỗi khi chạy thử bài code');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        const targetExerciseId = exerciseDetail?.exerciseId || exerciseDetail?.templateId;
        if (!targetExerciseId) return;

        setIsSubmitting(true);
        setSubmission({ verdict: 'PENDING' });
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

                                                {exerciseDetail.exerciseTestCases?.filter((tc: any) => tc.isSample).map((tc: any, idx: number) => (
                                                    <div key={idx} className="space-y-3 pt-4">
                                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                            Example {idx + 1}
                                                        </h4>
                                                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-500 block mb-1">Input:</span>
                                                                <code className="text-sm text-indigo-200">{tc.input}</code>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-500 block mb-1">Output:</span>
                                                                <code className="text-sm text-emerald-200">{tc.expectedOutput}</code>
                                                            </div>
                                                            {tc.explanation && (
                                                                <div className="pt-2 border-t border-slate-800">
                                                                    <span className="text-xs font-bold text-slate-500 block mb-1">Explanation:</span>
                                                                    <p className="text-xs text-slate-400 italic">{tc.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
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
                                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                        <SelectTrigger className="w-32 h-7 bg-[#1a1a1a] border-[#3e3e3e] text-xs font-semibold focus:ring-0">
                                            <div className="flex items-center gap-2">
                                                <Languages size={14} className="text-indigo-400" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#282828] border-[#3e3e3e]">
                                            <SelectItem value="Java">Java</SelectItem>
                                            <SelectItem value="Python">Python</SelectItem>
                                            <SelectItem value="C++">C++</SelectItem>
                                            <SelectItem value="JavaScript">JavaScript</SelectItem>
                                            <SelectItem value="TypeScript">TypeScript</SelectItem>
                                        </SelectContent>
                                    </Select>

                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-hidden relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col items-center py-4 text-xs font-mono text-slate-600 select-none">
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div key={i} className="leading-6 h-6">{i + 1}</div>
                                    ))}
                                </div>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    className="w-full h-full bg-[#1e1e1e] text-indigo-50 pl-14 pr-4 py-4 font-mono text-sm leading-6 resize-none outline-none focus:ring-0 selection:bg-indigo-500/30"
                                    placeholder="// Viết mã của bạn ở đây..."
                                />
                            </div>

                            {/* Console / Bottom Bar */}
                            <div className="shrink-0 bg-[#282828] border-t border-[#3e3e3e]">
                                {/* Output Area (Collapsible) */}
                                {consoleOutput && (
                                    <div className="p-4 border-b border-[#3e3e3e] max-h-60 overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <Terminal size={12} />
                                            {submission ? 'Submission Status' : 'Console Output'}
                                        </div>

                                        {submission ? (
                                            <div className="space-y-4">
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
                                                                    <div className={`font-bold text-sm ${config.color}`}>{config.label}</div>
                                                                    <div className="text-[10px] text-slate-400">
                                                                        {submission.submissionId ? `ID: ${submission.submissionId.slice(0, 8)}` : 'Đang xử lý...'}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {submission.verdict && !["PENDING", "RUNNING"].includes(submission.verdict) && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase">Test cases</div>
                                                            <div className="text-sm font-bold text-indigo-400">{submission.passedTestcases || 0} / {submission.totalTestcases || 0}</div>
                                                        </div>
                                                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase">Points</div>
                                                            <div className="text-sm font-bold text-emerald-400">{submission.score || 0}</div>
                                                        </div>
                                                        {submission.runtimeMs != null && (
                                                            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Time</div>
                                                                <div className="text-sm font-bold text-slate-300">{submission.runtimeMs} ms</div>
                                                            </div>
                                                        )}
                                                        {submission.memoryKb != null && (
                                                            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Memory</div>
                                                                <div className="text-sm font-bold text-slate-300">{(submission.memoryKb / 1024).toFixed(2)} MB</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {submission.verdict === 'ACCEPTED' && courseSlug && (
                                                    <div className="pt-2">
                                                        <Button
                                                            onClick={() => navigate(`/learn/${courseSlug}?jumpNext=true`)}
                                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2"
                                                        >
                                                            Tiếp theo <ChevronRight size={16} />
                                                        </Button>
                                                    </div>
                                                )}

                                                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap mt-2 bg-slate-900/30 p-2 rounded border border-slate-800/50 italic">
                                                    {consoleOutput}
                                                </pre>
                                            </div>
                                        ) : (
                                            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                                {consoleOutput}
                                            </pre>
                                        )}
                                    </div>
                                )}

                                <div className="h-14 px-4 flex items-center justify-between">
                                    <button
                                        onClick={() => setConsoleOutput(prev => prev ? '' : 'Console đang sẵn sàng...')}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Console
                                        <ChevronDown size={16} className={`transition-transform ${consoleOutput ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={handleRunCode}
                                            disabled={isRunning || isSubmitting}
                                            variant="secondary"
                                            className="h-9 px-6 bg-[#3e3e3e] hover:bg-[#4a4a4a] text-white border-0 font-bold gap-2 active:scale-95 transition-all"
                                        >
                                            {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Play size={16} fill="currentColor" />}
                                            Chạy
                                        </Button>
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
            </main>
        </div >
    );
};

export default CodingExerciseView;
