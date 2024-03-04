import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { IconCoin } from "./ui/icons";
import { useRouter } from 'next/navigation'

import { createClient } from "@/utils/supabase/client";
import { useProjects } from "@/lib/hooks/use-projects";

export function CreditsView() {
    const router= useRouter();
    const supabase = createClient();

    const { userProfile, setUserProfile } = useProjects();

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              let { data: user_profiles, error } = await supabase
                .from('user_profiles')
                .select("*")
                .eq('owner_id', user.id)
    
              if (error) {
                throw new Error(error.message);
              }
    
              if (user_profiles) {
                setUserProfile(user_profiles[0]);
              }
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
        fetchUser();
      }, [])

    const handleClick = (): void => {
        router.push('/credits');
    };

    return (
        <Button variant="ghost" onClick={handleClick} className='hover:bg-zinc-200 dark:hover:bg-zinc-300/10'>
            Credits 
            <IconCoin className="size-3" />
            {userProfile && <span className="ml-2">{userProfile.credits}</span>}
        </Button>
    );
}