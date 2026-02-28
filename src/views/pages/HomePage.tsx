import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Play, Users, Clock, Loader2 } from "lucide-react";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { AnimatePresence } from "framer-motion";
import courseCatalogService from "@/services/courseCatalogService";
import courseEnrollmentService from "@/services/courseEnrollmentService";
import { useNavigate } from "react-router-dom";
import CourseCard from "./component/CourseCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/* ============================
   DATA
============================ */
const heroSlides = [
  {
    id: "s1",
    title: "Phạm Thị Thùy",
    subtitle:
      "Kênh cô được nhắc tới ở mọi nơi, mở ra cơ hội việc làm cho người làm IT và cho những người yêu thích lập trình cô Thùy sẽ ở đó.",
    cta: "Đăng ký kênh",
    image: "https://picsum.photos/1400/350?random=20",
  },
  {
    id: "s2",
    title: "Cập nhật khóa học mới",
    subtitle: "Theo dõi để không bỏ lỡ nội dung mới mỗi tuần.",
    cta: "Xem ngay",
    image: "https://picsum.photos/1400/350?random=21",
  },
  {
    id: "s3",
    title: "Học miễn phí từ cơ bản đến nâng cao",
    subtitle: "Lộ trình rõ ràng – thực hành nhiều – mentor hỗ trợ.",
    cta: "Bắt đầu",
    image: "https://picsum.photos/1400/350?random=22",
  },
];

export type Major =
  | "all"
  | "cntt"
  | "ketoan"
  | "dulich"
  | "qtkd"
  | "ngonnguanh"
  | "chung";

const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </div>
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, rightSlot }) => (
  <div className="mb-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h2>
      {subtitle ? (
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      ) : null}
    </div>
    {rightSlot}
  </div>
);

/* ============================
   Carousel
============================ */
const Carousel: React.FC<{
  slides: typeof heroSlides;
  intervalMs?: number;
}> = ({ slides, intervalMs = 4000 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(timer);
  }, [slides.length, intervalMs, paused]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    const onResize = () => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({ left: index * el.clientWidth });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index]);

  const goto = (next: number) =>
    setIndex((prev) => (prev + next + slides.length) % slides.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-visible"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={ref}
        className="flex snap-x snap-mandatory overflow-hidden rounded-2xl shadow-2xl shadow-primary/10"
      >
        {slides.map((s, idx) => (
          <div key={s.id} className="min-w-full snap-start">
            <div className="relative h-[220px] sm:h-[260px] md:h-[320px] overflow-hidden rounded-2xl">
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-500/40 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 sm:px-10 max-w-2xl text-white">
                  <motion.div
                    key={`${s.id}-${idx === index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-lg font-medium opacity-90 leading-relaxed max-w-lg">
                      {s.subtitle}
                    </p>
                    <a
                      href="#"
                      className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white text-orange-600 px-6 py-3 text-sm font-black shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                      {s.cta}
                      <Play size={18} fill="currentColor" />
                    </a>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => goto(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md p-3 text-white shadow-lg border border-white/20 hover:bg-white/30 transition-all active:scale-90"
        aria-label="Prev"
      >
        ‹
      </button>
      <button
        onClick={() => goto(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md p-3 text-white shadow-lg border border-white/20 hover:bg-white/30 transition-all active:scale-90"
        aria-label="Next"
      >
        ›
      </button>

      <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-10 bg-orange-500" : "w-3 bg-muted hover:bg-muted-foreground/30"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};


const CoursesRow: React.FC<{ courses: CourseCardResponse[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {courses.map((c, index) => (
      <motion.div
        key={c.courseId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      >
        <CourseCard course={c} />
      </motion.div>
    ))}
  </div>
);


const MAJOR_LABEL: Record<Major, string> = {
  all: "Tất cả",
  cntt: "Công nghệ thông tin",
  ketoan: "Kế toán",
  dulich: "Du lịch",
  qtkd: "Quản trị kinh doanh",
  ngonnguanh: "Ngôn ngữ Anh",
  chung: "Chung",
};

const MajorSelect: React.FC<{
  value: Major;
  onChange: (m: Major) => void;
}> = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground font-medium">Chuyên ngành:</span>
      <select
        className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value as Major)}
      >
        {Object.keys(MAJOR_LABEL).map((k) => (
          <option key={k} value={k}>
            {MAJOR_LABEL[k as Major]}
          </option>
        ))}
      </select>
    </label>
  );
};

export function HomePage() {
  const [major, setMajor] = useState<Major>("all");
  const [courses, setCourses] = useState<CourseCardResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const pageSize = 12;

  const loadCourses = async (page: number) => {
    setLoading(true);
    try {
      const q = major === 'all' ? '' : MAJOR_LABEL[major];
      const response = await courseCatalogService.getPublishedCourses(
        page,
        pageSize,
        q === 'Tất cả' ? '' : q
      );

      if (response.items) {
        setCourses(response.items);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setHasNext(response.hasNext);
      }
    } catch (e) {
      console.error("Failed to load courses", e);
    } finally {
      setLoading(false);
    }
  };
  const isFirstRender = useRef(true);
  const lastMajorRef = useRef<Major | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastMajorRef.current = major;
      loadCourses(0);
      return;
    }

    // Chỉ load lại khi major thực sự thay đổi
    if (major !== lastMajorRef.current) {
      lastMajorRef.current = major;
      setCurrentPage(0);
      loadCourses(0);
    }
  }, [major]);

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    loadCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <Carousel slides={heroSlides} />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <SectionHeader
          title="Khám phá khóa học"
          subtitle="Học tập không giới hạn với những bài giảng chất lượng cao"
          rightSlot={
            <div className="flex flex-wrap items-center gap-5">
              <MajorSelect value={major} onChange={setMajor} />

              <a
                href="#"
                className="hidden lg:inline-flex items-center gap-2 text-sm text-primary font-black hover:underline underline-offset-8 transition-all"
              >
                Xem lộ trình học tập <ArrowRight size={18} />
              </a>
            </div>
          }
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && courses.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center gap-4"
          >
            <Loader2 size={48} className="text-orange-500 animate-spin" />
            <p className="text-lg font-bold text-muted-foreground tracking-wide">Đang tải danh sách khóa học...</p>
          </motion.div>
        ) : courses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center bg-card rounded-[2.5rem] border border-dashed border-border"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-muted-foreground h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Không tìm thấy khóa học nào</h3>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto font-medium">Chúng tôi chưa có khóa học nào cho chuyên ngành này. Hãy thử quay lại sau hoặc đổi chuyên ngành khác.</p>
            <button
              onClick={() => setMajor('all')}
              className="mt-8 px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              XEM TẤT CẢ KHÓA HỌC
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CoursesRow courses={courses} />

            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-16 pb-8"
              >
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => {
                      if (
                        i === 0 ||
                        i === totalPages - 1 ||
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i);
                              }}
                              isActive={currentPage === i}
                              className="cursor-pointer font-bold"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (
                        (i === 1 && currentPage > 2) ||
                        (i === totalPages - 2 && currentPage < totalPages - 3)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </PageContainer>
  );
}

export default HomePage;
export { Carousel, CoursesRow, CourseCard, SectionHeader, PageContainer };
