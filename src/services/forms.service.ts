import prisma from '../configs/db.config';
import { FormPayload, GetFormsParams } from '../types/forms.types';
import { PERMISSIONS } from '../types/permissions.types';

let instance: FormsService | null = null;

export const getFormsService = () => {
  if (!instance) {
    instance = new FormsService();
  }

  return instance;
};

export class FormsService {
  public createForm = (userId: number, payload: FormPayload) =>
    prisma.form.create({
      data: {
        title: payload.title,
        logoUrl: payload.logoUrl,
        settings: payload.settings,
        elements: payload.elements,
        permissions: {
          [userId]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
        },
        creator: {
          connect: {
            id: userId,
          },
        },
      },
    });

  public getFormsByUserId = (userId: number, params: GetFormsParams) =>
    prisma.form.findMany({
      skip: params.offset,
      take: params.limit,
      where: {
        creatorId: userId,
        title: {
          contains: params.searchText,
        },
        deletedAt: params.isDeleted ? { not: null } : null,
        favouritedByUsers: params.isFavourite
          ? { some: { id: userId } }
          : undefined,
      },
      orderBy: {
        [params.sortField]: params.sortDirection,
      },
    });

  public getTotalFormsByUserId = (
    userId: number,
    params: Pick<GetFormsParams, 'isDeleted' | 'isFavourite'>,
  ) =>
    prisma.form.count({
      where: {
        creatorId: userId,
        deletedAt: params.isDeleted ? { not: null } : null,
        favouritedByUsers: params.isFavourite
          ? { some: { id: userId } }
          : undefined,
      },
    });

  public getFormById = (formId: number) =>
    prisma.form.findUnique({
      where: {
        id: formId,
      },
    });

  public updateForm = (formId: number, payload: FormPayload) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        title: payload.title,
        logoUrl: payload.logoUrl,
        settings: payload.settings,
        elements: payload.elements,
      },
    });

  public softDeleteForm = (formId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

  public hardDeleteForm = (formId: number) =>
    prisma.form.delete({
      where: {
        id: formId,
      },
    });

  public addToFavourites = (formId: number, userId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        favouritedByUsers: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        favouritedByUsers: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

  public removeFromFavourites = (formId: number, userId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        favouritedByUsers: {
          disconnect: {
            id: userId,
          },
        },
      },
      include: {
        favouritedByUsers: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

  public getFavouritedByUsersOfForm = (formId: number) =>
    prisma.form
      .findUnique({
        where: {
          id: formId,
        },
      })
      .favouritedByUsers();
}
