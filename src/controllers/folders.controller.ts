import { Folder, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import {
  ERROR_MESSAGES,
  FOLDER_SUCCESS_MESSAGES,
  SUCCESS_MESSAGES,
} from '../constants';
import {
  CreateFolderSchemaType,
  UpdateFolderSchemaType,
} from '../schemas/folders.schemas';
import { FoldersService, getFoldersService } from '../services/folders.service';
import { CustomRequest } from '../types/customRequest.types';
import {
  canDelete,
  canEdit,
  canView,
  errorResponse,
  successResponse,
} from '../utils';

let instance: FoldersController | null = null;

export const getFoldersController = () => {
  if (!instance) {
    instance = new FoldersController();
  }
  return instance;
};

export class FoldersController {
  private foldersService: FoldersService;

  public constructor() {
    this.foldersService = getFoldersService();
  }

  public createFolder = async (
    req: CustomRequest<CreateFolderSchemaType>,
    res: Response,
  ) => {
    try {
      const { name } = req.body;
      const userId = req.session.userId;

      const newFolder = await this.foldersService.createFolder(userId, name);
      return successResponse(
        res,
        newFolder,
        FOLDER_SUCCESS_MESSAGES.CREATE_FOLDER_SUCCESS,
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

  public getAllFoldersOfUser = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      const folders = await this.foldersService.getAllFoldersOfUser(userId);

      return successResponse(res, folders, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public getFolderDetails = async (
    req: CustomRequest<{ folder: Folder }>,
    res: Response,
  ) => {
    try {
      const userId = req.session.userId;

      const folder = req.body.folder;

      if (!canView(userId, folder.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      return successResponse(res, folder, SUCCESS_MESSAGES.DEFAULT);
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public updateFolder = async (
    req: CustomRequest<UpdateFolderSchemaType & { folder: Folder }>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const folderId = Number(id);
      const userId = req.session.userId;

      const folder = req.body.folder;

      if (!canEdit(userId, folder.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      const { name } = req.body;

      const updatedFolder = await this.foldersService.updateFolder(
        folderId,
        name,
      );
      return successResponse(
        res,
        updatedFolder,
        FOLDER_SUCCESS_MESSAGES.UPDATE_FOLDER_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public deleteFolder = async (
    req: CustomRequest<{ folder: Folder }>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const folderId = Number(id);
      const userId = req.session.userId;

      const folder = req.body.folder;

      if (!canDelete(userId, folder.permissions as Prisma.JsonObject)) {
        return errorResponse(
          res,
          ERROR_MESSAGES.ACCESS_DENIED,
          status.FORBIDDEN,
        );
      }

      await this.foldersService.deleteFolder(folderId);
      return successResponse(
        res,
        {},
        FOLDER_SUCCESS_MESSAGES.DELETE_FOLDER_SUCCESS,
      );
    } catch (error) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
