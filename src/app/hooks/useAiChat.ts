import { useState, useCallback } from 'react';
import {
  AI_SYSTEM_PROMPT,
  findKnowledgeMatch,
  formatContextForAi,
  ChatContext,
} from '../data/aiKnowledgeBase';
import { apiUrl } from '../config/api';

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
  sources?: 'ai' | 'knowledge-base';
}

interface UseAiChatOptions {
  context?: ChatContext;
  useRealAi?: boolean;
}

export function useAiChat(options: UseAiChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Try real AI API first (if enabled)
      if (options.useRealAi === true) {
        const aiResponse = await fetchAiResponse(userInput, messages, options.context);
        if (aiResponse) {
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: aiResponse.text,
            timestamp: new Date(),
            sources: 'ai',
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to knowledge base
      const botResponse = getFallbackResponse(userInput);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
        sources: 'knowledge-base',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to process your request. Please try again.';
      setError(message);

      // Use knowledge base as final fallback
      const botResponse = getFallbackResponse(userInput);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
        sources: 'knowledge-base',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
}

/**
 * Fetch response from AI API
 */
async function fetchAiResponse(
  userInput: string,
  history: ChatMessage[],
  context?: ChatContext
): Promise<{ text: string } | null> {
  try {
    // Check if AI endpoint is available
    const endpoint = apiUrl('/api/ai/chat');

    // Build conversation history
    const conversationHistory = history.map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    conversationHistory.push({
      role: 'user',
      content: userInput,
    });

    // Add context information to system prompt
    const systemPrompt = AI_SYSTEM_PROMPT + (context ? formatContextForAi(context) : '');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory,
        systemPrompt,
      }),
    });

    if (!response.ok) {
      console.warn('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return { text: data.response || data.message };
  } catch (err) {
    console.warn('Failed to fetch AI response:', err);
    return null;
  }
}

/**
 * Get response from knowledge base
 */
function getFallbackResponse(query: string): string {
  const match = findKnowledgeMatch(query);

  if (match) {
    let response = match.response;

    // Add follow-up suggestions
    if (match.followUp && match.followUp.length > 0) {
      response += '\n\n💡 You might also want to know:';
      match.followUp.forEach((suggestion) => {
        response += `\n• ${suggestion}`;
      });
    }

    return response;
  }

  // Default response when no match found
  return (
    "I'm still learning about that specific request. Here are some things I can help with:\n" +
    '• Journey planning & schedules\n' +
    '• Fares & payment methods\n' +
    '• Station facilities & accessibility\n' +
    '• Safety & emergency help\n' +
    '• Lost & found assistance\n\n' +
    'Or feel free to contact our support team for personalized help! 📞'
  );
}

/**
 * Get suggestion prompts for quick actions
 */
export function getSmartSuggestions(context?: ChatContext): Array<{
  label: string;
  query: string;
  icon: string;
}> {
  const suggestions = [
    { label: 'Next Train', query: 'When is the next train?', icon: '🕐' },
    { label: 'Fare Info', query: 'How much are the fares?', icon: '💰' },
    { label: 'Station Help', query: 'What facilities are available?', icon: 'ℹ️' },
  ];

  // Add context-specific suggestions
  if (context?.timeOfDay === 'morning' || context?.timeOfDay === 'evening') {
    suggestions.unshift({
      label: 'Peak Hour Info',
      query: 'Is it peak hour? How crowded are the trains?',
      icon: '🔴',
    });
  }

  if (!context?.hasSmartCard) {
    suggestions.push({
      label: 'Payment Methods',
      query: 'How do I pay without a smart card?',
      icon: '💳',
    });
  }

  return suggestions;
}
