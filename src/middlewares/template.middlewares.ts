import { NextFunction, Request, Response } from 'express';

import { ERROR_MESSAGES } from '@/constants';
import { errorResponse, findTemplateById } from '@/utils';

export const checkTemplateExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { templateId } = req.params;
    if (templateId === undefined) {
      return errorResponse(res, ERROR_MESSAGES.UNPROCESSABLE_ENTITY);
    }
    const template = await findTemplateById(Number(templateId));
    req.body.template = template;
    next();
  } catch (error) {
    return errorResponse(res);
  }
};
