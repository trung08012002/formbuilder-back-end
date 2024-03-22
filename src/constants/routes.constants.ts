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
    DELETE_USER: '/:userId',
    CHANGE_PASSWORD: '/change-password',
  },
  IMAGE: {
    PATH: '/images',
    UPLOAD: '/upload',
  },
  FORM: {
    PATH: '/forms',
    GET_FORM_DETAILS: '/:formId',
    UPDATE_FORM: '/:formId',
    DELETE_FORM: '/:formId',
    RESTORE_FORM: '/:formId/restore',
    FAVOURITES: '/:formId/favourites',
    CREATE_FORM_IN_TEAM: '/team/:teamId',
    CREATE_FORM_IN_MY_FOLDER: '/folder/:folderId',
    CREATE_FORM_IN_FOLDER_OF_TEAM: '/folder/:folderId/team/:teamId',
  },
  FOLDER: {
    PATH: '/folders',
    GET_FOLDER_DETAILS: '/:folderId',
    UPDATE_FOLDER: '/:folderId',
    DELETE_FOLDER: '/:folderId',
    CREATE_FOLDER_IN_TEAM: '/team/:teamId',
  },
  TEAM: {
    PATH: '/teams',
    GET_TEAM_DETAILS: '/:teamId',
    UPDATE_TEAM: '/:teamId',
    DELETE_TEAM: '/:teamId',
    ADD_MEMBER: '/:teamId/add-member',
    REMOVE_MEMBER: '/:teamId/remove-member',
  },
  RESPONSE: {
    PATH: '/responses',
    GET_RESPONSES_BY_FORMID: '/:formId',
    CREATE_RESPONSE: '/:formId',
    DELETE_RESPONSE: '/:responseId/form/:formId',
  },
};
