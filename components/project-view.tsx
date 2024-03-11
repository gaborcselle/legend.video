"use client"

import ConceptHeader from '@/components/concept-header'
import ConceptScenes from "@/components/concept-scenes"
import ConceptDownload from './concept-download'

export default function ProjectView() {
  return (
    <div className="mx-auto w-full">
      <div className="flex flex-col py-10 px-4">
        <ConceptHeader />
        <ConceptScenes />
        <ConceptDownload />
      </div>
    </div>
  )
}
