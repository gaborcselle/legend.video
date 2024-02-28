import { type Message } from 'ai'
import { Database } from './database.types'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

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

export type ScenePrompt = Database['public']['Tables']['scene_prompts']['Row']
export type ScenePromptInput = Database['public']['Tables']['scene_prompts']['Insert']

export type SceneStill = Database['public']['Tables']['scene_stills']['Row']
export type SceneStillInput = Database['public']['Tables']['scene_stills']['Insert']

export type SceneVideo = Database['public']['Tables']['scene_videos']['Row']
export type SceneVideoInput = Database['public']['Tables']['scene_videos']['Insert']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInput = Database['public']['Tables']['user_profiles']['Insert']
