import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useVerifyAdmin, adminLogin, type AdminLoginBody } from "@workspace/api-client-react";

export function useAdminAuth() {
  const [_, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));

  const authOptions = {
    request: {
      headers: { Authorization: `Bearer ${token}` }
    }
  };

  const { data: verification, isLoading: isVerifying, isError } = useVerifyAdmin({
    ...authOptions,
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError || (verification && !verification.valid)) {
      logout();
    }
  }, [isError, verification]);

  const login = async (credentials: AdminLoginBody) => {
    try {
      const response = await adminLogin(credentials);
      if (response.token) {
        localStorage.setItem("adminToken", response.token);
        setToken(response.token);
        setLocation("/admin");
        return { success: true };
      }
      return { success: false, error: "Invalid response" };
    } catch (error: any) {
      return { success: false, error: error.message || "فشل تسجيل الدخول" };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setLocation("/admin-login");
  };

  return {
    token,
    isAuthenticated: !!token && verification?.valid,
    isVerifying,
    login,
    logout,
    authOptions
  };
}
