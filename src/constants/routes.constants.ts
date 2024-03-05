export const ROUTES = {
  ROOT: {
    PATH: '/',
  },
  API_DOCS: {
    PATH: '/api-docs',
  },
  AUTH: {
    PATH: '/auth',
    SIGN_UP: '/signup',
    LOGIN: '/login',
  },
  USER: {
    PATH: '/users',
    GET_USER_DETAILS: '/:id',
    UPDATE_USER: '/:id',
    DELETE_USER: '/:id',
    CHANGE_PASSWORD: '/:id/change-password',
  },
  IMAGE: {
    PATH: '/images',
    UPLOAD: '/upload',
  },
  FORM: {
    PATH: '/forms',
    GET_FORM_DETAILS: '/:id',
    UPDATE_FORM: '/:id',
    DELETE_FORM: '/:id',
    FAVOURITES: '/:id/favourites',
  },
  FOLDER: {
    PATH: '/folders',
    GET_FOLDER_DETAILS: '/:id',
    UPDATE_FOLDER: '/:id',
    DELETE_FOLDER: '/:id',
  },
};
