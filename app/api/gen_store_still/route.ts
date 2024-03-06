import Replicate from "replicate";
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'

export const maxDuration = 300;

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });


// POST /api/gen_store_still
// Generate a still image from a prompt via Replicate
// Then stores the still image in the Vercel Blob store
// Returns a URL to the still image
// Input params (in JSON body):
// - shot_id, prompt_id, prompt, seq_num

export async function POST(req: NextRequest)  {
    const { supabase } = createClient(req)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    const json = await req.json()

    const { shot_id, prompt_id, prompt, seq_num } = json;

    if (!shot_id || !prompt_id || !prompt || (seq_num === undefined)) {
        return new Response('Missing required parameters', { status: 400 });
    }

    const output = await replicate.run(
        "lucataco/dreamshaper-xl-turbo:0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615",
        {
          input: {
            width: 1024,
            height: 576,
            prompt: `Cinematic style. ${prompt}`,
            scheduler: "K_EULER",
            num_outputs: 1,
            guidance_scale: 2,
            apply_watermark: false,
            negative_prompt: "ugly, deformed, noisy, blurry, low contrast, text, BadDream, fake, anime, open mouth, big forehead, long neck",
            num_inference_steps: 7
          }
        }
    );

    // check if output is an array and has at least one element
    if (!Array.isArray(output) || output.length < 1) {
        return new Response('Replicate did not return a valid output', { status: 500 });
    }

    // the URL is in output[0]
    const replicateOutputURL: string = output[0];

    // we need to figure out the filename to store in the Vercel Blob store
    // we get URLs like this from Replicate: 
    // "https://replicate.delivery/pbxt/wJqcCq8dWwJjHlmbqoTNOXYO63TfsSA8xz8qWOkdr2ffmejJB/out-0.png"
    // let's extract the the part of the filename after pbxt and before out-0
    const replicateOutputFilename = replicateOutputURL.split('pbxt/')[1].split('/out-0.png')[0];

    // let's make sure we have a valid filename, otherwise throw an error
    if (!replicateOutputFilename) {
        return new Response(`Could not extract filename from Replicate output URL: ${replicateOutputFilename}`, { status: 500 });
    }

    // add ".jpeg" to the filename
    const jpgFilename = `still_${shot_id}_${prompt_id}_${replicateOutputFilename}.jpg`;
    
    // retrieve the png that Replicate output
    const replicateOutput = await fetch(replicateOutputURL);
    const replicateOutputBuffer = await replicateOutput.arrayBuffer();

    // Convert PNG to JPG
    const jpgBuffer = await sharp(replicateOutputBuffer)
        .jpeg({ quality: 95 })
        .toBuffer();

    // Store JPG in Vercel Blob store
    const putResult = await put(jpgFilename, jpgBuffer, { access: 'public' });

    // Get JPG URL from putResult
    const jpgURL = putResult.url;

    const still = await supabase
        .from('shot_stills')
        .insert({
            shot_prompt_id: prompt_id,
            still_url: jpgURL,
            owner_id: user.id,
            selected_video: 0,
            seq_num,
        })
        .select()

    if (still.error) {
        return new Response('Error inserting still', { status: 500 })
    }

    const responsePayload = JSON.stringify(still.data[0]);

    return new Response(responsePayload, { status: 200 });
}

export async function GET(req: NextRequest) {
    return new Response('GET disallowed, use POST', { status: 500 });
}
