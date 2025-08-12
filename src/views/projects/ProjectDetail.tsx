import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  CalendarDays, 
  Users, 
  DollarSign, 
  MapPin, 
  Edit, 
  Copy, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User
} from "lucide-react"
import { Project } from "@/types/project"
import { ProjectPhaseCard } from "./ProjectPhaseCard"
import { ProjectTaskList } from "./ProjectTaskList"

interface ProjectDetailProps {
  project: Project
  onEdit?: (project: Project) => void
  onCopy?: (project: Project) => void
  onClose?: () => void
}

const statusConfig = {
  planning: { 
    label: "Lập Kế Hoạch", 
    className: "bg-status-planning text-white",
    icon: Clock 
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

export function ProjectDetail({ project, onEdit, onCopy, onClose }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const completedPhases = project.phases?.filter(phase => phase.status === 'completed').length || 0
  const totalPhases = project.phases?.length || 0
  const phaseProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge className={status.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(project)}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh Sửa
            </Button>
          )}
          {onCopy && (
            <Button variant="outline" onClick={() => onCopy(project)}>
              <Copy className="w-4 h-4 mr-2" />
              Sao Chép
            </Button>
          )}
          <Button variant="outline" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiến Độ Tổng</p>
                <p className="text-2xl font-bold">{project.progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời Hạn</p>
                <p className="text-lg font-semibold">{formatDate(project.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nhóm</p>
                <p className="text-lg font-semibold">{project.teamSize} thành viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngân Sách</p>
                <p className="text-lg font-semibold">{formatCurrency(project.budget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="phases">Giai Đoạn</TabsTrigger>
          <TabsTrigger value="tasks">Công Việc</TabsTrigger>
          <TabsTrigger value="documents">Tài Liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Dự Án</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày Bắt Đầu</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày Kết Thúc</p>
                      <p className="font-medium">{formatDate(project.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quản Lý Dự Án</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <p className="font-medium">{project.manager}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Địa Điểm</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <p className="font-medium">{project.location || "Chưa xác định"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Mô Tả Chi Tiết</p>
                    <p className="text-sm leading-relaxed">{project.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiến Độ Thực Hiện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiến Độ Tổng Thể</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Giai Đoạn Hoàn Thành</span>
                      <span className="font-medium">{completedPhases}/{totalPhases}</span>
                    </div>
                    <Progress value={phaseProgress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thống Kê Nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tổng Giai Đoạn</span>
                    <span className="font-medium">{totalPhases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Đã Hoàn Thành</span>
                    <span className="font-medium text-green-600">{completedPhases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Đang Thực Hiện</span>
                    <span className="font-medium text-blue-600">
                      {project.phases?.filter(p => p.status === 'in_progress').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Chưa Bắt Đầu</span>
                    <span className="font-medium text-gray-600">
                      {project.phases?.filter(p => p.status === 'not_started').length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hoạt Động Gần Đây</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Chưa có hoạt động nào được ghi nhận
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-4">
            {project.phases?.map((phase) => (
              <ProjectPhaseCard key={phase.id} phase={phase} />
            ))}
            {!project.phases?.length && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có giai đoạn nào được thiết lập</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ProjectTaskList tasks={project.tasks || []} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chức năng quản lý tài liệu đang được phát triển</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}