import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Trophy, Clock, Search, Edit2, Trash2, Eye, AlertCircle, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import AddContestModal from '../contest/AddContest';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import classService from '@/services/classService';
import { actionAuth } from '@/components/context/AuthContext';
import { toast } from 'sonner';

const mockContests = [
  {
    classContestId: '1',
    contestInfo: {
      title: 'Midterm Exam - Algorithms',
      description: 'Comprehensive test covering sorting and searching',
      defaultTotalPoints: 100,
      codingExerciseCount: 5,
      quizQuestionCount: 10
    },
    scheduledStartTime: '2024-03-15T09:00:00Z',
    scheduledEndTime: '2024-03-15T11:00:00Z',
    status: 'SCHEDULED',
    isActive: true,
    weight: 1.0,
    effectiveConfig: {
      maxAttempts: 1,
      showLeaderboard: true,
      totalPoints: 100,
      passingScore: 60
    }
  },
  {
    classContestId: '2',
    contestInfo: {
      title: 'Weekly Practice - Recursion',
      description: 'Practice problems on recursive algorithms',
      defaultTotalPoints: 50,
      codingExerciseCount: 3,
      quizQuestionCount: 5
    },
    scheduledStartTime: '2024-02-01T14:00:00Z',
    scheduledEndTime: '2024-02-01T15:30:00Z',
    status: 'COMPLETED',
    isActive: true,
    weight: 0.5,
    effectiveConfig: {
      maxAttempts: 3,
      showLeaderboard: true,
      totalPoints: 25,
      passingScore: 15
    }
  }
];

const ClassManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [classes, setClasses] = useState<ClazzResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jwtClaims } = actionAuth();

  const [createForm, setCreateForm] = useState({
    classCode: "",
    className: "",
    startDate: "",
    endDate: "",
    maxStudents: 0
  });

  const handleCreateClass = async () => {
    try {

      setLoading(true);

      await classService.create({
        classCode: createForm.classCode,
        className: createForm.className,
        instructorId: jwtClaims.userID,
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: createForm.endDate
          ? new Date(createForm.endDate).toISOString()
          : null,
        maxStudents: createForm.maxStudents
      });

      // reload danh sách lớp
      const data = await classService.getAllClasses();
      setClasses(data);

      // đóng modal + reset form
      setShowCreateModal(false);
      setCreateForm({
        classCode: "",
        className: "",
        startDate: "",
        endDate: "",
        maxStudents: 0
      });

      toast.success("Tạo lớp học thành công!");
    } catch (e) {
      console.error(e);
      toast.error("Tạo lớp học thất bại!");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await classService.getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);


  const mockClassInfo = {
    classId: '1',
    classCode: 'CS101-2024',
    className: 'Introduction to Computer Science'
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
      ONGOING: { color: 'bg-green-100 text-green-700 border-green-200', icon: PlayCircle },
      COMPLETED: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.SCHEDULED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && cls.isActive) ||
      (filterActive === 'inactive' && !cls.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quản lý lớp học </h1>
              <p className="text-sm text-muted-foreground mt-1">Quản lý lớp học và bài thi của bạn</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm lớp học
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search & Filter Bar */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm lớp học bởi tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterActive === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterActive === 'active'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterActive === 'inactive'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Class List */}
        <div className="grid gap-4 mb-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.classId}
              className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{cls.className}</h3>
                      {cls.isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full border border-border">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Mã lớp: <span className="font-mono font-semibold text-foreground">{cls.classCode}</span></p>
                    <p className="text-sm text-muted-foreground">Giảng viên: <span className="font-medium text-foreground">{cls.instructorName}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground/60" />
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <span className="font-medium text-foreground">{formatDate(cls.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground/60" />
                    <span className="text-muted-foreground">Kết thúc:</span>
                    <span className="font-medium text-foreground">{cls.endDate ? formatDate(cls.endDate) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground/60" />
                    <span className="font-medium text-foreground">{cls.maxStudents} Học sinh</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-muted-foreground/60" />
                    <span className="font-medium text-foreground">{cls.contests.length} Bài thi</span>
                  </div>
                </div>

                {selectedClass?.classId === cls.classId && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-foreground">Bài thi của lớp</h4>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm bài thi
                      </button>
                    </div>

                    <div className="space-y-3">
                      {mockContests.map((contest) => (
                        <div
                          key={contest.classContestId}
                          className="p-4 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-bold text-foreground mb-1">
                                {contest.contestInfo.title}
                              </h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {contest.contestInfo.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDateTime(contest.scheduledStartTime)} - {formatDateTime(contest.scheduledEndTime)}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(contest.status)}
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div className="bg-background p-2 rounded border border-border">
                              <div className="text-muted-foreground mb-1">Tổng điểm</div>
                              <div className="font-bold text-foreground">{contest.effectiveConfig.totalPoints}</div>
                            </div>
                            <div className="bg-background p-2 rounded border border-border">
                              <div className="text-muted-foreground mb-1">Điểm đạt</div>
                              <div className="font-bold text-foreground">{contest.effectiveConfig.passingScore}</div>
                            </div>
                            <div className="bg-background p-2 rounded border border-border">
                              <div className="text-muted-foreground mb-1">Hệ số</div>
                              <div className="font-bold text-foreground">{contest.weight}x</div>
                            </div>
                            <div className="bg-background p-2 rounded border border-border">
                              <div className="text-muted-foreground mb-1">Số lần thử tối đa</div>
                              <div className="font-bold text-foreground">{contest.effectiveConfig.maxAttempts}</div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                            <button className="px-3 py-1.5 text-sm bg-card text-foreground border border-border rounded hover:bg-muted transition-colors">
                              Edit Schedule
                            </button>
                            {contest.status === 'SCHEDULED' && (
                              <button className="px-3 py-1.5 text-sm bg-card text-destructive border border-destructive/20 rounded hover:bg-destructive/10 transition-colors">
                                Cancel Contest
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <AddContestModal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      classInfo={mockClassInfo}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy lớp học</h3>
            <p className="text-muted-foreground mb-4">Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterActive('all');
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
            >
              Làm mới
            </button>
          </div>
        )}
      </div>

      {/* Create Class Modal (simplified for demo) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Tạo lớp học mới</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Mã lớp học</label>
                  <input
                    type="text"
                    value={createForm.classCode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, classCode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Tên lớp học</label>
                  <input
                    type="text"
                    value={createForm.className}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, className: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Sinh viên tối đa</label>
                  <input
                    type="number"
                    value={createForm.maxStudents}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, maxStudents: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-bold shadow-lg shadow-primary/20"
              >
                Tạo lớp học
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-8 bg-card rounded-2xl border border-border shadow-2xl">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-foreground">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

    </div>



  );
};

export default ClassManagementDashboard;