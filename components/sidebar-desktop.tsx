import { Sidebar } from '@/components/sidebar'

import { VideoHistory } from './video-history'

export function SidebarDesktop() {
  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 md:flex md:w-[250px] xl:w-[300px]">
      <VideoHistory />
    </Sidebar>
  )
}
