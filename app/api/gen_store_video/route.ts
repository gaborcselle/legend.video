import Replicate from "replicate";
import { put } from '@vercel/blob';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'

export const maxDuration = 300;

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Vercel serverless function handler
export async function POST(req: NextRequest) {
    const { supabase } = createClient(req)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    let userProfile = await supabase.from('user_profiles').select().eq('owner_id', user.id);

    if (userProfile.error) {
        return new Response('Error fetching user profile', { status: 500 });
    }

    if (userProfile.data[0].credits < 10) {
        return new Response('Not enough credits', { status: 402 });
    }

    const json = await req.json()

    const { scene_still_id, seq_num, image_url } = json;

    if (!scene_still_id || (seq_num === undefined) || !image_url) {
        return new Response('Missing required parameters', { status: 400 });
    }

    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          cond_aug: 0.02,
          decoding_t: 7,
          input_image: image_url,
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          frames_per_second: 6
        }
      }
    );

    // the URL is in output[0]
    if (!output) {
        return new Response('No output from Replicate.', { status: 500 });
    }
    if (typeof output !== 'string') {
        return new Response('Replicate output is not a string.', { status: 500 });
    }

    const replicateOutputURL: string = output;

    // we need to figure out the filename to store in the Vercel Blob store
    // we get URLs like this from Replicate: 
    // "https://replicate.delivery/pbxt/KBbuDMvRg9ovGF3p7qJddqjMpQ58xVuUz68lmd9csy85bamE/\d+.mp4"
    // let's extract the the part of the filename after pbxt and before \d+
    const replicateOutputFilenameWithSlash = replicateOutputURL.split('pbxt/')[1];

    // replace occurences of / with _
    const replicateOutputFilename = replicateOutputFilenameWithSlash.replace(/\//g, "_");

    // let's make sure we have a valid filename, otherwise throw an error
    if (!replicateOutputFilename) {
        return new Response(`Could not extract filename from Replicate output URL: ${replicateOutputFilename}`, { status: 500 });
    }

    // add ".jpeg" to the filename
    const mp4Filename = `video_${replicateOutputFilename}.mp4`;

    const replicateOutput = await fetch(replicateOutputURL);
    const replicateOutputBuffer = await replicateOutput.arrayBuffer();

    
    // Store JPG in Vercel Blob store
    const putResult = await put(mp4Filename, replicateOutputBuffer, { access: 'public' });

    // Get JPG URL from putResult
    const mp4URL = putResult.url;

    userProfile = await supabase.from('user_profiles').select().eq('owner_id', user.id);

    if (userProfile.error) {
        return new Response('Error fetching user profile', { status: 500 });
    }

    if (userProfile.data[0].credits < 10) {
        return new Response('Not enough credits', { status: 402 });
    }

    const newUserProfile = await supabase
        .from('user_profiles')
        .update({
            credits: userProfile.data[0].credits - 20
        })
        .eq('owner_id', user.id)
        .select()

    if (newUserProfile.error) {
        return new Response('Error updating user profile', { status: 500 });
    }

    const video = await supabase
        .from('scene_videos')
        .insert({
            scene_still_id,
            video_url: mp4URL,
            owner_id: user.id,
            seq_num,
        })
        .select()

    if (video.error) {
        return new Response('Error inserting video', { status: 500 })
    }

    const responsePayload = JSON.stringify(video.data[0]);

    return new Response(responsePayload, { status: 200 });
}
