import { Form, Response } from '@prisma/client';
import Excel from 'exceljs';
import { Response as ExpressResponse } from 'express';
import status from 'http-status';
import keyBy from 'lodash/keyBy';

import {
  RESPONSES_ERROR_MESSAGES,
  RESPONSES_SUCCESS_MESSAGES,
  SORT_DIRECTIONS,
} from '@/constants';
import {
  CreatedResponseSchema,
  ElementResponseSchema,
} from '@/schemas/createResponse.schemas';
import { filterObjectSchema } from '@/schemas/filterObject.schemas';
import {
  getResponsesService,
  ResponsesService,
} from '@/services/responses.service';
import { CustomRequest } from '@/types/customRequest.types';
import {
  adjustColumnWidth,
  calculatePagination,
  convertFormElementsToIdAndElementNameRecord,
  convertRawResponseToAnswerAndRate,
  convertRawResponseToAnswerAndRateDate,
  convertRawResponseToExtraInfoResponse,
  errorResponse,
  getHasFieldLabelElementIdAndName,
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

      const elementIdAndNameList = getHasFieldLabelElementIdAndName(
        form.elements,
      );

      const elementListByIdObject = keyBy(form.elements, 'id');

      const updatedResponses = responses.map((response) =>
        convertRawResponseToExtraInfoResponse(elementListByIdObject, response),
      );

      return successResponse(
        res,
        {
          elementIdAndNameList: elementIdAndNameList,
          responses: updatedResponses,
          page,
          pageSize,
          totalResponses,
          totalPages,
        },
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

      if (form.disabled || form.deletedAt !== null)
        return errorResponse(
          res,
          RESPONSES_ERROR_MESSAGES.FORM_NOT_ACCEPTING_RESPONSES,
        );

      const createdResponse = await this.responsesService.createResponse(
        form.totalSubmissions,
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

  public deleteMultipleResponses = async (
    req: CustomRequest<{ responsesIds: number[]; form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const { formId } = req.params;
      const { responsesIds, form } = req.body;
      if (!responsesIds || !formId) {
        return errorResponse(
          res,
          RESPONSES_ERROR_MESSAGES.ID_PARAMS_NOT_FOUND,
          status.UNPROCESSABLE_ENTITY,
        );
      }

      const deletedResponses =
        await this.responsesService.deleteMultipleResponses(
          form.totalSubmissions,
          parseInt(formId),
          responsesIds,
        );

      return successResponse(
        res,
        deletedResponses,
        RESPONSES_SUCCESS_MESSAGES.RESPONSE_DELETED,
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
        form.totalSubmissions,
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
  public exportResponse = async (
    req: CustomRequest<{ form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('list of responses');
      const { form } = req.body;
      const elementIdAndNameList = getHasFieldLabelElementIdAndName(
        form.elements,
      );
      const columns = [
        {
          key: 'id',
          header: 'Id',
        },
        {
          key: 'Submission At',
          header: 'Submission At',
        },
      ];
      columns.push(
        ...elementIdAndNameList.map((element) => ({
          key: element.elementId,
          header: element.elementName,
        })),
      );
      worksheet.columns = columns;

      const allResponses = await this.responsesService.getAllResponsesByFormId(
        form.id,
      );

      allResponses.forEach((response) => {
        const elementAnswers = response.formAnswers.map((elementAnswer) =>
          (elementAnswer as ElementResponseSchema).answers
            .map((fieldAnswer) => fieldAnswer.text)
            .join(' '),
        );

        worksheet.addRow([response.id, response.createdAt, ...elementAnswers]);
      });
      adjustColumnWidth(worksheet);
      await workbook.xlsx.write(res).then(() => res.status(200).end());
    } catch (error) {
      return errorResponse(res);
    }
  };
  public getStatistic = async (
    req: CustomRequest<{ form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const { form } = req.body;

      const responses = await this.responsesService.getAllResponsesByFormId(
        form.id,
      );

      const result = convertRawResponseToAnswerAndRate(
        convertFormElementsToIdAndElementNameRecord(form.elements),
        responses.map(
          (response) =>
            ({ formAnswers: response.formAnswers }) as CreatedResponseSchema,
        ),
      );

      return successResponse(res, result, RESPONSES_SUCCESS_MESSAGES.STATISTIC);
    } catch (error) {
      return errorResponse(res);
    }
  };
  public getDateDataStatistic = async (
    req: CustomRequest<{ form: Form }>,
    res: ExpressResponse,
  ) => {
    try {
      const { form } = req.body;

      const responses = await this.responsesService.getAllResponsesByFormId(
        form.id,
      );

      const result = convertRawResponseToAnswerAndRateDate(
        convertFormElementsToIdAndElementNameRecord(form.elements),
        responses,
      );

      return successResponse(res, result, RESPONSES_SUCCESS_MESSAGES.STATISTIC);
    } catch (error) {
      return errorResponse(res);
    }
  };
}
