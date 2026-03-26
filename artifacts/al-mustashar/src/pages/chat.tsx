import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  Send,
  Paperclip,
  X,
  Menu,
  Trash2,
  Settings,
  ChevronDown,
  FileText,
  ImageIcon,
  StopCircle,
  Sparkles,
  Zap,
  BarChart2,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  useListOpenaiConversations,
  useGetOpenaiConversation,
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  useHealthCheck,
  getGetOpenaiConversationQueryKey,
  getListOpenaiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useUsage } from "@/hooks/use-usage";
import { PricingModal } from "@/components/pricing-modal";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: BarChart2, label: "تحليل بيانات", text: "ساعدني في تحليل مجموعة من البيانات" },
  { icon: FileText, label: "تلخيص مستند", text: "لدي مستند أريد تلخيصه وتحليله" },
  { icon: MessageSquare, label: "مشورة احترافية", text: "أحتاج مشورة احترافية حول موضوع معين" },
  { icon: Sparkles, label: "توليد أفكار", text: "ساعدني في توليد أفكار إبداعية لمشروعي" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
      title="نسخ"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canAnalyze, remaining, isLimitReached, incrementUsage, usage, FREE_LIMIT } = useUsage();

  const { data: health } = useHealthCheck();
  const isOnline = health?.status === "ok";

  const { data: conversations, isLoading: loadingConversations } = useListOpenaiConversations();
  const { data: currentChat } = useGetOpenaiConversation(currentChatId!, {
    query: { enabled: !!currentChatId },
  });
  const createChat = useCreateOpenaiConversation();
  const deleteChat = useDeleteOpenaiConversation();
  const { sendMessage, isStreaming, streamingContent, stopStreaming } = useChatStream(currentChatId);

  useEffect(() => {
    if (conversations && !currentChatId) {
      if (conversations.length > 0) {
        setCurrentChatId(conversations[0].id);
      } else if (!createChat.isPending && conversations.length === 0) {
        handleNewChat();
      }
    }
  }, [conversations, currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages, streamingContent]);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await createChat.mutateAsync({ data: { title: "محادثة جديدة" } });
      setCurrentChatId(res.id);
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch {}
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteChat.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    if (currentChatId === id) setCurrentChatId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canAnalyze) {
      setShowPricing(true);
      return;
    }

    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, quickText?: string) => {
    e?.preventDefault();
    const text = quickText || inputValue.trim();
    if ((!text && !attachedFile) || isStreaming || !currentChatId) return;

    if (attachedFile && !canAnalyze) {
      setShowPricing(true);
      return;
    }

    const file = attachedFile;
    setInputValue("");
    setAttachedFile(null);
    setFilePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userContent = text || (file ? `تحليل الملف: ${file.name}` : "");

    let displayContent = userContent;
    if (file) {
      displayContent = `📎 ${file.name}\n\n${userContent}`;
    }

    const tempMsg = {
      id: Date.now(),
      conversationId: currentChatId,
      role: "user",
      content: displayContent,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(getGetOpenaiConversationQueryKey(currentChatId), (old: any) => ({
      ...old,
      messages: [...(old?.messages || []), tempMsg],
    }));

    if (file) incrementUsage();

    await sendMessage(
      userContent,
      () => queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(currentChatId) }),
      (err) => console.error("Chat error", err),
      file
    );
  }, [inputValue, attachedFile, isStreaming, currentChatId, canAnalyze, incrementUsage, sendMessage]);

  const allMessages = currentChat?.messages || [];
  const hasMessages = allMessages.length > 0 || isStreaming;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const planLabel = usage.plan !== "free"
    ? { basic: "الأساسي", pro: "الاحترافي", enterprise: "المؤسسي" }[usage.plan]
    : null;

  const SidebarContent = (
    <div className="flex h-full flex-col gap-1 p-2">
      <div className="mb-1">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <Plus className="h-4 w-4" />
          محادثة جديدة
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loadingConversations ? (
          <div className="px-3 py-2 text-xs text-white/30">جاري التحميل...</div>
        ) : conversations?.length === 0 ? (
          <div className="px-3 py-2 text-xs text-white/30">لا توجد محادثات</div>
        ) : (
          <div className="space-y-0.5">
            {conversations?.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all",
                  currentChatId === chat.id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <span className="truncate text-start">{chat.title || "محادثة"}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-red-400 transition-all mr-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-2 space-y-0.5">
        {usage.plan === "free" && (
          <button
            onClick={() => setShowPricing(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
          >
            <Zap className="h-4 w-4" />
            <span className="truncate">
              {remaining > 0 ? `${remaining} تحليل مجاني متبقي` : "ترقية الباقة"}
            </span>
          </button>
        )}
        {planLabel && (
          <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-violet-400/70">
            <Sparkles className="h-4 w-4" />
            <span>باقة {planLabel}</span>
          </div>
        )}
        <Link
          href="/admin-login"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/60 transition-all"
        >
          <Settings className="h-4 w-4" />
          لوحة التحكم
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f]">
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 z-50 h-full w-[260px] bg-[#171717] border-l border-white/5 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-sm font-semibold text-white">المحادثات</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {SidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] h-full shrink-0 flex-col bg-[#171717] border-l border-white/5">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">المستشار AI</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {SidebarContent}
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col relative h-full overflow-hidden">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">المستشار AI</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors group">
              <span className="text-sm font-medium text-white/70 group-hover:text-white">المستشار AI Pro</span>
              <ChevronDown className="h-4 w-4 text-white/30" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-emerald-400" : "bg-red-400")} />
              <span className="text-[10px] text-white/30 hidden sm:block">{isOnline ? "متصل" : "غير متصل"}</span>
            </div>
            {usage.plan === "free" && remaining > 0 && (
              <button
                onClick={() => setShowPricing(true)}
                className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full transition-colors"
              >
                <Zap className="h-3 w-3" />
                {remaining} تحليل مجاني
              </button>
            )}
            {isLimitReached && (
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs px-3 py-1 rounded-full transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                ترقية
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-4 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg w-full"
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mb-5 shadow-2xl shadow-violet-500/20">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">كيف يمكنني مساعدتك؟</h1>
                <p className="text-white/40 text-sm mb-8">
                  مساعدك الذكي لتحليل البيانات، تلخيص المستندات، والمشورة الاحترافية
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {QUICK_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.label}
                        onClick={() => handleSubmit(undefined, prompt.text)}
                        className="flex items-start gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 p-4 text-right transition-all group"
                      >
                        <Icon className="h-5 w-5 text-white/40 group-hover:text-white/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white/70 group-hover:text-white/90">{prompt.label}</p>
                          <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{prompt.text}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="py-6 px-4">
              <div className="max-w-2xl mx-auto space-y-1">
                {allMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i < 3 ? i * 0.04 : 0 }}
                    className={cn("flex gap-3 py-3 group", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className={cn("max-w-[80%]", msg.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-white/10 text-white rounded-tr-sm"
                            : "text-white/85 rounded-tl-sm"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1 px-1">
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white/60">
                        أ
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming */}
                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 py-3 justify-start"
                  >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="max-w-[80%]">
                      {streamingContent ? (
                        <div className="text-white/85 text-sm leading-relaxed">
                          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                          </div>
                          <span className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-violet-400 rounded-sm animate-pulse" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 h-7">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Limit warning */}
        {isLimitReached && (
          <div className="shrink-0 px-4 pb-2">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-amber-300/80 text-xs flex-1">
                  لقد استخدمت تحليلاتك المجانية الـ{FREE_LIMIT}. يمكنك مواصلة المحادثة النصية أو
                </span>
                <button
                  onClick={() => setShowPricing(true)}
                  className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors shrink-0"
                >
                  الترقية الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="max-w-2xl mx-auto">
            {/* File Preview */}
            <AnimatePresence>
              {attachedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2"
                >
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    {filePreview ? (
                      <img src={filePreview} alt="preview" className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white/50">
                        {getFileIcon(attachedFile)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{attachedFile.name}</p>
                      <p className="text-xs text-white/30">{formatFileSize(attachedFile.size)}</p>
                    </div>
                    <button
                      onClick={removeAttachment}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="relative flex items-end gap-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 focus-within:border-white/20 transition-colors shadow-lg">
                {/* Attach button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isLimitReached) { setShowPricing(true); return; }
                    fileInputRef.current?.click();
                  }}
                  className={cn(
                    "p-2 rounded-xl transition-all shrink-0 mb-0.5",
                    isLimitReached
                      ? "text-white/20 cursor-pointer hover:bg-amber-500/10 hover:text-amber-400"
                      : "text-white/40 hover:bg-white/10 hover:text-white/70"
                  )}
                  title={isLimitReached ? "ترقية للرفع" : "إرفاق ملف"}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.txt,.csv,.json,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); autoResize(); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                  }}
                  placeholder="اكتب رسالتك أو أرفق ملفاً للتحليل..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none resize-none py-2 px-1 min-h-[40px] max-h-[200px]"
                  dir="rtl"
                  rows={1}
                  disabled={isStreaming}
                />

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-all shrink-0 mb-0.5"
                  >
                    <StopCircle className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={(!inputValue.trim() && !attachedFile) || !currentChatId}
                    className="p-2 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed transition-all shrink-0 mb-0.5"
                  >
                    <Send className="h-5 w-5 rtl:rotate-180" />
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-[11px] text-white/20 mt-2">
              المستشار AI · قد تحتوي الإجابات على أخطاء، يرجى التحقق من المعلومات المهمة
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
