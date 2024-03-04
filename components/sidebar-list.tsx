"use client"

import { useEffect, useState } from 'react'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProjects } from '@/lib/hooks/use-projects'
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CreditsView } from './credits-view'

export function SidebarList() {
  const { projects, setProjects } = useProjects()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

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

  const clearProjects = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Unauthorized')
      }

      const { error } = await supabase.from('projects').delete().eq('owner_id', user.id)
      if (error) {
        throw new Error(error.message)
      }
      setProjects([])
      router.push('/')
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete projects')
    }
  }

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
      <div className="flex items-center justify-between p-2">
        <CreditsView />
        <ThemeToggle />
        <ClearHistory clearProjects={clearProjects} isEnabled={projects?.length > 0} />
      </div>
    </div>
  )
}
