'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'

import { useProjects } from '@/lib/hooks/use-projects'

export function SidebarItems() {
  const { projects } = useProjects()

  if (!projects?.length) return null

  return (
    <AnimatePresence>
      {projects.map(
        (project, index) =>
          project && (
            <motion.div
              key={project?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} project={project}>
                 <SidebarActions
                  project={project}
                />
                <div></div>
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
