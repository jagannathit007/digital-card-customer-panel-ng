export interface PaginationModel {
  docs: any[];
  totalDocs: string;
  limit: string;
  totalPages: string;
  page: string;
  pagingCounter: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: any;
  nextPage: any;
}
