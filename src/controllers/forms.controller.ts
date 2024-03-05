import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import {
  ALLOWED_SORT_FORM_DIRECTIONS,
  ALLOWED_SORT_FORM_FIELDS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ERROR_MESSAGES,
  FORM_ERROR_MESSAGES,
  FORM_SUCCESS_MESSAGES,
  SORT_FORM_DIRECTIONS,
  SORT_FORM_FIELDS,
  SUCCESS_MESSAGES,
  USER_ERROR_MESSAGES,
} from '../constants';
import { FormsService, getFormsService } from '../services/forms.service';
import { getUsersService, UsersService } from '../services/users.service';
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

  public constructor() {
    this.formsService = getFormsService();
    this.usersService = getUsersService();
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

  public getFormDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      const form = await this.formsService.getFormById(formId);
      if (!form) {
        return errorResponse(
          res,
          FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
          status.NOT_FOUND,
        );
      }

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

  public createForm = async (req: Request, res: Response) => {
    try {
      const { title, logoUrl, settings, elements } = req.body;
      const userId = req.session.userId;

      const existingUser = await this.usersService.getUserByID(userId);
      if (!existingUser) {
        return errorResponse(
          res,
          USER_ERROR_MESSAGES.USER_NOT_FOUND,
          status.NOT_FOUND,
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

  public updateForm = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      const existingForm = await this.formsService.getFormById(formId);
      if (!existingForm) {
        return errorResponse(
          res,
          FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
          status.NOT_FOUND,
        );
      }

      if (!canEdit(userId, existingForm.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const { title, logoUrl, settings, elements } = req.body;

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

  public deleteForm = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const formId = Number(id);
      const userId = req.session.userId;

      const existingForm = await this.formsService.getFormById(formId);
      if (!existingForm) {
        return errorResponse(
          res,
          FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
          status.NOT_FOUND,
        );
      }

      if (!canDelete(userId, existingForm.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      if (existingForm.deletedAt === null) {
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

      const existingForm = await this.formsService.getFormById(formId);
      if (!existingForm) {
        return errorResponse(
          res,
          FORM_ERROR_MESSAGES.FORM_NOT_FOUND,
          status.NOT_FOUND,
        );
      }

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
