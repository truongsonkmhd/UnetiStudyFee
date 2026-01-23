// src/components/QuizEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Eye, CheckCircle, Circle, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { Quiz } from '@/types/Quiz';
import quizService from '@/services/UserService';
import { Answer } from '@/types/Answer';
import { Question } from '@/types/Question';

interface QuizEditorModalProps {
  contestLessonId: string;
  quizId: string | null;
  onClose: (shouldRefresh: boolean) => void;
}

const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  contestLessonId,
  quizId,
  onClose
}) => {
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    passScore: 70,
    isPublished: false,
    contestLessonId,
    questions: []
  });

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getById(quizId);
      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      content: '',
      timeLimitSeconds: 5,
      points: 1,
      questionOrder: quiz.questions.length + 1,
      answers: [
        { content: '', isCorrect: false, answerOrder: 1 },
        { content: '', isCorrect: false, answerOrder: 2 }
      ]
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    setExpandedQuestion(quiz.questions.length);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = quiz.questions
      .filter((_, i) => i !== index)
      .map((q, idx) => ({ ...q, questionOrder: idx + 1 }));
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    const question = updatedQuestions[questionIndex];
    const newAnswer: Answer = {
      content: '',
      isCorrect: false,
      answerOrder: question.answers.length + 1
    };
    question.answers.push(newAnswer);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: keyof Answer,
    value: any
  ) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const deleteAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers
      .filter((_, i) => i !== answerIndex)
      .map((a, idx) => ({ ...a, answerOrder: idx + 1 }));
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].answers[answerIndex].isCorrect =
      !updatedQuestions[questionIndex].answers[answerIndex].isCorrect;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const validateQuiz = (): string | null => {
    if (!quiz.title.trim()) {
      return 'Please enter quiz title';
    }
    if (quiz.questions.length === 0) {
      return 'Please add at least one question';
    }
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.content.trim()) {
        return `Question ${i + 1} is empty`;
      }
      if (q.answers.length < 2) {
        return `Question ${i + 1} needs at least 2 answers`;
      }
      if (!q.answers.some(a => a.isCorrect)) {
        return `Question ${i + 1} needs at least one correct answer`;
      }
      if (q.answers.some(a => !a.content.trim())) {
        return `Question ${i + 1} has empty answers`;
      }
    }
    return null;
  };

  const handleSaveQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (quizId) {
        await quizService.update(quizId, quiz);
      } else {
        await quizService.create(quiz);
      }

      alert('Quiz saved successfully!');
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
      alert(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Quiz Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Edit
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📝 {quiz.questions.length} Questions</span>
                <span>✅ Pass Score: {quiz.passScore}%</span>
                <span>⏱️ 5 seconds per question</span>
              </div>
            </div>

            {quiz.questions.map((question, qIdx) => (
              <div key={qIdx} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded">
                    Q{qIdx + 1}
                  </span>
                  <p className="flex-1 text-gray-800 font-semibold">{question.content}</p>
                  <span className="text-sm text-gray-500">⏱️ {question.timeLimitSeconds}s</span>
                </div>

                <div className="space-y-2 pl-12">
                  {question.answers.map((answer, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-3 rounded-lg border-2 ${
                        answer.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-800">{answer.content}</span>
                        {answer.isCorrect && (
                          <span className="ml-auto text-xs font-semibold text-green-600">
                            CORRECT
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {quizId ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Quiz Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                placeholder="Enter quiz title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pass Score (%)
                </label>
                <input
                  type="number"
                  value={quiz.passScore}
                  onChange={(e) => setQuiz({ ...quiz, passScore: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Questions
                </label>
                <input
                  type="text"
                  value={quiz.questions.length}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Quiz
                </>
              )}
            </button>
          </div>

          {quiz.questions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No questions yet. Click "Add Question" to start.</p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {quiz.questions.map((question, qIdx) => (
              <div key={qIdx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div
                  className="p-4 bg-indigo-50 border-l-4 border-indigo-600 cursor-pointer hover:bg-indigo-100"
                  onClick={() => setExpandedQuestion(expandedQuestion === qIdx ? null : qIdx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded">
                        Q{qIdx + 1}
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {question.content || 'Untitled Question'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {question.answers.length} answers
                      </span>
                      {expandedQuestion === qIdx ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedQuestion === qIdx && (
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Question Content *
                        </label>
                        <textarea
                          value={question.content}
                          onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                          placeholder="Enter your question..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Time Limit (seconds)
                          </label>
                          <input
                            type="number"
                            value={question.timeLimitSeconds}
                            onChange={(e) => updateQuestion(qIdx, 'timeLimitSeconds', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIdx, 'points', parseFloat(e.target.value))}
                            min="0"
                            step="0.5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Answers (click to mark as correct)
                        </label>
                        <button
                          onClick={() => addAnswer(qIdx)}
                          className="flex items-center gap-1 text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                        >
                          <Plus className="w-4 h-4" />
                          Add Answer
                        </button>
                      </div>

                      <div className="space-y-2">
                        {question.answers.map((answer, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCorrectAnswer(qIdx, aIdx)}
                              className={`p-2 rounded ${
                                answer.isCorrect
                                  ? 'bg-green-100 hover:bg-green-200'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {answer.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <span className="text-sm font-semibold text-gray-600 w-8">
                              {String.fromCharCode(65 + aIdx)}.
                            </span>
                            <input
                              type="text"
                              value={answer.content}
                              onChange={(e) => updateAnswer(qIdx, aIdx, 'content', e.target.value)}
                              placeholder={`Answer ${aIdx + 1}...`}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {question.answers.length > 2 && (
                              <button
                                onClick={() => deleteAnswer(qIdx, aIdx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => deleteQuestion(qIdx)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditorModal;