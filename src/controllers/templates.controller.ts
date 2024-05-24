import { Template } from '@prisma/client';
import { Response } from 'express';
import status from 'http-status';

import {
  CreateTemplateSchemaType,
  GetTemplatesQueryParamsSchemaType,
} from '@/schemas/templates.schemas';
import {
  getTemplatesService,
  TemplatesService,
} from '@/services/templates.service';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  FORM_SUCCESS_MESSAGES,
  SORT_FORM_DIRECTIONS,
  SORT_FORM_FIELDS,
} from '../constants';
import { CustomRequest } from '../types/customRequest.types';
import { errorResponse, successResponse } from '../utils';

let instance: TemplatesController | null = null;

export const getTemplatesController = () => {
  if (!instance) {
    instance = new TemplatesController();
  }

  return instance;
};

export class TemplatesController {
  private templatesService: TemplatesService;

  public constructor() {
    this.templatesService = getTemplatesService();
  }

  public getAllTemplates = async (
    req: CustomRequest<unknown, GetTemplatesQueryParamsSchemaType>,
    res: Response,
  ) => {
    try {
      const {
        page = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        search: searchText = '',
        isDeleted: isDeletedParam,
        sortField = SORT_FORM_FIELDS.CREATED_AT,
        sortDirection = SORT_FORM_DIRECTIONS.DESC,
        categoryId = -1,
      } = req.query;

      const isDeleted = isDeletedParam === 1;

      const totalTemplates = await this.templatesService.getTotalTemplate({
        searchText,
        isDeleted,
        categoryId: Number(categoryId),
      });
      const totalPages = Math.ceil(totalTemplates / pageSize);

      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const templates = await this.templatesService.getAllTemplate({
        offset: Number(offset),
        limit: Number(limit),
        searchText,
        isDeleted,
        categoryId: Number(categoryId),
        sortField,
        sortDirection,
      });

      const responseData = {
        templates,
        page,
        pageSize,
        totalTemplates,
        totalPages,
      };
      return successResponse(res, responseData);
    } catch (error) {
      return errorResponse(res);
    }
  };

  public getTemplateDetail = async (
    req: CustomRequest<{ template: Template }>,
    res: Response,
  ) => {
    try {
      const { template } = req.body;

      return successResponse(res, template);
    } catch (error) {
      return errorResponse(res);
    }
  };

  public createTemplate = async (
    req: CustomRequest<CreateTemplateSchemaType>,
    res: Response,
  ) => {
    try {
      const {
        title,
        logoUrl,
        settings,
        elements,
        categoryId,
        description,
        imagePreviewUrl,
      } = req.body;

      const { userId } = req.session;

      const newTemplate = await this.templatesService.createTemplate(userId, {
        imagePreviewUrl,
        title,
        logoUrl,
        settings,
        elements,
        categoryId,
        description,
      });
      return successResponse(
        res,
        newTemplate,
        FORM_SUCCESS_MESSAGES.CREATE_FORM_SUCCESS,
        status.CREATED,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };
}
