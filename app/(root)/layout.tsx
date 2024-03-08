// this is the second layout for the app
// (root): the parentheses means that it's equal to not having a folder at all, this means that whatever file you have here could've been in the /app directory
// the reason behind the (root) folder is to create this layout wfor all the video pages (maybe we can rename this to project)
// here in this layout you have the sidebar and the credit alert and the project provider to use as global state management for the project
"use client"

import { CreditAlert } from '@/components/credit-alert'
import { SidebarDesktop } from '@/components/sidebar-desktop'
import { SidebarMobile } from '@/components/sidebar-mobile'

import { ProjectsProvider } from '@/lib/hooks/use-projects'

interface LegendVideoLayoutProps {
  children: React.ReactNode
}

export default function LegendVideoLayout({ children }: LegendVideoLayoutProps) {
  return (
    <ProjectsProvider>
      {/* Todo: fix the design here for mobile sidebar for later */}
      <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
        <SidebarMobile />
        <SidebarDesktop />
        <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:md:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
          {children}
        </div>
        <CreditAlert />
      </div>
    </ProjectsProvider>
  )
}
