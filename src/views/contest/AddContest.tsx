import React, { useState, useEffect } from 'react';
import { 
  X, Search, Calendar, Clock, TrendingUp, Users, Trophy, 
  AlertCircle, CheckCircle, Settings, Info, ChevronRight,
  FileText, Code, HelpCircle, BarChart, Target, Award
} from 'lucide-react';

// Mock data cho Contest Templates
const mockContestTemplates = [
  {
    contestLessonId: '1',
    title: 'Midterm Examination - Algorithms',
    description: 'Comprehensive exam covering sorting, searching, and graph algorithms',
    totalPoints: 100,
    defaultDurationMinutes: 120,
    codingExerciseCount: 5,
    quizQuestionCount: 10,
    status: 'READY',
    defaultMaxAttempts: 1,
    passingScore: 60,
    showLeaderboardDefault: true,
    instructions: 'Read all questions carefully before starting. No external resources allowed.'
  },
  {
    contestLessonId: '2',
    title: 'Weekly Practice - Recursion',
    description: 'Practice problems on recursive algorithms and backtracking',
    totalPoints: 50,
    defaultDurationMinutes: 90,
    codingExerciseCount: 3,
    quizQuestionCount: 5,
    status: 'READY',
    defaultMaxAttempts: 3,
    passingScore: 30,
    showLeaderboardDefault: true,
    instructions: 'You have multiple attempts. Learn from your mistakes!'
  },
  {
    contestLessonId: '3',
    title: 'Final Project - Data Structures',
    description: 'Implement complex data structures including trees and graphs',
    totalPoints: 150,
    defaultDurationMinutes: 180,
    codingExerciseCount: 8,
    quizQuestionCount: 15,
    status: 'READY',
    defaultMaxAttempts: 1,
    passingScore: 90,
    showLeaderboardDefault: false,
    instructions: 'Final exam - single attempt only. Ensure stable internet connection.'
  }
];

const AddContestModal = ({ isOpen, onClose, classInfo }) => {
  const [step, setStep] = useState(1); // 1: Select Template, 2: Configure, 3: Review
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    scheduledStartTime: '',
    scheduledEndTime: '',
    weight: 1.0,
    maxAttemptsOverride: null,
    showLeaderboardOverride: null,
    instructionsOverride: '',
    passingScoreOverride: null,
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTemplate(null);
      setFormData({
        scheduledStartTime: '',
        scheduledEndTime: '',
        weight: 1.0,
        maxAttemptsOverride: null,
        showLeaderboardOverride: null,
        instructionsOverride: '',
        passingScoreOverride: null,
        isActive: true
      });
      setErrors({});
    }
  }, [isOpen]);

  const filteredTemplates = mockContestTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.scheduledStartTime) {
    //  newErrors.scheduledStartTime = 'Start time is required';
    }
    if (!formData.scheduledEndTime) {
     // newErrors.scheduledEndTime = 'End time is required';
    }
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const start = new Date(formData.scheduledStartTime);
      const end = new Date(formData.scheduledEndTime);
      if (start >= end) {
       // newErrors.scheduledEndTime = 'End time must be after start time';
      }
    }
    if (formData.weight <= 0) {
     // newErrors.weight = 'Weight must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting contest assignment:', {
      classId: classInfo.classId,
      contestLessonId: selectedTemplate.contestLessonId,
      ...formData
    });
    onClose();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateEffectivePoints = () => {
    return Math.round(selectedTemplate?.totalPoints * formData.weight);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Thêm bài thi đến lớp ...</h2>
            <p className="text-blue-100 text-sm">
              {classInfo?.classCode} - {classInfo?.className}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                1
              </div>
              <span className={`font-medium ${step >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                Chọn mẫu
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                2
              </div>
              <span className={`font-medium ${step >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                Cấu hình
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                3
              </div>
              <span className={`font-medium ${step >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>
                Xem lại
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Select Template */}
          {step === 1 && (
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tìm kiếm mẫu bài thi
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.contestLessonId}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-5 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                          {template.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        {template.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
                          <Trophy className="w-3.5 h-3.5" />
                          Total Points
                        </div>
                        <div className="font-bold text-slate-900">{template.totalPoints}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          Duration
                        </div>
                        <div className="font-bold text-slate-900">{formatDuration(template.defaultDurationMinutes)}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
                          <Code className="w-3.5 h-3.5" />
                          Exercises
                        </div>
                        <div className="font-bold text-slate-900">{template.codingExerciseCount}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Quizzes
                        </div>
                        <div className="font-bold text-slate-900">{template.quizQuestionCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && selectedTemplate && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-1">Mẫu đã chọn</h3>
                <p className="text-sm text-blue-700">{selectedTemplate.title}</p>
              </div>

              <div className="space-y-6">
                {/* Schedule Section */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">Lên lịch bài thi</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledStartTime}
                        onChange={(e) => setFormData({...formData, scheduledStartTime: e.target.value})}
                        // className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        //  errors.scheduledStartTime ? 'border-red-500' : 'border-slate-300'
                        // }`}
                      />
                      {/* {errors.scheduledStartTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.scheduledStartTime}</p>
                      )} */}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledEndTime}
                        onChange={(e) => setFormData({...formData, scheduledEndTime: e.target.value})}
                        // className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        //   errors.scheduledEndTime ? 'border-red-500' : 'border-slate-300'
                        // }`}
                      />
                      {/* {errors.scheduledEndTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.scheduledEndTime}</p>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Scoring Section */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">Cấu hình chấm điểm</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hệ số
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                        // className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        //  errors.weight ? 'border-red-500' : 'border-slate-300'
                        // }`}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Effective Points: {calculateEffectivePoints()} (Base: {selectedTemplate.totalPoints})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Điểm đạt
                      </label>
                      <input
                        type="number"
                        placeholder={`Default: ${selectedTemplate.passingScore}`}
                        value={formData.passingScoreOverride || ''}
                        onChange={(e) => setFormData({...formData, passingScoreOverride: e.target.value ? parseInt(e.target.value) : null})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">Cài đặt nâng cao</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số lần tối đa làm bài thi
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder={`Default: ${selectedTemplate.defaultMaxAttempts}`}
                        value={formData.maxAttemptsOverride || ''}
                        onChange={(e) => setFormData({...formData, maxAttemptsOverride: e.target.value ? parseInt(e.target.value) : null})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="leaderboard"
                        checked={formData.showLeaderboardOverride ?? selectedTemplate.showLeaderboardDefault}
                        onChange={(e) => setFormData({...formData, showLeaderboardOverride: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="leaderboard" className="text-sm font-medium text-slate-700">
                        Hiển thị bảng xếp hạng
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hướng dẫn tùy chỉnh (Tùy chọn)
                      </label>
                      <textarea
                        placeholder="Thêm hướng dẫn cụ thể cho lớp học..."
                        value={formData.instructionsOverride}
                        onChange={(e) => setFormData({...formData, instructionsOverride: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && selectedTemplate && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Sẵn sàng thêm bài thi</h3>
                    <p className="text-sm text-green-700">Vui lòng xem lại cấu hình trước khi xác nhận.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Contest Info */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Thông tin bài thi
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mẫu:</span>
                      <span className="font-semibold text-slate-900">{selectedTemplate.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tổng số bài tập:</span>
                      <span className="font-semibold text-slate-900">{selectedTemplate.codingExerciseCount} Coding + {selectedTemplate.quizQuestionCount} Quiz</span>
                    </div>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Thời gian biểu
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bắt đầu:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(formData.scheduledStartTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Kết thúc:</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(formData.scheduledEndTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scoring Info */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Scoring Configuration
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Điểm gốc:</span>
                      <span className="font-semibold text-slate-900">{selectedTemplate.totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tỉ lệ:</span>
                      <span className="font-semibold text-slate-900">{formData.weight}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Điểm hiệu quả:</span>
                      <span className="font-bold text-blue-600 text-lg">{calculateEffectivePoints()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Điểm đạt:</span>
                      <span className="font-semibold text-slate-900">
                        {formData.passingScoreOverride || selectedTemplate.passingScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lần làm tối đa:</span>
                      <span className="font-semibold text-slate-900">
                        {formData.maxAttemptsOverride || selectedTemplate.defaultMaxAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bảng xếp hạng:</span>
                      <span className={`font-semibold ${
                        (formData.showLeaderboardOverride ?? selectedTemplate.showLeaderboardDefault) 
                          ? 'text-green-600' 
                          : 'text-slate-900'
                      }`}>
                        {(formData.showLeaderboardOverride ?? selectedTemplate.showLeaderboardDefault) ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.instructionsOverride && (
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Custom Instructions
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {formData.instructionsOverride}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>
          <div className="flex gap-3">
            {step < 3 && (
              <button
                onClick={handleNext}
                disabled={step === 1 && !selectedTemplate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Tiếp
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Xác nhận & Thêm bài thi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContestModal;