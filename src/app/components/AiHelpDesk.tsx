import { useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import { useAiChat, getSmartSuggestions } from '../hooks/useAiChat';
import { ChatContext } from '../data/aiKnowledgeBase';

interface AiHelpDeskProps {
  context?: ChatContext;
  useRealAi?: boolean;
}

export function AiHelpDesk({ context, useRealAi = false }: AiHelpDeskProps) {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAiChat({
    context,
    useRealAi,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting if no messages
  useEffect(() => {
    if (messages.length === 0) {
      // Send initial greeting
      sendMessage('Hello');
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text?: string) => {
    const messageText = text || inputRef.current?.value || '';
    if (messageText.trim()) {
      sendMessage(messageText);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Get context-aware suggestions
  const suggestions = getSmartSuggestions(context);

  const quickActions = [
    { label: suggestions[0].label, query: suggestions[0].query, icon: suggestions[0].icon },
    { label: suggestions[1].label, query: suggestions[1].query, icon: suggestions[1].icon },
    { label: suggestions[2].label, query: suggestions[2].query, icon: suggestions[2].icon },
  ];

  if (suggestions.length > 3) {
    quickActions.push({
      label: suggestions[3].label,
      query: suggestions[3].query,
      icon: suggestions[3].icon,
    });
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Metro AI Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isLoading ? 'Processing...' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" /> AI Powered
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Bot className="w-12 h-12 text-blue-300 mx-auto mb-2 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Start a conversation...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`p-1.5 rounded-full ${
                      msg.type === 'bot'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {msg.type === 'bot' ? (
                      <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                      msg.type === 'bot'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                    <p
                      className={`text-[9px] mt-1.5 opacity-50 ${
                        msg.type === 'user' ? 'text-right' : ''
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <span
                    className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600 rounded-full transition-colors text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              <span className="text-base">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                handleSend();
              }
            }}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => clearHistory()}
            disabled={isLoading || messages.length === 0}
            title="Clear conversation history"
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
