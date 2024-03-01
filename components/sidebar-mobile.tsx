'use client'

import { Sidebar } from '@/components/sidebar'
import { VideoHistory } from './video-history'

export function SidebarMobile() {
  return (
    <Sidebar className="peer absolute inset-y-0 z-30 -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 flex lg:hidden w-full">
      <VideoHistory />
    </Sidebar>
  )
}
