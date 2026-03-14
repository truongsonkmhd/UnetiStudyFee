import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, Loader2, Zap, ChevronRight } from "lucide-react";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import courseCatalogService from "@/services/courseCatalogService";
import CourseCard from "./component/CourseCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type Major =
  | "all"
  | "cntt"
  | "ketoan"
  | "dulich"
  | "qtkd"
  | "ngonnguanh"
  | "chung";

const MAJOR_LABEL: Record<Major, string> = {
  all: "Tất cả",
  cntt: "Công nghệ thông tin",
  ketoan: "Kế toán",
  dulich: "Du lịch",
  qtkd: "Quản trị kinh doanh",
  ngonnguanh: "Ngôn ngữ Anh",
  chung: "Chung",
};

const SectionHeader: React.FC<{
  title: string;
  count?: number;
  rightSlot?: React.ReactNode;
}> = ({ title, count, rightSlot }) => (
  <div className="mb-6 mt-12 flex items-end justify-between">
    <div className="flex items-baseline gap-3">
      <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
      {count !== undefined && (
        <span className="text-sm font-bold text-slate-500">({count} bài học)</span>
      )}
    </div>
    {rightSlot || (
      <button className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-blue-400 transition-colors group">
        Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    )}
  </div>
);

const MajorTags: React.FC<{
  value: Major;
  onChange: (m: Major) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3 py-6">
      {Object.keys(MAJOR_LABEL).map((k) => (
        <button
          key={k}
          onClick={() => onChange(k as Major)}
          className={[
            "px-5 py-2 text-[13px] font-black rounded-full border transition-all duration-300 transform active:scale-95",
            value === k
              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20"
              : "bg-muted/40 border-border text-muted-foreground hover:border-slate-600 hover:text-foreground"
          ].join(" ")}
        >
          # {MAJOR_LABEL[k as Major]}
        </button>
      ))}
    </div>
  );
};

export function HomePage() {
  const [major, setMajor] = useState<Major>("all");
  const [courses, setCourses] = useState<CourseCardResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
      }
    } catch (e) {
      console.error("Failed to load courses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    loadCourses(0);
  }, [major]);

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    loadCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-[1800px] px-4 sm:px-10 py-8 mb-20">
      {/* Major Filter Tags */}
      <MajorTags value={major} onChange={setMajor} />

      <AnimatePresence mode="wait">
        {loading && courses.length === 0 ? (
          <div key="loading" className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 size={48} className="text-blue-500 animate-spin" />
            <p className="text-lg font-black text-slate-500 uppercase tracking-widest">Đang khởi tạo bài học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div key="empty" className="py-20 text-center bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-800">
            <h3 className="text-3xl font-black text-slate-300">Sắp ra mắt bài học mới</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-bold tracking-tight">Chúng tôi đang biên soạn nội dung chất lượng nhất cho chuyên ngành này. Quay lại sau nhé!</p>
            <button
              onClick={() => setMajor('all')}
              className="mt-10 px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              XEM BÀI HỌC CÓ SẴN
            </button>
          </div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Split courses into sections for visual variety like the screenshot */}
            <SectionHeader title={major === 'all' ? "Khóa học mới nhất" : MAJOR_LABEL[major]} count={totalElements} />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((c, i) => (
                <CourseCard key={c.courseId} course={c} />
              ))}
            </div>

            {/* Pagination at the bottom */}
            {!loading && totalPages > 1 && (
              <div className="pt-20 pb-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                        className={currentPage === 0 ? "pointer-events-none opacity-20" : "cursor-pointer text-slate-400 font-bold"}
                      />
                    </PaginationItem>
                    {/* ... page items ... */}
                    {Array.from({ length: totalPages }, (_, i) => (
                      (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) ? (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                            isActive={currentPage === i}
                            className={currentPage === i ? "bg-blue-600 text-white border-blue-600 font-black shadow-lg shadow-blue-500/20" : "text-slate-400 font-bold hover:bg-slate-800"}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ) : null
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-20" : "cursor-pointer text-slate-400 font-bold"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
