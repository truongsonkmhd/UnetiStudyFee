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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';

// ────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────
const generateMockExercises = (count = 12) => {
  const categories = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Sorting'];
  const languages = ['Python', 'Java', 'JavaScript', 'C++'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  return Array.from({ length: count }, (_, i) => ({
    templateId: `ex-${i + 1}`,
    title: `Challenge ${i + 1}: ${['Two Sum', 'Reverse String', 'Longest Substring', 'Binary Search', 'Merge Intervals', 'Valid Parentheses'][i % 6]}`,
    difficulty: difficulties[i % 3],
    category: categories[i % 6],
    programmingLanguage: languages[i % 4],
    points: (i % 3 + 1) * 10,
    usageCount: Math.floor(Math.random() * 500),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
};

const generateMockQuizzes = (count = 8) => {
  return Array.from({ length: count }, (_, i) => ({
    quizId: `quiz-${i + 1}`,
    title: `Quiz ${i + 1}: ${['JavaScript Fundamentals', 'React Basics', 'Data Structures', 'Algorithms', 'OOP Concepts', 'Design Patterns'][i % 6]}`,
    description: 'Test your knowledge with this comprehensive quiz',
    totalQuestions: Math.floor(Math.random() * 10) + 5,
    passScore: 70 + Math.floor(Math.random() * 20),
    isPublished: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
  }));
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
const CodingExerciseManager = () => {
  const [view, setView] = useState<'classes' | 'library_coding' | 'library_quiz' | 'create-class'>('classes');

  const [exercises, setExercises] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');

  const [filters, setFilters] = useState({ difficulty: '', category: '', language: '' });
  const [quizFilters, setQuizFilters] = useState({ isPublished: '' });

  const navigate = useNavigate();
  
  const [classes, setClasses] = useState<any[]>([
    {
      classId: '1',
      className: 'Data Structures & Algorithms 2024',
      description: 'Advanced course covering core algorithms',
      status: 'ACTIVE',
      enrollmentCount: 45,
      maxStudents: 50,
      exerciseCount: 12,
    },
  ]);

  const [newClass, setNewClass] = useState({
    className: '',
    description: '',
    maxStudents: 50,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setExercises(generateMockExercises(18));
    setQuizzes(generateMockQuizzes(12));
  }, []);

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
  console.log(`Edit exercise: ${id}`);
  // TODO: mở modal edit, hoặc chuyển route, v.v.
  alert(`Chỉnh sửa bài tập ${id} (chưa implement)`);
};

 const handleViewExercise = (id: string) => {
  console.log(`View exercise: ${id}`);
  // TODO: mở modal view, hoặc chuyển route, v.v.
  alert(`Xem bài tập ${id} (chưa implement)`);
};


const handleDeleteExercise = (id: string) => {
  if (!window.confirm(`Bạn chắc chắn muốn xóa bài tập ${id}?`)) return;
  console.log(`Delete exercise: ${id}`);
  setExercises((prev) => prev.filter((ex) => ex.templateId !== id));
  setSelectedExercises((prev) => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });
};

const handleViewQuiz = (quizId) => {
  // navigate(`/quizzes/${quizId}`);
};

const handleEditQuiz = (id: string) => {
  console.log(`Edit quiz: ${id}`);
  alert(`Chỉnh sửa quiz ${id} (chưa implement)`);
};

const handleDeleteQuiz = (id: string) => {
  if (!window.confirm(`Bạn chắc chắn muốn xóa quiz ${id}?`)) return;
  console.log(`Delete quiz: ${id}`);
  setQuizzes((prev) => prev.filter((q) => q.quizId !== id));
  setSelectedQuizzes((prev) => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });
};

const toggleSelectAllExercises = () => {
  if (selectedExercises.size === filteredExercises.length) {
    // bỏ chọn hết
    setSelectedExercises(new Set());
  } else {
    // chọn hết các item đang hiển thị (sau filter)
    const allIds = new Set(filteredExercises.map((ex) => ex.templateId));
    setSelectedExercises(allIds);
  }
};

const toggleSelectAllQuizzes = () => {
  if (selectedQuizzes.size === filteredQuizzes.length) {
    setSelectedQuizzes(new Set());
  } else {
    const allIds = new Set(filteredQuizzes.map((q) => q.quizId));
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
    const matchesSearch = quiz.title.toLowerCase().includes(quizSearchQuery.toLowerCase());
    const matchesPublished =
      !quizFilters.isPublished ||
      (quizFilters.isPublished === 'true' ? quiz.isPublished : !quiz.isPublished);
    return matchesSearch && matchesPublished;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':   return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HARD':   return 'text-red-600 bg-red-50';
      default:       return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':    return 'text-green-600 bg-green-50';
      case 'DRAFT':     return 'text-gray-600 bg-gray-50';
      case 'COMPLETED': return 'text-blue-600 bg-blue-50';
      default:          return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateClass = () => {
    if (!newClass.className || !newClass.startDate || !newClass.endDate) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (Tên, Ngày bắt đầu, Ngày kết thúc)');
      return;
    }

    const classData = {
      classId: String(classes.length + 1),
      ...newClass,
      status: 'DRAFT',
      enrollmentCount: 0,
      exerciseCount: selectedExercises.size + selectedQuizzes.size,
    };

    setClasses((prev) => [...prev, classData]);
    setNewClass({ className: '', description: '', maxStudents: 50, startDate: '', endDate: '' });
    setSelectedExercises(new Set());
    setSelectedQuizzes(new Set());
    setView('classes');
  };

  // Trong component CodingExerciseManager

  const handleCreateNewExercise = () => {
    navigate(PATHS.CODING_EXERCISE_LIBRARY);
  };

  const handleCreateNewQuiz = () => {
   
    navigate(PATHS.QUIZ_LIBRARY); 
  };

  // ────────────────────────────────────────────────
  // Sub Views
  // ────────────────────────────────────────────────

  const LibraryTabs = () => (
    <div className="flex border-b mb-6">
      <button
        onClick={() => setView('library_coding')}
        className={`px-6 py-3 font-medium transition-colors ${
          view === 'library_coding'
            ? 'border-b-2 border-blue-600 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`}
      >
        Bài tập lập trình
      </button>
      <button
        onClick={() => setView('library_quiz')}
        className={`px-6 py-3 font-medium transition-colors ${
          view === 'library_quiz'
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition min-w-[160px] ${
            selectedExercises.size + selectedQuizzes.size > 0
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
          className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md group relative ${
            selectedExercises.has(ex.templateId)
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Checkbox chọn */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExerciseSelection(ex.templateId);
              }}
              className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${
                selectedExercises.has(ex.templateId)
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

          {/* Nút sửa - xóa */}
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition min-w-[160px] ${
            selectedExercises.size + selectedQuizzes.size > 0
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

    {/* Search & Filter giữ nguyên */}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredQuizzes.map((quiz) => (
        <div
          key={quiz.quizId}
          className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md group relative ${
            selectedQuizzes.has(quiz.quizId)
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Checkbox chọn */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleQuizSelection(quiz.quizId);
              }}
              className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${
                selectedQuizzes.has(quiz.quizId)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 group-hover:border-gray-400'
              }`}
            >
              {selectedQuizzes.has(quiz.quizId) && <Check size={14} />}
            </button>
          </div>

          <div
            onClick={() => toggleQuizSelection(quiz.quizId)}
            className="cursor-pointer"
          >
            <h3 className="font-semibold text-gray-900 line-clamp-2 pr-10 mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  quiz.isPublished ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                }`}
              >
                {quiz.isPublished ? 'Đã xuất bản' : 'Nháp'}
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

          {/* Nút sửa - xóa */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewQuiz(quiz.quizId);
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
                handleEditQuiz(quiz.quizId);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition"
            >
              <Edit size={14} />
              Sửa
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteQuiz(quiz.quizId);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bài thi của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý các bài kiểm tra và bài tập đã tạo</p>
        </div>
        <button
          onClick={() => setView('library_coding')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={18} />
          Tạo bài thi mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.classId}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.className}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cls.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}
                >
                  {cls.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{cls.enrollmentCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Học sinh</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{cls.exerciseCount}</div>
                  <div className="text-xs text-gray-600 mt-1">Bài tập</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{cls.maxStudents}</div>
                  <div className="text-xs text-gray-600 mt-1">Sức chứa</div>
                </div>
              </div>

              <button className="w-full mt-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                Quản lý lớp học
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CreateClassView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('library_coding')}
          className="p-2.5 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tạo bài thi mới</h1>
          <p className="text-gray-600 mt-1">Thiết lập thông tin và kiểm tra nội dung đã chọn</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 sm:p-8 space-y-10">
        {/* Thông tin bài thi */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin bài thi</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên bài thi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
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
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newClass.startDate}
                  onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newClass.endDate}
                  onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sức chứa tối đa (số học sinh)</label>
              <input
                type="number"
                value={newClass.maxStudents}
                onChange={(e) => setNewClass({ ...newClass, maxStudents: Number(e.target.value) || 50 })}
                min={1}
                className="w-full sm:w-1/3 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Nội dung đã chọn */}
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
                .filter((q) => selectedQuizzes.has(q.quizId))
                .map((q) => (
                  <div
                    key={q.quizId}
                    className="flex items-center justify-between p-4 bg-green-50/60 rounded-lg border border-green-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen className="text-green-600" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{q.title}</div>
                        <div className="text-sm text-gray-600">
                          {q.totalQuestions} câu • {q.passScore}% đạt • {q.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleQuizSelection(q.quizId)}
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
            className={`flex-1 py-3 rounded-lg font-medium text-white transition order-1 sm:order-2 ${
              selectedExercises.size + selectedQuizzes.size > 0
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

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'classes' && <ClassesView />}
        {view === 'library_coding' && <CodingLibraryView />}
        {view === 'library_quiz' && <QuizLibraryView />}
        {view === 'create-class' && <CreateClassView />}
      </div>
    </div>
  );
};

export default CodingExerciseManager;