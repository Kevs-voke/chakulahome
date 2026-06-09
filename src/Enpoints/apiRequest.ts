const BASE = import.meta.env.VITE_API_URL;

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    return fetch(`${BASE}/${endpoint}`, options);
}