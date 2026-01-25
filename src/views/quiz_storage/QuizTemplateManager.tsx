import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
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
  Loader2,
  CheckCircle2,
  FileQuestion,
  Target
} from 'lucide-react';
import { QuizTemplateDetail } from '@/model/quiz-template/QuizTemplateDetail';
import quizTemplateService from '@/services/quizTemplateService';
import QuizEditorModal from './QuizEditorModal';
import { toast } from 'sonner';

const QuizTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<QuizTemplateDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [duplicating, setDuplicating] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Load Data
  const loadTemplates = useCallback(async (reset = false, pageOverride?: number) => {
    if (reset) {
      setLoading(true);
      setCurrentPage(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const page = reset ? 0 : (pageOverride ?? currentPage);
      const params: any = { page, size: pageSize };
      if (searchTerm) params.searchTerm = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (showActiveOnly !== null) params.isActive = showActiveOnly;

      const data = await quizTemplateService.searchTemplates(params);

      if (reset) {
        setTemplates(data.items);
      } else {
        setTemplates(prev => {
          const existingIds = new Set(prev.map(t => t.templateId));
          const newItems = data.items.filter(item => !existingIds.has(item.templateId));
          return [...prev, ...newItems];
        });
      }

      setTotalElements(data.totalElements);
      setHasMore(data.hasNext);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, showActiveOnly, currentPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadTemplates(false, nextPage);
    }
  }, [loadingMore, hasMore, currentPage, loadTemplates]);

  // Initial load and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTemplates(true);
      loadCategories();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, showActiveOnly]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  const loadCategories = async () => {
    try {
      const data = await quizTemplateService.getAllCategory();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const openDuplicateModal = (template: QuizTemplateDetail) => {
    setSelectedTemplateId(template.templateId);
    setDuplicateName(`${template.templateName} (Bản sao)`);
    setIsDuplicateOpen(true);
  };

  const handleDuplicate = async () => {
    if (!selectedTemplateId || !duplicateName.trim()) return;
    try {
      setDuplicating(true);
      await quizTemplateService.duplicateTemplate(selectedTemplateId, duplicateName.trim());
      toast.success('Nhân bản mẫu quiz thành công!');
      setIsDuplicateOpen(false);
      loadTemplates(true);
    } catch (error) {
      toast.error('Lỗi khi nhân bản mẫu');
    } finally {
      setDuplicating(false);
    }
  };

  const handleToggleStatus = async (templateId: string, isActive: boolean) => {
    try {
      await quizTemplateService.toggleTemplateStatus(templateId, !isActive);
      toast.success('Cập nhật trạng thái thành công!');
      loadTemplates(true);
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu quiz này?')) return;
    try {
      await quizTemplateService.deleteTemplate(templateId);
      toast.success('Đã xóa mẫu quiz');
      loadTemplates(true);
    } catch (error) {
      toast.error('Lỗi khi xóa mẫu quiz');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setShowCreateModal(true);
  };

  const handleModalClose = (shouldRefresh: boolean) => {
    setShowCreateModal(false);
    setEditingTemplateId(null);
    if (shouldRefresh) loadTemplates(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Thư viện Mẫu Quiz
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Layers size={16} />
              Quản lý danh sách các bộ đề câu hỏi trắc nghiệm
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTemplateId(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus size={20} />
            Tạo mẫu mới
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng số mẫu', value: totalElements, icon: FileQuestion, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Đang hoạt động', value: templates.filter(t => t.isActive).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tổng câu hỏi', value: templates.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0), icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Tổng lượt dùng', value: templates.reduce((acc, curr) => acc + (curr.usageCount || 0), 0), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
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
                placeholder="Tìm kiếm tiêu đề, mô tả..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-foreground"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
              value={showActiveOnly === null ? '' : showActiveOnly.toString()}
              onChange={(e) => setShowActiveOnly(e.target.value === '' ? null : e.target.value === 'true')}
            >
              <option value="">Trạng thái (Tất cả)</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã tạm dừng</option>
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
              <FileQuestion size={40} className="text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Không tìm thấy mẫu quiz nào</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Thử thay đổi bộ lọc hoặc tạo một mẫu mới để bắt đầu.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-colors"
            >
              Tạo mẫu quiz đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.templateId}
                className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${template.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {template.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {template.category}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${template.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted'}`} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                      {template.templateName}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">
                      {template.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border">
                      <Zap size={14} className="text-amber-500" />
                      {template.usageCount || 0} lượt dùng
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border">
                      <BookOpen size={14} className="text-indigo-500" />
                      {template.totalQuestions || 0} câu hỏi
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border">
                      <Clock size={14} className="text-blue-500" />
                      {template.timeLimitMinutes} phút
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-xl border border-border">
                      <Target size={14} className="text-rose-500" />
                      {template.passScore}% đạt
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleEditTemplate(template.templateId)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-card border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openDuplicateModal(template)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-card border border-border text-primary rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                    title="Nhân bản"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(template.templateId, template.isActive)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-sm font-semibold transition-colors ${template.isActive ? 'bg-card border-amber-500/20 text-amber-500 hover:bg-amber-500/10' : 'bg-card border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    title={template.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  >
                    {template.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(template.templateId)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-card border border-destructive/20 text-destructive rounded-xl text-sm font-semibold hover:bg-destructive/10 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
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
          {!hasMore && templates.length > 0 && (
            <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <div className="h-px w-8 bg-slate-200" />
              Bạn đã đến cuối danh sách
              <div className="h-px w-8 bg-slate-200" />
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Modal */}
      {isDuplicateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-2xl border border-border scale-in-center animate-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Copy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Nhân bản mẫu quiz</h3>
                <p className="text-sm text-muted-foreground">Tạo bản sao mới cho mẫu quiz này</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Tên mẫu mới</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nhập tên mẫu mới..."
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  className="w-full rounded-2xl border border-border px-4 py-3 bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleDuplicate}
                disabled={duplicating || !duplicateName.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Xác nhận nhân bản
              </button>
              <button
                onClick={() => setIsDuplicateOpen(false)}
                className="w-full py-3 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showCreateModal && (
        <QuizEditorModal
          quizId={editingTemplateId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default QuizTemplateManager;