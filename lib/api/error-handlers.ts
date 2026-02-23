import { showToast } from "@/components/toast";

export interface ApiError {
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export const mapServerErrors = (error: ApiError, form: any): void => {
  // No field errors — show a generic showToast
  if (!error.fieldErrors || typeof error.fieldErrors !== "object") {
    if (error.message) {
      showToast({
        title: "Error",
        description: error.message,
        variant: "error",
      });
    }
    return;
  }

  const setFieldError = (key: string, messages: string[]) => {
    if (!messages.length) return;

    try {
      // ✅ TanStack Form: mutate the store directly to inject errorMap on the field
      form.store.setState((prev: any) => {
        const fields = { ...prev.fields };

        // Support dot-notation nested keys: "location.name"
        const fieldKey =
          key in fields ? key : Object.keys(fields).find((k) => k === key);

        if (!fieldKey) {
          // Field not in form — fall back to showToast
          showToast({
            title: `Error: ${key}`,
            description: messages.join(", "),
            variant: "error",
          });
          return prev;
        }

        fields[fieldKey] = {
          ...fields[fieldKey],
          meta: {
            ...fields[fieldKey]?.meta,
            isTouched: true,
            isBlurred: true,
          },
          errorMap: {
            ...fields[fieldKey]?.errorMap,
            onSubmit: messages[0], // TanStack Form reads a single string per validator key
          },
        };

        return { ...prev, fields, isValid: false };
      });
    } catch {
      showToast({
        title: `Error: ${key}`,
        description: messages.join(", "),
        variant: "error",
      });
    }
  };

  Object.entries(error.fieldErrors).forEach(([key, value]) => {
    if (key.toLowerCase().includes("code")) return;

    const messages = Array.isArray(value) ? value.map(String) : [String(value)];

    setFieldError(key, messages);
  });
};
