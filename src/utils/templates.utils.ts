import {
  getTemplatesService,
  TemplatesService,
} from '../services/templates.service';

const templatesService: TemplatesService = getTemplatesService();

export const findTemplateById = async (templateId: number) => {
  const existingTemplate =
    await templatesService.getTemplateDetails(templateId);
  if (!existingTemplate) {
    throw new Error();
  }
  return existingTemplate;
};
