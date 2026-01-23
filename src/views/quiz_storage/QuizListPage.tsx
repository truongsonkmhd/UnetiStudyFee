import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import quizService from '@/services/UserService';
import { QuizSummary } from '@/types/QuizSummary';
import QuizEditorModal from './QuizEditorModal';

interface QuizListProps {
  contestLessonId: string;
}

const QuizListPage: React.FC<QuizListProps> = ({ contestLessonId }) => {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [contestLessonId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getAll(contestLessonId);
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setEditingQuizId(null);
    setShowModal(true);
  };

  const handleEditQuiz = (quizId: string) => {
    setEditingQuizId(quizId);
    setShowModal(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      setDeletingQuizId(quizId);
      await quizService.delete(quizId);
      await loadQuizzes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete quiz');
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleTogglePublish = async (quiz: QuizSummary) => {
    try {
      if (quiz.isPublished) {
        await quizService.unpublish(quiz.quizId);
      } else {
        await quizService.publish(quiz.quizId);
      }
      await loadQuizzes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update quiz status');
    }
  };

  const handleModalClose = (shouldRefresh: boolean) => {
    setShowModal(false);
    setEditingQuizId(null);
    if (shouldRefresh) {
      loadQuizzes();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Error Loading Quizzes</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadQuizzes}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Management</h1>
              <p className="text-gray-600">Create and manage quizzes for your course</p>
            </div>
            <button
              onClick={handleCreateQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Quiz
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-800">
                  {quizzes.filter(q => q.isPublished).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-800">
                  {quizzes.filter(q => !q.isPublished).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first quiz</p>
            <button
              onClick={handleCreateQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden"
              >
                {/* Quiz Header */}
                <div className={`p-4 ${quiz.isPublished ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 flex-1 mr-2">
                      {quiz.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quiz.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      📝 {quiz.totalQuestions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      ✅ {quiz.passScore}% pass
                    </span>
                  </div>
                </div>

                {/* Quiz Body */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-4">
                    <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                    <p>Updated: {new Date(quiz.updatedAt).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuiz(quiz.quizId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleTogglePublish(quiz)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors ${
                        quiz.isPublished
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {quiz.isPublished ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Publish
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.quizId)}
                      disabled={deletingQuizId === quiz.quizId}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingQuizId === quiz.quizId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <QuizEditorModal
            contestLessonId={contestLessonId}
            quizId={editingQuizId}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default QuizListPage;