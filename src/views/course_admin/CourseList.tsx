import React, { useState, useEffect } from 'react';
import { CourseCardResponse } from '@/model/course-admin/CourseCardResponse';
import CourseService from '@/services/courseService';
import { Search, Filter, Plus, Book, Trash2, Edit3, Eye, Calendar, Users, GraduationCap, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface CourseListProps {
  onEdit: (courseId: string) => void;
  onView: (courseId: string) => void;
  onCreate: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ onEdit, onView, onCreate }) => {
  const [courses, setCourses] = useState<CourseCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CourseService.getAllCourses();
      setCourses(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"?`)) {
      return;
    }

    try {
      await CourseService.deleteCourse(courseId);
      setCourses(courses.filter(c => c.courseId !== courseId));
      toast.success(`Khóa học "${title}" đã được xóa thành công.`);
    } catch (err) {
      toast.error('Không thể xóa khóa học: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && !course.isPublished && filters.status === 'published') {
      return false;
    }
    if (filters.status && course.isPublished && filters.status === 'draft') {
      return false;
    }
    return true;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xuất bản';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Quản lý nội dung học tập</h1>
          <p className="text-slate-500 font-medium">Xây dựng và tối ưu giảng đường số của bạn</p>
        </div>
        <button
          onClick={onCreate}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Tạo khóa học mới</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã công bố</option>
              <option value="draft">Bản phác thảo</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-slate-200 md:block" />
          <span className="text-sm font-medium text-slate-500">
            {filteredCourses.length} khóa học
          </span>
        </div>
      </div>

      {/* List Area */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="font-medium text-slate-500">Hệ thống đang tải dữ liệu...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <Filter className="h-6 w-6 rotate-45" />
          </div>
          <p className="max-w-md font-medium text-red-800">{error}</p>
          <button onClick={loadCourses} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-transform active:scale-95">
            Thử tải lại trang
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400">
            <Book className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 italic">"Gió mang khóa học đi đâu rồi?"</h3>
            <p className="text-slate-500">Không tìm thấy kết quả nào khớp với bộ lọc hiện tại.</p>
          </div>
          <button onClick={() => setFilters({ status: '', search: '', category: '' })} className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline">
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map(course => (
            <div
              key={course.courseId}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 shadow-md"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <GraduationCap className="h-12 w-12 opacity-50 transition-transform group-hover:scale-125 duration-300" />
                  </div>
                )}

                {/* Overlay Badge */}
                <div className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${course.isPublished
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
                  }`}>
                  {course.isPublished ? 'Live' : 'Draft'}
                </div>

                {/* Actions Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => onView(course.courseId)}
                    className="rounded-full bg-white p-2.5 text-slate-900 transition-transform hover:scale-110 active:scale-90"
                    title="Xem trước"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(course.courseId)}
                    className="rounded-full bg-blue-600 p-2.5 text-white transition-transform hover:scale-110 active:scale-90 shadow-lg shadow-blue-500/40"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Premium Course</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                </div>

                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900" title={course.title}>
                  {course.title}
                </h3>

                <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {course.shortDescription || 'Chưa cập nhật nội dung giới thiệu cho khóa học này...'}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{course.totalModules} chương</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>{formatDate(course.publishedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone Bottom Bar */}
              <div className="flex border-t border-slate-50 bg-slate-50/50 px-5 py-2">
                <button
                  onClick={() => handleDelete(course.courseId, course.title)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa khóa học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;