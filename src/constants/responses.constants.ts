export const DEFAULT_TOTAL_RESPONSES = 0;

export const DEFAULT_SEARCH_TEXT = '';

export const DEFAULT_SORT_FIELD = 'createdAt';

export const RESPONSES_SUCCESS_MESSAGES = {
  RESPONSE_CREATED: 'Response created successfully',
  RESPONSE_UPDATED: 'Response updated successfully',
  RESPONSE_DELETED: 'Response deleted successfully',
  RESPONSE_GET_SUCCESS: 'Response get successfully',
} as const;

export const RESPONSES_ERROR_MESSAGES = {
  INVALID_FIELD_FILTER: 'Invalid field filter',
  INVALID_SORT_DIRECTION: 'Invalid sort direction',
  RESPONSE_NOT_FOUND: 'Response does not exist',
  ID_PARAMS_NOT_FOUND: 'Id parameters not found',
} as const;
