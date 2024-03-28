import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import _omit from 'lodash.omit';

import prisma from '../configs/db.config';
import { TEAM_ERROR_MESSAGES } from '../constants';
import {
  CreateFormSchemaType,
  UpdateFormSchemaType,
} from '../schemas/forms.schemas';
import { GetFormsArgs } from '../types/forms.types';
import { PERMISSIONS } from '../types/permissions.types';

let instance: FormsService | null = null;

export const getFormsService = () => {
  if (!instance) {
    instance = new FormsService();
  }

  return instance;
};

export class FormsService {
  public createForm = (userId: number, payload: CreateFormSchemaType) =>
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
    payload: CreateFormSchemaType & { teamId: number },
  ) =>
    prisma.$transaction(async (tx) => {
      const membersInTeam = await tx.team
        .findUnique({
          where: {
            id: payload.teamId,
          },
        })
        .members();
      const memberIds = membersInTeam?.map((member) => member.id);

      // grant all members in team access to the newly created form
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
              id: payload.teamId,
            },
          },
        },
      });

      return createdForm;
    });

  public createFormInMyFolder = (
    userId: number,
    payload: CreateFormSchemaType & { folderId: number },
  ) =>
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
        folder: {
          connect: {
            id: payload.folderId,
          },
        },
      },
    });

  public createFormInFolderOfTeam = (
    userId: number,
    payload: CreateFormSchemaType & { folderId: number; teamId: number },
  ) =>
    prisma.$transaction(async (tx) => {
      const membersInTeam = await tx.team
        .findUnique({
          where: {
            id: payload.teamId,
          },
        })
        .members();
      const memberIds = membersInTeam?.map((member) => member.id);

      // grant all members in team access to the newly created form
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
              id: payload.teamId,
            },
          },
          folder: {
            connect: {
              id: payload.folderId,
            },
          },
        },
      });

      return createdForm;
    });

  public getFormsByUserId = (userId: number, args: GetFormsArgs) =>
    prisma.form.findMany({
      skip: args.offset,
      take: args.limit,
      where: {
        creatorId: userId,
        folderId: args.folderId || undefined,
        teamId: args.teamId || null,
        title: {
          contains: args.searchText,
        },
        deletedAt: args.isDeleted ? { not: null } : null,
        favouritedByUsers: args.isFavourite
          ? { some: { id: userId } }
          : undefined,
      },
      orderBy: {
        [args.sortField]: args.sortDirection,
      },
      include: {
        favouritedByUsers: {
          select: {
            id: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  public getTotalFormsByUserId = (
    userId: number,
    args: Pick<
      GetFormsArgs,
      'isDeleted' | 'isFavourite' | 'folderId' | 'teamId' | 'searchText'
    >,
  ) =>
    prisma.form.count({
      where: {
        creatorId: userId,
        folderId: args.folderId || undefined,
        teamId: args.teamId || null,
        title: {
          contains: args.searchText,
        },
        deletedAt: args.isDeleted ? { not: null } : null,
        favouritedByUsers: args.isFavourite
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

  public updateForm = (formId: number, payload: UpdateFormSchemaType) =>
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

  public restoreForm = (formId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        deletedAt: null,
      },
    });

  public hardDeleteForm = (formId: number) =>
    prisma.$transaction(async (tx) => {
      await tx.response.deleteMany({
        where: {
          formId,
        },
      });

      await tx.form.delete({
        where: {
          id: formId,
        },
      });
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

  public removeFormPermissions = async (
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    formId: number,
    memberIds: number[],
  ) => {
    const form = await tx.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        permissions: true,
      },
    });
    const formPermissions = form?.permissions as Prisma.JsonObject;

    const newFormPermissions = _omit(formPermissions, memberIds);

    await tx.form.update({
      where: {
        id: formId,
      },
      data: {
        permissions: newFormPermissions,
      },
    });
  };

  public addToFolder = (formId: number, folderId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        folder: {
          connect: {
            id: folderId,
          },
        },
      },
    });

  public removeFromFolder = (formId: number) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        folder: {
          disconnect: true,
        },
      },
    });

  public moveToTeam = (formId: number, teamId: number) =>
    prisma.$transaction(async (tx) => {
      const membersInTeam = await tx.team
        .findUnique({
          where: {
            id: teamId,
          },
        })
        .members();
      const memberIds = membersInTeam?.map((member) => member.id);

      // grant all members in team access to the form
      let newFormPermissions = {};
      if (!memberIds) {
        throw Error(TEAM_ERROR_MESSAGES.NO_MEMBERS_IN_TEAM);
      }
      memberIds.map(
        (memberId) =>
          (newFormPermissions = {
            ...newFormPermissions,
            [memberId]: [
              PERMISSIONS.VIEW,
              PERMISSIONS.EDIT,
              PERMISSIONS.DELETE,
            ],
          }),
      );

      await tx.form.update({
        where: {
          id: formId,
        },
        data: {
          permissions: newFormPermissions,
          team: {
            connect: {
              id: teamId,
            },
          },
          folder: {
            disconnect: true,
          },
        },
      });
    });

  public moveBackToMyForms = (userId: number, formId: number, teamId: number) =>
    prisma.$transaction(async (tx) => {
      const membersInTeam = await tx.team
        .findUnique({
          where: {
            id: teamId,
          },
        })
        .members();
      const memberIds = membersInTeam?.map((member) => member.id);

      const form = await tx.form.findUnique({
        where: {
          id: formId,
        },
        select: {
          permissions: true,
        },
      });
      const formPermissions = form?.permissions as Prisma.JsonObject;

      const newFormPermissions = {
        ..._omit(formPermissions, memberIds!),
        [userId]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
      };

      // remove form from team and update permissions for form
      await tx.form.update({
        where: {
          id: formId,
        },
        data: {
          permissions: newFormPermissions,
          team: {
            disconnect: true,
          },
        },
      });
    });
}
