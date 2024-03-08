// this is the new video page

"use client"

import { useEffect } from 'react'
import ProjectView from '@/components/project-view'
import { useProjects } from '@/lib/hooks/use-projects'

export default function NewVideo() {
  const { resetState } = useProjects()

  useEffect(() => {
    resetState()
  }, [])

  return <ProjectView />
}
