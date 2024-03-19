import { Router } from 'express';

import { ROUTES } from '@/constants';
import {
  getResponsesController,
  ResponsesController,
} from '@/controllers/responses.controller';
import {
  checkFormExistence,
  validateCreatedResponse,
  validateFilterObject,
  verifyToken,
} from '@/middlewares';

const responseRoute = Router();

const responsesController: ResponsesController = getResponsesController();

responseRoute.get(
  ROUTES.RESPONSE.GET_RESPONSES_BY_FORMID,
  verifyToken,
  validateFilterObject,
  checkFormExistence,
  responsesController.getAllResponseByFormId,
);

responseRoute.post(
  ROUTES.RESPONSE.CREATE_RESPONSE,
  verifyToken,
  validateCreatedResponse,
  checkFormExistence,
  responsesController.createResponse,
);

responseRoute.delete(
  ROUTES.RESPONSE.DELETE_RESPONSE,
  verifyToken,
  checkFormExistence,
  responsesController.deleteResponse,
);

export default responseRoute;
