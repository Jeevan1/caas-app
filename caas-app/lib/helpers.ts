import { FetchError } from "@/lib/exceptions";
import z from "zod";

export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value != null) searchParams.append(key, value.toString());
  }

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

export async function parseJSON(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new FetchError(
      `Failed to parse JSON: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }
}

export function extractErrorMessage(data: any): string {
  if (!data || typeof data !== "object") return "Something went wrong";

  const errObj =
    data.error && typeof data.error === "object" ? data.error : data;

  return Object.values(errObj).flat().join(", ");
}

export function formatTime(time: string) {
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}-${day}, ${year}`;
}

export const selectValueSchema = (
  fieldName: string,
  options?: { optional?: boolean },
) =>
  z.preprocess(
    (val) => {
      if (val == null || val === "") return undefined;

      if (typeof val === "object") {
        return (val as any).value ?? (val as any).id;
      }

      return val;
    },
    options?.optional
      ? z.string().min(1).optional()
      : z
          .string({
            error: `${fieldName} is required`,
          })
          .min(1, `${fieldName} is required`),
  );

export const dateValueSchema = (fieldName: string) =>
  z.preprocess(
    (val) => {
      if (!val) return undefined;

      if (val instanceof Date) {
        return val.toISOString().split("T")[0];
      }

      return val;
    },
    z.coerce.string().min(1, `${fieldName} is required`),
  );

export const numberValueSchema = (fieldName: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }

      if (typeof val === "string" || typeof val === "number") {
        const num = Number(val);
        return Number.isNaN(num) ? undefined : num;
      }

      return undefined;
    },
    z.coerce.number().min(1, `${fieldName} is required`),
  );

export const timeValueSchema = (label: string) =>
  z.preprocess(
    (val) => {
      if (!val) return undefined;

      // If Date object, convert to HH:mm
      if (val instanceof Date) {
        return val.toTimeString().slice(0, 5); // "HH:mm"
      }

      // If string in 12-hour format, convert to 24-hour "HH:mm"
      if (typeof val === "string") {
        const match12 = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
        if (match12) {
          let hour = parseInt(match12[1], 10);
          const minute = match12[2];
          const ampm = match12[3].toUpperCase();
          if (ampm === "PM" && hour < 12) hour += 12;
          if (ampm === "AM" && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, "0")}:${minute}`;
        }

        // If 24-hour format with seconds, strip seconds
        const match24 = val.match(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/);
        if (match24) {
          return `${match24[1]}:${match24[2]}`;
        }

        return val; // keep as-is for regex validation
      }

      return val;
    },
    z
      .string()
      .min(1, `${label} is required`)
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: `Invalid ${label} format (HH:mm or hh:mm AM/PM)`,
      }),
  );

export const salarySchema = (label: string) =>
  z.coerce
    .number({
      error: `${label} must be a number`,
    })
    .positive(`${label} must be greater than 0`);

export const phoneSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .regex(/^\d{10}$/, { message: `${label} must be a 10-digit number` });

export function getSafeDefaultValues<T extends Record<string, any>>(
  defaults: T,
  initialData?: Partial<T> | null,
): T {
  if (!initialData) return defaults;
  return Object.keys(defaults).reduce((acc, key) => {
    const value = initialData[key as keyof T];
    acc[key as keyof T] =
      value !== null && value !== undefined ? value : defaults[key as keyof T];
    return acc;
  }, {} as T);
}

export const getFullName = (
  firstName: string,
  middleName: string | null,
  lastName: string,
) => `${firstName} ${middleName ?? ""} ${lastName}`;

export const getMaritalStatus = (status: number | null) => {
  switch (status) {
    case 0:
      return "Married";
    case 1:
      return "Single";
    case 2:
      return "Widowed";
    case 3:
      return "Divorced";
    default:
      return "-";
  }
};

export const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 20);
  const l = 45 + Math.floor(Math.random() * 15);
  return `${h} ${s}% ${l}%`;
};

export function statusFromDates(start: string, end: string) {
  const now = Date.now();
  if (now < new Date(start).getTime())
    return { label: "Upcoming", cls: "bg-primary/10 text-primary" };
  if (now > new Date(end).getTime())
    return { label: "Ended", cls: "bg-muted text-muted-foreground" };
  return {
    label: "Live now",
    cls: "bg-secondary/10 text-secondary animate-pulse",
  };
}
