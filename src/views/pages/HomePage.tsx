import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Play, Star, Users, Clock } from "lucide-react";

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

export type Course = {
  id: string;
  title: string;
  color: string;
  author: string;
  students: number;
  duration: string; // "24h15p" | "18p"
  price?: number;
  oldPrice?: number;
  isNew?: boolean;
  isPro?: boolean;
  isFree?: boolean;

  // thêm cho lọc/sắp xếp
  majors?: Major[];
  createdAt?: string; // ISO date
};

const freeCourses: Course[] = [
  {
    id: "c-fundamental",
    title: "Kiến Thức Nhập Môn IT",
    color: "from-rose-500 to-pink-500",
    author: "F8",
    students: 100,
    duration: "3h12p",
    isFree: true,
    majors: ["cntt", "chung"],
    createdAt: "2025-03-02",
  },
  {
    id: "c-cpp",
    title: "C++ từ cơ bản đến nâng cao",
    color: "from-cyan-500 to-teal-500",
    author: "F8",
    students: 200,
    duration: "18p",
    isFree: true,
    majors: ["cntt"],
    createdAt: "2025-01-10",
  },
  {
    id: "c-htmlcss-zero",
    title: "HTML, CSS , JavaScript từ cơ bản đến nâng cao",
    color: "from-sky-500 to-blue-500",
    author: "F8",
    students: 100,
    duration: "29h5p",
    isFree: true,
    majors: ["cntt"],
    createdAt: "2024-12-25",
  },
  {
    id: "c-responsive",
    title: "Xác suất thống kê",
    color: "from-fuchsia-500 to-purple-500",
    author: "Lan Anh",
    students: 300,
    duration: "6h31p",
    isFree: true,
    majors: ["ketoan", "qtkd", "chung"],
    createdAt: "2024-10-05",
  },
  {
    id: "c-js-basic",
    title: "Lập Trình JavaScript Cơ Bản",
    color: "from-amber-400 to-yellow-400",
    author: "Sơn Đặng",
    students: 400,
    duration: "24h15p",
    isFree: true,
    majors: ["cntt"],
    createdAt: "2025-04-18",
  },
  {
    id: "c-js-advanced",
    title: "Lập Trình JavaScript Nâng Cao",
    color: "from-orange-400 to-amber-500",
    author: "Sơn Đặng",
    students: 500,
    duration: "8h41p",
    isFree: true,
    majors: ["cntt"],
    createdAt: "2024-07-01",
  },
  {
    id: "th-vp",
    title: "Tin học văn phòng",
    color: "from-orange-400 to-amber-500",
    author: "Lan Anh",
    students: 100,
    duration: "8h41p",
    isFree: true,
    majors: ["chung", "ketoan", "qtkd", "ngonnguanh"],
    createdAt: "2025-02-05",
  },
  // bổ sung thêm vài khóa để test đủ 10 cho mọi ngành
  {
    id: "acc-1",
    title: "Nguyên lý kế toán",
    color: "from-emerald-400 to-teal-500",
    author: "Ngọc Minh",
    students: 90,
    duration: "12h00p",
    isFree: true,
    majors: ["ketoan"],
    createdAt: "2024-11-11",
  },
  {
    id: "acc-2",
    title: "Kế toán tài chính",
    color: "from-teal-500 to-cyan-500",
    author: "Ngọc Minh",
    students: 23,
    duration: "16h30p",
    isFree: true,
    majors: ["ketoan"],
    createdAt: "2024-09-09",
  },
  {
    id: "tour-1",
    title: "Nghiệp vụ hướng dẫn du lịch",
    color: "from-purple-500 to-fuchsia-500",
    author: "Bảo Trân",
    students: 21,
    duration: "10h20p",
    isFree: true,
    majors: ["dulich"],
    createdAt: "2025-01-22",
  },
  {
    id: "tour-2",
    title: "Quản trị lữ hành",
    color: "from-indigo-500 to-blue-500",
    author: "Bảo Trân",
    students: 25,
    duration: "14h00p",
    isFree: true,
    majors: ["dulich"],
    createdAt: "2024-08-20",
  },
  {
    id: "biz-1",
    title: "Nguyên lý quản trị",
    color: "from-rose-500 to-red-500",
    author: "Hoàng Nam",
    students: 35,
    duration: "9h00p",
    isFree: true,
    majors: ["qtkd"],
    createdAt: "2024-12-12",
  },
  {
    id: "eng-1",
    title: "Tiếng Anh học thuật cơ bản",
    color: "from-blue-500 to-sky-500",
    author: "Mỹ Duyên",
    students: 54,
    duration: "18h00p",
    isFree: true,
    majors: ["ngonnguanh", "chung"],
    createdAt: "2025-02-28",
  },
];

/* ============================
   UTILS
============================ */
const parseDurationToMinutes = (d: string) => {
  const h = /(\d+)\s*h/.exec(d)?.[1];
  const p = /(\d+)\s*p/.exec(d)?.[1];
  return (h ? parseInt(h) * 60 : 0) + (p ? parseInt(p) : 0);
};

type SortKey = "newest" | "oldest" | "longest" | "shortest";

const sortCourses = (list: Course[], sortKey: SortKey) =>
  list.slice().sort((a, b) => {
    switch (sortKey) {
      case "newest":
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      case "longest":
        return (
          parseDurationToMinutes(b.duration) -
          parseDurationToMinutes(a.duration)
        );
      case "shortest":
        return (
          parseDurationToMinutes(a.duration) -
          parseDurationToMinutes(b.duration)
        );
      default:
        return 0;
    }
  });

/** Đảm bảo tối thiểu 10 khóa học cho 1 ngành:
 *  primary(= đúng ngành) -> common("chung") -> others
 *  Sau đó sort theo sortKey trong từng lớp ưu tiên
 */
// Thay toàn bộ hàm cũ bằng hàm này
const atLeastTenForMajor = (
  major: Major,
  sortKey: SortKey,
  pool: Course[],
  target = 10
): Course[] => {
  if (major === "all") return sortCourses(pool, sortKey);

  const bag: Course[] = [];
  const seen = new Set<string>();

  const add = (src: Course[]) => {
    for (const c of src) {
      if (seen.has(c.id)) continue;
      bag.push(c);
      seen.add(c.id);
      if (bag.length >= target) break;
    }
  };

  const primary = sortCourses(
    pool.filter((c) => c.majors?.includes(major)),
    sortKey
  );
  const common = sortCourses(
    pool.filter((c) => c.majors?.includes("chung")),
    sortKey
  );
  const others = sortCourses(pool, sortKey);

  add(primary);
  if (bag.length < target) add(common);
  if (bag.length < target) add(others);

  return bag; // đúng 10 (hoặc ít hơn nếu pool < 10)
};

/* ============================
   COMPONENTS DÙNG CHUNG
============================ */
const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-white">
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
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
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
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow"
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
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i === index ? "bg-slate-800" : "bg-slate-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ============================
   Course Card + Row
============================ */
const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md"
  >
    <div
      className={`relative h-36 sm:h-40 bg-gradient-to-r ${course.color} p-4 text-white`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-semibold leading-snug drop-shadow">
          {course.title}
        </h4>
        {course.isPro ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-slate-900">
            <Crown size={14} /> Pro
          </span>
        ) : null}
      </div>
      {course.isNew ? (
        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-900">
          Mới
        </span>
      ) : null}
    </div>
    <div className="p-4">
      {course.price ? (
        <div className="mb-1 flex items-center gap-2">
          {course.oldPrice ? (
            <span className="text-slate-400 line-through text-sm">
              {course.oldPrice.toLocaleString("vi-VN")}đ
            </span>
          ) : null}
          <span className="text-rose-600 font-semibold">
            {course.price.toLocaleString("vi-VN")}đ
          </span>
        </div>
      ) : (
        <div className="mb-1 text-emerald-600 font-semibold">Miễn phí</div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-slate-600 text-sm">
        <span className="inline-flex items-center gap-1">
          <Users size={16} /> {course.author}
        </span>

        <span className="inline-flex items-center gap-1">
          <Users size={16} /> {course.students.toLocaleString("vi-VN")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={16} /> {course.duration}
        </span>
      </div>
    </div>
  </motion.div>
);

const CoursesRow: React.FC<{ courses: Course[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {courses.map((c) => (
      <CourseCard key={c.id} course={c} />
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
      <span className="text-slate-600">Chuyên ngành:</span>
      <select
        className="rounded-md border px-2 py-1.5 text-sm"
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

const SortSelect: React.FC<{
  value: SortKey;
  onChange: (s: SortKey) => void;
}> = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Sắp xếp:</span>
      <select
        className="rounded-md border px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="longest">Thời lượng dài nhất</option>
        <option value="shortest">Thời lượng ngắn nhất</option>
      </select>
    </label>
  );
};

const TeacherSelect: React.FC<{
  value: string;
  options: string[];
  onChange: (t: string) => void;
}> = ({ value, options, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Giáo viên:</span>
      <select
        className="rounded-md border px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Tất cả</option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
};

/* ============================
   HOMEPAGE
============================ */
export function HomePage() {
  const [major, setMajor] = useState<Major>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [teacher, setTeacher] = useState<string>("all");

  // danh sách giáo viên từ data
  const teacherOptions = useMemo(() => {
    const set = new Set<string>();
    freeCourses.forEach((c) => set.add(c.author));
    return Array.from(set).sort();
  }, []);

  const requiredCourses = useMemo(() => {
    // base pool là freeCourses
    let pool = freeCourses.slice();

    // nếu chọn giáo viên, lọc theo giáo viên trước
    if (teacher !== "all") {
      pool = pool.filter((c) => c.author === teacher);
      // khi lọc theo giáo viên, không ép tối thiểu 10 (vì có thể GV chỉ có vài khóa)
      const byMajor =
        major === "all" ? pool : pool.filter((c) => c.majors?.includes(major));
      return sortCourses(byMajor, sortKey).slice(0, 12);
    }

    // không chọn giáo viên -> đảm bảo mỗi ngành tối thiểu 10
    const ensured = atLeastTenForMajor(major, sortKey, pool);
    return ensured.slice(0, 12);
  }, [major, sortKey, teacher]);

  return (
    <PageContainer>
      <Carousel slides={heroSlides} />

      <SectionHeader
        title="Khóa học bắt buộc"
        rightSlot={
          <div className="flex flex-wrap items-center gap-3">
            <MajorSelect value={major} onChange={setMajor} />
            <TeacherSelect
              value={teacher}
              options={teacherOptions}
              onChange={setTeacher}
            />
            <SortSelect value={sortKey} onChange={setSortKey} />
            <a
              href="#"
              className="hidden md:inline-flex items-center gap-2 text-sm text-slate-700 hover:underline"
            >
              Xem lộ trình <ArrowRight size={16} />
            </a>
          </div>
        }
      />
      <CoursesRow courses={requiredCourses} />
    </PageContainer>
  );
}

export default HomePage;
export { Carousel, CoursesRow, CourseCard, SectionHeader, PageContainer };
