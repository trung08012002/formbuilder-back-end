import { Form } from '@prisma/client';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import status from 'http-status';

import {
  ERROR_MESSAGES,
  RESPONSES_ERROR_MESSAGES,
  RESPONSES_SUCCESS_MESSAGES,
} from '@/constants';
import { SORT_DIRECTIONS } from '@/constants';
import { CreatedResponseSchema } from '@/schemas/createResponse.schemas';
import { filterObjectSchema } from '@/schemas/filterObject.schemas';
import {
  getResponsesService,
  ResponsesService,
} from '@/services/responses.service';
import {
  calculatePagination as calculatePagination,
  errorResponse,
  isDateActions,
  isOtherFieldsActions,
  successResponse,
} from '@/utils';

let instance: ResponsesController | null = null;

export const getResponsesController = () => {
  if (!instance) {
    instance = new ResponsesController();
  }
  return instance;
};

export class ResponsesController {
  private responsesService: ResponsesService;
  public constructor() {
    this.responsesService = getResponsesService();
  }

  public convertFilterObject(
    fieldFilter: string,
    idElementsOfFormList: number[],
  ) {
    const splittedFieldFilter = fieldFilter.split(':');
    if (splittedFieldFilter.length !== 2) {
      throw new Error(RESPONSES_ERROR_MESSAGES.INVALID_FIELD_FILTER);
    }
    const [key, value] = splittedFieldFilter;
    const valueKey = key.split(':');
    if (
      (valueKey.length === 4 &&
        idElementsOfFormList.includes(+valueKey[0]) &&
        isDateActions(valueKey[1])) ||
      (valueKey.length === 3 &&
        idElementsOfFormList.includes(+valueKey[0]) &&
        isOtherFieldsActions(valueKey[1]))
    ) {
      return {
        element_id: valueKey[0],
        answers: {
          has: {
            text: {
              [valueKey[1]]: value,
            },
          },
        },
      };
    }
    throw new Error(RESPONSES_ERROR_MESSAGES.INVALID_FIELD_FILTER);
  }

  public getAllResponseByFormId = async (
    req: Request<ParamsDictionary, unknown, { form: Form }>,
    res: Response,
  ) => {
    try {
      const reqDate = filterObjectSchema.parse(req.query);
      const page = Number(reqDate.page);
      const pageSize = Number(reqDate.pageSize);
      const searchText = reqDate.searchText;
      const fieldsFilter = reqDate.fieldsFilter;
      const filterList = fieldsFilter?.split(',') || [];
      const form = req.body.form;
      const totalResponses = form.totalSubmissions;
      const idElementsOfFormList = form.elements.map(
        (element) => +JSON.parse(JSON.stringify(element)).id,
      );
      const objectFilterList = filterList.map((fieldFilter) =>
        this.convertFilterObject(fieldFilter, idElementsOfFormList),
      );
      const sortField = reqDate.sortField;
      const sortDirection = reqDate.sortDirection || SORT_DIRECTIONS.ASCENDING;

      const { totalPages, offset, limit } = calculatePagination({
        condition: searchText == null,
        totalResponses,
        pageSize,
        page,
      });

      const responses = await this.responsesService.getResponsesByFormId({
        formId: form.id,
        offset,
        limit,
        searchText,
        filterList: objectFilterList,
        sortField,
        sortDirection,
      });
      return successResponse(
        res,
        { responses, page, pageSize, totalResponses, totalPages },
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_GET_SUCCESS,
      );
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, error.message, status.UNPROCESSABLE_ENTITY);
      }
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public createResponse = async (
    req: Request<ParamsDictionary, unknown, CreatedResponseSchema>,
    res: Response,
  ) => {
    try {
      const formId = Number(req.params.formId);
      const createdResponse = await this.responsesService.createResponse(
        formId,
        req.body,
      );
      return successResponse(
        res,
        createdResponse,
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_CREATED,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  deleteResponse = async (req: Request, res: Response) => {
    try {
      const { formId, id } = req.params;
      if (!id || !formId) {
        return errorResponse(
          res,
          RESPONSES_ERROR_MESSAGES.ID_PARAMS_NOT_FOUND,
          status.UNPROCESSABLE_ENTITY,
        );
      }

      const deletedResponse = await this.responsesService.deleteResponse(
        parseInt(formId),
        parseInt(id),
      );
      return successResponse(
        res,
        deletedResponse,
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_DELETED,
      );
    } catch (error) {
      console.error('Error in response:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
