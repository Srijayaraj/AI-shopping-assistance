import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product, Order, FilterState } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { MessageSquare, X, Send, Sparkles, ShoppingCart, ArrowRightLeft, User, Eye, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatBotProps {
  currentProduct?: Product | null;
  cart: any[];
  orders: Order[];
  onActionTriggered: (actionType: string, payload: any) => void;
  onAddToCartDirect: (product: Product) => void;
  onNavigateDirect: (screen: string, productId?: string) => void;
  darkMode: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  currentProduct,
  cart,
  orders,
  onActionTriggered,
  onAddToCartDirect,
  onNavigateDirect,
  darkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm **Aria**, your AI shopping assistant. 🌟\n\nI can recommend products, summarize customer reviews, compare items side-by-side, check your orders, or even apply filters for you!\n\nWhat are you shopping for today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { text: 'Phones under ₹20,000', label: '📱 Budget Phones' },
    { text: 'Compare iPhone 15 and Galaxy S24', label: '⚔️ Compare Flagships' },
    { text: 'Summarize reviews for MacBook Air', label: '📝 MacBook Reviews' },
    { text: 'Where is my order ORD-12345?', label: '📦 Track Order' },
    { text: 'Are there any discount coupon codes?', label: '🎟️ Promo Codes' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages, isTyping]);

  // Handle preset suggestion click
  const handleSuggestionClick = (query: string) => {
    sendMessage(query);
  };

  // Main sendMessage function calling backend server API
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build request context payload
      const chatPayload = {
        messages: [...messages, userMsg].map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        currentProduct: currentProduct || null,
        cart: cart.map((item) => ({ productId: item.product.id, title: item.product.title, qty: item.quantity })),
        orders: orders,
        catalog: MOCK_PRODUCTS,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI assistant. Please try again.');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: data.text || "Sorry, I couldn't compute a proper response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: data.products ? MOCK_PRODUCTS.filter((p) => data.products.some((dp: any) => dp.id === p.id)) : [],
        action: data.action || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If action is returned, trigger client-side callback to alter App UI!
      if (assistantMsg.action) {
        onActionTriggered(assistantMsg.action.type, assistantMsg.action.payload);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'system',
          text: `⚠️ **Aria's Connection Error:** ${err.message || 'Server timeout.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chatbot-panel"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[360px] sm:w-[410px] h-[550px] sm:h-[620px] bg-white dark:bg-[#090d2e]/95 dark:backdrop-blur-md rounded-3xl border border-zinc-100 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden mb-4 mr-0"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900/90 dark:to-indigo-850/90 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs">
                  <Sparkles className="w-5 h-5 text-amber-300 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5 leading-none">
                    Aria
                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  </h3>
                  <span className="text-[10px] opacity-80 font-medium">Core AI Shopping Concierge</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {currentProduct && (
                  <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-bold max-w-[120px] truncate" title={`Answering about: ${currentProduct.title}`}>
                    Context: {currentProduct.title.split('(')[0]}
                  </span>
                )}
                <button
                  id="close-chatbot-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-zinc-50 dark:bg-slate-950/60 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  id={`chat-bubble-${msg.id}`}
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                >
                  {/* Sender Name */}
                  <span className={`text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-0.5 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.sender === 'user' ? 'You' : msg.sender === 'assistant' ? 'Aria' : 'System'}
                  </span>

                  {/* Bubble content */}
                  <div
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs whitespace-pre-line border ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white border-indigo-600 rounded-tr-none'
                        : msg.sender === 'system'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 rounded-tl-none dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300'
                        : 'bg-white dark:bg-slate-900 border-zinc-100 dark:border-slate-800 text-zinc-800 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* Render basic custom bold markdown replacement */}
                    {msg.text.split('**').map((part, index) => (index % 2 === 1 ? <strong key={index} className="font-extrabold">{part}</strong> : part))}
                  </div>

                  {/* Inline product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                        Recommended products:
                      </span>
                      <div className="flex flex-col gap-2">
                        {msg.products.map((p) => (
                          <div
                            id={`chat-inline-product-${p.id}`}
                            key={p.id}
                            className="flex gap-2.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-2 rounded-xl shadow-xs"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow min-w-0">
                              <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => { onNavigateDirect('product', p.id); setIsOpen(false); }}>
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                                  ★ {p.rating}
                                </span>
                              </div>
                              {/* Buttons inside bubble */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <button
                                  id={`chat-view-btn-${p.id}`}
                                  onClick={() => { onNavigateDirect('product', p.id); setIsOpen(false); }}
                                  className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  View
                                </button>
                                <button
                                  id={`chat-add-to-cart-btn-${p.id}`}
                                  onClick={() => onAddToCartDirect(p)}
                                  className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  <ShoppingCart className="w-2.5 h-2.5" />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions indicator in message */}
                  {msg.action && (
                    <div className="mt-1.5 pl-1 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      App auto-triggered: <span className="underline">{msg.action.type.replace('_', ' ')}</span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className={`text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col max-w-[85%] self-start">
                  <span className="text-[9px] font-bold text-zinc-400 mb-0.5 px-1">Aria</span>
                  <div className="bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex items-center gap-1 rounded-tl-none">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips Panel */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-slate-950 border-t border-zinc-100 dark:border-slate-800 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
              {suggestionChips.map((chip, i) => (
                <button
                  id={`chip-suggestion-${i}`}
                  key={i}
                  onClick={() => handleSuggestionClick(chip.text)}
                  className="text-[10px] font-bold text-zinc-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-zinc-200 dark:bg-slate-900 dark:border-slate-800 dark:text-zinc-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-zinc-150 dark:border-slate-800 flex gap-2 shrink-0">
              <input
                id="chatbot-msg-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentProduct ? `Ask about "${currentProduct.title.split('(')[0]}"...` : "Type a query or ask to recommend products..."}
                className="flex-grow px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium"
              />
              <button
                id="chatbot-send-btn"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        id="chatbot-toggle-floating-btn"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 group relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="msg-icon"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out font-black text-xs hidden sm:inline whitespace-nowrap">
                Talk to Aria
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse element on closed floating button */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-zinc-900" />
        )}
      </motion.button>
    </div>
  );
};
