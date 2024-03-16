import { Router } from 'express';

import { ROUTES } from '../constants';
import {
  FoldersController,
  getFoldersController,
} from '../controllers/folders.controller';
import {
  checkUserExistence,
  validateCreateFolderSchema,
  validateUpdateFolderSchema,
  verifyToken,
} from '../middlewares';
import { checkFolderExistence } from '../middlewares/folders.middlewares';

const foldersRoute = Router();

const foldersController: FoldersController = getFoldersController();

foldersRoute.get(
  ROUTES.FOLDER.GET_FOLDER_DETAILS,
  verifyToken,
  checkFolderExistence,
  foldersController.getFolderDetails,
);
foldersRoute.get(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  foldersController.getAllFoldersOfUser,
);
foldersRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  checkUserExistence,
  validateCreateFolderSchema,
  foldersController.createFolder,
);
foldersRoute.patch(
  ROUTES.FOLDER.UPDATE_FOLDER,
  verifyToken,
  checkFolderExistence,
  validateUpdateFolderSchema,
  foldersController.updateFolder,
);
foldersRoute.delete(
  ROUTES.FOLDER.DELETE_FOLDER,
  verifyToken,
  checkFolderExistence,
  foldersController.deleteFolder,
);

export default foldersRoute;
