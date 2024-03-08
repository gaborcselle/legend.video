'use client'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconCoin } from '@/components/ui/icons'
import Link from 'next/link'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from "next/navigation"

// import { useProjects } from '@/lib/hooks/use-projects'

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ')
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

export function UserMenu({ user }: any) {
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            {user?.user_metadata?.avatar_url ? (
              <Image
                className="size-6 transition-opacity duration-300 rounded-full select-none ring-1 ring-zinc-100/10 hover:opacity-80"
                src={user?.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}` : ''}
                alt={user.name ?? 'Avatar'}
                height={48}
                width={48}
              />
            ) : (
              <div className="flex items-center justify-center text-xs font-medium uppercase rounded-full select-none size-7 shrink-0 bg-muted/50 text-muted-foreground">
                {user?.user_metadata?.name ?? null}
              </div>
            )}
            <span className="ml-2">{user?.user_metadata?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.user_metadata?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/credits" className="text-xs">            
              Buy Credits
              <IconCoin className="size-3 ml-auto" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/faq" className="text-xs">
              FAQ
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={signOut}
            className="text-xs cursor-pointer"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
