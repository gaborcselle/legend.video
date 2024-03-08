"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSpinner } from '@/components/ui/icons'

import { useProjects } from '@/lib/hooks/use-projects'
import { useExecTimeCounter } from "@/lib/hooks/use-exec-time-counter"

export default function ConceptView() {
  const { project, isGeneratingProject } = useProjects()
  const { execTime, setPending } = useExecTimeCounter()

  // if we're generating project, we add timer
  useEffect(() => {
    if (isGeneratingProject) {
      setPending(true)
    } else {
      setPending(false)
    }
  }, [isGeneratingProject])

  return (
    <Card>
      {
        project.title && (
        <CardHeader className="p-4">
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        )
      }
      <CardContent className="mx-1">
        <div className={!project.title ? "mt-4" : ""}>{project?.concept ?? ''}</div>
        {isGeneratingProject && (
          <div className='mt-2 flex items-center gap-1'>
            <IconSpinner />
            <span>Generating title... { `${execTime}s` }</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
