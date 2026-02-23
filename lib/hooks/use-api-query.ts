import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { FetchError } from "../exceptions";
import { buildQueryString } from "../helpers";

interface QueryOptions<TQueryFnData, TData> extends Omit<
  UseQueryOptions<TQueryFnData, FetchError, TData>,
  "queryKey" | "queryFn"
> {
  url: string;
  queryKey: string | readonly unknown[];
  queryParams?: Record<string, string | number | boolean | undefined>;
}

export function useApiQuery<TQueryFnData, TData = TQueryFnData>(
  options: QueryOptions<TQueryFnData, TData>,
) {
  const { url, queryKey, queryParams, ...restOptions } = options;

  const fullUrl = `${url}${buildQueryString(queryParams)}`;

  const finalQueryKey = Array.isArray(queryKey)
    ? queryParams
      ? [...queryKey, queryParams]
      : queryKey
    : queryParams
      ? [queryKey, queryParams]
      : [queryKey];

  return useQuery<TQueryFnData, FetchError, TData>({
    queryKey: finalQueryKey,

    queryFn: async () => {
      if (!url) {
        console.warn("No URL provided for useAPIQuery");
        return [] as unknown as TQueryFnData;
      }

      try {
        const res = await fetch(fullUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // Try to parse JSON safely
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn(`Response is not JSON for ${fullUrl}`, text);
          data = []; // fallback to empty array
        }

        if (!res.ok) {
          throw new FetchError(
            `Failed to fetch: ${fullUrl} ${res.status} ${res.statusText}`,
            res.status,
            data,
          );
        }

        return data as TQueryFnData;
      } catch (error) {
        console.error("useAPIQuery error:", error);
        throw error;
      }
    },

    ...restOptions,
  });
}
