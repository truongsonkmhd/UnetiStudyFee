// src/components/QuizEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Eye, CheckCircle, Circle, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { QuizTemplate } from '@/types/quiz/QuizTemplate';
import { QuestionTemplate } from '@/types/quiz/QuestionTemplate';
import { AnswerTemplate } from '@/types/quiz/AnswerTemplate';
import { QuizTemplateDetail } from '@/model/quiz-template/QuizTemplateDetail';
import { CreateQuizTemplateRequest } from '@/model/quiz-template/CreateQuizTemplateRequest';
import { UpdateQuizTemplateRequest } from '@/model/quiz-template/UpdateQuizTemplateRequest';
import quizTemplateService from '@/services/quizTemplateService';
import { toast } from 'sonner';

interface QuizEditorModalProps {
  quizId: string | null;
  onClose: (shouldRefresh: boolean) => void;
}

const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  quizId,
  onClose
}) => {
  const [quiz, setQuiz] = useState<Partial<QuizTemplateDetail>>({
    version: 1,
    templateName: '',
    description: '',
    category: '',
    passScore: 70,
    maxAttempts: 3,
    isActive: true,
    questions: [],
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
      const data = await quizTemplateService.getTemplateById(quizId);
      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz template');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionTemplate = {
      content: '',
      timeLimitSeconds: 60,
      points: 1,
      questionOrder: (quiz.questions?.length || 0) + 1,
      answers: [
        { content: '', isCorrect: false, answerOrder: 1 },
        { content: '', isCorrect: false, answerOrder: 2 }
      ]
    };
    setQuiz({ ...quiz, questions: [...(quiz.questions || []), newQuestion] });
    setExpandedQuestion(quiz.questions?.length || 0);
  };

  const updateQuestion = (index: number, field: keyof QuestionTemplate, value: any) => {
    const updatedQuestions = [...(quiz.questions || [])];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = (quiz.questions || [])
      .filter((_, i) => i !== index)
      .map((q, idx) => ({ ...q, questionOrder: idx + 1 }));
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...(quiz.questions || [])];
    const question = updatedQuestions[questionIndex];
    const newAnswer: AnswerTemplate = {
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
    field: keyof AnswerTemplate,
    value: any
  ) => {
    const updatedQuestions = [...(quiz.questions || [])];
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const deleteAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...(quiz.questions || [])];
    updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers
      .filter((_, i) => i !== answerIndex)
      .map((a, idx) => ({ ...a, answerOrder: idx + 1 }));
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...(quiz.questions || [])];
    updatedQuestions[questionIndex].answers[answerIndex].isCorrect =
      !updatedQuestions[questionIndex].answers[answerIndex].isCorrect;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const validateQuiz = (): string | null => {
    if (!quiz.templateName?.trim()) {
      return 'Vui lòng nhập tên mẫu bài kiểm tra';
    }
    if (!quiz.category?.trim()) {
      return 'Vui lòng nhập danh mục';
    }
    if ((quiz.questions?.length || 0) === 0) {
      return 'Vui lòng thêm ít nhất một câu hỏi';
    }
    for (let i = 0; i < (quiz.questions?.length || 0); i++) {
      const q = quiz.questions![i];
      if (!q.content.trim()) {
        return `Câu hỏi ${i + 1} còn trống`;
      }
      if (q.answers.length < 2) {
        return `Câu hỏi ${i + 1} cần ít nhất 2 đáp án`;
      }
      if (!q.answers.some(a => a.isCorrect)) {
        return `Câu hỏi ${i + 1} cần ít nhất một đáp án đúng`;
      }
      if (q.answers.some(a => !a.content.trim())) {
        return `Câu hỏi ${i + 1} có đáp án còn trống`;
      }
    }
    return null;
  };

  const handleSaveQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (quizId) {
        const updateRequest: UpdateQuizTemplateRequest = {
          version: quiz.version + 1,
          templateName: quiz.templateName,
          description: quiz.description,
          category: quiz.category,
          passScore: quiz.passScore,
          maxAttempts: quiz.maxAttempts,
          isActive: quiz.isActive,
        };
        await quizTemplateService.updateTemplate(quizId, updateRequest);
      } else {
        const createRequest: CreateQuizTemplateRequest = {
          templateName: quiz.templateName!,
          description: quiz.description || '',
          category: quiz.category!,
          passScore: quiz.passScore || 70,
          maxAttempts: quiz.maxAttempts || 3,
          questions: quiz.questions || [],
        };
        await quizTemplateService.createTemplate(createRequest);
      }

      toast.success('Mẫu quiz được lưu thành công!');
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz template');
      toast.error(err instanceof Error ? err.message : 'Mẫu quiz lưu thất bại!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-2xl flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Đang tải mẫu quiz...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
        <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-7xl w-full my-8 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border p-6 z-10 flex justify-between items-center">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Xem trước Quiz</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Quay lại chỉnh sửa
            </button>
          </div>

          <div className="p-6">
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-black text-foreground mb-3">{quiz.templateName}</h3>
              <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg">📝 {quiz.questions?.length || 0} Câu hỏi</span>
                <span className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg">✅ Điểm đạt: {quiz.passScore}%</span>
                <span className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg">🔄 Lượt làm: {quiz.maxAttempts || 'Không giới hạn'}</span>
                <span className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg">⏱️ 5 giây/câu</span>
              </div>
            </div>

            {quiz.questions?.map((question, qIdx) => (
              <div key={qIdx} className="mb-8 p-6 bg-muted/20 border border-border rounded-2xl group hover:border-primary/30 transition-all shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <span className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl shadow-lg shadow-primary/10">
                    Q{qIdx + 1}
                  </span>
                  <p className="flex-1 text-lg font-bold text-foreground leading-relaxed">{question.content}</p>
                  <span className="text-xs font-bold uppercase text-muted-foreground/60 bg-muted px-2 py-1 rounded-md">⏱️ {question.timeLimitSeconds}s</span>
                </div>

                <div className="space-y-3 pl-12">
                  {question.answers.map((answer, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-4 rounded-2xl border-2 transition-all ${answer.isCorrect
                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/5'
                        : 'border-border bg-background'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/30" />
                        )}
                        <span className={`font-semibold ${answer.isCorrect ? 'text-emerald-500' : 'text-foreground'}`}>
                          {answer.content}
                        </span>
                        {answer.isCorrect && (
                          <span className="ml-auto text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            ĐÚNG
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-[1700px] w-full my-8 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {quizId ? 'Sửa mẫu quiz' : 'Tạo mẫu quiz mới'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
            <p className="text-destructive font-semibold flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Quiz Basic Info */}
          <div className="space-y-6 mb-8 bg-muted/10 p-6 rounded-3xl border border-border/50">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Tên mẫu <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={quiz.templateName || ''}
                onChange={(e) => setQuiz({ ...quiz, templateName: e.target.value })}
                placeholder="VD: Kiểm tra giữa kỳ Cấu trúc dữ liệu..."
                className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Mô tả
              </label>
              <textarea
                value={quiz.description || ''}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về bài kiểm tra này..."
                rows={3}
                className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  Danh mục <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={quiz.category || ''}
                  onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                  placeholder="Toán học, Công nghệ..."
                  className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  Điểm đạt (%)
                </label>
                <input
                  type="number"
                  value={quiz.passScore || 70}
                  onChange={(e) => setQuiz({ ...quiz, passScore: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  Số lượt làm tối đa
                </label>
                <input
                  type="number"
                  value={quiz.maxAttempts || 3}
                  onChange={(e) => setQuiz({ ...quiz, maxAttempts: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Thêm câu hỏi
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground border border-border rounded-2xl font-bold hover:bg-muted/80 transition-all active:scale-95"
            >
              <Eye className="w-5 h-5" />
              Xem trước
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu mẫu quiz
                </>
              )}
            </button>
          </div>

          {(quiz.questions?.length || 0) === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center border border-border shadow-sm text-muted-foreground/30">
                <AlertCircle className="w-12 h-12" />
              </div>
              <div>
                <p className="text-foreground font-bold tracking-wide">Chưa có câu hỏi nào</p>
                <p className="text-muted-foreground text-base uppercase tracking-tighter font-black opacity-60">Nhấn "Thêm câu hỏi" để bắt đầu</p>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {(quiz.questions || []).map((question, qIdx) => (
              <div key={qIdx} className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden group hover:border-primary/50 transition-all duration-300">
                <div
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${expandedQuestion === qIdx ? 'bg-primary/5 border-l-4 border-primary' : 'bg-background hover:bg-muted'}`}
                  onClick={() => setExpandedQuestion(expandedQuestion === qIdx ? null : qIdx)}
                >
                  <div className="flex items-center gap-4 flex-1 mr-4">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${expandedQuestion === qIdx ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                      {String(qIdx + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-base font-bold transition-colors line-clamp-1 ${expandedQuestion === qIdx ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {question.content || 'Câu hỏi chưa có tiêu đề'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-black uppercase tracking-widest text-muted-foreground/50 bg-muted/50 px-2.5 py-1 rounded-lg">
                      {question.answers.length} options
                    </span>
                    {expandedQuestion === qIdx ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedQuestion === qIdx && (
                  <div className="p-6 border-t border-border/50">
                    <div className="space-y-6 mb-8">
                      <div>
                        <label className="block text-[14px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                          Nội dung câu hỏi <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={question.content}
                          onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi tại đây..."
                          rows={3}
                          className="w-full px-5 py-3 bg-muted/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground font-bold leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[15px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                            Thời gian làm (giây)
                          </label>
                          <input
                            type="number"
                            value={question.timeLimitSeconds}
                            onChange={(e) => updateQuestion(qIdx, 'timeLimitSeconds', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-5 py-3 bg-muted/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[15px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                            Điểm số
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIdx, 'points', parseFloat(e.target.value))}
                            min="0"
                            step="0.5"
                            className="w-full px-5 py-3 bg-muted/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-[15px] font-black uppercase tracking-widest text-primary ml-1">
                          Danh sách đáp án (Tick để chọn đúng)
                        </label>
                        <button
                          onClick={() => addAnswer(qIdx)}
                          className="flex items-center gap-1.5 text-sm font-black px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm phương án
                        </button>
                      </div>

                      <div className="space-y-3">
                        {question.answers.map((answer, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-3 group/answer transition-all">
                            <button
                              onClick={() => toggleCorrectAnswer(qIdx, aIdx)}
                              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-sm ${answer.isCorrect
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-muted/50 text-muted-foreground/30 hover:text-muted-foreground border border-border'
                                }`}
                            >
                              {answer.isCorrect ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                            </button>
                            <span className={`text-sm font-black w-8 text-center px-1 py-1 rounded-md transition-colors ${answer.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'}`}>
                              {String.fromCharCode(65 + aIdx)}
                            </span>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={answer.content}
                                onChange={(e) => updateAnswer(qIdx, aIdx, 'content', e.target.value)}
                                placeholder={`Nhập đáp án ${String.fromCharCode(65 + aIdx)}...`}
                                className={`w-full px-5 py-3 border rounded-2xl focus:ring-2 outline-none transition-all font-semibold text-foreground ${answer.isCorrect ? 'border-emerald-500/50 bg-emerald-500/5 focus:ring-emerald-500' : 'border-border bg-background focus:ring-primary'}`}
                              />
                            </div>
                            {question.answers.length > 2 && (
                              <button
                                onClick={() => deleteAnswer(qIdx, aIdx)}
                                className="w-10 h-10 flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover/answer:opacity-100"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-border mt-6">
                      <button
                        onClick={() => deleteQuestion(qIdx)}
                        className="flex items-center gap-2 px-6 py-2.5 text-destructive font-black text-sm uppercase tracking-widest hover:bg-destructive/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa câu hỏi
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