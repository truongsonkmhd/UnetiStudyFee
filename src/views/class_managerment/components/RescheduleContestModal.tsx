import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import classContestService from "@/services/classContestService";
import { RescheduleContestRequest } from "@/model/class-contest/RescheduleContestRequest";
import { ClassContestResponse } from "@/model/class-contest/ClassContestResponse";
import { toast } from 'sonner';

interface RescheduleContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    contest: ClassContestResponse | null;
    onSuccess: () => void;
}

const RescheduleContestModal: React.FC<RescheduleContestModalProps> = ({
    isOpen,
    onClose,
    contest,
    onSuccess
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        newStartTime: '',
        newEndTime: ''
    });

    useEffect(() => {
        if (isOpen && contest) {
            // Localize the dates for datetime-local input
            const start = new Date(contest.scheduledStartTime);
            const end = new Date(contest.scheduledEndTime);

            const formatForInput = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                newStartTime: formatForInput(start),
                newEndTime: formatForInput(end)
            });
        }
    }, [isOpen, contest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contest) return;

        try {
            setSubmitting(true);
            const payload: RescheduleContestRequest = {
                newStartTime: new Date(formData.newStartTime).toISOString(),
                newEndTime: new Date(formData.newEndTime).toISOString()
            };

            await classContestService.rescheduleContest(contest.classContestId, payload);
            toast.success("Đã thay đổi lịch bài thi");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error rescheduling contest:", error);
            toast.error("Không thể thay đổi lịch bài thi");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !contest) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-xl border border-border max-w-md w-full">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Thay đổi lịch thi</h2>
                        <p className="text-sm text-muted-foreground mt-1">{contest.contestInfo.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Thời gian bắt đầu mới</label>
                            <input
                                type="datetime-local"
                                value={formData.newStartTime}
                                onChange={e => setFormData({ ...formData, newStartTime: e.target.value })}
                                className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Thời gian kết thúc mới</label>
                            <input
                                type="datetime-local"
                                value={formData.newEndTime}
                                onChange={e => setFormData({ ...formData, newEndTime: e.target.value })}
                                className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                required
                            />
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
                            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-bold shadow-lg shadow-primary/20"
                        >
                            {submitting ? 'Đang lưu...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RescheduleContestModal;
