import {
  CreateFormSchemaType,
  GetFormsQueryParamsSchemaType,
  UpdateFormSchemaType,
} from './forms.schemas';

export type CreateTemplateSchemaType = CreateFormSchemaType & {
  categoryId: number;
  description: string;
  imagePreviewUrl: string;
};

export type UpdateTemplateSchemaType = UpdateFormSchemaType & {
  categoryId?: number;
  description?: string;
  disabled?: boolean;
  isDelete?: boolean;
  imagePreviewUrl?: string;
};

export type GetTemplatesQueryParamsSchemaType = Pick<
  GetFormsQueryParamsSchemaType,
  'page' | 'pageSize' | 'search' | 'isDeleted' | 'sortField' | 'sortDirection'
> & {
  categoryId?: number;
};
