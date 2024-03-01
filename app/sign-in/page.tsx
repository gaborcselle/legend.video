import OAuthWithGithub from '@/components/login-button-github'
import OAuthWithGoogle from '@/components/login-button-google'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

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
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10 flex-col gap-4">
      <p><b>Legend.video</b> lets you build your movie trailer from a prompt.</p>
      <p>Sign in with your GitHub or Google account to get started.</p>
      <OAuthWithGithub />
      <OAuthWithGoogle />
    </div>
  )
}
