import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, CheckSquare, Square, Trophy, Calendar } from 'lucide-react';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import quizTemplateService from '@/services/quizTemplateService';
import { TemplateSelection } from '@/model/course-admin/TemplateSelection';
import { toast } from 'sonner';

interface TemplateItem {
    id: string;
    title: string;
    points: number;
    difficulty?: string;
    category?: string;
}

interface TemplateSelectorProps {
    type: 'CODE' | 'QUIZ';
    selectedIds: string[];
    onSelect: (ids: string[], selections: TemplateSelection[]) => void;
    onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ type, selectedIds, onSelect, onClose }) => {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

    const loadTemplates = useCallback(async () => {
        setLoading(true);
        try {
            if (type === 'CODE') {
                const response = await codingExerciseTemplateService.searchAllTemplates({ q: searchTerm, page: 0, size: 50 });
                setTemplates(response.items.map(t => ({
                    id: t.templateId,
                    title: t.title,
                    points: t.points,
                    difficulty: t.difficulty,
                    category: t.category
                })));
            } else {
                const response = await quizTemplateService.searchTemplates({ searchTerm: searchTerm, page: 0, size: 50, isActive: true });
                setTemplates(response.items.map(t => ({
                    id: t.templateId,
                    title: t.templateName,
                    points: t.passScore, // passScore as a reference for points
                    category: t.category
                })));
            }
        } catch (error) {
            console.error(error);
            toast.error(`Không thể tải danh sách ${type === 'CODE' ? 'bài tập' : 'trắc nghiệm'}`);
        } finally {
            setLoading(false);
        }
    }, [type, searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(loadTemplates, 300);
        return () => clearTimeout(timeoutId);
    }, [loadTemplates]);

    const toggleSelect = (id: string) => {
        setTempSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selections: TemplateSelection[] = tempSelected.map(id => {
            const template = templates.find(t => t.id === id);
            return {
                id,
                title: template?.title || 'Unknown'
            };
        });
        onSelect(tempSelected, selections);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-border">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">
                            Chọn {type === 'CODE' ? 'Bài tập Lập trình' : 'Kho Trắc nghiệm'}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium italic">Sử dụng thanh tìm kiếm để lọc nội dung mong muốn.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                            type="text"
                            placeholder={`Tìm kiếm ${type === 'CODE' ? 'tiêu đề bài tập...' : 'tên trắc nghiệm...'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-2xl text-sm font-bold text-foreground focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
                    {loading && templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <span className="text-xs font-black uppercase text-muted-foreground tracking-widest italic font-medium">Đang truy xuất dữ liệu...</span>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground italic font-medium">Không tìm thấy nội dung phù hợp.</div>
                    ) : (
                        templates.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelect(item.id)}
                                className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${tempSelected.includes(item.id)
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card hover:border-accent'
                                    }`}
                            >
                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${tempSelected.includes(item.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-accent'
                                    }`}>
                                    {tempSelected.includes(item.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-foreground truncate leading-tight group-hover:text-primary transition-colors uppercase tracking-widest text-[10px] sm:text-xs">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        {item.category && (
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                {item.category}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                            <Trophy className="h-3 w-3" />
                                            {item.points} pts
                                        </div>
                                        {item.difficulty && (
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                {item.difficulty}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between">
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Đã chọn <span className="text-primary underline underline-offset-4">{tempSelected.length}</span> mục
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-8 py-2.5 bg-foreground text-background rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 shadow-xl shadow-foreground/5"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;
