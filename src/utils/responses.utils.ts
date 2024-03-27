import { Response } from 'express';
import status from 'http-status';

import { RESPONSES_ERROR_MESSAGES } from '../constants';
import {
  getResponsesService,
  ResponsesService,
} from '../services/responses.service';

import { errorResponse } from './messages.utils';

const responsesService: ResponsesService = getResponsesService();

export const findResponseById = async (responseId: number, res: Response) => {
  const existingResponse = await responsesService.getResponseById(responseId);
  if (!existingResponse) {
    return errorResponse(
      res,
      RESPONSES_ERROR_MESSAGES.RESPONSE_NOT_FOUND,
      status.NOT_FOUND,
    );
  }
  return existingResponse;
};
