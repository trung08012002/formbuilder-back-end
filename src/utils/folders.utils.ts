import { FOLDER_ERROR_MESSAGES } from '../constants';
import { FoldersService, getFoldersService } from '../services/folders.service';

const foldersService: FoldersService = getFoldersService();

export const findFolderById = async (folderId: number) => {
  const existingFolder = await foldersService.getFolderById(folderId);
  if (!existingFolder) {
    throw new Error(FOLDER_ERROR_MESSAGES.FOLDER_NOT_FOUND);
  }
  return existingFolder;
};
