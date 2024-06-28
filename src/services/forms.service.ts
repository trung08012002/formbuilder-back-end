import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import _omit from 'lodash.omit';

import prisma from '../configs/db.config';
import { TEAM_ERROR_MESSAGES } from '../constants';
import {
  CreateFormSchemaType,
  UpdateFormSchemaType,
} from '../schemas/forms.schemas';
import { ELEMENT_TYPE, GetFormsArgs } from '../types/forms.types';
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
        permissions: {
          path: [userId.toString()],
          array_contains: [
            PERMISSIONS.VIEW,
            PERMISSIONS.EDIT,
            PERMISSIONS.DELETE,
          ],
        },
        folderId: args.folderId || undefined,
        teamId: args.teamId || null,
        OR: [
          {
            title: {
              contains: args.searchText,
            },
          },
          {
            title: {
              contains:
                args.searchText.charAt(0).toUpperCase() +
                args.searchText.slice(1).toLowerCase(),
            },
          },
          {
            title: {
              contains: args.searchText.toUpperCase(),
            },
          },
          {
            title: {
              contains: args.searchText.toLowerCase(),
            },
          },
        ],
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
        permissions: {
          path: [userId.toString()],
          array_contains: [
            PERMISSIONS.VIEW,
            PERMISSIONS.EDIT,
            PERMISSIONS.DELETE,
          ],
        },
        folderId: args.folderId || undefined,
        teamId: args.teamId || null,
        OR: [
          {
            title: {
              contains: args.searchText,
            },
          },
          {
            title: {
              contains:
                args.searchText.charAt(0).toUpperCase() +
                args.searchText.slice(1).toLowerCase(),
            },
          },
          {
            title: {
              contains: args.searchText.toUpperCase(),
            },
          },
          {
            title: {
              contains: args.searchText.toLowerCase(),
            },
          },
        ],
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

  public updateDisabledStatus = (formId: number, disabled: boolean) =>
    prisma.form.update({
      where: {
        id: formId,
      },
      data: {
        disabled: disabled,
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

      await tx.form.update({
        where: {
          id: formId,
        },
        data: {
          permissions: newFormPermissions,
          team: {
            disconnect: true,
          },
          folder: {
            disconnect: true,
          },
        },
      });
    });
  public importGoogleForms = async (formUrl: string) => {
    const ggFormId = formUrl.split('/')[formUrl.split('/').length - 2];
    console.log('sss', ggFormId);
    const auth = new GoogleAuth({
      keyFile: './src/google_form_api_key.json',
      scopes: [
        'https://www.googleapis.com/auth/forms.body.readonly',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/forms.currentonly',
      ],
    });
    console.log('auth', auth);
    const forms = google.forms({ version: 'v1', auth: auth });
    console.log('forms', forms);
    const ggFormRes = await forms.forms.get({
      formId: ggFormId,
    });
    console.log('ggFormRes', ggFormRes);
    const ggForm = ggFormRes.data;

    const elements = ggForm.items
      ?.map((item) => {
        const { title: questionTitle, questionItem } = item;

        if (
          questionItem?.question?.textQuestion &&
          !questionItem?.question?.textQuestion?.paragraph
        ) {
          return {
            type: ELEMENT_TYPE.SHORT_TEXT,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
            },
          };
        }
        if (
          questionItem?.question?.textQuestion &&
          questionItem?.question?.textQuestion?.paragraph
        ) {
          return {
            type: ELEMENT_TYPE.LONG_TEXT,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
            },
          };
        }
        if (questionItem?.question?.choiceQuestion?.type === 'RADIO') {
          return {
            type: ELEMENT_TYPE.SINGLE_CHOICE,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
              options: questionItem.question.choiceQuestion.options?.map(
                (option) => option.value,
              ),
            },
          };
        }
        if (questionItem?.question?.choiceQuestion?.type === 'CHECKBOX') {
          return {
            type: ELEMENT_TYPE.MULTIPLE_CHOICE,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
              options: questionItem.question.choiceQuestion.options?.map(
                (option) => option.value,
              ),
            },
          };
        }
        if (questionItem?.question?.choiceQuestion?.type === 'DROP_DOWN') {
          return {
            type: ELEMENT_TYPE.DROPDOWN,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
              options: questionItem.question.choiceQuestion.options?.map(
                (option) => option.value,
              ),
            },
          };
        }
        if (questionItem?.question?.scaleQuestion) {
          return {
            type: ELEMENT_TYPE.SCALE_RATING,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
              lowestRatingText: questionItem.question.scaleQuestion.lowLabel,
              highestRatingText: questionItem.question.scaleQuestion.highLabel,
              lowestRatingValue: questionItem.question.scaleQuestion.low || 0,
              highestRatingValue: questionItem.question.scaleQuestion.high,
            },
          };
        }
        if (questionItem?.question?.dateQuestion) {
          return {
            type: ELEMENT_TYPE.DATEPICKER,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
            },
          };
        }
        if (questionItem?.question?.timeQuestion) {
          return {
            type: ELEMENT_TYPE.TIME,
            config: {
              fieldLabel: questionTitle || '',
              required: questionItem.question.required || false,
            },
          };
        }

        return undefined;
      })
      .filter((value) => value !== undefined);

    const mappedForm = {
      title: ggForm.info?.documentTitle || '',
      settings: {},
      elements,
    };
    return mappedForm;
  };
}
