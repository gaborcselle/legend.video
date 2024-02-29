"use client"

import { SetStateAction, useState, useEffect } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SceneDisplay from '@/components/scene-display'

import { Project } from '@/lib/types'
import { useProjects } from '@/lib/hooks/use-projects'

export default function ProjectSetup() {
  const { project, setProject, projects, setProjects, scenes, setScenes, resetState } = useProjects()

  const [sceneCount, setSceneCount] = useState<number[]>([5])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (scenes.length > 0) {
      setDisabled(true)
      setSceneCount([scenes.length])
    }
  }, [])

  const handleProjectChange = (key: string, value: string) => {
    setProject({...project, [key]: value} as Project)
  }

  const generateStories = async () => {
    if ((project?.concept?.length || 0) > 0) {
      setIsGenerating(true)
      try {
        const res = await fetch('/api/gen_project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            concept: project?.concept,
            aspect_ratio: project?.aspect_ratio,
            style: project?.style,
            numScenes: sceneCount[0]
          }),
        })
  
        if (!res.ok) {
          throw new Error('Failed to generate storyboard');
        }
  
        const data = await res.json()
  
        setProjects([
          data.project,
          ...projects
        ])
  
        setScenes([
          ...data.scenes
        ])
      } catch (error) {
        console.log(error)
      }
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
          <CardDescription>
            Use this tool to generate a video from a text description. You can also edit the text and add images to the storyboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <ToggleGroup
            type="single"
            size={"lg"}
            variant="outline"
            value={project?.aspect_ratio ?? '16:9'}
            onValueChange={(val: string) => handleProjectChange('aspect_ratio', val)}
            disabled={disabled}
          >
            <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
            <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
            <ToggleGroupItem value="9:16">9:16</ToggleGroupItem>
          </ToggleGroup> */}

          {/* <p className="mt-10 mb-1 leading-normal text-muted-foreground">
            Style
          </p>
          <Select value={project?.style ?? 'cinematic'} onValueChange={(val) => handleProjectChange('style', val)} disabled={disabled}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="cinematic">Cinematic</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}

          <p className="mt-10 mb-1 leading-normal text-muted-foreground">
            Concept
          </p>
          <Textarea
            placeholder="Describe the concept of your video..."
            value={project?.concept ?? ''}
            onChange={(e) => handleProjectChange('concept', e.target.value)}
            disabled={disabled}
          />

          <div className="flex gap-4 mt-10">
            <div className="leading-normal min-w-44 text-muted-foreground text-nowrap">Scenes: {sceneCount}</div>
            <Slider min={1} max={10} step={1} value={sceneCount} onValueChange={(val: SetStateAction<number[]>) => setSceneCount(val)} disabled={disabled} />
            <div className="leading-normal text-muted-foreground">10</div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <Button variant="outline" onClick={resetState} disabled={disabled}>
              Reset
            </Button>
            <Button className="min-w-44" disabled={((project?.concept?.length || 0) === 0) || disabled} onClick={generateStories}>
              {
                isGenerating ? (
                <div role="status">
                  <svg aria-hidden="true" className="size-5 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                </div>
                ) : (
                  <span>Generate Storyboard</span>
                )
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      { (scenes && scenes.length > 0) && (
        <Card className="my-10">
          <CardHeader>
            <CardTitle>Storyboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-4 sticky top-[-2px] bg-white dark:bg-neutral-950 h-16 z-10">
              <div className="col-span-6 flex justify-center items-center">Prompt</div>
              <div className="col-span-3 flex justify-center items-center">Still</div>
              <div className="col-span-3 flex justify-center items-center">Video</div>
            </div>
            <div className="flex flex-col gap-6">
              {
                scenes.map((scene, index) => (
                  <SceneDisplay
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
    </div>
  )
}
