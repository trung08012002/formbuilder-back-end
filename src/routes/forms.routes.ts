import { Router } from 'express';

import { ROUTES } from '../constants';
import {
  FormsController,
  getFormsController,
} from '../controllers/forms.controller';
import {
  checkUserExistence,
  validateConfigSchema,
  validateCreateFormSchema,
  validateUpdateFormSchema,
  verifyToken,
} from '../middlewares';
import { checkFormExistence } from '../middlewares/forms.middlewares';

const formsRoute = Router();

const formsController: FormsController = getFormsController();

formsRoute.get(
  ROUTES.FORM.GET_FORM_DETAILS,
  verifyToken,
  checkFormExistence,
  formsController.getFormDetails,
);
formsRoute.get(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  formsController.getAllMyForms,
);
formsRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  validateCreateFormSchema,
  validateConfigSchema,
  formsController.createForm,
);
formsRoute.patch(
  ROUTES.FORM.UPDATE_FORM,
  verifyToken,
  checkFormExistence,
  validateUpdateFormSchema,
  validateConfigSchema,
  formsController.updateForm,
);
formsRoute.delete(
  ROUTES.FORM.DELETE_FORM,
  verifyToken,
  checkFormExistence,
  formsController.deleteForm,
);
formsRoute.patch(
  ROUTES.FORM.FAVOURITES,
  verifyToken,
  checkUserExistence,
  checkFormExistence,
  formsController.addToFavourites,
);

export default formsRoute;
