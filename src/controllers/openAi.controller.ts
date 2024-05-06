import { Response } from 'express';
import status from 'http-status';

import { OPEN_AI_ERROR_MESSAGES, systemPrompt } from '@/constants';
import { CustomRequest } from '@/types/customRequest.types';
import { errorResponse, successResponse } from '@/utils';

import { getOpenAiService, OpenAiService } from '../services/openAi.service';

let instance: OpenAiController | null = null;

export const getOpenAiController = () => {
  if (!instance) {
    instance = new OpenAiController();
  }
  return instance;
};

export class OpenAiController {
  private openAiService: OpenAiService;
  public constructor() {
    this.openAiService = getOpenAiService();
  }
  public getElementFromQuestion = async (
    req: CustomRequest<{ questions: string }>,
    res: Response,
  ) => {
    try {
      const { questions } = req.body;
      if (!questions)
        return errorResponse(
          res,
          OPEN_AI_ERROR_MESSAGES.REQUIRED_QUESTIONS,
          status.UNPROCESSABLE_ENTITY,
        );
      const content = await this.openAiService.getElementFromQuestion({
        systemPrompt: systemPrompt,
        userPrompt: questions,
        temperature: 0.5,
      });
      return successResponse(res, { elements: content });
    } catch (error: unknown) {
      return errorResponse(res);
    }
  };
}
