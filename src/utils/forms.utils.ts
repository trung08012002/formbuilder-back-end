import { FORM_ERROR_MESSAGES } from '../constants';
import { FormsService, getFormsService } from '../services/forms.service';

const formsService: FormsService = getFormsService();

export const findFormById = async (formId: number) => {
  const existingForm = await formsService.getFormById(formId);
  if (!existingForm) {
    throw new Error(FORM_ERROR_MESSAGES.FORM_NOT_FOUND);
  }
  return existingForm;
};
