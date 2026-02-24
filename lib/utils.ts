import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { twMerge } from "tailwind-merge";
import { ApiError, parseErrorResponse } from "./api/api-errors";
import { showToast } from "@/components/toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GenericMutationOptions<TPayload, TResult = any> {
  apiPath: string | ((payload: TPayload) => string);
  method?: HTTP_METHOD;
  onErrorCallback?: (err: ApiError, payload?: TPayload) => void;
  queryKey?: any;
  payloadTransform?: (payload: TPayload) => any;
  optimisticUpdate?: (prevData: any, payload: TPayload) => any;
  successMessage?: string;
  errorMessage?: string;
  showSuccessuseToast?: boolean;
  onSuccessCallback?: (data: TResult, payload?: TPayload) => void;
}

// ─── File detection ───────────────────────────────────────────────────────────

function hasFileValue(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (obj instanceof FormData) return true;
  return Object.values(obj).some((val) => {
    if (val instanceof File || val instanceof Blob) return true;
    if (Array.isArray(val))
      return val.some((v) => v instanceof File || v instanceof Blob);
    return false;
  });
}

function buildBody(rawBody: any): { body: BodyInit; headers?: HeadersInit } {
  if (rawBody instanceof FormData) return { body: rawBody };

  if (hasFileValue(rawBody)) {
    const fd = new FormData();
    Object.entries(rawBody).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof File || item instanceof Blob)
            fd.append(key, item);
          else if (typeof item === "object") {
            Object.entries(item).forEach(([k, v]) => {
              if (v !== undefined) fd.append(`${key}.${k}`, v as any);
            });
          } else fd.append(key, String(item));
        });
      } else if (value instanceof File || value instanceof Blob) {
        fd.append(key, value);
      } else if (typeof value === "object") {
        Object.entries(value as Record<string, any>).forEach(([k, v]) => {
          if (v !== undefined && v !== null)
            fd.append(`${key}.${k}`, String(v));
        });
      } else {
        fd.append(key, String(value));
      }
    });
    return { body: fd };
  }

  return {
    body: JSON.stringify(rawBody),
    headers: { "Content-Type": "application/json" },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useApiMutation = <TPayload, TResult = any>({
  queryKey,
  apiPath,
  method = "POST",
  payloadTransform,
  successMessage = "Success",
  errorMessage = "Something went wrong",
  optimisticUpdate,
  onSuccessCallback,
  onErrorCallback,
  showSuccessuseToast = true,
}: GenericMutationOptions<TPayload, TResult>) => {
  const queryClient = useQueryClient();

  return useMutation<TResult, ApiError, TPayload>({
    mutationFn: async (payload: TPayload) => {
      const rawBody = payloadTransform ? payloadTransform(payload) : payload;
      const path = typeof apiPath === "function" ? apiPath(payload) : apiPath;
      const { body, headers } = buildBody(rawBody);
      const res = await fetch(path, { method, headers, body });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) throw parseErrorResponse(data, errorMessage);

      return data as TResult;
    },

    onMutate: async (payload: TPayload) => {
      if (!queryKey) return;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      if (optimisticUpdate) {
        queryClient.setQueryData(queryKey, (oldData = []) =>
          optimisticUpdate(oldData, payload),
        );
      }
      return { previous };
    },

    onError: (err: ApiError, _vars, context: any) => {
      onErrorCallback?.(err);
      if (context?.previous && queryKey) {
        queryClient.setQueryData(queryKey, context.previous);
      }

      // Field errors → one useToast per field
      if (err.hasFieldErrors) {
        Object.entries(err.fieldErrors!).forEach(([field, messages]) => {
          if (field.toLowerCase().includes("code")) return;
          const message = Array.isArray(messages)
            ? messages[0]
            : String(messages);
          showToast({
            title: field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            description: message,
            variant: "error",
          });
        });
        return;
      }

      // Non-field / generic → single useToast
      showToast({
        title: "Error",
        description: err.nonFieldError ?? err.message ?? errorMessage,
        variant: "error",
      });
    },

    onSuccess: (data, variables: TPayload) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      onSuccessCallback?.(data, variables);
      if (!showSuccessuseToast) return;
      showToast({
        title: "Success",
        description: successMessage,
        variant: "success",
      });
    },
  });
};
