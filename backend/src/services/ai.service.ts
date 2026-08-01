import { env } from "../config/env.js";
import { AppError } from "../middlewears/error.middleware.js";

// Groq is OpenAI-compatible — free tier, fast inference
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Best free Groq models (in order of preference)
// llama-3.3-70b-versatile  — best quality, supports JSON mode
// llama3-8b-8192           — fastest, lightweight
const GROQ_MODEL = "llama-3.3-70b-versatile";

export class AIService {
  private static getGroqKey(): string {
    const key = process.env.GROQ_API_KEY || env.GROQ_API_KEY;
    if (!key) {
      throw new AppError(503, "Groq API key is not configured. Set GROQ_API_KEY in your .env file.");
    }
    return key;
  }

  private static async callGroq(
    prompt: string,
    jsonResponse: boolean
  ): Promise<string> {
    const apiKey = this.getGroqKey();

    let response: Response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: jsonResponse
                ? "You are an expert AI text summarizer. Return ONLY valid JSON with no markdown, no code fences, no extra text."
                : "You are a helpful AI assistant. Answer using the provided context only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2048,
          ...(jsonResponse
            ? { response_format: { type: "json_object" } }
            : {}),
        }),
      });
    } catch (networkError) {
      console.error("Groq network error:", networkError);
      throw new AppError(
        503,
        "Could not reach Groq API. Check your internet connection."
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Groq API Error [${response.status}]:`, errorBody);

      if (response.status === 401) {
        throw new AppError(503, "Groq API key is invalid or unauthorized.");
      }
      if (response.status === 429) {
        throw new AppError(
          503,
          "Groq rate limit reached. Please wait a moment and try again."
        );
      }
      if (response.status === 400) {
        throw new AppError(400, `Groq bad request: ${errorBody}`);
      }
      throw new AppError(503, `Groq API returned status ${response.status}.`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message: string };
    };

    if (data.error) {
      console.error("Groq response error:", data.error);
      throw new AppError(503, `Groq error: ${data.error.message}`);
    }

    return data.choices?.[0]?.message?.content ?? "";
  }

  static async generateSummary(text: string) {
    const prompt = `
You are an expert AI text summarizer.

Analyze the following text and return ONLY a valid JSON object (no markdown, no code fences, no extra text).

Required JSON format:
{
  "summaryOneLine": "one sentence summary",
  "summaryShort": "2-3 sentence summary",
  "summaryDetailed": "detailed paragraph summary",
  "summaryExecutive": "executive summary for decision makers",
  "summaryBullet": "• bullet point 1\n• bullet point 2\n• bullet point 3",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "mainTopic": "main topic of the text",
  "readingTime": 5,
  "wordCount": 1000,
  "charCount": 5000
}

TEXT TO SUMMARIZE:

${text}
`;

    const result = await this.callGroq(prompt, true);

    if (!result) {
      throw new AppError(500, "Empty response received from Groq.");
    }

    try {
      const cleanedJson = result
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON parse error. Raw Groq response:", result);
      throw new AppError(
        500,
        "Groq returned an invalid JSON response. Please try again."
      );
    }
  }

  static async askQuestion(
    context: string,
    question: string
  ): Promise<string> {
    const prompt = `
You are an AI assistant.

Answer ONLY using the provided context below. Do not use external knowledge.

Context:
${context}

Question:
${question}

If the answer is not found in the context, respond exactly with:
"I couldn't find that information in the provided text."
`;

    return this.callGroq(prompt, false);
  }
}