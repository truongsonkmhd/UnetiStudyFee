import React, { useState, useEffect } from 'react';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import CourseService from '@/services/courseService';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import { LessonType } from '@/types/enum/LessonType';
import { EnrollmentResponse } from '@/model/enrollment/EnrollmentResponse';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit3, PlayCircle,
  HelpCircle, ChevronDown, ChevronUp, Layers, BookOpen, Globe, UserCheck, Check, X, FileText, Search
} from 'lucide-react';

interface CourseDetailProps {
  courseId?: string;
  slug?: string;
  onBack: () => void;
  onEdit?: (courseId: string) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, slug, onBack, onEdit }) => {
  const [course, setCourse] = useState<CourseTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments'>('overview');

  // Enrollment State
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentPage, setEnrollmentPage] = useState(0);
  const [enrollmentTotalPages, setEnrollmentTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourse();
  }, [courseId, slug]);

  // Load Enrollments when tab changes to enrollments or course is loaded
  useEffect(() => {
    if (activeTab === 'enrollments' && course?.courseId) {
      const timer = setTimeout(() => {
        loadEnrollments(course.courseId);
      }, 500); // Simple debounce
      return () => clearTimeout(timer);
    }
  }, [activeTab, course?.courseId, enrollmentPage, searchQuery]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (slug) {
        response = await CourseService.getCourseTreeBySlug(slug);
      } else if (courseId) {
        response = await CourseService.getCourseById(courseId);
      } else {
        throw new Error('Yêu cầu ID khóa học hoặc slug');
      }

      setCourse(response);
      setExpandedModules(new Set(response.modules.map(m => m.moduleId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết khóa học');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async (cId: string) => {
    try {
      setEnrollmentLoading(true);
      const response = await courseEnrollmentService.getCourseEnrollments(cId, { status: 'PENDING', page: enrollmentPage, size: 10, q: searchQuery });
      console.log('Enrollments response:', response);
      setEnrollments(response.items);
      setEnrollmentTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Không thể tải danh sách đăng ký");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    try {
      await courseEnrollmentService.approveEnrollment(enrollmentId);
      toast.success("Đã duyệt học viên");
      if (course?.courseId) loadEnrollments(course.courseId);
    } catch (error) {
      toast.error("Lỗi khi duyệt");
    }
  };

  const handleReject = async (enrollmentId: string) => {
    try {
      await courseEnrollmentService.rejectEnrollment(enrollmentId, "Bị từ chối bởi giáo viên");
      toast.success("Đã từ chối học viên");
      if (course?.courseId) loadEnrollments(course.courseId);
    } catch (error) {
      toast.error("Lỗi khi từ chối");
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getLessonTypeIcon = (type: LessonType) => {
    switch (type) {
      case LessonType.CODE:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case LessonType.QUIZ:
        return <HelpCircle className="h-4 w-4 text-indigo-500" />;
      case LessonType.CODE_AND_QUIZ:
        return <Layers className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const calculateTotalLessons = () => {
    if (!course) return 0;
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-bold text-muted-foreground italic uppercase tracking-widest text-[10px]">Đang trích xuất dữ liệu...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="rounded-full bg-destructive/10 p-6 text-destructive">
          <Globe className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-foreground">Oops! Có gì đó không đúng</h3>
          <p className="max-w-md text-muted-foreground">{error || 'Không tìm thấy thông tin khóa học yêu cầu.'}</p>
        </div>
        <button onClick={onBack} className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg transition-transform active:scale-95">
          Trở lại an toàn
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-20 px-4 sm:px-10">
      {/* Detail Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 shadow-2xl md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-6">

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.2em] items-center">
                <span className="rounded-sm bg-blue-600 px-2 py-0.5 text-white">Advanced</span>
                <span className={`rounded-sm px-2 py-0.5 ${course.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {course.isPublished ? 'Live' : 'Draft'}
                </span>
                {/* Tabs Trigger */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-background text-foreground' : 'bg-background/10 text-background hover:bg-background/20'}`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => setActiveTab('enrollments')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'enrollments' ? 'bg-background text-foreground' : 'bg-background/10 text-background hover:bg-background/20'}`}
                  >
                    Xét duyệt đăng ký
                  </button>
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-background md:text-5xl lg:text-6xl">{course.title}</h1>
            </div>
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit(course.courseId)}
              className="flex items-center gap-2 rounded-2xl bg-background px-6 py-4 font-bold text-foreground shadow-xl transition-all hover:bg-muted hover:scale-105 active:scale-95 shrink-0"
            >
              <Edit3 className="h-5 w-5" />
              Hiệu chỉnh khóa học
            </button>
          )}
        </div>

        {/* Floating Stats Area */}
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-4 rounded-3xl bg-background/5 p-6 backdrop-blur-sm md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mô-đun</span>
            <span className="text-2xl font-black text-background">{course.modules.length} <span className="text-xs font-normal text-background/60">Chương</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Chương trình học</span>
            <span className="text-2xl font-black text-background">{calculateTotalLessons()} <span className="text-xs font-normal text-background/60">Buổi học</span></span>
          </div>
          <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nhận diện</span>
            <span className="truncate text-lg font-black text-background/70 italic">/{course.slug}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {activeTab === 'overview' ? (
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Column: Description & Media */}
          <div className="lg:col-span-8 space-y-10">
            {course.videoUrl && (
              <section className="space-y-4">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-foreground">
                  <PlayCircle className="h-6 w-6 text-primary" />
                  Video giới thiệu
                </h2>
                <div className="aspect-video overflow-hidden rounded-[2rem] border-4 border-card bg-foreground shadow-2xl ring-1 ring-border">
                  <video controls src={course.videoUrl} className="h-full w-full object-contain">
                    Your browser does not support the video tag.
                  </video>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-foreground italic">
                <BookOpen className="h-6 w-6 text-primary" />
                Mô tả khóa học
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none rounded-[2rem] bg-card p-8 border border-border shadow-sm leading-relaxed text-muted-foreground">
                {course.description || 'Chưa cung cấp thông tin mô tả chi tiết cho khóa học này.'}
              </div>
            </section>
          </div>

          {/* Right Column: Syllabus/Timeline */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-foreground uppercase tracking-wider text-sm">Lộ trình học tập</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground">{calculateTotalLessons()} Bài học</span>
            </div>

            <div className="space-y-4">
              {course.modules.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 italic text-sm">
                  Chưa thiết lập chương trình học
                </div>
              ) : (
                course.modules.map((module, index) => {
                  const isExpanded = expandedModules.has(module.moduleId);

                  return (
                    <div key={module.moduleId} className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-blue-200 bg-white shadow-lg' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}>
                      <button
                        onClick={() => toggleModule(module.moduleId)}
                        className="flex w-full items-center justify-between p-5 text-left transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-xs transition-colors ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {index + 1}
                          </div>
                          <div className="space-y-0.5">
                            <h3 className={`font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>{module.title}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{module.lessons.length} Bài giảng</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border p-2 animate-in slide-in-from-top-2 duration-300">
                          {module.lessons.length === 0 ? (
                            <p className="p-4 text-center text-xs font-semibold text-muted-foreground italic">Dữ liệu trống</p>
                          ) : (
                            <div className="space-y-1">
                              {module.lessons.map((lesson, lIdx) => (
                                <div key={lesson.lessonId} className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:bg-primary/5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-card border border-border shadow-sm text-[10px] font-bold text-muted-foreground group-hover:text-primary">
                                      {lIdx + 1}
                                    </div>
                                    <div className="shrink-0">{getLessonTypeIcon(lesson.lessonType)}</div>
                                    <span className="text-sm font-semibold text-foreground">{lesson.title}</span>
                                  </div>
                                  {lesson.isPreview && (
                                    <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[9px] font-black uppercase text-accent">Free</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Enrollment Tab Content */
        <div className="rounded-[2rem] bg-card p-8 border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <UserCheck className="text-primary" />
              Danh sách chờ duyệt
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64 text-sm font-medium text-foreground"
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          {enrollmentLoading ? (
            <div className="text-center py-10 text-muted-foreground">Đang tải...</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground italic font-medium">Không có yêu cầu đăng ký nào đang chờ.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 rounded-l-lg">Học viên</th>
                    <th className="px-6 py-3">Ngày yêu cầu</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 rounded-r-lg text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enrollments.map((enroll) => (
                    <tr key={enroll.enrollmentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {enroll.studentName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(enroll.requestedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          Chờ duyệt
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(enroll.enrollmentId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold transition-colors text-xs"
                        >
                          <Check size={14} /> Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(enroll.enrollmentId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors text-xs"
                        >
                          <X size={14} /> Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;