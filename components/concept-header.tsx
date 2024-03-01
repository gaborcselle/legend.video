"use client"

import { useProjects } from '@/lib/hooks/use-projects'
import ConceptView from '@/components/concept-view'
import ConceptSetup from '@/components/concept-setup'

export default function ConceptHeader() {
  const { scenes, isGeneratingScenes } = useProjects()

  return (
    <>
      {
        scenes.length > 0 || isGeneratingScenes ? 
        <ConceptView /> :
        <ConceptSetup />
      }
    </>
  )
}
