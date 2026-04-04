import React from "react";
import { Users, Clock, PlayCircle, BookOpen, ChevronRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { useNavigate } from "react-router-dom";
import courseEnrollmentService from "@/services/courseEnrollmentService";
import defaultAvatar from "@/assets/img/avatar-default.png";
import { actionAuth } from "@/components/context/AuthContext";

const CourseCard: React.FC<{ course: CourseCardResponse }> = ({ course }) => {
  const navigate = useNavigate();
  const { hasRole } = actionAuth();
  const isAdmin = hasRole(["ROLE_ADMIN", "Quản trị viên"]);

  const handleClick = async () => {
    try {
      console.log("courseId=======================", course.courseId);
      const status = await courseEnrollmentService.getEnrollmentStatus(course.courseId);
      if (status?.status === "APPROVED") {
        navigate(`/course/${course.slug}/learn`);
      } else {
        navigate(`/course/${course.slug}`);
      }
    } catch {
      navigate(`/course/${course.slug}`);
    }
  };

  const getBeeTheme = (str: string) => {
    const themes = [
      { grad: "from-amber-400 via-orange-500 to-yellow-600", bg: "bg-amber-400", light: "bg-amber-50" },
      { grad: "from-blue-500 via-indigo-600 to-violet-700", bg: "bg-blue-600", light: "bg-blue-50" },
      { grad: "from-emerald-400 via-teal-500 to-cyan-600", bg: "bg-emerald-500", light: "bg-emerald-50" },
      { grad: "from-fuchsia-500 via-purple-600 to-indigo-700", bg: "bg-fuchsia-600", light: "bg-fuchsia-50" }
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return themes[Math.abs(hash) % themes.length];
  };

  const theme = getBeeTheme(course.title);

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -10 }}
      className="group relative cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all duration-500 h-full flex flex-col">

        {/* THUMBNAIL AREA */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${theme.grad} flex items-center justify-center`}>
              <BookOpen className="w-16 h-16 text-white/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

          {/* Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
              <PlayCircle className="w-8 h-8 fill-blue-600/10" />
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1">
            <h4 className="text-[17px] font-black leading-snug text-slate-900 dark:text-white line-clamp-2 min-h-[2.8rem] mb-3 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h4>

            {/* PROGRESS BAR */}
            {(() => {
              const hasProgress = !isAdmin &&
                (course.showProgress === true || (course as any).show_progress === true) &&
                course.progressPercentage !== undefined &&
                course.progressPercentage !== null;
              if (!hasProgress) return null;
              const pct = course.progressPercentage as number;
              return (
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Tiến độ
                    </span>
                    <span className={`text-[10px] font-black ${pct >= 100 ? 'text-emerald-500' : 'text-blue-600 dark:text-blue-400'}`}>
                      {pct >= 100 ? '✓ Hoàn thành' : `${Math.round(pct)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] ${pct >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden ring-2 ring-blue-500/10 shadow-sm border border-white">
                <img src={defaultAvatar} className="w-full h-full object-cover" alt="Inst" />
              </div>
              <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {course.instructorName || "Sơn Đặng"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {(isAdmin || course.showStudentCount === true || (course as any).show_student_count === true) && (
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 px-1.5 py-1 rounded-md border border-slate-100 dark:border-slate-800/50 whitespace-nowrap">
                  <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] font-black tracking-tight">
                    {course.enrolledCount || 0}/{course.capacity || "100"}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
