import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  CalendarDays,
  User,
  Flag,
  Clock,
  CheckCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Thiết kế bản vẽ kiến trúc tầng 1",
    description: "Hoàn thành thiết kế chi tiết cho tầng trệt của tòa nhà văn phòng",
    status: "in_progress" as const,
    priority: "high" as const,
    projectId: "1",
    projectName: "Khu Phức Hợp Văn Phòng Trung Tâm",
    assignee: "Nguyễn Thị Minh",
    dueDate: "2024-08-15",
    createdDate: "2024-08-01",
    tags: ["thiết kế", "kiến trúc"],
    completed: false
  },
  {
    id: "2",
    title: "Khảo sát địa chất công trình",
    description: "Thực hiện khảo sát địa chất để đánh giá độ ổn định nền móng",
    status: "todo" as const,
    priority: "high" as const,
    projectId: "2",
    projectName: "Cải Tạo Cầu Bến Cảng",
    assignee: "Trần Văn Hòa",
    dueDate: "2024-08-20",
    createdDate: "2024-08-03",
    tags: ["khảo sát", "địa chất"],
    completed: false
  },
  {
    id: "3",
    title: "Lắp đặt hệ thống điện mặt trời",
    description: "Hoàn thành việc lắp đặt các tấm pin năng lượng mặt trời trên mái nhà",
    status: "in_progress" as const,
    priority: "medium" as const,
    projectId: "3",
    projectName: "Nhà Máy Năng Lượng Xanh",
    assignee: "Lê Thị Lan",
    dueDate: "2024-08-25",
    createdDate: "2024-07-15",
    tags: ["điện", "năng lượng"],
    completed: false
  },
  {
    id: "4",
    title: "Kiểm tra an toàn lao động",
    description: "Thực hiện kiểm tra định kỳ về an toàn lao động tại công trường",
    status: "completed" as const,
    priority: "medium" as const,
    projectId: "1",
    projectName: "Khu Phức Hợp Văn Phòng Trung Tâm",
    assignee: "Phạm Minh Tuấn",
    dueDate: "2024-08-10",
    createdDate: "2024-08-05",
    tags: ["an toàn", "kiểm tra"],
    completed: true
  },
  {
    id: "5",
    title: "Nghiệm thu móng công trình",
    description: "Thực hiện nghiệm thu chất lượng móng trước khi tiếp tục xây dựng phần thân",
    status: "review" as const,
    priority: "high" as const,
    projectId: "4",
    projectName: "Mở Rộng Ga Tàu Điện Ngầm",
    assignee: "Võ Thị Hương",
    dueDate: "2024-08-18",
    createdDate: "2024-08-12",
    tags: ["nghiệm thu", "móng"],
    completed: false
  },
  {
    id: "6",
    title: "Báo cáo tiến độ tuần",
    description: "Tổng hợp và báo cáo tiến độ thực hiện các công việc trong tuần",
    status: "todo" as const,
    priority: "low" as const,
    projectId: "3",
    projectName: "Nhà Máy Năng Lượng Xanh",
    assignee: "Đặng Văn Khoa",
    dueDate: "2024-08-12",
    createdDate: "2024-08-08",
    tags: ["báo cáo", "tiến độ"],
    completed: false
  }
]

const statusConfig = {
  todo: { 
    label: "Cần Làm", 
    className: "bg-muted text-muted-foreground",
    icon: Clock 
  },
  in_progress: { 
    label: "Đang Thực Hiện", 
    className: "bg-status-active text-white",
    icon: Clock 
  },
  review: { 
    label: "Đang Xem Xét", 
    className: "bg-status-planning text-white",
    icon: CheckCircle 
  },
  completed: { 
    label: "Hoàn Thành", 
    className: "bg-status-completed text-white",
    icon: CheckCircle 
  },
}

const priorityConfig = {
  high: { label: "Cao", className: "bg-destructive text-destructive-foreground" },
  medium: { label: "Trung Bình", className: "bg-warning text-warning-foreground" },
  low: { label: "Thấp", className: "bg-muted text-muted-foreground" }
}

interface TaskCardProps {
  task: typeof mockTasks[0]
}

function TaskCard({ task }: TaskCardProps) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed

  return (
    <Card className="hover:shadow-construction transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={task.completed}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <CardTitle className={`text-base font-semibold line-clamp-2 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Xem Chi Tiết</DropdownMenuItem>
                  <DropdownMenuItem>Chỉnh Sửa</DropdownMenuItem>
                  <DropdownMenuItem>Sao Chép</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge className={status.className} variant="secondary">
                {status.label}
              </Badge>
              <Badge className={priority.className} variant="secondary">
                <Flag className="w-3 h-3 mr-1" />
                {priority.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  Quá Hạn
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Dự án:</span>
            <span className="font-medium text-foreground">{task.projectName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Người thực hiện:</span>
            <span className="text-foreground">{task.assignee}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hạn chót:</span>
            <span className={`font-medium ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
              {new Date(task.dueDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    
    let matchesTab = true
    if (activeTab === "my-tasks") {
      // In real app, filter by current user
      matchesTab = true
    } else if (activeTab === "overdue") {
      matchesTab = new Date(task.dueDate) < new Date() && !task.completed
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab
  })

  const taskStats = {
    total: mockTasks.length,
    todo: mockTasks.filter(t => t.status === 'todo').length,
    inProgress: mockTasks.filter(t => t.status === 'in_progress').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    overdue: mockTasks.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Công Việc</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tất cả các công việc trong dự án
          </p>
        </div>
        <Button variant="construction" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Công Việc Mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng Công Việc</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cần Làm</p>
                <p className="text-2xl font-bold">{taskStats.todo}</p>
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
                <p className="text-sm text-muted-foreground">Đang Thực Hiện</p>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
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
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quá Hạn</p>
                <p className="text-2xl font-bold">{taskStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm công việc, mô tả hoặc người thực hiện..."
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
                  <SelectItem value="todo">Cần Làm</SelectItem>
                  <SelectItem value="in_progress">Đang Thực Hiện</SelectItem>
                  <SelectItem value="review">Đang Xem Xét</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung Bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất Cả</TabsTrigger>
          <TabsTrigger value="my-tasks">Công Việc Của Tôi</TabsTrigger>
          <TabsTrigger value="overdue">Quá Hạn</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy công việc nào phù hợp với bộ lọc của bạn.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}