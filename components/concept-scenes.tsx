"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

import { useProjects } from '@/lib/hooks/use-projects'
import { Scene } from '@/lib/types';

import { createClient } from '@/utils/supabase/client';
import SceneView from './scene-view';

export default function ConceptScenes() {
  const supabase = createClient()
  const { scenes, setScenes } = useProjects();

  return (
    <>
     {(scenes && scenes.length > 0) && (
      <>
        {
          scenes.map((scene) => (
            <Card key={scene.id} className='mt-10'>
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
