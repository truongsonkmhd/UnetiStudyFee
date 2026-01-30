import React, { useState, useEffect } from 'react';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import CourseService from '@/services/courseService';
import { LessonType } from '@/types/enum/LessonType';
import {
  ArrowLeft, Edit3, CheckCircle, Clock, FileText, PlayCircle,
  HelpCircle, ChevronDown, ChevronUp, Layers, BookOpen, Globe
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

  useEffect(() => {
    loadCourse();
  }, [courseId, slug]);

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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="font-bold text-slate-500 italic uppercase tracking-widest text-[10px]">Đang trích xuất dữ liệu...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="rounded-full bg-red-50 p-6 text-red-500">
          <Globe className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">Oops! Có gì đó không đúng</h3>
          <p className="max-w-md text-slate-500">{error || 'Không tìm thấy thông tin khóa học yêu cầu.'}</p>
        </div>
        <button onClick={onBack} className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-lg transition-transform active:scale-95">
          Trở lại an toàn
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-20 px-4 sm:px-10">
      {/* Detail Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-6">

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="rounded-sm bg-blue-600 px-2 py-0.5 text-white">Advanced</span>
                <span className={`rounded-sm px-2 py-0.5 ${course.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {course.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white md:text-5xl lg:text-6xl">{course.title}</h1>
            </div>
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit(course.courseId)}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-slate-900 shadow-xl transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 shrink-0"
            >
              <Edit3 className="h-5 w-5" />
              Hiệu chỉnh khóa học
            </button>
          )}
        </div>

        {/* Floating Stats Area */}
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-4 rounded-3xl bg-white/5 p-6 backdrop-blur-sm md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mô-đun</span>
            <span className="text-2xl font-black text-white">{course.modules.length} <span className="text-xs font-normal text-slate-400">Chương</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chương trình giảng dạy</span>
            <span className="text-2xl font-black text-white">{calculateTotalLessons()} <span className="text-xs font-normal text-slate-400">Buổi học</span></span>
          </div>
          <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nhận diện</span>
            <span className="truncate text-lg font-black text-white/70 italic">/{course.slug}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Description & Media */}
        <div className="lg:col-span-8 space-y-10">
          {course.videoUrl && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                <PlayCircle className="h-6 w-6 text-blue-600" />
                Video giới thiệu
              </h2>
              <div className="aspect-video overflow-hidden rounded-[2rem] border-4 border-white bg-slate-900 shadow-2xl ring-1 ring-slate-200">
                <video controls src={course.videoUrl} className="h-full w-full object-contain">
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900 italic">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Mô tả khóa học
            </h2>
            <div className="prose prose-slate max-w-none rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm leading-relaxed text-slate-600">
              {course.description || 'Chưa cung cấp thông tin mô tả chi tiết cho khóa học này.'}
            </div>
          </section>
        </div>

        {/* Right Column: Syllabus/Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-wider text-sm">Lộ trình học tập</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">{calculateTotalLessons()} Bài học</span>
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
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-xs transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {index + 1}
                        </div>
                        <div className="space-y-0.5">
                          <h3 className={`font-bold transition-colors ${isExpanded ? 'text-blue-600' : 'text-slate-900'}`}>{module.title}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{module.lessons.length} Bài giảng</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-blue-500" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-blue-50 p-2 animate-in slide-in-from-top-2 duration-300">
                        {module.lessons.length === 0 ? (
                          <p className="p-4 text-center text-xs font-semibold text-slate-400 italic">Dữ liệu trống</p>
                        ) : (
                          <div className="space-y-1">
                            {module.lessons.map((lesson, lIdx) => (
                              <div key={lesson.lessonId} className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:bg-blue-50/50">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-100 shadow-sm text-[10px] font-bold text-slate-400 group-hover:text-blue-500">
                                    {lIdx + 1}
                                  </div>
                                  <div className="shrink-0">{getLessonTypeIcon(lesson.lessonType)}</div>
                                  <span className="text-sm font-semibold text-slate-700">{lesson.title}</span>
                                </div>
                                {lesson.isPreview && (
                                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">Free</span>
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
    </div>
  );
};

export default CourseDetail;