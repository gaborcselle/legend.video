"use client"

import { SetStateAction, useState } from 'react'

import { Slider } from '@/components/ui/slider'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconArrowRight, IconCoin } from '@/components/ui/icons'

import { Project } from '@/lib/types'
import { useProjects } from '@/lib/hooks/use-projects'
import { useRouter } from 'next/navigation'
import { useExecTimeCounter } from '@/lib/hooks/use-exec-time-counter'

const exampleConcepts = [
  {
    heading: 'San Francisco AI startup success',
    concept: "Brilliant AI developer stumbles upon a groundbreaking algorithm. Set in San Francisco."
  },
  {
    heading: 'Abandoned mansion whodunnit',
    concept: "Historical drama set in an old, seemingly abandoned mansion. Young historian comes to visit, experience flashbacks of the mansion's past inhabitants."
  },
  {
    heading: 'Action movie sequel',
    concept: "Sequel to a popular action movie in the style of James Bond or Mission: Impossible."
  },
]

export default function ConceptSetup() {
  const {
    project,
    projects,
    setProject,
    setProjects,
    setIsGeneratingProject,
    setUserProfile,
    userProfile,
    setIsCreditAlertOpen,
    sceneCount,
    setSceneCount
  } = useProjects()
  const router = useRouter()

  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleConceptChange = (key: string, value: string) => {
    setProject({...project, [key]: value} as Project)
  }

  const resetState = () => {
    setSceneCount([3])
    setProject({
      aspect_ratio: '16:9',
      concept: '',
      created_at: '',
      id: 0,
      owner_id: null,
      style: 'cinematic',
      title: ''
    })
  }

  const generateStories = async () => {
    // if we have a concept, we generate the project
    if ((project?.concept?.length || 0) > 0) {
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      if (userProfile.credits! < 20) {
        setIsCreditAlertOpen(true)
        return
      }
      setIsGeneratingProject(true)
      try {
        const res = await fetch('/api/gen_project_1_name', {
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
        // deduct 20 credits
        setUserProfile({
          ...userProfile,
          credits: userProfile.credits! - 20
        })
  
        if (!res.ok) {
          throw new Error('Failed to generate storyboard');
        }
  
        const data = await res.json()
  
        // add the project to the list of projects
        setProjects([
          data.project,
          ...projects
        ])

        // redirect to the project page
        router.push(`/video/${data.project.id}`)
      } catch (error) {
        setErrorMsg(error as string)
      }
      // setIsGeneratingProject(false)
    }
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Project Concept</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Describe the concept of your video..."
          value={project?.concept ?? ''}
          onChange={(e) => handleConceptChange('concept', e.target.value)}
        />
        <CardDescription className="mt-3">
          You can also try the following examples to get started:          
        </CardDescription>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleConcepts.map((concept, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => handleConceptChange('concept', concept.concept)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {concept.heading}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 mt-10">
          <div className="leading-normal min-w-44 text-muted-foreground text-nowrap">Scenes: {sceneCount}</div>
          <div className='flex gap-4 flex-1'>
            <Slider min={1} max={10} step={1} value={sceneCount} onValueChange={(val) => setSceneCount(val)} />
            <div className="leading-normal text-muted-foreground">10</div>
          </div>
        </div>
        <div className="mt-10 flex justify-end gap-4">
          <Button variant="outline" onClick={resetState}>
            Reset
          </Button>
          <Button className="min-w-44" onClick={generateStories} disabled={project?.concept?.trim() === ""}>
            Generate Storyboard
            <IconCoin className="ml-2" />
            20
          </Button>
        </div>
        {errorMsg && <div className="mt-4 text-red-500">{errorMsg}</div>}
      </CardContent>
    </Card>
  )
}
