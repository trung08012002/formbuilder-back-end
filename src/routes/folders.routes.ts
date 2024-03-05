import { Router } from 'express';

import { ROUTES } from '../constants';
import {
  FoldersController,
  getFoldersController,
} from '../controllers/folders.controller';
import {
  validateCreateFolderSchema,
  validateUpdateFolderSchema,
  verifyToken,
} from '../middlewares';

const foldersRoute = Router();

const foldersController: FoldersController = getFoldersController();

foldersRoute.get(
  ROUTES.FOLDER.GET_FOLDER_DETAILS,
  verifyToken,
  foldersController.getFolderDetails,
);
foldersRoute.get(
  ROUTES.ROOT.PATH,
  verifyToken,
  foldersController.getAllFoldersOfUser,
);
foldersRoute.post(
  ROUTES.ROOT.PATH,
  verifyToken,
  validateCreateFolderSchema,
  foldersController.createFolder,
);
foldersRoute.patch(
  ROUTES.FOLDER.UPDATE_FOLDER,
  verifyToken,
  validateUpdateFolderSchema,
  foldersController.updateFolder,
);

foldersRoute.delete(
  ROUTES.FOLDER.DELETE_FOLDER,
  verifyToken,
  foldersController.deleteFolder,
);

export default foldersRoute;
