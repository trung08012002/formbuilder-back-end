import { CategoryTemplate } from '@prisma/client';

import prisma from '@/configs/db.config';
import { randomHexColorCode } from '@/utils/color.utils';

let instance: TemplateCategoryService;

export const getTemplateCategoryService = () => {
  if (!instance) {
    instance = new TemplateCategoryService();
  }
  return instance;
};

export class TemplateCategoryService {
  public createTemplateCategory = (
    categoryTemplate: Pick<CategoryTemplate, 'description' | 'title'>,
  ) =>
    prisma.categoryTemplate.create({
      data: { ...categoryTemplate, color: randomHexColorCode() },
    });
  public deleteTemplateCategory = (id: number) =>
    prisma.categoryTemplate.delete({ where: { id } });
  public getAllTemplateCategories = () => prisma.categoryTemplate.findMany();
}
