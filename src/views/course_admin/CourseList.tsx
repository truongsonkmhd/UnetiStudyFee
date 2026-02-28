import React, { useState, useEffect } from 'react';
import { CourseCardResponse } from '@/model/course-admin/CourseCardResponse';
import CourseService from '@/services/courseService';
import { Search, Filter, Plus, Book, Trash2, Edit3, Eye, Calendar, Users, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

const Counter: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue}</span>;
};

interface CourseListProps {
  onEdit: (courseId: string) => void;
  onView: (courseId: string) => void;
  onCreate: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ onEdit, onView, onCreate }) => {
  const [courses, setCourses] = useState<CourseCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  const observerTarget = React.useRef<HTMLDivElement>(null);
  const lastPageRef = React.useRef<number>(-1);
  const isFetchingRef = React.useRef<boolean>(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  const fetchCourses = async (targetPage: number, isInitial = false) => {
    if (isFetchingRef.current) return;
    if (!isInitial && (targetPage <= lastPageRef.current || !hasNext)) return;

    try {
      isFetchingRef.current = true;
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await CourseService.getAllCourses({
        page: targetPage,
        size: 12,
        status: filters.status,
        q: filters.search
      });

      if (isInitial) {
        setCourses(response.items);
      } else {
        setCourses(prev => {
          const existingIds = new Set(prev.map(c => c.courseId));
          const newItems = response.items.filter(c => !existingIds.has(c.courseId));
          return [...prev, ...newItems];
        });
      }

      setPage(targetPage);
      setHasNext(response.hasNext);
      setTotalElements(response.totalElements);
      lastPageRef.current = targetPage;
    } catch (err) {
      if (isInitial) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học');
      } else {
        toast.error('Không thể tải thêm khóa học');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  const isFirstRender = React.useRef(true);
  const lastFilterRef = React.useRef({ status: '', search: '' });

  useEffect(() => {
    const isFilterChanged =
      filters.status !== lastFilterRef.current.status ||
      filters.search !== lastFilterRef.current.search;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastFilterRef.current = { status: filters.status, search: filters.search };
      fetchCourses(0, true);
      return;
    }

    if (!isFilterChanged) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      lastFilterRef.current = { status: filters.status, search: filters.search };
      fetchCourses(0, true);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [filters.status, filters.search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNext && !loading && !loadingMore && !isFetchingRef.current) {
          fetchCourses(lastPageRef.current + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNext, loading, loadingMore]); // page removed from dependencies

  const loadCourses = () => fetchCourses(0, true);

  const handleDelete = async (courseId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"?`)) {
      return;
    }

    try {
      await CourseService.deleteCourse(courseId);
      setCourses(courses.filter(c => c.courseId !== courseId));
      setTotalElements(prev => prev - 1);
      toast.success(`Khóa học "${title}" đã được xóa thành công.`);
    } catch (err) {
      toast.error('Không thể xóa khóa học: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    }
  };

  const filteredCourses = courses;

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Quản lý nội dung học tập</h1>
          <p className="text-muted-foreground font-medium">Xây dựng và tối ưu giảng đường số của bạn</p>
        </div>
        <button
          onClick={onCreate}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Tạo khóa học mới</span>
        </button>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="appearance-none rounded-xl border border-border bg-muted/50 py-2.5 pl-9 pr-8 text-sm font-medium text-foreground transition-all hover:border-accent focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã công bố</option>
              <option value="draft">Bản phác thảo</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-border md:block" />
          <span className="text-sm font-medium text-muted-foreground">
            {courses.length} / {totalElements} khóa học
          </span>
        </div>
      </motion.div>

      {/* List Area */}
      <AnimatePresence mode="wait">
        {loading && courses.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="font-medium text-muted-foreground">Hệ thống đang tải dữ liệu...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          >
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <Filter className="h-6 w-6 rotate-45" />
            </div>
            <p className="max-w-md font-medium text-foreground">{error}</p>
            <button onClick={loadCourses} className="rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow-sm transition-transform active:scale-95">
              Thử tải lại trang
            </button>
          </motion.div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center"
          >
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Book className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground italic">"Gió mang khóa học đi đâu rồi?"</h3>
              <p className="text-muted-foreground">Không tìm thấy kết quả nào khớp với bộ lọc hiện tại.</p>
            </div>
            <button onClick={() => setFilters({ status: '', search: '', category: '' })} className="text-sm font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline">
              Xóa bộ lọc tìm kiếm
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.05, 0.4)
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 shadow-md"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/80 text-muted-foreground">
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
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-foreground/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => onView(course.courseId)}
                      className="rounded-full bg-background p-2.5 text-foreground transition-transform hover:scale-110 active:scale-90"
                      title="Xem trước"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(course.courseId)}
                      className="rounded-full bg-primary p-2.5 text-primary-foreground transition-transform hover:scale-110 active:scale-90 shadow-lg shadow-primary/40"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Premium Course</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>

                  <h3 className="mb-2 line-clamp-1 text-lg font-bold text-foreground" title={course.title}>
                    {course.title}
                  </h3>

                  <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {course.shortDescription || 'Chưa cập nhật nội dung giới thiệu cho khóa học này...'}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <span>{course.totalModules} chương</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-border pl-4">
                      <Calendar className="h-3.5 w-3.5 text-amber-500" />
                      <span>{formatDate(course.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone Bottom Bar */}
                <div className="flex border-t border-border bg-muted/30 px-5 py-2">
                  <button
                    onClick={() => handleDelete(course.courseId, course.title)}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa khóa học
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Load More Trigger */}
            <div ref={observerTarget} className="col-span-full h-20 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Đang tải thêm...</span>
                </div>
              )}
              {!hasNext && filteredCourses.length > 0 && (
                <p className="text-muted-foreground text-sm font-medium">Đã hiển thị tất cả khóa học</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseList;