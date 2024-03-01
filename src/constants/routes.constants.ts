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
};
