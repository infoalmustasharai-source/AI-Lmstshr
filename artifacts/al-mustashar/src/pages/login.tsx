import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "فشل تسجيل الدخول");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setLocation("/chat");
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const name = email.split("@")[0]; // Simple name generation
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "فشل التسجيل");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setLocation("/chat");
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full -z-10 animate-pulse" />

      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">المستشار</h1>
          </div>
          <p className="text-purple-200">منصة استشارات قانونية ذكية</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        {/* Additional actions */}
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={async () => {
              const recoveryEmail = window.prompt("أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:");
              if (!recoveryEmail) return;
              setError("");
              setLoading(true);

              try {
                const response = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: recoveryEmail }),
                });

                const data = await response.json();
                if (!response.ok) {
                  setError(data.error || "فشل إرسال رابط الاستعادة");
                } else {
                  setError("");
                  alert(data.message || "تم إرسال رابط استعادة كلمة المرور إذا كان الحساب موجودًا.");
                }
              } catch (err: any) {
                setError(err.message || "حدث خطأ");
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs text-purple-300 hover:underline"
          >
            نسيت كلمة المرور؟
          </button>

          <button
            onClick={async () => {
              const idToken = window.prompt("الصق Google ID Token هنا:");
              if (!idToken) return;
              setError("");
              setLoading(true);
              try {
                const response = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idToken }),
                });
                const data = await response.json();
                if (!response.ok) {
                  setError(data.error || "فشل تسجيل الدخول عبر جوجل");
                } else {
                  localStorage.setItem("token", data.token);
                  setLocation("/chat");
                }
              } catch (err: any) {
                setError(err.message || "حدث خطأ");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="text-xs text-white bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700"
          >
            تسجيل عبر Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-sm text-gray-400">أم</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Register */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">ليس لديك حساب؟</p>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleRegister(e as any);
            }}
            disabled={loading}
            variant="outline"
            className="w-full border-slate-600 hover:bg-slate-800 text-white"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء حساب جديد"}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          جميع الحقوق محفوظة © 2026
        </p>
      </div>
    </div>
  );
}
