import conf from "../conf/conf";

const BASE = `${conf.apiUrl}/api/v1`;

export interface ApiIssue {
  path: string;
  message: string;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export class ApiError extends Error {
  status: number;
  issues?: ApiIssue[];

  constructor(status: number, message: string, issues?: ApiIssue[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

const rawRequest = (path: string, init: RequestInit = {}) =>
  fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

// Refresh tokens rotate, so two concurrent refreshes would invalidate each
// other — in-flight calls share one promise.
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    const pending = rawRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then((res) => res.ok)
      .catch(() => false);

    refreshPromise = pending;
    void pending.finally(() => {
      if (refreshPromise === pending) refreshPromise = null;
    });
  }
  return refreshPromise;
};

/** Returns the full `{ data, meta }` envelope. */
export async function requestEnvelope<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  let res = await rawRequest(path, init);

  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (await refreshSession()) res = await rawRequest(path, init);
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `Request failed with status ${res.status}`,
      body?.issues
    );
  }
  return body as T;
}

const unwrap = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const body = await requestEnvelope<{ data: T }>(path, init);
  return body.data;
};

const jsonBody = (method: string, body?: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body ?? {}),
});

export const api = {
  get: <T>(path: string) => unwrap<T>(path),
  post: <T>(path: string, body?: unknown) => unwrap<T>(path, jsonBody("POST", body)),
  patch: <T>(path: string, body?: unknown) => unwrap<T>(path, jsonBody("PATCH", body)),
  delete: <T>(path: string) => unwrap<T>(path, { method: "DELETE" }),
  search: <T>(body: unknown) =>
    requestEnvelope<Paginated<T>>("/search", jsonBody("POST", body)),
};
