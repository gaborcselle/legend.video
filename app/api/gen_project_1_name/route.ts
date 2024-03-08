import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'
import { chatCompletionRequest } from '@/lib/gen_utils'

export const maxDuration = 300;

const openai = new OpenAI();

// Step 1 of Project generation: 
// - Generate the title of the project
// - Store a new "project" record in the database

// Function to generate project title
async function genProjectTitle(conceptPrompt: string) {
    const messages = [
        {
            role: "system",
            content: "Given the description of the concept for a video, generate a short 2-4 word title that summarizes its concept.",
        },
        { role: "user", content: conceptPrompt },
    ];

    const response = await chatCompletionRequest(openai, messages);

    if (!response.choices[0].message.content) {
        throw new Error('No project title returned.');
    }

    // delete any trailing quotation marks
    const title = response.choices[0].message.content.trim().replace(/^["'](.*)["']$/, '$1');

    // TODO(gabor): remove this console.log
    console.log('title', title);

    return title;
}

// POST
export async function POST(req: NextRequest) {
    const { supabase } = createClient(req);
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', {
            status: 401
        });
    }

    const json = await req.json();

    const { concept, aspect_ratio, style } = json;

    // TODO(gabor): should we just removed aspect_ratio and style from the input params?
    if (!concept || !aspect_ratio || !style) {
        return new Response('Missing required parameters', { status: 400 });
    }

    const numScenes = json.numScenes ?? 5;

    try {
        // 1. Generate project title
        const title = await genProjectTitle(concept);

        // Create project object and write its ID to the response
        const project = await supabase
            .from('projects')
            .insert({
                aspect_ratio,
                concept,
                style,
                owner_id: user.id,
                title,
            })
            .select();

        if (project.error) {
            return new Response('Error inserting project', { status: 500 });
        }

        console.log('project', project);

        const responsePayload = JSON.stringify({
            project: project.data[0]
        });

        console.log('returning project.data[0].id', project.data[0].id);

        // return full response
        return new Response(responsePayload, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error)?.message || 'Failed to generate project data.';
        return new Response(errorMessage, { status: 500 });
    }
}