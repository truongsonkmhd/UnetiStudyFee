// src/components/projects/ProjectForm.tsx
import { useState, useEffect } from "react"
import { addProject, updateProject } from "@/setup_firebase/services/projectService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Project } from "@/types/project"

interface Props {
  project?: Project
  mode: "create" | "edit" | "copy"
  onSave: (project: Project) => void
  onCancel: () => void
}

export function ProjectForm({ project, mode, onSave, onCancel }: Props) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (project && (mode === "edit" || mode === "copy")) {
      setName(project.name + (mode === "copy" ? " (Copy)" : ""))
    }
  }, [project, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "edit" && project) {
      await updateProject(project.id, { name })
      onSave({ ...project, name })
    } else {
      const newProject = await addProject({ name })
      onSave(newProject)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Tên dự án"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{mode === "edit" ? "Cập nhật" : "Lưu"}</Button>
      </div>
    </form>
  )
}
