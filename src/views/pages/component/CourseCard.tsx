import React, { useState, useEffect } from "react";
import { Clock, Users } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { useNavigate } from "react-router-dom";
import courseEnrollmentService from "@/services/courseEnrollmentService";
import icTeacher from "@/assets/ic/ic_teacher2.png";
import icStudents from "@/assets/ic/ic_students.png";
import icClock from "@/assets/ic/ic_clock.png";

const gradients = [
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-teal-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-amber-400 to-yellow-400",
  "from-orange-400 to-amber-500",
  "from-emerald-400 to-teal-500",
];

const Counter: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue}</span>;
};

const CourseCard: React.FC<{ course: CourseCardResponse }> = ({ course }) => {
  const navigate = useNavigate();

  const gradIndex =
    (course.courseId.charCodeAt(0) +
      course.courseId.charCodeAt(course.courseId.length - 1)) %
    gradients.length;

  const gradient = gradients[gradIndex];

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

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden">
        {course.imageUrl ? (
          <>
            <img
              src={course.imageUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </>
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${gradient}`}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4 gap-3">
        <h4 className="text-lg font-bold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
          {course.title}
        </h4>

        <span className="flex items-center gap-4 text-xs text-muted-foreground">
          <img
            src={icTeacher}
            alt="Teacher"
            className="h-6 w-6 object-contain opacity-70"
          />
          {course.instructorName || "Uneti Teacher"}
        </span>

        <div className="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-4">
            <img
              src={icStudents}
              alt="Students"
              className="h-6 w-6 object-contain opacity-70"
            />
            {course.enrolledCount || 0} học viên
          </span>

          <span className="inline-flex items-center gap-4">
            <img
              src={icClock}
              alt="Clock"
              className="h-6 w-6 object-contain opacity-70"
            />
            {course.totalModules} Chương
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
