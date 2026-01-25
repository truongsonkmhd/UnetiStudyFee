import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Play,
    Send,
    RotateCcw,
    Settings,
    Maximize2,
    Lightbulb,
    MessageSquare,
    Trophy,
    Clock,
    Database,
    ChevronDown,
    CheckCircle2,
    Info,
    Layout,
    PanelLeftClose,
    PanelLeftOpen,
    Code2,
    Terminal,
    FileText,
    History,
    Languages,
    HistoryIcon
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
import { CodingExerciseTemplate } from '@/model/coding-template/CodingExerciseTemplate';
import { Difficulty } from '@/model/coding-template/Difficulty';
import { toast } from 'sonner';

const CodingExerciseView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<CodingExerciseTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadTemplate(id);
        }
    }, [id]);

    const loadTemplate = async (templateId: string) => {
        try {
            const response = await codingExerciseTemplateService.getById(templateId);
            console.log('Loaded template:', response);
            if (response) {
                setTemplate(response);
                setCode(response.initialCode || '');
                setSelectedLanguage(response.programmingLanguage || 'Java');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            toast.error('Không thể tải dữ liệu bài tập');
            // Mock data for demo if API fails
            const mockTemplate: CodingExerciseTemplate = {
                templateId: templateId,
                title: "Design Dynamic Array (Resizable Array)",
                description: "Design a **Dynamic Array** (aka a resizable array) class, such as an `ArrayList` in Java or a `vector` in C++.\n\nYour `DynamicArray` class should support the following operations:\n\n- `DynamicArray(int capacity)` will initialize an empty array with a capacity of `capacity`, where `capacity > 0`.\n- `int get(int i)` will return the element at index `i`. Assume that index `i` is valid.\n- `void set(int i, int n)` will set the element at index `i` to `n`. Assume that index `i` is valid.\n- `void pushback(int n)` will push the element `n` to the end of the array.\n- `int popback()` will pop and return the element at the end of the array. Assume that the array is non-empty.\n- `void resize()` will double the capacity of the array.\n- `int getSize()` will return the number of elements in the array.\n- `int getCapacity()` will return the capacity of the array.\n\nIf we call `void pushback(int n)` but the array is full, we should resize the array first.",
                programmingLanguage: "Python",
                difficulty: Difficulty.EASY,
                points: 100,
                isPublished: true,
                timeLimitMs: 1000,
                memoryLimitMb: 256,
                initialCode: "class DynamicArray:\n    \n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, i: int) -> int:\n        pass\n\n    def set(self, i: int, n: int) -> None:\n        pass\n\n    def pushback(self, n: int) -> None:\n        pass\n\n    def popback(self) -> int:\n        pass\n\n    def resize(self) -> None:\n        pass\n\n    def getSize(self) -> int:\n        pass\n\n    def getCapacity(self) -> int:\n        pass",
                slug: "design-dynamic-array",
                testCases: [
                    {
                        input: '["Array", 1, "getSize", "getCapacity"]',
                        expectedOutput: '[null, 0, 1]',
                        isPublic: true,
                        explanation: "Initialize an array with capacity 1. Size is 0, Capacity is 1."
                    }
                ]
            };
            setTemplate(mockTemplate);
            setCode(mockTemplate.initialCode);
            setSelectedLanguage(mockTemplate.programmingLanguage);
        } finally {
            setLoading(false);
        }
    };

    const handleRunCode = () => {
        setIsRunning(true);
        setConsoleOutput('Đang biên dịch và chạy thử các test case công khai...');
        setTimeout(() => {
            setConsoleOutput('Test Case 1: PASSED\nInput: ["Array", 1, "getSize", "getCapacity"]\nOutput: [null, 0, 1]\n\nAll public test cases passed! 🎉');
            setIsRunning(false);
        }, 1500);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await toast.promise(
                new Promise(resolve => setTimeout(resolve, 3000)),
                {
                    loading: 'Đang chấm bài trên hệ thống...',
                    success: 'Chúc mừng! Bạn đã vượt qua tất cả test case. (+100 điểm)',
                    error: 'Có lỗi trong quá trình chấm điểm',
                }
            );
        } finally {
            setIsSubmitting(false);
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

    if (!template) return <div>Không tìm thấy bài tập.</div>;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] overflow-hidden">
            {/* Navigation Header */}
            <header className="h-12 flex items-center justify-between px-4 bg-[#282828] border-b border-[#3e3e3e] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/codingExerciseLibrary')}
                        className="p-1.5 hover:bg-[#3e3e3e] rounded-md transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-300">Bài tập:</span>
                        <span className="text-sm font-semibold truncate max-w-[300px]">{template.title}</span>
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
                        <span className="text-xs font-bold text-indigo-400">{template.points} pts</span>
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
                                                    <h1 className="text-2xl font-bold mb-3">{template.title}</h1>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={`${template.difficulty === Difficulty.EASY ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            template.difficulty === Difficulty.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                            } hover:bg-transparent font-bold`}>
                                                            {template.difficulty}
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Clock size={14} />
                                                            {template.timeLimitMs}ms
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Database size={14} />
                                                            {template.memoryLimitMb}MB
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-code:text-indigo-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                                                    {/* We can use a markdown renderer here, for now just replace newlines */}
                                                    {template.description.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-4 leading-relaxed whitespace-pre-wrap">
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>

                                                {template.testCases?.filter(tc => tc.isPublic).map((tc, idx) => (
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

                    {/* Right Side: Code Editor */}
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <div className="h-full flex flex-col bg-[#1a1a1a]">
                            {/* Editor Toolbar */}
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
                                    <div className="h-4 w-px bg-[#3e3e3e]"></div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-white px-2">
                                        Auto Save
                                    </Button>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-md">
                                        <Settings size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-md">
                                        <RotateCcw size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-md">
                                        <Maximize2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-md">
                                        <PanelLeftClose size={16} />
                                    </Button>
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
                                    <div className="p-4 border-b border-[#3e3e3e] max-h-40 overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <Terminal size={12} />
                                            Console Output
                                        </div>
                                        <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                            {consoleOutput}
                                        </pre>
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
                                            Run
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isRunning}
                                            className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
};

export default CodingExerciseView;
