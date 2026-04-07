import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MapPin, Clock, CreditCard, ShieldAlert } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Next Train', icon: Clock, query: 'When is the next train to Andheri?' },
  { label: 'Fare Info', icon: CreditCard, query: 'How do I recharge my smart card?' },
  { label: 'Lost & Found', icon: ShieldAlert, query: 'I lost my bag on a train. What to do?' },
  { label: 'Routes', icon: MapPin, query: 'Show me the route to Mumbai Central.' },
];

export function AiHelpDesk() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Namaste! I am your Metro AI Assistant. How can I help you navigate the Mumbai Metro today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "I'm still learning about that specific request. For live updates, please check the 'Live Map' or 'Announcements' tab above! Is there anything else I can help with?";
      
      const lowQuery = text.toLowerCase();
      if (lowQuery.includes('next train') || lowQuery.includes('when')) {
        response = "The next train depends on your current station. Please select a station in the 'Journey Planner' for live departure times. Usually, trains run every 4-8 minutes during peak hours.";
      } else if (lowQuery.includes('card') || lowQuery.includes('recharge') || lowQuery.includes('fare')) {
        response = "You can recharge your Smart Card at any ticket counter or via your 'Digital Pass' tab if you have a linked bank account. Fares start at just ₹10!";
      } else if (lowQuery.includes('lost') || lowQuery.includes('bag')) {
        response = "Please visit the Station Master's office at your nearest station immediately, or use the SOS button at the top to alert our security staff.";
      } else if (lowQuery.includes('route') || lowQuery.includes('map')) {
        response = "You can see the full system map in the 'Live Map' tab. We currently serve the Blue, Yellow, and Red metro lines!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Metro AI Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Online · Ready to help</span>
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
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${m.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-1.5 rounded-full ${m.type === 'bot' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {m.type === 'bot' ? <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                m.type === 'bot' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                  : 'bg-blue-600 text-white rounded-tr-none'
              }`}>
                {m.text}
                <p className={`text-[9px] mt-1 opacity-50 ${m.type === 'user' ? 'text-right' : ''}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input / Suggestions */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleSend(action.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 rounded-full transition-colors text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                {action.label}
              </button>
            );
          })}
        </div>
        <form 
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
