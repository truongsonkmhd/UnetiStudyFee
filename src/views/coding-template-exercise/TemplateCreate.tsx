import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Code2,
  Settings2,
  FileText,
  Beaker,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import { CodingExerciseTemplate } from '@/model/coding-template/CodingExerciseTemplate';
import { ExerciseTestCase } from '@/model/coding-template/ExerciseTestCase';
import { Difficulty } from '@/model/coding-template/Difficulty';
import { toast } from 'sonner';

const TemplateCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CodingExerciseTemplate>({
    title: '',
    description: '',
    programmingLanguage: 'Java',
    difficulty: Difficulty.MEDIUM,
    points: 100,
    isPublished: false,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    initialCode: '',
    solutionCode: '',
    slug: '',
    inputFormat: '',
    outputFormat: '',
    constraintName: '',
    category: '',
    tags: '',
    exerciseTestCases: []
  });

  const [exerciseTestCases, setExerciseTestCases] = useState<ExerciseTestCase[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const difficulties = Object.values(Difficulty);
  const languages = ['Java', 'Python', 'JavaScript', 'C++', 'Go', 'TypeScript'];
  const categories = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Math', 'Sorting', 'Searching'];

  useEffect(() => {
    if (isEditing) {
      loadTemplateData(id!);
    }
  }, [id]);

  const loadTemplateData = async (templateId: string) => {
    setLoading(true);
    try {
      const template = await codingExerciseTemplateService.getById(templateId);
      setFormData(template);
      setExerciseTestCases(template.exerciseTestCases || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'title' && !errors.slug) {
        const slug = codingExerciseTemplateService.generateSlug(value);
        setFormData(prev => ({ ...prev, slug }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addTestCase = (isPublic: boolean = true) => {
    const newTestCase: ExerciseTestCase = {
      input: '',
      expectedOutput: '',
      isPublic,
      explanation: '',
      orderIndex: exerciseTestCases.length + 1
    };
    setExerciseTestCases([...exerciseTestCases, newTestCase]);
    toast.success(`Đã thêm test case ${isPublic ? 'mẫu' : 'ẩn'}`);
  };

  const removeTestCase = (index: number) => {
    const updated = exerciseTestCases.filter((_, i) => i !== index);
    const reordered = updated.map((tc, i) => ({ ...tc, orderIndex: i + 1 }));
    setExerciseTestCases(reordered);
  };

  const updateTestCase = (index: number, field: keyof ExerciseTestCase, value: any) => {
    const updated = exerciseTestCases.map((tc, i) => {
      if (i === index) {
        return { ...tc, [field]: value };
      }
      return tc;
    });
    setExerciseTestCases(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (!formData.slug.trim()) newErrors.slug = 'Slug không được để trống';
    if (!formData.initialCode.trim()) newErrors.initialCode = 'Mã khởi tạo không được để trống';
    if (formData.points <= 0) newErrors.points = 'Điểm phải lớn hơn 0';

    if (exerciseTestCases.length === 0) {
      newErrors.exerciseTestCases = 'Cần ít nhất một test case';
      toast.error(newErrors.exerciseTestCases);
    } else {
      const invalid = exerciseTestCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim());
      if (invalid) {
        newErrors.testCases = 'Tất cả test case phải có đầu vào và đầu ra mong muốn';
        toast.error(newErrors.testCases);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    const templateData: CodingExerciseTemplate = {
      ...formData,
      exerciseTestCases: exerciseTestCases,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isEditing) {
        // Handle update
        toast.info('Tính năng cập nhật đang được phát triển');
      } else {
        await codingExerciseTemplateService.create(templateData);
        toast.success('Đã tạo bài tập mẫu thành công!');
        navigate('/codingExerciseLibrary');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài tập');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/codingExerciseLibrary')}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {isEditing ? 'Chỉnh sửa bài tập mẫu' : 'Tạo bài tập mẫu mới'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/codingExerciseLibrary')}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lưu bài tập
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Info */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-all">
              <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                <FileText size={20} className="text-primary" />
                Thông tin cơ bản
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Tiêu đề bài tập <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Thuật toán Two Sum"
                    className={`w-full px-4 py-3 bg-background border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground ${errors.title ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.title && <p className="mt-1 text-xs font-semibold text-destructive flex items-center gap-1"><AlertCircle size={12} />{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Slug định danh <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="two-sum-algorithm"
                      className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Danh mục</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Mô tả bài tập</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả ngắn gọn về bài tập này..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Code Configuration */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-all">
              <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                <Code2 size={20} className="text-primary" />
                Cấu hình mã nguồn
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-foreground">Mã khởi tạo (Initial Code) <span className="text-destructive">*</span></label>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Environment: {formData.programmingLanguage}</span>
                  </div>
                  <textarea
                    name="initialCode"
                    rows={10}
                    value={formData.initialCode}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-950 text-indigo-100 font-mono text-sm border-0 rounded-2xl focus:ring-2 focus:ring-primary outline-none shadow-inner"
                    placeholder="// Viết mã nguồn mẫu cho học sinh ở đây..."
                  />
                  {errors.initialCode && <p className="mt-1 text-xs font-semibold text-destructive flex items-center gap-1"><AlertCircle size={12} />{errors.initialCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 font-mono">Giải pháp mẫu (Solution Code)</label>
                  <textarea
                    name="solutionCode"
                    rows={8}
                    value={formData.solutionCode}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-900 text-emerald-100 font-mono text-sm border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                    placeholder="// Lưu trữ lời giải tối ưu (không bắt buộc)..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2 font-bold text-primary text-xs uppercase tracking-wider">
                        <Zap size={14} /> Hiệu năng
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-primary/70 mb-1 uppercase">Thời gian (ms)</label>
                          <input
                            type="number"
                            name="timeLimitMs"
                            value={formData.timeLimitMs}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-primary/70 mb-1 uppercase">Bộ nhớ (MB)</label>
                          <input
                            type="number"
                            name="memoryLimitMb"
                            value={formData.memoryLimitMb}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-foreground mb-2 font-mono">Ràng buộc tên biến/hàm</label>
                    <input
                      type="text"
                      name="constraintName"
                      value={formData.constraintName}
                      onChange={handleInputChange}
                      placeholder="e.g., n <= 10^5, constraints..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cases Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-foreground text-lg">
                  <Beaker size={24} className="text-primary" />
                  Bộ lọc kiểm thử (Test Cases)
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addTestCase(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold transition-all border border-emerald-500/20"
                  >
                    <Plus size={14} /> Thêm Test Case Mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => addTestCase(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-xs font-bold transition-all border border-border"
                  >
                    <Plus size={14} /> Thêm Test Case Ẩn
                  </button>
                </div>
              </div>

              {exerciseTestCases.map((tc, index) => (
                <div key={index} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tc.isPublic ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {tc.isPublic ? 'Mẫu (Public)' : 'Ẩn (Private)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Input</label>
                      <textarea
                        rows={4}
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        className="w-full p-3 bg-background border border-border rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                        placeholder="Dữ liệu đầu vào..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Expected Output</label>
                      <textarea
                        rows={4}
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        className="w-full p-3 bg-background border border-border rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                        placeholder="Dữ liệu mong đợi..."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                        <Info size={14} /> Giải thích (Giải thích cho học sinh)
                      </div>
                      <input
                        type="text"
                        value={tc.explanation}
                        onChange={(e) => updateTestCase(index, 'explanation', e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm text-foreground"
                        placeholder="Nửa dòng giải thích tại sao input ra output như này..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {exerciseTestCases.length === 0 && (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={32} className="text-slate-300" />
                  </div>
                  <div className="text-slate-500 font-medium">Bạn chưa thêm test case nào cho bài tập này.</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar Settings) */}
          <div className="space-y-6">

            {/* Quick Settings */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden sticky top-24">
              <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                <Settings2 size={20} className="text-primary" />
                Thiết lập nhanh
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Ngôn ngữ chủ đạo</label>
                  <select
                    name="programmingLanguage"
                    value={formData.programmingLanguage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground"
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Độ khó bài tập</label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, difficulty: diff }))}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${formData.difficulty === diff
                          ? (diff === 'EASY' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                            diff === 'MEDIUM' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' :
                              'bg-destructive border-destructive text-white shadow-lg shadow-destructive/20')
                          : 'bg-background border-border text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-primary text-primary-foreground rounded-2xl space-y-3 shadow-xl shadow-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Điểm hoàn thành</span>
                    <Trophy size={16} />
                  </div>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-2xl font-black focus:ring-2 focus:ring-white outline-none"
                  />
                  <p className="text-[10px] font-bold opacity-70 flex items-center gap-1 uppercase tracking-widest"><Info size={10} /> Điểm sẽ cộng khi pass test</p>
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-2xl group cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => setFormData(p => ({ ...p, isPublished: !p.isPublished }))}>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-foreground">Xuất bản ngay</span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Công khai cho contest</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${formData.isPublished ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-dashed border-border">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Tự động cấu hình</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Chúng tôi tự động tối ưu hóa slug và cấu hình môi trường dựa trên tiêu đề và ngôn ngữ bạn chọn.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateCreate;

// Helper to render icon based on difficulty
const Trophy = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);