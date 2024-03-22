import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { ERROR_MESSAGES, FOLDER_ERROR_MESSAGES } from '../constants';
import { FoldersService, getFoldersService } from '../services/folders.service';
import { errorResponse } from '../utils';

const foldersService: FoldersService = getFoldersService();

export const checkFolderExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { folderId } = req.params;

    const existingFolder = await foldersService.getFolderById(Number(folderId));
    if (!existingFolder) {
      return errorResponse(
        res,
        FOLDER_ERROR_MESSAGES.FOLDER_NOT_FOUND,
        status.NOT_FOUND,
      );
    }
    req.body.folder = existingFolder;
    next();
  } catch (error) {
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
