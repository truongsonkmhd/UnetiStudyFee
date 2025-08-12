import { Project } from "./project"

export interface ProjectFormProps {
  project?: Project
  onSave: (project: Omit<Project, 'id'> | Project) => void
  onCancel: () => void
  mode: 'create' | 'edit' | 'copy'
  officeOnly?: boolean
}