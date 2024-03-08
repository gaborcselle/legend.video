"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

import { useProjects } from '@/lib/hooks/use-projects'
import SceneView from './scene-view';
import { useEffect } from "react";
import { useExecTimeCounter } from "@/lib/hooks/use-exec-time-counter";
import { IconSpinner } from "./ui/icons";

export default function ConceptScenes() {
  const { scenes, isGeneratingScenes } = useProjects()
  const { execTime, setPending } = useExecTimeCounter()

  // if we're generating scenes, we add timer
  useEffect(() => {
    if (isGeneratingScenes) {
      setPending(true)
    } else {
      setPending(false)
    }
  }, [isGeneratingScenes])

  // if we're generating scenes, we show the according loader
  if (isGeneratingScenes) {
    return (
      <Card className='mt-10 p-4'>
        <CardContent>
          <div className='mt-2 flex items-center gap-1'>
            <IconSpinner />
            <span>Generating scenes... { `${execTime}s` }</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
     {(scenes && scenes.length > 0) && (
      <>
        {
          scenes.map((scene) => (
            <Card key={scene.id} className='mt-10 p-4'>
              <CardTitle>{scene.title}</CardTitle>
              <CardDescription>{scene.description}</CardDescription>
              <CardContent>
                <SceneView scene={scene} />
              </CardContent>
            </Card>
          ))
        }
      </>
     )}
    </>
  );
}
