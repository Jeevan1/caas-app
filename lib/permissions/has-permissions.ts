import { User } from "../types";
import { PermissionInput } from "../types/roles";

export function hasPermission(
  user: User | null,
  permission: PermissionInput,
  data?: {
    id?: string;
    adminPermission?: PermissionInput;
  },
): boolean {
  if (!user) return false;

  const hasPerm = Array.isArray(permission)
    ? permission.some((p) => user.perms.includes(p))
    : user.perms.includes(permission);

  if (!hasPerm) return false;

  // No ownership restriction
  if (!data?.id) return true;

  // Owner always allowed
  if (data.id === user.id) return true;

  // Admin / elevated permission can access others
  if (data.adminPermission) {
    return Array.isArray(data.adminPermission)
      ? data.adminPermission.some((p) => user.perms.includes(p))
      : user.perms.includes(data.adminPermission);
  }

  return false;
}
