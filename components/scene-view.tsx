import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import ShotView from '@/components/shot-view'

import { useProjects } from '@/lib/hooks/use-projects'
import { Scene, Shot } from '@/lib/types';
import { cn } from '@/lib/utils'

import { createClient } from '@/utils/supabase/client';
import { useSidebar } from '@/lib/hooks/use-sidebar';

interface IPropsSceneView {
  scene: Scene
}

export default function SceneView(props: IPropsSceneView) {
  const supabase = createClient()
  // const {shots, setShots } = useProjects();
  const [shots, setShots] = useState<Shot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<Shot | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [shouldUpdateDB, setShouldUpdateDB] = useState(false);
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const fetchShots = async () => {
      try {
        const shots = await supabase
          .from('shots')
          .select('*')
          .eq('scene_id', props.scene.id)
          .order('seq_num', { ascending: true });
        if (shots.error) {
          throw new Error(shots.error.message)
        }
        if (shots.data) {
          setShots(shots.data)
        }
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }
    fetchShots()
  }, [])

  const handleDragStart = (shot: Shot) => {
    setDraggedItem(shot);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggedItem === null || draggedItem.seq_num === index) return;
    let updatedShots = [...shots];
    updatedShots = updatedShots.filter(shot => shot.id !== draggedItem.id);
    updatedShots.splice(index, 0, draggedItem);
    updatedShots = updatedShots.map((shot, index) => {
      shot.seq_num = index;
      return shot;
    });
    setShots(updatedShots);
    setShouldUpdateDB(true);
  };

  const handleDragEnd = () => {
    setIsDraggable(false);
    setDraggedItem(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!shouldUpdateDB) return;
    try {
      shots.forEach(async (shot, index) => {
        const { error } = await supabase
          .from('shots')
          .update({ seq_num: index })
          .eq('id', shot.id);
        if (error) throw new Error(error.message)
      });
    } catch (error) {
      console.log(error)
    }
    setShouldUpdateDB(false);
  };

  if (isLoading) {
    return  (
      <div>Loading...</div>
    )
  }

  return (
    <>
      {(shots && shots.length > 0) && (
        <div className="grid grid-cols-12 gap-6 mt-10">
          {
            shots.map((shot, index) => (
              <Card
                key={shot.id}
                draggable={isDraggable}
                onDragStart={() => handleDragStart(shot)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDragEnd={handleDragEnd}
                onDrop={(event) => handleDrop(event)}
                className={cn(
                  'flex bg-white dark:bg-neutral-950 col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4',
                  draggedItem?.id === shot.id && 'border border-black rounded-sm opacity-30',
                  isSidebarOpen && 'md:col-span-12 lg:col-span-6 xl:col-span-4'
                )}
              >
                <CardContent className='w-full'>
                  <ShotView
                    listNumber={index + 1}
                    shot={shot}
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
  )
}
