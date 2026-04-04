import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Send,
    Trophy,
    Clock,
    Database,
    ChevronDown,
    Terminal,
    FileText,
    Languages,
    History as HistoryIcon,
    Beaker,
    Copy,
    Check,
    Star,
    Zap,
    Award
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
import lessonProgressService from '@/services/lessonProgressService';
import { ProgressStatus } from '@/model/progress/LessonProgress';

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
    points?: number;
    isKnownTestCase?: boolean;
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
    message?: string;
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
    SUCCESS: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100", label: "Thành công" },
    PARTIAL_ACCEPTED: { icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-100", label: "Chấp nhận một phần" },
};

const getEducationalLabel = (passed: number, total: number): { label: string, color: string } => {
    if (total === 0) return { label: 'CHƯA ĐẠT', color: 'text-rose-500' };
    const ratio = passed / total;
    if (ratio >= 1.0) return { label: 'HOÀN THÀNH XUẤT SẮC', color: 'text-emerald-500' };
    if (ratio >= 0.6) return { label: 'HOÀN THÀNH TỐT', color: 'text-blue-500' };
    if (ratio > 0) return { label: 'HOÀN THÀNH', color: 'text-amber-500' };
    return { label: 'CHƯA ĐẠT', color: 'text-rose-500' };
};

const CodingExerciseView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseSlug = searchParams.get('courseSlug');
    const fromLesson = searchParams.get('fromLesson');
    const courseIdParam = searchParams.get('courseId');
    const fromExam = searchParams.get('fromExam');
    const [exerciseDetail, setExerciseDetail] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [isRunningCase, setIsRunningCase] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
    const [consoleTab, setConsoleTab] = useState<string>('result');
    const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
    const activeTestCaseIndexRef = React.useRef(0);
    const [activeResultCaseIndex, setActiveResultCaseIndex] = useState(0);

    const [leftTab, setLeftTab] = useState('description');

    const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = async (id: string) => {
        try {
            setLoadingHistory(true);
            const response = await codingExerciseService.getExerciseSubmissions(id);
            console.log("Submission history response:", response);

            let data: any[] = [];
            if (Array.isArray(response)) {
                data = response;
            } else if (response && typeof response === 'object') {
                // Thử trích xuất các thuộc tính phổ biến như 'data', 'content', 'items'
                data = (response as any).data || (response as any).content || (response as any).items || [];
                // Nếu vẫn là object (ví dụ { items: [...] }), lặp lại 
                if (!Array.isArray(data) && typeof data === 'object') {
                    data = (data as any).items || (data as any).content || [];
                }
            }

            setSubmissionHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load submission history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };
    const [copied, setCopied] = useState(false);
    const [caseResults, setCaseResults] = useState<Record<number, TestCaseResult>>({});

    const [consolePanelOpen, setConsolePanelOpen] = useState(false);

    const [lessonMarkedComplete, setLessonMarkedComplete] = useState(false);
    const lessonMarkedCompleteRef = React.useRef(false);

    const [runScore, setRunScore] = useState(0);
    const [passedCaseIndices, setPassedCaseIndices] = useState<Set<number>>(new Set());
    const passedCaseIndicesRef = React.useRef<Set<number>>(new Set());

    const sampleCases = (exerciseDetail?.exerciseTestCases || []).filter((tc: any) => tc.isSample);
    const sampleCasesRef = React.useRef(sampleCases);
    const exerciseDetailRef = React.useRef(exerciseDetail);
    React.useEffect(() => {
        sampleCasesRef.current = sampleCases;
        exerciseDetailRef.current = exerciseDetail;
    }, [sampleCases, exerciseDetail]);

    const caseResultsRef = React.useRef(caseResults);
    React.useEffect(() => {
        caseResultsRef.current = caseResults;
    }, [caseResults]);

    const formatContent = (text: string) => {
        if (!text) return '';
        return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Đã sao chép vào bộ nhớ tạm');
    };



    // Compute how many sample cases currently passed via run
    const passedRunCount = passedCaseIndices.size;
    const hasRunAtLeastOneCase = Object.keys(caseResults).length > 0;

    const markLessonAsComplete = async () => {
        if (!courseIdParam || !fromLesson || lessonMarkedCompleteRef.current) return;
        try {
            const response = await lessonProgressService.updateProgress({
                lessonId: fromLesson,
                courseId: courseIdParam,
                status: ProgressStatus.DONE,
                watchedPercent: 100,
            });

            if (response.status === ProgressStatus.DONE) {
                lessonMarkedCompleteRef.current = true;
                setLessonMarkedComplete(true);
                toast.success('🎓 Bạn đã hoàn thành toàn bộ chuyên mục của bài học này!');
            }
        } catch (error) {
            console.error('Failed to mark lesson as complete:', error);
        }
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

                    // Sync runScore and passedCaseIndices from submission result
                    if (!["PENDING", "RUNNING"].includes(data.verdict) && data.testCaseResults) {
                        let totalPoints = 0;
                        const newPassed = new Set<number>();
                        data.testCaseResults.forEach((tc: any, idx: number) => {
                            if (idx < sampleCasesRef.current.length) {
                                if (tc.verdict === 'ACCEPTED') {
                                    newPassed.add(idx);
                                    totalPoints += (tc.points || 0);
                                }
                            }
                        });
                        setPassedCaseIndices(newPassed);
                        passedCaseIndicesRef.current = newPassed;
                        setRunScore(totalPoints);
                    }

                    if (!["PENDING", "RUNNING"].includes(data.verdict)) {
                        setIsSubmitting(false);
                        setConsoleTab('result');
                        setActiveResultCaseIndex(0);
                        setConsolePanelOpen(true);
                        if (data.verdict === 'ACCEPTED') {
                            toast.success(data.message || `🎉 Chúc mừng! Vượt qua tất cả test case. (+${data.score || 0} điểm)`);
                        } else {
                            toast.error(data.message || `Kết quả: ${VERDICT_CONFIG[data.verdict]?.label || data.verdict}. Passed: ${data.passedTestcases || 0}/${data.totalTestcases || 0}`);
                        }
                    }
                } else if (data.status && data.submissionId) {
                    setSubmission(prev => prev ? { ...prev, verdict: data.status } : { verdict: data.status });
                }
            });

            const runDestination = `/queue/run/${userId}`;
            webSocketService.subscribe(runDestination, (data) => {
                console.log('Received run update via WebSocket:', data);

                if (data.runId && data.status) {
                    if (data.status === 'RUNNING') {
                        setIsRunningCase(true);
                    } else if (data.status === 'ERROR') {
                        setIsRunningCase(false);
                        toast.error('Có lỗi xảy ra khi thực thi mã');
                    }
                } else {
                    // Nhận diện Test Case bằng testCaseId thay vì dùng Ref hiện tại (tránh lỗi cộng dồn)
                    let currentIndex = activeTestCaseIndexRef.current;
                    if (data.testCaseId) {
                        const matchedIdx = sampleCasesRef.current.findIndex(tc => tc.testCaseId === data.testCaseId);
                        if (matchedIdx !== -1) {
                            currentIndex = matchedIdx;
                        }
                    }

                    const tcResult: TestCaseResult = {
                        verdict: data.verdict || data.status,
                        actualOutput: data.actualOutput || data.output,
                        expectedOutput: data.expectedOutput,
                        input: data.input || sampleCasesRef.current[currentIndex]?.input,
                        message: data.message,
                        error: data.error,
                        runtimeMs: data.runtimeMs,
                        memoryKb: data.memoryKb,
                        testCaseId: data.testCaseId,
                        points: (() => {
                            if (data.points && data.points > 0) return data.points;

                            const samples = sampleCasesRef.current;
                            if (samples[currentIndex]?.points && samples[currentIndex]?.points > 0) {
                                return samples[currentIndex].points;
                            }

                            const totalPoints = exerciseDetailRef.current?.points || 0;
                            const totalCount = data.totalTestcases || samples.length || 0;
                            return Math.floor(totalPoints / totalCount);
                        })(),
                        isKnownTestCase: data.isKnownTestCase,
                    };

                    const isPassed = tcResult.verdict === 'ACCEPTED';

                    setCaseResults(prev => ({
                        ...prev,
                        [currentIndex]: tcResult
                    }));

                    if (isPassed && !passedCaseIndicesRef.current.has(currentIndex)) {
                        passedCaseIndicesRef.current.add(currentIndex);
                        setPassedCaseIndices(new Set(passedCaseIndicesRef.current));
                    } else if (!isPassed && passedCaseIndicesRef.current.has(currentIndex)) {
                        passedCaseIndicesRef.current.delete(currentIndex);
                        setPassedCaseIndices(new Set(passedCaseIndicesRef.current));
                    }

                    // Tính lại tổng điểm tích lũy dựa trên tỷ lệ phần trăm các case đã pass
                    const passedCount = passedCaseIndicesRef.current.size;
                    const totalCount = sampleCasesRef.current.length;
                    const totalPoints = exerciseDetailRef.current?.points || 0;

                    if (totalCount > 0) {
                        const calculatedScore = Math.round((passedCount / totalCount) * totalPoints);
                        setRunScore(calculatedScore);
                    } else {
                        setRunScore(0);
                    }

                    // Cập nhật hiển thị kết quả (UI console)
                    setSubmission(prev => {
                        const existing = prev?.testCaseResults ? [...prev.testCaseResults] : [];
                        existing[currentIndex] = tcResult;
                        const totalPass = existing.filter(ex => ex?.verdict === 'ACCEPTED').length;
                        return {
                            ...prev,
                            verdict: tcResult.verdict,
                            testCaseResults: existing,
                            passedTestcases: totalPass,
                            totalTestcases: sampleCasesRef.current.length
                        };
                    });

                    setActiveResultCaseIndex(currentIndex);
                    setIsRunningCase(false);
                    setConsolePanelOpen(true);
                    setConsoleTab('result');

                    if (isPassed) {
                        toast.success(`✅ Case ${currentIndex + 1} đã vượt qua! (+${tcResult.points || 0} điểm)`);
                    } else if (tcResult.verdict === 'COMPILATION_ERROR') {
                        toast.error(`Case ${currentIndex + 1}: Lỗi biên dịch`);
                    } else {
                        toast.error(`❌ Case ${currentIndex + 1} chưa đạt (${VERDICT_CONFIG[tcResult.verdict || '']?.label || tcResult.verdict})`);
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

    React.useEffect(() => {
        if (!submission?.submissionId) return;
        if (lessonMarkedCompleteRef.current) return;
        if (["PENDING", "RUNNING"].includes(submission.verdict || "")) return;

        if (submission.verdict === 'ACCEPTED') {
            markLessonAsComplete();
        }
    }, [submission]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        // Không xóa kết quả cũ ở đây nữa để tránh gây khó chịu cho người dùng
    };

    const handleLanguageChange = (lang: string) => {
        setSelectedLanguage(lang);
    };

    const loadExercise = async (targetId: string) => {
        try {
            let data: any;
            if (courseSlug || fromExam) {
                // Từ lesson hoặc exam → dùng exercise API (judge)
                const response = await codingExerciseService.getExerciseDetail(targetId);
                data = response;
                console.log('API response for exercise detail:', data);
            } else {
                // Từ quản lý template → dùng template API
                data = await codingExerciseTemplateService.getById(targetId);
            }
            if (data) {
                console.log('Processed exercise detail:', {
                    title: data.title,
                    points: data.points,
                    exerciseTestCases: data.exerciseTestCases,
                    testCases: data.testCases
                });
                setExerciseDetail(data);
                setCode(data.initialCode || '');
                setSelectedLanguage(data.programmingLanguage || 'Java');

                const exerciseId = data.exerciseId || data.templateId || targetId;
                if (exerciseId) {
                    fetchHistory(exerciseId);
                }
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
    }, [id, courseSlug, fromExam]);

    const handleRunCurrentCase = async () => {
        const currentIndex = activeTestCaseIndex;
        const currentCase = sampleCasesRef.current[currentIndex];
        const targetExerciseId = exerciseDetail?.exerciseId || exerciseDetail?.templateId;

        // Xóa kết quả riêng của Case hiện tại trước khi chạy
        setCaseResults(prev => {
            const next = { ...prev };
            delete next[currentIndex];
            return next;
        });
        setPassedCaseIndices(prev => {
            const next = new Set(prev);
            next.delete(currentIndex);
            passedCaseIndicesRef.current.delete(currentIndex);
            return next;
        });

        if (!targetExerciseId) return;

        if (!currentCase) {
            console.error('No current case found for index:', activeTestCaseIndex);
            return;
        }

        setIsRunningCase(true);
        activeTestCaseIndexRef.current = activeTestCaseIndex;
        setConsoleOutput(`Đang chuẩn bị chạy Case ${activeTestCaseIndex + 1}...`);
        setConsolePanelOpen(true);
        setConsoleTab('result');

        setSubmission(prev => prev?.submissionId ? { ...prev, submissionId: undefined } : prev);

        try {
            await codingExerciseService.runSingleTestCase(
                targetExerciseId,
                code,
                selectedLanguage,
                currentCase.input,
                currentCase.testCaseId
            );
            setConsoleOutput(`Yêu cầu chạy mã đã được gửi. Đang chờ kết quả...`);

            // Thêm Timeout cứu cánh: Sau 30s tự động tắt trạng thái quay vòng
            setTimeout(() => {
                setIsRunningCase(prev => {
                    if (prev) {
                        setConsoleOutput(curr => curr + "\n⚠️ Quá thời gian chờ (Timeout). Vui lòng kiểm tra Docker hoặc kết nối mạng!");
                    }
                    return false;
                });
            }, 30000);
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

        if (!hasRunAtLeastOneCase) {
            toast.error(`Vui lòng chạy thử ít nhất 1 test case trước khi nộp bài!`);
            return;
        }

        setIsSubmitting(true);
        setSubmission({ verdict: 'PENDING' });
        setActiveTestCaseIndex(0);
        setConsoleOutput('Đang gửi bài lên hệ thống đánh giá...');
        setConsolePanelOpen(true);
        setConsoleTab('result');

        try {
            const resultsArray = Object.values(caseResultsRef.current);

            const result = await codingExerciseService.submitCode(
                targetExerciseId,
                code,
                selectedLanguage,
                resultsArray
            );
            console.log('Submit success:', result);
            console.log('Submit success result object:', result);

            let finalScore = result.score || 0;
            if (finalScore === 0 && result.testCaseResults) {
                const results = result.testCaseResults;
                // Lấy tất cả test cases từ bài tập (bao gồm cả ẩn nếu backend trả về điểm)
                const detailTestCases = exerciseDetail?.exerciseTestCases || exerciseDetail?.testCases || [];

                console.log('Calculating score from:', {
                    resultTestCasesCount: results.length,
                    detailTestCasesCount: detailTestCases.length
                });

                finalScore = results.reduce((acc: number, tc: any, idx: number) => {
                    // Ưu tiên points trực tiếp từ tc, sau đó mapping qua index trong detailTestCases
                    const definedPoints = tc.points || tc.score || detailTestCases[idx]?.points || detailTestCases[idx]?.score || 0;

                    const isPassed = tc.verdict === 'ACCEPTED' || tc.status === 'ACCEPTED';
                    if (isPassed) {
                        // Nếu vẫn bằng 0 nhưng đã qua, và chúng ta có tổng điểm, hãy thử chia đều nếu đây là TC duy nhất 
                        // Hoặc nếu đây là TC cuối cùng và tổng điểm chưa đủ.
                        // Tuy nhiên tốt nhất là lấy từ cấu hình.
                        return acc + definedPoints;
                    }
                    return acc;
                }, 0);

                // Cố định điểm nếu pass hết nhưng tổng điểm tính ra bằng 0 (do cấu hình cũ)
                // Luôn tính điểm theo tỷ lệ %: (số case đạt / tổng số case) * tổng điểm bài tập
                // Luôn tính điểm theo tỷ lệ %: (số case đạt / tổng số case) * tổng điểm bài tập
                const passedCount = results.filter((tc: any) => (tc?.verdict === 'ACCEPTED' || tc?.status === 'ACCEPTED')).length;
                const totalCount = results.length;
                const exercisePoints = exerciseDetail?.points || 0;
                if (totalCount > 0) {
                    finalScore = Math.round((passedCount / totalCount) * exercisePoints);
                } else {
                    finalScore = 0;
                }

                result.score = finalScore;
                console.log('Calculated final score:', finalScore);
            }

            setRunScore(finalScore);
            setSubmission(result);
            setIsSubmitting(false);

            const passedCount = result.passedTestcases ||
                (result.testCaseResults ? result.testCaseResults.filter((tc: any) => (tc?.verdict === 'ACCEPTED' || tc?.status === 'ACCEPTED')).length : 0);
            const totalCount = result.totalTestcases || result.testCaseResults?.length || 0;

            const edu = getEducationalLabel(passedCount, totalCount);
            const passRatio = totalCount > 0 ? (passedCount / totalCount) : 0;
            const isPassingGrade = passRatio >= 0.5;

            if (result.verdict === 'ACCEPTED' || (passedCount > 0 && passedCount === totalCount)) {
                setConsoleOutput(`🎉 ${edu.label}! Bạn đã vượt qua tất cả test case. (+${finalScore} điểm)`);
                toast.success(result.message || `${edu.label}! Bài làm chính xác. (+${finalScore} điểm)`);
                markLessonAsComplete();
            } else if (isPassingGrade) {
                setConsoleOutput(`✅ ${edu.label}! Đã vượt qua ${passedCount}/${totalCount} test case. (+${finalScore} điểm)\nBạn đã đạt điều kiện hoàn thành bài học!`);
                toast.success(`${edu.label}: ${passedCount}/${totalCount} test case. (+${finalScore} điểm). Chúc mừng bạn đã hoàn thành yêu cầu!`);
                markLessonAsComplete();
            } else if (passedCount > 0) {
                setConsoleOutput(`⚠️ ${edu.label}. Đã vượt qua ${passedCount}/${totalCount} test case. (+${finalScore} điểm)\nLưu ý: Bạn cần đạt ít nhất 50% số điểm để hoàn thành bài tập này.`);
                toast.warning(`Chưa đạt yêu cầu: Bạn cần đúng ít nhất 50% test case để bài học được tính là hoàn thành.`);
            } else {
                const verdict = result.verdict || 'WRONG_ANSWER';
                const verdictLabel = verdict === 'WRONG_ANSWER' ? 'CHƯA ĐẠT' : (VERDICT_CONFIG[verdict]?.label || verdict);
                setConsoleOutput(`Kết quả: ${verdictLabel}\n${result.message || ''}`);
                toast.error(result.message || `Bài làm chưa chính xác.`);
            }

            if (targetExerciseId) {
                setTimeout(() => fetchHistory(targetExerciseId), 1000);
            }
            setLeftTab('submissions');
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Có lỗi khi nộp bài';
            toast.error(errorMsg);
            setIsSubmitting(false);
            setSubmission(null);
            setConsoleOutput('Lỗi: ' + errorMsg);
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

    const isSubmitMode = submission?.submissionId != null;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] overflow-hidden">
            <header className="h-12 flex items-center justify-between px-4 bg-[#282828] border-b border-[#3e3e3e] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (courseSlug) {
                                navigate(`/course/${courseSlug}/learn`);
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
                    {/* Run score badge */}
                    {passedRunCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                            <Zap size={12} className="text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">
                                {passedRunCount}/{sampleCases.length} chạy thử OK
                            </span>
                        </div>
                    )}
                    <div className="h-4 w-px bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#3e3e3e]">
                        <Trophy size={12} className="text-amber-400" />
                        <span className="hidden sm:inline text-xs text-slate-400">Điểm :</span>
                        <span className="text-xs font-bold text-indigo-400">{exerciseDetail.points} điểm</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left Side: Problem Info */}
                    <ResizablePanel defaultSize={40} minSize={25}>
                        <div className="h-full flex flex-col bg-[#1a1a1a]">
                            <Tabs value={leftTab} onValueChange={(val) => {
                                setLeftTab(val);
                                if (val === 'submissions') {
                                    const exId = exerciseDetail?.exerciseId || exerciseDetail?.templateId || id;
                                    if (exId) fetchHistory(exId);
                                }
                            }} className="h-full flex flex-col">
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
                                                    {exerciseDetail.description.split('\n').map((line: string, i: number) => (
                                                        <p key={i} className="mb-4 leading-relaxed whitespace-pre-wrap">
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-md font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <Beaker size={16} className="text-indigo-500" />
                                                            Test Cases
                                                        </h3>
                                                        {passedRunCount > 0 && (
                                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                                                                <Star size={11} className="text-emerald-400 fill-emerald-400" />
                                                                <span className="text-[11px] font-bold text-emerald-400">
                                                                    {passedRunCount}/{sampleCases.length} passed
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {sampleCases.map((tc: any, idx: number) => {
                                                            const result = caseResults[idx];
                                                            const isPassed = passedCaseIndices.has(idx);
                                                            const isFailed = result && !isPassed;
                                                            const isCurrentlyRunning = isRunningCase && activeTestCaseIndex === idx;

                                                            return (
                                                                <Button
                                                                    key={idx}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setActiveTestCaseIndex(idx);
                                                                        activeTestCaseIndexRef.current = idx;
                                                                        if (caseResults[idx]) {
                                                                            setActiveResultCaseIndex(idx);
                                                                            setConsolePanelOpen(true);
                                                                            setConsoleTab('result');
                                                                        }
                                                                    }}
                                                                    className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTestCaseIndex === idx
                                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                        : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                                                                        } ${isPassed ? 'border-l-2 border-l-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : isFailed ? 'border-l-2 border-l-rose-500' : ''}`}
                                                                >
                                                                    {isCurrentlyRunning ? (
                                                                        <Loader2 size={12} className="animate-spin text-blue-400" />
                                                                    ) : isPassed ? (
                                                                        <CheckCircle size={12} className="text-emerald-500" />
                                                                    ) : isFailed ? (
                                                                        <XCircle size={12} className="text-rose-500" />
                                                                    ) : (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                                                    )}
                                                                    Case {idx + 1}
                                                                    {(tc.points || tc.score) ? <span className="text-[10px] opacity-60">+{tc.points || tc.score}đ</span> : null}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>

                                                    {sampleCases[activeTestCaseIndex] && (
                                                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                                            {caseResults[activeTestCaseIndex] && (() => {
                                                                const result = caseResults[activeTestCaseIndex];
                                                                const isPassed = result.verdict === 'ACCEPTED';
                                                                return (
                                                                    <div className={`p-3 rounded-xl border flex items-center justify-between ${isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-1.5 rounded-lg ${isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                                                {isPassed ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                                                                            </div>
                                                                            <div>
                                                                                <div className={`text-xs font-black uppercase tracking-tight ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                    {isPassed ? `Đã vượt qua (Passed) +${result.points || sampleCases[activeTestCaseIndex]?.points || 0}đ` : result.verdict || 'Chưa đạt'}
                                                                                </div>
                                                                                <div className="text-[10px] text-slate-500 font-bold">
                                                                                    {result.runtimeMs != null ? `${result.runtimeMs}ms` : ''} {result.memoryKb != null ? `• ${(result.memoryKb / 1024).toFixed(2)}MB` : ''}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                disabled={isRunningCase || isSubmitting}
                                                                                className="h-7 text-[11px] font-black uppercase bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1.5"
                                                                                onClick={handleRunCurrentCase}
                                                                            >
                                                                                {isRunningCase ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
                                                                                Chạy lại
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}

                                                            {!caseResults[activeTestCaseIndex] && (
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        disabled={isRunningCase || isSubmitting}
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
                                                                    <div className="text-[11px] font-black text-indigo-400 uppercase tracking-wider mb-1">Explanation:</div>
                                                                    <p className="text-[13px] text-slate-400 italic leading-relaxed">
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
                                    <div className={`h-full m-0 overflow-y-auto w-full ${leftTab === 'submissions' ? 'block' : 'hidden'}`}>

                                        <div className="p-4 space-y-4">
                                            {loadingHistory && (
                                                <div className="flex justify-center p-8">
                                                    <Loader2 className="animate-spin text-indigo-500" />
                                                </div>
                                            )}
                                            {!loadingHistory && submissionHistory.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                                    <HistoryIcon size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                                    <p>Bạn chưa có lượt nộp bài nào.</p>
                                                    <p className="text-[10px] mt-2 opacity-50">Lịch sử sẽ cập nhật tại đây khi bạn nộp bài thành công.</p>
                                                </div>
                                            )}

                                            {!loadingHistory && submissionHistory.length > 0 && (
                                                <div className="space-y-3">
                                                    <h3 className="font-bold text-slate-300 px-1 mb-2">
                                                        Lịch sử Lượt nộp ({submissionHistory.length})
                                                    </h3>
                                                    {submissionHistory.map((sub: any, index: number) => {
                                                        const detailTestCases = exerciseDetail?.exerciseTestCases || exerciseDetail?.testCases || [];
                                                        const passed = sub.passedTestcases ?? sub.testCasesPassed ?? 0;
                                                        const total = sub.totalTestcases ?? sub.totalTestCases ?? (detailTestCases.length || 0);
                                                        const isSuccess = sub.status === 'ACCEPTED' || (passed > 0 && passed === total);
                                                        const isPartial = sub.status !== 'ACCEPTED' && passed > 0 && passed < total;

                                                        const edu = getEducationalLabel(passed, total);
                                                        const verdictConfig = {
                                                            ... (VERDICT_CONFIG[sub.status || 'WRONG_ANSWER'] || VERDICT_CONFIG.WRONG_ANSWER),
                                                            label: edu.label,
                                                            color: edu.color
                                                        };

                                                        return (
                                                            <div key={index} className="flex justify-between items-center bg-[#242424] border border-[#3e3e3e] p-4 rounded-xl hover:border-indigo-500/50 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-[120px] text-center px-2 py-1 rounded text-[11px] font-black uppercase ${edu.color} bg-white/5 border border-white/10 shrink-0`}>
                                                                        {edu.label}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[15px] text-slate-500 font-bold uppercase tracking-wider">
                                                                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vn-VN') : 'Vừa nộp'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm font-black text-slate-200">
                                                                            Đã vượt qua: {passed} / {total}
                                                                        </div>
                                                                        <div className="text-[15px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                                                                            Ngôn ngữ: <span className="text-indigo-400">{sub.language || 'N/A'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right flex flex-col items-end justify-center">
                                                                    <div className={`text-xl font-black ${edu.color}`}>
                                                                        {(() => {
                                                                            if (sub.status === 'ACCEPTED') return exerciseDetail?.points || 100;
                                                                            if (sub.score && sub.score > 0) return sub.score;
                                                                            if (total > 0) {
                                                                                return Math.floor((passed / total) * (exerciseDetail?.points || 100));
                                                                            }
                                                                            return sub.points || 0;
                                                                        })()} <span className="text-xs font-normal opacity-50 text-slate-500">điểm</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-2 mt-1 text-[15px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 uppercase tracking-widest"
                                                                        onClick={() => {
                                                                            setConsoleTab('result');
                                                                            setConsolePanelOpen(true);
                                                                            setSubmission(sub);
                                                                            setCode(sub.code || '');
                                                                            setSelectedLanguage(sub.language || 'Java');
                                                                            toast.success("Mã nguồn đã được tải vào Editor");
                                                                            if (sub.testCaseResults) {
                                                                                setActiveResultCaseIndex(0);
                                                                            }
                                                                        }}
                                                                    >
                                                                        Xem code
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                    onChange={(value) => handleCodeChange(value || '')}
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

                            {/* Console / Result Panel */}
                            <div className="shrink-0 bg-[#282828] border-t border-[#3e3e3e]">
                                {consolePanelOpen && (
                                    <div className="border-b border-[#3e3e3e] min-h-[220px] max-h-[420px] overflow-y-auto">
                                        <Tabs value={consoleTab} onValueChange={(v: any) => setConsoleTab(v)} className="w-full">
                                            <div className="flex items-center justify-between px-4 pt-3 mb-3">
                                                <TabsList className="bg-transparent border-b-0 gap-4 h-8 p-0">
                                                    <TabsTrigger
                                                        value="result"
                                                        className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none border-b-2 border-transparent h-full px-0 font-bold text-xs uppercase tracking-widest text-slate-500"
                                                    >
                                                        {isSubmitMode ? 'Kết quả nộp bài' : 'Kết quả chạy thử'}
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <TabsContent value="result" className="mt-0 space-y-3 px-4 pb-4">
                                                {isRunningCase && !submission?.testCaseResults?.[activeTestCaseIndex] ? (
                                                    // Loading state while running
                                                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 space-y-3">
                                                        <Loader2 size={28} className="animate-spin text-indigo-500 opacity-70" />
                                                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 animate-pulse">
                                                            Đang thực thi Case {activeTestCaseIndex + 1}...
                                                        </div>
                                                    </div>
                                                ) : submission ? (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">

                                                        {/* === SUBMIT MODE: Show full submission result === */}
                                                        {isSubmitMode ? (
                                                            <>
                                                                {/* Submission summary card */}
                                                                <div className={`p-4 rounded-xl border ${submission.verdict === 'ACCEPTED'
                                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                    : (submission.passedTestcases || 0) >= 1
                                                                        ? 'bg-amber-500/5 border-amber-500/20'
                                                                        : 'bg-rose-500/5 border-rose-500/20'
                                                                    }`}>
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                {(() => {
                                                                                    const passed = submission.passedTestcases || 0;
                                                                                    const total = submission.totalTestcases || 0;
                                                                                    const verdict = submission.verdict || "PENDING";

                                                                                    const isSuccess = verdict === 'ACCEPTED' || (passed > 0 && passed === total);
                                                                                    const isError = ['COMPILATION_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED'].includes(verdict);

                                                                                    const edu = getEducationalLabel(passed, total);
                                                                                    const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.PENDING;
                                                                                    const Icon = config.icon;

                                                                                    // Nếu là lỗi hệ thống thì hiện lỗi, nếu không thì hiện nhãn đánh giá học tập
                                                                                    const finalLabel = isError ? config.label : edu.label;
                                                                                    const finalColor = isError ? config.color : edu.color;

                                                                                    return (
                                                                                        <>
                                                                                            <div className={`p-2 rounded-lg ${config.bg}`}>
                                                                                                <Icon className={`w-5 h-5 ${finalColor} ${config.animate || ""}`} />
                                                                                            </div>
                                                                                            <div>
                                                                                                <div className={`font-black text-sm uppercase tracking-tight ${finalColor}`}>{finalLabel}</div>
                                                                                                <div className="text-[10px] text-slate-500 font-bold">
                                                                                                    {submission.runtimeMs != null ? `${submission.runtimeMs}ms` : '---'} • {submission.memoryKb != null ? `${(submission.memoryKb / 1024).toFixed(2)}MB` : '---'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </>
                                                                                    );
                                                                                })()}
                                                                            </div>

                                                                            {/* Score breakdown */}
                                                                            <div className="text-right space-y-1">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div>
                                                                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Test cases</div>
                                                                                        <div className="text-sm font-black text-white">
                                                                                            {submission.passedTestcases || 0} / {submission.totalTestcases || 0}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className={`px-3 py-1.5 rounded-lg ${submission.verdict === 'ACCEPTED' ? 'bg-emerald-500/10 border border-emerald-500/20' : (submission.passedTestcases || 0) >= 1 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800'}`}>
                                                                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Điểm</div>
                                                                                        <div className={`text-lg font-black ${submission.verdict === 'ACCEPTED' ? 'text-emerald-400' : (submission.passedTestcases || 0) >= 1 ? 'text-amber-400' : 'text-slate-300'}`}>
                                                                                            {submission.score || 0}
                                                                                            <span className="text-xs text-slate-500 font-normal ml-0.5">/{exerciseDetail.points}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Summary message */}
                                                                        {submission.message && (
                                                                            <div className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-800/20 italic">
                                                                                {submission.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Test case tabs for submit result */}
                                                                {submission.testCaseResults && submission.testCaseResults.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {submission.testCaseResults.map((tc, idx) => {
                                                                                if (!tc) return null;
                                                                                return (
                                                                                    <Button
                                                                                        key={idx}
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => setActiveResultCaseIndex(idx)}
                                                                                        className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeResultCaseIndex === idx
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
                                                                            <ResultDetailPanel
                                                                                result={submission.testCaseResults[activeResultCaseIndex]}
                                                                                caseInput={sampleCases[activeResultCaseIndex]?.input}
                                                                                caseExpected={sampleCases[activeResultCaseIndex]?.expectedOutput}
                                                                                casePoints={sampleCases[activeResultCaseIndex]?.points}
                                                                                formatContent={formatContent}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 italic leading-relaxed">
                                                                        {consoleOutput}
                                                                    </div>
                                                                )}


                                                                {/* Partial pass notification */}
                                                                {submission.verdict !== 'ACCEPTED' && (submission.passedTestcases || 0) >= 1 && courseSlug && (
                                                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                                                                        <CheckCircle size={18} className="text-amber-400 flex-shrink-0" />
                                                                        <div>
                                                                            <div className="text-xs font-bold text-amber-400">Bài học đã được đánh dấu hoàn thành!</div>
                                                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                                                Bạn đã vượt qua {submission.passedTestcases}/{submission.totalTestcases} test case. Có thể tiếp tục học bài mới.
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {((submission.passedTestcases || 0) >= 1 || lessonMarkedComplete) && courseSlug && (
                                                                    <Button
                                                                        onClick={() => navigate(`/learn/${courseSlug}?jumpNext=true`)}
                                                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-tight gap-2 py-5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                                                    >
                                                                        Tiếp theo <ChevronRight size={18} />
                                                                    </Button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            /* === RUN MODE: Show single-case run result === */
                                                            <>
                                                                {/* Run score summary bar */}
                                                                {passedRunCount > 0 && (
                                                                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Award size={14} className="text-emerald-400" />
                                                                            <span className="text-xs font-bold text-emerald-400">Chạy thử: {passedRunCount}/{sampleCases.length} case đạt</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Star size={11} className="text-amber-400 fill-amber-400" />
                                                                            <span className="text-xs font-black text-amber-400">{runScore} điểm tích lũy</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Tabs for each run case */}
                                                                {Object.keys(caseResults).length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {sampleCases.map((_: any, idx: number) => {
                                                                            const r = caseResults[idx];
                                                                            if (!r) return null;
                                                                            const passed = r.verdict === 'ACCEPTED';
                                                                            return (
                                                                                <Button
                                                                                    key={idx}
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => setActiveResultCaseIndex(idx)}
                                                                                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeResultCaseIndex === idx
                                                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                                                                                        }`}
                                                                                >
                                                                                    <div className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                                    Case {idx + 1}
                                                                                </Button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Detail of selected run case */}
                                                                {caseResults[activeResultCaseIndex] ? (
                                                                    <ResultDetailPanel
                                                                        result={caseResults[activeResultCaseIndex]}
                                                                        caseInput={sampleCases[activeResultCaseIndex]?.input}
                                                                        caseExpected={sampleCases[activeResultCaseIndex]?.expectedOutput}
                                                                        casePoints={sampleCases[activeResultCaseIndex]?.points}
                                                                        formatContent={formatContent}
                                                                    />
                                                                ) : (
                                                                    <div className="text-xs font-mono text-slate-400 whitespace-pre-wrap bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 italic leading-relaxed">
                                                                        {consoleOutput}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    // Initial state: waiting
                                                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 space-y-3">
                                                        <Loader2 size={28} className="animate-spin opacity-20 text-indigo-500" />
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 animate-pulse">Waiting for code execution...</div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}

                                {/* Bottom toolbar */}
                                <div className="h-14 px-4 flex items-center justify-between">
                                    <button
                                        onClick={() => setConsolePanelOpen(prev => !prev)}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Bảng điều khiển
                                        <ChevronDown size={16} className={`transition-transform ${consolePanelOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        {/* Run progress indicator */}
                                        {sampleCases.length > 0 && (
                                            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${hasRunAtLeastOneCase
                                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                                : 'text-slate-400 bg-slate-800 border-slate-700'
                                                }`}>
                                                {Object.keys(caseResults).length}/{sampleCases.length} đã chạy
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleRunCurrentCase}
                                            disabled={isRunningCase || isSubmitting}
                                            variant="outline"
                                            className="h-9 px-4 border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 font-bold gap-2 transition-all"
                                        >
                                            {isRunningCase
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Play size={14} fill="currentColor" />}
                                            Chạy (Case {activeTestCaseIndex + 1})
                                        </Button>

                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isRunningCase || !hasRunAtLeastOneCase}
                                            title={!hasRunAtLeastOneCase ? `Vui lòng chạy ít nhất 1 test case trước khi nộp bài` : 'Nộp bài để chấm điểm'}
                                            className={`h-9 px-6 font-bold gap-2 shadow-lg active:scale-95 transition-all ${hasRunAtLeastOneCase
                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-400 shadow-none cursor-not-allowed'
                                                }`}
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

interface ResultDetailPanelProps {
    result: TestCaseResult;
    caseInput?: string;
    caseExpected?: string;
    casePoints?: number;
    formatContent: (text: string) => string;
}

const ResultDetailPanel: React.FC<ResultDetailPanelProps> = ({ result, caseInput, caseExpected, casePoints, formatContent }) => {
    const isPassed = result.verdict === 'ACCEPTED';

    return (
        <div className="space-y-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* verdict badge */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isPassed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                <div className="flex items-center gap-2">
                    {isPassed
                        ? <CheckCircle size={14} className="text-emerald-500" />
                        : <XCircle size={14} className="text-rose-500" />
                    }
                    <span className={`text-xs font-black uppercase tracking-tight ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPassed ? 'Accepted' : (VERDICT_CONFIG[result.verdict || '']?.label || result.verdict)}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                    {(isPassed && (result.points || casePoints) != null) && (
                        <span className="text-emerald-400 font-black">+{result.points || casePoints} điểm</span>
                    )}
                    {result.runtimeMs != null && <span>{result.runtimeMs}ms</span>}
                    {result.memoryKb != null && <span>{(result.memoryKb / 1024).toFixed(1)}MB</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={11} className="text-indigo-400" />
                        Đầu vào
                    </div>
                    <pre className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap min-h-[44px]">
                        {formatContent(result.input || caseInput || '')}
                    </pre>
                </div>
                <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Play size={11} className="text-amber-400" />
                        Kết quả
                    </div>
                    <pre className={`bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap min-h-[44px] ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatContent(result.actualOutput || (result as any).output || 'N/A')}
                    </pre>
                </div>
                <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={11} className="text-emerald-400" />
                        Mong đợi
                    </div>
                    <pre className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap min-h-[44px]">
                        {formatContent(result.expectedOutput || caseExpected || '')}
                    </pre>
                </div>
            </div>

            {result.message && (
                <div className="space-y-1 pt-2 border-t border-slate-800/50">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Thông báo:</div>
                    <pre className="bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {result.message}
                    </pre>
                </div>
            )}

            {result.error && (
                <div className="space-y-1 pt-2 border-t border-slate-800/50">
                    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Chi tiết lỗi:</div>
                    <pre className="bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 text-[11px] font-mono text-rose-400 overflow-x-auto">
                        {result.error}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default CodingExerciseView;
