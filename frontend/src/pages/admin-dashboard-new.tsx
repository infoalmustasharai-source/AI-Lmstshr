import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  LogOut,
  Users,
  Zap,
  CreditCard,
  TrendingUp,
  Plus,
  Minus,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [_, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLocation("/admin-login");
        return;
      }

      // Load users
      const usersRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!usersRes.ok) {
        if (usersRes.status === 401 || usersRes.status === 403) {
          localStorage.removeItem("adminToken");
          setLocation("/admin-login");
        }
        return;
      }

      const usersData = await usersRes.json();
      setUsers(usersData);

      // Load transactions
      const transRes = await fetch("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addCredit = async (userId: number) => {
    if (!amount || parseInt(amount) <= 0) {
      setError("أدخل مبلغ صحيح");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/users/${userId}/credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          description: description || "إضافة رصيد يدوية",
        }),
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setSelectedUser(null);
        await loadData();
        setError("");
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const debitCredit = async (userId: number) => {
    if (!amount || parseInt(amount) <= 0) {
      setError("أدخل مبلغ صحيح");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/users/${userId}/debit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          description: description || "خصم يدوي",
        }),
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setSelectedUser(null);
        await loadData();
        setError("");
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleUserActive = async (userId: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">لوحة تحكم الأدمن</h1>
          <Button
            onClick={logout}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold mt-2">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي المعاملات</p>
                <p className="text-2xl font-bold mt-2">{transactions.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">الرصيد الإجمالي</p>
                <p className="text-2xl font-bold mt-2">
                  {users.reduce((sum, u) => sum + u.balance, 0)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold">قائمة المستخدمين</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-sm text-gray-400">
                      <th className="text-right p-4">الاسم</th>
                      <th className="text-right p-4">البريد</th>
                      <th className="text-right p-4">الرصيد</th>
                      <th className="text-right p-4">الحالة</th>
                      <th className="text-right p-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-800 hover:bg-slate-800 transition-colors"
                      >
                        <td className="p-4 text-sm">{user.name}</td>
                        <td className="p-4 text-sm">{user.email}</td>
                        <td className="p-4 text-sm font-semibold text-yellow-500">
                          {user.balance}
                        </td>
                        <td className="p-4 text-sm">
                          {user.isActive ? (
                            <span className="text-green-500">نشط</span>
                          ) : (
                            <span className="text-red-500">معطل</span>
                          )}
                        </td>
                        <td className="p-4 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                            className="border-slate-700 hover:bg-slate-700 text-xs"
                          >
                            تحكم
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 h-fit">
            <h3 className="font-bold mb-4">إدارة الرصيد</h3>

            {selectedUser ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800 rounded text-sm">
                  <p className="text-gray-400">المستخدم المختار:</p>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-yellow-500 mt-2">
                    الرصيد الحالي: {selectedUser.balance}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    المبلغ
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    الوصف (اختياري)
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="دفع يدوي..."
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => addCredit(selectedUser.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <Plus className="w-3 h-3 ml-1" />
                    إضافة
                  </Button>
                  <Button
                    onClick={() => debitCredit(selectedUser.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-xs"
                  >
                    <Minus className="w-3 h-3 ml-1" />
                    خصم
                  </Button>
                </div>

                <Button
                  onClick={() =>
                    toggleUserActive(selectedUser.id)
                  }
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800 text-xs"
                >
                  {selectedUser.isActive ? (
                    <>
                      <Lock className="w-3 h-3 ml-1" />
                      تعطيل الحساب
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 ml-1" />
                      تفعيل الحساب
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setSelectedUser(null)}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">اختر مستخدم من القائمة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
