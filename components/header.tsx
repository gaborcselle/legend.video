import * as React from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  IconLegendVideo,
  IconSeparator,
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarToggle } from './sidebar-toggle'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Logo from '@/components/logo'

async function UserOrLogin() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return (
    <>
      {user ? (
        <>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/" target="_blank" rel="nofollow">
          <IconLegendVideo className="size-6 mr-2 dark:hidden" inverted />
          <IconLegendVideo className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        <Logo className="w-6 h-6 mr-1" />
        Legend.video
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {user ? (
          <UserMenu user={user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/sign-in?callbackUrl=/">Login</Link>
          </Button>
        )}
      </div>
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
    </header>
  )
}
