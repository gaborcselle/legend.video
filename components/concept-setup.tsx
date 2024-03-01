"use client"

import { SetStateAction, useState } from 'react'

import { Slider } from '@/components/ui/slider'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconArrowRight } from '@/components/ui/icons'

import { Project } from '@/lib/types'
import { useProjects } from '@/lib/hooks/use-projects'

const exampleConcepts = [
  {
    heading: 'San Francisco AI startup success',
    concept: `A brilliant but reclusive AI developer stumbles upon a groundbreaking algorithm that could redefine human-computer interaction. Set against the backdrop of San Francisco's iconic landmarks and bustling startup culture, the story unfolds as the developer's creation leads to a tech revolution.`
  },
  {
    heading: 'App Street Artist',
    concept: `App Artist: Focusing on a street artist whose work is only visible through a special app, the film explores themes of digital versus physical reality, the nature of art, and anonymity. As the artist's fame grows in the digital world, their desire for real-world recognition and the implications of their anonymity create a compelling internal and external conflict.`
  },
  {
    heading: 'Abandoned Mansion Whodunnit',
    concept: "Echoes of the Past: A historical drama set in an old, seemingly abandoned mansion that a young historian has come to document. As the night progresses, the historian starts experiencing vivid, ghostly flashbacks of the mansion's past inhabitants, uncovering a century-old mystery that directly connects to their own lineage."
  },
]

export default function ConceptSetup() {
  const { project, projects, setProject, setProjects, setScenes, setIsGeneratingScenes } = useProjects()

  const [sceneCount, setSceneCount] = useState<number[]>([5])

  const handleConceptChange = (key: string, value: string) => {
    setProject({...project, [key]: value} as Project)
  }

  const resetState = () => {
    setSceneCount([5])
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
    if ((project?.concept?.length || 0) > 0) {
      setIsGeneratingScenes(true)
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
      setIsGeneratingScenes(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concept</CardTitle>
        <CardDescription>
          Describe the concept of your video, then click &quot;Generate Storyboard&quot; to have GPT-4 generate the storyboard.
        </CardDescription>
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
        
        <div className="flex gap-4 mt-10">
          <div className="leading-normal min-w-44 text-muted-foreground text-nowrap">Scenes: {sceneCount}</div>
          <Slider min={1} max={10} step={1} value={sceneCount} onValueChange={(val: SetStateAction<number[]>) => setSceneCount(val)} />
          <div className="leading-normal text-muted-foreground">10</div>
        </div>
        <div className="mt-10 flex justify-end gap-4">
          <Button variant="outline" onClick={resetState}>
            Reset
          </Button>
          <Button className="min-w-44" onClick={generateStories}>
            Generate storyboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
