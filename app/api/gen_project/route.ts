import { OpenAI } from 'openai';
import { createClient } from '@/utils/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300;

const openai = new OpenAI();

const GPT_MODEL = "gpt-4-turbo-preview";

// Function to generate project title
async function genProjectTitle(conceptPrompt: string) {
    const messages = [
        {
            role: "system",
            content: "Given the description of the concept for a video, generate a short 2-4 word title that summarizes its concept.",
        },
        { role: "user", content: conceptPrompt },
    ];

    const response = await chatCompletionRequest(messages);

    if (!response.choices[0].message.content) {
        throw new Error('No project title returned.');
    }

    // delete any trailing quotation marks
    const title = response.choices[0].message.content.trim().replace(/^["'](.*)["']$/, '$1');

    // TODO(gabor): remove this console.log
    console.log('title', title);

    return title;
}

// Function to generate scene descriptions
async function genSceneDescriptions(conceptPrompt: string, maxScenes: number = 5) {
    const messages = [
        {
            role: "system",
            content: "Given the description of the concept for a video, call a video generator function called 'render_video_with_scenes' with descriptions and short titles for each scene. Describe each scene in exhaustive detail, and include a description of the characters in each scene. Don't preface with 'Scene 1' and the like, just the description.",
        },
        { role: "user", content: `Concept: ${conceptPrompt}\n\n There should be ${maxScenes} scenes in total, with scene descriptions being passed into 'scene_N_description' for scene number N.` },
    ];

    const functionCallArray = genFunctionCallArray(maxScenes);

    console.log('functionCallArray', functionCallArray);

    const response = await chatCompletionRequest(messages, functionCallArray);

    console.log('genSceneDescriptions response', response);

    if (!response.choices[0].message.tool_calls) {
        console.log('No scene descriptions returned for prompt!', messages);
        throw new Error(`No scene descriptions returned for prompt: ${messages}`);
    }

    const toolCalls = response.choices[0].message.tool_calls;

    console.log('toolCalls response', toolCalls);

    return toolCalls;
}

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

    console.log('SHOT functionCallArray', functionCallArray);
    console.log('FAParams', functionCallArray[0].function.parameters);

    const response = await chatCompletionRequest(messages, functionCallArray);

    if (!response.choices[0].message.tool_calls) {
        console.log('No shot descriptions returned for prompt!', messages);
        throw new Error(`No shot descriptions returned for prompt: ${messages}`);
    }

    const toolCalls = response.choices[0].message.tool_calls;

    console.log('SHOT toolCalls response', toolCalls);

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

async function chatCompletionRequest(messages: any[], tools: any[] = [], model: string = GPT_MODEL) {
    try {
        if (tools.length > 0) {
            console.log('tools', tools);
            const response = await openai.chat.completions.create({
                model: model,
                messages: messages,
                tools: tools,
            });
            return response;
        } else {
            console.log('no tools', tools);
            const response = await openai.chat.completions.create({
                model: model,
                messages: messages,
            });
            return response;
        }
    } catch (e) {
        console.error("Unable to generate ChatCompletion response", e);
        throw e;
    }
}

// POST /api/gen_project_w_shots
// Generate a project with scenes and shots via OpenAI
// Then stores the project, scenes, and shots in the Supabase database
// Returns a JSON object with the project, scenes, and shots data
// Input params (in JSON body):
// - concept, aspect_ratio, style, numScenes

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

        // 2. Generate scene descriptions
        const toolCalls = await genSceneDescriptions(concept, Number(numScenes));
        if (!toolCalls) {
            return new Response('No scene descriptions returned.', { status: 500 });
        }

        const scenesDict = JSON.parse(toolCalls[0].function.arguments);

        console.log('scenesDict', scenesDict);

        let scenesPayload = [];
        for (let i = 0; i < numScenes; i++) {
            scenesPayload.push({
                owner_id: user.id,
                project_id: project.data[0].id,
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

        // 3. Generate shot descriptions for each scene
        for (let i = 0; i < scenes.data.length; i++) {
            const sceneDescription = scenesDict[`scene_${i + 1}_description`];
            const shotToolCalls = await genShotDescriptions(sceneDescription, concept);

            if (!shotToolCalls || !shotToolCalls[0].function.arguments || shotToolCalls[0].function.arguments.length === 0) {
                console.log('No shot descriptions returned.');
                return new Response('No shot descriptions returned.', { status: 500 });
            }

            const shotsDict = JSON.parse(shotToolCalls[0].function.arguments);

            console.log('shotsDict', shotsDict);

            let shotsPayload = [];
            let shotPromptsPayload = [];
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
                        scene_id: scenes.data[i].id,
                        selected_prompt: 0,
                        seq_num: j,
                        title: shotTitle,
                    });
                }
            }

            console.log()

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
        }

        const responsePayload = JSON.stringify({
            project: project.data[0],
            scenes: scenes.data,
        });

        console.log('returning project.data[0].id', project.data[0].id);

        // return full response
        return new Response(responsePayload, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error)?.message || 'Failed to generate project data.';
        return new Response(errorMessage, { status: 500 });
    }
}