import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight
} from "lucide-react";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import courseCatalogService from "@/services/courseCatalogService";
import CourseCard from "./component/CourseCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MAJORS } from "@/constants/major";

export type Major = "all" | string;

const MAJOR_LIST = [
  { id: "all", name: "Tất cả" },
  ...MAJORS
];


const SectionHeader: React.FC<{
  title: string;
  count?: number;
  rightSlot?: React.ReactNode;
}> = ({ title, count, rightSlot }) => (
  <div className="mb-8 mt-12 flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
    <div className="flex items-center gap-4">
      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white capitalize">{title}</h2>
      {count !== undefined && (
        <span className="px-3 py-1 text-xs font-bold bg-blue-50/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/30 shadow-sm">
          {count} khóa học
        </span>
      )}
    </div>
    {rightSlot}
  </div>
);

const MajorTags: React.FC<{
  value: Major;
  onChange: (m: Major) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3 py-6">
      {MAJOR_LIST.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={[
            "px-8 py-3 text-base font-bold rounded-2xl border transition-all duration-300 transform active:scale-95",
            value === m.id
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/10"
          ].join(" ")}
        >
          {m.name}
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
      const selectedMajor = MAJOR_LIST.find(m => m.id === major);
      const category = major === 'all' ? '' : selectedMajor?.name || '';
      const response = await courseCatalogService.getPublishedCourses(
        page,
        pageSize,
        '', // Clear q when filtering by category tab
        category
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-[1800px] w-full px-0 py-8 mb-20"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <MajorTags value={major} onChange={setMajor} />
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
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-bold text-slate-500 uppercase tracking-widest animate-pulse mt-4">Đang chuẩn bị bài học...</p>
          </motion.div>
        ) : courses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12 bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
          >
            <EmptyState
              title="Sắp ra mắt khóa học mới"
              description="Đội ngũ giáo viên sẽ thêm khóa học sớm nhất !!!"
              className="py-12"
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeader title={major === 'all' ? "Khóa học mới nhất" : (MAJOR_LIST.find(m => m.id === major)?.name || "")} count={totalElements} />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((c, i) => (
                <CourseCard key={c.courseId} course={c} />
              ))}
            </div>

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
                    {Array.from({ length: totalPages }, (_, i) => (
                      (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) ? (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                            isActive={currentPage === i}
                            className={currentPage === i ? "bg-blue-600 text-white border-blue-600 font-black" : "text-slate-400 font-bold hover:bg-slate-800"}
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
    </motion.div>
  );
}

export default HomePage;
