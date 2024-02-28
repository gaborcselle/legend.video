"use client"

import { useEffect, useState } from 'react'
import ProjectDetails from '@/components/project-setup'
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from '@/lib/hooks/use-projects'
import { createClient } from '@/utils/supabase/client'

export default function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const { setProject, setScenes } = useProjects()
  
  useEffect(() => {
    const getProject = async () => {
      try {
        // promise all later here
        const projects = await supabase.from('projects').select('*').eq('id', params.id)
        if (projects.error) {
          throw new Error(projects.error.message)
        }
        if (projects.data) {
          setProject(projects.data[0])
        }
        const scenes = await supabase.from('scenes').select('*').eq('project_id', params.id)
        if (scenes.error) {
          throw new Error(scenes.error.message)
        }
        if (scenes.data) {
          setScenes(scenes.data)
        }
      } catch (error) {
        setError('Failed to fetch project: ' + error)
      }
      setIsLoading(false)
    }
    getProject()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Skeleton className="h-[553px] max-w-[862px] w-5/6 rounded-x mt-10" />
        <Skeleton className="h-[553px] max-w-[862px] w-5/6 rounded-x mt-10" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <ProjectDetails />
}