import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Send,
  Menu,
  Trash2,
  LogOut,
  Zap,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: number;
  title: string;
  personaType: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const PERSONAS = [
  { id: "defense-lawyer", name: "محامي الدفاع", icon: "⚖️" },
  { id: "legal-analyst", name: "المحلل القانوني", icon: "📋" },
  { id: "judge-vision", name: "رؤية القاضي", icon: "👨‍⚖️" },
  { id: "quick-consultation", name: "استشارة سريعة", icon: "⚡" },
  { id: "smart-mufti", name: "المختار الذكي", icon: "📖" },
];

export default function ChatPage() {
  const [_, setLocation] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showPersonas, setShowPersonas] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user data and conversations
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLocation("/login");
          return;
        }

        const userResponse = await fetch("/api/auth/me", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          setLocation("/login");
          return;
        }

        const userData = await userResponse.json();
        setBalance(userData.user.balance);

        const convResponse = await fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (convResponse.ok) {
          const convData = await convResponse.json();
          setConversations(convData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = async (personaType: string) => {
    try {
      const token = localStorage.getItem("token");
      const title =
        PERSONAS.find((p) => p.id === personaType)?.name || "محادثة جديدة";

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, personaType }),
      });

      if (response.ok) {
        const newConv = await response.json();
        setConversations([...conversations, newConv]);
        setCurrentConv(newConv);
        setMessages([]);
        setShowPersonas(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadConversation = async (conv: Conversation) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/conversations/${conv.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConv(conv);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const addMessage = async (conversationId: number, content: string) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setMessages([
        ...messages,
        data.userMessage,
        data.aiMessage,
      ]);
      setBalance(data.newBalance);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConv?.id === id) {
        setCurrentConv(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
  };

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-slate-900 border-l border-slate-800 flex flex-col transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <Button
            onClick={() => setShowPersonas(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                currentConv?.id === conv.id
                  ? "bg-purple-600"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => loadConversation(conv)}
            >
              <span className="text-sm truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4" />
            <span>الرصيد: {balance}</span>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:mr-64 transition-all">
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-semibold">
            {currentConv?.title || "المستشار الذكي"}
          </h1>
          <div className="w-8" />
        </div>

        {/* Messages Area */}
        {currentConv ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <p>ابدأ محادثتك مع {currentConv.title}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-bl-2xl"
                        : "bg-slate-800 text-gray-100 rounded-br-2xl"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">اختر محادثة أو أنشئ واحدة جديدة</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        {currentConv && (
          <div className="border-t border-slate-800 p-4 bg-slate-900/50 backdrop-blur">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !loading && input.trim()) {
                    addMessage(currentConv.id, input);
                  }
                }}
                placeholder="اكتب رسالتك..."
                disabled={loading}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={() => {
                  if (input.trim()) {
                    addMessage(currentConv.id, input);
                  }
                }}
                disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {balance < 10 && (
              <p className="text-xs text-yellow-500 mt-2">
                ⚠️ رصيدك منخفض ({balance} نقاط)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Personas Modal */}
      {showPersonas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">اختر شخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => createConversation(persona.id)}
                  className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-2xl">{persona.icon}</span>
                  <p className="font-semibold mt-2">{persona.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
