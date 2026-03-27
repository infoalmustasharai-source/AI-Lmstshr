// Unified API client for the frontend

const API_URL = import.meta.env.VITE_API_URL || "/api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiCall<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const token = localStorage.getItem("token");
  if (token && !skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ AUTH ENDPOINTS ============

export async function registerUser(name: string, email: string, password: string, phone?: string) {
  return apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone }),
    skipAuth: true,
  });
}

export async function loginUser(email: string, password: string) {
  return apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function getCurrentUser() {
  return apiCall("/auth/me", { method: "GET" });
}

export async function resetForgottenPassword(email: string) {
  return apiCall("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(newPassword: string) {
  return apiCall("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

// ============ CHAT ENDPOINTS ============

export async function getPersonalities() {
  return apiCall("/chat/personalities");
}

export async function createChat(personality: string) {
  return apiCall("/chat/create", {
    method: "POST",
    body: JSON.stringify({ personality }),
  });
}

export async function getChats() {
  return apiCall("/chat/list");
}

export async function getChat(chatId: number) {
  return apiCall(`/chat/${chatId}`);
}

export async function sendMessage(chatId: number, content: string) {
  return apiCall(`/chat/${chatId}/message`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ============ FILE ENDPOINTS ============

export async function uploadFile(
  filename: string,
  originalName: string,
  fileType: string,
  base64Data: string
) {
  return apiCall("/files/upload", {
    method: "POST",
    body: JSON.stringify({ filename, originalName, fileType, base64Data }),
  });
}

export async function getFiles() {
  return apiCall("/files/list");
}

// ============ WALLET ENDPOINTS ============

export async function getBalance() {
  return apiCall("/wallet/balance");
}

export async function getTransactions() {
  return apiCall("/wallet/transactions");
}

// ============ ADMIN ENDPOINTS ============

export async function getAdminUsers() {
  return apiCall("/admin/users");
}

export async function updateUserBalance(userId: number, amount: number) {
  return apiCall(`/admin/users/${userId}/balance`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function toggleUserActive(userId: number, isActive: boolean) {
  return apiCall(`/admin/users/${userId}/active`, {
    method: "POST",
    body: JSON.stringify({ isActive }),
  });
}

export async function getAdminTransactions() {
  return apiCall("/admin/transactions");
}
