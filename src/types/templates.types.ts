export interface GetTemplateArgs {
  offset: number;
  limit: number;
  searchText: string;
  isDeleted: boolean;
  sortField: string;
  sortDirection: string;
  categoryId: number;
}
