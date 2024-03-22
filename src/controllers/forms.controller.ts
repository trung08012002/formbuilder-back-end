import { Folder, Form, Prisma, Team } from '@prisma/client';
import { Response } from 'express';
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
  GetFormsQueryParamsSchemaType,
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

  public getAllForms = async (
    req: CustomRequest<unknown, GetFormsQueryParamsSchemaType>,
    res: Response,
  ) => {
    try {
      const userId = req.session.userId;

      const {
        page = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        search: searchText = '',
        isDeleted: isDeletedParam,
        isFavourite: isFavouriteParam,
        sortField = SORT_FORM_FIELDS.CREATED_AT,
        sortDirection = SORT_FORM_DIRECTIONS.DESC,
        folderId,
        teamId,
      } = req.query;

      const isDeleted = isDeletedParam === 1;
      const isFavourite = isFavouriteParam === 1;

      if (!ALLOWED_SORT_FORM_FIELDS.includes(sortField)) {
        return errorResponse(res, ERROR_MESSAGES.INVALID_SORT_FIELD);
      }

      if (!ALLOWED_SORT_FORM_DIRECTIONS.includes(sortDirection)) {
        return errorResponse(res, ERROR_MESSAGES.INVALID_SORT_DIRECTION);
      }

      const totalForms = await this.formsService.getTotalFormsByUserId(userId, {
        isDeleted,
        isFavourite,
        folderId,
        teamId,
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
        folderId,
        teamId,
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

      const { form } = req.body;

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
      const { title, logoUrl, settings, elements } = req.body;
      const userId = req.session.userId;

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

  public createFormInTeam = async (
    req: CustomRequest<CreateFormSchemaType & { team: Team }>,
    res: Response,
  ) => {
    try {
      const { title, logoUrl, settings, elements, team } = req.body;
      const userId = req.session.userId;

      const newForm = await this.formsService.createFormInTeam(userId, {
        title,
        logoUrl,
        settings,
        elements,
        teamId: team.id,
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

  public createFormInMyFolder = async (
    req: CustomRequest<CreateFormSchemaType & { folder: Folder }>,
    res: Response,
  ) => {
    try {
      const { title, logoUrl, settings, elements, folder } = req.body;
      const userId = req.session.userId;

      if (!canEdit(userId, folder.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const newForm = await this.formsService.createFormInMyFolder(userId, {
        title,
        logoUrl,
        settings,
        elements,
        folderId: folder.id,
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

  public createFormInFolderOfTeam = async (
    req: CustomRequest<CreateFormSchemaType & { folder: Folder; team: Team }>,
    res: Response,
  ) => {
    try {
      const { title, logoUrl, settings, elements, folder, team } = req.body;
      const userId = req.session.userId;

      const folderExistsInTeam =
        await this.teamsService.checkFolderExistsInTeam(team.id, folder.id);
      if (!folderExistsInTeam) {
        return errorResponse(res, TEAM_ERROR_MESSAGES.FOLDER_NOT_IN_TEAM);
      }

      if (!canEdit(userId, folder.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const newForm = await this.formsService.createFormInFolderOfTeam(userId, {
        title,
        logoUrl,
        settings,
        elements,
        folderId: folder.id,
        teamId: team.id,
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
      const userId = req.session.userId;
      const { title, logoUrl, settings, elements, form } = req.body;

      if (!canEdit(userId, form.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const updatedForm = await this.formsService.updateForm(form.id, {
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
      const userId = req.session.userId;
      const { form } = req.body;

      if (!canDelete(userId, form.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      if (form.deletedAt === null) {
        const deletedForm = await this.formsService.softDeleteForm(form.id);
        return successResponse(
          res,
          deletedForm,
          FORM_SUCCESS_MESSAGES.SOFT_DELETE_SUCCESS,
        );
      } else {
        await this.formsService.hardDeleteForm(form.id);
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

  public restoreForm = async (
    req: CustomRequest<{ form: Form }>,
    res: Response,
  ) => {
    try {
      const { form } = req.body;

      const restoredForm = await this.formsService.restoreForm(form.id);

      return successResponse(
        res,
        restoredForm,
        FORM_SUCCESS_MESSAGES.RESTORE_FORM_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public addToFavourites = async (
    req: CustomRequest<{ form: Form }>,
    res: Response,
  ) => {
    try {
      const userId = req.session.userId;
      const { form } = req.body;

      const favouriteFormsOfUser =
        await this.usersService.getFavouriteFormsOfUser(userId);

      if (favouriteFormsOfUser?.findIndex(({ id }) => id === form.id) !== -1) {
        const responseData = await this.formsService.removeFromFavourites(
          form.id,
          userId,
        );
        return successResponse(
          res,
          responseData,
          FORM_SUCCESS_MESSAGES.REMOVE_FROM_FAVOURITES_SUCCESS,
        );
      } else {
        const responseData = await this.formsService.addToFavourites(
          form.id,
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
