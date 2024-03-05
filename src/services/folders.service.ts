import prisma from '../configs/db.config';
import { PERMISSIONS } from '../types/permissions.types';

let instance: FoldersService | null = null;

export const getFoldersService = () => {
  if (!instance) {
    instance = new FoldersService();
  }
  return instance;
};

export class FoldersService {
  public createFolder = (userId: number, name: string) =>
    prisma.folder.create({
      data: {
        name,
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

  public getAllFoldersOfUser = (userId: number) =>
    prisma.folder.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        forms: true,
      },
    });

  public getTotalFoldersByUserId = (userId: number) =>
    prisma.folder.count({
      where: {
        creatorId: userId,
      },
    });

  public getFolderById = (folderId: number) =>
    prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        forms: true,
      },
    });

  public updateFolder = async (folderId: number, name: string) =>
    prisma.folder.update({
      where: { id: folderId },
      data: {
        name,
      },
    });

  public deleteFolder = async (folderId: number) =>
    prisma.$transaction(async (tx) => {
      // Find all forms belong to the folder to be deleted
      const formsInFolder = await tx.form.findMany({
        where: {
          folderId: folderId,
        },
        select: {
          id: true,
        },
      });

      // Delete each form sequentially
      const deleteFormPromises = formsInFolder.map((form) =>
        tx.form.delete({
          where: {
            id: form.id,
          },
        }),
      );

      // Wait for all forms to be deleted before delete the folder
      await Promise.all(deleteFormPromises);

      // After delete all forms, delete the folder
      await tx.folder.delete({
        where: {
          id: folderId,
        },
      });
    });
}
