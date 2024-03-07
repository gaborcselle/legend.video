'use client'

import * as React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { motion } from 'framer-motion'

import { buttonVariants } from '@/components/ui/button'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useProjects } from '@/lib/hooks/use-projects'
import { useSidebar } from '@/lib/hooks/use-sidebar'

interface SidebarItemProps {
  project: Project
  children: React.ReactNode
}

export function SidebarItem({ project, children }: SidebarItemProps) {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const { setUpdateProjectState, resetState } = useProjects()

  const isActive = pathname === `/video/${project.id}`

  const handleLinkClick = () => {
    setUpdateProjectState(false)
    resetState()
    if (window.innerWidth < 1024) toggleSidebar()
  }

  if (!project?.id) return null

  return (
    <motion.div
      className="relative h-8"
      variants={{
        initial: {
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      transition={{
        duration: 0.25,
        ease: 'easeIn'
      }}
    >
      <Link
        href={`/video/${project.id}`}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'group w-full px-8 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10',
          isActive && 'bg-zinc-200 pr-16 font-semibold dark:bg-zinc-800'
        )}
        onClick={handleLinkClick}
      >
        <div
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'group w-full px-8 transition-colors cursor-not-allowed opacity-50 dark:hover:bg-neutral-950',
          )}
        >
          <span className="whitespace-nowrap">
          <span>{project.title ?? 'Untitled'}</span>
          </span>
        </div>
      </Link>
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </motion.div>
  )
}
