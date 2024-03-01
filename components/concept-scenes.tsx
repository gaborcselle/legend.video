"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SceneView from '@/components/scene-view'

import { useProjects } from '@/lib/hooks/use-projects'

export default function ConceptScenes() {
  const { scenes } = useProjects()

  return (
    <>
      {(scenes && scenes.length > 0) && (
        <Card className="my-10">
          <CardHeader>
            <CardTitle>Storyboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden lg:grid grid-cols-12 gap-4 sticky top-[-2px] bg-white dark:bg-neutral-950 h-16 z-10">
              <div className="col-span-6 flex justify-center items-center">Prompt</div>
              <div className="col-span-3 flex justify-center items-center">Still</div>
              <div className="col-span-3 flex justify-center items-center">Video</div>
            </div>
            <div className="flex flex-col gap-6">
              {
                scenes.map((scene, index) => (
                  <SceneView
                    key={index}
                    listNumber={index + 1}
                    scene={scene}
                    index={index} // Pass the index here
                  />
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
