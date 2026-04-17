import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/ai/chat
 * AI chat endpoint - currently uses knowledge base fallback
 * Can be extended to use OpenAI, Claude, or other AI APIs
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      ),
      systemPrompt: z.string().optional(),
    });

    const { messages, systemPrompt } = schema.parse(req.body);

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    // Extract the user query
    const userQuery = lastMessage.content;

    // TODO: Integrate with real AI API here
    // Example: OpenAI, Claude, Hugging Face, etc.
    // For now, we'll return a placeholder indicating the backend is ready

    // Simulate AI processing (in production, call actual AI service)
    const response = await generateAiResponse(userQuery, messages, systemPrompt);

    res.json({
      response,
      model: 'fallback-knowledge-base',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate AI response (placeholder for real AI integration)
 * In production, replace with actual AI API call
 */
async function generateAiResponse(
  userQuery: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
): Promise<string> {
  // Placeholder response
  // In production, this would call:
  // - OpenAI API (GPT-3.5, GPT-4)
  // - Anthropic Claude API
  // - Google PaLM API
  // - HuggingFace Inference API
  // - Custom trained model

  const context = extractContext(userQuery, messages);

  // For now, return a knowledge-base aware response
  return `I'm currently in fallback mode. In production, this would use real AI to answer: "${userQuery}". ${
    context ? `Context: ${context}` : ''
  }`;
}

/**
 * Extract context from conversation
 */
function extractContext(
  userQuery: string,
  messages: Array<{ role: string; content: string }>
): string {
  // Analyze conversation history for context
  const conversationLength = messages.length;
  const hasMultipleTurns = conversationLength > 2;

  if (hasMultipleTurns) {
    const previousMessages = messages.slice(-3, -1);
    const topics = previousMessages.map((m) => extractTopics(m.content));
    return `Multi-turn conversation about: ${topics.join(', ')}`;
  }

  return '';
}

/**
 * Extract topics from a message
 */
function extractTopics(message: string): string {
  const topicKeywords = ['train', 'fare', 'ticket', 'schedule', 'station', 'line', 'route'];
  const found = topicKeywords.filter((kw) => message.toLowerCase().includes(kw));
  return found.length > 0 ? found[0] : 'general inquiry';
}

export default router;
