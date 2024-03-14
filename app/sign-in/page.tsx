import OAuthWithGithub from '@/components/login-button-github'
import OAuthWithGoogle from '@/components/login-button-google'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SignInPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // redirect to home if user is already logged in
  if (user) {
    redirect('/')
  }

  return  (
    // Note the use of min-h-screen-4rem (defined in globals.css) to subtract the height of the header from the screen height
    <div className="relative bg-[url('/homepage_background.jpg')] bg-cover min-h-screen-4rem">
      
      {/* Mobile - login section first */}
      <div className="lg:hidden p-4 z-10 flex-1 flex items-center justify-center px-4 flex-col gap-4 text-white pt-8">
        <div className="lg:hidden p-4 bg-gray-500 bg-opacity-50 rounded-md">
          <p className="text-left text-l"><b>Legend.video</b> is your <a className="underline" href="https://github.com/gaborcselle/legend.video">open source</a> AI director.</p>
          <p className="text-left text-l">Describe your idea, it will build your video with Gen AI.</p>
          <p className="text-left">Sign in with your GitHub or Google account to get started.</p>
        </div>

        <OAuthWithGithub />
        <OAuthWithGoogle />        
      </div>
      {/* Mobile - video section */}
      <div className="lg:hidden p-4">
        <video
          src="https://ghboj6c35daxmxn2.public.blob.vercel-storage.com/legend_video_hp_bg_30_fps-yrgpUIp7bA63Ap9qYL0RG3FOp20ZPp.mp4"
          autoPlay
          loop
          muted
          style={{ aspectRatio: '1099 / 800' }}
          className="w-full h-auto object-cover rounded-md"
        />
      </div>

      {/* Desktop - side by side */}
      <div className="flex flex-col lg:flex-row items-start lg:space-y-2">

        {/* Left side - Login section */}
        <div className="hidden lg:flex z-10 flex-1 items-center justify-center px-4 flex-col gap-4 text-white pt-20">
          <p className="text-xl"><b>Legend.video</b> is your <a className="underline" href="https://github.com/gaborcselle/legend.video">open source</a> AI director.</p>
          <p className="text-xl">Describe your concept, it will make a video with Gen AI.</p>
          <p className="text-xl">Sign in with your GitHub or Google account to get started.</p>
          <OAuthWithGithub />
          <OAuthWithGoogle />
        </div>

        {/* Right side - Video section for desktop */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center pr-16 pt-8">
          <video
            src="https://ghboj6c35daxmxn2.public.blob.vercel-storage.com/legend_video_hp_bg_30_fps-yrgpUIp7bA63Ap9qYL0RG3FOp20ZPp.mp4"
            autoPlay
            loop
            muted
            style={{ aspectRatio: '1099 / 800' }}
            className="w-full lg:max-w-none h-auto object-cover rounded-md"
          />          
        </div>
      </div>
    </div>
  )
}