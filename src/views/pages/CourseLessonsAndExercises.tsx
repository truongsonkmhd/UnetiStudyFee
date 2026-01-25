import React, { useMemo, useState } from "react";

// ---- Types ----
interface Lesson {
  id: string;
  index: number;
  title: string;
  duration: string; // mm:ss or string
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Exercise {
  id: string;
  code: string;
  title: string;
  group: string; // Nhóm
  subtopic: string; // Chủ đề con
  difficulty: number; // 1..5
}

// ---- Mock Data (mô phỏng) ----
const mockChapters: Chapter[] = [
  {
    id: "c1",
    title: "1. Giới thiệu",
    lessons: [
      { id: "l1", index: 1, title: "Giới thiệu khóa học", duration: "01:03" },
      { id: "l2", index: 2, title: "Cài đặt Dev - C++", duration: "02:31" },
      {
        id: "l3",
        index: 3,
        title: "Hướng dẫn sử dụng Dev - C++",
        duration: "03:33",
      },
    ],
  },
  {
    id: "c2",
    title: "2. Biến và kiểu dữ liệu",
    lessons: Array.from({ length: 32 }).map((_, i) => ({
      id: `c2l${i + 1}`,
      index: i + 1,
      title: `Bài ${i + 1}`,
      duration:
        `${(i % 9) + 1}`.padStart(2, "0") +
        ":" +
        `${(i * 7) % 60}`.padStart(2, "0"),
    })),
  },
  {
    id: "c3",
    title: "3. Cấu trúc điều khiển và vòng lặp",
    lessons: Array.from({ length: 27 }).map((_, i) => ({
      id: `c3l${i + 1}`,
      index: i + 1,
      title: `Chủ đề ${i + 1}`,
      duration:
        `${(i % 7) + 1}`.padStart(2, "0") +
        ":" +
        `${(i * 5) % 60}`.padStart(2, "0"),
    })),
  },
  {
    id: "c4",
    title: "4. Mảng",
    lessons: Array.from({ length: 18 }).map((_, i) => ({
      id: `c4l${i + 1}`,
      index: i + 1,
      title: `Ví dụ ${i + 1}`,
      duration:
        `${(i % 6) + 1}`.padStart(2, "0") +
        ":" +
        `${(i * 3) % 60}`.padStart(2, "0"),
    })),
  },
];

const mockExercises: Exercise[] = [
  {
    id: "e1",
    code: "CHELLO",
    title: "Hello World",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e2",
    code: "CTDL_001",
    title: "THUẬT TOÁN SINH 1",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e3",
    code: "CTDL_002",
    title: "Trọng động con K",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e4",
    code: "CTDL_003",
    title: "ĐỘ QUÊ DỮ TRONG DÃI LÕI ĐƠN",
    group: "CẤU TRÚC DỮ LIỆU CƠ BẢN",
    subtopic: "Sắp xếp - Tìm kiếm",
    difficulty: 1,
  },
  {
    id: "e5",
    code: "CTDL_005",
    title: "LỌC DỮ LIỆU TRONG DÃI LÕI ĐƠN",
    group: "CẤU TRÚC DỮ LIỆU CƠ BẢN",
    subtopic: "Sắp xếp - Tìm kiếm",
    difficulty: 1,
  },
  {
    id: "e6",
    code: "CTDL_006",
    title: "ĐÁNH DẤU VÀ TÌM TÊN TRÙNG CÙNG",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sắp xếp - Tìm kiếm",
    difficulty: 1,
  },
  {
    id: "e7",
    code: "DSA_P091",
    title: "CHỌN-1",
    group: "CẤU TRÚC DỮ LIỆU CƠ BẢN",
    subtopic: "Quy hoạch động",
    difficulty: 1,
  },
  {
    id: "e8",
    code: "DSA_P200",
    title: "CÁC THUẬT TOÁN SẮP XẾP - 1",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sắp xếp - Tìm kiếm",
    difficulty: 1,
  },
  {
    id: "e9",
    code: "DSA_P298",
    title: "DÃY CON TỔNG LỚN NHẤT",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Dãy - Mảng",
    difficulty: 1,
  },
  {
    id: "e10",
    code: "DSA01001",
    title: "XUÂN PHẠM NHIỆT TIẾP",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e11",
    code: "DSA01002",
    title: "TĂP CONNECT TIẾP",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e12",
    code: "DSA01003",
    title: "SỐ NHỊ PHÂN KẾP",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e13",
    code: "DSA01004",
    title: "SỐ HOÁN VỊ KẾP",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e14",
    code: "DSA01005",
    title: "SINH TỔ HỢP",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e15",
    code: "DSA01006",
    title: "PHÂN TÍCH THỪA SỐ",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Số học",
    difficulty: 1,
  },
  {
    id: "e16",
    code: "DSA01007",
    title: "DÃY NHỊ PHÂN",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e17",
    code: "DSA01008",
    title: "Q-H VÀ NHỊ QUỐC",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 1,
  },
  {
    id: "e18",
    code: "DSA01009",
    title: "Q-H VÀ NHỊ QUỐC",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 2,
  },
  {
    id: "e19",
    code: "DSA010010",
    title: "Q-H VÀ NHỊ QUỐC",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 3,
  },
  {
    id: "e20",
    code: "DSA010011",
    title: "Q-H VÀ NHỊ QUỐC",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 4,
  },
  {
    id: "e21",
    code: "DSA010012",
    title: "Q-H VÀ NHỊ QUỐC",
    group: "CÁC MÔN THUẬT TOÁN",
    subtopic: "Sinh kếp",
    difficulty: 5,
  },
];

// ---- Helpers ----
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Pagination util
const usePagination = (total: number, pageSize = 15) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(total, start + pageSize);
  const slice = (arr: any[]) => arr.slice(start, end);
  const goto = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));
  return { page, totalPages, slice, goto, start: start + 1, end, pageSize };
};

// ---- UI ----
export default function CourseLessonsAndExercises() {
  // Left: Chapters state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    c1: true,
  });
  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // Right: Filters for exercises
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<number[]>([]); // Độ khó theo ảnh là 1..5
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [subtopicFilter, setSubtopicFilter] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return mockExercises.filter((e) => {
      const q = search.trim().toLowerCase();
      const base =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.group.toLowerCase().includes(q) ||
        e.subtopic.toLowerCase().includes(q);

      const byDiff = difficulty ? e.difficulty === difficulty : true;
      const byGrade = gradeFilter.length
        ? gradeFilter.includes(e.difficulty)
        : true; // reuse
      const byCat = categoryFilter ? e.group === categoryFilter : true;
      const bySub = subtopicFilter ? e.subtopic === subtopicFilter : true;
      return base && byDiff && byGrade && byCat && bySub;
    });
  }, [search, difficulty, gradeFilter, categoryFilter, subtopicFilter]);

  const pager = usePagination(filteredExercises.length, 15);
  const pageItems = pager.slice(filteredExercises);

  const categories = Array.from(new Set(mockExercises.map((e) => e.group)));
  const subtopics = Array.from(new Set(mockExercises.map((e) => e.subtopic)));

  return (
    <div className="w-full min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl grid grid-cols-12 gap-6">
        {/* Main */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Bài giảng */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Bài giảng</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {mockChapters.length} chương ·{" "}
                {mockChapters.reduce((a, c) => a + c.lessons.length, 0)} bài học
              </span>
            </div>
            <div className="mt-3 divide-y">
              {mockChapters.map((c) => (
                <div key={c.id} className="py-2">
                  <button
                    onClick={() => toggle(c.id)}
                    className="w-full flex items-center justify-between py-3 group"
                  >
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {c.lessons.length} bài học
                    </span>
                  </button>
                  {expanded[c.id] && (
                    <ul className="mt-2 space-y-1">
                      {c.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-muted-foreground/40 font-bold">
                              {String(l.index).padStart(2, '0')}.
                            </span>
                            <span className="text-sm font-semibold text-foreground">{l.title}</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground/60 tabular-nums">
                            {l.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bài tập */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Bài tập</h2>

            {/* Search + quick filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm mã, tiêu đề, nhóm..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
              <select
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={difficulty ?? ""}
                onChange={(e) =>
                  setDifficulty(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Độ khó (tất cả)</option>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSearch("");
                  setDifficulty(null);
                  setGradeFilter([]);
                  setCategoryFilter(null);
                  setSubtopicFilter(null);
                }}
                className="rounded-xl border border-border bg-muted px-4 py-2.5 hover:bg-muted/80 transition-all font-bold text-xs uppercase tracking-widest text-muted-foreground"
              >
                Xóa lọc
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-[10px] font-black uppercase tracking-widest">
                    <th className="px-4 py-4 text-left w-16">STT</th>
                    <th className="px-4 py-4 text-left">Mã số</th>
                    <th className="px-4 py-4 text-left">Tiêu đề</th>
                    <th className="px-4 py-4 text-left">Nhóm</th>
                    <th className="px-4 py-4 text-left">Chủ đề con</th>
                    <th className="px-4 py-4 text-left w-24">Độ khó</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={cn("border-b border-border/50", idx % 2 === 0 ? "bg-card" : "bg-muted/10")}
                    >
                      <td className="px-4 py-3 text-muted-foreground/60 font-medium">{pager.start + idx}</td>
                      <td className="px-4 py-3 text-primary font-bold">
                        {e.code}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground font-bold hover:text-primary cursor-pointer transition-colors">
                          {e.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{e.group}</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{e.subtopic}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2 py-1 text-[10px] font-black uppercase tracking-tighter">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Lv.{e.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Không có bài tập phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-500">
                Hiển thị {pageItems.length ? `${pager.start}–${pager.end}` : 0}{" "}
                / {filteredExercises.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pager.goto(1)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-all"
                >
                  «
                </button>
                <button
                  onClick={() => pager.goto(pager.page - 1)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-all text-muted-foreground"
                >
                  PREV
                </button>
                <span className="px-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Trang {pager.page}/{pager.totalPages}
                </span>
                <button
                  onClick={() => pager.goto(pager.page + 1)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-all text-muted-foreground"
                >
                  NEXT
                </button>
                <button
                  onClick={() => pager.goto(pager.totalPages)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-all"
                >
                  »
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar filters */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Độ khó</h3>
              <button
                onClick={() => setGradeFilter([])}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
              >
                Bỏ chọn
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {[1, 2, 3, 4, 5].map((lv) => (
                <label key={lv} className="flex items-center gap-3 group cursor-pointer p-1">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={gradeFilter.includes(lv)}
                      onChange={(e) =>
                        setGradeFilter((s) =>
                          e.target.checked
                            ? [...s, lv]
                            : s.filter((x) => x !== lv)
                        )
                      }
                      className="w-4 h-4 rounded-md border-border bg-background text-primary focus:ring-primary/20"
                    />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Cấp {lv}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Chủ đề con</h3>
              <button
                onClick={() => setSubtopicFilter(null)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
              >
                Bỏ chọn
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {subtopics.map((s) => (
                <li key={s}>
                  <button
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2 font-semibold text-sm transition-all",
                      subtopicFilter === s
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setSubtopicFilter(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Nhóm</h3>
              <button
                onClick={() => setCategoryFilter(null)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
              >
                Bỏ chọn
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {categories.map((c) => (
                <li key={c} className="flex items-center justify-between">
                  <button
                    className={cn(
                      "text-left flex-1 rounded-xl px-3 py-2 font-semibold text-sm transition-all",
                      categoryFilter === c
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c}
                  </button>
                  <span className="text-[10px] font-black tabular-nums text-muted-foreground bg-muted w-7 h-7 flex items-center justify-center rounded-full opacity-60">
                    {mockExercises.filter((e) => e.group === c).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">Tìm kiếm nhanh</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã/tiêu đề..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
            <button
              onClick={() => setSearch("")}
              className="mt-3 w-full rounded-xl border border-border bg-muted px-4 py-2.5 hover:bg-muted/80 transition-all font-bold text-xs uppercase tracking-widest text-muted-foreground"
            >
              Xóa ô tìm kiếm
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
