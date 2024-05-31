import { Prisma, Template } from '@prisma/client';
import { Response } from 'express';
import status from 'http-status';

import {
  CreateTemplateSchemaType,
  GetTemplatesQueryParamsSchemaType,
  UpdateTemplateSchemaType,
} from '@/schemas/templates.schemas';
import {
  getTemplatesService,
  TemplatesService,
} from '@/services/templates.service';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGES,
  SORT_FORM_DIRECTIONS,
  SORT_FORM_FIELDS,
  TEMPLATE_ERROR_MESSAGES,
  TEMPLATE_SUCCESS_MESSAGES,
} from '../constants';
import { CustomRequest } from '../types/customRequest.types';
import { canEdit, errorResponse, successResponse } from '../utils';

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
        TEMPLATE_SUCCESS_MESSAGES.CREATE_FORM_SUCCESS,
        status.CREATED,
      );
    } catch (error) {
      return errorResponse(res, TEMPLATE_ERROR_MESSAGES.CREATE_FORM_ERROR);
    }
  };
  public updateTemplate = async (
    req: CustomRequest<UpdateTemplateSchemaType & { template: Template }>,
    res: Response,
  ) => {
    try {
      const { userId } = req.session;
      const {
        title,
        logoUrl,
        settings,
        elements,
        categoryId,
        description,
        disabled,
        isDelete,
        imagePreviewUrl,
        isValid,
        template,
      } = req.body;

      if (!canEdit(userId, template.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const updatedForm = await this.templatesService.updateTemplate(
        template.id,
        {
          title,
          logoUrl,
          settings,
          elements,
          categoryId,
          description,
          disabled,
          isDelete,
          imagePreviewUrl,
          isValid,
        },
      );
      return successResponse(
        res,
        updatedForm,
        TEMPLATE_SUCCESS_MESSAGES.UPDATE_FORM_SUCCESS,
      );
    } catch (error) {
      return errorResponse(res, TEMPLATE_ERROR_MESSAGES.UPDATE_FORM_ERROR);
    }
  };
}
