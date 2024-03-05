"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SceneView from '@/components/scene-view'
import { StretchHorizontalIcon } from "lucide-react";

import { useProjects } from '@/lib/hooks/use-projects'
import { Scene } from '@/lib/types';
import { cn } from '@/lib/utils'

import { createClient } from '@/utils/supabase/client';

export default function ConceptScenes() {
  const supabase = createClient()
  const { scenes, setScenes } = useProjects();
  const [draggedItem, setDraggedItem] = useState<Scene | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);

  const handleDragStart = (scene: Scene) => {
    setDraggedItem(scene);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggedItem === null || draggedItem.seq_num === index) return;
    let updatedScenes = [...scenes];
    updatedScenes = updatedScenes.filter(scene => scene.id !== draggedItem.id);
    updatedScenes.splice(index, 0, draggedItem);
    updatedScenes = updatedScenes.map((scene, index) => {
      scene.seq_num = index;
      return scene;
    });
    setScenes(updatedScenes);
  };

  const handleDragEnd = () => {
    setIsDraggable(false);
    setDraggedItem(null);
  };

  const handleDrop = () => {
    try {
      scenes.forEach(async (scene, index) => {
        const { error } = await supabase
          .from('scenes')
          .update({ seq_num: index })
          .eq('id', scene.id);
        if (error) throw new Error(error.message)
      });
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <>
      {(scenes && scenes.length > 0) && (
        <Card className="my-10">
          <CardHeader>
            <CardTitle>Storyboard</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="hidden lg:grid grid-cols-12 gap-4 sticky top-[-2px] bg-white dark:bg-neutral-950 h-16 z-10">
              <div className="col-span-6 flex justify-center items-center">Prompt</div>
              <div className="col-span-3 flex justify-center items-center">Still</div>
              <div className="col-span-3 flex justify-center items-center">Video</div>
            </div> */}
            <div className="flex flex-col gap-6">
              {
                scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    draggable={isDraggable}
                    onDragStart={() => handleDragStart(scene)}
                    onDragOver={(event) => handleDragOver(event, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop} 
                    className={cn(
                      'flex bg-white dark:bg-neutral-950',
                      draggedItem?.id === scene.id && 'border border-black rounded-sm opacity-30'
                    )}
                  >
                    <StretchHorizontalIcon
                      className="border border-gray-300 rounded-sm p-1 my-4 mr-3 cursor-pointer"
                      onMouseDown={() => setIsDraggable(true)}
                      onMouseUp={() => setIsDraggable(false)}
                    />
                    <SceneView
                      listNumber={index + 1}
                      scene={scene}
                    />
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
