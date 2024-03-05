import { Router } from 'express';

import { ROUTES } from '../constants';
import {
  FormsController,
  getFormsController,
} from '../controllers/forms.controller';
import {
  validateConfigSchema,
  validateCreateFormSchema,
  validateUpdateFormSchema,
  verifyToken,
} from '../middlewares';

const formsRoute = Router();

const formsController: FormsController = getFormsController();

formsRoute.get(
  ROUTES.FORM.GET_FORM_DETAILS,
  verifyToken,
  formsController.getFormDetails,
);
formsRoute.get(ROUTES.ROOT.PATH, verifyToken, formsController.getAllMyForms);
formsRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  validateCreateFormSchema,
  validateConfigSchema,
  formsController.createForm,
);
formsRoute.patch(
  ROUTES.FORM.UPDATE_FORM,
  verifyToken,
  validateUpdateFormSchema,
  validateConfigSchema,
  formsController.updateForm,
);
formsRoute.delete(
  ROUTES.FORM.DELETE_FORM,
  verifyToken,
  formsController.deleteForm,
);
formsRoute.patch(
  ROUTES.FORM.FAVOURITES,
  verifyToken,
  formsController.addToFavourites,
);

export default formsRoute;
