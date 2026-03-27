// OpenAI Integration for Legal AI

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string = "https://api.openai.com/v1";
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    if (!this.apiKey) {
      console.warn("⚠️ OPENAI_API_KEY not set - AI features will be limited");
    }
  }

  async chat(messages: AIMessage[], personalityPrompt: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackResponse();
    }

    try {
      const systemMessage: AIMessage = {
        role: "system",
        content: personalityPrompt,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        return this.getFallbackResponse();
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content || this.getFallbackResponse();
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): string {
    return "عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.";
  }

  async analyzeDocument(text: string): Promise<string> {
    if (!this.apiKey) return this.getFallbackResponse();

    const messages: AIMessage[] = [
      {
        role: "user",
        content: `Please analyze this legal document and provide a summary:\n\n${text.substring(0, 4000)}`,
      },
    ];

    return this.chat(messages, "You are a legal document analyzer. Provide clear, concise analysis.");
  }
}

export const openaiClient = new OpenAIClient();
