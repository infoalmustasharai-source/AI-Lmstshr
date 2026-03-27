import { useState } from "react";
import { Link } from "wouter";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/use-auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const result = await login({ email, password });
    if (!result.success) {
      setError(result.error || "بيانات الدخول غير صحيحة");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle animated background gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse duration-7000" />
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowRight className="h-4 w-4" />
          العودة للمحادثة
        </Link>

        <div className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl p-8 md:p-10 rounded-[2rem] border-t-[4px] border-t-primary">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-20 w-20 gradient-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">تسجيل الدخول</h1>
            <p className="text-base text-muted-foreground">أدخل بيانات الاعتماد للوصول للوحة تحكم المستشار</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground ml-1">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-12 h-14 bg-black/20 border-border/50 focus:border-primary/50 text-base rounded-xl transition-all"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground ml-1">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 h-14 bg-black/20 border-border/50 focus:border-primary/50 text-base rounded-xl transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold mt-4 gradient-primary text-white border-0 shadow-lg hover:shadow-primary/25 rounded-xl transition-all" 
              isLoading={loading}
            >
              دخول للوحة التحكم
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
