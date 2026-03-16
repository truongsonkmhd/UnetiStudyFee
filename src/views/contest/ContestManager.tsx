import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Code,
  Trophy,
  Users,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Archive,
  Clock,
  Calendar,
  Zap,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import quizTemplateService from '@/services/quizTemplateService';
import contestLessonService from '@/services/contestLessonService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TemplateCard } from '@/model/coding-template/TemplateCard';
import { QuizTemplateDetail } from '@/model/quiz-template/QuizTemplateDetail';

const ContestManager = () => {
  const [view, setView] = useState<'classes' | 'library_coding' | 'library_quiz' | 'create-class' | 'manage-contest'>('classes');
  const [selectedContest, setSelectedContest] = useState<any>(null);

  const [exercises, setExercises] = useState<TemplateCard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizTemplateDetail[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');

  const [filters, setFilters] = useState({ difficulty: '', category: '', language: '' });
  const [quizFilters, setQuizFilters] = useState({ isActive: '' });

  const navigate = useNavigate();

  const [newClass, setNewClass] = useState({
    contestLessonId: '',
    title: '',
    description: '',
    durationMinutes: 60,
    passingScore: 70,
    maxAttempts: 3,
    totalPoints: 100,
    showLeaderboardDefault: true,
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [exRes, qRes, clRes] = await Promise.all([
        codingExerciseTemplateService.searchAllTemplates({ page: 0, size: 100 }),
        quizTemplateService.searchTemplates({ page: 0, size: 100 }),
        contestLessonService.search({ page: 0, size: 100 })
      ]);

      setExercises(exRes.items);
      setQuizzes(qRes.items);
      setClasses(clRes.items);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExerciseSelection = (id: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleQuizSelection = (id: string) => {
    setSelectedQuizzes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEditExercise = (id: string) => {
    navigate(`${PATHS.CODING_EXERCISE_LIBRARY}/${id}`);
  };

  const handleViewExercise = (id: string) => {
    navigate(`${PATHS.CODING_EXERCISE_LIBRARY}/${id}`);
  };

  const handleEditContest = async (contestId: string) => {
    try {
      setIsLoading(true);
      const contest = await contestLessonService.getById(contestId);

      setNewClass({
        contestLessonId: contest.contestLessonId,
        title: contest.title,
        description: contest.description,
        durationMinutes: contest.defaultDurationMinutes || 60,
        passingScore: contest.passingScore || 70,
        maxAttempts: contest.defaultMaxAttempts || 3,
        totalPoints: contest.totalPoints || 100,
        showLeaderboardDefault: contest.showLeaderboardDefault !== undefined ? contest.showLeaderboardDefault : true,
      })

      setView('create-class');
    } catch (error) {
      toast.error('Không thể tải thông tin để chỉnh sửa');
    } finally {
      setIsLoading(false);
    }
  };



  const handleManageContest = async (contestId: string) => {
    try {
      setIsLoading(true);
      const contest = await contestLessonService.getById(contestId);
      setSelectedContest(contest);
      setView('manage-contest');
    } catch (error) {
      toast.error('Không thể tải thông tin bài thi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (contestId: string, status: string) => {
    try {
      setIsLoading(true);
      await contestLessonService.updateStatus(contestId, status as any);
      toast.success('Cập nhật trạng thái thành công');
      const updated = await contestLessonService.getById(contestId);
      setSelectedContest(updated);
      fetchData();
    } catch (error) {
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishContest = async (contestId: string) => {
    try {
      setIsLoading(true);
      await contestLessonService.publish(contestId);
      toast.success('Xuất bản bài thi thành công');
      const updated = await contestLessonService.getById(contestId);
      setSelectedContest(updated);
      fetchData();
    } catch (error) {
      toast.error('Xuất bản thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveContest = async (contestId: string) => {
    try {
      setIsLoading(true);
      await contestLessonService.archive(contestId);
      toast.success('Lưu trữ bài thi thành công');
      const updated = await contestLessonService.getById(contestId);
      setSelectedContest(updated);
      fetchData();
    } catch (error) {
      toast.error('Lưu trữ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài thi này?')) return;
    try {
      setIsLoading(true);
      await contestLessonService.delete(contestId);
      toast.success('Xóa bài thi thành công');
      setView('classes');
      fetchData();
    } catch (error) {
      toast.error('Xóa bài thi thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa bài tập này?`)) return;
    try {
      toast.info('Tính năng xóa mẫu bài tập đang được phát triển');
    } catch (error) {
      toast.error('Xóa bài tập thất bại');
    }
  };

  const handleViewQuiz = (quizId: string) => {
    // navigate(`/quizzes/${quizId}`);
  };

  const handleEditQuiz = (id: string) => {
    navigate(`${PATHS.QUIZ_LIBRARY}/${id}`);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa quiz này?`)) return;
    try {
      await quizTemplateService.deleteTemplate(id);
      toast.success('Xóa quiz thành công');
      setQuizzes((prev) => prev.filter((q) => q.templateId !== id));
      setSelectedQuizzes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      toast.error('Xóa quiz thất bại');
    }
  };

  const toggleSelectAllExercises = () => {
    if (selectedExercises.size === filteredExercises.length) {
      setSelectedExercises(new Set());
    } else {
      const allIds = new Set(filteredExercises.map((ex) => ex.templateId));
      setSelectedExercises(allIds);
    }
  };

  const toggleSelectAllQuizzes = () => {
    if (selectedQuizzes.size === filteredQuizzes.length) {
      setSelectedQuizzes(new Set());
    } else {
      const allIds = new Set(filteredQuizzes.map((q) => q.templateId));
      setSelectedQuizzes(allIds);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !filters.difficulty || ex.difficulty === filters.difficulty;
    const matchesCategory = !filters.category || ex.category === filters.category;
    const matchesLanguage = !filters.language || ex.programmingLanguage === filters.language;
    return matchesSearch && matchesDifficulty && matchesCategory && matchesLanguage;
  });

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.templateName.toLowerCase().includes(quizSearchQuery.toLowerCase());
    const matchesActive =
      !quizFilters.isActive ||
      (quizFilters.isActive === 'true' ? quiz.isActive : !quiz.isActive);
    return matchesSearch && matchesActive;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HARD': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'text-green-600 bg-green-50';
      case 'DRAFT': return 'text-gray-600 bg-gray-50';
      case 'ARCHIVED': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.title) {
      toast.error('Vui lòng nhập tên bài thi');
      return;
    }

    try {
      setIsLoading(true);
      const isEdit = !!newClass.contestLessonId;

      const payload = {
        title: newClass.title,
        description: newClass.description,
        defaultDurationMinutes: newClass.durationMinutes,
        passingScore: newClass.passingScore,
        defaultMaxAttempts: newClass.maxAttempts,
        totalPoints: newClass.totalPoints,
        showLeaderboardDefault: newClass.showLeaderboardDefault,
        exerciseTemplateIds: Array.from(selectedExercises),
        quizTemplateIds: Array.from(selectedQuizzes),
      };

      if (isEdit) {
        await contestLessonService.update(newClass.contestLessonId, payload as any);
        toast.success('Cập nhật bài thi thành công');
      } else {
        await contestLessonService.create(payload as any);
        toast.success('Tạo bài thi thành công');
      }

      setNewClass({
        contestLessonId: '',
        title: '',
        description: '',
        durationMinutes: 60,
        passingScore: 70,
        maxAttempts: 3,
        totalPoints: 100,
        showLeaderboardDefault: true,
      });
      setSelectedExercises(new Set());
      setSelectedQuizzes(new Set());
      setView('classes');
      fetchData();
    } catch (error) {
      toast.error(newClass.contestLessonId ? 'Cập nhật thất bại' : 'Tạo bài thi thất bại');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateNewExercise = () => {
    navigate(PATHS.CODING_EXERCISE_LIBRARY);
  };

  const handleCreateNewQuiz = () => {
    navigate(PATHS.QUIZ_LIBRARY);
  };

  const LibraryTabs = () => (
    <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-inner">
      <button
        onClick={() => setView('library_coding')}
        className={`px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${view === 'library_coding'
          ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg shadow-indigo-500/10'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
          }`}
      >
        Thử thách Code
      </button>
      <button
        onClick={() => setView('library_quiz')}
        className={`px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${view === 'library_quiz'
          ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg shadow-indigo-500/10'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
          }`}
      >
        Hệ thống Quiz
      </button>
    </div>
  );

  const FilterBar = ({ type }: { type: 'coding' | 'quiz' }) => (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 group w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <input
          type="text"
          placeholder={type === 'coding' ? "Tìm kiếm thử thách lập trình..." : "Tìm kiếm bộ câu hỏi trắc nghiệm..."}
          value={type === 'coding' ? searchQuery : quizSearchQuery}
          onChange={(e) => type === 'coding' ? setSearchQuery(e.target.value) : setQuizSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all shadow-sm"
        />
      </div>

      {type === 'coding' && (
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[13px] uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="">Độ khó</option>
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[13px] uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="">Ngôn ngữ</option>
            <option value="JAVA">Java</option>
            <option value="PYTHON">Python</option>
            <option value="CPP">C++</option>
          </select>
        </div>
      )}
    </div>
  );

  const CodingLibraryView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Lựa chọn Bài tập Lập trình
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Code size={16} />
            Chọn các bài tập lập trình mẫu từ thư viện để đưa vào bài thi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewExercise}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            Tạo bài mới
          </button>
          <button
            onClick={() => setView('create-class')}
            disabled={selectedExercises.size + selectedQuizzes.size === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm font-medium disabled:opacity-50"
          >
            Xác nhận lựa chọn ({selectedExercises.size + selectedQuizzes.size})
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <LibraryTabs />
        <div className="flex-1 max-w-2xl">
          <FilterBar type="coding" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExercises.map((ex) => (
          <div
            key={ex.templateId}
            onClick={() => toggleExerciseSelection(ex.templateId)}
            className={`group bg-white dark:bg-slate-900 rounded-[2rem] border-2 p-8 transition-all duration-500 cursor-pointer relative flex flex-col ${selectedExercises.has(ex.templateId)
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
              : 'border-transparent shadow-sm hover:shadow-xl hover:translate-y-[-4px] hover:border-slate-100 dark:hover:border-slate-800'
              }`}
          >
            {/* Selection Indicator */}
            <div className="absolute top-6 right-6 z-10">
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${selectedExercises.has(ex.templateId)
                ? 'bg-indigo-600 border-indigo-600 text-white scale-110 rotate-0'
                : 'bg-white/50 border-slate-200 group-hover:border-indigo-300 rotate-12 group-hover:rotate-0'
                }`}>
                {selectedExercises.has(ex.templateId) ? <Check size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>}
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-widest ${getDifficultyColor(ex.difficulty)}`}>
                  {ex.difficulty}
                </span>
                <span className="px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {ex.category}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 pr-12 mb-6 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {ex.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-tighter">
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Code size={14} className="text-indigo-500" />
                  </div>
                  {ex.programmingLanguage}
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-tighter">
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Trophy size={14} className="text-orange-400" />
                  </div>
                  {ex.points} PTS
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-6 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black
                          text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 transition-all uppercase tracking-widest"
              >
                <Eye size={14} strokeWidth={3} />
                XEM
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 transition-all uppercase tracking-widest"
              >
                <Edit size={14} strokeWidth={3} />
                SỬA
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 transition-all uppercase tracking-widest"
              >
                <Trash2 size={14} strokeWidth={3} />
                XÓA
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-2xl mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Dữ liệu trống</h3>
          <p className="text-slate-400 font-medium text-sm mt-1">Không tìm thấy thực thể phù hợp với tiêu chí của bạn.</p>
        </div>
      )}
    </div>
  );

  const QuizLibraryView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Lựa chọn Câu hỏi Trắc nghiệm
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <BookOpen size={16} />
            Chọn các mẫu trắc nghiệm từ thư viện để đưa vào kỳ thi của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewQuiz}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border text-foreground hover:bg-muted rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            Kiến tạo Quiz
          </button>
          <button
            onClick={() => setView('create-class')}
            disabled={selectedExercises.size + selectedQuizzes.size === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm font-medium disabled:opacity-50"
          >
            Xác nhận lựa chọn ({selectedExercises.size + selectedQuizzes.size})
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <LibraryTabs />
        <div className="flex-1 max-w-2xl">
          <FilterBar type="quiz" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.templateId}
            onClick={() => toggleQuizSelection(quiz.templateId)}
            className={`group bg-white dark:bg-slate-900 rounded-[2rem] border-2 p-8 transition-all duration-500 cursor-pointer relative flex flex-col ${selectedQuizzes.has(quiz.templateId)
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
              : 'border-transparent shadow-sm hover:shadow-xl hover:translate-y-[-4px] hover:border-slate-100 dark:hover:border-slate-800'
              }`}
          >
            {/* Selection Indicator */}
            <div className="absolute top-6 right-6 z-10">
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${selectedQuizzes.has(quiz.templateId)
                ? 'bg-indigo-600 border-indigo-600 text-white scale-110 rotate-0'
                : 'bg-white/50 border-slate-200 group-hover:border-indigo-300 rotate-12 group-hover:rotate-0'
                }`}>
                {selectedQuizzes.has(quiz.templateId) ? <Check size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>}
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-widest ${quiz.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                    }`}
                >
                  {quiz.isActive ? 'HOẠT ĐỘNG' : 'BẢN NHÁP'}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 pr-12 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {quiz.templateName}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 h-10 mb-8 leading-relaxed">
                {quiz.description || 'Hệ thống câu hỏi trắc nghiệm đa chuyên đề nhằm củng cố kiến thức nền tảng.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-indigo-100">
                  <BookOpen size={16} className="text-indigo-500 mb-1" />
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Số câu</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{quiz.totalQuestions}</p>
                </div>
                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-emerald-100">
                  <Trophy size={16} className="text-emerald-500 mb-1" />
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Đạt mức</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{quiz.passScore}%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-6 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black
                          text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 transition-all uppercase tracking-widest"
              >
                <Eye size={14} strokeWidth={3} />
                XEM
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 transition-all uppercase tracking-widest"
              >
                <Edit size={14} strokeWidth={3} />
                SỬA
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 transition-all uppercase tracking-widest"
              >
                <Trash2 size={14} strokeWidth={3} />
                XÓA
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-2xl mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Dữ liệu trống</h3>
          <p className="text-slate-400 font-medium text-sm mt-1">Không tìm thấy thực thể phù hợp với tiêu chí của bạn.</p>
        </div>
      )}
    </div>
  );

  const ClassesView = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Quản lý Bài thi
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Trophy size={16} />
            Quản lý các kỳ thi của bạn
          </p>
        </div>
        <button
          onClick={() => {
            setNewClass({
              contestLessonId: '',
              title: '',
              description: '',
              durationMinutes: 60,
              passingScore: 70,
              maxAttempts: 3,
              totalPoints: 100,
              showLeaderboardDefault: true,
            });
            setSelectedExercises(new Set());
            setSelectedQuizzes(new Set());
            setView('library_coding');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Thiết lập bài thi mới
        </button>
      </motion.div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {classes.map((cls) => (
            <div
              key={cls.contestLessonId}
              className="bg-card rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group flex flex-col"
            >
              <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(cls.status)}`}>
                    {cls.status}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContest(cls.contestLessonId);
                      }}
                      className="p-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-all shadow-sm"
                      title="Chỉnh sửa"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContest(cls.contestLessonId);
                      }}
                      className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm"
                      title="Xóa"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2 uppercase tracking-tight">
                  {cls.title}
                </h3>
                <p className="text-muted-foreground text-sm font-medium line-clamp-2 h-10 mb-8 leading-relaxed">
                  {cls.description || 'Hệ thống bài tập đánh giá năng lực lập trình và tư duy thuật toán nâng cao.'}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 bg-muted/30 p-4 rounded-2xl border border-border transition-colors group-hover:border-primary/20">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <BookOpen size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Nội dung</p>
                    <p className="text-lg font-black text-foreground">
                      {(cls.codingExerciseCount || 0) + (cls.quizQuestionCount || 0)} <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Bài</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 bg-muted/30 p-4 rounded-2xl border border-border transition-colors group-hover:border-primary/20">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
                      <Clock size={18} />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Thời gian</p>
                    <p className="text-lg font-black text-foreground">
                      {cls.defaultDurationMinutes || cls.durationMinutes || 60}<span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter"> PHÚT</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-muted/30 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(cls.updatedAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button
                  onClick={() => handleManageContest(cls)}
                  className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
                >
                  Chi tiết
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full py-20">
              <div className="max-w-xl mx-auto text-center space-y-4 bg-muted/10 p-12 rounded-[3rem] border border-dashed border-border">
                <Archive size={48} className="mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="text-xl font-bold text-foreground uppercase">Dữ liệu trống</h3>
                  <p className="text-muted-foreground font-medium">Bạn chưa thiết lập bất kỳ kỳ thi nào.</p>
                </div>
                <button
                  onClick={() => setView('library_coding')}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                >
                  Khởi tạo ngay
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const CreateClassView = () => (
    <div className="max-w-[2000px] mx-auto space-y-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('classes')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {newClass.contestLessonId ? 'Hiệu chỉnh Bài thi' : 'Thiết lập Bài thi Mới'}
            </h1>
          </div>
          <p className="text-muted-foreground font-medium ml-10">
            Cấu hình thời gian, thang điểm và nội dung cho kỳ thi của bạn
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Configuration */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              Bản sắc bài thi
            </h2>

            <div className="space-y-8">
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-indigo-600 transition-colors">
                  Tiêu đề định danh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  placeholder="Ví dụ: Kiểm tra Giữa kỳ - Cấu trúc dữ liệu & Giải thuật"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-900 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả chiến lược</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Lược thuật về phạm vi kiến thức và mục tiêu đánh giá..."
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-900 dark:text-white font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner resize-none"
                />
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Nội dung đã chọn</h3>

                {selectedExercises.size + selectedQuizzes.size === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                      <AlertCircle className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Chưa có dữ liệu hội tụ</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {exercises
                      .filter((ex) => selectedExercises.has(ex.templateId))
                      .map((ex) => (
                        <div key={ex.templateId} className="flex items-center justify-between p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
                              <Code size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{ex.title}</div>
                              <div className="text-[10px] text-indigo-600/60 font-black uppercase tracking-widest">{ex.category} • {ex.difficulty}</div>
                            </div>
                          </div>
                          <button onClick={() => toggleExerciseSelection(ex.templateId)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                            <X size={20} strokeWidth={3} />
                          </button>
                        </div>
                      ))}

                    {quizzes
                      .filter((q) => selectedQuizzes.has(q.templateId))
                      .map((q) => (
                        <div key={q.templateId} className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/30 group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-emerald-600 dark:text-emerald-400">
                              <BookOpen size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{q.templateName}</div>
                              <div className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest">{q.totalQuestions} Questions • {q.passScore}% Master</div>
                            </div>
                          </div>
                          <button onClick={() => toggleQuizSelection(q.templateId)} className="p-2 hover:bg-white dark:hover:bg-slate-800 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                            <X size={20} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Parameters */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 sticky top-32">
            <h2 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-2">
              <Zap size={20} className="fill-indigo-400 text-indigo-400" />
              Chỉ số vận hành
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={newClass.durationMinutes}
                  onChange={(e) => setNewClass({ ...newClass, durationMinutes: Number(e.target.value) || 60 })}
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-xl font-black text-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Điểm đạt chuẩn (%)</label>
                <input
                  type="number"
                  value={newClass.passingScore}
                  onChange={(e) => setNewClass({ ...newClass, passingScore: Number(e.target.value) || 70 })}
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-xl font-black text-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Số lượt thử</label>
                  <input
                    type="number"
                    value={newClass.maxAttempts}
                    onChange={(e) => setNewClass({ ...newClass, maxAttempts: Number(e.target.value) || 3 })}
                    className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-xl font-bold text-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Thang điểm</label>
                  <input
                    type="number"
                    value={newClass.totalPoints}
                    onChange={(e) => setNewClass({ ...newClass, totalPoints: Number(e.target.value) || 100 })}
                    className="w-full px-5 py-3 bg-white/10 border border-white/10 rounded-xl font-bold text-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setNewClass({ ...newClass, showLeaderboardDefault: !newClass.showLeaderboardDefault })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${newClass.showLeaderboardDefault
                    ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-100'
                    : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                >
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">Leaderboard</div>
                    <div className="text-xs font-bold">{newClass.showLeaderboardDefault ? 'Công khai vinh danh' : 'Ẩn danh sách'}</div>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${newClass.showLeaderboardDefault ? 'bg-indigo-400' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-transform ${newClass.showLeaderboardDefault ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </button>
              </div>

              <div className="pt-10 flex flex-col gap-4">
                <button
                  onClick={handleCreateClass}
                  disabled={selectedExercises.size + selectedQuizzes.size === 0}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${selectedExercises.size + selectedQuizzes.size > 0
                    ? 'bg-indigo-500 text-white shadow-indigo-500/40'
                    : 'bg-white/10 text-white/20 cursor-not-allowed'
                    }`}
                >
                  {newClass.contestLessonId ? 'CẬP NHẬT KIẾN TRÚC' : 'XUẤT BẢN BÀI THI'}
                  <Check size={24} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setView('library_coding')}
                  className="w-full py-4 rounded-2xl font-bold text-white/40 hover:text-white transition-colors"
                >
                  Hủy cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ManageContestView = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('classes')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl text-foreground">
              {selectedContest?.title}
            </h1>
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(selectedContest?.status)}`}>
              {selectedContest?.status}
            </span>
          </div>
          <p className="text-muted-foreground font-medium ml-10 line-clamp-1">
            {selectedContest?.description || 'Hệ thống đánh giá chuyên sâu đang trong trạng thái vận hành.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          {selectedContest?.status === 'DRAFT' && (
            <button
              onClick={() => handlePublishContest(selectedContest.contestLessonId)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-all shadow-sm"
            >
              <Check size={18} />
              Xuất bản
            </button>
          )}
          {selectedContest?.status === 'READY' && (
            <button
              onClick={() => handleArchiveContest(selectedContest.contestLessonId)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm transition-all shadow-sm"
            >
              <Archive size={18} />
              Lưu trữ
            </button>
          )}
          <button
            onClick={() => handleDeleteContest(selectedContest?.contestLessonId || '')}
            className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 font-medium text-sm transition-all"
          >
            <Trash2 size={18} />
            Xóa bỏ
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Statistics & Parameters */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

            <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Zap size={20} className="fill-indigo-400 text-indigo-400" />
              Kiến trúc lõi
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-2">Thời lượng vận hành</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{selectedContest?.defaultDurationMinutes || selectedContest?.durationMinutes}</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">PHÚT</span>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-2">Chỉ số đạt chuẩn</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-400">{selectedContest?.passingScore}</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">PHẦN TRĂM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-2">Lượt làm</p>
                  <span className="text-2xl font-black text-blue-400">{selectedContest?.defaultMaxAttempts || selectedContest?.maxAttempts} LẦN</span>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                  <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-2">Hạn mức</p>
                  <span className="text-2xl font-black text-purple-400">{selectedContest?.totalPoints} PTS</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>Khởi tạo hệ thống</span>
                <span className="text-white/60">{new Date(selectedContest?.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>Cập nhật cấu trúc</span>
                <span className="text-white/60">{new Date(selectedContest?.updatedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Structure */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              Cấu trúc nội dung
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="group bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transform group-hover:rotate-6 transition-transform duration-500">
                    <Code size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Thử thách Lập trình</h4>
                    <p className="text-indigo-600/60 font-black uppercase tracking-widest text-xs">
                      {selectedContest?.codingExerciseCount} Bài tập tinh hoa đã được gán
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 border border-indigo-100 dark:border-indigo-900/50">
                  XEM CHI TIẾT
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="group bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-emerald-500/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transform group-hover:-rotate-6 transition-transform duration-500">
                    <BookOpen size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Kiểm tra Trắc nghiệm</h4>
                    <p className="text-emerald-600/60 font-black uppercase tracking-widest text-xs">
                      {selectedContest?.quizQuestionCount} Câu hỏi hội tụ đa mục tiêu
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 border border-emerald-100 dark:border-emerald-900/50">
                  XEM CHI TIẾT
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      {isLoading && !selectedContest && (
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">
            Đang cấu hình dữ liệu quản trị...
          </p>
        </div>
      )}
      {!isLoading && (
        <div className="max-w-[2000px] mx-auto px-6 py-8 space-y-10">
          {view === 'classes' && <ClassesView />}
          {view === 'library_coding' && <CodingLibraryView />}
          {view === 'library_quiz' && <QuizLibraryView />}
          {view === 'create-class' && <CreateClassView />}
          {view === 'manage-contest' && <ManageContestView />}
        </div>
      )}
    </div>
  );
};

export default ContestManager;