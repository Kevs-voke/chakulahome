export const API = {
    AUTH: {
        REGISTER: "auth/register",
        LOGIN: "auth/login",
        LOGOUT: "auth/logout",
    },

    FOOD: {
        SEARCH_BY_NAME: "api/search",
        SEARCH_BY_PRICE: "api/search/price",
    },

    ORDERS: {
        MAKE_ORDER: "api/order/make-order",
        GET_ALL: "api/order/get-orders",
    },
} as const;