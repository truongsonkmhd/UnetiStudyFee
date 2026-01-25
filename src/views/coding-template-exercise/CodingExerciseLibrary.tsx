import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    Code,
    Trophy,
    Clock,
    Database,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Copy,
    ChevronRight,
    MoreVertical,
    Calendar,
    Layers,
    Zap,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import { TemplateCard } from '@/model/coding-template/TemplateCard';
import { SearchFilters } from '@/model/coding-template/SearchFilters';
import { Difficulty } from '@/model/coding-template/Difficulty';
import { toast } from 'sonner';

const CodingExerciseLibrary: React.FC = () => {
    const navigate = useNavigate();
    const observerTarget = useRef<HTMLDivElement>(null);

    // State
    const [templates, setTemplates] = useState<TemplateCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalElements, setTotalElements] = useState(0);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const pageSize = 12;

    // Filters
    const [filters, setFilters] = useState<SearchFilters>({
        q: '',
        difficulty: undefined,
        category: '',
        language: '',
        published: undefined,
    });

    const difficulties = Object.values(Difficulty);
    const categories = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Math', 'Sorting', 'Searching'];
    const languages = ['Java', 'Python', 'JavaScript', 'C++', 'Go', 'TypeScript'];

    // Load Data
    const loadTemplates = useCallback(async (isInitial: boolean = false) => {
        if (loading || (loadingMore && !isInitial)) return;

        if (isInitial) {
            setLoading(true);
            setCurrentPage(0);
        } else {
            setLoadingMore(true);
        }

        setError(null);

        const searchParams = {
            page: isInitial ? 0 : currentPage + 1,
            size: pageSize,
            ...filters,
        };

        try {
            const response = await codingExerciseTemplateService.searchAllTemplates(searchParams);
            const data = response;

            setTemplates(prev => isInitial ? data.items : [...prev, ...data.items]);
            setTotalElements(data.totalElements);
            setHasNext(data.hasNext);
            if (!isInitial) {
                setCurrentPage(prev => prev + 1);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load templates');
            toast.error('Không thể tải danh sách bài tập');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [currentPage, filters, loading, loadingMore]);

    // Initial load and filter changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadTemplates(true);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [filters.q, filters.difficulty, filters.category, filters.language, filters.published]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNext && !loading && !loadingMore) {
                    loadTemplates(false);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [hasNext, loading, loadingMore, loadTemplates]);

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleStatus = async (templateId: string, currentStatus: boolean) => {
            
        toast.info('Tính năng đang được phát triển');
    };

    const handleDelete = async (templateId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu bài tập này?')) return;
        // Note: codingExerciseTemplateService doesn't have delete yet
        toast.info('Tính năng đang được phát triển');
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                            Thư viện Bài tập Lập trình
                        </h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Layers size={16} />
                            Quản lý và thiết lập kho đề bài tập lập trình mẫu
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/templates/create')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus size={20} />
                        Tạo bài tập mới
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng số bài tập', value: totalElements, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Đã xuất bản', value: templates.filter(t => t.isPublished).length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Bản nháp', value: templates.filter(t => !t.isPublished).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Lượt sử dụng', value: templates.reduce((acc, curr) => acc + (curr.usageCount || 0), 0), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Section */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold mb-2">
                        <Filter size={20} className="text-indigo-600" />
                        Bộ lọc tìm kiếm
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-foreground"
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-foreground"
                            value={filters.difficulty || ''}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                        >
                            <option value="">Độ khó (Tất cả)</option>
                            {difficulties.map(diff => (
                                <option key={diff} value={diff}>{diff}</option>
                            ))}
                        </select>

                        <select
                            className="px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-foreground"
                            value={filters.language || ''}
                            onChange={(e) => handleFilterChange('language', e.target.value)}
                        >
                            <option value="">Ngôn ngữ (Tất cả)</option>
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>

                        <select
                            className="px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-foreground"
                            value={filters.published === undefined ? '' : String(filters.published)}
                            onChange={(e) => handleFilterChange('published', e.target.value === '' ? undefined : e.target.value === 'true')}
                        >
                            <option value="">Trạng thái (Tất cả)</option>
                            <option value="true">Đã xuất bản</option>
                            <option value="false">Bản nháp</option>
                        </select>
                    </div>
                </div>

                {/* Content Section */}
                {loading && templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-indigo-600 animate-spin" />
                        <p className="mt-4 text-slate-500 font-medium tracking-wide">Đang tải dữ liệu...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center space-y-4">
                        <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                            <Code size={40} className="text-muted-foreground/50" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Không tìm thấy bài tập nào</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">Thử thay đổi bộ lọc hoặc tạo một bài tập mới để bắt đầu xây dựng thư viện của bạn.</p>
                        </div>
                        <button
                            onClick={() => navigate('/templates/create')}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-colors"
                        >
                            Tạo bài tập đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.templateId}
                                className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {/* Card Header area */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${codingExerciseTemplateService.getDifficultyColor(template.difficulty) === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                codingExerciseTemplateService.getDifficultyColor(template.difficulty) === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                {template.difficulty}
                                            </span>
                                            <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {template.programmingLanguage}
                                            </span>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${template.isPublished ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted'}`} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                            {template.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(template.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                <Trophy size={11} />
                                                {template.points} pts
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {template.category && (
                                            <span className="px-2 py-1 bg-primary/5 text-primary rounded-md text-[10px] font-semibold border border-primary/10">
                                                {template.category}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md text-[10px] font-semibold border border-border flex items-center gap-1">
                                            <ChevronRight size={10} />
                                            {template.usageCount} lượt dùng
                                        </span>
                                    </div>
                                </div>

                                {/* Card Actions area */}
                                <div className="p-4 bg-muted/30 border-t border-border grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => navigate(`/templates/${template.templateId}/view`)}
                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-card border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                                    >
                                        <Eye size={16} />
                                        Xem
                                    </button>
                                    <button
                                        onClick={() => navigate(`/templates/${template.templateId}/edit`)}
                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
                                    >
                                        <Edit size={16} />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(template.templateId, template.isPublished)}
                                        className={`col-span-2 flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-sm font-semibold transition-colors ${template.isPublished
                                            ? 'border-destructive/20 text-destructive hover:bg-destructive/10'
                                            : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                                            }`}
                                    >
                                        {template.isPublished ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        {template.isPublished ? 'Gỡ xuất bản' : 'Xuất bản'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Indicator */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                    {loadingMore && (
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="font-medium">Đang tải thêm...</span>
                        </div>
                    )}
                    {!hasNext && templates.length > 0 && (
                        <div className="text-muted-foreground/60 text-sm font-medium flex items-center gap-2">
                            <div className="h-px w-8 bg-border" />
                            Bạn đã đến cuối danh sách
                            <div className="h-px w-8 bg-border" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodingExerciseLibrary;
