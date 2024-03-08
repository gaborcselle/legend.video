// utilities for project generation
import { OpenAI } from 'openai';

// GPT model to use for chat completions
const GPT_MODEL = "gpt-4-turbo-preview";

export async function chatCompletionRequest(openai : OpenAI, messages: any[], tools: any[] = [], model: string = GPT_MODEL) {
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