import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, ChevronDown, ChevronUp, Play, Code, FileQuestion, CheckCircle2, Lock } from 'lucide-react';
import courseService from '@/services/courseService';
import lessonProgressService from '@/services/lessonProgressService';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';
import { ProgressStatus } from '@/model/progress/LessonProgress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PATHS } from '@/constants/paths';
import QuizPlayer from './components/QuizPlayer';

const CourseLearn: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseTreeResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
    const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (slug) {
            fetchCourse(slug);
        }
    }, [slug]);

    useEffect(() => {
        if (course) {
            loadProgress();
        }
    }, [course]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    }, [currentLessonId]);

    const fetchCourse = async (courseSlug: string) => {
        try {
            setLoading(true);
            const data = await courseService.getCourseTreeBySlug(courseSlug);
            setCourse(data);

            try {
                const summary = await lessonProgressService.getCourseSummary(data.courseId);

                if (summary.lastAccessedLessonSlug && summary.lastAccessedModuleSlug) {
                    const targetModule = data.modules.find(m => m.slug === summary.lastAccessedModuleSlug);
                    if (targetModule) {
                        setOpenModules({ [targetModule.moduleId]: true });
                        const targetLesson = targetModule.lessons?.find(l => l.slug === summary.lastAccessedLessonSlug);
                        if (targetLesson) {
                            setCurrentLessonId(targetLesson.lessonId);
                            return;
                        }
                    }
                }
            } catch (progressError) {
                console.log("No previous progress found, starting from beginning");
            }

            if (data.modules && data.modules.length > 0) {
                const firstModule = data.modules[0];
                setOpenModules({ [firstModule.moduleId]: true });

                if (firstModule.lessons && firstModule.lessons.length > 0) {
                    setCurrentLessonId(firstModule.lessons[0].lessonId);
                }
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
            toast.error("Không thể tải khóa học");
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        if (!course) return;

        try {
            const progressList = await lessonProgressService.getCourseProgress(course.courseId);
            const completed = new Set(
                progressList
                    .filter(p => p.status === ProgressStatus.DONE)
                    .map(p => p.lessonId)
            );
            setCompletedLessons(completed);
        } catch (error) {
            console.error("Failed to load progress", error);
        }
    };

    const saveProgress = async (lessonId: string, status: ProgressStatus, watchedPercent: number = 100) => {
        if (!course) return;

        try {
            await lessonProgressService.updateProgress({
                lessonId,
                courseId: course.courseId,
                status,
                watchedPercent,
                timeSpentSec: 0
            });

            if (status === ProgressStatus.DONE) {
                const newCompleted = new Set(completedLessons);
                newCompleted.add(lessonId);
                setCompletedLessons(newCompleted);
                toast.success('Đã hoàn thành bài học!');
            }
        } catch (error) {
            console.error("Failed to save progress", error);
            toast.error("Không thể lưu tiến độ học tập");
        }
    };

    const updateProgressInBackground = async (lessonId: string, watchedPercent: number) => {
        if (!course) return;

        try {
            const status = watchedPercent >= 95
                ? ProgressStatus.DONE
                : watchedPercent > 0
                    ? ProgressStatus.IN_PROGRESS
                    : ProgressStatus.NOT_STARTED;

            await lessonProgressService.updateProgress({
                lessonId,
                courseId: course.courseId,
                status,
                watchedPercent,
                timeSpentSec: 0
            });
        } catch (error) {
            console.error("Failed to update progress in background", error);
        }
    };

    const handleVideoTimeUpdate = () => {
        if (!videoRef.current || !currentLessonId) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        const watchedPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

        if (watchedPercent % 10 === 0 && watchedPercent > 0) {
            updateProgressInBackground(currentLessonId, watchedPercent);
        }

        if (watchedPercent >= 95 && !completedLessons.has(currentLessonId)) {
            saveProgress(currentLessonId, ProgressStatus.DONE, 100);
        }
    };

    const handleVideoSeeking = () => {
        // Restriction removed
    };

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleLessonClick = (lessonId: string) => {
        setActiveQuizId(null);
        const allLessons = getAllLessons();
        const targetIndex = allLessons.findIndex(l => l.lessonId === lessonId);

        if (targetIndex > 0) {
            const previousLesson = allLessons[targetIndex - 1];
            if (!completedLessons.has(previousLesson.lessonId)) {
                toast.error('Vui lòng hoàn thành bài học trước đó!');
                return;
            }
        }

        setCurrentLessonId(lessonId);
    };

    const getCurrentLesson = () => {
        if (!course || !currentLessonId) return null;

        for (const module of course.modules) {
            const lesson = module.lessons?.find(l => l.lessonId === currentLessonId);
            if (lesson) return lesson;
        }
        return null;
    };

    const getAllLessons = () => {
        if (!course) return [];
        return course.modules.flatMap(m => m.lessons || []);
    };

    const canAccessNextLesson = () => {
        if (!currentLessonId) return false;
        return completedLessons.has(currentLessonId);
    };

    const handleNextLesson = () => {
        if (!canAccessNextLesson()) {
            toast.error('Vui lòng hoàn thành bài học hiện tại trước khi chuyển sang bài tiếp theo!');
            return;
        }

        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.lessonId === currentLessonId);
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            setCurrentLessonId(allLessons[currentIndex + 1].lessonId);
        }
    };

    const handlePreviousLesson = () => {
        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.lessonId === currentLessonId);
        if (currentIndex > 0) {
            setCurrentLessonId(allLessons[currentIndex - 1].lessonId);
        }
    };

    const getLessonIcon = (lessonType?: string) => {
        switch (lessonType?.toUpperCase()) {
            case 'VIDEO':
            case 'QUIZ_AND_VIDEO':
            case 'CODE_AND_VIDEO':
                return <Play size={14} className="fill-current" />;
            case 'CODE':
            case 'CODING':
                return <Code size={14} />;
            case 'QUIZ':
                return <FileQuestion size={14} />;
            case 'CODE_AND_QUIZ':
            case 'ALL':
                return <Code size={14} />;
            default:
                return <Play size={14} className="fill-current" />;
        }
    };

    const isLessonLocked = (lessonId: string) => {
        const allLessons = getAllLessons();
        const lessonIndex = allLessons.findIndex(l => l.lessonId === lessonId);
        if (lessonIndex === 0) return false;
        const previousLesson = allLessons[lessonIndex - 1];
        return !completedLessons.has(previousLesson.lessonId);
    };

    const renderPracticeSection = () => {
        if (!currentLesson) return null;

        const hasCoding = currentLesson.codingExercises && currentLesson.codingExercises.length > 0;
        const hasQuiz = currentLesson.quizzes && currentLesson.quizzes.length > 0;

        if (!hasCoding && !hasQuiz) return null;

        return (
            <div className="bg-card px-6 py-8 border-t border-border">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-primary" />
                    Thực hành & Bài tập
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hasCoding && currentLesson.codingExercises.map((ex) => (
                        <div
                            key={ex.templateId}
                            onClick={() => navigate(`/templates/${ex.templateId}/view`)}
                            className="bg-muted px-4 py-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Code className="text-primary group-hover:scale-110 transition-transform" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold mb-1 group-hover:text-primary transition-colors">{ex.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">Bài tập lập trình • {ex.difficulty} • {ex.points} điểm</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {hasQuiz && currentLesson.quizzes.map((quiz) => (
                        <div
                            key={quiz.quizId}
                            onClick={() => setActiveQuizId(quiz.quizId)}
                            className="bg-muted px-4 py-3 rounded-xl border border-border hover:border-emerald-500/50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                    <FileQuestion className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold mb-1 group-hover:text-emerald-500 transition-colors">{quiz.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">Trắc nghiệm • {quiz.totalQuestions || 0} câu hỏi</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (!currentLesson) return null;

        if (currentLesson.videoUrl) {
            return (
                <div className="w-full bg-black">
                    <div className="max-w-6xl mx-auto aspect-video bg-black flex items-center justify-center relative">
                        <video
                            ref={videoRef}
                            src={currentLesson.videoUrl}
                            className="h-full w-full object-contain"
                            controls
                            controlsList="nodownload"
                            onTimeUpdate={handleVideoTimeUpdate}
                            onSeeking={handleVideoSeeking}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            Your browser does not support the video tag.
                        </video>
                        {isCurrentCompleted && (
                            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg pointer-events-none">
                                <CheckCircle2 size={20} />
                                <span className="font-semibold">Đã hoàn thành</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    const currentLesson = getCurrentLesson();
    const allLessons = getAllLessons();
    const currentLessonIndex = allLessons.findIndex(l => l.lessonId === currentLessonId);
    const isFirstLesson = currentLessonIndex === 0;
    const isLastLesson = currentLessonIndex === allLessons.length - 1;
    const isCurrentCompleted = currentLessonId ? completedLessons.has(currentLessonId) : false;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải khóa học...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center text-foreground bg-background">
                <div className="text-center">
                    <p className="text-xl text-muted-foreground">Không tìm thấy khóa học</p>
                    <Button onClick={() => navigate('/home')} className="mt-4 bg-primary hover:bg-primary/90">
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card text-foreground px-4 py-3 flex items-center justify-between border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => navigate(PATHS.HOME)}
                        className="hover:bg-muted p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Quay lại"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md text-primary-foreground text-foreground">
                            {course.title.substring(0, 2).toUpperCase()}
                        </div>
                        <h1 className="font-bold text-base lg:text-lg truncate text-foreground">{course.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-sm bg-muted px-3 py-1.5 rounded-full">
                        <span className="text-primary font-bold">{currentLessonIndex + 1}</span>
                        <span className="text-muted-foreground"> / {allLessons.length}</span>
                    </div>
                    <div className="text-sm bg-green-600/20 text-green-400 px-3 py-1.5 rounded-full font-semibold">
                        {completedLessons.size}/{allLessons.length} hoàn thành
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto bg-background">
                    {activeQuizId ? (
                        <div className="p-6 max-w-5xl mx-auto w-full flex-1 flex flex-col">
                            <QuizPlayer
                                quizId={activeQuizId}
                                onBack={() => setActiveQuizId(null)}
                                onComplete={() => { }}
                            />
                        </div>
                    ) : (
                        <>
                            {renderContent()}
                            <div className="bg-card border-b border-border px-6 py-5">
                                <h2 className="text-2xl font-bold text-foreground mb-2">{currentLesson?.title || 'Chưa chọn bài học'}</h2>
                                <p className="text-muted-foreground text-sm">
                                    Cập nhật tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                                </p>
                            </div>

                            <div className="bg-card px-6 py-4 flex justify-between items-center border-b border-border">
                                <Button
                                    onClick={handlePreviousLesson}
                                    disabled={isFirstLesson}
                                    variant="outline"
                                    className="bg-card border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    <ChevronLeft size={16} className="mr-2" />
                                    BÀI TRƯỚC
                                </Button>

                                <div className="text-center hidden md:block">
                                    {!isLastLesson && (
                                        <div className="text-muted-foreground text-sm">
                                            <span className="text-primary font-semibold">Tiếp theo: </span>
                                            <span className="truncate max-w-xs inline-block align-bottom">
                                                {allLessons[currentLessonIndex + 1]?.title}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleNextLesson}
                                    disabled={isLastLesson || !canAccessNextLesson()}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                    title={!canAccessNextLesson() ? "Hoàn thành bài học hiện tại để mở khóa" : ""}
                                >
                                    BÀI TIẾP THEO
                                    <ChevronRight size={16} className="ml-2" />
                                </Button>
                            </div>

                            <div className="bg-card px-6 py-8 flex-1">
                                <h3 className="text-lg font-bold text-foreground mb-4">Nội dung bài học</h3>
                                <div
                                    className="text-muted-foreground leading-relaxed prose prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted"
                                    dangerouslySetInnerHTML={{ __html: currentLesson?.content || '<p class="text-muted-foreground italic">Nội dung bài học đang được cập nhật...</p>' }}
                                />
                            </div>

                            {renderPracticeSection()}
                        </>
                    )}
                </div>

                <aside className="w-80 lg:w-96 bg-card border-l border-border flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-border bg-card/50">
                        <h3 className="font-bold text-foreground text-lg">Nội dung khóa học</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {course.modules.length} chương • {allLessons.length} bài học
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-card">
                        {course.modules.map((module, moduleIndex) => {
                            const moduleLessons = module.lessons || [];
                            const completedCount = moduleLessons.filter(l => completedLessons.has(l.lessonId)).length;

                            return (
                                <div key={module.moduleId} className="border-b border-border/50">
                                    <button
                                        onClick={() => toggleModule(module.moduleId)}
                                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-muted transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                                            <span className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors truncate">
                                                {moduleIndex + 1}. {module.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {completedCount}/{moduleLessons.length}
                                            </span>
                                            {openModules[module.moduleId] ?
                                                <ChevronUp size={16} className="text-muted-foreground group-hover:text-primary transition-colors" /> :
                                                <ChevronDown size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            }
                                        </div>
                                    </button>

                                    {openModules[module.moduleId] && (
                                        <div className="bg-muted/10">
                                            {moduleLessons.map((lesson, lessonIndex) => {
                                                const isActive = lesson.lessonId === currentLessonId;
                                                const isCompleted = completedLessons.has(lesson.lessonId);
                                                const isLocked = isLessonLocked(lesson.lessonId);

                                                const hasVideo = !!lesson.videoUrl;
                                                const hasCode = lesson.codingExercises && lesson.codingExercises.length > 0;
                                                const hasQuiz = lesson.quizzes && lesson.quizzes.length > 0;

                                                let Icon = Play;
                                                let iconColorClass = "text-muted-foreground";
                                                let bgColorClass = "bg-muted";

                                                if (hasVideo) {
                                                    Icon = Play;
                                                    iconColorClass = isActive ? "text-primary-foreground" : "text-primary-foreground";
                                                    bgColorClass = isActive ? "bg-primary shadow-lg shadow-primary/50" : "bg-primary/80 group-hover:bg-primary";
                                                } else if (hasCode) {
                                                    Icon = Code;
                                                    iconColorClass = isActive ? "text-primary-foreground" : "text-primary";
                                                    bgColorClass = isActive ? "bg-primary shadow-lg shadow-primary/50" : "bg-primary/20 group-hover:bg-primary/30";
                                                } else if (hasQuiz) {
                                                    Icon = FileQuestion;
                                                    iconColorClass = isActive ? "text-emerald-500-foreground" : "text-emerald-500";
                                                    bgColorClass = isActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-emerald-500/20 group-hover:bg-emerald-500/30";
                                                } else {
                                                    Icon = Play;
                                                    iconColorClass = isActive ? "text-foreground" : "text-muted-foreground";
                                                    bgColorClass = isActive ? "bg-muted" : "bg-muted group-hover:bg-muted/80";
                                                }

                                                return (
                                                    <div key={lesson.lessonId} className="flex flex-col">
                                                        <button
                                                            key={lesson.lessonId}
                                                            onClick={() => handleLessonClick(lesson.lessonId)}
                                                            disabled={isLocked}
                                                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-all border-l-4 group ${isActive ? 'border-primary bg-muted/40' : 'border-transparent'
                                                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isLocked
                                                                    ? 'bg-muted text-muted-foreground'
                                                                    : isCompleted
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : bgColorClass
                                                                    }`}>
                                                                    {isLocked ? (
                                                                        <Lock size={14} />
                                                                    ) : isCompleted ? (
                                                                        <CheckCircle2 size={14} />
                                                                    ) : (
                                                                        <Icon size={14} className={`${iconColorClass} ${hasVideo ? 'fill-current ml-0.5' : ''}`} />
                                                                    )}
                                                                </div>
                                                                <span className={`text-sm flex-1 truncate text-left transition-colors ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                                                                    }`}>
                                                                    {lessonIndex + 1}. {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <Clock size={12} className="text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">10:00</span>
                                                            </div>
                                                        </button>

                                                        {isActive && !isLocked && (
                                                            <div className="flex flex-col pl-14 pr-4 py-1 gap-1 animate-in slide-in-from-top-1 duration-200">
                                                                {hasCode && lesson.codingExercises.map((ex) => (
                                                                    <button
                                                                        key={ex.templateId}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/templates/${ex.templateId}/view`);
                                                                        }}
                                                                        className="flex items-center gap-2 py-2 px-3 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-all border border-transparent hover:border-primary/20 group/sub"
                                                                    >
                                                                        <Code size={12} className="group-hover/sub:scale-110 transition-transform" />
                                                                        <span className="truncate">Bài tập: {ex.title}</span>
                                                                    </button>
                                                                ))}

                                                                {hasQuiz && lesson.quizzes.map((quiz) => (
                                                                    <button
                                                                        key={quiz.quizId}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveQuizId(quiz.quizId);
                                                                        }}
                                                                        className="flex items-center gap-2 py-2 px-3 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all border border-transparent hover:border-emerald-500/20 group/sub"
                                                                    >
                                                                        <FileQuestion size={12} className="group-hover/sub:scale-110 transition-transform" />
                                                                        <span className="truncate">Quiz: {quiz.title}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CourseLearn;
