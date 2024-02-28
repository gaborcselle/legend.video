'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { removeChat, shareChat } from '@/app/actions'

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
                {/* <SidebarActions
                  chat={chat}
                  removeChat={removeChat}
                  shareChat={shareChat}
                /> */}
                <div></div>
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
