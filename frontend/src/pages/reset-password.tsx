import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "حدث خطأ في تغيير كلمة المرور");
      } else {
        setMessage(data.message || "تم تغيير كلمة المرور بنجاح");
        setTimeout(() => setLocation("/login"), 1500);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">إعادة تعيين كلمة المرور</h1>
        {message && <div className="mb-4 p-3 bg-green-600/20 text-green-200">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-600/20 text-red-200">{error}</div>}
        <form className="space-y-4" onSubmit={handleReset}>
          <div>
            <label className="block text-white mb-1">رمز إعادة التعيين</label>
            <Input type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div>
            <label className="block text-white mb-1">كلمة المرور الجديدة</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري المعالجة..." : "إعادة التعيين"}
          </Button>
        </form>
      </div>
    </div>
  );
}
