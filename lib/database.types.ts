// generated via $ supabase gen types typescript --linked > lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      project_outputs: {
        Row: {
          created_at: string
          id: number
          output_video_url: string | null
          owner_id: string | null
          project_id: number | null
          seq_num: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          output_video_url?: string | null
          owner_id?: string | null
          project_id?: number | null
          seq_num?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          output_video_url?: string | null
          owner_id?: string | null
          project_id?: number | null
          seq_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_project_output_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_project_output_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          aspect_ratio: string | null
          concept: string | null
          created_at: string
          id: number
          owner_id: string | null
          style: string | null
          title: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          concept?: string | null
          created_at?: string
          id?: number
          owner_id?: string | null
          style?: string | null
          title?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          concept?: string | null
          created_at?: string
          id?: number
          owner_id?: string | null
          style?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scenes: {
        Row: {
          created_at: string
          description: string | null
          id: number
          owner_id: string | null
          project_id: number | null
          selected_prompt: number | null
          seq_num: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          owner_id?: string | null
          project_id?: number | null
          selected_prompt?: number | null
          seq_num?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          owner_id?: string | null
          project_id?: number | null
          selected_prompt?: number | null
          seq_num?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_scenes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      shot_prompts: {
        Row: {
          created_at: string
          id: number
          is_new_still_generating: boolean | null
          owner_id: string | null
          prompt: string | null
          selected_still: number | null
          seq_num: number | null
          shot_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_new_still_generating?: boolean | null
          owner_id?: string | null
          prompt?: string | null
          selected_still?: number | null
          seq_num?: number | null
          shot_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          is_new_still_generating?: boolean | null
          owner_id?: string | null
          prompt?: string | null
          selected_still?: number | null
          seq_num?: number | null
          shot_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_shot_prompts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_shot_prompts_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          }
        ]
      }
      shot_stills: {
        Row: {
          created_at: string
          id: number
          is_new_video_generating: boolean | null
          owner_id: string | null
          selected_video: number | null
          seq_num: number | null
          shot_prompt_id: number | null
          still_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_new_video_generating?: boolean | null
          owner_id?: string | null
          selected_video?: number | null
          seq_num?: number | null
          shot_prompt_id?: number | null
          still_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_new_video_generating?: boolean | null
          owner_id?: string | null
          selected_video?: number | null
          seq_num?: number | null
          shot_prompt_id?: number | null
          still_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_shot_stills_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_shot_stills_shot_prompt_id_fkey"
            columns: ["shot_prompt_id"]
            isOneToOne: false
            referencedRelation: "shot_prompts"
            referencedColumns: ["id"]
          }
        ]
      }
      shot_videos: {
        Row: {
          created_at: string
          id: number
          owner_id: string | null
          seq_num: number | null
          shot_still_id: number | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          owner_id?: string | null
          seq_num?: number | null
          shot_still_id?: number | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          owner_id?: string | null
          seq_num?: number | null
          shot_still_id?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_shot_videos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_shot_videos_shot_still_id_fkey"
            columns: ["shot_still_id"]
            isOneToOne: false
            referencedRelation: "shot_stills"
            referencedColumns: ["id"]
          }
        ]
      }
      shots: {
        Row: {
          created_at: string
          id: number
          owner_id: string | null
          scene_id: number | null
          selected_prompt: number | null
          seq_num: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          owner_id?: string | null
          scene_id?: number | null
          selected_prompt?: number | null
          seq_num?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          owner_id?: string | null
          scene_id?: number | null
          selected_prompt?: number | null
          seq_num?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_shots_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          }
        ]
      }
      test: {
        Row: {
          created_at: string
          id: number
          number: number | null
          somejson: Json | null
          text: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          number?: number | null
          somejson?: Json | null
          text?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          number?: number | null
          somejson?: Json | null
          text?: string | null
          title?: string | null
        }
        Relationships: []
      }
      testtoo: {
        Row: {
          created_at: string
          greeting: string | null
          id: number
          test_id: number | null
        }
        Insert: {
          created_at?: string
          greeting?: string | null
          id?: number
          test_id?: number | null
        }
        Update: {
          created_at?: string
          greeting?: string | null
          id?: number
          test_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_testtoo_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          credits: number | null
          display_name: string | null
          id: number
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          credits?: number | null
          display_name?: string | null
          id?: number
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          credits?: number | null
          display_name?: string | null
          id?: number
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_user_profile_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
