import { Router } from 'express';

import {
  getTemplateCategoryController,
  TemplateCategoryController,
} from '@/controllers/template_category.controller';
import { checkUserExistence, verifyToken } from '@/middlewares';

import { ROUTES } from '../constants';

const templateCategoryRoute = Router();

const templateCategoryController: TemplateCategoryController =
  getTemplateCategoryController();

templateCategoryRoute.get(
  ROUTES.ROOT.PATH,
  templateCategoryController.getAllTemplateCategories,
);

templateCategoryRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  templateCategoryController.createTemplateCategory,
);

templateCategoryRoute.delete(
  ROUTES.TEMPLATE_CATEGORY.DELETE_TEMPLATE_CATEGORY,
  templateCategoryController.deleteTemplateCategory,
);

export default templateCategoryRoute;
