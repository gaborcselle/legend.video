import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import axios from 'axios'
import archiver from 'archiver'
import { SupabaseClient } from '@supabase/supabase-js'
import { PassThrough } from 'stream'

const getSceneData = async (supabase: SupabaseClient, projectId: string) => {
  // Fetch scenes
  const { data: scenes } = await supabase
    .from('scenes')
    .select('id, seq_num, title')
    .order('seq_num', { ascending: true })
    .eq('project_id', projectId)

  if (!scenes) return null

  // Fetch shots for each scene
  const data = await Promise.all(
    scenes.map(async scene => {
      const { data: shots } = await supabase
        .from('shots')
        .select('id, seq_num, title')
        .order('seq_num', { ascending: true })
        .eq('scene_id', scene.id)

      if (!shots) return { ...scene, shots: [] }

      // Fetch shot prompts for each shot
      const shotsWithPrompts = await Promise.all(
        shots.map(async shot => {
          const { data: shotPrompts } = await supabase
            .from('shot_prompts')
            .select('id, seq_num, selected_still')
            .order('seq_num')
            .eq('shot_id', shot.id)

          if (!shotPrompts) return { ...shot, prompts: [] }

          // Fetch shot stills for each prompt
          const promptsWithStills = await Promise.all(
            shotPrompts.map(async prompt => {
              const { data: shotStills } = await supabase
                .from('shot_stills')
                .select('id, seq_num, still_url, selected_video')
                .order('seq_num', { ascending: true })
                .eq('shot_prompt_id', prompt.id)

              if (!shotStills) return { ...prompt, stills: [] }

              // Fetch shot videos for each still
              const stillsWithVideos = await Promise.all(
                shotStills.map(async still => {
                  const { data: shotVideos } = await supabase
                    .from('shot_videos')
                    .select('id, seq_num, video_url')
                    .order('seq_num')
                    .eq('shot_still_id', still.id)

                  return {
                    ...still,
                    videos:
                      shotVideos && shotVideos[still.selected_video]
                        ? [shotVideos[still.selected_video]]
                        : []
                  }
                })
              )

              return {
                ...prompt,
                stills: [stillsWithVideos[prompt.selected_still]]
              }
            })
          )

          return { ...shot, prompts: promptsWithStills }
        })
      )

      return { ...scene, shots: shotsWithPrompts }
    })
  )

  return data
}

const extractUrls = (
  data: {
    id: number
    shots: {
      id: number
      prompts: {
        id: number
        stills: {
          id: number
          still_url?: string
          videos: {
            id: number
            video_url?: string
          }[]
        }[]
      }[]
    }[]
  }[],
  projectId: number
) => {
  const urls: { filename: string; url: string }[] = []

  data.forEach(scene => {
    scene.shots.forEach(shot => {
      shot.prompts.forEach(prompt => {
        prompt.stills.forEach(still => {
          if (still.still_url) {
            urls.push({
              filename: `pj_${projectId}-sc_${scene.id}-sh_${shot.id}-pr_${prompt.id}-st_${still.id}`,
              url: still.still_url
            })
          }
          if (still.videos.length) {
            still.videos.forEach(video => {
              if (video.video_url) {
                urls.push({
                  filename: `pj_${projectId}-sc_${scene.id}-sh_${shot.id}-pr_${prompt.id}-st_${still.id}-vi_${video.id}`,
                  url: video.video_url
                })
              }
            })
          }
        })
      })
    })
  })

  return urls
}

export async function GET(request: NextRequest, { params: { id: projectId } }) {
  const { supabase } = createClient(request)

  const { data: project } = await supabase
    .from('projects')
    .select('id, title')
    .eq('id', projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Failed to fetch project' })

  const data = await getSceneData(supabase, projectId)

  if (!data) return NextResponse.json({ error: 'Failed to fetch scenes' })

  const urls = extractUrls(data, projectId)

  // Create an in-memory stream for the archive data
  const archiveStream = new PassThrough()

  // Create a new zip archive
  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression level (0-9)
  })

  archive.pipe(archiveStream)

  const addFileToArchive = async (url: string, filename: string) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    archive.append(response.data, { name: filename })
  }

  await Promise.all(
    urls.map(async url => {
      await addFileToArchive(
        url.url,
        `${url.filename}.${url.url.split('.').pop()}`
      )
    })
  )

  archive.finalize()

  const dataBuffer: Buffer[] = []
  for await (const chunk of archiveStream) {
    dataBuffer.push(chunk)
  }

  const buffer = Buffer.concat(dataBuffer)

  const response = new NextResponse(buffer)
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="archive_${projectId}.zip"`
  )
  response.headers.set('Content-Type', 'application/zip')

  return response
}
