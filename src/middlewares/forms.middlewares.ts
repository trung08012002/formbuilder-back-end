import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { CustomRequest } from '@/types/customRequest.types';

import { ERROR_MESSAGES, FORM_ERROR_MESSAGES } from '../constants';
import {
  addressConfigSchema,
  appointmentConfigSchema,
  datepickerConfigSchema,
  dividerConfigSchema,
  dropdownConfigSchema,
  emailConfigSchema,
  fileUploadConfigSchema,
  fullnameConfigSchema,
  GetFormsQueryParamsSchema,
  GetFormsQueryParamsSchemaType,
  headingConfigSchema,
  imageConfigSchema,
  inputTableConfigSchema,
  longTextConfigSchema,
  multipleChoiceConfigSchema,
  numberConfigSchema,
  pageBreakConfigSchema,
  phoneConfigSchema,
  scaleRatingConfigSchema,
  shortTextConfigSchema,
  singleChoiceConfigSchema,
  starRatingConfigSchema,
  submitConfigSchema,
  timeConfigSchema,
} from '../schemas/forms.schemas';
import { FormsService, getFormsService } from '../services/forms.service';
import { ELEMENT_TYPE } from '../types/forms.types';
import { errorResponse, validateData } from '../utils';

const formsService: FormsService = getFormsService();

export const validateConfigSchema = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { elements } = req.body;
    if (elements) {
      let errorElementId;
      for (const element of elements) {
        switch (element.type) {
          case ELEMENT_TYPE.HEADING: {
            const result = await validateData(
              headingConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.FULLNAME: {
            const result = await validateData(
              fullnameConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.EMAIL: {
            const result = await validateData(
              emailConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.ADDRESS: {
            const result = await validateData(
              addressConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.PHONE: {
            const result = await validateData(
              phoneConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.DATEPICKER: {
            const result = await validateData(
              datepickerConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.APPOINTMENT: {
            const result = await validateData(
              appointmentConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.SHORT_TEXT: {
            const result = await validateData(
              shortTextConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.LONG_TEXT: {
            const result = await validateData(
              longTextConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.DROPDOWN: {
            const result = await validateData(
              dropdownConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.SINGLE_CHOICE: {
            const result = await validateData(
              singleChoiceConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.MULTIPLE_CHOICE: {
            const result = await validateData(
              multipleChoiceConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.NUMBER: {
            const result = await validateData(
              numberConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.IMAGE: {
            const result = await validateData(
              imageConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.FILE_UPLOAD: {
            const result = await validateData(
              fileUploadConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.TIME: {
            const result = await validateData(timeConfigSchema, element.config);
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.SUBMIT: {
            const result = await validateData(
              submitConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.INPUT_TABLE: {
            const result = await validateData(
              inputTableConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.STAR_RATING: {
            const result = await validateData(
              starRatingConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.SCALE_RATING: {
            const result = await validateData(
              scaleRatingConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.DIVIDER: {
            const result = await validateData(
              dividerConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          case ELEMENT_TYPE.PAGE_BREAK: {
            const result = await validateData(
              pageBreakConfigSchema,
              element.config,
            );
            if (result?.error) {
              errorElementId = element.id;
            }
            break;
          }
          default:
            return errorResponse(
              res,
              FORM_ERROR_MESSAGES.UNDEFINED_TYPE_OF_ELEMENT,
            );
        }
      }
      if (errorElementId) {
        return errorResponse(
          res,
          `Property 'config' in element with ID: ${errorElementId} is invalid`,
        );
      }
    }
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

export const checkFormExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { formId } = req.params;

    const existingForm = await formsService.getFormById(Number(formId));
    if (!existingForm) {
      return errorResponse(
        res,
        FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
        status.NOT_FOUND,
      );
    }
    req.body.form = existingForm;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

export const validateGetFormQueryParamsSchema = async (
  req: CustomRequest<unknown, GetFormsQueryParamsSchemaType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      sortField,
      sortDirection,
      page: pageParam,
      pageSize: pageSizeParam,
      isDeleted: isDeletedParam,
      isFavourite: isFavouriteParam,
      folderId: folderIdParam,
      teamId: teamIdParam,
    } = req.query;

    const queryParams: GetFormsQueryParamsSchemaType = {
      search,
      sortField,
      sortDirection,
      page: pageParam ? Number(pageParam) : undefined,
      pageSize: pageSizeParam ? Number(pageSizeParam) : undefined,
      isDeleted: isDeletedParam ? Number(isDeletedParam) : undefined,
      isFavourite: isFavouriteParam ? Number(isFavouriteParam) : undefined,
      folderId: folderIdParam ? Number(folderIdParam) : undefined,
      teamId: teamIdParam ? Number(teamIdParam) : undefined,
    };

    const result = await validateData(GetFormsQueryParamsSchema, queryParams);
    if (result?.error) {
      return errorResponse(res, ERROR_MESSAGES.INVALID_QUERY_PARAMS);
    }

    req.query = queryParams;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
