"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSpinner } from '@/components/ui/icons'

import { useProjects } from '@/lib/hooks/use-projects'
import { useExecTimeCounter } from "@/lib/hooks/use-exec-time-counter"

export default function ConceptView() {
  const { project, isGeneratingProjects } = useProjects()
  const { execTime, setPending } = useExecTimeCounter()

  useEffect(() => {
    if (isGeneratingProjects) {
      setPending(true)
    } else {
      setPending(false)
    }
  }, [isGeneratingProjects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project: {project.title}</CardTitle>
      </CardHeader>
      <CardContent className="mx-3">
        <div>{project?.concept ?? ''}</div>
        {isGeneratingProjects && (
          <div className='mt-2 flex items-center gap-1'>
            <IconSpinner />
            <span>Generating title... { `${execTime}s` }</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
