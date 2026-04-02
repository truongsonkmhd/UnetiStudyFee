import React from "react";
import { Users, Clock, PlayCircle, BookOpen, ChevronRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { useNavigate } from "react-router-dom";
import courseEnrollmentService from "@/services/courseEnrollmentService";
import defaultAvatar from "@/assets/img/avatar-default.png";

const CourseCard: React.FC<{ course: CourseCardResponse }> = ({ course }) => {
  const navigate = useNavigate();

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

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-blue-500/10 shadow-sm border border-white">
                <img src={defaultAvatar} className="w-full h-full object-cover" alt="Inst" />
              </div>
              <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                {course.instructorName || "Sơn Đặng"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/50">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[13px] font-black tracking-tight">
                {course.enrolledCount || 0} / {course.capacity || "Null"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <Clock className="w-4 h-4 fill-slate-400/10" />
              <span className="text-[13px] font-bold tracking-tight">
                {course.totalModules * 2}h 30p
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
