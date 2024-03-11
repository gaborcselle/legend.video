import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'
import axios from 'axios'
import archiver from 'archiver'
import { createWriteStream, createReadStream } from 'fs'

// TODO: We need to refactor this to use in-memory streams
//       instead of writing to disk
export async function GET(request: NextRequest, { params }) {
  const { supabase } = createClient(request)

  const id = params.id

  const { data: project } = await supabase
    .from('projects')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Failed to fetch project' })

  // Fetch scenes
  const { data: scenes } = await supabase
    .from('scenes')
    .select('id, seq_num, title')
    .order('seq_num', { ascending: true })
    .eq('project_id', id)

  if (!scenes) return NextResponse.json({ scenes: [] })

  // Fetch shots for each scene
  const data = await Promise.all(
    scenes.map(async (scene) => {
      const { data: shots } = await supabase
        .from('shots')
        .select('id, seq_num, title')
        .order('seq_num', { ascending: true })
        .eq('scene_id', scene.id)

      if (!shots) return { ...scene, shots: [] }

      // Fetch shot prompts for each shot
      const shotsWithPrompts = await Promise.all(
        shots.map(async (shot) => {
          const { data: shotPrompts } = await supabase
            .from('shot_prompts')
            .select('id, seq_num, selected_still')
            .order('seq_num')
            .eq('shot_id', shot.id)

          if (!shotPrompts) return { ...shot, prompts: [] }

          // Fetch shot stills for each prompt
          const promptsWithStills = await Promise.all(
            shotPrompts.map(async (prompt) => {
              const { data: shotStills } = await supabase
                .from('shot_stills')
                .select('id, seq_num, still_url, selected_video')
                .order('seq_num', { ascending: true })
                .eq('shot_prompt_id', prompt.id)

              if (!shotStills) return { ...prompt, stills: [] }

              // Fetch shot videos for each still
              const stillsWithVideos = await Promise.all(
                shotStills.map(async (still) => {
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
                        : [],
                  }
                })
              )

              return {
                ...prompt,
                stills: [stillsWithVideos[prompt.selected_still]],
              }
            })
          )

          return { ...shot, prompts: promptsWithStills }
        })
      )

      return { ...scene, shots: shotsWithPrompts }
    })
  )

  const urls = [] as object[]
  data.forEach((scene) => {
    scene.shots.forEach((shot) => {
      shot.prompts.forEach((prompt) => {
        prompt.stills.forEach((still) => {
          if (still.still_url) {
            urls.push({
              filename: `pj_${id}-sc_${scene.id}-sh_${shot.id}-pr_${prompt.id}-st_${still.id}`,
              url: still.still_url,
            })
          }
          if (still.videos.length) {
            still.videos.forEach((video) => {
              if (video.video_url) {
                urls.push({
                  filename: `pj_${id}-sc_${scene.id}-sh_${shot.id}-pr_${prompt.id}-st_${still.id}-vi_${video.id}`,
                  url: video.video_url,
                })
              }
            })
          }
        })
      })
    })
  })

  // Create a new zip archive
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Compression level (0-9)
  })

  
  // Create a writable stream for the archive
  const writableStream = createWriteStream(`archive_${id}.zip`)

  archive.pipe(writableStream);

  const addFileToArchive = async (url: string, filename: string) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    archive.append(response.data, { name: filename })
  }

  await Promise.all(
    urls.map(async (url) => {
      await addFileToArchive(
        // @ts-ignore
        url.url,
        // @ts-ignore
        `${url.filename}.${url.url.split('.').pop()}`
      )
    })
  )

  archive.finalize();

  const dataBuffer: Buffer[] = [];

  // TODO(gabor): We need the fix this hack, ideally all of this data should be streamed
  const readStream = createReadStream(`archive_${id}.zip`);
  for await (const chunk of readStream) {
    dataBuffer.push(chunk)
  }
  const buffer = Buffer.concat(dataBuffer)

  // return the buffer as a response
  const response = new NextResponse(buffer)
  response.headers.set('Content-Disposition', `attachment; filename="archive_${id}.zip"`)
  response.headers.set('Content-Type', 'application/zip')

  return response
}