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

  return (
    <>
      <video
        src="https://ghboj6c35daxmxn2.public.blob.vercel-storage.com/video_O9U6rn9DTQo4LJMy4jmD4nqTgLtJbW3AkcoJBjwtnKee1PekA_001082.mp4-yufx3dhUDn3jnvt8MxbHQW4T4CSgl7.mp4"
        autoPlay
        loop
        className="w-screen h-screen absolute top-0 left-0 object-cover"
      />
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10 flex-col gap-4 bg-slate-950 bg-opacity-30 z-[2] text-white">
        <p><b>Legend.video</b> lets you build your movie trailer from a prompt.</p>
        <p>Sign in with your GitHub or Google account to get started.</p>
        <OAuthWithGithub />
        <OAuthWithGoogle />
        <Link href="/faq">
          <Button variant="secondary">
            FAQ
          </Button>
        </Link>
      </div>
    </>
  )
}
