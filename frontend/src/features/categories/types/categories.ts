export interface CategoryItem {
  id: string;
  name: string;
}

export interface GetCategoriesResponse {
  data: CategoryItem[];
  totalCount: number;
}

export interface AddCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  id: string;
  name: string;
}
