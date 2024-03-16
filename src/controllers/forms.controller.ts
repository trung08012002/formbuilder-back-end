import { Form, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import {
  ALLOWED_SORT_FORM_DIRECTIONS,
  ALLOWED_SORT_FORM_FIELDS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
  SORT_FORM_DIRECTIONS,
  SORT_FORM_FIELDS,
  SUCCESS_MESSAGES,
  TEAM_ERROR_MESSAGES,
} from '../constants';
import {
  CreateFormSchemaType,
  UpdateFormSchemaType,
} from '../schemas/forms.schemas';
import { FormsService, getFormsService } from '../services/forms.service';
import { getTeamsService, TeamsService } from '../services/teams.service';
import { getUsersService, UsersService } from '../services/users.service';
import { CustomRequest } from '../types/customRequest.types';
import {
  canDelete,
  canEdit,
  canView,
  errorResponse,
  successResponse,
} from '../utils';

let instance: FormsController | null = null;

export const getFormsController = () => {
  if (!instance) {
    instance = new FormsController();
  }

  return instance;
};

export class FormsController {
  private formsService: FormsService;
  private usersService: UsersService;
  private teamsService: TeamsService;

  public constructor() {
    this.formsService = getFormsService();
    this.usersService = getUsersService();
    this.teamsService = getTeamsService();
  }

  public getAllMyForms = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const page = Number(req.query.page) || DEFAULT_PAGE;
      const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
      const searchText = req.query.search?.toString() || '';
      const isDeleted = Number(req.query.isDeleted) === 1 ? true : false;
      const isFavourite = Number(req.query.isFavourite) === 1 ? true : false;
      const sortField =
        req.query.sortField?.toString() || SORT_FORM_FIELDS.CREATED_AT;
      const sortDirection =
        req.query.sortDirection?.toString() || SORT_FORM_DIRECTIONS.DESC;

      if (!ALLOWED_SORT_FORM_FIELDS.includes(sortField)) {
        return errorResponse(res, ERROR_MESSAGES.INVALID_SORT_FIELD);
      }

      if (!ALLOWED_SORT_FORM_DIRECTIONS.includes(sortDirection)) {
        return errorResponse(res, ERROR_MESSAGES.INVALID_SORT_DIRECTION);
      }

      const totalForms = await this.formsService.getTotalFormsByUserId(userId, {
        isDeleted,
        isFavourite,
      });
      const totalPages = Math.ceil(totalForms / pageSize);

      const offset = searchText ? 0 : (page - 1) * pageSize;
      const limit = searchText ? totalForms : pageSize;

      const forms = await this.formsService.getFormsByUserId(userId, {
        offset,
        limit,
        searchText,
        isDeleted,
        isFavourite,
        sortField,
        sortDirection,
      });

      const formsWithFavouriteStatus = await Promise.all(
        forms.map(async (form) => {
          const favouritedByUsersOfForm =
            await this.formsService.getFavouritedByUsersOfForm(form.id);
          const isFavourite =
            favouritedByUsersOfForm?.findIndex((user) => user.id === userId) !==
            -1;
          return {
            ...form,
            isFavourite,
          };
        }),
      );

      const responseData = {
        forms: formsWithFavouriteStatus,
        page,
        pageSize,
        totalForms,
        totalPages,
      };
      return successResponse(res, responseData, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public getFormDetails = async (
    req: CustomRequest<{ form: Form }>,
    res: Response,
  ) => {
    try {
      const userId = req.session.userId;

      const form = req.body.form;

      if (!canView(userId, form.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      return successResponse(res, form, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public createForm = async (
    req: CustomRequest<CreateFormSchemaType>,
    res: Response,
  ) => {
    try {
      const { title, logoUrl, settings, elements, teamId } = req.body;
      const userId = req.session.userId;

      if (teamId) {
        const memberExistsInTeam =
          await this.teamsService.checkMemberExistsInTeam(teamId, userId);
        if (!memberExistsInTeam) {
          return errorResponse(res, TEAM_ERROR_MESSAGES.USER_NOT_IN_TEAM);
        }

        const newForm = await this.formsService.createFormInTeam(
          userId,
          teamId,
          { title, logoUrl, settings, elements },
        );
        return successResponse(
          res,
          newForm,
          FORM_SUCCESS_MESSAGES.CREATE_FORM_SUCCESS,
          status.CREATED,
        );
      }

      const newForm = await this.formsService.createForm(userId, {
        title,
        logoUrl,
        settings,
        elements,
      });
      return successResponse(
        res,
        newForm,
        FORM_SUCCESS_MESSAGES.CREATE_FORM_SUCCESS,
        status.CREATED,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public updateForm = async (
    req: CustomRequest<UpdateFormSchemaType & { form: Form }>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      if (!canEdit(userId, req.body.form.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const { title, logoUrl, settings, elements } =
        req.body as UpdateFormSchemaType;

      const updatedForm = await this.formsService.updateForm(formId, {
        title,
        logoUrl,
        settings,
        elements,
      });
      return successResponse(
        res,
        updatedForm,
        FORM_SUCCESS_MESSAGES.UPDATE_FORM_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public deleteForm = async (
    req: CustomRequest<{ form: Form }>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      const form = req.body.form;

      if (!canDelete(userId, form.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      if (form.deletedAt === null) {
        const deletedForm = await this.formsService.softDeleteForm(formId);
        return successResponse(
          res,
          deletedForm,
          FORM_SUCCESS_MESSAGES.SOFT_DELETE_SUCCESS,
        );
      } else {
        await this.formsService.hardDeleteForm(formId);
        return successResponse(
          res,
          {},
          FORM_SUCCESS_MESSAGES.HARD_DELETE_SUCCESS,
        );
      }
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public addToFavourites = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      const favouriteFormsOfUser =
        await this.usersService.getFavouriteFormsOfUser(userId);

      if (
        favouriteFormsOfUser?.findIndex((form) => form.id === formId) !== -1
      ) {
        const responseData = await this.formsService.removeFromFavourites(
          formId,
          userId,
        );
        return successResponse(
          res,
          responseData,
          FORM_SUCCESS_MESSAGES.REMOVE_FROM_FAVOURITES_SUCCESS,
        );
      } else {
        const responseData = await this.formsService.addToFavourites(
          formId,
          userId,
        );
        return successResponse(
          res,
          responseData,
          FORM_SUCCESS_MESSAGES.ADD_TO_FAVOURITES_SUCCESS,
        );
      }
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
