import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Trophy, AlertCircle, CheckCircle, Search } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        scheduledStartTime: '',
        scheduledEndTime: '',
        weight: 1.0,
        maxAttemptsOverride: undefined as number | undefined,
        passingScoreOverride: undefined as number | undefined,
        showLeaderboardOverride: true,
    });

    useEffect(() => {
        if (isOpen) {
            // Reset form when opening
            setSelectedContestId('');
            setSearchTerm('');
            setFormData({
                scheduledStartTime: '',
                scheduledEndTime: '',
                weight: 1.0,
                maxAttemptsOverride: undefined,
                passingScoreOverride: undefined,
                showLeaderboardOverride: true,
            });
            fetchReadyContests('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const delayDebounceFn = setTimeout(() => {
                fetchReadyContests(searchTerm);
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm]);

    const fetchReadyContests = async (q: string) => {
        try {
            setLoading(true);
            const response = await contestLessonService.getReadyContests({ q, size: 50 });
            setContests(response.items);
        } catch (error) {
            console.error("Error fetching contests:", error);
            toast.error("Không thể tải danh sách bài thi");
        } finally {
            setLoading(false);
        }
    };

    const handleContestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedContestId(id);

        // Auto-fill some defaults if contest is selected
        const contest = contests.find(c => c.contestLessonId === id);
        if (contest) {
            setFormData(prev => ({
                ...prev,
                maxAttemptsOverride: contest.defaultMaxAttempts,
                passingScoreOverride: contest.passingScore
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContestId || !formData.scheduledStartTime || !formData.scheduledEndTime) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateClassContestRequest = {
                classId,
                contestLessonId: selectedContestId,
                scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
                scheduledEndTime: new Date(formData.scheduledEndTime).toISOString(),
                weight: formData.weight,
                maxAttemptsOverride: formData.maxAttemptsOverride,
                passingScoreOverride: formData.passingScoreOverride,
                showLeaderboardOverride: formData.showLeaderboardOverride,
                isActive: true
            };

            await classContestService.addContest(payload);
            toast.success("Đã thêm bài thi vào lớp học");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding contest:", error);
            toast.error("Không thể thêm bài thi vào lớp học");
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
                        <p className="text-sm text-muted-foreground mt-1">Lớp: {className}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Contest Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Chọn bài thi mẫu</label>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài thi theo tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                                />
                            </div>

                            <select
                                value={selectedContestId}
                                onChange={handleContestChange}
                                className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                required
                            >
                                <option value="">-- Chọn bài thi --</option>
                                {contests.map(contest => (
                                    <option key={contest.contestLessonId} value={contest.contestLessonId}>
                                        {contest.title} ({contest.codingExerciseCount} code, {contest.quizQuestionCount} quiz)
                                    </option>
                                ))}
                            </select>
                            {loading && <p className="text-xs text-muted-foreground">Đang tìm kiếm...</p>}
                        </div>

                        {/* Timing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Thời gian bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledStartTime}
                                    onChange={e => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Thời gian kết thúc</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledEndTime}
                                    onChange={e => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    required
                                />
                            </div>
                        </div>

                        {/* Points & Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Hệ số điểm (Weight)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Điểm đạt (Passing Score)</label>
                                <input
                                    type="number"
                                    value={formData.passingScoreOverride || ''}
                                    onChange={e => setFormData({ ...formData, passingScoreOverride: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    placeholder="Mặc định theo bài thi mẫu"
                                />
                            </div>
                        </div>

                        {/* Attempts & Display */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Số lần thử tối đa</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.maxAttemptsOverride || ''}
                                    onChange={e => setFormData({ ...formData, maxAttemptsOverride: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    placeholder="Mặc định theo bài thi mẫu"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="showLeaderboard"
                                    checked={formData.showLeaderboardOverride}
                                    onChange={e => setFormData({ ...formData, showLeaderboardOverride: e.target.checked })}
                                    className="w-4 h-4 text-primary"
                                />
                                <label htmlFor="showLeaderboard" className="text-sm font-medium text-foreground">Hiển thị bảng xếp hạng</label>
                            </div>
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
                            disabled={submitting}
                            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu bài thi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContestModal;
