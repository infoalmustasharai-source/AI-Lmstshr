import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  LogOut, Users, MessageSquare, Activity, Trash2, ShieldAlert,
  ArrowRight, Shield, Plus, Edit2, Phone, Wallet, TrendingUp,
  MessageCircle, Search, X, Check, AlertCircle, BarChart2,
  RefreshCw, Eye, ChevronDown, ChevronUp, DollarSign, Clock,
  Download, Crown
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
interface Stats {
  totalConversations: number; totalMessages: number;
  todayConversations: number; todayMessages: number;
  totalUsers: number; totalBalance: number; totalDeposited: number;
  recentActivity: { date: string; count: number }[];
}
interface User {
  id: number; name: string; phone: string; email?: string;
  balance: number; plan: string; isActive: boolean; notes?: string; createdAt: string;
}
interface Conversation { id: number; title: string; createdAt: string; }
interface Transaction {
  transaction: { id: number; userId: number; amount: number; type: string; note?: string; createdAt: string };
  user: { name: string; phone: string } | null;
}

const TABS = [
  { id: "dashboard", label: "الرئيسية", icon: BarChart2 },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "conversations", label: "المحادثات", icon: MessageSquare },
  { id: "transactions", label: "المعاملات", icon: Wallet },
] as const;
type Tab = typeof TABS[number]["id"];

const WHATSAPP_NUMBER = "0201130031531";

function openWhatsApp(phone?: string, msg?: string) {
  const num = (phone || WHATSAPP_NUMBER).replace(/[^0-9]/g, "");
  const link = `https://wa.me/${num}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
  window.open(link, "_blank");
}

// ─── User Modal ──────────────────────────────────────────
function UserModal({ user, onClose, onSave, token }: { user: User | null; onClose: () => void; onSave: () => void; token: string }) {
  const isEdit = !!user;
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", email: user?.email || "", balance: user?.balance?.toString() || "0", plan: user?.plan || "free", isActive: user?.isActive ?? true, notes: user?.notes || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name || !form.phone) { setError("الاسم والهاتف مطلوبان"); return; }
    setLoading(true); setError("");
    try {
      const url = isEdit ? `/api/admin/users/${user.id}` : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, balance: parseInt(form.balance) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ"); setLoading(false); return; }
      onSave(); onClose();
    } catch { setError("فشل الاتصال"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-bold text-lg">{isEdit ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "الاسم *", key: "name", type: "text", placeholder: "اسم المستخدم" },
              { label: "رقم الهاتف *", key: "phone", type: "text", placeholder: "مثال: 0501234567" },
              { label: "البريد الإلكتروني", key: "email", type: "email", placeholder: "اختياري" },
              { label: "الرصيد (تحليلات)", key: "balance", type: "number", placeholder: "0" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-white/50 mb-1 block">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50" dir="rtl" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">الباقة</label>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                {["free", "basic", "pro", "enterprise"].map(p => <option key={p} value={p} className="bg-[#1a1a1a]">{p === "free" ? "مجاني" : p === "basic" ? "أساسي" : p === "pro" ? "احترافي" : "مؤسسي"}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">الحالة</label>
              <select value={form.isActive ? "active" : "inactive"} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === "active" }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                <option value="active" className="bg-[#1a1a1a]">نشط</option>
                <option value="inactive" className="bg-[#1a1a1a]">موقوف</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">ملاحظات</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="ملاحظات اختيارية..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none" dir="rtl" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">إلغاء</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">{loading ? "جاري الحفظ..." : "حفظ"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Balance Modal ───────────────────────────────────────
function BalanceModal({ user, onClose, onSave, token }: { user: User; onClose: () => void; onSave: () => void; token: string }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!amount || isNaN(parseInt(amount))) { setError("أدخل مبلغاً صحيحاً"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: parseInt(amount), note }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "حدث خطأ"); setLoading(false); return; }
      onSave(); onClose();
    } catch { setError("فشل الاتصال"); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-bold">شحن رصيد - {user.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-emerald-400/70">الرصيد الحالي</p>
            <p className="text-2xl font-bold text-emerald-400">{user.balance} تحليل</p>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
          <div>
            <label className="text-xs text-white/50 mb-1 block">المبلغ (موجب للإيداع، سالب للخصم)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="مثال: 50" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-lg font-bold text-white text-center focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">ملاحظة</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="سبب الشحن..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none" dir="rtl" />
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(n => (
              <button key={n} onClick={() => setAmount(n.toString())} className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 text-white/60 hover:text-violet-300 text-xs transition-colors border border-white/5">+{n}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5">إلغاء</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">{loading ? "جاري..." : "شحن الرصيد"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Message Modal ───────────────────────────────
function WhatsAppModal({ onClose, users }: { onClose: () => void; users: User[] }) {
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const filtered = users.filter(u => u.name.includes(search) || u.phone.includes(search));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#25D366] flex items-center justify-center"><MessageCircle className="h-4 w-4 text-white" /></div>
            <h3 className="text-white font-bold">إرسال رسالة واتساب</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">نص الرسالة</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="اكتب رسالتك هنا..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none" dir="rtl" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">اختر المستخدم أو أرسل للرقم مباشرة</label>
            <div className="relative mb-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم..." className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none" dir="rtl" />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filtered.slice(0, 10).map(u => (
                <button key={u.id} onClick={() => openWhatsApp(u.phone, msg)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-right">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60 shrink-0">{u.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{u.name}</p>
                    <p className="text-xs text-white/40" dir="ltr">{u.phone}</p>
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => openWhatsApp(WHATSAPP_NUMBER, msg)} className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bc5a] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            فتح الواتساب المباشر ({WHATSAPP_NUMBER})
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Conversation Detail ──────────────────────────────────
function ConversationDetail({ id, token, onClose }: { id: number; token: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/admin/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData);
  }, [id]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h3 className="text-white font-bold">#{id} - {data?.title || "محادثة"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!data ? <div className="text-white/40 text-center py-8">جاري التحميل...</div> :
            data.messages?.map((m: any) => (
              <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-violet-600/30 text-white" : "bg-white/5 text-white/80")}>
                  <p className="text-xs text-white/30 mb-1">{m.role === "user" ? "المستخدم" : "المستشار AI"}</p>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content.slice(0, 500)}{m.content.length > 500 ? "..." : ""}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function AdminDashboardPage() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isVerifying, logout, authOptions } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null | undefined>(undefined);
  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [viewConvId, setViewConvId] = useState<number | null>(null);
  const token = (authOptions as any)?.headers?.Authorization?.split(" ")[1] || "";

  useEffect(() => { if (!isVerifying && !isAuthenticated) setLocation("/admin-login"); }, [isAuthenticated, isVerifying]);

  const fetchData = async (t: Tab) => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      if (t === "dashboard") { const r = await fetch("/api/admin/stats", { headers: h }); setStats(await r.json()); }
      if (t === "users") { const r = await fetch("/api/admin/users", { headers: h }); setUsersList(await r.json()); }
      if (t === "conversations") { const r = await fetch("/api/admin/conversations", { headers: h }); setConversations(await r.json()); }
      if (t === "transactions") { const r = await fetch("/api/admin/transactions", { headers: h }); setTransactions(await r.json()); }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated && token) fetchData(tab); }, [tab, isAuthenticated, token]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("حذف هذا المستخدم نهائياً؟")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchData("users");
  };

  const handleDeleteConv = async (id: number) => {
    if (!confirm("حذف هذه المحادثة؟")) return;
    await fetch(`/api/admin/conversations/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchData("conversations");
  };

  if (isVerifying || !isAuthenticated) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><div className="h-10 w-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const filteredUsers = usersList.filter(u => u.name.includes(search) || u.phone.includes(search) || (u.email || "").includes(search));
  const filteredConvs = conversations.filter(c => c.title?.includes(search) || c.id.toString().includes(search));
  const planColor = (p: string) => ({ free: "text-white/40 bg-white/5", basic: "text-blue-400 bg-blue-500/10", pro: "text-violet-400 bg-violet-500/10", enterprise: "text-amber-400 bg-amber-500/10" }[p] || "text-white/40 bg-white/5");
  const planLabel = (p: string) => ({ free: "مجاني", basic: "أساسي", pro: "احترافي", enterprise: "مؤسسي" }[p] || p);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {editUser !== undefined && (
        <UserModal user={editUser} onClose={() => setEditUser(undefined)} onSave={() => { fetchData("users"); if (tab === "dashboard") fetchData("dashboard"); }} token={token} />
      )}
      {balanceUser && (
        <BalanceModal user={balanceUser} onClose={() => setBalanceUser(null)} onSave={() => { fetchData("users"); fetchData("transactions"); if (tab === "dashboard") fetchData("dashboard"); }} token={token} />
      )}
      {showWhatsApp && <WhatsAppModal onClose={() => setShowWhatsApp(false)} users={usersList} />}
      {viewConvId && <ConversationDetail id={viewConvId} token={token} onClose={() => setViewConvId(null)} />}

      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f0f0f]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">لوحة تحكم المالك</p>
              <p className="text-[10px] text-violet-400">bishoysamy390@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowWhatsApp(true)} className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-xs px-3 py-1.5 rounded-xl transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:block">واتساب</span>
            </button>
            <Link href="/">
              <button className="flex items-center gap-2 text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:block">الموقع</span>
              </button>
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-red-400/70 hover:text-red-400 text-xs px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">خروج</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all", tab === t.id ? "border-violet-500 text-violet-400" : "border-transparent text-white/40 hover:text-white/70")}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "المستخدمون", value: stats?.totalUsers ?? "-", icon: Users, color: "from-violet-500 to-purple-600", sub: "إجمالي المسجلين" },
                { label: "المحادثات", value: stats?.totalConversations ?? "-", icon: MessageSquare, color: "from-blue-500 to-blue-600", sub: `اليوم: ${stats?.todayConversations ?? 0}` },
                { label: "الرسائل", value: stats?.totalMessages ?? "-", icon: Activity, color: "from-emerald-500 to-teal-600", sub: `اليوم: ${stats?.todayMessages ?? 0}` },
                { label: "إجمالي الرصيد", value: stats?.totalBalance ?? "-", icon: Wallet, color: "from-amber-500 to-orange-500", sub: `تم شحن: ${stats?.totalDeposited ?? 0}` },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-extrabold text-white">{loading ? "..." : s.value.toLocaleString()}</p>
                    <p className="text-sm text-white/50 mt-1">{s.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Activity + Owner Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet-400" />نشاط آخر 7 أيام</h3>
                {stats?.recentActivity?.length ? (
                  <div className="flex items-end gap-2 h-28">
                    {stats.recentActivity.map((d, i) => {
                      const maxVal = Math.max(...stats.recentActivity.map(x => x.count), 1);
                      const height = Math.max((d.count / maxVal) * 100, 5);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-white/40">{d.count}</span>
                          <div style={{ height: `${height}%` }} className="w-full rounded-t-md bg-violet-500/40 hover:bg-violet-500/70 transition-colors min-h-[4px]" />
                          <span className="text-[9px] text-white/30">{d.date?.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-white/30 text-sm text-center py-8">لا يوجد نشاط</p>}
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-violet-400" />حساب المالك</h3>
                <div className="space-y-3">
                  {[
                    { label: "الاسم", value: "Bishoy Samy" },
                    { label: "البريد", value: "bishoysamy390@gmail.com" },
                    { label: "الرصيد", value: "∞ غير محدود" },
                    { label: "الصلاحية", value: "مالك كامل الصلاحيات" },
                    { label: "واتساب", value: WHATSAPP_NUMBER },
                  ].map(i => (
                    <div key={i.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs text-white/40">{i.label}</span>
                      <span className="text-sm text-white font-medium" dir={i.label === "البريد" || i.label === "واتساب" ? "ltr" : "rtl"}>{i.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "إضافة مستخدم", icon: Plus, action: () => { setTab("users"); setEditUser(null); }, color: "from-violet-500 to-purple-600" },
                { label: "شحن رصيد", icon: Wallet, action: () => setTab("users"), color: "from-emerald-500 to-teal-600" },
                { label: "إرسال واتساب", icon: MessageCircle, action: () => setShowWhatsApp(true), color: "from-green-500 to-[#25D366]" },
                { label: "عرض المحادثات", icon: MessageSquare, action: () => setTab("conversations"), color: "from-blue-500 to-indigo-600" },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={a.action} className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${a.color} hover:opacity-90 transition-all text-white text-sm font-medium shadow-lg`}>
                    <Icon className="h-5 w-5" />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50" dir="rtl" />
              </div>
              <button onClick={() => fetchData("users")} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border border-white/10"><RefreshCw className="h-4 w-4" /></button>
              <button onClick={() => setEditUser(null)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
                <Plus className="h-4 w-4" />إضافة مستخدم
              </button>
            </div>

            {loading ? <div className="text-white/30 text-center py-12">جاري التحميل...</div> : filteredUsers.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-12 text-center text-white/30">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد مستخدمون مسجلون</p>
                <button onClick={() => setEditUser(null)} className="mt-4 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-400 text-sm hover:bg-violet-600/30 transition-colors">+ إضافة أول مستخدم</button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredUsers.map(u => (
                  <div key={u.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-white/10 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-600/20 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0 border border-violet-500/20">{u.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white">{u.name}</p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", planColor(u.plan))}>{planLabel(u.plan)}</span>
                        {!u.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">موقوف</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-white/40 flex items-center gap-1" dir="ltr"><Phone className="h-3 w-3" />{u.phone}</span>
                        {u.email && <span className="text-xs text-white/30">{u.email}</span>}
                        <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(u.createdAt), "yyyy/MM/dd")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-center px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                        <p className="text-lg font-bold text-emerald-400">{u.balance}</p>
                        <p className="text-[9px] text-emerald-400/60">تحليل</p>
                      </div>
                      <button onClick={() => setBalanceUser(u)} title="شحن رصيد" className="p-2 rounded-xl hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-colors border border-white/5">
                        <DollarSign className="h-4 w-4" />
                      </button>
                      <button onClick={() => openWhatsApp(u.phone)} title="واتساب" className="p-2 rounded-xl hover:bg-[#25D366]/10 text-white/40 hover:text-[#25D366] transition-colors border border-white/5">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditUser(u)} title="تعديل" className="p-2 rounded-xl hover:bg-blue-500/10 text-white/40 hover:text-blue-400 transition-colors border border-white/5">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} title="حذف" className="p-2 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors border border-white/5">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONVERSATIONS TAB */}
        {tab === "conversations" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none" dir="rtl" />
              </div>
              <button onClick={() => fetchData("conversations")} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border border-white/10"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {loading ? <div className="text-white/30 text-center py-12">جاري التحميل...</div> : (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">المحادثات</span>
                  <span className="text-xs text-white/40">{filteredConvs.length} محادثة</span>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredConvs.length === 0 ? <p className="text-white/30 text-center py-10">لا توجد محادثات</p> :
                    filteredConvs.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors group">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-white/30">#{c.id}</span>
                          <p className="text-sm text-white">{c.title || "بدون عنوان"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30">{format(new Date(c.createdAt), "yyyy/MM/dd HH:mm")}</span>
                          <button onClick={() => setViewConvId(c.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 text-white/40 hover:text-blue-400 transition-all"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteConv(c.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === "transactions" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => fetchData("transactions")} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border border-white/10"><RefreshCw className="h-4 w-4" /></button>
            </div>
            {loading ? <div className="text-white/30 text-center py-12">جاري التحميل...</div> : (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">سجل المعاملات</span>
                  <span className="text-xs text-white/40">{transactions.length} معاملة</span>
                </div>
                <div className="divide-y divide-white/5">
                  {transactions.length === 0 ? <p className="text-white/30 text-center py-10">لا توجد معاملات</p> :
                    transactions.map(({ transaction: t, user }) => (
                      <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", t.type === "deposit" ? "bg-emerald-500/10" : "bg-red-500/10")}>
                            <DollarSign className={cn("h-4 w-4", t.type === "deposit" ? "text-emerald-400" : "text-red-400")} />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{user?.name || "مستخدم محذوف"}</p>
                            <p className="text-xs text-white/40">{t.note || (t.type === "deposit" ? "إيداع" : "خصم")}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={cn("text-sm font-bold", t.type === "deposit" ? "text-emerald-400" : "text-red-400")}>
                            {t.type === "deposit" ? "+" : ""}{t.amount} تحليل
                          </p>
                          <p className="text-xs text-white/30">{format(new Date(t.createdAt), "yyyy/MM/dd HH:mm")}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Button */}
      <button onClick={() => openWhatsApp(WHATSAPP_NUMBER)} className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-[#25D366] shadow-2xl shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 transition-transform z-20">
        <MessageCircle className="h-7 w-7 text-white" />
      </button>
    </div>
  );
}
