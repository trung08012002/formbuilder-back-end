import { Router } from 'express';

import {
  getTemplatesController,
  TemplatesController,
} from '@/controllers/templates.controller';
import { checkUserExistence, verifyToken } from '@/middlewares';
import { checkTemplateExistence } from '@/middlewares/template.middlewares';

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
  templatesController.getTemplateDetail,
);

templatesRoute.get(
  ROUTES.TEMPLATE.UPDATE_TEMPLATE,
  verifyToken,
  checkUserExistence,
  checkTemplateExistence,
  templatesController.updateTemplate,
);

export default templatesRoute;
