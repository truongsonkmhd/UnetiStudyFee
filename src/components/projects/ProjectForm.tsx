import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ProjectTask } from "@/types/project"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/utils/taskLabels"
import {
  CalendarIcon,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Building,
  MapPin,
  Users,
  DollarSign,
  Pencil
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Project, ProjectTemplate, ProjectPhase } from "@/types/project"
import { useProjectTemplates } from "@/hooks/useProjectsTemplates"
import { buildDownloadUrl } from "@/helpers/buildDownloadUrl"
import { getStorage, ref, uploadBytes, getDownloadURL, updateMetadata } from "firebase/storage"

interface ProjectFormProps {
  project?: Project
  onSave: (project: Omit<Project, 'id'> | Project) => void
  onCancel: () => void
  mode: 'create' | 'edit' | 'copy'
  officeOnly?: boolean
}

export function ProjectForm({ project, onSave, onCancel, mode }: ProjectFormProps) {
  const { projectTemplates, loading } = useProjectTemplates()
  const [expandedPhases, setExpandedPhases] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [newTask, setNewTask] = useState<Partial<ProjectTask>>({
    name: "",
    description: "",
    status: "not_started",
    priority: "medium",
    progress: 0,
    legalBasis: "",
    documentsTask: []
  })
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string; type: string } | null>(null)

  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "planning",
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    teamSize: 1,
    budget: 0,
    manager: "",
    location: "",
    category: "",
    phases: [],
    tasks: [],
    investmentLevel: "",
    investmentApproval: "",
    projectGroup: "",
    investor: "",
    capitalSource: "",
    investmentType: "",
    managementType: "",
    biddingMethod: "",
    projectScale: "",
    designStepCount: 1,
    designCapacity: "",
    approvalDate: "",
    legalDocuments: [],
    constructionLevel: "",
    constructionType: "",
    executionTime: "",
    simplifiedLocation: "",
    designStandards: "",
    goals: "",
    method: "",
    notes: ""
  })

  useEffect(() => {
    if (project && (mode === 'edit' || mode === 'copy')) {
      setFormData({
        ...project,
        phases: project.phases?.map((phase) => ({
          ...phase,
          id: mode === 'copy' ? `phase-${Date.now()}-${Math.random()}` : phase.id,
          tasks: phase.tasks.map((task) => ({
            ...task,
            id: mode === 'copy' ? `task-${Date.now()}-${Math.random()}` : task.id,
          }))
        })),
        tasks: project.tasks?.map((task) => ({
          ...task,
          id: mode === 'copy' ? `task-${Date.now()}-${Math.random()}` : task.id
        })),
        id: mode === 'edit' ? project.id : undefined
      })
      setActiveTab("basic")
    }
  }, [project, mode])

  const getDownloadUrl = (fileUrl: string, fileName?: string) =>
    buildDownloadUrl(fileUrl, fileName)

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePhaseTasks = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    const phases = template.phases.map((phase, index) => ({
      ...phase,
      id: `phase-${Date.now()}-${index}`,
      tasks: phase.tasks.map((task, taskIndex) => ({
        ...task,
        id: `task-${Date.now()}-${index}-${taskIndex}`,
        phaseId: `phase-${Date.now()}-${index}`
      }))
    }))
    const tasks = phases.flatMap(phase => phase.tasks)
    setFormData(prev => ({
      ...prev,
      name: prev.name || template.name,
      category: template.category,
      phases,
      tasks
    }))
    setActiveTab("phases")
  }

  const handleTaskSubmit = async () => {
    const taskData: ProjectTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}-${Math.random()}`,
      name: newTask.name || "",
      description: newTask.description || "",
      status: newTask.status || "not_started",
      priority: newTask.priority || "medium",
      progress: newTask.progress || 0,
      legalBasis: newTask.legalBasis || "",
      documentsTask: newTask.documentsTask || []
    }

    const updatedPhases = formData.phases?.map(phase => {
      if (phase.id === currentPhaseId) {
        const updatedTasks = editingTask
          ? phase.tasks.map(t => t.id === editingTask.id ? taskData : t)
          : [...phase.tasks, taskData]
        return { ...phase, tasks: updatedTasks }
      }
      return phase
    })

    const updatedTasks = editingTask
      ? formData.tasks?.map(t => t.id === editingTask.id ? taskData : t)
      : [...(formData.tasks || []), taskData]

    setFormData(prev => ({
      ...prev,
      phases: updatedPhases,
      tasks: updatedTasks
    }))

    setIsTaskDialogOpen(false)
    resetTaskForm()
  }

  const resetTaskForm = () => {
    setNewTask({
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      progress: 0,
      legalBasis: "",
      documentsTask: []
    })
    setEditingTask(null)
    setCurrentPhaseId(null)
  }

  const handleAddTask = (phaseId: string) => {
    setCurrentPhaseId(phaseId)
    setEditingTask(null)
    setNewTask({
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      progress: 0,
      legalBasis: "",
      documentsTask: []
    })
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: ProjectTask, phaseId: string) => {
    setEditingTask(task)
    setNewTask(task)
    setCurrentPhaseId(phaseId)
    setIsTaskDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const projectData = {
      ...formData,
      id: mode === 'edit' ? project?.id : undefined,
      createdAt: mode === 'create' ? new Date().toISOString() : project?.createdAt,
      updatedAt: new Date().toISOString()
    } as Project
    onSave(projectData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {mode === 'create' && 'Tạo Dự Án Mới'}
            {mode === 'edit' && 'Chỉnh Sửa Dự Án'}
            {mode === 'copy' && 'Sao Chép Dự Án'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create' && 'Tạo một dự án mới từ template hoặc tùy chỉnh'}
            {mode === 'edit' && 'Cập nhật thông tin dự án'}
            {mode === 'copy' && 'Tạo bản sao của dự án hiện có'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            {mode === 'edit' ? 'Cập Nhật' : 'Tạo Dự Án'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="basic">Thông Tin Cơ Bản</TabsTrigger>
          <TabsTrigger value="phases">Giai Đoạn</TabsTrigger>
          <TabsTrigger value="settings">Cài Đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Chọn Template Dự Án
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {loading ? (
                  <p>Đang tải template...</p>
                ) : (
                  projectTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            <Badge variant="outline">{template.phases.length} giai đoạn</Badge>
                          </div>
                          <Building className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Separator />

              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setFormData(prev => ({ ...prev, phases: [], tasks: [] }))
                    setActiveTab("basic")
                  }}
                >
                  Tạo Dự Án Trống
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Thông Tin Dự Án
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Dự Án *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên dự án"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Mô tả chi tiết về dự án"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa Điểm</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Địa điểm thực hiện dự án"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Trạng Thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Lập Kế Hoạch</SelectItem>
                      <SelectItem value="active">Đang Hoạt Động</SelectItem>
                      <SelectItem value="on_hold">Tạm Dừng</SelectItem>
                      <SelectItem value="completed">Hoàn Thành</SelectItem>
                      <SelectItem value="cancelled">Đã Hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cấp Chủ Trương Đầu Tư</Label>
                    <Input value={formData.investmentLevel || ""} onChange={(e) => handleInputChange('investmentLevel', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Phê Duyệt Quyết Định Đầu Tư</Label>
                    <Input value={formData.investmentApproval || ""} onChange={(e) => handleInputChange('investmentApproval', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Nhóm Dự Án</Label>
                    <Input value={formData.projectGroup || ""} onChange={(e) => handleInputChange('projectGroup', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Chủ Đầu Tư</Label>
                    <Input value={formData.investor || ""} onChange={(e) => handleInputChange('investor', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Nguồn Vốn</Label>
                    <Input value={formData.capitalSource || ""} onChange={(e) => handleInputChange('capitalSource', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Hình Thức Đầu Tư</Label>
                    <Input value={formData.investmentType || ""} onChange={(e) => handleInputChange('investmentType', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Loại Hình Quản Lý</Label>
                    <Input value={formData.managementType || ""} onChange={(e) => handleInputChange('managementType', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Gói Thầu Chính</Label>
                    <Input value={formData.biddingMethod || ""} onChange={(e) => handleInputChange('biddingMethod', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Quy Mô Dự Án</Label>
                    <Input value={formData.projectScale || ""} onChange={(e) => handleInputChange('projectScale', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Số Bước Thiết Kế</Label>
                    <Input type="number" min={1} value={formData.designStepCount || 1} onChange={(e) => handleInputChange('designStepCount', parseInt(e.target.value))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Đơn Vị Thiết Kế</Label>
                    <Input value={formData.designCapacity || ""} onChange={(e) => handleInputChange('designCapacity', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày Lập Quyết Toán</Label>
                    <Input type="date" value={formData.approvalDate || ""} onChange={(e) => handleInputChange('approvalDate', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Cấp Công Trình</Label>
                    <Input value={formData.constructionLevel || ""} onChange={(e) => handleInputChange('constructionLevel', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Loại Công Trình</Label>
                    <Input value={formData.constructionType || ""} onChange={(e) => handleInputChange('constructionType', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Thời Gian Thực Hiện</Label>
                    <Input value={formData.executionTime || ""} onChange={(e) => handleInputChange('executionTime', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Địa Điểm Rút Gọn</Label>
                    <Input value={formData.simplifiedLocation || ""} onChange={(e) => handleInputChange('simplifiedLocation', e.target.value)} />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Tiêu Chuẩn Thiết Kế</Label>
                    <Input value={formData.designStandards || ""} onChange={(e) => handleInputChange('designStandards', e.target.value)} />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Mục Tiêu</Label>
                    <Textarea value={formData.goals || ""} onChange={(e) => handleInputChange('goals', e.target.value)} rows={2} />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Phương Pháp Thực Hiện</Label>
                    <Textarea value={formData.method || ""} onChange={(e) => handleInputChange('method', e.target.value)} rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi Tiết Thực Hiện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày Bắt Đầu</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(new Date(formData.startDate), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate ? new Date(formData.startDate) : undefined}
                          onSelect={(date) => handleInputChange('startDate', date?.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày Kết Thúc</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(new Date(formData.endDate), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate ? new Date(formData.endDate) : undefined}
                          onSelect={(date) => handleInputChange('endDate', date?.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Quản Lý Dự Án</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="manager"
                      value={formData.manager || ""}
                      onChange={(e) => handleInputChange('manager', e.target.value)}
                      placeholder="Tên người quản lý dự án"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Quy Mô Nhóm</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="teamSize"
                      type="number"
                      min="1"
                      value={formData.teamSize || 1}
                      onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân Sách (VNĐ)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData.budget || 0}
                      onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
          setIsTaskDialogOpen(open)
          if (!open) resetTaskForm()
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Sửa Công Việc' : 'Thêm Công Việc'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taskName">Tên Công Việc *</Label>
                <Input
                  id="taskName"
                  value={newTask.name || ""}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên công việc"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Mô Tả</Label>
                <Textarea
                  id="taskDescription"
                  value={newTask.description || ""}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về công việc"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskStatus">Trạng Thái</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        status: value as 'not_started' | 'in_progress' | 'completed' | 'blocked'
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Chưa Bắt Đầu</SelectItem>
                      <SelectItem value="in_progress">Đang Thực Hiện</SelectItem>
                      <SelectItem value="completed">Hoàn Thành</SelectItem>
                      <SelectItem value="on_hold">Tạm Dừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Ưu Tiên</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        priority: value as 'low' | 'medium' | 'high' | 'critical'
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung Bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskProgress">Tiến Độ (%)</Label>
                <Input
                  id="taskProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={newTask.progress || 0}
                  onChange={(e) => setNewTask(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskLegalBasis">Cơ Sở Pháp Lý</Label>
                <Input
                  id="taskLegalBasis"
                  value={newTask.legalBasis || ""}
                  onChange={(e) => setNewTask(prev => ({ ...prev, legalBasis: e.target.value }))}
                  placeholder="Nhập cơ sở pháp lý (nếu có)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTaskDialogOpen(false)
                  resetTaskForm()
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleTaskSubmit}
                disabled={!newTask.name}
              >
                {editingTask ? 'Cập Nhật' : 'Thêm Công Việc'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giai Đoạn Dự Án</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.phases && formData.phases.length > 0 ? (
                <div className="space-y-4">
                  {formData.phases.map((phase, index) => (
                    <Card key={phase.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Giai đoạn {phase.order}</Badge>
                              <h4 className="font-semibold">{phase.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                            {phase.legalBasis && (
                              <p className="text-xs text-blue-600">
                                Cơ sở pháp lý: {phase.legalBasis}
                              </p>
                            )}
                            <div className="space-y-1 mt-3">
                              <Label className="text-sm font-medium">Tài liệu đính kèm</Label>
                              <Input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || [])
                                  const newDocs = files.map((file) => ({
                                    id: `doc-${Date.now()}-${Math.random()}`,
                                    name: file.name,
                                    uploadedAt: new Date().toISOString(),
                                    uploadedBy: 'Bạn',
                                    type: 'other',
                                    url: URL.createObjectURL(file),
                                  }))
                                  const updatedPhases = formData.phases?.map((p) =>
                                    p.id === phase.id
                                      ? {
                                        ...p,
                                        documentProjectPhase: [
                                          ...(p.documentProjectPhase || []),
                                          ...newDocs,
                                        ],
                                      } as ProjectPhase
                                      : p
                                  )
                                  setFormData((prev) => ({
                                    ...prev,
                                    phases: updatedPhases,
                                  }))
                                }}
                              />
                            </div>
                            {phase.documentProjectPhase && phase.documentProjectPhase.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {phase.documentProjectPhase.map((doc) => {
                                  const href = getDownloadUrl(doc.url || "#", doc.name)
                                  return (
                                    <div key={doc.id} className="inline-flex items-center gap-2">
                                      <a
                                        href={href}
                                        download={doc.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors text-sm text-blue-700 max-w-[200px]"
                                        title="Tải về để xem"
                                      >
                                        <FileText className="w-4 h-4" />
                                        <span className="truncate">{doc.name}</span>
                                      </a>

                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setCurrentFile({
                                            url: doc.url,
                                            name: doc.name,
                                            type: doc.name.split('.').pop()?.toLowerCase() || ''
                                          })
                                          setIsViewerOpen(true)
                                        }}
                                      >
                                        Xem
                                      </Button>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const updatedPhases = formData.phases?.map((p) =>
                                            p.id === phase.id
                                              ? { ...p, documentProjectPhase: p.documentProjectPhase?.filter((d) => d.id !== doc.id) }
                                              : p
                                          )
                                          setFormData((prev) => ({ ...prev, phases: updatedPhases }))
                                        }}
                                        aria-label="Xóa"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>

                                  )
                                })}
                              </div>
                            )}

                            <div className="mt-3">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  className="text-sm font-medium flex items-center gap-1 text-primary"
                                  onClick={() => togglePhaseTasks(phase.id)}
                                >
                                  <span className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-xs">
                                    {expandedPhases.includes(phase.id) ? '-' : '+'}
                                  </span>
                                  Công việc: {phase.tasks.length} nhiệm vụ
                                </button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddTask(phase.id)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Thêm Công Việc
                                </Button>
                              </div>

                              {expandedPhases.includes(phase.id) && (
                                <div className="mt-2 ml-6 space-y-2">
                                  {phase.tasks.map(task => (
                                    <div key={task.id} className="p-3 rounded-md bg-muted/40 border relative">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h5 className="font-semibold flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            {task.name}
                                          </h5>
                                          <p className="text-sm text-muted-foreground">{task.description}</p>
                                          <p className="text-xs mt-1 text-blue-600">Cơ sở pháp lý: {task.legalBasis}</p>
                                          <p className="text-xs mt-1">
                                            Trạng thái: {TASK_STATUS_LABELS[task.status]}, Ưu tiên: {TASK_PRIORITY_LABELS[task.priority]}, Tiến độ: {task.progress}%
                                          </p>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditTask(task, phase.id)}
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              const newTasks = formData.tasks?.filter(t => t.id !== task.id)
                                              const updatedPhases = formData.phases?.map(p =>
                                                p.id === phase.id ? { ...p, tasks: p.tasks.filter(t => t.id !== task.id) } : p
                                              )
                                              setFormData(prev => ({
                                                ...prev,
                                                tasks: newTasks,
                                                phases: updatedPhases
                                              }))
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Chưa có giai đoạn nào được thiết lập
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("template")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Chọn Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài Đặt Nâng Cao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh Mục</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Danh mục dự án (VD: construction, infrastructure)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Tiến Độ Hiện Tại (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress || 0}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {currentFile && (
              currentFile.type === 'pdf' ? (
                <iframe
                  src={getDownloadUrl(currentFile.url, currentFile.name)}
                  width="100%"
                  height="600px"
                  title={currentFile.name}
                />
              ) : (
                <iframe
                  // src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getDownloadUrl(currentFile.url, currentFile.name))}`}
                  src={'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Ffilesamples.com%2Fsamples%2Fdocument%2Fdocx%2Fsample2.docx'}
                  width="100%"
                  height="600px"
                  title={currentFile.name}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}