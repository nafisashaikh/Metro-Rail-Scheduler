/**
 * AI Knowledge Base - Comprehensive FAQ and context data for the AI assistant
 * Fallback responses when real AI API is unavailable
 */

export interface KnowledgeEntry {
  keywords: string[];
  category: string;
  response: string;
  followUp?: string[];
}

export const AI_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // Journey Planning
  {
    keywords: ['next train', 'when', 'departure', 'arriving', 'schedule'],
    category: 'Schedule',
    response:
      "I can help you find the next train! Please select your origin and destination station in the Journey Planner. I'll show you real-time departure times and estimated arrival based on current traffic patterns.",
    followUp: ['Show me peak hour trains', 'Are there express trains?', "What's the average wait time?"],
  },
  {
    keywords: ['how long', 'duration', 'travel time', 'journey time'],
    category: 'Schedule',
    response:
      'Travel time depends on your route and number of stops. Generally, short routes (3-5 stations) take 8-12 minutes, mid-range (6-10 stations) 15-20 minutes, and long routes (10+ stations) 25-35 minutes.',
    followUp: ['Show fastest route', 'Are there alternatives?'],
  },
  {
    keywords: ['peak hours', 'rush hour', 'busy', 'crowded', 'congestion'],
    category: 'Schedule',
    response:
      'Peak hours are typically 8-11 AM and 5-8 PM on weekdays. During these times, trains are more frequent but crowded. Off-peak (11 AM-5 PM, weekends) offers more comfortable journeys.',
    followUp: ['Show me off-peak times', 'Which line is less crowded?'],
  },

  // Fares & Payments
  {
    keywords: ['fare', 'price', 'cost', 'ticket', 'how much'],
    category: 'Fares',
    response:
      'Metro fares start at ₹10 for short distances and go up to ₹40-50 for long routes. Our smart card offers 10% discount on regular fares. Check the fare calculator in the app or ask for specific route pricing.',
    followUp: ['Show me fare discounts', 'How do I get a smart card?'],
  },
  {
    keywords: ['recharge', 'topup', 'prepaid', 'balance', 'card'],
    category: 'Fares',
    response:
      'You can recharge your smart card at ticket counters and online via the Digital Pass tab. Minimum recharge is ₹100. Online recharges are credited instantly and support all major payment methods.',
    followUp: ["What's the daily spending limit?", 'Can I get cash back?'],
  },
  {
    keywords: ['discount', 'offer', 'coupon', 'promo', 'savings'],
    category: 'Fares',
    response:
      'We offer monthly passes (₹1500 for unlimited travel) and student discounts (₹750/month for verified students). Occasional promotional passes are available via our Announcements section.',
    followUp: ['Am I eligible for student discount?', 'How do I buy a monthly pass?'],
  },

  // Smart Card & Digital Pass
  {
    keywords: ['smart card', 'contactless', 'tap', 'card number', 'physical card'],
    category: 'Payment Methods',
    response:
      'Our smart card is a contactless card you tap at entry/exit gates. You can also use mobile wallets (UPI, Apple Pay, Google Pay) or your digital pass from the app. Lost cards can be replaced for ₹50.',
    followUp: ['How do I link my card to my profile?', 'What if I lose my card?'],
  },
  {
    keywords: ['digital pass', 'mobile ticket', 'qr code', 'app payment'],
    category: 'Payment Methods',
    response:
      'Your Digital Pass in the app is a mobile ticket stored on your phone. Simply scan your QR code at entry gates. It works offline and is linked to your account for easy refunds and tracking.',
    followUp: ['Can I share my digital pass?', 'Is it safe?'],
  },

  // Safety & Lost & Found
  {
    keywords: ['lost', 'found', 'missing', 'item', 'bag', 'belongings', 'forgotten'],
    category: 'Lost & Found',
    response:
      "If you lost something on a train: 1) Report immediately at the Station Master's office, 2) Call our helpline or use the SOS button, 3) Provide a detailed description and train/time details. Check back after 48 hours.",
    followUp: ["What's the helpline number?", 'How long is lost & found stored?'],
  },
  {
    keywords: ['emergency', 'sos', 'help', 'security', 'alert', 'danger'],
    category: 'Safety',
    response:
      'Use the SOS button at the top of your screen or press the emergency button in any train. Our security team Is nearby and can assist within seconds. Your location is automatically shared.',
    followUp: ['How is SOS handled?', 'Is it confidential?'],
  },
  {
    keywords: ['women', 'safe', 'Ladies Coach', 'women only', 'harassment'],
    category: 'Safety',
    response:
      "Ladies Coaches are available on all trains (typically first and last coach). They're exclusively for women and children until 9 PM. Report any harassment via the SOS button or speak to staff immediately.",
    followUp: ['Where are Ladies Coaches located?', 'Can I bring a child?'],
  },

  // Stations & Routes
  {
    keywords: ['station', 'location', 'where', 'address', 'near me'],
    category: 'Stations',
    response:
      'I can show you all metro stations on the Live Map with real-time train positions. Use the search to find any station, see its facilities, and plan your journey from there.',
    followUp: ['What are station facilities?', 'Are there restrooms?'],
  },
  {
    keywords: ['route', 'line', 'blue', 'yellow', 'red', 'purple', 'network', 'map'],
    category: 'Routes',
    response:
      'We currently operate the Blue, Yellow, and Red metro lines. The Blue Line connects the central business district, Yellow Line serves the suburbs, and Red Line connects airports. View the interactive map for all stops.',
    followUp: ['Which lines intersect?', 'Show me transfer points'],
  },
  {
    keywords: ['connection', 'transfer', 'interchange', 'change', 'cross line'],
    category: 'Routes',
    response:
      "Major interchange stations allow you to switch between lines seamlessly. Follow the transfer signs, they're clearly marked. Most transfers take 3-5 minutes. Tap your card on exit and re-entry gates.",
    followUp: ['Which stations have multiple lines?', 'Do I need another ticket for transfer?'],
  },

  // Facilities & Amenities
  {
    keywords: ['toilet', 'restroom', 'bathroom', 'facilities', 'wifi'],
    category: 'Facilities',
    response:
      'Major stations provide clean restrooms, water coolers, and free WiFi. Download the station map to see facility locations. Restrooms are typically on the ground floor near the main concourse.',
    followUp: ['Are facilities wheelchair accessible?', 'Are they 24/7?'],
  },
  {
    keywords: ['wheelchair', 'accessible', 'disability', 'elderly', 'mobility'],
    category: 'Accessibility',
    response:
      'All stations have wheelchair access, elevators, and dedicated spaces on trains. Assistance is available—notify staff at the ticket counter. Priority seating is reserved for elderly, pregnant, and disabled passengers.',
    followUp: ['How do I request assistance?', 'Are guide dogs allowed?'],
  },
  {
    keywords: ['food', 'eat', 'drink', 'shop', 'store', 'vending'],
    category: 'Facilities',
    response:
      'Selected stations have food courts, vending machines, and retail shops. Eating is permitted in designated areas but not inside trains. Food outlets close by 10 PM.',
    followUp: ['Which stations have restaurants?', 'Can I carry outside food?'],
  },

  // Assistance & Support
  {
    keywords: ['help', 'support', 'issue', 'problem', 'contact', 'helpline'],
    category: 'Support',
    response:
      'Our customer support team is available 24/7 via phone, chat, or email. Use the Help Center in the app for FAQs. For urgent issues, use the SOS button. Average response time is under 5 minutes.',
    followUp: ["What's the phone number?", 'Can I email you?'],
  },
  {
    keywords: ['delayed', 'late', 'slow', 'maintenance', 'breakdown'],
    category: 'Support',
    response:
      'Check our Live Announcements for real-time delays and service updates. We perform scheduled maintenance Sundays 12-4 AM. If a train is delayed, we send notifications to affected passengers.',
    followUp: ['Am I eligible for refund?', "What's typical delay time?"],
  },
  {
    keywords: ['feedback', 'complaint', 'suggestion', 'rating', 'review'],
    category: 'Support',
    response:
      'We value your feedback! Rate your trip after journey completion or use the Feedback form in Settings. All feedback is reviewed and helps us improve our service.',
    followUp: ['How is feedback used?', 'Will I get a response?'],
  },

  // Account & Login
  {
    keywords: ['login', 'signup', 'account', 'password', 'register', 'create'],
    category: 'Account',
    response:
      'Sign up with your email or mobile number. Verification takes seconds. Once verified, you can save journeys, get personalized recommendations, and access your Digital Pass.',
    followUp: ['What info do you need?', 'Is my data secure?'],
  },
  {
    keywords: ['password', 'reset', 'forgot', 'change', 'security'],
    category: 'Account',
    response:
      "You can reset your password anytime via the login page. We'll send a secure link to your email. Use a strong password with numbers, letters, and symbols for best security.",
    followUp: ['How often should I change my password?', 'Two-factor authentication?'],
  },

  // Real-time & Live Updates
  {
    keywords: ['live', 'real time', 'current', 'now', 'update'],
    category: 'Live Data',
    response:
      'The Live Map shows real-time train positions, platform numbers, and estimated arrivals (updated every 30 seconds). Crowding indicators help you choose less-crowded trains.',
    followUp: ['Why is data delayed?', 'Can I set alerts?'],
  },
  {
    keywords: ['crowding', 'crowded', 'capacity', 'occupancy', 'full'],
    category: 'Live Data',
    response:
      'Real-time crowding indicators show train capacity (empty, moderate, crowded, full). Choose alternate trains or times to avoid crowds. Ladies Coaches are typically less crowded.',
    followUp: ['How accurate is crowding data?', 'Can I see past data?'],
  },

  // Default responses
  {
    keywords: ['hello', 'hi', 'thanks', 'bye', 'okay'],
    category: 'Greeting',
    response:
      'Thank you for traveling with us! Is there anything else I can help you with? Feel free to ask about schedules, fares, facilities, or any metro-related question. 🚇',
    followUp: [],
  },
];

/**
 * Find best matching knowledge base entries based on query
 */
export function findKnowledgeMatch(query: string): KnowledgeEntry | null {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  // Score each entry based on keyword matches
  const scored = AI_KNOWLEDGE_BASE.map((entry) => {
    const matchCount = words.filter((word) =>
      entry.keywords.some((kw) => kw.includes(word) || word.includes(kw))
    ).length;
    return { entry, score: matchCount };
  }).filter((x) => x.score > 0);

  // Return highest scoring entry, or default
  if (scored.length > 0) {
    scored.sort((a, b) => b.score - a.score);
    return scored[0].entry;
  }

  return null;
}

/**
 * System prompt for AI API calls
 */
export const AI_SYSTEM_PROMPT = `You are a helpful Mumbai Metro AI Assistant. You provide accurate, concise information about:
- Train schedules and real-time updates
- Fares, passes, and payment methods
- Station facilities and accessibility
- Safety procedures and emergency assistance
- Journey planning and route optimization
- Account and digital pass management

Be friendly, professional, and helpful. Keep responses concise (under 150 words). 
When you don't know something, suggest checking the Live Map or contacting support.
Always prioritize passenger safety and comfort.
Use relevant emojis sparingly (🚇 🚊 ℹ️ 🔔 etc).`;

/**
 * Common context to include with AI requests
 */
export interface ChatContext {
  userId?: string;
  currentStation?: string;
  selectedLine?: string;
  hasSmartCard?: boolean;
  language?: 'en' | 'hi' | 'mr';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Format context for AI system message
 */
export function formatContextForAi(context: ChatContext): string {
  const parts: string[] = [];

  if (context.currentStation) {
    parts.push(`User is currently at or near ${context.currentStation}.`);
  }
  if (context.selectedLine) {
    parts.push(`They're interested in the ${context.selectedLine} line.`);
  }
  if (context.hasSmartCard !== undefined) {
    parts.push(`Smart card status: ${context.hasSmartCard ? 'Active' : 'No card'}.`);
  }
  if (context.timeOfDay) {
    parts.push(`Current time: ${context.timeOfDay}.`);
  }

  return parts.length > 0 ? `\n\nContext: ${parts.join(' ')}` : '';
}
