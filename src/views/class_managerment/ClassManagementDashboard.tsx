import React, { useState, useEffect } from 'react';
import CreateButton from '@/components/common/CreateButton';
import { Calendar, PlusCircle, Users, Trophy, Clock, Search, Edit2, Trash2, Eye, AlertCircle, CheckCircle, XCircle, PlayCircle, Link, Copy, RefreshCw, ExternalLink, Brain, QrCode, BookOpen, X, Plus } from 'lucide-react';
import { QRCode, Popover, Button } from 'antd';
import { ClazzResponse } from '@/model/class/ClazzResponse';
import classService from '@/services/classService';
import classContestService from '@/services/classContestService';
import courseService from '@/services/courseService';
import { actionAuth } from '@/components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ClassContestResponse } from '@/model/class-contest/ClassContestResponse';
import AddContestModal from './components/AddContestModal';
import RescheduleContestModal from './components/RescheduleContestModal';
import ClassAiInsights from './components/ClassAiInsights';


const ClassManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClazzResponse[]>([]);
  const [selectedClassContests, setSelectedClassContests] = useState<ClassContestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddContestModalOpen, setIsAddContestModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [contestToReschedule, setContestToReschedule] = useState<ClassContestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { jwtClaims } = actionAuth();
  const [detailTab, setDetailTab] = useState<'contests'>('contests');
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [aiInsightsClass, setAiInsightsClass] = useState<ClazzResponse | null>(null);

  const [createForm, setCreateForm] = useState({
    classCode: "",
    className: "",
    startDate: "",
    endDate: "",
    maxStudents: 0
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const navigate = useNavigate();

  // ── Handle Browser Back Button for AI Modal
  useEffect(() => {
    if (showAiInsights) {
      // Push a dummy state to history so back button just pops it
      window.history.pushState({ modal: 'ai-insights' }, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      if (showAiInsights) {
        setShowAiInsights(false);
        setAiInsightsClass(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showAiInsights]);

  const handleCreateClass = async () => {
    try {
      setLoading(true);

      const payload = {
        classCode: createForm.classCode,
        className: createForm.className,
        instructorId: jwtClaims.userID,
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: createForm.endDate ? new Date(createForm.endDate).toISOString() : null,
        maxStudents: createForm.maxStudents
      };

      let resultClass: any = null;
      if (isEdit && editingClassId) {
        await classService.admin.update(editingClassId, payload);
        toast.success('Cập nhật lớp học thành công!');
        resultClass = { classId: editingClassId, ...payload };
      } else {
        resultClass = await classService.admin.create(payload);
        toast.success('Tạo lớp học thành công!');
      }

      // Gán khóa học nếu có
      if (selectedCourseIds.length > 0 && resultClass?.classId) {
        try {
          await classService.admin.addCoursesToClass(resultClass.classId, selectedCourseIds);
        } catch (e) {
          toast.warning('Tạo lớp thành công nhưng không gán được khóa học. Bạn có thể gán sau.');
        }
      }

      // Reload danh sách lớp
      const data = await classService.admin.getAll();
      setClasses(data);

      // Đóng modal và reset form
      handleCloseModal();
    } catch (e) {
      console.error(e);
      toast.error((e as any)?.message || (isEdit ? 'Cập nhật lớp học thất bại!' : 'Tạo lớp học thất bại!'));
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setIsEdit(false);
    setEditingClassId(null);
    setCreateForm({ classCode: "", className: "", startDate: "", endDate: "", maxStudents: 0 });
    setSelectedCourseIds([]);
    setCourseSearch('');
  };

  // Edit class: populate form and open modal
  const handleEditClick = async (cls: ClazzResponse) => {
    setIsEdit(true);
    setEditingClassId(cls.classId || null);
    setCreateForm({
      classCode: cls.classCode || "",
      className: cls.className || "",
      startDate: cls.startDate ? new Date(cls.startDate).toISOString().split('T')[0] : "",
      endDate: cls.endDate ? new Date(cls.endDate).toISOString().split('T')[0] : "",
      maxStudents: cls.maxStudents || 0
    });

    // Load courses already assigned to this class
    if (cls.classId) {
      try {
        const courses = await classService.admin.getCoursesInClass(cls.classId);
        setSelectedCourseIds(courses.map((c: any) => c.courseId));
      } catch {
        setSelectedCourseIds([]);
      }
    }

    await fetchAvailableCourses();
    setShowCreateModal(true);
  };

  // Delete class
  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.")) return;
    try {
      setLoading(true);
      await classService.admin.delete(classId);
      toast.success("Đã xóa lớp học thành công!");
      setClasses(classes.filter(c => c.classId !== classId));
      if (selectedClass?.classId === classId) {
        setSelectedClass(null);
        setSelectedClassContests([]);
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error((err as any)?.message || "Không thể xóa lớp học!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle course selection for course picker
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Fetch available courses for the course picker
  const fetchAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await courseService.getAllCourses({ page: 0, size: 200 });
      setAvailableCourses(res.items || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setAvailableCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await classService.admin.getAll();
        setClasses(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
    fetchAvailableCourses();
  }, []);


  const fetchClassContests = async (classId: string) => {
    try {
      const data = await classContestService.getClassContests(classId);
      setSelectedClassContests(data);
    } catch (err: any) {
      console.error("Error fetching class contests:", err);
      toast.error(err?.message || "Không thể tải danh sách bài thi của lớp");
    }
  };

  const handleSelectClass = (cls: ClazzResponse) => {
    if (selectedClass?.classId === cls.classId) {
      setSelectedClass(null);
      setSelectedClassContests([]);
    } else {
      setSelectedClass(cls);
      if (cls.classId) fetchClassContests(cls.classId);
    }
  };

  const handleCancelContest = async (classContestId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy bài thi này?")) return;
    try {
      await classContestService.cancelContest(classContestId);
      toast.success("Đã hủy bài thi");
      if (selectedClass?.classId) fetchClassContests(selectedClass.classId);
    } catch (err: any) {
      console.error("Error cancelling contest:", err);
      toast.error(err?.message || "Không thể hủy bài thi");
    }
  };

  const handleRescheduleClick = (contest: ClassContestResponse) => {
    setContestToReschedule(contest);
    setIsRescheduleModalOpen(true);
  };

  const handleRegenerateInviteCode = async (classId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn tạo mã mời mới? Mã cũ sẽ không còn hiệu lực.")) return;
    try {
      const res = await classService.admin.regenerateInviteCode(classId);
      if (res) {
        setClasses(classes.map(c => c.classId === classId ? { ...c, inviteCode: res.inviteCode } : c));
        if (selectedClass?.classId === classId) {
          setSelectedClass({ ...selectedClass, inviteCode: res.inviteCode });
        }
        toast.success("Đã tạo mã mời mới");
      }
    } catch (err: any) {
      console.error("Error regenerating invite code:", err);
      toast.error(err?.message || "Không thể tạo lại mã mời");
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/join-class?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Đã sao chép link mời tham gia lớp học!");
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
      SCHEDULED: { color: 'bg-primary/10 text-primary border-primary/20', label: 'Đã lên lịch', icon: Clock },
      ONGOING: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Đang diễn ra', icon: PlayCircle },
      COMPLETED: { color: 'bg-muted text-muted-foreground border-border', label: 'Đã hoàn thành', icon: CheckCircle },
      CANCELLED: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Đã hủy', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.SCHEDULED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
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
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-[2000px] mx-auto px-6 py-8 space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Quản lý Lớp học
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Users size={16} />
              Quản lý danh sách lớp học và bài thi của bạn
            </p>
          </div>
          <button
            onClick={() => {
              setIsEdit(false);
              setEditingClassId(null);
              setCreateForm({
                classCode: "",
                className: "",
                startDate: "",
                endDate: "",
                maxStudents: 0
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            Thêm lớp học
          </button>
        </motion.div>


        <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                Tất cả
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterActive === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Hoạt động
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filterActive === 'inactive'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Ngừng hoạt động
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
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full border border-border">
                          Ngừng hoạt động
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Mã lớp: <span className="font-mono font-semibold text-foreground">{cls.classCode}</span></p>
                    <p className="text-sm text-muted-foreground">Giảng viên: <span className="font-medium text-foreground">{cls.instructorName}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!cls.studentCount || cls.studentCount === 0) {
                          toast.error("Lớp học chưa có sinh viên nào để phân tích!");
                          return;
                        }
                        setAiInsightsClass(cls);
                        setShowAiInsights(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-lg hover:brightness-110 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                      title="Đánh giá kết quả học tập AI"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      Phân tích AI
                    </button>
                    <button
                      onClick={() => handleSelectClass(cls)}
                      className={`p-2 rounded-lg transition-colors ${selectedClass?.classId === cls.classId ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/10'}`}
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(cls)}
                      className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => cls.classId && handleDeleteClass(cls.classId)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>                  </div>
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
                    <span className="font-medium text-foreground">{cls.studentCount || 0} / {cls.maxStudents || '—'} Học sinh</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-muted-foreground/60" />
                    <span className="font-medium text-foreground">{cls.contests?.length || 0} Bài thi</span>
                  </div>
                </div>

                {selectedClass?.classId === cls.classId && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-primary" />
                          <h4 className="font-bold text-foreground">Link mời tham gia lớp học</h4>
                        </div>
                        <button
                          onClick={() => handleRegenerateInviteCode(cls.classId!)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          title="Tạo mã mời mới"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Làm mới mã
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-[200px] bg-background border border-border px-3 py-2 rounded-lg font-mono text-sm text-foreground overflow-hidden whitespace-nowrap text-ellipsis">
                          {window.location.origin}/join-class?code={cls.inviteCode}
                        </div>
                        <Popover
                          content={
                            <div className="p-3 bg-white rounded-xl flex flex-col items-center gap-3">
                              <div id={`qr-code-${cls.classId}`} className="bg-white p-2 rounded-lg border border-slate-100">
                                <QRCode
                                  value={`${window.location.origin}/join-class?code=${cls.inviteCode}`}
                                  size={200}
                                  bordered={false}
                                  errorLevel="H"
                                />
                              </div>
                              <Button
                                size="small"
                                type="primary"
                                className="w-full font-bold"
                                onClick={() => {
                                  const canvas = document.getElementById(`qr-code-${cls.classId}`)?.querySelector('canvas');
                                  if (canvas) {
                                    const url = canvas.toDataURL();
                                    const a = document.createElement('a');
                                    a.download = `QR_Lop_${cls.classCode}.png`;
                                    a.href = url;
                                    a.click();
                                  }
                                }}
                              >
                                Tải mã QR về máy
                              </Button>
                            </div>
                          }
                          title={<span className="font-bold text-foreground">Mã QR tham gia lớp</span>}
                          trigger="click"
                          placement="bottomRight"
                        >
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm text-sm font-medium border border-border group"
                          >
                            <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Mã QR
                          </button>
                        </Popover>

                        <button
                          onClick={() => copyInviteLink(cls.inviteCode || '')}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm text-sm font-medium"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Chia sẻ link này cho học sinh để họ có thể tự tham gia vào lớp học của bạn.
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4 border-b border-border pb-1">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setDetailTab('contests')}
                          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${detailTab === 'contests' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                          Bài thi của lớp
                        </button>
                      </div>
                    </div>

                    {false ? (
                      <span />
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-foreground">Bài thi của lớp</h4>
                          <button
                            onClick={() => setIsAddContestModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Thêm bài thi
                          </button>
                        </div>

                        {selectedClassContests.length === 0 ? (
                          <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                            <p className="text-sm text-muted-foreground">Chưa có bài thi nào được gán cho lớp này</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedClassContests.map((contest) => (
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

                                <div className="grid grid-cols-5 gap-3 text-xs">
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
                                    <div className="text-muted-foreground mb-1">Số lần thử</div>
                                    <div className="font-bold text-foreground">{contest.effectiveConfig.maxAttempts}</div>
                                  </div>
                                  <div className="bg-background p-2 rounded border border-border">
                                    <div className="text-muted-foreground mb-1">Nội dung</div>
                                    <div className="font-bold text-foreground">{contest.contestInfo.codingExerciseCount}C | {contest.contestInfo.quizQuestionCount}Q</div>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                                  {(contest.status === 'SCHEDULED' || contest.status === 'ONGOING') && (
                                    <button
                                      onClick={() => handleRescheduleClick(contest)}
                                      className="px-3 py-1.5 text-sm bg-card text-foreground border border-border rounded hover:bg-muted transition-colors font-medium"
                                    >
                                      Thay đổi lịch
                                    </button>
                                  )}
                                  {contest.status === 'SCHEDULED' && (
                                    <button
                                      onClick={() => handleCancelContest(contest.classContestId)}
                                      className="px-3 py-1.5 text-sm bg-card text-destructive border border-destructive/20 rounded hover:bg-destructive/10 transition-colors font-medium"
                                    >
                                      Hủy bài thi
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {
          filteredClasses.length === 0 && (
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
          )
        }
      </div>

      {/* Create Class Modal (simplified for demo) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {isEdit ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
              </h2>
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

                {/* Course Picker */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Khóa học bắt buộc
                    {selectedCourseIds.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {selectedCourseIds.length} đã chọn
                      </span>
                    )}
                  </label>

                  {/* Tags đã chọn */}
                  {selectedCourseIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCourseIds.map(id => {
                        const c = availableCourses.find(x => x.courseId === id);
                        return c ? (
                          <span
                            key={id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30"
                          >
                            {c.title}
                            <button
                              type="button"
                              onClick={() => toggleCourseSelection(id)}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Search + List */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="relative border-b border-border">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        value={courseSearch}
                        onChange={e => setCourseSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto divide-y divide-border">
                      {loadingCourses ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">Đang tải...</div>
                      ) : availableCourses
                        .filter(c => c.title?.toLowerCase().includes(courseSearch.toLowerCase()))
                        .length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">Không tìm thấy khóa học</div>
                      ) : (
                        availableCourses
                          .filter(c => c.title?.toLowerCase().includes(courseSearch.toLowerCase()))
                          .map(course => {
                            const isSelected = selectedCourseIds.includes(course.courseId);
                            return (
                              <button
                                key={course.courseId}
                                type="button"
                                onClick={() => toggleCourseSelection(course.courseId)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors text-sm ${isSelected
                                  ? 'bg-primary/8 text-primary'
                                  : 'text-foreground hover:bg-muted'
                                  }`}
                              >
                                <div
                                  className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                    }`}
                                >
                                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span className="flex-1 font-medium truncate">{course.title}</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] whitespace-nowrap">
                                  <Users className="w-3 h-3" />
                                  {course.enrolledCount ?? 0} / {course.capacity ?? '—'}
                                </div>
                                {course.level && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
                                    {course.level}
                                  </span>
                                )}
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Chọn các khóa học, sinh viên sẽ được tự động đăng ký khi tham gia lớp.</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-bold shadow-lg shadow-primary/20"
              >
                {isEdit ? 'Lưu thay đổi' : 'Tạo lớp học'}
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


      {/* Modals */}
      <AddContestModal
        isOpen={isAddContestModalOpen}
        onClose={() => setIsAddContestModalOpen(false)}
        classId={selectedClass?.classId || ''}
        className={selectedClass?.className || ''}
        onSuccess={() => selectedClass?.classId && fetchClassContests(selectedClass.classId)}
      />

      <RescheduleContestModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setContestToReschedule(null);
        }}
        contest={contestToReschedule}
        onSuccess={() => selectedClass?.classId && fetchClassContests(selectedClass.classId)}
      />

      {/* AI Insights Full-Page Overlay */}
      {showAiInsights && aiInsightsClass && (
        <ClassAiInsights
          classId={aiInsightsClass.classId || ''}
          className={aiInsightsClass.className || ''}
          onClose={() => {
            // If the modal was opened with pushState, we should go back
            if (window.history.state?.modal === 'ai-insights') {
              window.history.back();
            } else {
              setShowAiInsights(false);
              setAiInsightsClass(null);
            }
          }}
        />
      )}
    </div>
  );
};


export default ClassManagementDashboard;