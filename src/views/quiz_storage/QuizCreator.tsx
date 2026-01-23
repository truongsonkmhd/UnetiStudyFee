import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, Eye, CheckCircle, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const QuizCreator = () => {
  const [quiz, setQuiz] = useState({
    title: '',
    passScore: 70,
    isPublished: false,
    questions: []
  });

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      content: '',
      timeLimitSeconds: 5,
      points: 1,
      questionOrder: quiz.questions.length + 1,
      answers: [
        { id: Date.now() + 1, content: '', isCorrect: false, answerOrder: 1 },
        { id: Date.now() + 2, content: '', isCorrect: false, answerOrder: 2 }
      ]
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const deleteQuestion = (questionId) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions
        .filter(q => q.id !== questionId)
        .map((q, idx) => ({ ...q, questionOrder: idx + 1 }))
    });
  };

  const addAnswer = (questionId) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => {
        if (q.id === questionId) {
          const newAnswer = {
            id: Date.now(),
            content: '',
            isCorrect: false,
            answerOrder: q.answers.length + 1
          };
          return { ...q, answers: [...q.answers, newAnswer] };
        }
        return q;
      })
    });
  };

  const updateAnswer = (questionId, answerId, field, value) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map(a =>
              a.id === answerId ? { ...a, [field]: value } : a
            )
          };
        }
        return q;
      })
    });
  };

  const deleteAnswer = (questionId, answerId) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers
              .filter(a => a.id !== answerId)
              .map((a, idx) => ({ ...a, answerOrder: idx + 1 }))
          };
        }
        return q;
      })
    });
  };

  const toggleCorrectAnswer = (questionId, answerId) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map(a =>
              a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a
            )
          };
        }
        return q;
      })
    });
  };

  const handleSaveQuiz = () => {
    console.log('Saving quiz:', quiz);
    alert('Quiz saved successfully! (Check console for data)');
  };

  const handlePublishQuiz = () => {
    if (validateQuiz()) {
      setQuiz({ ...quiz, isPublished: true });
      console.log('Publishing quiz:', quiz);
      alert('Quiz published successfully!');
    }
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      alert('Please enter quiz title');
      return false;
    }
    if (quiz.questions.length === 0) {
      alert('Please add at least one question');
      return false;
    }
    for (const q of quiz.questions) {
      if (!q.content.trim()) {
        alert(`Question ${q.questionOrder} is empty`);
        return false;
      }
      if (q.answers.length < 2) {
        alert(`Question ${q.questionOrder} needs at least 2 answers`);
        return false;
      }
      if (!q.answers.some(a => a.isCorrect)) {
        alert(`Question ${q.questionOrder} needs at least one correct answer`);
        return false;
      }
      if (q.answers.some(a => !a.content.trim())) {
        alert(`Question ${q.questionOrder} has empty answers`);
        return false;
      }
    }
    return true;
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Quiz Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Edit
              </button>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📝 {quiz.questions.length} Questions</span>
                <span>✅ Pass Score: {quiz.passScore}%</span>
                <span>⏱️ 5 seconds per question</span>
              </div>
            </div>

            {quiz.questions.map((question, qIdx) => (
              <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
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
                      key={answer.id}
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Quiz</h1>

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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            <button
              onClick={handlePublishQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto"
            >
              Publish Quiz
            </button>
          </div>

          {quiz.questions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No questions yet. Click "Add Question" to start.</p>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {quiz.questions.map((question, qIdx) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div
                className="p-4 bg-indigo-50 border-l-4 border-indigo-600 cursor-pointer hover:bg-indigo-100"
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
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
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {expandedQuestion === question.id && (
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question Content *
                      </label>
                      <textarea
                        value={question.content}
                        onChange={(e) => updateQuestion(question.id, 'content', e.target.value)}
                        placeholder="Enter your question..."
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
                          onChange={(e) => updateQuestion(question.id, 'timeLimitSeconds', parseInt(e.target.value))}
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
                          onChange={(e) => updateQuestion(question.id, 'points', parseFloat(e.target.value))}
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
                        onClick={() => addAnswer(question.id)}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add Answer
                      </button>
                    </div>

                    <div className="space-y-2">
                      {question.answers.map((answer, aIdx) => (
                        <div key={answer.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCorrectAnswer(question.id, answer.id)}
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
                            onChange={(e) => updateAnswer(question.id, answer.id, 'content', e.target.value)}
                            placeholder={`Answer ${aIdx + 1}...`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          {question.answers.length > 2 && (
                            <button
                              onClick={() => deleteAnswer(question.id, answer.id)}
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
                      onClick={() => deleteQuestion(question.id)}
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
  );
};

export default QuizCreator;