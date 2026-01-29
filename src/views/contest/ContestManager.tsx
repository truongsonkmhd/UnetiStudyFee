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
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import codingExerciseTemplateService from '@/services/codingExerciseTemplateService';
import quizTemplateService from '@/services/quizTemplateService';
import contestLessonService from '@/services/contestLessonService';
import { toast } from 'sonner';
import { Difficulty } from '@/model/coding-template/Difficulty';
import { Loader2 } from 'lucide-react';
import { TemplateCard } from '@/model/coding-template/TemplateCard';
import { QuizTemplateDetail } from '@/model/quiz-template/QuizTemplateDetail';

// APIs are integrated, no need for mock generators here anymore.

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
const CodingExerciseManager = () => {
  const [view, setView] = useState<'classes' | 'library_coding' | 'library_quiz' | 'create-class' | 'manage-contest'>('classes');
  const [selectedContest, setSelectedContest] = useState<any>(null);

  const [exercises, setExercises] = useState<TemplateCard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizTemplateDetail[]>([]);
  const [classes, setClasses] = useState<any[]>([]); // Contest Templates (ContestLesson)
  const [isLoading, setIsLoading] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');

  const [filters, setFilters] = useState({ difficulty: '', category: '', language: '' });
  const [quizFilters, setQuizFilters] = useState({ isActive: '' });

  const navigate = useNavigate();

  const [newClass, setNewClass] = useState({
    contestLessonId: '', // Added for edit mode
    title: '',
    description: '',
    durationMinutes: 60,
    passingScore: 70,
    maxAttempts: 3,
    totalPoints: 100,
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
    // Open in a new tab or modal - for now navigate
    navigate(`${PATHS.CODING_EXERCISE_LIBRARY}/${id}`);
  };

  const handleEditContest = async (contestId: string) => {
    try {
      setIsLoading(true);
      const contest = await contestLessonService.getById(contestId);

      // Pre-fill form
      setNewClass({
        contestLessonId: contest.contestLessonId,
        title: contest.title,
        description: contest.description,
        durationMinutes: contest.defaultDurationMinutes || 60,
        passingScore: contest.passingScore || 70,
        maxAttempts: contest.defaultMaxAttempts || 3,
        totalPoints: contest.totalPoints || 100,
      });

      // We need to fetch the IDs of templates assigned to this contest
      // Assuming the contest object returns them, or we might need another API call
      // For now, let's assume they might be in the contest object or we just allow editing basic info
      // In a real app, we'd fetch assigned IDs here.

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
    <div className="flex border-b mb-6">
      <button
        onClick={() => setView('library_coding')}
        className={`px-6 py-3 font-medium transition-colors ${view === 'library_coding'
          ? 'border-b-2 border-blue-600 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
      >
        Bài tập lập trình
      </button>
      <button
        onClick={() => setView('library_quiz')}
        className={`px-6 py-3 font-medium transition-colors ${view === 'library_quiz'
          ? 'border-b-2 border-blue-600 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
      >
        Bài kiểm tra (Quiz)
      </button>
    </div>
  );

  const CodingLibraryView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thư viện Bài tập Lập trình</h1>
          <p className="text-gray-600 mt-1">Chọn các bài tập code để thêm vào bài thi</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateNewExercise}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
          >
            <Plus size={18} />
            Thêm bài tập mới
          </button>

          <button
            onClick={toggleSelectAllExercises}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            {selectedExercises.size === filteredExercises.length && filteredExercises.length > 0
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả'}
          </button>

          <button
            onClick={() => setView('create-class')}
            disabled={selectedExercises.size + selectedQuizzes.size === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition min-w-[160px] ${selectedExercises.size + selectedQuizzes.size > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Plus size={18} />
            Tiếp tục ({selectedExercises.size + selectedQuizzes.size})
          </button>
        </div>
      </div>

      <LibraryTabs />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => (
          <div
            key={ex.templateId}
            className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md group relative ${selectedExercises.has(ex.templateId)
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExerciseSelection(ex.templateId);
                }}
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${selectedExercises.has(ex.templateId)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 group-hover:border-gray-400'
                  }`}
              >
                {selectedExercises.has(ex.templateId) && <Check size={14} />}
              </button>
            </div>

            <div
              onClick={() => toggleExerciseSelection(ex.templateId)}
              className="cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900 line-clamp-2 pr-10 mb-3">{ex.title}</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded text-xs font-medium ${getDifficultyColor(ex.difficulty)}`}>
                  {ex.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {ex.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <Code size={16} />
                  <span>{ex.programmingLanguage}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={16} />
                  <span>{ex.points} pts</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium
                          text-green-600 hover:bg-green-50 rounded border border-green-200 transition"
              >
                <Eye size={14} />
                Xem
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition"
              >
                <Edit size={14} />
                Sửa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExercise(ex.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200 transition"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 text-gray-500">Không tìm thấy bài tập nào phù hợp</div>
      )}

    </div>
  );

  const QuizLibraryView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thư viện quiz</h1>
          <p className="text-gray-600 mt-1">Chọn các bài kiểm tra trắc nghiệm</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateNewQuiz}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
          >
            <Plus size={18} />
            Thêm quiz mới
          </button>

          <button
            onClick={toggleSelectAllQuizzes}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            {selectedQuizzes.size === filteredQuizzes.length && filteredQuizzes.length > 0
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả'}
          </button>

          <button
            onClick={() => setView('create-class')}
            disabled={selectedExercises.size + selectedQuizzes.size === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition min-w-[160px] ${selectedExercises.size + selectedQuizzes.size > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Plus size={18} />
            Tiếp tục ({selectedExercises.size + selectedQuizzes.size})
          </button>
        </div>
      </div>

      <LibraryTabs />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.templateId}
            className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md group relative ${selectedQuizzes.has(quiz.templateId)
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleQuizSelection(quiz.templateId);
                }}
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${selectedQuizzes.has(quiz.templateId)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 group-hover:border-gray-400'
                  }`}
              >
                {selectedQuizzes.has(quiz.templateId) && <Check size={14} />}
              </button>
            </div>

            <div
              onClick={() => toggleQuizSelection(quiz.templateId)}
              className="cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900 line-clamp-2 pr-10 mb-2">{quiz.templateName}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${quiz.isActive ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                    }`}
                >
                  {quiz.isActive ? 'Hoạt động' : 'Nháp'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={16} />
                  <span>{quiz.totalQuestions} câu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={16} />
                  <span>{quiz.passScore}% đạt</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium
                          text-green-600 hover:bg-green-50 rounded border border-green-200 transition"
              >
                <Eye size={14} />
                Xem
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition"
              >
                <Edit size={14} />
                Sửa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuiz(quiz.templateId);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200 transition"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 text-gray-500">Không tìm thấy quiz nào phù hợp</div>
      )}
    </div>
  );

  const ClassesView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 z-0 opacity-50" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bài thi của tôi</h1>
          <p className="text-gray-500 mt-2 max-w-lg text-lg">
            Hệ thống quản lý bài kiểm tra và bài tập lập trình tập trung.
            Thiết kế, triển khai và theo dõi kết quả của sinh viên.
          </p>
        </div>
        <div className="relative z-10">
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
              });
              setSelectedExercises(new Set());
              setSelectedQuizzes(new Set());
              setView('library_coding');
            }}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
            Tạo bài thi mới
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {classes.map((cls) => (
            <div
              key={cls.contestLessonId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border-b-4 border-b-transparent hover:border-b-blue-500 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(cls.status)}`}>
                    {cls.status}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContest(cls.contestLessonId);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContest(cls.contestLessonId);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{cls.title}</h3>
                <p className="text-gray-500 mt-2 text-sm line-clamp-2 h-10">{cls.description || 'Không có mô tả cho bài thi này.'}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Nội dung</p>
                      <p className="text-sm font-bold text-gray-900">{(cls.codingExerciseCount || 0) + (cls.quizQuestionCount || 0)} mục</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Thời gian</p>
                      <p className="text-sm font-bold text-gray-900">{cls.defaultDurationMinutes || cls.durationMinutes || 60}p</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Cập nhật: {new Date(cls.updatedAt || Date.now()).toLocaleDateString('vi-VN')}
                </span>
                <button
                  onClick={() => handleManageContest(cls.contestLessonId)}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm"
                >
                  Chi tiết
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Trophy size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Chưa có bài thi nào</h3>
              <p className="text-gray-500 mt-2 max-w-md">Bắt đầu bằng cách chọn các bài tập từ thư viện để tạo bài thi đầu tiên của bạn.</p>
              <button
                onClick={() => setView('library_coding')}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Tạo bài thi đầu tiên
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );


  const CreateClassView = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setView('library_coding')}
          className="p-3 hover:bg-white bg-white/50 border border-gray-200 rounded-2xl transition-all shadow-sm group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform text-gray-500" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {newClass.contestLessonId ? 'Chỉnh sửa bài thi' : 'Thiết lập bài thi mới'}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Hoàn tất cấu hình và xuất bản nội dung của bạn</p>
        </div>
      </div>


      <div className="bg-white rounded-xl border shadow-sm p-6 sm:p-8 space-y-10">
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin bài thi</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên bài thi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newClass.title}
                onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                placeholder="Ví dụ: Kiểm tra Giữa kỳ - Cấu trúc dữ liệu & Giải thuật"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <textarea
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về mục tiêu, phạm vi kiến thức..."
                rows={3}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Thời gian làm bài (phút) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newClass.durationMinutes}
                  onChange={(e) => setNewClass({ ...newClass, durationMinutes: Number(e.target.value) || 60 })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Điểm đạt (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newClass.passingScore}
                  onChange={(e) => setNewClass({ ...newClass, passingScore: Number(e.target.value) || 70 })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lần làm bài tối đa</label>
                <input
                  type="number"
                  value={newClass.maxAttempts}
                  onChange={(e) => setNewClass({ ...newClass, maxAttempts: Number(e.target.value) || 3 })}
                  min={1}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tổng điểm</label>
                <input
                  type="number"
                  value={newClass.totalPoints}
                  onChange={(e) => setNewClass({ ...newClass, totalPoints: Number(e.target.value) || 100 })}
                  min={1}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 pt-8 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Nội dung đã chọn</h2>
            <span className="text-sm text-gray-600 font-medium">
              {selectedExercises.size} bài code + {selectedQuizzes.size} quiz
            </span>
          </div>

          {selectedExercises.size + selectedQuizzes.size === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Chưa có bài tập hoặc quiz nào được chọn</p>
              <button
                onClick={() => setView('library_coding')}
                className="text-blue-600 hover:underline font-medium"
              >
                Quay lại chọn nội dung →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises
                .filter((ex) => selectedExercises.has(ex.templateId))
                .map((ex) => (
                  <div
                    key={ex.templateId}
                    className="flex items-center justify-between p-4 bg-blue-50/60 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Code className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{ex.title}</div>
                        <div className="text-sm text-gray-600">
                          {ex.category} • {ex.programmingLanguage} • {ex.difficulty}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExerciseSelection(ex.templateId)}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                    >
                      <X size={18} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                ))}

              {quizzes
                .filter((q) => selectedQuizzes.has(q.templateId))
                .map((q) => (
                  <div
                    key={q.templateId}
                    className="flex items-center justify-between p-4 bg-green-50/60 rounded-lg border border-green-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen className="text-green-600" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{q.templateName}</div>
                        <div className="text-sm text-gray-600">
                          {q.totalQuestions} câu • {q.passScore}% đạt • {q.isActive ? 'Hoạt động' : 'Nháp'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleQuizSelection(q.templateId)}
                      className="p-2 hover:bg-green-100 rounded-lg"
                    >
                      <X size={18} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
          <button
            onClick={() => setView('library_coding')}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium order-2 sm:order-1"
          >
            Quay lại chọn nội dung
          </button>
          <button
            onClick={handleCreateClass}
            disabled={selectedExercises.size + selectedQuizzes.size === 0}
            className={`flex-1 py-3 rounded-lg font-medium text-white transition order-1 sm:order-2 ${selectedExercises.size + selectedQuizzes.size > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Tạo bài thi
          </button>
        </div>
      </div>
    </div>
  );

  const ManageContestView = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('classes')}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition"
        >
          <X size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedContest?.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedContest?.status)}`}>
              {selectedContest?.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1 line-clamp-1">{selectedContest?.description || 'Không có mô tả'}</p>
        </div>
        <div className="flex gap-2">
          {selectedContest?.status === 'DRAFT' && (
            <button
              onClick={() => handlePublishContest(selectedContest.contestLessonId)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm shadow-sm"
            >
              <Check size={18} />
              Xuất bản
            </button>
          )}
          {selectedContest?.status === 'READY' && (
            <button
              onClick={() => handleArchiveContest(selectedContest.contestLessonId)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold text-sm shadow-sm"
            >
              <Archive size={18} />
              Lưu trữ
            </button>
          )}
          <button
            onClick={() => handleDeleteContest(selectedContest.contestLessonId)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 font-semibold text-sm"
          >
            <Trash2 size={18} />
            Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-500" />
              Thông số thiết lập
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium uppercase">Thời gian</p>
                <p className="text-lg font-bold text-gray-900">{selectedContest?.defaultDurationMinutes || selectedContest?.durationMinutes} phút</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium uppercase">Điểm đạt</p>
                <p className="text-lg font-bold text-emerald-600">{selectedContest?.passingScore}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium uppercase">Tối đa lượt làm</p>
                <p className="text-lg font-bold text-blue-600">{selectedContest?.defaultMaxAttempts || selectedContest?.maxAttempts}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium uppercase">Tổng điểm</p>
                <p className="text-lg font-bold text-purple-600">{selectedContest?.totalPoints} pts</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400">Ngày tạo: {new Date(selectedContest?.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400">Cập nhật: {new Date(selectedContest?.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Code size={22} className="text-indigo-600" />
              Nội dung bài tập ({selectedContest?.codingExerciseCount + selectedContest?.quizQuestionCount})
            </h3>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Code className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Bài tập lập trình</h4>
                    <p className="text-sm text-gray-500">{selectedContest?.codingExerciseCount} bài tập đã gán</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  Xem chi tiết
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <BookOpen className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Câu hỏi trắc nghiệm (Quiz)</h4>
                    <p className="text-sm text-gray-500">{selectedContest?.quizQuestionCount} câu hỏi đa lựa chọn</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center gap-6">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <Trophy size={32} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900">Thống kê & Kết quả</h4>
              <p className="text-indigo-700/80 text-sm">Xem chi tiết kết quả làm bài của học sinh và phân tích độ khó.</p>
              <button className="mt-2 text-indigo-600 font-bold text-sm hover:underline">Đi tới Statistics →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !selectedContest && (
          <div className="flex flex-col items-center justify-center py-20 translate-y-20">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium">Đang chuẩn bị dữ liệu quản lý...</p>
          </div>
        )}
        {!isLoading && view === 'classes' && <ClassesView />}
        {view === 'library_coding' && <CodingLibraryView />}
        {view === 'library_quiz' && <QuizLibraryView />}
        {view === 'create-class' && <CreateClassView />}
        {view === 'manage-contest' && <ManageContestView />}
      </div>
    </div>
  );
};

export default CodingExerciseManager;