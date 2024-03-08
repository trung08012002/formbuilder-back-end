import prisma from '../configs/db.config';
import { TEAM_ERROR_MESSAGES } from '../constants';
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

  public createFormInTeam = (
    userId: number,
    teamId: number,
    payload: FormPayload,
  ) =>
    prisma.$transaction(async (tx) => {
      // get members' ids in team
      const membersInTeam = await tx.team
        .findUnique({
          where: {
            id: teamId,
          },
        })
        .members();
      const memberIds = membersInTeam?.map((member) => member.id);

      // update form permissions for all members in team
      let formPermissions = {};
      if (!memberIds) {
        throw Error(TEAM_ERROR_MESSAGES.NO_MEMBERS_IN_TEAM);
      }
      memberIds.map(
        (memberId) =>
          (formPermissions = {
            ...formPermissions,
            [memberId]: [
              PERMISSIONS.VIEW,
              PERMISSIONS.EDIT,
              PERMISSIONS.DELETE,
            ],
          }),
      );

      const createdForm = await tx.form.create({
        data: {
          title: payload.title,
          logoUrl: payload.logoUrl,
          settings: payload.settings,
          elements: payload.elements,
          permissions: formPermissions,
          creator: {
            connect: {
              id: userId,
            },
          },
          team: {
            connect: {
              id: teamId,
            },
          },
        },
      });

      return createdForm;
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
