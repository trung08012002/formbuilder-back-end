import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { ERROR_MESSAGES, FORM_ERROR_MESSAGES } from '@/constants';
import { FormsService, getFormsService } from '@/services/forms.service';
import { errorResponse } from '@/utils';

const formsService: FormsService = getFormsService();

export const checkFormExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const formId = Number(req.params.formId);
    if (!formId) {
      return errorResponse(
        res,
        ERROR_MESSAGES.ID_NOT_FOUND,
        status.UNPROCESSABLE_ENTITY,
      );
    }
    const exitedForm = await formsService.getFormById(formId);
    if (!exitedForm) {
      return errorResponse(
        res,
        FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
        status.NOT_FOUND,
      );
    }
    req.body.form = exitedForm;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
