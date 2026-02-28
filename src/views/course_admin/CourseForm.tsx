import React, { useState, useEffect } from 'react';
import { CourseShowRequest } from '@/model/course-admin/CourseShowRequest';
import { CourseStatus } from '@/types/enum/CourseStatus';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import { CourseModuleRequest } from '@/model/course-admin/CourseModuleRequest';
import { LessonType } from '@/types/enum/LessonType';
import { CourseLessonRequest } from '@/model/course-admin/CourseLessonRequest';
import {
  Save, X, Plus, Trash2, Video, Image as ImageIcon, CheckCircle2,
  Info, Layout, BookOpen, Settings, AlertCircle, ChevronDown,
  ChevronUp, GripVertical, Rocket, PlayCircle, HelpCircle, Trophy, Calendar, Search
} from 'lucide-react';
import TemplateSelector from './TemplateSelector';

interface CourseFormProps {
  course?: CourseTreeResponse;
  onSubmit: (data: CourseShowRequest) => Promise<void>;
  onCancel: () => void;
}

const SECTIONS = [
  { id: 'basic', label: 'Thông tin cơ bản', icon: Info },
  { id: 'content', label: 'Cấu trúc bài học', icon: Layout },
  { id: 'extra', label: 'Chi tiết mở rộng', icon: BookOpen },
  { id: 'publish', label: 'Hoàn thiện & Xuất bản', icon: Rocket },
] as const;

const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CourseShowRequest>({
    title: '',
    description: '',
    shortDescription: '',
    level: 'BEGINNER',
    category: '',
    subCategory: '',
    capacity: 100,
    enrolledCount: 0,
    status: CourseStatus.DRAFT,
    requirements: '',
    objectives: '',
    syllabus: '',
    isPublished: false,
    publishedAt: undefined,
    modules: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectorConfig, setSelectorConfig] = useState<{
    type: 'CODE' | 'QUIZ';
    mIdx: number;
    lIdx: number;
    selectedIds: string[];
  } | null>(null);

  const activeSection = SECTIONS[currentStep].id;

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription || course.description?.substring(0, 150) || '',
        level: course.level || 'BEGINNER',
        category: course.category || '',
        subCategory: course.subCategory || '',
        capacity: course.capacity || 100,
        enrolledCount: course.enrolledCount || 0,
        status: course.status,
        requirements: course.requirements || '',
        objectives: course.objectives || '',
        syllabus: course.syllabus || '',
        isPublished: course.isPublished,
        publishedAt: course.publishedAt || (course.isPublished ? new Date().toISOString() : undefined),
        modules: course.modules.map(module => ({
          moduleId: module.moduleId,
          title: module.title,
          orderIndex: module.orderIndex,
          isPublished: module.isPublished,
          lessons: module.lessons.map(lesson => {
            const codingExercises = (lesson as any).codingExercises || [];
            const quizzes = (lesson as any).quizzes || [];

            return {
              lessonId: lesson.lessonId,
              title: lesson.title,
              orderIndex: lesson.orderIndex,
              lessonType: lesson.lessonType,
              isPreview: lesson.isPreview,
              isPublished: lesson.isPublished,
              videoUrl: lesson.videoUrl,
              description: (lesson as any).description,
              content: (lesson as any).content,
              exerciseTemplateIds: codingExercises.map((ce: any) => ce.templateId || ce.exerciseId).filter(Boolean),
              quizTemplateIds: quizzes.map((q: any) => q.templateId || q.quizId).filter(Boolean),
              exerciseTemplates: codingExercises
                .filter((ce: any) => ce.templateId || ce.exerciseId)
                .map((ce: any) => ({ id: ce.templateId || ce.exerciseId, title: ce.title || 'Unknown' })),
              quizTemplates: quizzes
                .filter((q: any) => q.templateId || q.quizId)
                .map((q: any) => ({ id: q.templateId || q.quizId, title: q.title || 'Unknown' }))
            };
          })
        }))
      });
    }
  }, [course]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Đảm bảo tính nhất quán của dữ liệu trước khi gửi
    const submissionData = { ...formData };
    if (submissionData.isPublished && !submissionData.publishedAt) {
      submissionData.publishedAt = new Date().toISOString();
    }
    // Nếu không công bố, có thể giữ hoặc xóa ngày cũ tùy vào DB, ở đây ta đảm bảo gửi đi giá trị hiện tại của form
    if (!submissionData.isPublished) {
      submissionData.publishedAt = undefined;
    }

    // Clean UI-only fields from lessons before submission
    submissionData.modules = submissionData.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => {
        const { exerciseTemplates, quizTemplates, ...cleanLesson } = lesson;
        return cleanLesson;
      })
    }));

    try {
      await onSubmit(submissionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: 'Chương mới',
          orderIndex: prev.modules.length + 1,
          isPublished: false,
          lessons: []
        }
      ]
    }));
  };

  const updateModule = (index: number, updates: Partial<CourseModuleRequest>) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => i === index ? { ...m, ...updates } : m)
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addLesson = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) =>
        i === moduleIndex
          ? {
            ...m,
            lessons: [
              ...m.lessons,
              {
                title: 'Bài học mới',
                orderIndex: m.lessons.length + 1,
                lessonType: LessonType.VIDEO,
                isPreview: false,
                isPublished: false,
                exerciseTemplateIds: [],
                quizTemplateIds: [],
                exerciseTemplates: [],
                quizTemplates: []
              }
            ]
          }
          : m
      )
    }));
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    updates: Partial<CourseLessonRequest>
  ) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) =>
        i === moduleIndex
          ? {
            ...m,
            lessons: m.lessons.map((l, j) => j === lessonIndex ? { ...l, ...updates } : l)
          }
          : m
      )
    }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) =>
        i === moduleIndex
          ? {
            ...m,
            lessons: m.lessons.filter((_, j) => j !== lessonIndex)
          }
          : m
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-32">
      <div className="relative mb-4">
        <div className="flex justify-between items-center w-full px-2 sm:px-10">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div key={section.id} className="relative z-10 flex flex-1 flex-col items-center gap-2 group cursor-pointer" onClick={() => setCurrentStep(idx)}>
                <div className={`
                                flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300
                                ${isActive ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' :
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                      'bg-card border-border text-muted-foreground group-hover:border-accent'}
                            `}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {section.label}
                </span>

                {idx < SECTIONS.length - 1 && (
                  <div className="absolute left-1/2 top-6 hidden h-[2px] w-full bg-border sm:block -z-10">
                    <div className={`h-full bg-emerald-500 transition-all duration-500 ${idx < currentStep ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute left-0 top-6 -z-20 h-0.5 w-full bg-border sm:hidden" />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Đã xảy ra lỗi:</p>
            <p className="font-medium opacity-90">{error}</p>
          </div>
        </div>
      )}

      {activeSection === 'basic' && (
        <div className="space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Cơ sở dữ liệu khóa học</h2>
            <p className="text-sm text-muted-foreground italic">Vui lòng điền thông tin định danh và thuộc tính cơ bản của học phần.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Tiêu đề khóa học <span className="text-destructive">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 font-bold text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                placeholder="Tiêu đề gợi nhớ, ví dụ: Machine Learning Specialist"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Mô tả tóm tắt <span className="text-destructive">*</span></label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={2}
                maxLength={150}
                className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm font-medium text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                placeholder="Dùng để hiển thị trong kết quả tìm kiếm..."
                required
              />
              <div className="flex justify-between px-1">
                <span className="text-[10px] text-muted-foreground italic">Tối đa 150 ký tự</span>
                <span className="text-[10px] font-black text-foreground">
                  {formData.shortDescription.length}/150
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Chuyên mục <span className="text-destructive">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm font-bold text-foreground transition-all focus:border-primary focus:bg-background outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                required
              >
                <option value="">Chọn một chuyên mục</option>
                <option value="PROGRAMMING">Kỹ thuật phần mềm</option>
                <option value="DESIGN">Thiết kế sáng tạo</option>
                <option value="BUSINESS">Phát triển kinh tế</option>
                <option value="MARKETING">Digital Marketing</option>
                <option value="DATA_SCIENCE">Phân tích dữ liệu</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Tiểu mục </label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm font-bold text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                placeholder="Ví dụ: React, Node.js, UI/UX..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Cấp độ tiếp cận <span className="text-destructive">*</span></label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm font-bold text-foreground transition-all focus:border-primary focus:bg-background outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                required
              >
                <option value="BEGINNER">Người mới (Beginner)</option>
                <option value="INTERMEDIATE">Phổ thông (Intermediate)</option>
                <option value="ADVANCED">Chuyên sâu (Advanced)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Ảnh bìa </label>
              <div className="relative flex min-h-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/50 transition-all hover:border-primary hover:bg-primary/5 group overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData(prev => ({ ...prev, imageFile: file }));
                  }}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                {formData.imageFile || course?.imageUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <img
                      src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : course?.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-black uppercase">Đổi ảnh bìa</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary">
                    <div className="rounded-full bg-card p-4 shadow-sm group-hover:shadow-md transition-shadow">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">Tải lên ảnh bìa</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Video giới thiệu (Trailer)</label>
              <div className="relative flex min-h-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/50 transition-all hover:border-accent hover:bg-accent/5 group overflow-hidden">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData(prev => ({ ...prev, videoFile: file }));
                  }}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                {formData.videoFile || course?.videoUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <div className="flex items-center gap-2 text-white">
                      <PlayCircle className="h-6 w-6 text-indigo-400" />
                      <span className="text-xs font-black uppercase truncate max-w-[200px]">
                        {formData.videoFile ? formData.videoFile.name : 'Video giới thiệu đã tải'}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-black uppercase text-white">Đổi video</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-accent">
                    <div className="rounded-full bg-card p-4 shadow-sm group-hover:shadow-md transition-shadow">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">Tải lên Video Trailer</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'content' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center justify-between gap-4 rounded-3xl bg-foreground p-8 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-background italic tracking-tight">Thiết kế chương trình giảng dạy</h3>
              <p className="text-xs font-medium text-background/60">Thiết lập cấu trúc chương và bài giảng chi tiết.</p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Tạo chương mới
            </button>
          </div>

          <div className="space-y-6">
            {formData.modules.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-[2.5rem] border-4 border-dashed border-border bg-card p-8">
                <div className="rounded-full bg-muted p-6">
                  <Layout className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-foreground uppercase tracking-tighter">Chương trình học của bạn trống</p>
                  <p className="text-sm font-medium text-muted-foreground italic">Bắt đầu bằng cách tạo chương học đầu tiên cho lộ trình này.</p>
                </div>
              </div>
            ) : (
              formData.modules.map((module, mIdx) => (
                <div key={mIdx} className="group overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex items-center gap-6 border-b border-border bg-muted/30 p-6 group-hover:bg-primary/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground font-black text-background shadow-xl">
                      {mIdx + 1}
                    </div>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(mIdx, { title: e.target.value })}
                      className="flex-1 bg-transparent text-lg font-black tracking-tight text-slate-900 focus:outline-none"
                      placeholder="Chapter Title..."
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addLesson(mIdx)}
                        className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-xs font-black text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105"
                      >
                        <Plus className="h-4 w-4" />
                        LESSON
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        className="rounded-xl bg-card border border-border p-2 text-muted-foreground transition-all hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {module.lessons.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                        <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest italic">Không có bài học nào trong chương này.</p>
                      </div>
                    ) : (
                      module.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
                          <div className="flex items-center gap-4">
                            <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-black text-muted-foreground">
                              {lIdx + 1}
                            </div>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(mIdx, lIdx, { title: e.target.value })}
                              className="flex-1 bg-transparent text-sm font-black text-foreground focus:outline-none placeholder:text-muted-foreground/30"
                              placeholder="Lesson Name..."
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={lesson.lessonType}
                                onChange={(e) => updateLesson(mIdx, lIdx, { lessonType: e.target.value as LessonType })}
                                className="rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground outline-none transition-all focus:border-primary"
                              >
                                <option value={LessonType.VIDEO}>Video bài giảng</option>
                                <option value={LessonType.CODE}>Lập trình (CODE)</option>
                                <option value={LessonType.QUIZ}>Trắc nghiệm (QUIZ)</option>
                                <option value={LessonType.CODE_AND_QUIZ}>Code & Quiz</option>
                                <option value={LessonType.QUIZ_AND_VIDEO}>Quiz & Video</option>
                                <option value={LessonType.CODE_AND_VIDEO}>Code & Video</option>
                                <option value={LessonType.ALL}>Tất cả (Full)</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeLesson(mIdx, lIdx)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="ml-14 space-y-4">
                            {(lesson.lessonType.includes('VIDEO') || lesson.lessonType === LessonType.ALL) && (
                              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-muted/50 border border-border">
                                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-card px-4 py-2 text-[10px] font-black uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-sm ring-1 ring-primary/20">
                                  <Video className="h-3.5 w-3.5" />
                                  {lesson.videoFile ? lesson.videoFile.name : ((lesson as any).videoUrl ? 'VIDEO ĐÃ CÓ' : 'TẢI LÊN VIDEO')}
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) updateLesson(mIdx, lIdx, { videoFile: file });
                                    }}
                                  />
                                </label>
                                {(lesson as any).videoUrl && !lesson.videoFile && (
                                  <span className="text-[9px] font-bold text-muted-foreground/60 italic truncate max-w-[150px]">
                                    {(lesson as any).videoUrl.split('/').pop()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Code */}
                            {(lesson.lessonType.includes('CODE') || lesson.lessonType === LessonType.ALL) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bài tập lập trình</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectorConfig({ type: 'CODE', mIdx, lIdx, selectedIds: lesson.exerciseTemplateIds || [] })}
                                    className="flex items-center gap-2 rounded-xl bg-card border border-primary/20 px-4 py-2 text-[10px] font-black text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-sm active:scale-95"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> CHỌN BÀI TẬP
                                  </button>
                                </div>
                                {lesson.exerciseTemplates && lesson.exerciseTemplates.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lesson.exerciseTemplates.map(template => (
                                      <div key={template.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group/item">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Trophy className="h-4 w-4 text-primary" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tighter">{template.title}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 italic">Mẫu bài tập lập trình</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newTemplates = lesson.exerciseTemplates?.filter(t => t.id !== template.id) || [];
                                            const newIds = newTemplates.map(t => t.id);
                                            updateLesson(mIdx, lIdx, {
                                              exerciseTemplateIds: newIds,
                                              exerciseTemplates: newTemplates
                                            });
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Search className="h-5 w-5 opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest italic">Chưa có bài tập nào được chọn</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quiz */}
                            {(lesson.lessonType.includes('QUIZ') || lesson.lessonType === LessonType.ALL) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bộ câu hỏi trắc nghiệm</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectorConfig({ type: 'QUIZ', mIdx, lIdx, selectedIds: lesson.quizTemplateIds || [] })}
                                    className="flex items-center gap-2 rounded-xl bg-card border border-amber-500/20 px-4 py-2 text-[10px] font-black text-amber-500 transition-all hover:bg-amber-500 hover:text-white shadow-sm active:scale-95"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> CHỌN TRẮC NGHIỆM
                                  </button>
                                </div>
                                {lesson.quizTemplates && lesson.quizTemplates.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lesson.quizTemplates.map(template => (
                                      <div key={template.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group/item">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <HelpCircle className="h-4 w-4 text-amber-500" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tighter">{template.title}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 italic">Mẫu trắc nghiệm</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newTemplates = lesson.quizTemplates?.filter(t => t.id !== template.id) || [];
                                            const newIds = newTemplates.map(t => t.id);
                                            updateLesson(mIdx, lIdx, {
                                              quizTemplateIds: newIds,
                                              quizTemplates: newTemplates
                                            });
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Search className="h-5 w-5 opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest italic">Chưa có bộ câu hỏi nào</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Description & Content */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Mô tả ngắn bài học</label>
                                <textarea
                                  value={lesson.description || ''}
                                  onChange={(e) => updateLesson(mIdx, lIdx, { description: e.target.value })}
                                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs font-medium text-foreground focus:border-primary focus:bg-background focus:outline-none"
                                  rows={2}
                                  placeholder="Tóm tắt nội dung bài học..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Nội dung chi tiết (Markdown)</label>
                                <textarea
                                  value={lesson.content || ''}
                                  onChange={(e) => updateLesson(mIdx, lIdx, { content: e.target.value })}
                                  className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs font-mono text-foreground focus:border-primary focus:bg-background focus:outline-none"
                                  rows={2}
                                  placeholder="Chi tiết bài học hoặc hướng dẫn..."
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-2">
                              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={lesson.isPreview}
                                  onChange={(e) => updateLesson(mIdx, lIdx, { isPreview: e.target.checked })}
                                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary transition-all bg-card"
                                />
                                <span className="group-hover:text-foreground">Xem thử (Preview)</span>
                              </label>

                              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={lesson.isPublished}
                                  onChange={(e) => updateLesson(mIdx, lIdx, { isPublished: e.target.checked })}
                                  className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500 transition-all bg-card"
                                />
                                <span className="group-hover:text-foreground">Công khai</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSection === 'extra' && (
        <div className="space-y-8 rounded-[2.5rem] border border-border bg-card p-10 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Kỳ vọng & Mô tả chi tiết</h2>
            <p className="text-sm text-muted-foreground italic">Mô tả chi tiết những gì học viên sẽ học và các yêu cầu tiên quyết.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Sức chứa tối đa</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm font-medium text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="Ví dụ: 100"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Yêu cầu tham gia (Requirements)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm font-medium text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
                placeholder="Ví dụ: Có kiến thức cơ bản về HTML/CSS..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Mục tiêu học tập (Objectives)</label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm font-medium text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="Ví dụ: Xây dựng được ứng dụng Web hoàn tất..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Đề cương chi tiết (Markdown)</label>
            <textarea
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              rows={6}
              className="w-full rounded-2xl border border-border bg-muted/50 px-6 py-4 text-sm font-medium font-mono text-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="# Module 1: Introduction\n- Topic A\n- Topic B..."
            />
          </div>
        </div>
      )}

      {/* Publish Section */}
      {activeSection === 'publish' && (
        <div className="space-y-10 rounded-[3rem] border border-border bg-card p-12 text-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="rounded-full bg-primary/10 p-6 text-primary ring-4 ring-primary/5">
              <Rocket className="h-16 w-16 animate-bounce" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tighter text-foreground">Sẵn sàng để "Ra quân"?</h3>
              <p className="max-w-xl mx-auto text-sm font-medium text-muted-foreground leading-relaxed italic">
                Chúc mừng bạn đã hoàn thành việc thiết lập nội dung. Đây là trạm cuối cùng trước khi khóa học của bạn được đưa lên hệ thống. Đảm bảo mọi thứ đã chuẩn xác.
              </p>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2 mt-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Trạng thái quản lý</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-3xl border border-border bg-muted/50 px-8 py-5 text-lg font-black text-foreground transition-all focus:bg-muted outline-none"
              >
                <option value={CourseStatus.DRAFT} className="bg-card text-foreground">Bản nháp (Nội bộ)</option>
                <option value={CourseStatus.PUBLISHED} className="bg-card text-foreground">Đã kiểm duyệt (Công khai)</option>
                <option value={CourseStatus.ARCHIVED} className="bg-card text-foreground">Lưu trữ (Ẩn)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex cursor-pointer items-start gap-6 rounded-[2.5rem] bg-muted/50 p-8 transition-all hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 group">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-6 w-6 rounded-lg border-border bg-card text-emerald-500 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold group-hover:text-emerald-400 transition-colors text-foreground">Công khai ngay!</span>
                  <span className="text-xs text-muted-foreground italic">Kích hoạt để người học có thể tìm thấy khóa học này.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-8 left-0 right-0 z-50 px-4 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between rounded-[2.5rem] border border-border bg-foreground p-5 shadow-2xl backdrop-blur-xl ring-1 ring-border/10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-widest text-background/60 transition-all hover:text-background hover:bg-background/10"
                disabled={loading}
              >
                Hủy thay đổi
              </button>
            </div>

            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-full border border-background/10 bg-background/5 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-background transition-all hover:bg-background/10 active:scale-95"
                  disabled={loading}
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Quay lại
                </button>
              )}

              {currentStep < SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-full bg-background px-10 py-3.5 text-xs font-black uppercase tracking-widest text-foreground shadow-xl transition-all hover:bg-muted hover:scale-105 active:scale-95"
                >
                  Tiếp tục
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 rounded-full bg-emerald-500 px-12 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {course ? 'Lưu thay đổi' : 'Khởi tạo khóa học'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectorConfig && (
        <TemplateSelector
          type={selectorConfig.type}
          selectedIds={selectorConfig.selectedIds}
          onSelect={(ids, selections) => {
            if (selectorConfig.type === 'CODE') {
              updateLesson(selectorConfig.mIdx, selectorConfig.lIdx, {
                exerciseTemplateIds: ids,
                exerciseTemplates: selections
              });
            } else {
              updateLesson(selectorConfig.mIdx, selectorConfig.lIdx, {
                quizTemplateIds: ids,
                quizTemplates: selections
              });
            }
          }}
          onClose={() => setSelectorConfig(null)}
        />
      )}
    </form>
  );
};

export default CourseForm;