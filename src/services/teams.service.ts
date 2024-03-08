import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import _omit from 'lodash.omit';

import prisma from '../configs/db.config';
import { PERMISSIONS } from '../types/permissions.types';

let instance: TeamsService | null = null;

export const getTeamsService = () => {
  if (!instance) {
    instance = new TeamsService();
  }

  return instance;
};

export class TeamsService {
  public getTeamsByUserId = (userId: number) =>
    prisma.team.findMany({
      where: {
        members: { some: { id: userId } },
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
    });

  public createTeam = (
    name: string,
    logoUrl: string | undefined,
    userId: number,
  ) =>
    prisma.team.create({
      data: {
        name,
        logoUrl,
        permissions: {
          [userId]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
        },
        creator: {
          connect: {
            id: userId,
          },
        },
        members: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

  public getTeamById = (teamId: number) =>
    prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
    });

  public updateTeam = (
    teamId: number,
    name: string | undefined,
    logoUrl: string | undefined,
  ) =>
    prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
        logoUrl,
      },
    });

  public deleteTeam = (teamId: number) =>
    prisma.$transaction(async (tx) => {
      // TODO: add folders/responses deletion later
      await tx.form.deleteMany({
        where: {
          teamId,
        },
      });

      await tx.team.delete({
        where: {
          id: teamId,
        },
      });
    });

  public checkMemberExistsInTeam = async (teamId: number, memberId: number) => {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
        members: {
          some: {
            id: memberId,
          },
        },
      },
    });
    return team !== null;
  };

  public addTeamMember = (teamId: number, memberId: number) =>
    prisma.$transaction(async (tx) => {
      // get current permissions in team
      const team = await tx.team.findUnique({
        where: {
          id: teamId,
        },
        select: {
          permissions: true,
        },
      });
      const teamPermissions = team?.permissions as Prisma.JsonObject;

      // add member to team and update permissions for team
      await tx.team.update({
        where: {
          id: teamId,
        },
        data: {
          members: {
            connect: {
              id: memberId,
            },
          },
          permissions: {
            ...teamPermissions,
            [memberId]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
          },
        },
      });

      // get all forms in team
      const formsInTeam = await tx.form.findMany({
        where: {
          teamId,
        },
      });

      // update permissions for all forms
      await Promise.all(
        formsInTeam.map(async (item) => {
          const form = await tx.form.findUnique({
            where: {
              id: item.id,
            },
            select: {
              permissions: true,
            },
          });
          const formPermissions = form?.permissions as Prisma.JsonObject;
          await tx.form.update({
            where: {
              id: item.id,
            },
            data: {
              permissions: {
                ...formPermissions,
                [memberId]: [
                  PERMISSIONS.VIEW,
                  PERMISSIONS.EDIT,
                  PERMISSIONS.DELETE,
                ],
              },
            },
          });
        }),
      );
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

  public removeTeamMember = (teamId: number, memberIds: number[]) =>
    prisma.$transaction(async (tx) => {
      const team = await tx.team.findUnique({
        where: {
          id: teamId,
        },
        select: {
          permissions: true,
        },
      });
      const teamPermissions = team?.permissions as Prisma.JsonObject;

      const newTeamPermissions = _omit(teamPermissions, memberIds);

      // remove members from team and update permissions for team
      await tx.team.update({
        where: {
          id: teamId,
        },
        data: {
          members: {
            disconnect: memberIds.map((memberId) => ({
              id: memberId,
            })),
          },
          permissions: newTeamPermissions,
        },
      });

      // get all forms in team
      const formsInTeam = await tx.form.findMany({
        where: {
          teamId,
        },
      });

      // update permissions for all forms
      await Promise.all(
        formsInTeam.map((form) =>
          this.removeFormPermissions(tx, form.id, memberIds),
        ),
      );
    });
}
