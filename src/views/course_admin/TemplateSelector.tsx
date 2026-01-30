import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, CheckSquare, Square, Trophy, Calendar } from 'lucide-react';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import quizTemplateService from '@/services/quizTemplateService';
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
    onSelect: (ids: string[]) => void;
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
        onSelect(tempSelected);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            Chọn {type === 'CODE' ? 'Bài tập Lập trình' : 'Kho Trắc nghiệm'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium italic">Sử dụng thanh tìm kiếm để lọc nội dung mong muốn.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder={`Tìm kiếm ${type === 'CODE' ? 'tiêu đề bài tập...' : 'tên trắc nghiệm...'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
                    {loading && templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest italic font-medium">Đang truy xuất dữ liệu...</span>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 italic font-medium">Không tìm thấy nội dung phù hợp.</div>
                    ) : (
                        templates.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelect(item.id)}
                                className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${tempSelected.includes(item.id)
                                        ? 'border-blue-600 bg-blue-50/30'
                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                            >
                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${tempSelected.includes(item.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'
                                    }`}>
                                    {tempSelected.includes(item.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px] sm:text-xs">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        {item.category && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {item.category}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                            <Trophy className="h-3 w-3" />
                                            {item.points} pts
                                        </div>
                                        {item.difficulty && (
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
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
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Đã chọn <span className="text-blue-600 underline underline-offset-4">{tempSelected.length}</span> mục
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-200"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
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
