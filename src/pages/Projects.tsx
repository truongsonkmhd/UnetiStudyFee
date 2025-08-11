import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  CalendarDays,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Project } from "@/types/project"
import { ProjectDetail } from "@/components/projects/ProjectDetail"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { constructionProjectTemplate } from "@/data/projectTemplates"

// Mock data - sẽ được thay thế bằng Supabase sau này
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Khu Phức Hợp Văn Phòng Trung Tâm",
    description: "Tòa nhà văn phòng hiện đại 15 tầng với các tính năng thiết kế bền vững và tích hợp công nghệ thông minh.",
    status: "active" as const,
    progress: 67,
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    teamSize: 12,
    budget: 2500000,
    manager: "Nguyễn Thị Minh",
    location: "Hà Nội",
    category: "construction",
    phases: [],
    tasks: []
  },
  {
    id: "2", 
    name: "Cải Tạo Cầu Bến Cảng",
    description: "Cải tạo cấu trúc hoàn toàn và hiện đại hóa cây cầu lịch sử bao gồm gia cố chống động đất.",
    status: "planning" as const,
    progress: 23,
    startDate: "2024-03-01",
    endDate: "2025-06-30",
    teamSize: 8,
    budget: 1200000,
    manager: "Trần Văn Hòa",
    location: "Hồ Chí Minh",
    category: "infrastructure",
    phases: [],
    tasks: []
  },
  {
    id: "3",
    name: "Nhà Máy Năng Lượng Xanh",
    description: "Cơ sở năng lượng lai giữa mặt trời và gió với hệ thống lưu trữ pin để sản xuất điện bền vững.",
    status: "active" as const,
    progress: 89,
    startDate: "2023-09-01",
    endDate: "2024-04-30",
    teamSize: 15,
    budget: 5500000,
    manager: "Lê Thị Lan",
    location: "Đà Nẵng",
    category: "energy",
    phases: [],
    tasks: []
  },
  {
    id: "4",
    name: "Mở Rộng Ga Tàu Điện Ngầm",
    description: "Mở rộng ga tàu điện ngầm dưới lòng đất với các tính năng tiếp cận hiện đại và cải thiện luồng hành khách.",
    status: "on_hold" as const,
    progress: 45,
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    teamSize: 6,
    budget: 890000,
    manager: "Phạm Minh Tuấn",
    location: "Hà Nội",
    category: "transportation",
    phases: [],
    tasks: []
  },
  {
    id: "5",
    name: "Khu Dân Cư Sinh Thái",
    description: "Dự án khu dân cư hiện đại với thiết kế xanh và các tiện ích công cộng hoàn chỉnh.",
    status: "completed" as const,
    progress: 100,
    startDate: "2023-03-01",
    endDate: "2024-02-28",
    teamSize: 20,
    budget: 3200000,
    manager: "Võ Thị Hương",
    location: "Cần Thơ",
    category: "residential",
    phases: [],
    tasks: []
  },
  {
    id: "6",
    name: "Trung Tâm Thương Mại Mới",
    description: "Trung tâm thương mại 5 tầng với rạp chiếu phim, khu vui chơi và nhà hàng.",
    status: "cancelled" as const,
    progress: 15,
    startDate: "2024-01-01",
    endDate: "2024-10-31",
    teamSize: 10,
    budget: 1800000,
    manager: "Đặng Văn Khoa",
    location: "Nha Trang",
    category: "commercial",
    phases: [],
    tasks: []
  }
]

const statusConfig = {
  planning: { 
    label: "Lập Kế Hoạch", 
    className: "bg-status-planning text-white",
    icon: CalendarDays 
  },
  active: { 
    label: "Đang Hoạt Động", 
    className: "bg-status-active text-white",
    icon: CheckCircle 
  },
  on_hold: { 
    label: "Tạm Dừng", 
    className: "bg-status-delayed text-white",
    icon: AlertTriangle 
  },
  completed: { 
    label: "Hoàn Thành", 
    className: "bg-status-completed text-white",
    icon: CheckCircle 
  },
  cancelled: { 
    label: "Đã Hủy", 
    className: "bg-status-blocked text-white",
    icon: AlertTriangle 
  },
}

const priorityConfig = {
  high: { label: "Cao", className: "bg-destructive text-destructive-foreground" },
  medium: { label: "Trung Bình", className: "bg-warning text-warning-foreground" },
  low: { label: "Thấp", className: "bg-muted text-muted-foreground" }
}

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onCopy: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectCard({ project, onView, onEdit, onCopy, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  return (
    <Card className="hover:shadow-construction transition-shadow cursor-pointer" onClick={() => onView(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{project.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={status.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(project) }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Xem Chi Tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project) }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh Sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(project) }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Sao Chép
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(project) }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tiến Độ</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        {/* Project details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{project.teamSize} thành viên</span>
          </div>
        </div>
        
        {/* Budget and manager */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Ngân Sách</span>
            <span className="font-medium text-foreground">
              {project.budget.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground">Quản Lý</span>
            <span className="text-foreground">{project.manager}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'create' | 'edit' | 'copy' | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCreateProject = () => {
    setSelectedProject(null)
    setDialogMode('create')
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setDialogMode('view')
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setDialogMode('edit')
  }

  const handleCopyProject = (project: Project) => {
    setSelectedProject(project)
    setDialogMode('copy')
  }

  const handleDeleteProject = (project: Project) => {
    if (confirm(`Bạn có chắc chắn muốn xóa dự án "${project.name}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== project.id))
    }
  }

  const handleSaveProject = (projectData: Omit<Project, 'id'> | Project) => {
    if (dialogMode === 'create' || dialogMode === 'copy') {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Project
      setProjects(prev => [...prev, newProject])
    } else if (dialogMode === 'edit' && 'id' in projectData) {
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData as Project : p))
    }
    setDialogMode(null)
    setSelectedProject(null)
  }

  const handleCloseDialog = () => {
    setDialogMode(null)
    setSelectedProject(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dự Án</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tất cả các dự án xây dựng của bạn
          </p>
        </div>
        <Button variant="construction" size="lg" onClick={handleCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          Dự Án Mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm dự án, quản lý hoặc địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="planning">Lập Kế Hoạch</SelectItem>
                  <SelectItem value="active">Đang Hoạt Động</SelectItem>
                  <SelectItem value="on_hold">Tạm Dừng</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                  <SelectItem value="cancelled">Đã Hủy</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng Dự Án</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-status-active/10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-status-active" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang Hoạt Động</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-status-completed/10 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-status-completed" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoàn Thành</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng Ngân Sách</p>
                <p className="text-2xl font-bold">
                  {(projects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            onView={handleViewProject}
            onEdit={handleEditProject}
            onCopy={handleCopyProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy dự án nào phù hợp với bộ lọc của bạn.</p>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={dialogMode === 'view'} onOpenChange={() => dialogMode === 'view' && handleCloseDialog()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Dự Án</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectDetail
              project={selectedProject}
              onEdit={handleEditProject}
              onCopy={handleCopyProject}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit' || dialogMode === 'copy'} onOpenChange={() => (dialogMode === 'create' || dialogMode === 'edit' || dialogMode === 'copy') && handleCloseDialog()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <ProjectForm
            project={selectedProject || undefined}
            mode={dialogMode as 'create' | 'edit' | 'copy'}
            onSave={handleSaveProject}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}