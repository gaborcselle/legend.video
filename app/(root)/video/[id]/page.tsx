// this is the video detail page

"use client"

import { useEffect, useState } from 'react'
import ProjectDetails from '@/components/project-view'
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from '@/lib/hooks/use-projects'
import { createClient } from '@/utils/supabase/client'

export default function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const { setProject, setScenes, setIsGeneratingProject, setIsGeneratingScenes, sceneCount } = useProjects()
  
  useEffect(() => {
    // initializing that we're not generating project
    setIsGeneratingProject(false)

    // fetch the project data
    const getProject = async () => {
      try {
        const project = await supabase.from('projects').select('*').eq('id', params.id)
        if (project.error) {
          throw new Error(project.error.message)
        }
        if (project.data) {
          setProject(project.data[0])
        }

        // once we get the project data, we fetch the scenes
        const scenes = await supabase.from('scenes').select('*').eq('project_id', params.id).order('seq_num', { ascending: true })
        if (scenes.error) {
          throw new Error(scenes.error.message)
        }
        setIsLoading(false)

        // if we have scenes, we set the scenes
        if (scenes.data.length > 0) {
          setScenes(scenes.data)
        } else {
          // if we don't have scenes, we generate the scenes
          setIsGeneratingScenes(true)
          const res = await fetch('/api/gen_project_2_scenes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              project_id: project.data[0].id,
              num_scenes: sceneCount[0]
            }),
          })
          if (!res.ok) {
            throw new Error('Failed to generate scenes');
          }
          const data = await res.json()
          setScenes(data.scenes)
        }
      } catch (error) {
        setError('Failed to fetch project: ' + error)
      }
      setIsGeneratingScenes(false)
      setIsLoading(false)
    }
    getProject()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Skeleton className="h-[253px] w-[98%] rounded-x mt-10" />
        <Skeleton className="h-[553px] w-[98%] rounded-x mt-10" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <ProjectDetails />
}