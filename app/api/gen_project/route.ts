import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'

const openai = new OpenAI();

const GPT_MODEL = "gpt-4-turbo-preview";

// When the user presses "Generate Storyboard" on a video,
// this will generate the storyboard items. If that was successful,
// it will then add to the DB:
// - a new Project
// - a new Scene for each scene in the storyboard
// - a new ScenePrompt for each prompt in the storyboard

function genFunctionCallArray(numberOfScenes: number) {
    const functionParameters: any = {};
    const requiredSceneDescriptions: string[] = [];

    for (let i = 1; i <= numberOfScenes; i++) {
        const sceneParamForChatCall = {
            type: "string",
            description: `The description for scene number ${i}`,
        };

        functionParameters[`scene_${i}_description`] = sceneParamForChatCall;
        requiredSceneDescriptions.push(`scene_${i}_description`);
    }

    const titleParam = {
        type: "string",
        description: `A 2-4 word title for the video, summarizing its concept.`,
    };

    functionParameters[`title`] = titleParam;
    requiredSceneDescriptions.push('title')
    return [{
        type: "function",
        function: {
            name: "render_video_with_scenes",
            description: "Given a title and descriptions of all the scenes, renders the video.",
            parameters: {
                type: "object",
                properties: functionParameters,
                required: requiredSceneDescriptions,
            },
        },
    }];
}

async function chatCompletionRequest(messages: any[], tools: any[] = [], toolChoice: string | null = null, model: string = GPT_MODEL) {
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            tools: tools,
        });
        return response;
    } catch (e) {
        console.error("Unable to generate ChatCompletion response", e);
        throw e;
    }
}

// Updated to include title generation
async function genSceneDescriptions(conceptPrompt: string, maxScenes: number = 5) {
    const messages = [
        {role: "system", content: "Given the description of the concept for a video, generate a short 2-4 word title and call a video generator function called 'render_video_with_scenes' with descriptions for each scene. Describe each scene in exhaustive detail, and include a description of the characters in each scene. Don't preface with 'Scene 1' and the like, just the description."},
        {role: "user", content: `${conceptPrompt}\n\n These should be ${maxScenes} scenes in total, with the descriptions being passed into the 'scene_N_description' parameter for scene number N. The title for the video should be in the 'title' parameter.`},
    ];

    const functionCallArray = genFunctionCallArray(maxScenes);

    const response = await chatCompletionRequest(messages, functionCallArray);

    const toolCalls = response.choices[0].message.tool_calls;

    return toolCalls;
}

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

    const { concept, aspect_ratio, style } = json;

    if (!concept || !aspect_ratio || !style) {
        return new Response('Missing required parameters', { status: 400 });
    }

    const numScenes = json.numScenes ?? 5;


    try {
        const toolCalls = await genSceneDescriptions(concept, Number(numScenes));
        if (!toolCalls) {
            return new Response('No scene descriptions returned.', { status: 500 });
        }

        const scenesDict = JSON.parse(toolCalls[0].function.arguments);

        const title = scenesDict['title'];

        const project = await supabase
            .from('projects')
            .insert({
                aspect_ratio: json.aspect_ratio,
                concept: json.concept,
                style: json.style,
                owner_id: user.id,
                title
            })
            .select()

        if (project.error) {
            return new Response('Error', { status: 500 })
        }

        let scenesPayload = []
        for (let i = 0; i < Object.keys(scenesDict).length-1; i++) {
            scenesPayload.push({
                owner_id: user.id,
                project_id: project.data[0].id,
                selected_prompt: 0,
                seq_num: i
            })
        }

        const scenes = await supabase.from('scenes').insert(scenesPayload).select()

        if (scenes.error) {
            return new Response('Error inserting scenes', { status: 500 })
        }

        let promptsPayload = []
        for (let i = 0; i < Object.keys(scenesDict).length-1; i++) {
            promptsPayload.push({
                owner_id: user.id,
                scene_id: scenes.data[i].id,
                prompt: scenesDict[`scene_${i + 1}_description`],
                selected_still: 0,
                seq_num: i
            })
        }

        const prompts = await supabase.from('scene_prompts').insert(promptsPayload).select()

        if (prompts.error) {
            return new Response('Error inserting prompts', { status: 500 })
        }

        const responsePayload = JSON.stringify({
            project: project.data[0],
            scenes: scenes.data,
            prompts: prompts.data
        });

        return new Response(responsePayload, { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('Failed to generate scene descriptions and title.', { status: 500 });
    }
};
