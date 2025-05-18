import { AzureKeyCredential } from '@azure/core-auth';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';

import { OPENAI_API_KEY, OPENAI_ENDPOINT, OPENAI_MODEL } from '@/constants';
import { checkRequiredEnvVars } from '@/utils';

let instance: OpenAiService | null = null;

export const getOpenAiService = () => {
  if (!instance) {
    instance = new OpenAiService();
  }
  return instance;
};

interface OpenAIParams {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}

export class OpenAiService {
  public getElementFromQuestion = async (openAiParams: OpenAIParams) => {
    checkRequiredEnvVars(['OPENAI_API_KEY', 'OPENAI_ENDPOINT']);
    const { systemPrompt, userPrompt, temperature } = openAiParams;
    const openai = ModelClient(
      OPENAI_ENDPOINT,
      new AzureKeyCredential(OPENAI_API_KEY),
    );
    const completion = await openai.path('/chat/completions').post({
      body: {
        model: OPENAI_MODEL,
        max_tokens: 1024,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    });

    console.log('full response', completion);

    if (isUnexpected(completion)) {
      console.log('error details', completion.body); // Log the entire body
      throw completion.body?.error || new Error('Unexpected response from API');
    }

    const content = completion.body.choices[0].message.content;
    console.log('content first', content);
    let result;
    const match = content?.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      try {
        result = JSON.parse(match[1].trim());
        return result;
      } catch (err) {
        console.error('Failed to parse JSON:', err);
      }
    } else {
      console.error('JSON block not found');
    }
    return result;
  };
}
