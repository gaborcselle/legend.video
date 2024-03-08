"use client"

import { useProjects } from '@/lib/hooks/use-projects'
import ConceptView from '@/components/concept-view'
import ConceptSetup from '@/components/concept-setup'

export default function ConceptHeader() {
  const { scenes, isGeneratingProject, isGeneratingScenes } = useProjects()

  // if we have scenes or we're generating scenes or project, we show the concept view
  // otherwise we show the concept setup
  return (
    <>
      {
        scenes.length > 0 || isGeneratingScenes || isGeneratingProject ? 
        <ConceptView /> :
        <ConceptSetup />
      }
    </>
  )
}
