import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PermissionInput } from "../types/roles";
import { User } from "../types";
import { hasPermission } from "./has-permissions";

type Props = {
  permission: PermissionInput;
  children: React.ReactNode;
  data?: {
    id?: string;
    adminPermission?: PermissionInput;
  };
};

export async function requirePermission(
  permission: PermissionInput,
  data?: {
    id?: string;
    adminPermission?: PermissionInput;
  },
) {
  const user = await getCurrentUser();

  if (
    !hasPermission(user, permission, {
      id: data?.id,
      adminPermission: data?.adminPermission,
    })
  ) {
    redirect("/forbidden");
  }

  return user;
}

export async function RequirePermission({
  permission,
  children,
  data: { id, adminPermission } = {},
}: Props) {
  const user = await getCurrentUser();

  if (
    !hasPermission(user, permission, {
      id: id,
      adminPermission: adminPermission,
    })
  ) {
    return null;
  }

  return <>{children}</>;
}
