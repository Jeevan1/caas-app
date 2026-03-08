export type Role = {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
};
export type Resource =
  | "users"
  | "roles"
  | "permissions"
  | "purchase_orders"
  | "stores";

export type Scope = "list" | "detail" | "me" | "delete-user";

export type Action = "get" | "post" | "patch" | "put" | "delete";

export type Permission = {
  id: string;
  name: string;
  method: string;
  description: string;
  model: string;
};

export type PermissionInput = string | string[];
