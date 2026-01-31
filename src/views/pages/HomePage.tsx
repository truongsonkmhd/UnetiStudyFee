import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Play, Users, Clock } from "lucide-react";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import courseCatalogService from "@/services/courseCatalogService";
import { useNavigate } from "react-router-dom";

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
    <div
      className="relative overflow-visible"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={ref}
        className="flex snap-x snap-mandatory overflow-hidden rounded-2xl"
      >
        {slides.map((s) => (
          <div key={s.id} className="min-w-full snap-start">
            <div className="relative h-[220px] sm:h-[260px] md:h-[320px] overflow-hidden rounded-2xl">
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff6a00]/90 via-[#ff6a00]/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 sm:px-10 max-w-2xl text-white">
                  <h3 className="text-2xl sm:text-3xl font-semibold">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base opacity-90">
                    {s.subtitle}
                  </p>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 text-slate-900 dark:bg-slate-900/90 dark:text-white px-4 py-2 text-sm font-medium shadow transition-all hover:scale-105"
                  >
                    {s.cta}
                    <Play size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => goto(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow hover:shadow-md"
        aria-label="Prev"
      >
        ‹
      </button>
      <button
        onClick={() => goto(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow hover:shadow-md"
        aria-label="Next"
      >
        ›
      </button>

      <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-4 bg-muted hover:bg-muted-foreground/30"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const CourseCard: React.FC<{ course: CourseCardResponse }> = ({ course }) => {
  const navigate = useNavigate();

  // Fallback gradients if no image
  const gradients = [
    "from-rose-500 to-pink-500", "from-cyan-500 to-teal-500", "from-sky-500 to-blue-500",
    "from-fuchsia-500 to-purple-500", "from-amber-400 to-yellow-400", "from-orange-400 to-amber-500",
    "from-emerald-400 to-teal-500", "from-teal-500 to-cyan-500", "from-purple-500 to-fuchsia-500",
    "from-indigo-500 to-blue-500"
  ];
  // Deterministic gradient based on ID length or rough hash
  const gradIndex = (course.courseId.charCodeAt(0) + course.courseId.charCodeAt(course.courseId.length - 1)) % gradients.length;
  const gradient = gradients[gradIndex];

  const handleClick = () => {
    navigate(`/course/${course.slug}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      {course.imageUrl ? (
        <div className="h-40 w-full overflow-hidden bg-gray-100">
          <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      ) : (
        <div
          className={`relative h-40 w-full bg-gradient-to-r ${gradient}`}
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-lg font-bold leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h4>
          {/* Placeholder for PRO badge if needed in future */}
        </div>
        {/* NEW badge logic could be restored if backend provides 'isNew' flag */}
      </div>
      <div className="px-4 pb-4">
        <div className="mt-auto flex flex-col gap-1 text-muted-foreground text-xs font-medium">
          <span className="inline-flex items-center gap-1">
            GV: {course.instructorName || "Uneti Teacher"}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center gap-1">
              <Users size={14} className="text-primary/60" /> {course.enrolledCount || 0} học viên
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-primary/60" /> {course.totalModules} phần
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesRow: React.FC<{ courses: CourseCardResponse[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {courses.map((c) => (
      <CourseCard key={c.courseId} course={c} />
    ))}
  </div>
);

/* ============================
   FILTER/SORT CONTROLS (UI)
============================ */
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        // Note: Currently backend doesn't support 'major' filter, effectively returning all published courses
        // Search query (q) could be used if we mapped major to a search term
        const q = major === 'all' ? '' : MAJOR_LABEL[major];
        const response = await courseCatalogService.getPublishedCourses(0, 12, q === 'Tất cả' ? '' : q);
        if (response.items) {
          setCourses(response.items);
        }
      } catch (e) {
        console.error("Failed to load courses", e);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [major]);

  return (
    <PageContainer>
      <Carousel slides={heroSlides} />

      <SectionHeader
        title="Khóa học "
        rightSlot={
          <div className="flex flex-wrap items-center gap-3">
            <MajorSelect value={major} onChange={setMajor} />

            {/* Disabled Sort/Teacher for now until backend supports it fully */}
            <a
              href="#"
              className="hidden md:inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline underline-offset-4"
            >
              Xem lộ trình <ArrowRight size={16} />
            </a>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        courses.length > 0 ? (
          <CoursesRow courses={courses} />
        ) : (
          <div className="text-center p-10 text-muted-foreground">Không tìm thấy khóa học nào.</div>
        )
      )}

    </PageContainer>
  );
}

export default HomePage;
export { Carousel, CoursesRow, CourseCard, SectionHeader, PageContainer };
