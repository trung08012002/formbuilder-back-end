import { Router } from 'express';

import { ROUTES } from '@/constants';
import {
  getResponsesController,
  ResponsesController,
} from '@/controllers/responses.controller';
import {
  checkFormExistence,
  checkResponseExistence,
  checkUserExistence,
  validateCreatedResponse,
  validateFilterObject,
  verifyToken,
} from '@/middlewares';

const responseRoute = Router();

const responsesController: ResponsesController = getResponsesController();

responseRoute.get(
  ROUTES.RESPONSE.GET_RESPONSES_BY_FORMID,
  verifyToken,
  checkUserExistence,
  validateFilterObject,
  checkFormExistence,
  responsesController.getAllResponseByFormId,
);

responseRoute.get(
  ROUTES.RESPONSE.EXPORT_RESPONSES,
  verifyToken,
  checkUserExistence,
  checkFormExistence,
  responsesController.exportResponse,
);

responseRoute.post(
  ROUTES.RESPONSE.CREATE_RESPONSE,
  checkFormExistence,
  validateCreatedResponse,
  responsesController.createResponse,
);

responseRoute.delete(
  ROUTES.RESPONSE.DELETE_RESPONSE,
  verifyToken,
  checkUserExistence,
  checkResponseExistence,
  checkFormExistence,
  responsesController.deleteResponse,
);

responseRoute.delete(
  ROUTES.RESPONSE.DELETE_MANY_RESPONSES,
  verifyToken,
  checkUserExistence,
  checkFormExistence,
  responsesController.deleteMultipleResponses,
);

export default responseRoute;
