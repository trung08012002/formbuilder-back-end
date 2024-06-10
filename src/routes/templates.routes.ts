import { Router } from 'express';

import {
  getTemplatesController,
  TemplatesController,
} from '@/controllers/templates.controller';
import { checkUserExistence, verifyToken } from '@/middlewares';
import {
  checkTemplateExistence,
  filterElements,
} from '@/middlewares/template.middlewares';

import { ROUTES } from '../constants';

const templatesRoute = Router();

const templatesController: TemplatesController = getTemplatesController();

templatesRoute.get(ROUTES.ROOT.PATH, templatesController.getAllTemplates);

templatesRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  templatesController.createTemplate,
);

templatesRoute.get(
  ROUTES.TEMPLATE.GET_DETAIL,
  checkTemplateExistence,
  filterElements,
  templatesController.getTemplateDetail,
);

templatesRoute.patch(
  ROUTES.TEMPLATE.UPDATE_TEMPLATE,
  verifyToken,
  checkUserExistence,
  checkTemplateExistence,
  templatesController.updateTemplate,
);

export default templatesRoute;
