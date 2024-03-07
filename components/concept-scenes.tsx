"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

import { useProjects } from '@/lib/hooks/use-projects'
import SceneView from './scene-view';

export default function ConceptScenes() {
  const { scenes } = useProjects();

  console.log('scenes', scenes);

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
