import { Template } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { ERROR_MESSAGES } from '@/constants';
import { ElementSchema } from '@/schemas/forms.schemas';
import { CustomRequest } from '@/types/customRequest.types';
import { errorResponse, findTemplateById, isKeyOfObject } from '@/utils';

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

export const filterElements = (
  req: CustomRequest<{ template: Template }, { filter?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { filter = 'false' } = req.query;

    if (filter === 'true') {
      const { template } = req.body;

      template.elements = template.elements.filter((element) =>
        isKeyOfObject('fieldLabel', (element as ElementSchema).config),
      );
      req.body.template = template;
    }
    next();
  } catch (error) {
    return errorResponse(res);
  }
};
