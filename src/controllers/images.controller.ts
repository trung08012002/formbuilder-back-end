import { Request, Response } from 'express';
import status from 'http-status';

import cloudinary from '../configs/cloudinary.config';
import { IMAGE_ERROR_MESSAGES, IMAGE_SUCCESS_MESSAGES } from '../constants';
import { errorResponse, successResponse } from '../utils';

class ImageController {
  public uploadImage = async (req: Request, res: Response) => {
    try {
      if (Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          cloudinary.uploader.upload(file.path),
        );

        const uploadResults = await Promise.all(uploadPromises);

        const fileUrls = uploadResults.map((result) => result.url);

        return successResponse(
          res,
          { urls: fileUrls },
          IMAGE_SUCCESS_MESSAGES.UPLOAD_FILE_SUCCESS,
        );
      } else {
        return errorResponse(
          res,
          IMAGE_ERROR_MESSAGES.NO_FILE_UPLOADED,
          status.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      return errorResponse(res);
    }
  };
}

let instance: ImageController | null = null;

const getInstance = () => {
  if (!instance) {
    instance = new ImageController();
  }
  return instance;
};

const imageController = getInstance();

export { imageController };
