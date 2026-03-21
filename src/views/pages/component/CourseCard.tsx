import React from "react";
import { Users, Clock, PlayCircle, BookOpen, Star, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { useNavigate } from "react-router-dom";
import courseEnrollmentService from "@/services/courseEnrollmentService";

const CourseCard: React.FC<{ course: CourseCardResponse }> = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const status = await courseEnrollmentService.getEnrollmentStatus(
        course.courseId
      );

      if (status?.status === "APPROVED") {
        navigate(`/course/${course.slug}/learn`);
      } else {
        navigate(`/course/${course.slug}`);
      }
    } catch {
      navigate(`/course/${course.slug}`);
    }
  };

  // Bee / Honey / Nature inspired vibrancy
  const getBeeTheme = (str: string) => {
    const themes = [
      {
        grad: "from-amber-400 via-orange-500 to-yellow-600",
        glow: "shadow-amber-500/20",
        text: "text-amber-400",
        bg: "bg-amber-400"
      },
      {
        grad: "from-blue-500 via-indigo-600 to-violet-700",
        glow: "shadow-blue-500/20",
        text: "text-blue-400",
        bg: "bg-blue-600"
      },
      {
        grad: "from-emerald-400 via-teal-500 to-cyan-600",
        glow: "shadow-emerald-500/20",
        text: "text-emerald-400",
        bg: "bg-emerald-500"
      },
      {
        grad: "from-fuchsia-500 via-purple-600 to-indigo-700",
        glow: "shadow-fuchsia-500/20",
        text: "text-fuchsia-400",
        bg: "bg-fuchsia-600"
      }
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return themes[Math.abs(hash) % themes.length];
  };

  const theme = getBeeTheme(course.title);

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -15 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="group relative"
    >
      {/* Dynamic Animated Peripheral Glow */}
      <div className={`absolute -inset-2 bg-gradient-to-br ${theme.grad} rounded-[2.8rem] opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-700`} />

      <div className="relative overflow-hidden rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-border/50 hover:border-blue-500/30 transition-all duration-500 shadow-2xl">

        {/* THUMBNAIL AREA */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${theme.grad} flex items-center justify-center`}>
              <BookOpen className="w-20 h-20 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='35' viewBox='0 0 20 35' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 17.5L10 0L20 17.5L10 35L0 17.5Z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="relative">
              <div className={`absolute -inset-4 bg-white/20 blur-xl rounded-full animate-pulse`} />
              <button className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-transform">
                <PlayCircle className="w-8 h-8 fill-current" />
              </button>
            </div>
          </div>

          {course.totalModules > 0 && (
            <div className={`absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 ${theme.bg} rounded-2xl shadow-2xl`}>
              <Clock className="w-4 h-4 text-white" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">{course.totalModules} Chương</span>
            </div>
          )}
        </div>

        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="space-y-2">
            <h4 className="text-[19px] font-black leading-tight text-foreground group-hover:text-blue-500 transition-colors line-clamp-2 min-h-[3rem]">
              {course.title}
            </h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center shadow-lg overflow-hidden`}>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center z-10 text-[9px] font-black text-muted-foreground">
                  +1k
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-muted-foreground uppercase tracking-tighter">Cộng đồng</span>
                <span className="text-[15px] font-bold text-foreground/80">Người tham gia</span>
              </div>
            </div>

            <div className={`w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:rotate-12`}>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
