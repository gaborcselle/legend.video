"use client";

import { createClient } from "@/utils/supabase/client";
import { IconGitHub } from "@/components/ui/icons";

export default function OAuthWithGithub() {
  const handleGithubSignIn = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL}`,
      },
    });
  };

  return (
    <>
      <button
        onClick={handleGithubSignIn}
        className="rounded-md px-4 py-2 mb-2 flex items-center bg-black h-12 min-w-[215px]"
      >
        <IconGitHub className="mr-2 text-white" />
        <span className="ml-4 text-white">Sign In with Github</span>
      </button>
    </>
  );
}
