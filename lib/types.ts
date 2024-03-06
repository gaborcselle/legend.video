import { Database } from './database.types'

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInput = Database['public']['Tables']['projects']['Insert']

export type Scene = Database['public']['Tables']['scenes']['Row']
export type SceneInput = Database['public']['Tables']['scenes']['Insert']

export type Shot = Database['public']['Tables']['shots']['Row']
export type ShotInput = Database['public']['Tables']['shots']['Insert']

export type ShotPrompt = Database['public']['Tables']['shot_prompts']['Row']
export type ShotPromptInput = Database['public']['Tables']['shot_prompts']['Insert']

export type ShotStill = Database['public']['Tables']['shot_stills']['Row']
export type ShotStillInput = Database['public']['Tables']['shot_stills']['Insert']

export type ShotVideo = Database['public']['Tables']['shot_videos']['Row']
export type ShotVideoInput = Database['public']['Tables']['shot_videos']['Insert']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInput = Database['public']['Tables']['user_profiles']['Insert']
