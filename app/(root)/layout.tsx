"use client"

import { ProjectHistory } from '@/components/project-history'
import { SidebarDesktop } from '@/components/sidebar-desktop'
import { SidebarMobile } from '@/components/sidebar-mobile'

import { ProjectsProvider } from '@/lib/hooks/use-projects'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ProjectsProvider>
      {/* Todo: fix the design here for mobile sidebar for later */}
      {/* <SidebarMobile>
        <ProjectHistory />
      </SidebarMobile> */}
      <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
        <SidebarDesktop />
        <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
          {children}
        </div>
      </div>
    </ProjectsProvider>
  )
}
