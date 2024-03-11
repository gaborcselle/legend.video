import { useState, useEffect } from "react";
import { Shot, ShotPrompt, ShotStill, ShotVideo } from '@/lib/types'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { IconChevronLeft, IconChevronRight, IconCoin, IconPencil, IconRefresh, IconSpinner, IconZoom } from '@/components/ui/icons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import ExpandableMedia from "@/components/expandable-media";
import { useDebouncedCallback } from 'use-debounce';

import { createClient } from '@/utils/supabase/client'
import { useProjects } from "@/lib/hooks/use-projects";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { StretchHorizontalIcon } from "lucide-react";
import { DeleteShot } from "./delete-shot";
import { useExecTimeCounter } from "@/lib/hooks/use-exec-time-counter";

interface IShotProps {
  listNumber: number;
  shot: Shot;
  isDraggable: boolean;
  setIsDraggable: (value: boolean) => void;
  deleteShot: (shotID: number) => void;
  deleteLoading: boolean;
}

export default function ShotView(props: IShotProps) {
  const supabase = createClient();
  const [prompts, setPrompts] = useState<ShotPrompt[]>([]);
  const [stills, setStills] = useState<ShotStill[]>([]);
  const [videos, setVideos] = useState<ShotVideo[]>([]);

  const [isStillGenerating, setIsStillGenerating] = useState<boolean>(false);
  const [isSillLoading, setIsSillLoading] = useState<boolean>(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [currentStillIndex, setCurrentStillIndex] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [expand, setExpand] = useState<number>(-1);

  const { userProfile, setUserProfile, setIsCreditAlertOpen } = useProjects();
  const { isSidebarOpen } = useSidebar();
  const { execTime, setPending } = useExecTimeCounter();

  useEffect(() => {
    // fetch the shot data
    const fetchData = async () => {
      // fetch the shot prompts
      try {
        const shotPrompts = await supabase
          .from('shot_prompts')
          .select('*')
          .order('id', { ascending: true })
          .eq('shot_id', props.shot.id);
          
        if (shotPrompts.error) {
          throw new Error('Failed to fetch prompts');
        }

        setPrompts(shotPrompts.data);
        const propmtIndex = props.shot.selected_prompt ?? 0;
        setCurrentPromptIndex(propmtIndex);

        // fetch the shot stills
        const shotStills = await supabase
          .from('shot_stills')
          .select('*')
          .order('id', { ascending: true })
          .eq('shot_prompt_id', shotPrompts.data[propmtIndex].id);

        if (shotStills.error) {
          throw new Error('Failed to fetch stills');
        }

        setStills(shotStills.data);
        const stillIndex = shotPrompts.data[propmtIndex].selected_still ?? 0;
        setCurrentStillIndex(stillIndex)

        // fetch the shot videos if we have stills
        if (shotStills.data.length > 0) {
          const shotVideos = await supabase
            .from('shot_videos')
            .select('*')
            .order('id', { ascending: true })
            .eq('shot_still_id', shotStills.data[stillIndex].id);
  
          if (shotVideos.error) {
            throw new Error('Failed to fetch videos');
          }

          setVideos(shotVideos.data);
          const videoIndex = shotStills.data[stillIndex].selected_video ?? 0;
          setCurrentVideoIndex(videoIndex);
        }

        // if we have prompt but we don't have still, we generate still 
        if (shotPrompts.data.length > 0) {
          if (shotStills.data.length === 0) {
            generateStill(shotPrompts.data[propmtIndex]);
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
    // fetch the shot stills
    try {
      const shotStills = await supabase
        .from('shot_stills')
        .select('*')
        .eq('shot_prompt_id', prompts[newIndex].id);

      if (shotStills.error) {
        throw new Error('Failed to fetch stills');
      }

      // fetch the shot videos
      const shotVideos = await supabase
        .from('shot_videos')
        .select('*')
        .eq('shot_still_id', shotStills.data[0].id);

      if (shotVideos.error) {
        throw new Error('Failed to fetch videos');
      }

      // update the selected prompt of the shot
      const updatedShot = await supabase
        .from('shots')
        .update({ 'selected_prompt': prompts[newIndex].seq_num })
        .eq('id', props.shot.id)
        .select();

      if (updatedShot.error) {
        throw new Error('Failed to update shot');
      }

      setStills(shotStills.data);
      setVideos(shotVideos.data);

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
    // fetch the shot videos
    try {
      const shotVideos = await supabase
        .from('shot_videos')
        .select('*')
        .eq('shot_still_id', stills[newIndex].id);
  
      if (shotVideos.error) {
        throw new Error('Failed to fetch videos');
      }
  
      setVideos(shotVideos.data);

      // update the selected still of the prompt
      const updatedPrompt = await supabase
        .from('shot_prompts')
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
    // update the selected video of the still
    try {
      const updatedStill = await supabase
        .from('shot_stills')
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

  const generateStill = async (prompt?: ShotPrompt) => {
    setIsStillGenerating(true);
    setPending(true);
    let newPrompt: ShotPrompt | undefined;
    try {
      // check if we have to create a new prompt
      if (isEditable) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not found');
        }

        const newPromptRes = await supabase
          .from('shot_prompts')
          .insert({
            owner_id: user?.id,
            prompt: editedPrompt,
            shot_id: props.shot.id,
            selected_still: 0,
            seq_num: prompts.length
          })
          .select();

        if (newPromptRes.error) {
          throw new Error('Failed to create prompt');
        }

        newPrompt = newPromptRes.data[0];

        const updatedShot = await supabase
          .from('shots')
          .update({ 'selected_prompt': newPrompt?.seq_num })
          .eq('id', props.shot.id)
          .select();

        if (updatedShot.error) {
          throw new Error('Failed to update shot');
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
          shot_id: props.shot.id,
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
        setCurrentStillIndex(0);
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
    setPending(false);
  }

  const reGenerateStill = async () => {
    setVideos([]);
    try {
      const updatedPrompt = await supabase
        .from('shot_prompts')
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
    if ((userProfile?.credits || 0) < 20) {
      setIsCreditAlertOpen(true);
      return;
    }
    setIsVideoGenerating(true);
    setPending(true);
    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      setUserProfile({
        ...userProfile,
        credits: userProfile.credits! - 20
      })
      const response = await fetch('/api/gen_store_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shot_still_id: stills[currentStillIndex].id,
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
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          credits: userProfile.credits! + 10
        })
      }
      console.log(error);
    }
    setIsVideoGenerating(false);
    setPending(false);
  };

  const reGenerateVideo = async () => {
    try {
      const updatedStill = await supabase
        .from('shot_stills')
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  const isPrevPromptAvailable = currentPromptIndex > 0;
  const isNextPromptAvailable = currentPromptIndex < (prompts?.length ?? 0) - 1;
  const isPrevStillAvailable = currentStillIndex > 0;
  const isNextStillAvailable = currentStillIndex < (stills?.length ?? 0) - 1;
  const isPrevVideoAvailable = currentVideoIndex > 0;
  const isNextVideoAvailable = currentVideoIndex < (videos?.length ?? 0) - 1;

  return (
    <div className="flex flex-col flex-1">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          {/* Note from Gabor: I added a p-0 here so that the accordions wouldn't take up so much space. */}
          <AccordionTrigger className="font-bold p-0">
            <div className="flex items-center flex-1 min-h-[55px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <StretchHorizontalIcon
                    className="border border-gray-300 rounded-sm p-1 my-4 mr-3 cursor-pointer hidden md:block"
                    onMouseDown={() => props.setIsDraggable(true)}
                    onMouseUp={() => props.setIsDraggable(false)}
                  />
                </TooltipTrigger>
                <TooltipContent>Click and drag to reorder</TooltipContent>
              </Tooltip>
              {/* TODO(gabor): remove the prompt slice as appropriate */}
              {props.shot?.title ?? "Untitled"}
              <div className="flex-1 flex justify-end pr-3">
                <div onClick={(e) => handleDeleteClick(e)}>
                  <DeleteShot shotID={props.shot.id} deleteShot={props.deleteShot} deleteLoading={props.deleteLoading} />
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
          <div className="flex flex-col flex-1">
            {isEditable ? (
              <Textarea
                rows={7}
                value={isEditable ? editedPrompt : prompts && prompts.length > 0 ? prompts[currentPromptIndex].prompt ?? "" : ""}
                onChange={(e) => handlePromptChange(e.target.value)}
                disabled={!isEditable || isStillGenerating || isVideoGenerating}
              />
              ) : (
                <div className="text-sm rounded-lg">{prompts && prompts.length > 0 ? prompts[currentPromptIndex].prompt ?? "" : ""}</div>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div>
        <div className="flex flex-col justify-center items-center border rounded-lg min-h-[157px]">
          {videos && videos[currentVideoIndex] ? (
            <video
              src={videos[currentVideoIndex].video_url ?? ""}
              controls
              poster={stills[currentStillIndex].still_url ?? ""}
              autoPlay
              loop
            />
          ) : (
            <>
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
                          (isEditable && (prompts?.[currentPromptIndex]?.prompt || "").trim() === editedPrompt.trim()) ||
                          (userProfile?.credits || 0) < 1
                        }
                      >
                        {isStillGenerating ? "Generating..." : isSillLoading ? "Loading..." : "Generate Still"}
                      </Button>
                    ) : (
                      <ExpandableMedia
                        expand={expand === currentStillIndex}
                        close={() => setExpand(-1)}
                      >
                        <img className="cursor-pointer" src={stills[currentStillIndex].still_url ?? ""} alt="Still" onClick={() => window.open(stills[currentStillIndex].still_url ?? "", '_blank')} />
                      </ExpandableMedia>
                    )
                  }
                </>
              ) : ( 
                <Button className="min-w-24" onClick={() => generateStill()} disabled={isStillGenerating || (prompts?.[currentPromptIndex]?.prompt || "").trim() === "" || isSillLoading || (userProfile?.credits || 0) < 1}>
                  {isStillGenerating ? (
                    <>
                      <IconSpinner className="mr-1" />
                      { `${execTime}s` }
                    </>
                  ) : isSillLoading ? "Loading..." : "Generate Still"}
                </Button>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-12 mt-2">
          {
            ((stills?.length ?? 0) > 0 && !isEditable) && (
              // adjust the grid layout here
              <div className={cn("flex items-center col-span-12 md:col-span-12 lg:col-span-6",
                isSidebarOpen && "lg:col-span-12 xl:col-span-12 2xl:col-span-6"
              )}>
                <span>Still:</span>
                <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateStills('prev')} disabled={!isPrevStillAvailable || isStillGenerating || isVideoGenerating}><IconChevronLeft /></Button>
                <span className="mx-2">{currentStillIndex + 1}/{stills?.length}</span>
                <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateStills('next')} disabled={!isNextStillAvailable || isStillGenerating || isVideoGenerating}><IconChevronRight /></Button>
                {stills && stills[currentStillIndex] && (
                  <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={reGenerateStill} disabled={isStillGenerating || isVideoGenerating || (userProfile?.credits || 0) < 1}>
                    <IconRefresh />
                  </Button>
                )}
              </div>
            )
          }

          <Button
            className="rounded-full p-2 ml-2"
            variant="ghost"
            onClick={() => setExpand(currentStillIndex)}
          >
            <IconZoom />
          </Button>

          {
            ((videos?.length ?? 0) > 0 && !isEditable) ? (
              // adjust the grid layout here
              <div className={cn("flex items-center col-span-12 md:col-span-12 lg:col-span-6",
                isSidebarOpen && "lg:col-span-12 xl:col-span-12 2xl:col-span-6"
              )}>
                <span>Video:</span>
                <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('prev')} disabled={!isPrevVideoAvailable || isStillGenerating || isVideoGenerating}><IconChevronLeft /></Button>
                <span className="mx-2">{currentVideoIndex + 1}/{videos?.length ?? 0}</span>
                <Button className="rounded-full p-2" variant="ghost" onClick={() => navigateVideos('next')} disabled={!isNextVideoAvailable || isStillGenerating || isVideoGenerating}><IconChevronRight /></Button>
                {videos && videos[currentVideoIndex] && (
                  <Button className="rounded-full p-2 ml-2" variant="ghost" onClick={reGenerateVideo} disabled={isVideoGenerating || isStillGenerating || (userProfile?.credits || 0) < 10}>
                    <IconRefresh />
                  </Button>
                )}
              </div>
            ) : (
              <>
                {
                  (!isEditable && !isSillLoading) && (
                    <div className="flex items-center col-span-6">
                      <span>Video:</span>
                      <Button
                        className="ml-3 rounded-sm py-2 px-4 min-w-[129px]"
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
                        {isVideoGenerating ? (
                          <>
                            <IconSpinner className="mr-1" />
                            { `${execTime}s` }
                          </>
                        ) : (
                          <>
                            Animate
                            <IconCoin className="ml-2" />
                            20
                          </>
                        )}
                      </Button>
                    </div>
                  )
                }
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}
