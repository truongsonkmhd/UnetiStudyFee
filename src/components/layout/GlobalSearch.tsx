import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import courseCatalogService from '@/services/courseCatalogService';
import courseEnrollmentService from '@/services/courseEnrollmentService';
import { GlobalQuickSearchResponse } from '@/model/search/GlobalQuickSearchResponse';
import { useDebounce } from "@/views/course_admin/useDebounce";
import { Users } from 'lucide-react';
import { PATHS } from '@/constants/paths';
import { actionAuth } from '../context/AuthContext';
import { RoleEnum } from '../enum/RoleEnum';
import classService from '@/services/classService';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalQuickSearchResponse>({ courses: [], classes: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [myClassIds, setMyClassIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { jwtClaims } = actionAuth();

  const debouncedQuery = useDebounce(query, 400);

  // Search logic triggered by debounced value
  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery.trim().length >= 1) {
        setIsOpen(true);
        setIsLoading(true);
        try {
          const data = await courseCatalogService.globalQuickSearch(debouncedQuery, 5);
          setResults(data);
        } catch (error) {
          console.error("Search failed", error);
          setResults({ courses: [], classes: [] });
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ courses: [], classes: [] });
        setIsOpen(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  // Fetch joined classes to check status
  useEffect(() => {
    const fetchMyClasses = async () => {
      if (jwtClaims?.userID) {
        try {
          const classes = await classService.student.getMyClasses(jwtClaims.userID);
          setMyClassIds(new Set(classes.map(c => c.classId)));
        } catch (error) {
          console.error("Failed to fetch my classes", error);
        }
      }
    };
    if (isOpen) {
      fetchMyClasses();
    }
  }, [isOpen, jwtClaims?.userID]);

  // Click away to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (slug: string, courseId: string) => {
    try {
      const status = await courseEnrollmentService.getEnrollmentStatus(courseId);
      if (status?.status === 'APPROVED') {
        navigate(PATHS.COURSE_LEARN.replace(':slug', slug));
      } else {
        navigate(PATHS.COURSE_DETAIL.replace(':slug', slug));
      }
    } catch {
      navigate(PATHS.COURSE_DETAIL.replace(':slug', slug));
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-[600px]" ref={searchRef}>
      <div className="relative group">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-blue-500' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học , lớp học..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 1 && setIsOpen(true)}
          className="w-full bg-slate-100/30 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-11 pr-10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-950 transition-all duration-300 shadow-sm focus:shadow-md"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : query && (
            <button
              onClick={() => { setQuery(''); setResults({ courses: [], classes: [] } as GlobalQuickSearchResponse); setIsOpen(false); }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/10 overflow-hidden z-50 py-2"
          >
            {(results.courses.length > 0 || results.classes.length > 0) ? (
              <div className="flex flex-col scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 max-h-[550px] overflow-y-auto">
                {/* Courses Section */}
                {results.courses.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800/50 mb-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <span>Khóa học</span>
                      <span className="text-[9px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">{results.courses.length}</span>
                    </div>
                    {results.courses.map((course, index) => (
                      <React.Fragment key={course.courseId}>
                        <button
                          onClick={() => handleSelect(course.slug, course.courseId)}
                          className="flex items-center gap-4 p-3 mx-2 my-0.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group text-left border border-transparent hover:border-blue-500/20 dark:hover:border-blue-500/10 shadow-sm hover:shadow-md"
                        >
                          <div className="relative shrink-0 w-24 h-14 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                            {course.imageUrl ? (
                              <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium">
                              {course.shortDescription}
                            </p>
                          </div>
                        </button>
                        {index < results.courses.length - 1 && results.classes.length === 0 && (
                          <div className="mx-6 border-b border-slate-100/50 dark:border-slate-800/30" />
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}

                {/* Classes Section */}
                {results.classes.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800/50 my-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <span>Lớp học</span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">{results.classes.length}</span>
                    </div>
                    {results.classes.map((item) => (
                      <button
                        key={item.classId}
                        onClick={() => {
                          if (myClassIds.has(item.classId)) {
                            navigate(PATHS.CLASS_DETAIL.replace(':classId', item.classId));
                          } else {
                            navigate(`${PATHS.JOIN_CLASS}?code=${item.inviteCode || item.classCode}`);
                          }
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="flex items-center gap-4 p-3 mx-2 my-0.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group text-left border border-transparent hover:border-emerald-500/20 dark:hover:border-emerald-500/10 shadow-sm hover:shadow-md"
                      >
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/10 transition-transform duration-300 group-hover:scale-110">
                          <Users className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {item.className}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                              {item.classCode}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                              GV: {item.instructorName}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : !isLoading && (
              <div className="px-10 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  Không tìm thấy khóa học cho <br />
                  <span className="text-blue-500">"{query}"</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
