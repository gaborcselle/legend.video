import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'
import { chatCompletionRequest } from '@/lib/gen_utils'
import { Project } from "@/lib/types"

export const maxDuration = 300;
const STORYBOARD_GEN_CREDITS_COST = 20;

const openai = new OpenAI();

// Step 2 of Project generation: 
// - Given a project ID, generate scenes
// - Returns project

// Function to generate scene descriptions
async function genSceneDescriptions(conceptPrompt: string, maxScenes: number = 3) {
    const messages = [
        {
            role: "system",
            content: "Given the description of the concept for a video, call a video generator function called 'render_video_with_scenes' with descriptions and short titles for each scene. Describe each scene in exhaustive detail, and include a description of the characters in each scene. Don't preface with 'Scene 1' and the like, just the description.",
        },
        { role: "user", content: `Concept: ${conceptPrompt}\n\n There should be ${maxScenes} scenes in total, with scene descriptions being passed into 'scene_N_description' for scene number N.` },
    ];

    const functionCallArray = genFunctionCallArray(maxScenes);

    console.log('functionCallArray', functionCallArray);

    const response = await chatCompletionRequest(openai, messages, functionCallArray);

    console.log('genSceneDescriptions response', response);

    if (!response.choices[0].message.tool_calls) {
        console.log('No scene descriptions returned for prompt!', messages);
        throw new Error(`No scene descriptions returned for prompt: ${messages}`);
    }

    const toolCalls = response.choices[0].message.tool_calls;

    console.log('toolCalls response', toolCalls);

    return toolCalls;
}

// Function to generate function call array for scene descriptions
function genFunctionCallArray(numberOfScenes: number) {
    const functionParameters: any = {};

    for (let i = 1; i <= numberOfScenes; i++) {
        const sceneParamForChatCall = {
            type: "string",
            description: `The description for scene number ${i}`,
        };

        functionParameters[`scene_${i}_description`] = sceneParamForChatCall;

        const sceneTitleForChatCall = {
            type: "string",
            description: `A short title for scene number ${i}`,
        };

        functionParameters[`scene_${i}_title`] = sceneTitleForChatCall;
    }

    console.log('functionParameters', Object.keys(functionParameters));

    return [{
        type: "function",
        function: {
            name: "render_video_with_scenes",
            description: "Given descriptions and titles for all the scenes, renders the video.",
            parameters: {
                type: "object",
                properties: functionParameters,
                required: Object.keys(functionParameters),
            },
        },
    }];
}


// POST /api/gen_project_2_scenes
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

    const { project_id, num_scenes } = json;

    // For debugging as GET
    // const project_id_str = req.nextUrl.searchParams.get('project_id');
    // const num_scenes_str = req.nextUrl.searchParams.get('num_scenes');

    // const project_id = Number(project_id_str);
    // const num_scenes = Number(num_scenes_str);

    if (!project_id || !num_scenes) {
        return new Response('Missing required parameters', { status: 400 });
    }

    console.log('project_id', project_id);
    console.log('num_scenes', num_scenes);

    try {
        // Create project object and write its ID to the response
        const projectRes = await supabase.from('projects').select('*').eq('id', project_id).single();
        if (projectRes.error) {
            return new Response('Project not found', { status: 500 });
        }

        let project = projectRes.data as Project;

        if (!project) {
            return new Response('Project not found', { status: 500 });
        }

        console.log('project', project);

        // 2. Generate scene descriptions
        const toolCalls = await genSceneDescriptions(project!.concept!, Number(num_scenes));
        if (!toolCalls) {
            return new Response('No scene descriptions returned.', { status: 500 });
        }

        const scenesDict = JSON.parse(toolCalls[0].function.arguments);

        console.log('scenesDict', scenesDict);

        let scenesPayload : Object[] = [];
        for (let i = 0; i < num_scenes; i++) {
            scenesPayload.push({
                owner_id: user.id,
                project_id: project.id,
                selected_prompt: 0,
                seq_num: i,
                title: scenesDict[`scene_${i + 1}_title`],
                description: scenesDict[`scene_${i + 1}_description`],
            });
        }

        console.log('scenesPayload', scenesPayload);

        const scenes = await supabase.from('scenes').insert(scenesPayload).select();

        if (scenes.error) {
            return new Response('Error inserting scenes', { status: 500 });
        }

        // Deduct 20 credits from user's account
        const userProfile = await supabase.from('user_profiles').select().eq('owner_id', user.id);

        if (userProfile.error) {
            return new Response('Error fetching user profile', { status: 500 });
        }

        const coinsDeductedUserProfile = await supabase
            .from('user_profiles')
            .update({
                credits: userProfile.data[0].credits - STORYBOARD_GEN_CREDITS_COST
            })
            .eq('owner_id', user.id)
            .select()

        if (coinsDeductedUserProfile.error) {
            // don't fail the request if this fails, since we've already
            // incurred the cost of scene generation. Just log it.
            console.error('Error updating user profile', coinsDeductedUserProfile.error);
        }


        const responsePayload = JSON.stringify({
            project: project.id,
            scenes: scenes.data,
        });

        console.log('returning responsePayload', responsePayload);
        
        return new Response(responsePayload, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error)?.message || 'Failed to generate project scenes.';
        return new Response(errorMessage, { status: 500 });
    }
}