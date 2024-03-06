"use client"

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import SceneView from '@/components/scene-view'

import { useProjects } from '@/lib/hooks/use-projects'
import { Scene } from '@/lib/types';
import { cn } from '@/lib/utils'

import { createClient } from '@/utils/supabase/client';
import { useSidebar } from '@/lib/hooks/use-sidebar';

export default function ConceptScenes() {
  const supabase = createClient()
  const { scenes, setScenes } = useProjects();
  const [draggedItem, setDraggedItem] = useState<Scene | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [shouldUpdateDB, setShouldUpdateDB] = useState(false);
  const { isSidebarOpen } = useSidebar();

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
    setShouldUpdateDB(true);
  };

  const handleDragEnd = () => {
    setIsDraggable(false);
    setDraggedItem(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (!shouldUpdateDB) return;
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
    setShouldUpdateDB(false);
  };

  return (
    <>
      {(scenes && scenes.length > 0) && (
        <div className="grid grid-cols-12 gap-6 mt-10">
          {
            scenes.map((scene, index) => (
              // adjust the grid layout here
              <Card
                key={scene.id}
                draggable={isDraggable}
                onDragStart={() => handleDragStart(scene)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDragEnd={handleDragEnd}
                onDrop={(event) => handleDrop(event, index)} 
                className={cn(
                  'flex bg-white dark:bg-neutral-950 col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6',
                  draggedItem?.id === scene.id && 'border border-black rounded-sm opacity-30',
                  isSidebarOpen && 'md:col-span-12 lg:col-span-6 xl:col-span-6'
                )}
              >
                <CardContent className='w-full'>
                  <SceneView
                    listNumber={index + 1}
                    scene={scene}
                    isDraggable={isDraggable}
                    setIsDraggable={setIsDraggable}
                  />
                </CardContent>
              </Card>
            ))
          }
        </div>
      )}
    </>
  );
}
