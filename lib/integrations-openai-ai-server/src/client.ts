import OpenAI from "openai";

const openaiApiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openaiBaseURL =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

let openai: any;

if (!openaiApiKey || openaiApiKey.startsWith("sk-temp") || openaiApiKey.startsWith("sk-proj-temp")) {
  console.warn("⚠️  OpenAI API key not set or using placeholder. AI features will not work. Set a real OPENAI_API_KEY for full functionality.");
  // Create a mock client for testing
  openai = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: "⚠️ OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables." } }]
        })
      }
    }
  };
} else {
  openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: openaiBaseURL,
  });
}

export { openai };
