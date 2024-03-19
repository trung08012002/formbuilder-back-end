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
    MY_PROFILE: '/my-profile',
    DELETE_USER: '/:id',
    CHANGE_PASSWORD: '/change-password',
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
  TEAM: {
    PATH: '/teams',
    GET_TEAM_DETAILS: '/:id',
    UPDATE_TEAM: '/:id',
    DELETE_TEAM: '/:id',
    ADD_MEMBER: '/:id/add-member',
    REMOVE_MEMBER: '/:id/remove-member',
  },
  RESPONSE: {
    PATH: '/responses',
    GET_RESPONSES_BY_FORMID: '/:formId',
    CREATE_RESPONSE: '/:formId',
    DELETE_RESPONSE: '/:formId/:id',
  },
};
