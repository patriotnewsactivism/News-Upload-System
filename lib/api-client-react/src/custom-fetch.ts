import type { FetchQueryOptions, MutationOptions } from "@tanstack/react-query";
import type { RequestInit, Response } from "undici";

export type QueryParams = Record<string, string | number | null | undefined>;

export const getQueryParams = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (typeof value === "string") {
        searchParams.append(key, value);
      } else if (typeof value === "number") {
        searchParams.append(key, value.toString());
      }
    }
  });

  const search = searchParams.toString();

  return search ? `?${search}` : "";
};

const getUrl = (url: string) => {
  return url.startsWith("/") ? `${window.location.origin}${url}` : url;
};

export const customFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const fetchUrl = getUrl(url);

  const response = await fetch(fetchUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    if (response.status === 204) {
      return {} as T;
    }

    throw error;
  }
};

export type FetchOptions = RequestInit;
export type GetAllQueryParams = Record<string, any>;

export const apiInstance = {
  get: <T>(url: string, options?: RequestInit) =>
    customFetch<T>(url, {
      ...options,
      method: "GET",
    }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    customFetch<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : null,
    }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    customFetch<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : null,
    }),
  patch: <T>(url: string, body?: any, options?: RequestInit) =>
    customFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : null,
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    customFetch<T>(url, {
      ...options,
      method: "DELETE",
    }),
};

// You can extend this with react-query specific functionality if needed
export type ApiInstanceType = typeof apiInstance;
