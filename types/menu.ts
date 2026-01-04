// Menu Types

export enum MenuType {
  ROUTE = 'route',
  GROUP = 'group',
  LINK = 'link'
}

export enum BasicStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface MenuPermission {
  id: number
  menu_id: number
  permission_id: number
  permission?: {
    id: number
    code: string
    name: string
  }
}

export interface Permission {
  id: number
  code: string
  name: string
}

export interface Menu {
  id: number
  code: string
  name: string
  path?: string | null
  api_path?: string | null
  icon?: string | null
  type: MenuType
  status: BasicStatus
  parent_id?: number | null
  sort_order: number
  is_public: boolean
  show_in_menu: boolean
  required_permission_id?: number | null
  created_user_id?: number | null
  updated_user_id?: number | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  parent?: Menu | null
  children?: Menu[]
  required_permission?: Permission | null
  menu_permissions?: MenuPermission[]
  allowed?: boolean // Only in user menu response
}

export interface MenuTreeItem {
  id: string | number
  code: string
  name: string
  path?: string | null
  api_path?: string | null
  icon?: string | null
  type: MenuType
  status: BasicStatus
  parent_id?: string | number | null
  sort_order?: number
  is_public?: boolean
  show_in_menu?: boolean
  required_permission_id?: number | null
  children?: MenuTreeItem[]
  allowed?: boolean
}

export interface MenuListResponse {
  data: Menu[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number | null
    previousPage: number | null
  }
}

export interface CreateMenuDto {
  code: string
  name: string
  path?: string | null
  api_path?: string | null
  icon?: string | null
  type?: MenuType
  status?: BasicStatus
  parent_id?: number | null
  sort_order?: number
  is_public?: boolean
  show_in_menu?: boolean
  required_permission_id?: number | null
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface MenuFilterParams {
  page?: number
  limit?: number
  q?: string
  status?: BasicStatus
  parent_id?: number | null
  show_in_menu?: boolean
  sort?: string
}

export interface UserMenuParams {
  include_inactive?: boolean
  flatten?: boolean
}


