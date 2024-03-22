import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { ERROR_MESSAGES, RESPONSES_ERROR_MESSAGES } from '../constants';
import {
  getResponsesService,
  ResponsesService,
} from '../services/responses.service';
import { errorResponse } from '../utils';

const responsesService: ResponsesService = getResponsesService();

export const checkResponseExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { responseId } = req.params;

    const existingResponse = await responsesService.getResponseById(
      Number(responseId),
    );
    if (!existingResponse) {
      return errorResponse(
        res,
        RESPONSES_ERROR_MESSAGES.RESPONSE_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    req.body.response = existingResponse;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
