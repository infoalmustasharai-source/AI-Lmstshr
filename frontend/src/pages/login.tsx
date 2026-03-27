import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser, registerUser } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [_, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      setLocation("/chat");
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(name, email, password);
      localStorage.setItem("token", data.token);
      setLocation("/chat");
    } catch (err: any) {
      setError(err.message || "فشل التسجيل");
    } finally {
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

        {/* Forms */}
        {!isRegister ? (
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
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
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                الاسم الكامل
              </label>
              <Input
                type="text"
                placeholder="اسمك هنا"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                required
              />
            </div>

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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
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
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        )}

        {/* Toggle between login and register */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="ml-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-gray-500">أو</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Test Account Info */}
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-gray-400 text-center">
          <p className="font-semibold text-purple-300 mb-1">حساب تجريبي:</p>
          <p>البريد: bishoysamy390@gmail.com</p>
          <p>كلمة المرور: Bishoysamy2020</p>
        </div>
      </div>
    </div>
  );
}


