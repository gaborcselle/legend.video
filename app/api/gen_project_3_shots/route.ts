import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { chatCompletionRequest } from '@/lib/gen_utils'
import { Scene, Project } from "@/lib/types"

export const maxDuration = 300;

const openai = new OpenAI();

// Function to generate shot descriptions
async function genShotDescriptions(sceneDescription: string, projectConcept: string, maxShots: number = 7) {
    const messages = [
        {
            role: "system",
            content: "Given a scene description and the overall project concept, segment the scene into 3-7 individual shots. Then call a video generator function called 'render_scene_with_shots' with detailed descriptions and short titles for each shot.",
        },
        { role: "user", content: `Scene description: ${sceneDescription}\n\nProject concept: ${projectConcept}` },
    ];

    const functionCallArray = genShotFunctionCallArray(maxShots);

    const response = await chatCompletionRequest(openai, messages, functionCallArray);

    if (!response.choices[0].message.tool_calls) {
        console.log('No shot descriptions returned for prompt!', messages);
        throw new Error(`No shot descriptions returned for prompt: ${messages}`);
    }

    const toolCalls = response.choices[0].message.tool_calls;

    return toolCalls;
}

function genShotFunctionCallArray(numberOfShots: number) {
    const functionParameters: any = {};

    for (let i = 1; i <= numberOfShots; i++) {
        const shotParamForChatCall = {
            type: "string",
            description: `The description for shot number ${i}`,
        };

        functionParameters[`shot_${i}_description`] = shotParamForChatCall;

        const shotTitleForChatCall = {
            type: "string",
            description: `A short title for shot number ${i}`,
        };

        functionParameters[`shot_${i}_title`] = shotTitleForChatCall;
    }

    return [{
        type: "function",
        function: {
            name: "render_scene_with_shots",
            // TODO(gabor): Reality-check this approach for >3 shot descriptions
            description: "Given titles and detailed descriptions of all the shots, renders video for the scene. Only 3 shot titles/descriptions are required, use the other params only if more than 3 shots are needed based on the scene description.",
            parameters: {
                type: "object",
                properties: functionParameters,
                required: ["shot_1_description", "shot_2_description", "shot_3_description", "shot_1_title", "shot_2_title", "shot_3_title"],
            },
        },
    }];
}

// POST /api/gen_project_3_shots
// Generates shots from scene
// TODO(gabor): change this to POST
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

    const { scene_id } = json;

    // For debugging as GET
    // const scene_id = Number(req.nextUrl.searchParams.get('scene_id'));
    
    // TODO(gabor): should we just removed aspect_ratio and style from the input params?
    if (!scene_id) {
        return new Response('Missing required parameters', { status: 400 });
    }

    console.log('scene_id', scene_id);

    
    try {
        const sceneRes = await supabase.from('scenes').select('*').eq('id', scene_id).single();
        if (sceneRes.error) {
            return new Response('Scene not found', { status: 500 });
        }

        let scene = sceneRes.data as Scene;

        if (!scene) {
            return new Response('Project not found', { status: 500 });
        }

        const projectRes = await supabase.from('projects').select('*').eq('id', scene.project_id).single();
        if (projectRes.error) {
            return new Response('Project not found', { status: 500 });
        }

        let project = projectRes.data as Project;

        const sceneDescription = scene.description;
        const projectConcept = project.concept;
        const shotToolCalls = await genShotDescriptions(sceneDescription!, projectConcept!);

        if (!shotToolCalls || !shotToolCalls[0].function.arguments || shotToolCalls[0].function.arguments.length === 0) {
            console.log('No shot descriptions returned.');
            return new Response('No shot descriptions returned.', { status: 500 });
        }

        const shotsDict = JSON.parse(shotToolCalls[0].function.arguments);

        console.log('shotsDict', shotsDict);

        let shotsPayload : Object[] = [];
        let shotPromptsPayload : Object[] = [];
        for (let j = 0; j < Object.keys(shotsDict).length; j++) {
            const shotKey = `shot_${j + 1}_title`;
            if (!shotsDict[shotKey]) {
                continue;
            }
            const shotTitle = shotsDict[`shot_${j + 1}_title`];
            console.log('shotTitle', shotTitle);

            if (shotTitle.length && shotTitle.length > 0) {
                shotsPayload.push({
                    owner_id: user.id,
                    scene_id: scene.id,
                    selected_prompt: 0,
                    seq_num: j,
                    title: shotTitle,
                });
            }
        }


        const shotsObj = await supabase.from('shots').insert(shotsPayload).select();

        if (shotsObj.error) {
            console.log('Error inserting shots', shotsObj.error);
            return new Response('Error inserting shots', { status: 500 });
        }

        for (let j = 0; j < Object.keys(shotsDict).length; j++) {
            const key = `shot_${j + 1}_description`;

            if (!shotsDict[key]) {
                continue;
            }

            const shotDescription = shotsDict[`shot_${j + 1}_description`];

            if (shotDescription.length && shotDescription.length > 0) {
                shotPromptsPayload.push({
                    owner_id: user.id,
                    shot_id: shotsObj.data[j].id,
                    prompt: shotDescription,
                    selected_still: 0,
                    seq_num: 0,
                });
            }
        }

        // log all shot descriptions
        console.log('shotsPayload', shotsPayload);
        console.log('shotPromptsPayload', shotPromptsPayload);

        const shotPrompts = await supabase.from('shot_prompts').insert(shotPromptsPayload).select();

        if (shotsObj.error || shotPrompts.error) {
            console.log('Error inserting shots or shot prompts', shotsObj.error, shotPrompts.error);
            return new Response('Error inserting shots or shot prompts', { status: 500 });
        }

        const responsePayload = JSON.stringify({
            shots: shotsObj.data,
            shot_prompts: shotPrompts.data,
        });

        // return full response
        return new Response(responsePayload, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error)?.message || 'Failed to generate project data.';
        return new Response(errorMessage, { status: 500 });
    }
}