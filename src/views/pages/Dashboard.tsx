import {
  DashboardStats
} from "@/views/dashboard/DashboardStats"
import {
  ProjectCard
} from "@/views/dashboard/ProjectCard"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Button
} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  FileDown,
  Plus,
  TrendingUp
} from "lucide-react"
import { Project } from "@/types/project"
import { ProjectDetail } from "@/views/projects/ProjectDetail"
import { ProjectForm } from "@/views/projects/ProjectForm"
import { useProjects } from "@/hooks/useProjects"
import {
  addProject,
  updateProject,
  deleteProject
} from "@/services/ProjectService"
import { useState, useMemo } from "react"

export default function Dashboard() {
  const { projects, loading, refetch } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'create' | 'edit' | 'copy' | null>(null)

  const stats = useMemo(() => {
    const totalProjects = projects.length

    const activeProjects = projects.filter(p => p.status === "active").length
    const completedProjects = projects.filter(p => p.status === "completed").length

    const now = new Date()
    const delayedProjects = projects.filter(p => {
      if (!p.endDate) return false
      // trễ nếu quá hạn và chưa completed
      return new Date(p.endDate) < now && p.status !== "completed"
    }).length

    // tổng số thành viên = tổng teamSize (nếu thiếu thì 0)
    const teamMembers = projects.reduce((sum, p) => sum + (Number(p.teamSize) || 0), 0)

    const avgProgress =
      totalProjects === 0
        ? 0
        : Math.round(
            projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / totalProjects
          )

    return { totalProjects, activeProjects, completedProjects, delayedProjects, teamMembers, avgProgress }
  }, [projects])


  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx")
      const rows = projects.map(p => ({
        "Tên dự án": p.name ?? "",
        "Mô tả": p.description ?? "",
        "Trạng thái": p.status ?? "",
        "Tiến độ (%)": typeof p.progress === "number" ? p.progress : "",
        "Ngày bắt đầu": p.startDate ? new Date(p.startDate).toLocaleDateString() : "",
        "Ngày kết thúc": p.endDate ? new Date(p.endDate).toLocaleDateString() : "",
        "Quản lý": p.manager ?? "",
        "Số thành viên": p.teamSize ?? "",
        "Ngân sách (VND)": p.budget ?? "",
        "Nhóm dự án": p.projectGroup ?? "",
        "Chủ đầu tư": p.investor ?? "",
        "Nguồn vốn": p.capitalSource ?? "",
        "Loại hình quản lý": p.managementType ?? "",
        "Cấp công trình": p.constructionLevel ?? "",
        "Loại công trình": p.constructionType ?? "",
        "Địa điểm xây dựng": p.constructionLocation ?? "",
        "Danh mục": p.category ?? "",
        "Vị trí": p.location ?? "",
        "Ngày tạo": p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
        "Ngày cập nhật": p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "",
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Projects")


      // auto width cột đơn giản
      const colWidths = Object.keys(rows[0] ?? {}).map(k => ({
        wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? "").length), 12)
      }))
      ws["!cols"] = colWidths

      const fileName = `du_an_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (e) {
      console.error("Xuất Excel thất bại:", e)
    }
  }

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

 const handleSaveProject = async (project: Project) => {
  try {
    const dataToSave = {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
      teamSize: project.teamSize,
      budget: project.budget,
      manager: project.manager,
      category: project.category || "",
      location: project.location || "",
      phases: project.phases || [],
      tasks: project.tasks || [],
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      investmentLevel: project.investmentLevel || "",
      investmentApproval: project.investmentApproval || "",
      projectGroup: project.projectGroup || "",
      investor: project.investor || "",
      investmentType: project.investmentType || "",
      managementType: project.managementType || "",
      projectScale: project.projectScale || "",
      designStepCount: project.designStepCount || 1,
      designCapacity: project.designCapacity || "",
      approvalDate: project.approvalDate || "",
      legalDocuments: project.legalDocuments || [],
      constructionLevel: project.constructionLevel || "",
      constructionType: project.constructionType || "",
      constructionLocation: project.constructionLocation || "",
      designStandards: project.designStandards || "",
      goals: project.goals || "",
      method: project.syntheticMethod || "",
      notes: project.notes || "",
      numberTBMT: project.numberTBMT || "",
      timeExceution: project.timeExceution || "",
      contractorCompanyName: project.contractorCompanyName || [],
      contrator: project.contrator || "",
      contractorPrice: project.contractorPrice || 0,
      relatedDocuments: project.relatedDocuments || [],
      roleExecutor: project.roleExecutor || "",
      capitalProject: project.capitalProject || "",
      field: project.field || ""
    }

    if (dialogMode === "create" || dialogMode === "copy") {
      await addProject(dataToSave)
    } else if (dialogMode === "edit" && project.id) {
      await updateProject(project.id, dataToSave)
    }

    await refetch() 
    setDialogMode(null)
    setSelectedProject(null)
  } catch (error) {
    console.error("Lỗi khi lưu dự án:", error)
  }
}

  const handleCloseDialog = () => {
    setDialogMode(null)
    setSelectedProject(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bảng Điều Khiển</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng bạn trở lại! Đây là những gì đang diễn ra với các dự án của bạn.
          </p>
        </div>

        {/* nhóm 2 nút ở cạnh nhau */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportExcel}
            disabled={loading || projects.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>

          <Button variant="construction" size="lg" onClick={handleCreateProject}>
            <Plus className="w-4 h-4 mr-2" />
            Dự Án Mới
          </Button>
        </div>
      </div>
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Dự Án Đang Hoạt Động
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={handleViewProject}
                    // onEdit={handleEditProject}
                    //  onCopy={handleCopyProject}
                    // onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hành Động Nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Dự Án Mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Tải Lên Mẫu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Lên Lịch Họp
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Báo Cáo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt Động Gần Đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Nguyễn Thị Minh</span> đã cập nhật tiến độ công việc
                  <div className="text-muted-foreground text-xs">2 giờ trước</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Trần Văn Hòa</span> đã tải lên tài liệu mới
                  <div className="text-muted-foreground text-xs">4 giờ trước</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Lê Thị Lan</span> đã hoàn thành mốc quan trọng
                  <div className="text-muted-foreground text-xs">1 ngày trước</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogMode === 'view'} onOpenChange={handleCloseDialog}>
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

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit' || dialogMode === 'copy'} onOpenChange={handleCloseDialog}>
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
