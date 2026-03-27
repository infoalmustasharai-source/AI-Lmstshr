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
  Loader,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getChats,
  createChat,
  sendMessage,
  getChat,
  getPersonalities,
  getCurrentUser,
} from "@/lib/api";

interface Chat {
  id: number;
  user_id: number;
  title: string;
  personality: string;
  created_at: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Personality {
  id: string;
  nameAr: string;
  emoji: string;
  descriptionAr: string;
}

export default function ChatPage() {
  const [_, setLocation] = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("");
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLocation("/login");
          return;
        }

        const user = await getCurrentUser();
        setUserName(user.name);
        setBalance(user.balance);

        const pers = await getPersonalities();
        setPersonalities(pers.personalities);

        const chatsData = await getChats();
        setChats(chatsData.chats || []);
      } catch (error) {
        console.error("Error loading user data:", error);
        localStorage.removeItem("token");
        setLocation("/login");
      }
    };

    loadUserData();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = async (personalityId: string) => {
    try {
      setLoading(true);
      const response = await createChat(personalityId);
      const newChat: Chat = {
        id: response.chatId,
        user_id: 0,
        title: personalities.find((p) => p.id === personalityId)?.nameAr || "محادثة جديدة",
        personality: personalityId,
        created_at: new Date().toISOString(),
      };
      setChats([newChat, ...chats]);
      setCurrentChat(newChat);
      setMessages([]);
      setShowPersonalityModal(false);
    } catch (error) {
      alert("خطأ في إنشاء المحادثة");
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (chat: Chat) => {
    try {
      setLoading(true);
      const data = await getChat(chat.id);
      setCurrentChat(chat);
      setMessages(data.messages || []);
    } catch (error) {
      alert("خطأ في تحميل المحادثة");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChat || loading) return;

    const userMessage: Message = {
      id: -1,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(currentChat.id, input);
      const assistantMessage: Message = {
        id: -2,
        role: "assistant",
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages([...messages, userMessage, assistantMessage]);
      setBalance(response.creditsRemaining || balance - 10);
    } catch (error) {
      alert("خطأ في إرسال الرسالة");
      setMessages([...messages]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: number) => {
    setChats(chats.filter((c) => c.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
  };

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div
        className={`fixed inset-0 top-0 right-0 w-64 h-screen bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 z-50 md:relative md:inset-auto ${
          menuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex-shrink-0">
          <Button
            onClick={() => setShowPersonalityModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center justify-center gap-2 rounded-lg font-semibold"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </Button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">لا توجد محادثات</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                  currentChat?.id === chat.id
                    ? "bg-purple-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                onClick={() => loadChat(chat)}
              >
                <span className="text-sm truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 flex-shrink-0">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">حساب:</p>
            <p className="text-sm font-semibold">{userName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-800 p-2 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>رصيد: {balance}</span>
          </div>
          <Button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={() => setMenuOpen(false)}
          className="md:hidden absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat ? (
            <>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageSquare className="w-12 h-12 text-purple-500 mb-4 opacity-50" />
                  <p className="text-gray-400">ابدأ محادثة</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-slate-800 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1">{new Date(msg.created_at).toLocaleTimeString("ar-SA")}</p>
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(idx, msg.content)}
                      className="ml-2 text-gray-500 hover:text-gray-300"
                    >
                      {copiedId === idx ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="bg-slate-800 rounded-bl-lg rounded-tl-lg rounded-tr-none px-4 py-2 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">جاري الكتابة...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>اختر محادثة أو أنشئ واحدة جديدة</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentChat && (
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                disabled={loading}
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">الرصيد المتبقي: {balance}</p>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed bottom-6 left-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full z-40"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Personality Modal */}
      {showPersonalityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">اختر شخصية قانونية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => createNewChat(personality.id)}
                  disabled={loading}
                  className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 transition-colors text-right disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{personality.emoji}</span>
                    <div>
                      <p className="font-semibold text-white">{personality.nameAr}</p>
                      <p className="text-xs text-gray-400 mt-1">{personality.descriptionAr}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPersonalityModal(false)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
