"use client";

import { ReactNode } from "react";
import { PermissionInput } from "../types/roles";
import { useCurrentUser } from "../providers";
import { hasPermission } from "./has-permissions";

type Props = {
  permission: PermissionInput;
  data?: any;
  children: ReactNode;
};

export function CAN({ permission, data, children }: Props) {
  const user = useCurrentUser();
  if (!user || !hasPermission(user, permission, data)) return null;
  return <>{children}</>;
}
