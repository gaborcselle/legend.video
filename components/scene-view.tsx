import { useState, useEffect } from "react";
import { Scene, ScenePrompt, SceneStill, SceneVideo } from '@/lib/types'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { IconChevronLeft, IconChevronRight, IconPencil, IconRefresh, IconZoom } from '@/components/ui/icons'
import { useDebouncedCallback } from 'use-debounce';

import { createClient } from '@/utils/supabase/client'

interface ISceneProps {
  listNumber: number;
  scene: Scene;
  index: number; // Added index
}

export default function SceneView(props: ISceneProps) {
  const supabase = createClient();
  const [prompts, setPrompts] = useState<ScenePrompt[]>([]);
  const [stills, setStills] = useState<SceneStill[]>([]);
  const [videos, setVideos] = useState<SceneVideo[]>([]);

  const [isStillGenerating, setIsStillGenerating] = useState<boolean>(false);
  const [isSillLoading, setIsSillLoading] = useState<boolean>(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [currentStillIndex, setCurrentStillIndex] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [editedPrompt, setEditedPrompt] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scenePrompts = await supabase
          .from('scene_prompts')
          .select('*')
          .order('id', { ascending: true })
          .eq('scene_id', props.scene.id);
          
        if (scenePrompts.error) {
          throw new Error('Failed to fetch prompts');
        }

        setPrompts(scenePrompts.data);
        const propmtIndex = props.scene.selected_prompt ?? 0;
        setCurrentPromptIndex(propmtIndex);

        const sceneStills = await supabase
          .from('scene_stills')
          .select('*')
          .order('id', { ascending: true })
          .eq('scene_prompt_id', scenePrompts.data[propmtIndex].id);

        if (sceneStills.error) {
          throw new Error('Failed to fetch stills');
        }

        setStills(sceneStills.data);
        const stillIndex = scenePrompts.data[propmtIndex].selected_still ?? 0;
        setCurrentStillIndex(stillIndex)

        if (sceneStills.data.length > 0) {
          const sceneVideos = await supabase
            .from('scene_videos')
            .select('*')
            .order('id', { ascending: true })
            .eq('scene_still_id', sceneStills.data[stillIndex].id);
  
          if (sceneVideos.error) {
            throw new Error('Failed to fetch videos');
          }

          setVideos(sceneVideos.data);
          const videoIndex = sceneStills.data[stillIndex].selected_video ?? 0;
          setCurrentVideoIndex(videoIndex);
        }

        if (scenePrompts.data.length > 0) {
          if (sceneStills.data.length === 0) {
            generateStill(scenePrompts.data[propmtIndex]);
          }
        }

      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  
  const handlePromptChange = (value: string) => {
    if (isEditable) {
      setEditedPrompt(value);
      return;
    }
    setPrompts([
      ...prompts.slice(0, currentPromptIndex),
      { ...prompts[currentPromptIndex], prompt: value },
      ...prompts.slice(currentPromptIndex + 1),
    ]);
  };

  const handlePromptNavigation = async (newIndex: number) => {
    try {
      const sceneStills = await supabase
        .from('scene_stills')
        .select('*')
        .eq('scene_prompt_id', prompts[newIndex].id);

      if (sceneStills.error) {
        throw new Error('Failed to fetch stills');
      }

      const sceneVideos = await supabase
        .from('scene_videos')
        .select('*')
        .eq('scene_still_id', sceneStills.data[0].id);

      if (sceneVideos.error) {
        throw new Error('Failed to fetch videos');
      }

      const updatedScene = await supabase
        .from('scenes')
        .update({ 'selected_prompt': prompts[newIndex].seq_num })
        .eq('id', props.scene.id)
        .select();

      if (updatedScene.error) {
        throw new Error('Failed to update scene');
      }

      setStills(sceneStills.data);
      setVideos(sceneVideos.data);

    } catch (error) {
      console.log(error);
    }
    setIsVideoLoading(false);
    setIsSillLoading(false);
  };

  const debounceHandlePromptNavigation = useDebouncedCallback(handlePromptNavigation, 1000);

  const navigatePrompts = (direction: 'prev' | 'next') => {
    setStills([]);
    setIsSillLoading(true);
    setVideos([]);
    setIsVideoLoading(true);
    const newIndex = direction === 'prev' ? currentPromptIndex - 1 : currentPromptIndex + 1;
    setCurrentPromptIndex(newIndex);
    debounceHandlePromptNavigation(newIndex)
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

  const handleVideoNavigation = async (newIndex: number) => {
    try {
      const updatedStill = await supabase
        .from('scene_stills')
        .update({ 'selected_video': newIndex })
        .eq('id', stills[currentStillIndex].id)
        .select()

      if (updatedStill.error) {
        throw new Error('Failed to update still');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debounceHandleVideoNavigation = useDebouncedCallback(handleVideoNavigation, 1000);

  const navigateVideos = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentVideoIndex - 1 : currentVideoIndex + 1;
    setCurrentVideoIndex(newIndex);
    debounceHandleVideoNavigation(newIndex)
  };

  const generateStill = async (prompt?: ScenePrompt) => {
    setIsStillGenerating(true);
    let newPrompt: ScenePrompt | undefined;
    try {
      // check if we have to create a new prompt
      if (isEditable) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not found');
        }

        const newPromptRes = await supabase
          .from('scene_prompts')
          .insert({
            owner_id: user?.id,
            prompt: editedPrompt,
            scene_id: props.scene.id,
            selected_still: 0,
            seq_num: prompts.length
          })
          .select();

        if (newPromptRes.error) {
          throw new Error('Failed to create prompt');
        }

        newPrompt = newPromptRes.data[0];

        const updatedScene = await supabase
          .from('scenes')
          .update({ 'selected_prompt': newPrompt?.seq_num })
          .eq('id', props.scene.id)
          .select();

        if (updatedScene.error) {
          throw new Error('Failed to update scene');
        }
      }

      if (!prompt) {
        if (!prompts || prompts.length === 0 || !prompts[0]?.prompt) {
          throw new Error('No prompt provided');
        }
      }

      const currentPrompt = prompt ?? prompts[currentPromptIndex]

      const response = await fetch('/api/gen_store_still', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene_id: props.scene.id,
          prompt_id: isEditable ? newPrompt?.id : currentPrompt.id,
          prompt: encodeURIComponent(isEditable ? newPrompt?.prompt ?? "" : currentPrompt.prompt ?? ""),
          seq_num: isEditable ? 0 : stills[stills.length - 1] ? stills[stills.length - 1].seq_num! + 1 : 0
        }),
      })
        
      if (!response.ok) {
        throw new Error('Failed to generate still');
      }
      const still = await response.json();

      if (isEditable) {
        setCurrentPromptIndex(prompts.length);
        setEditedPrompt("");
        setIsEditable(false);
        setStills([still]);
        setVideos([]);
        setPrompts([
          ...prompts,
          newPrompt!
        ]);
      } else {
        setStills([
          ...stills,
          still
        ]);
        setCurrentStillIndex(stills.length);
      }
    } catch (error) {
      console.log(error);
    }
    setIsStillGenerating(false);
  }

  const reGenerateStill = async () => {
    setVideos([]);
    try {
      const updatedPrompt = await supabase
        .from('scene_prompts')
        .update({ 'selected_still': stills.length })
        .eq('id', prompts[currentPromptIndex].id)
        .select() 
  
      if (updatedPrompt.error) {
        throw new Error('Failed to update prompt');
      }
    } catch (error) {
      console.log(error);
    }
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
      setCurrentVideoIndex(videos.length);
    } catch (error) {
      console.log(error);
    }
    setIsVideoGenerating(false);
  };

  const reGenerateVideo = async () => {
    try {
      const updatedStill = await supabase
        .from('scene_stills')
        .update({ 'selected_video': videos.length })
        .eq('id', stills[currentStillIndex].id)
        .select()

      if (updatedStill.error) {
        throw new Error('Failed to update still');
      }
    } catch (error) {
      console.log(error);
    }
    generateVideo();
  }

  const toggleEdit = () => {
    if (isEditable) {
      setIsEditable(false);
    } else {
      if (editedPrompt.length === 0) {
        setEditedPrompt(prompts[currentPromptIndex].prompt ?? "");
      }
      setIsEditable(true);
    }
  }

  const isPrevPromptAvailable = currentPromptIndex > 0;
  const isNextPromptAvailable = currentPromptIndex < (prompts?.length ?? 0) - 1;
  const isPrevStillAvailable = currentStillIndex > 0;
  const isNextStillAvailable = currentStillIndex < (stills?.length ?? 0) - 1;
  const isPrevVideoAvailable = currentVideoIndex > 0;
  const isNextVideoAvailable = currentVideoIndex < (videos?.length ?? 0) - 1;

  return (
    <div className="grid grid-cols-12 gap-4 mt-3">
      <div className="font-bold text-lg lg:hidden">{props.listNumber}.</div>
      <div className="col-span-12 lg:col-span-6">
        <div className="mb-1 lg:hidden">Concepts:</div>
        <div className="flex">
          <div className="mr-4 min-w-4 hidden lg:block">{props.listNumber}.</div>
          <div className="flex flex-col flex-1">
            {isEditable ? (
            <Textarea
              rows={7}
              value={isEditable ? editedPrompt : prompts && prompts.length > 0 ? prompts[currentPromptIndex].prompt ?? "" : ""}
              onChange={(e) => handlePromptChange(e.target.value)}
              disabled={!isEditable || isStillGenerating || isVideoGenerating}
            />
            ) : (
              <div className="text-sm max-h-[157px] overflow-y-auto border rounded-lg p-1">{prompts && prompts.length > 0 ? prompts[currentPromptIndex].prompt ?? "" : ""}</div>
            )}
            <div className="flex items-center mt-2">
              <Button className="rounded-full p-2" onClick={() => navigatePrompts('prev')} variant="ghost" disabled={!isPrevPromptAvailable || isStillGenerating || isVideoGenerating || isEditable}><IconChevronLeft /></Button>
              <span className="mx-2">
                {
                  isEditable ? `${prompts?.length + 1}/${prompts?.length + 1}` : `${currentPromptIndex + 1}/${prompts?.length}`
                }
              </span>
              <Button className="rounded-full p-2"  onClick={() => navigatePrompts('next')} variant="ghost" disabled={!isNextPromptAvailable || isStillGenerating || isVideoGenerating || isEditable}><IconChevronRight /></Button>
              <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={toggleEdit} disabled={isStillGenerating || isVideoGenerating}><IconPencil /></Button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-3">
        <div className="mb-1 lg:hidden">Stills:</div>
        <div className="flex flex-col justify-center items-center border rounded-lg min-h-[157px]">
          {(stills && stills[currentStillIndex]) ? (
            <>
              {
                isEditable ? (
                  <Button
                    className="min-w-24"
                    onClick={() => generateStill()}
                    disabled={
                      isStillGenerating ||
                      (prompts?.[currentPromptIndex]?.prompt || "").trim() === "" ||
                      (isEditable && (prompts?.[currentPromptIndex]?.prompt || "").trim() === editedPrompt.trim())
                    }
                  >
                    {isStillGenerating ? "Generating..." : isSillLoading ? "Loading..." : "Generate Still"}
                  </Button>
                ) : (
                  <>
                    <img src={stills[currentStillIndex].still_url ?? ""} alt="Still" />
                    <Button className="mt-2" variant="ghost" onClick={() => window.open(stills[currentStillIndex].still_url ?? "", '_blank') || isEditable}><IconZoom /></Button>
                  </>
                )
              }
            </>
          ) : ( 
            <Button className="min-w-24" onClick={() => generateStill()} disabled={isStillGenerating || (prompts?.[currentPromptIndex]?.prompt || "").trim() === "" || isSillLoading}>
              {isStillGenerating ? "Generating..." : isSillLoading ? "Loading..." : "Generate Still"}
            </Button>
          )}
        </div>

        {
          ((stills?.length ?? 0) > 0 && !isEditable) && (
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
      <div className="col-span-12 lg:col-span-3">
        <div className="mb-1 lg:hidden">Videos:</div>
        <div className="flex flex-col justify-center items-center border rounded-lg min-h-[157px]">
          {videos && videos[currentVideoIndex] ? (
            <>
              {
                isEditable ? (
                  <Button className="min-w-24" onClick={generateVideo} disabled>
                    Generate Video
                  </Button>
                ) : (
                  <>
                    <video src={videos[currentVideoIndex].video_url ?? ""} controls></video>
                    <Button className="mt-2" variant="ghost" onClick={() => window.open(videos[currentVideoIndex].video_url ?? "", '_blank')}><IconZoom /></Button>
                  </>
                )
              
              }
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
                isVideoLoading ||
                isEditable
              }
            >
              {isVideoGenerating ? "Generating..." : isVideoLoading ? "Loading..." : "Generate Video"}
            </Button>
          )}
        </div>

        {
          ((videos?.length ?? 0) > 0 && !isEditable) && (
            <div className="flex items-center mt-2">
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('prev')} disabled={!isPrevVideoAvailable}><IconChevronLeft /></Button>
              <span className="mx-2">{currentVideoIndex + 1}/{videos?.length ?? 0}</span>
              <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('next')} disabled={!isNextVideoAvailable}><IconChevronRight /></Button>
              {videos && videos[currentVideoIndex] && (
                <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={reGenerateVideo} disabled={isVideoGenerating || isStillGenerating}><IconRefresh /></Button>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
  
}
