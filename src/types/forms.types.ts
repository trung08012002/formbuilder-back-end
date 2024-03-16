export interface GetFormsParams {
  offset: number;
  limit: number;
  searchText: string;
  isDeleted: boolean;
  isFavourite: boolean;
  sortField: string;
  sortDirection: string;
}

export enum ELEMENT_TYPE {
  HEADING = 'heading',
  FULLNAME = 'fullname',
  EMAIL = 'email',
  ADDRESS = 'address',
  PHONE = 'phone',
  DATEPICKER = 'datepicker',
  APPOINTMENT = 'appointment',
  SHORT_TEXT = 'shortText',
  LONG_TEXT = 'longText',
  DROPDOWN = 'dropdown',
  SINGLE_CHOICE = 'singleChoice',
  MULTIPLE_CHOICE = 'multipleChoice',
  NUMBER = 'number',
  IMAGE = 'image',
  FILE_UPLOAD = 'fileUpload',
  TIME = 'time',
  SUBMIT = 'submit',
  INPUT_TABLE = 'inputTable',
  STAR_RATING = 'starRating',
  SCALE_RATING = 'scaleRating',
  DIVIDER = 'divider',
  PAGE_BREAK = 'pageBreak',
}
