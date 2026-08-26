const API_URL = `${import.meta.env.VITE_API_URL}/api`;

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const api = {

    register: (username, email, password) =>
        request("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username,
                email,
                password
            })
        }),

    login: async (email, password) => {
        const data = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        return data;
    },

    me: () =>
        request("/users/me"),

    articles: () =>
        request("/articles"),

    article: (id) =>
        request(`/articles/${id}`),

    search: (query) =>
    request(
        `/search/semantic?q=${encodeURIComponent(query)}&limit=10`
    ),
    bookmarks: () =>
        request("/bookmarks"),

    addBookmark: (articleId) =>
        request("/bookmarks", {
            method: "POST",
            body: JSON.stringify({
                articleId
            })
        }),

    removeBookmark: (articleId) =>
        request(`/bookmarks/${articleId}`, {
            method: "DELETE"
        }),

    reviews: (articleId) =>
        request(`/reviews/${articleId}`),

    addReview: (articleId, feedback, rating) =>
        request("/reviews", {
            method: "POST",
            body: JSON.stringify({
                articleId,
                feedback,
                rating
            })
        }),

    ai: (prompt) =>
        request("/ai/generate", {
            method: "POST",
            body: JSON.stringify({
                prompt
            })
        }),

    dashboard: () =>
        request("/dashboard"),

    stats: (articleId) =>
        request(`/stats/articles/${articleId}`),

    logout: () => {
        localStorage.removeItem("token");
    }
};

