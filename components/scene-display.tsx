import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Scene, ScenePrompt, SceneStill, SceneVideo } from '@/lib/types'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { IconChevronLeft, IconChevronRight, IconPencil, IconRefresh, IconZoom } from '@/components/ui/icons'
import { useDebouncedCallback } from 'use-debounce';

import { createClient } from '@/utils/supabase/client'

interface ISceneProps {
  listNumber: number;
  scene: Scene;
  // updateStory: (updatedStory: StoryType, index: number) => void; // Updated to include index
  index: number; // Added index
}

export default function SceneDisplay(props: ISceneProps) {
  const supabase = createClient();
  // const { id, prompts, stills, videos } = props.story;
  const [prompts, setPrompts] = useState<ScenePrompt[]>([]);
  const [stills, setStills] = useState<SceneStill[]>([]);
  const [videos, setVideos] = useState<SceneVideo[]>([]);

  const [isStillGenerating, setIsStillGenerating] = useState<boolean>(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [currentStillIndex, setCurrentStillIndex] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isEditable, setIsEditable] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scenePrompts = await supabase
          .from('scene_prompts')
          .select('*')
          .eq('scene_id', props.scene.id);
          
        if (scenePrompts.error) {
          throw new Error('Failed to fetch prompts');
        }

        setPrompts(scenePrompts.data);

        const sceneStills = await supabase
          .from('scene_stills')
          .select('*')
          .eq('scene_prompt_id', scenePrompts.data[currentPromptIndex].id);

        if (sceneStills.error) {
          throw new Error('Failed to fetch stills');
        }

        setStills(sceneStills.data);
        const stillIndex = scenePrompts.data[currentPromptIndex].selected_still ?? 0;
        setCurrentStillIndex(stillIndex)

        if (sceneStills.data.length > 0) {
          const sceneVideos = await supabase
            .from('scene_videos')
            .select('*')
            .eq('scene_still_id', sceneStills.data[stillIndex].id);
  
          if (sceneVideos.error) {
            throw new Error('Failed to fetch videos');
          }

          setVideos(sceneVideos.data);
        }


      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  
  const handlePromptChange = (value: string) => {
    // let newPrompts = [...(prompts || [])] as ScenePrompt[];
    // newPrompts[currentPromptIndex] = value;
    //updateData("prompts", newPrompts);
  };

  const navigatePrompts = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentPromptIndex - 1 : currentPromptIndex + 1;
    setCurrentPromptIndex(newIndex);
  };

  const handleStillNavigation = async (newIndex: number) => {
    try {
      const sceneVideos = await supabase
        .from('scene_videos')
        .select('*')
        .eq('scene_still_id', stills[newIndex].id);
  
      if (sceneVideos.error) {
        throw new Error('Failed to fetch videos');
      }
  
      setVideos(sceneVideos.data);

      const updatedPrompt = await supabase
        .from('scene_prompts')
        .update({ 'selected_still': newIndex })
        .eq('id', prompts[currentPromptIndex].id)
        .select()

      if (updatedPrompt.error) {
        throw new Error('Failed to update prompt');
      }      

    } catch (error) {
      console.log(error);
    }
    setIsVideoLoading(false);
  };

  const debounceHandleStillNavigation = useDebouncedCallback(handleStillNavigation, 1000);

  const navigateStills = (direction: 'prev' | 'next') => {
    setVideos([]);
    setIsVideoLoading(true);
    const newIndex = direction === 'prev' ? currentStillIndex - 1 : currentStillIndex + 1;
    setCurrentStillIndex(newIndex);
    debounceHandleStillNavigation(newIndex)
  }

  const navigateVideos = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentVideoIndex - 1 : currentVideoIndex + 1;
    setCurrentVideoIndex(newIndex);
  };

  const generateStill = async () => {
    setIsStillGenerating(true);
    try {
      if (!prompts || prompts.length === 0 || !prompts[0]?.prompt) {
        throw new Error('No prompt provided');
      }
      const response = await fetch('/api/gen_store_still', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: props.scene.id,
          prompt_id: prompts[0].id,
          prompt: encodeURIComponent(prompts[0].prompt),
          seq_num: stills[stills.length - 1] ? stills[stills.length - 1].seq_num! + 1 : 0
        }),
      })
        
      if (!response.ok) {
        throw new Error('Failed to generate still');
      }
      const still = await response.json();
      setStills([
        ...stills,
        still
      ]);
    } catch (error) {
      console.log(error);
    }
    setIsStillGenerating(false);
  }

  const reGenerateStill = async () => {
    setVideos([]);
    generateStill();
  }

  const generateVideo = async () => {
    setIsVideoGenerating(true);
    try {
      if (!prompts || prompts.length === 0 || !prompts[0]?.prompt) {
        throw new Error('No prompt provided');
      }
      const response = await fetch('/api/gen_store_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_still_id: stills[currentStillIndex].id,
          image_url: stills[currentStillIndex].still_url,
          seq_num: videos[videos.length - 1] ? videos[videos.length - 1].seq_num! + 1 : 0
        }),
      })
        
      if (!response.ok) {
        throw new Error('Failed to generate still');
      }
      const video = await response.json();
      setVideos([
        ...videos,
        video
      ]);
    } catch (error) {
      console.log(error);
    }
    setIsVideoGenerating(false);
  };

  const isPrevPromptAvailable = currentPromptIndex > 0;
  const isNextPromptAvailable = currentPromptIndex < (prompts?.length ?? 0) - 1;
  const isPrevStillAvailable = currentStillIndex > 0;
  const isNextStillAvailable = currentStillIndex < (stills?.length ?? 0) - 1;
  const isPrevVideoAvailable = currentVideoIndex > 0;
  const isNextVideoAvailable = currentVideoIndex < (videos?.length ?? 0) - 1;

  return (
    <div className="grid grid-cols-12 gap-4 mt-3">
      <div className="col-span-6">
        <div className="flex">
          <div className="mr-4 min-w-4">{props.listNumber}.</div>
          <div className="flex flex-col flex-1">
            <Textarea
              rows={7}
              defaultValue={prompts && prompts.length > 0 ? prompts[0].prompt ?? "" : ""}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
            <div className="flex items-center mt-2">
              <Button className="rounded-full p-2" onClick={() => navigatePrompts('prev')} variant="ghost" disabled={!isPrevPromptAvailable}><IconChevronLeft /></Button>
              <span className="mx-2">{currentPromptIndex + 1}/{prompts?.length}</span>
              <Button className="rounded-full p-2"  onClick={() => navigatePrompts('next')} variant="ghost" disabled={!isNextPromptAvailable}><IconChevronRight /></Button>
              <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={() => setIsEditable(true)}><IconPencil /></Button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-3">
        <div className="flex flex-col justify-center items-center border rounded-lg min-h-[157px]">
          {stills && stills[currentStillIndex] ? (
            <>
              <img src={stills[currentStillIndex].still_url ?? ""} alt="Still" />
              <Button className="mt-2" variant="ghost" onClick={() => window.open(stills[currentStillIndex].still_url ?? "", '_blank')}><IconZoom /></Button>
            </>
          ) : ( 
            <Button className="min-w-24" onClick={generateStill} disabled={isStillGenerating || (prompts?.[currentPromptIndex]?.prompt || "").trim() === ""}>
              {isStillGenerating ? "Generating..." : "Generate Still"}
            </Button>
          )}
        </div>

        {
          (stills?.length ?? 0) > 0 && (
            <div className="flex items-center mt-2">
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateStills('prev')} disabled={!isPrevStillAvailable}><IconChevronLeft /></Button>
              <span className="mx-2">{currentStillIndex + 1}/{stills?.length}</span>
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateStills('next')} disabled={!isNextStillAvailable}><IconChevronRight /></Button>
              {stills && stills[currentStillIndex] && (
                <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={reGenerateStill} disabled={isStillGenerating || isVideoGenerating}><IconRefresh /></Button>
              )}
            </div>
          )
        }
      </div>
      <div className="col-span-3">
        <div className="flex flex-col justify-center items-center border rounded-lg min-h-[157px]">
          {videos && videos[currentVideoIndex] ? (
            <>
              <video src={videos[currentVideoIndex]?.video_url ?? ""} controls />
              <Button className="mt-2" variant="ghost" onClick={() => window.open(videos[currentVideoIndex]?.video_url ?? "", '_blank')}><IconZoom /></Button>
            </>
          ) : (
            <Button
              className="min-w-24"
              onClick={generateVideo}
              disabled={
                isVideoGenerating ||
                isStillGenerating ||
                !stills?.[currentStillIndex] ||
                (prompts?.[currentPromptIndex].prompt ?? "").trim() === "" ||
                isVideoLoading
              }
            >
              {isVideoGenerating ? "Generating..." : isVideoLoading ? "Loading..." : "Generate Video"}
            </Button>
          )}
        </div>

        {
          (videos?.length ?? 0) > 0 && (
            <div className="flex items-center mt-2">
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('prev')} disabled={!isPrevVideoAvailable}><IconChevronLeft /></Button>
              <span className="mx-2">{currentVideoIndex + 1}/{videos?.length ?? 0}</span>
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('next')} disabled={!isNextVideoAvailable}><IconChevronRight /></Button>
              {videos && videos[currentVideoIndex] && (
                <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={generateVideo} disabled={isVideoGenerating || isStillGenerating}><IconRefresh /></Button>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
  
}
