import { Form, Response } from '@prisma/client';
import { Response as ExpressResponse } from 'express';
import status from 'http-status';

import {
  RESPONSES_ERROR_MESSAGES,
  RESPONSES_SUCCESS_MESSAGES,
  SORT_DIRECTIONS,
} from '@/constants';
import { CreatedResponseSchema } from '@/schemas/createResponse.schemas';
import { filterObjectSchema } from '@/schemas/filterObject.schemas';
import {
  getResponsesService,
  ResponsesService,
} from '@/services/responses.service';
import { CustomRequest } from '@/types/customRequest.types';
import {
  calculatePagination,
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
    req: CustomRequest<{ form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const reqDate = filterObjectSchema.parse(req.query);
      const page = Number(reqDate.page);
      const pageSize = Number(reqDate.pageSize);
      const searchText = reqDate.searchText;
      const fieldsFilter = reqDate.fieldsFilter;
      const filterList = fieldsFilter?.split(',') || [];
      const { form } = req.body;
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
      return errorResponse(res);
    }
  };

  public createResponse = async (
    req: CustomRequest<CreatedResponseSchema & { form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const { form, formAnswers } = req.body;
      const createdResponse = await this.responsesService.createResponse(
        form.id,
        { formAnswers },
      );
      return successResponse(
        res,
        createdResponse,
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_CREATED,
        status.CREATED,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };

  public deleteResponse = async (
    req: CustomRequest<
      CreatedResponseSchema & { response: Response; form: Form }
    >,
    res: ExpressResponse,
  ) => {
    try {
      const { form, response } = req.body;

      const deletedResponse = await this.responsesService.deleteResponse(
        form.id,
        response.id,
      );
      return successResponse(
        res,
        deletedResponse,
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_DELETED,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };
}
