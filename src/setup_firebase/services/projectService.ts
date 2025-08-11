import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData
} from "firebase/firestore"
import { db } from "../firebase_config"
import { Project, ProjectTemplate } from "@/types/project"  // Đảm bảo đã định nghĩa các kiểu này

// Collections
const projectCollection = collection(db, "projects")
const projectTemplateCollection = collection(db, "projects_template")

// Lấy toàn bộ template dự án
export const getAllProjectsTemplate = async (): Promise<ProjectTemplate[]> => {
  const data = await getDocs(projectTemplateCollection)
  return data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  } as ProjectTemplate))
}

// Lấy toàn bộ dự án
export const getAllProjects = async (): Promise<Project[]> => {
  const data = await getDocs(projectCollection)
  return data.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id
  } as Project))
}

// Thêm dự án mới
export const addProject = async (newProject: Omit<Project, 'id'>): Promise<void> => {
  await addDoc(projectCollection, newProject)
}

// Cập nhật dự án
export const updateProject = async (
  id: string,
  updatedProject: Partial<Project>
): Promise<void> => {
  const projectDoc = doc(db, "projects", id)
  await updateDoc(projectDoc, updatedProject)
}

// Xoá dự án
export const deleteProject = async (id: string): Promise<void> => {
  const projectDoc = doc(db, "projects", id)
  await deleteDoc(projectDoc)
}
