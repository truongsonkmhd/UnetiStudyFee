import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

export type TaskInput = {
  title: string
  description: string
  status: "todo" | "in_progress" | "review" | "completed"
  priority: "high" | "medium" | "low"
  projectName: string
  assignee: string
  dueDate: string            // yyyy-mm-dd
  tags: string[]
  /** Nếu ở chế độ edit sẽ có, tạo mới thì undefined */
  progress?: number          // 0..100
}

type Props = {
  onAdd: (task: TaskInput) => void
  onUpdate?: (taskId: string, data: TaskInput) => void
  initialData?: (TaskInput & { id: string; progress?: number }) | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export default function TaskForm({
  onAdd,
  onUpdate,
  initialData = null,
  isOpen,
  onOpenChange,
  hideTrigger = false,
}: Props) {
  const controlled = typeof isOpen === "boolean"
  const [open, setOpen] = useState(false)
  const mergedOpen = controlled ? (isOpen as boolean) : open
  const setMergedOpen = (v: boolean) => {
    if (controlled && onOpenChange) onOpenChange(v)
    else setOpen(v)
  }

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskInput["status"]>("todo")
  const [priority, setPriority] = useState<TaskInput["priority"]>("medium")
  const [projectName, setProjectName] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [progress, setProgress] = useState<number | undefined>(undefined) // chỉ dùng khi edit

  // load dữ liệu khi edit
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description)
      setStatus(initialData.status)
      setPriority(initialData.priority)
      setProjectName(initialData.projectName)
      setAssignee(initialData.assignee)
      setDueDate(initialData.dueDate)
      setTags(initialData.tags || [])
      setProgress(
        typeof initialData.progress === "number" ? initialData.progress : undefined
      )
    } else {
      resetFields(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  const addTag = () => {
    const t = tagInput.trim()
    if (!t) return
    if (!tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput("")
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const resetFields = (closeDialog = true) => {
    if (closeDialog) setMergedOpen(false)
    setTitle("")
    setDescription("")
    setStatus("todo")
    setPriority("medium")
    setProjectName("")
    setAssignee("")
    setDueDate("")
    setTags([])
    setTagInput("")
    setProgress(undefined)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tagInput.trim()) addTag()

    const payload: TaskInput = {
      title,
      description,
      status,
      priority,
      projectName,
      assignee,
      dueDate,
      tags,
      // chỉ đính kèm progress nếu đang edit & người dùng nhập số hợp lệ
      ...(typeof progress === "number" ? { progress } : {}),
    }

    if (initialData?.id && onUpdate) {
      onUpdate(initialData.id, payload)
      setMergedOpen(false)
    } else {
      onAdd(payload) // tạo mới: không có progress (ẩn)
      resetFields()
    }
  }

  const isEdit = Boolean(initialData?.id)

  return (
    <Dialog open={mergedOpen} onOpenChange={setMergedOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="construction" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Công Việc Mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh Sửa Công Việc" : "Thêm Công Việc Mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="mb-2 block">Tiêu đề</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề công việc" required />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Mô tả</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả công việc" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Trạng thái</Label>
              <Select value={status} onValueChange={(v: TaskInput["status"]) => setStatus(v)}>
                <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Cần Làm</SelectItem>
                  <SelectItem value="in_progress">Đang Thực Hiện</SelectItem>
                  <SelectItem value="review">Đang Xem Xét</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Độ ưu tiên</Label>
              <Select value={priority} onValueChange={(v: TaskInput["priority"]) => setPriority(v)}>
                <SelectTrigger><SelectValue placeholder="Chọn độ ưu tiên" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung Bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="projectName" className="mb-2 block">Tên dự án</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nhập tên dự án"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee" className="mb-2 block">Người thực hiện</Label>
              <Input id="assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Nhập tên người thực hiện" />
            </div>

            <div>
              <Label htmlFor="dueDate" className="mb-2 block">Hạn chót</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="mb-2 block">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs gap-1">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Nhập tag rồi nhấn Enter / , / Tab"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
            />
          </div>


          <Button type="submit" className="w-full">
            {isEdit ? "Cập Nhật" : "Thêm Công Việc"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
