import prisma from '@/configs/db.config';
import {
  CreateTemplateSchemaType,
  UpdateTemplateSchemaType,
} from '@/schemas/templates.schemas';
import { PERMISSIONS } from '@/types/permissions.types';
import { GetTemplateArgs } from '@/types/templates.types';

let instance: TemplatesService | null = null;

export const getTemplatesService = () => {
  if (!instance) {
    instance = new TemplatesService();
  }

  return instance;
};

export class TemplatesService {
  public createTemplate = async (
    userId: number,
    payload: CreateTemplateSchemaType,
  ) =>
    prisma.template.create({
      data: {
        category: {
          connect: {
            id: payload.categoryId,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        title: payload.title,
        logoUrl: payload.logoUrl,
        settings: payload.settings,
        elements: payload.elements,
        imagePreviewUrl: payload.imagePreviewUrl,
        description: payload.description,
        permissions: {
          [userId]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
        },
        creator: {
          connect: {
            id: userId,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
    });

  public getTemplateDetails = (templateId: number) =>
    prisma.template.findFirst({ where: { isValid: false, id: templateId } });

  public getAllTemplate = (args: GetTemplateArgs) =>
    prisma.template.findMany({
      select: {
        title: true,
        description: true,
        category: true,
        id: true,
        imagePreviewUrl: true,
      },
      skip: args.offset,
      take: args.limit,
      where: {
        isValid: false,
        title: {
          contains: args.searchText,
          mode: 'insensitive',
        },
        ...(args.categoryId === -1
          ? {}
          : {
              categoryId: {
                equals: args.categoryId,
              },
            }),
        deletedAt: args.isDeleted ? { not: null } : null,
      },
      orderBy: {
        [args.sortField]: args.sortDirection,
      },
    });

  public getTotalTemplate = (
    args: Pick<GetTemplateArgs, 'searchText' | 'categoryId' | 'isDeleted'>,
  ) =>
    prisma.template.count({
      where: {
        title: {
          contains: args.searchText,
          mode: 'insensitive',
        },
        ...(args.categoryId === -1
          ? {}
          : {
              categoryId: {
                equals: args.categoryId,
              },
            }),
        deletedAt: args.isDeleted ? { not: null } : null,
      },
    });

  public updateTemplate = (
    templateId: number,
    payload: UpdateTemplateSchemaType,
  ) =>
    prisma.template.update({
      where: {
        id: templateId,
      },
      data: {
        title: payload.title,
        logoUrl: payload.logoUrl,
        settings: payload.settings,
        elements: payload.elements,
        description: payload.description,
        category: {
          connect: {
            id: payload.categoryId,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        disabled: payload.disabled,
        isValid: payload.isValid,
        ...(payload.isDelete ? { deletedAt: new Date() } : { deletedAt: null }),
      },
    });

  public hardDeleteTemplate = (templateId: number) =>
    prisma.template.delete({
      where: { id: templateId },
    });
}
