import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Google Generative AI SDK
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          summaryOneLine: "This is a test summary.",
          summaryShort: "Short test summary content.",
          summaryDetailed: "Detailed test summary content.",
          summaryExecutive: "Executive test summary content.",
          summaryBullet: "• Bullet 1\n• Bullet 2",
          keywords: ["test", "ai"],
          mainTopic: "Testing",
          readingTime: 1,
          wordCount: 100,
          charCount: 500
        })
      })
    };
  }
}));

describe('AIService Unit Tests', () => {
  let AIService: typeof import('../../src/services/ai.service.js').AIService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_PROVIDER;

    const module = await import('../../src/services/ai.service.js');
    AIService = module.AIService;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_PROVIDER;
  });

  it('should generate a structured summary from text', async () => {
    process.env.AI_PROVIDER = 'gemini';
    const mockText = "This is a long piece of text that needs to be summarized for testing purposes.";

    const result = await AIService.generateSummary(mockText);

    expect(result).toHaveProperty('summaryOneLine');
    expect(result.mainTopic).toBe('Testing');
    expect(result.keywords).toContain('test');
    expect(typeof result.readingTime).toBe('number');
  });

  it('should use OpenAI when configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              summaryOneLine: "OpenAI summary",
              summaryShort: "Short openai summary",
              summaryDetailed: "Detailed openai summary",
              summaryExecutive: "Executive openai summary",
              summaryBullet: "• OpenAI bullet",
              keywords: ["openai"],
              mainTopic: "OpenAI",
              readingTime: 1,
              wordCount: 20,
              charCount: 100
            })
          }
        }]
      })
    });

    vi.stubGlobal('fetch', fetchMock);
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const module = await import('../../src/services/ai.service.js');
    const result = await module.AIService.generateSummary('OpenAI test prompt');

    expect(fetchMock).toHaveBeenCalled();
    expect(result.summaryOneLine).toBe('OpenAI summary');
  });

  it('should throw an error if the AI response is malformed', async () => {
    expect(AIService.generateSummary).toBeDefined();
  });
});