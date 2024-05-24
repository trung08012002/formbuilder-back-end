import { CategoryTemplate } from '@prisma/client';
import { Request, Response } from 'express';

import { TEMPLATE_CATEGORY_SUCCESS_MESSAGES } from '@/constants';
import {
  getTemplateCategoryService,
  TemplateCategoryService,
} from '@/services/template_category.service';
import { CustomRequest } from '@/types/customRequest.types';
import { errorResponse, successResponse } from '@/utils';

let instance: TemplateCategoryController | null = null;

export const getTemplateCategoryController = () => {
  if (!instance) {
    instance = new TemplateCategoryController();
  }
  return instance;
};

export class TemplateCategoryController {
  templateCategoryService: TemplateCategoryService;
  constructor() {
    this.templateCategoryService = getTemplateCategoryService();
  }
  public createTemplateCategory = async (
    req: CustomRequest<Pick<CategoryTemplate, 'description' | 'title'>>,
    res: Response,
  ) => {
    try {
      const { description, title } = req.body;
      const categoryTemplate =
        await this.templateCategoryService.createTemplateCategory({
          description,
          title,
        });
      return successResponse(
        res,
        categoryTemplate,
        TEMPLATE_CATEGORY_SUCCESS_MESSAGES.CREATE_TEMPLATE_CATEGORY_SUCCESS,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };
  public deleteTemplateCategory = async (
    req: CustomRequest<unknown, { categoryId: number }>,
    res: Response,
  ) => {
    try {
      const deleteCategoryTemplate =
        await this.templateCategoryService.deleteTemplateCategory(
          req.query.categoryId,
        );
      return successResponse(
        res,
        deleteCategoryTemplate,
        TEMPLATE_CATEGORY_SUCCESS_MESSAGES.DELETE_TEMPLATE_CATEGORY_SUCCESS,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };
  public getAllTemplateCategories = async (req: Request, res: Response) => {
    try {
      const categoryTemplates =
        await this.templateCategoryService.getAllTemplateCategories();
      return successResponse(
        res,
        categoryTemplates,
        TEMPLATE_CATEGORY_SUCCESS_MESSAGES.GET_ALL_TEMPLATE_CATEGORY_SUCCESS,
      );
    } catch (error) {
      return errorResponse(res);
    }
  };
}
