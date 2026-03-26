import { useState, useRef, useCallback } from "react";

export function useChatStream(conversationId: number | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    content: string,
    onComplete: (fullText: string) => void,
    onError: (err: any) => void,
    file?: File | null
  ) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setStreamingContent("");

    abortControllerRef.current = new AbortController();

    try {
      let requestInit: RequestInit;

      if (file) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("file", file);
        requestInit = {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        };
      } else {
        requestInit = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
          signal: abortControllerRef.current.signal,
        };
      }

      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        ...requestInit,
      });

      if (!response.ok) throw new Error("فشل في إرسال الرسالة");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data: ")) continue;
          const dataStr = trimmedLine.slice(6).trim();
          if (!dataStr || dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.done) {
              setIsStreaming(false);
              onComplete(fullContent);
              return;
            }
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
          } catch (e) {
            console.error("Failed to parse SSE chunk", e, dataStr);
          }
        }
      }

      setIsStreaming(false);
      onComplete(fullContent);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setIsStreaming(false);
        onError(error);
      }
    }
  }, [conversationId]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return { sendMessage, isStreaming, streamingContent, stopStreaming };
}
