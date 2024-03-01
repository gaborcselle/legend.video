"use client"

import { useEffect, useState } from 'react'
import { clearProjects } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProjects } from '@/lib/hooks/use-projects'
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from '@/utils/supabase/client'

export function SidebarList() {
  const { projects, setProjects } = useProjects()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getProjects = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Unauthorized')
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        if (data) {
          setProjects(data)
        }
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }
    getProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        {[...Array(10)].map((_, index) => (
          <Skeleton key={index} className="h-[20px] max-w-[862px] w-5/6 rounded-x mt-3" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {projects?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No existing video</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearProjects} isEnabled={projects?.length > 0} />
      </div>
    </div>
  )
}
