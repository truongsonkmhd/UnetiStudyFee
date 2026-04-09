import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Clock, Trophy, AlertCircle, CheckCircle, Search, Code, BookOpen, Loader2 } from 'lucide-react';
import { ContestLessonSummary } from "@/model/contest-lesion/ContestLessonSummary";
import contestLessonService from "@/services/contestLessonService";
import classContestService from "@/services/classContestService";
import { CreateClassContestRequest } from "@/model/class-contest/CreateClassContestRequest";
import { toast } from 'sonner';

interface AddContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    onSuccess: () => void;
}

const AddContestModal: React.FC<AddContestModalProps> = ({
    isOpen,
    onClose,
    classId,
    className,
    onSuccess
}) => {
    const [contests, setContests] = useState<ContestLessonSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedContestId, setSelectedContestId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [fetchError, setFetchError] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const [formData, setFormData] = useState({
        scheduledStartTime: '',
        scheduledEndTime: '',
        weight: 1.0,
        maxAttemptsOverride: undefined as number | undefined,
        passingScoreOverride: undefined as number | undefined,
        showLeaderboardOverride: true,
    });

    const resetForm = useCallback(() => {
        setSelectedContestId('');
        setSearchTerm('');
        setFetchError(null);
        setFormData({
            scheduledStartTime: '',
            scheduledEndTime: '',
            weight: 1.0,
            maxAttemptsOverride: undefined,
            passingScoreOverride: undefined,
            showLeaderboardOverride: true,
        });
    }, []);

    const fetchContests = useCallback(async (q: string) => {
        try {
            setLoading(true);
            setFetchError(null);

            // Try fetching ready contests first
            let items: ContestLessonSummary[] = [];
            try {
                const response = await contestLessonService.getReadyContests({ q: q || undefined, size: 50 });
                items = response?.items || [];
            } catch (readyError) {
                console.warn("getReadyContests failed, falling back to search:", readyError);
            }

            // Fallback: if no ready contests found, search all (READY + DRAFT)
            if (items.length === 0) {
                try {
                    const searchResponse = await contestLessonService.search({
                        q: q || undefined,
                        size: 50,
                        page: 0,
                    });
                    items = searchResponse?.items || [];
                } catch (searchError) {
                    console.warn("search fallback also failed:", searchError);
                }
            }

            setContests(items);
            if (items.length === 0) {
                setFetchError("Không tìm thấy bài thi nào. Hãy tạo bài thi mẫu trước tại mục 'Quản lý Bài thi'.");
            }
        } catch (error) {
            console.error("Error fetching contests:", error);
            setFetchError("Không thể tải danh sách bài thi. Vui lòng thử lại.");
            setContests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm();
            fetchContests('');
        }
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [isOpen, resetForm, fetchContests]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchContests(value);
        }, 400);
    };

    const handleSelectContest = (contest: ContestLessonSummary) => {
        if (selectedContestId === contest.contestLessonId) {
            setSelectedContestId('');
            return;
        }
        setSelectedContestId(contest.contestLessonId);

        // Auto-fill defaults from contest
        setFormData(prev => ({
            ...prev,
            maxAttemptsOverride: contest.defaultMaxAttempts,
            passingScoreOverride: contest.passingScore,
        }));
    };

    const selectedContest = contests.find(c => c.contestLessonId === selectedContestId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContestId) {
            toast.error("Vui lòng chọn một bài thi");
            return;
        }
        if (!formData.scheduledStartTime || !formData.scheduledEndTime) {
            toast.error("Vui lòng điền đầy đủ thời gian bắt đầu và kết thúc");
            return;
        }

        const startTime = new Date(formData.scheduledStartTime);
        const endTime = new Date(formData.scheduledEndTime);
        if (endTime <= startTime) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateClassContestRequest = {
                classId,
                contestLessonId: selectedContestId,
                scheduledStartTime: startTime.toISOString(),
                scheduledEndTime: endTime.toISOString(),
                weight: formData.weight,
                maxAttemptsOverride: formData.maxAttemptsOverride,
                passingScoreOverride: formData.passingScoreOverride,
                showLeaderboardOverride: formData.showLeaderboardOverride,
                isActive: true
            };

            await classContestService.addContest(payload);
            toast.success("Đã thêm bài thi vào lớp học thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error adding contest:", error);
            toast.error(error?.message || "Không thể thêm bài thi vào lớp học");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Thêm bài thi mới</h2>
                        <p className="text-sm text-muted-foreground mt-1">Lớp: <span className="font-semibold text-foreground">{className}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* ── Step 1: Select Contest ── */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-foreground flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" />
                            Bước 1: Chọn bài thi mẫu
                        </label>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài thi theo tên..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                            />
                        </div>

                        {/* Contest list */}
                        <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tải danh sách bài thi...
                                </div>
                            ) : fetchError && contests.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">{fetchError}</p>
                                </div>
                            ) : contests.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">Không tìm thấy bài thi nào</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {contests.map(contest => {
                                        const isSelected = selectedContestId === contest.contestLessonId;
                                        return (
                                            <button
                                                key={contest.contestLessonId}
                                                type="button"
                                                onClick={() => handleSelectContest(contest)}
                                                className={`w-full flex items-start gap-3 p-3 text-left transition-all ${isSelected
                                                    ? 'bg-primary/8 border-l-4 border-l-primary'
                                                    : 'hover:bg-muted border-l-4 border-l-transparent'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground/30'
                                                    }`}>
                                                    {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm text-foreground truncate">{contest.title}</span>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${contest.status === 'READY'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {contest.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Code className="w-3 h-3" />
                                                            {contest.codingExerciseCount} code
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" />
                                                            {contest.quizQuestionCount} quiz
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className="w-3 h-3" />
                                                            {contest.totalPoints} điểm
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedContest && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Đã chọn: {selectedContest.title}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Step 2: Schedule ── */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Bước 2: Lên lịch thi
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Thời gian bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledStartTime}
                                    onChange={e => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Thời gian kết thúc</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledEndTime}
                                    onChange={e => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Step 3: Config ── */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Bước 3: Cấu hình (tùy chọn)
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hệ số điểm</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
                                    className="w-full px-3 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Điểm đạt</label>
                                <input
                                    type="number"
                                    value={formData.passingScoreOverride ?? ''}
                                    onChange={e => setFormData({ ...formData, passingScoreOverride: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-3 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                    placeholder="Mặc định"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Số lần thử</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.maxAttemptsOverride ?? ''}
                                    onChange={e => setFormData({ ...formData, maxAttemptsOverride: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-3 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                    placeholder="Mặc định"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showLeaderboard"
                                checked={formData.showLeaderboardOverride}
                                onChange={e => setFormData({ ...formData, showLeaderboardOverride: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <label htmlFor="showLeaderboard" className="text-sm font-medium text-foreground">Hiển thị bảng xếp hạng</label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedContestId}
                            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-bold shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                'Thêm bài thi vào lớp'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContestModal;
