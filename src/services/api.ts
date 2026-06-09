import { apiRequest } from "../Enpoints/apiRequest";
import { API } from "../Enpoints/API";

// ─── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) =>
    apiRequest(API.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }),

  login: (data: object) =>
    apiRequest(API.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }),
};

// ─── Food ──────────────────────────────────────────────────────────
export const foodApi = {
  getByName: (name: string) =>
    apiRequest(`${API.FOOD.SEARCH_BY_NAME}/${encodeURIComponent(name)}`, {
      credentials: "include",
    }),

  getByPriceRange: (min: number, max: number) =>
    apiRequest(`${API.FOOD.SEARCH_BY_PRICE}?min=${min}&max=${max}`, {
      credentials: "include",
    }),
};

// ─── Orders ────────────────────────────────────────────────────────
export const orderApi = {
  placeOrder: (items: { foodName: string; quantity: number }[]) =>
    apiRequest(API.ORDERS.MAKE_ORDER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items }),
    }),
  getOrders: () =>
    apiRequest(API.ORDERS.GET_ALL, {
      method: "GET",
      credentials: "include"
    })
};


// ─── Generic error parser ──────────────────────────────────────────
export async function parseApiError(
  res: Response
): Promise<Record<string, string>> {
  try {
    const body = await res.json();

    if (body.errors) return body.errors;
    if (body.message) return { form: body.message };
    return { form: "Something went wrong. Please try again." };
  } catch {
    return { form: `Server error (${res.status}). Please try again.` };
  }
}
