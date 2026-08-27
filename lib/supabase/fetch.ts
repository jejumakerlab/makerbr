/** Next.js Data Cache를 건너뛰고 항상 최신 응답을 받습니다. */
export function noStoreFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    cache: "no-store",
  });
}
