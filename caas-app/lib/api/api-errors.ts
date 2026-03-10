// ─── ApiError ─────────────────────────────────────────────────────────────────
// A typed error class for all API failures.
// - fieldErrors: per-field validation errors  { field: ["msg", ...] }
// - nonFieldError: single non-field message   "You do not have permission"

export class ApiError extends Error {
  fieldErrors?: Record<string, string[]>;
  nonFieldError?: string;

  constructor(
    message: string,
    fieldErrors?: Record<string, string[]>,
    nonFieldError?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
    this.nonFieldError = nonFieldError;
  }

  get hasFieldErrors(): boolean {
    return !!this.fieldErrors && Object.keys(this.fieldErrors).length > 0;
  }

  get hasNonFieldError(): boolean {
    return !!this.nonFieldError;
  }
}

// ─── parseErrorResponse ───────────────────────────────────────────────────────
// Converts any DRF error response body → ApiError
//
// Handles:
//   { field: ["msg"] }                  ← flat (default DRF)
//   { error: { field: ["msg"] } }       ← wrapped
//   { errors: { field: ["msg"] } }      ← wrapped (alternate)
//   { non_field_errors: ["msg"] }       ← non-field validation
//   { detail: "msg" }                   ← permission / 404 / generic

export function parseErrorResponse(
  data: any,
  fallback = "Something went wrong",
): ApiError {
  if (!data || typeof data !== "object") return new ApiError(fallback);

  // non_field_errors
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    const msg = data.non_field_errors[0];
    return new ApiError(msg, undefined, msg);
  }

  // detail
  if (typeof data.detail === "string") {
    return new ApiError(data.detail, undefined, data.detail);
  }

  // Wrapped: { error: { field: [...] } } or { errors: { field: [...] } }
  const wrapped = data.error ?? data.errors;
  if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped)) {
    return new ApiError("Validation error", wrapped);
  }

  // Flat DRF: { field: ["msg"], ... }
  if (isFieldMap(data)) {
    return new ApiError("Validation error", data as Record<string, string[]>);
  }

  return new ApiError(fallback);
}

// ─── isFieldMap ───────────────────────────────────────────────────────────────
// Returns true when every value in obj is a string[] (flat DRF field error map)

const NON_FIELD_KEYS = new Set([
  "detail",
  "non_field_errors",
  "message",
  "code",
]);

function isFieldMap(obj: Record<string, any>): boolean {
  const fieldKeys = Object.keys(obj).filter((k) => !NON_FIELD_KEYS.has(k));
  if (fieldKeys.length === 0) return false;
  return fieldKeys.every(
    (k) =>
      Array.isArray(obj[k]) &&
      (obj[k] as any[]).every((s) => typeof s === "string"),
  );
}
