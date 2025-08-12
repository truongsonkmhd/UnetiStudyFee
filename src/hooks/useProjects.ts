import { useEffect, useState } from "react"
import { getAllProjects } from "@/services/ProjectService"

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    setLoading(true)
    const data = await getAllProjects()
    setProjects(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return { projects, loading, refetch: fetchProjects }
}
