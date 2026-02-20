import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GenericMutationOptions<TPayload, TResult = any> {
  apiPath: string | ((payload: TPayload) => string);
  method?: HTTP_METHOD;
  queryKey?: any;
  payloadTransform?: (payload: TPayload) => any;
  optimisticUpdate?: (prevData: any, payload: TPayload) => any;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  onSuccessCallback?: (data: TResult, payload?: TPayload) => void;
  hasFileFields?: boolean;
}

export interface ApiValidationError {
  error?: Record<string, string[]>;
  detail?: string;
  non_field_errors?: string[];
}

class ApiError extends Error {
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export const useApiMutation = <TPayload, TResult = any>({
  queryKey,
  apiPath,
  method = "POST",
  payloadTransform,
  hasFileFields = false,
  successMessage = "Success",
  errorMessage = "Something went wrong",
  optimisticUpdate,
  onSuccessCallback,
  showSuccessToast = true,
}: GenericMutationOptions<TPayload, TResult>) => {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TPayload>({
    mutationFn: async (payload: TPayload) => {
      const rawBody = payloadTransform ? payloadTransform(payload) : payload;
      const path = typeof apiPath === "function" ? apiPath(payload) : apiPath;

      let body: BodyInit;
      let headers: HeadersInit | undefined;

      const hasFile = hasFileFields;
      if (hasFile) {
        const formData = new FormData();

        Object.entries(rawBody).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              Object.entries(item).forEach(([itemKey, itemValue]) => {
                if (itemValue !== undefined) {
                  formData.append(
                    `${key}.${index}.${itemKey}`,
                    itemValue as any,
                  );
                }
              });
            });
          } else if (value !== undefined) {
            formData.append(key, value as any);
          }
        });

        body = formData;
        headers = undefined; // 🔥 critical
      } else {
        body = JSON.stringify(rawBody);
        headers = { "Content-Type": "application/json" };
      }
      const res = await fetch(path, {
        method,
        headers,
        body,
      });

      // // ✅ Handle 204 No Content
      // if (res.status === 204) {
      //   return {
      //     success: true,
      //     message: "Operation completed successfully",
      //   };
      // }

      // Try to parse JSON safely
      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // 🔹 Field-level errors
        if (data?.error && typeof data.error === "object") {
          throw new ApiError("Validation error", data.error);
        }

        // 🔹 Non-field / global errors
        const message =
          data?.non_field_errors?.[0] || data?.detail || "Something went wrong";

        throw new ApiError(message);
      }

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

    onError: (err: any, _vars, context: any) => {
      if (context?.previous && queryKey) {
        queryClient.setQueryData(queryKey, context.previous);
      }

      const showFieldError = (field: string, messages: any) => {
        if (field.toLowerCase().includes("code")) return;
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (typeof msg === "string") {
              toast({
                title: `Error`,
                description: msg,
                variant: "destructive",
              });
            } else if (typeof msg === "object") {
              Object.entries(msg).forEach(([nestedField, nestedVal]) => {
                showFieldError(nestedField, nestedVal);
              });
            }
          });
        } else if (typeof messages === "object" && messages !== null) {
          // Check if object has "detail" field (like {detail, code})
          if ("detail" in messages) {
            toast({
              title: `Error: ${field}`,
              description: messages.detail,
              variant: "destructive",
            });
          } else {
            Object.entries(messages).forEach(([nestedField, nestedVal]) => {
              showFieldError(nestedField, nestedVal);
            });
          }
        } else {
          toast({
            title: `Error`,
            description: String(messages),
            variant: "destructive",
          });
        }
      };

      // Handle fieldErrors or nested error objects
      const rawErrors =
        err?.fieldErrors || err?.data?.error || err?.data?.errors || err?.data;
      if (rawErrors && typeof rawErrors === "object") {
        Object.entries(rawErrors).forEach(([field, messages]) => {
          showFieldError(field, messages);
        });
        return;
      }

      // Fallback: show global error
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    },

    onSuccess: (data, variables: TPayload) => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
      if (!showSuccessToast) {
        return;
      }

      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      });

      onSuccessCallback?.(data, variables);
    },
  });
};
