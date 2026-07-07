import React, { useState, useEffect, useRef } from 'react';
import { 
  googleSignIn, 
  logout, 
  initAuth, 
  getAccessToken 
} from '../lib/googleAuth';
import { User } from 'firebase/auth';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  RefreshCw, 
  LogOut, 
  Check, 
  AlertTriangle,
  ShoppingBag,
  ArrowRightLeft,
  Sparkles,
  Bot,
  Hash,
  ChevronRight,
  Info,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleChatSectionProps {
  darkMode: boolean;
  compareList: Product[];
  cart: CartItem[];
  onNavigateToScreen: (screen: 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'wishlist' | 'orders' | 'profile') => void;
  onSelectProduct: (productId: string) => void;
}

interface ChatSpace {
  name: string;
  displayName: string;
  spaceType: string;
}

interface ChatMessage {
  name: string;
  sender?: {
    displayName: string;
    avatarUri?: string;
    type?: string;
  };
  text: string;
  createTime?: string;
}

interface ChatMember {
  name: string;
  state: string;
  role: string;
  member?: {
    name: string;
    displayName: string;
    type: string;
  };
}

export default function GoogleChatSection({
  darkMode,
  compareList,
  cart,
  onNavigateToScreen,
  onSelectProduct
}: GoogleChatSectionProps) {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Chat State
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Inputs
  const [newMessageText, setNewMessageText] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // E-commerce Sharing Helpers
  const [selectedShareProduct, setSelectedShareProduct] = useState<string>(MOCK_PRODUCTS[0]?.id || '');
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle temporary notifications
  const triggerNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Auth Initialization on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setNeedsAuth(false);
        fetchSpaces(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        triggerNotification('success', 'Successfully logged in with Google Account!');
        fetchSpaces(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your Workspace permissions.');
      triggerNotification('error', 'Google Sign-In failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out of Google Workspace?');
    if (!confirmLogout) return;
    
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setSpaces([]);
      setSelectedSpace(null);
      setMessages([]);
      setMembers([]);
      triggerNotification('success', 'Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch Spaces
  const fetchSpaces = async (accessToken: string) => {
    setIsLoadingSpaces(true);
    setErrorMsg(null);
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setNeedsAuth(true);
          throw new Error('Access Token expired or invalid. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Failed to fetch spaces (Status ${response.status})`);
      }

      const data = await response.json();
      setSpaces(data.spaces || []);
      
      // Auto-select first space if none selected
      if (data.spaces && data.spaces.length > 0 && !selectedSpace) {
        handleSelectSpace(data.spaces[0], accessToken);
      }
    } catch (err: any) {
      console.error('Fetch spaces error:', err);
      setErrorMsg(err.message || 'Failed to list Google Chat spaces. Make sure Chat API is enabled.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  // Select a Space
  const handleSelectSpace = async (space: ChatSpace, accessToken?: string) => {
    const activeToken = accessToken || token;
    if (!activeToken) return;

    setSelectedSpace(space);
    setIsLoadingContent(true);
    setMessages([]);
    setMembers([]);
    setErrorMsg(null);

    try {
      // 1. Fetch Messages
      const msgResponse = await fetch(`https://chat.googleapis.com/v1/${space.name}/messages`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        setMessages(msgData.messages || []);
      } else {
        console.warn(`Failed to fetch messages for ${space.name}`);
      }

      // 2. Fetch Members
      const memResponse = await fetch(`https://chat.googleapis.com/v1/${space.name}/members`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });

      if (memResponse.ok) {
        const memData = await memResponse.json();
        setMembers(memData.memberships || []);
      } else {
        console.warn(`Failed to fetch members for ${space.name}`);
      }
    } catch (err) {
      console.error('Error fetching space details:', err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Create a New Space
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !token) return;

    setIsCreatingSpace(true);
    setErrorMsg(null);
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: newSpaceName.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Failed to create Chat Space');
      }

      const createdSpace = await response.json();
      triggerNotification('success', `Created space "${createdSpace.displayName}"!`);
      setNewSpaceName('');
      setShowCreateSpace(false);
      
      // Refresh list and select the newly created space
      await fetchSpaces(token);
      handleSelectSpace(createdSpace, token);
    } catch (err: any) {
      console.error('Create space error:', err);
      setErrorMsg(err.message || 'Failed to create space. Google Workspaces might require Admin permission.');
      triggerNotification('error', 'Could not create Space.');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMessageText;
    if (!textToSend.trim() || !selectedSpace || !token) return;

    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${selectedSpace.name}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textToSend.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post message to Google Chat Space');
      }

      const sentMsg = await response.json();
      
      // Append message locally
      setMessages(prev => [...prev, sentMsg]);
      if (!customText) {
        setNewMessageText('');
      }
      triggerNotification('success', 'Message posted to Google Chat Space!');
    } catch (err: any) {
      console.error('Send message error:', err);
      triggerNotification('error', 'Failed to send message.');
    }
  };

  // Action: Share Product details to space
  const handleShareProduct = () => {
    if (!selectedSpace) {
      triggerNotification('error', 'Select a Google Chat Space first!');
      return;
    }
    const product = MOCK_PRODUCTS.find(p => p.id === selectedShareProduct);
    if (!product) return;

    const ratingStars = '⭐'.repeat(Math.round(product.rating)) + ` (${product.rating}/5)`;
    
    const formattedText = `📦 *Product Showcase: ${product.title}*
${ratingStars} | 🏷️ Brand: *${product.brand}*

💰 *Special Price: ₹${product.price.toLocaleString('en-IN')}*  (_Original: ₹${product.originalPrice.toLocaleString('en-IN')} | Save ${product.discountPercentage}%!_)

📋 *Key Specifications:*
• Display: ${product.specs.display || 'N/A'}
• Processor: ${product.specs.processor || 'N/A'}
• Memory: RAM ${product.specs.ram || 'N/A'} | ROM ${product.specs.rom || 'N/A'}
• Battery: ${product.specs.battery || 'N/A'}
• Camera: ${product.specs.camera || 'N/A'}

💡 *Product Description:*
"${product.description}"

🔗 _Shared via AI Shopping Assistant workspace collaboration._`;

    handleSendMessage(undefined, formattedText);
  };

  // Action: Share Current Comparison Table
  const handleShareComparison = () => {
    if (!selectedSpace) {
      triggerNotification('error', 'Select a Google Chat Space first!');
      return;
    }
    if (compareList.length === 0) {
      triggerNotification('error', 'No products in your Comparison List to share! Add some first.');
      return;
    }

    // Build plain text tabular comparison
    let formattedText = `⚔️ *AI Shopping Assistant - Comparison Summary*
Here is a side-by-side spec comparison compiled from our shopping workspace:\n\n`;

    // Header row
    formattedText += `*Product* | ` + compareList.map(p => `*${p.title.split('(')[0].trim()}*`).join('  vs  ') + `\n`;
    formattedText += `*Price* | ` + compareList.map(p => `₹${p.price.toLocaleString('en-IN')}`).join(' | ') + `\n`;
    formattedText += `*Brand* | ` + compareList.map(p => p.brand).join(' | ') + `\n`;
    formattedText += `*Rating* | ` + compareList.map(p => `⭐ ${p.rating}`).join(' | ') + `\n`;
    formattedText += `*RAM/ROM* | ` + compareList.map(p => `${p.specs.ram || 'N/A'} / ${p.specs.rom || 'N/A'}`).join(' | ') + `\n`;
    formattedText += `*Processor* | ` + compareList.map(p => p.specs.processor || 'N/A').join(' | ') + `\n`;
    formattedText += `*Battery* | ` + compareList.map(p => p.specs.battery || 'N/A').join(' | ') + `\n\n`;

    formattedText += `💡 *Shopping Team Verdict:* Click the links inside our app to checkout these deals side-by-side!`;

    handleSendMessage(undefined, formattedText);
  };

  // Action: Draft with AI (Gemini workspace intelligence)
  const handleDraftWithAI = async () => {
    if (!selectedSpace) {
      triggerNotification('error', 'Select a Google Chat Space first!');
      return;
    }
    
    setIsDraftingAI(true);
    try {
      // Build a simple query to /api/chat model but with target drafting
      const contextText = compareList.length > 0 
        ? `products currently being compared: ${compareList.map(p => `${p.title} (₹${p.price})`).join(', ')}`
        : `current featured products in catalog: ${MOCK_PRODUCTS.slice(0, 3).map(p => p.title).join(', ')}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: 'draft-req',
              sender: 'user',
              text: `Draft a professional Google Chat workspace announcement message summarizing the features and helping a team decide which of these products is the absolute best buy. Use bold formatting and bullet points where helpful: ${contextText}`
            }
          ],
          catalog: MOCK_PRODUCTS,
          cart: cart,
          orders: []
        })
      });

      if (!response.ok) {
        throw new Error('AI backend server error');
      }

      const data = await response.json();
      if (data.text) {
        // Set drafting input and notify
        setNewMessageText(data.text);
        triggerNotification('success', 'Gemini successfully drafted a team message! Review and click Send.');
      }
    } catch (err) {
      console.error('Drafting error:', err);
      triggerNotification('error', 'AI could not draft a message right now.');
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Render Space List Skeletons
  const renderSpaceSkeletons = () => (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-zinc-100 dark:bg-slate-800/40 h-12 rounded-xl" />
      ))}
    </div>
  );

  // Unauthenticated Welcome Layout
  if (needsAuth) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-zinc-150 dark:border-slate-800 shadow-xl overflow-hidden p-8 sm:p-12 text-center flex flex-col items-center gap-6 relative">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner relative">
            <MessageSquare className="w-10 h-10 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
            </span>
          </div>

          {/* Heading */}
          <div className="max-w-md">
            <h1 className="text-3xl font-black font-display tracking-tight text-zinc-900 dark:text-slate-100">
              Google Chat Workspace
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Enable instant team collaboration! Connect your Google Workspace Account to list chat rooms, post rich product recommendation cards, share custom specifications, and compare tables directly with your team.
            </p>
          </div>

          {/* Action List Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left my-4">
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" /> Spaces
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Browse and list all active collaboration spaces and channels inside your Workspace.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <ShoppingBag className="w-4 h-4" /> Share Cards
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Send visually striking product specifications or comparison grids straight to your chat channels.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> Gemini Integration
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Let Aria draft professional summaries or product analyses directly into the message compose box.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 px-4 py-3.5 rounded-2xl flex items-start gap-3 text-xs text-left max-w-lg mt-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Authentication Requirement:</span>
                <p className="mt-1 opacity-90 leading-normal">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group flex items-center justify-center gap-3.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 text-sm cursor-pointer mt-2"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 text-white fill-current">
                <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"></path>
                <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"></path>
                <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"></path>
                <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"></path>
              </svg>
            )}
            <span>{isLoggingIn ? 'Connecting Securely...' : 'Connect Google Workspace Account'}</span>
          </button>

          <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">
            Authorized via Google OAuth 2.0 Secure Consent
          </span>
        </div>
      </div>
    );
  }

  // Authenticated Main Dashboard Layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Dynamic Notification Popup */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl border text-xs font-bold ${
              notification.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900' 
                : 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-900'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 bg-emerald-500 text-white rounded-full p-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            )}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#020617] rounded-3xl border border-zinc-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden flex flex-col h-[700px] md:flex-row relative">
        
        {/* LEFT COLUMN: SPACE SELECTOR */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-150 dark:border-slate-800 flex flex-col bg-zinc-50/50 dark:bg-slate-900/10 shrink-0 h-1/3 md:h-full">
          {/* Header Profile Info */}
          <div className="p-4 border-b border-zinc-150 dark:border-slate-800 flex items-center justify-between gap-3 bg-zinc-100/40 dark:bg-slate-900/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500 overflow-hidden shrink-0 border border-indigo-200 dark:border-indigo-800">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-black uppercase">
                    {user?.displayName ? user.displayName.slice(0, 2) : 'GC'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-zinc-800 dark:text-slate-100 truncate leading-tight">
                  {user?.displayName || 'Google Account'}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-slate-400 truncate leading-none mt-1">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer shrink-0"
              title="Logout Google Chat"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar: Create Space Toggle */}
          <div className="p-3.5 flex items-center justify-between gap-2 border-b border-zinc-150 dark:border-slate-800">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
              Collaboration Rooms
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchSpaces(token || '')}
                disabled={isLoadingSpaces}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
                title="Refresh Spaces"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateSpace(!showCreateSpace)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${showCreateSpace ? 'bg-indigo-500 text-white' : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-850'}`}
                title="Create Space"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Create Space Expandable Form */}
          <AnimatePresence>
            {showCreateSpace && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateSpace}
                className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 border-b border-zinc-150 dark:border-slate-800/60 flex flex-col gap-2 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300">New Space Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shopping Project Team"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    className="flex-grow px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingSpace || !newSpaceName.trim()}
                    className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    {isCreatingSpace ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Spaces Scrollable Area */}
          <div className="flex-grow overflow-y-auto p-2 flex flex-col gap-1.5">
            {isLoadingSpaces ? (
              renderSpaceSkeletons()
            ) : spaces.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Hash className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No Chat spaces found</p>
                <button
                  onClick={() => setShowCreateSpace(true)}
                  className="mt-2.5 text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-black tracking-wide uppercase cursor-pointer"
                >
                  + Create First Room
                </button>
              </div>
            ) : (
              spaces.map((space) => {
                const isSelected = selectedSpace?.name === space.name;
                return (
                  <button
                    key={space.name}
                    onClick={() => handleSelectSpace(space)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15' 
                        : 'text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800/50 hover:text-zinc-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Hash className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold truncate block ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-slate-100'}`}>
                          {space.displayName || 'Direct Message'}
                        </span>
                        <span className={`text-[10px] truncate block mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {space.spaceType === 'SPACE' ? 'Space Room' : 'Direct Message'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-indigo-200 translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: CURRENT CHATROOM */}
        <main className="flex-grow flex flex-col bg-white dark:bg-[#020617] h-2/3 md:h-full min-w-0">
          
          {!selectedSpace ? (
            /* Empty State */
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-4">
              <Bot className="w-16 h-16 text-indigo-500/80 animate-bounce" />
              <div className="max-w-sm">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100">AI Chat Hub Collaboration</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Select an active Google Chat Space from the left column, or click the <Plus className="inline w-3 h-3" /> button to set up a brand new workspace room!
                </p>
              </div>
            </div>
          ) : (
            /* Active Space Screen */
            <>
              {/* Space Info Top bar */}
              <div className="p-4 border-b border-zinc-150 dark:border-slate-800 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-slate-900/10 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-slate-100 truncate">
                      {selectedSpace.displayName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <span className="font-mono text-[9px] lowercase bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm truncate max-w-[120px] sm:max-w-none">
                      {selectedSpace.name}
                    </span>
                  </div>
                </div>

                {/* Info and Members Panel Toggles */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showMembers 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Toggle Member List"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Members</span>
                  </button>
                  <button
                    onClick={() => handleSelectSpace(selectedSpace)}
                    disabled={isLoadingContent}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="Reload Current Space"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingContent ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Central Area: Messages Feed OR Members side rail */}
              <div className="flex-grow flex flex-row min-h-0 relative overflow-hidden">
                
                {/* 1. Message logs */}
                <div className="flex-grow flex flex-col min-h-0 p-4 overflow-y-auto gap-4 bg-slate-50/40 dark:bg-slate-950/10">
                  {isLoadingContent ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                      <span className="text-xs font-bold text-slate-400">Syncing message logs...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-2 text-slate-400">
                      <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-1" />
                      <p className="text-xs font-bold">Workspace Chat Empty</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                        No previous messages loaded. Type a hello message below, or share product metrics to populate the feed!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender?.displayName === user?.displayName;
                      const senderName = msg.sender?.displayName || 'Unknown Colleague';
                      const senderType = msg.sender?.type || 'USER';
                      
                      return (
                        <div key={msg.name || index} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>{senderName}</span>
                            {senderType === 'HUMAN' && <span className="bg-slate-100 dark:bg-slate-800 text-[8px] px-1 rounded-sm">User</span>}
                            {senderType === 'BOT' && <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-[8px] px-1 rounded-sm">Bot</span>}
                          </div>
                          
                          <div className={`p-3.5 rounded-2xl shadow-xs text-xs whitespace-pre-wrap leading-relaxed ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-slate-900 border border-zinc-150 dark:border-slate-800 text-zinc-800 dark:text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 2. Side Panel: Members List */}
                <AnimatePresence>
                  {showMembers && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="border-l border-zinc-150 dark:border-slate-800 h-full flex flex-col bg-zinc-50/30 dark:bg-slate-950/5 overflow-hidden shrink-0"
                    >
                      <div className="p-3.5 border-b border-zinc-150 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
                        Active Members ({members.length})
                      </div>
                      <div className="flex-grow overflow-y-auto p-2.5 flex flex-col gap-2">
                        {members.map((member, i) => {
                          const mName = member.member?.displayName || 'Collaborator';
                          const mType = member.member?.type || 'HUMAN';
                          
                          return (
                            <div key={member.name || i} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-zinc-100 dark:border-slate-800/80">
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black uppercase text-indigo-500">
                                {mName.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-zinc-850 dark:text-slate-100 block truncate leading-tight">
                                  {mName}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block mt-1 leading-none font-semibold">
                                  {mType === 'HUMAN' ? 'Google User' : 'Workspace Bot'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom Quick Tools: Share Products & AI Drafting */}
              <div className="p-3 bg-zinc-100/40 dark:bg-slate-900/30 border-t border-zinc-150 dark:border-slate-800/80 flex flex-col gap-3 shrink-0">
                
                {/* Collaborative E-commerce Share Rails */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Share Assets:
                  </span>

                  {/* 1. Share product selector and button */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-xl border border-zinc-200 dark:border-slate-800 shrink-0">
                    <select
                      value={selectedShareProduct}
                      onChange={(e) => setSelectedShareProduct(e.target.value)}
                      className="text-[11px] bg-transparent text-zinc-700 dark:text-slate-300 font-bold focus:outline-hidden px-1.5 py-0.5 cursor-pointer max-w-[120px] sm:max-w-none"
                    >
                      {MOCK_PRODUCTS.map(p => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-900 text-zinc-850 dark:text-slate-100">
                          {p.title.split('(')[0]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleShareProduct}
                      className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer"
                      title="Post Product Metrics Card"
                    >
                      <ShoppingBag className="w-3 h-3" /> Share
                    </button>
                  </div>

                  {/* 2. Share Comparison Summary */}
                  <button
                    onClick={handleShareComparison}
                    disabled={compareList.length === 0}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-zinc-700 dark:text-slate-300 border border-zinc-200 dark:border-slate-800 px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer disabled:opacity-40"
                    title={compareList.length > 0 ? "Share side-by-side spec comparison table" : "Add products to compare first"}
                  >
                    <ArrowRightLeft className="w-3 h-3 text-indigo-500" /> 
                    <span>Compare Spec Grid ({compareList.length})</span>
                  </button>

                  {/* 3. Draft with AI Button */}
                  <button
                    onClick={handleDraftWithAI}
                    disabled={isDraftingAI}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50 ml-auto shadow-sm"
                    title="Let Aria draft a recommendation announcement"
                  >
                    {isDraftingAI ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{isDraftingAI ? 'Drafting...' : 'Aria Workspace Draft'}</span>
                  </button>
                </div>

                {/* Compose Input Form */}
                <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type a team message or collaborate..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-grow px-3 py-2.5 text-xs bg-white dark:bg-slate-950 border border-zinc-200 dark:border-slate-850 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </>
          )}

        </main>

      </div>

      {/* Guidelines and help card */}
      <div className="bg-indigo-50/30 dark:bg-slate-900/40 rounded-3xl p-5 border border-indigo-100/40 dark:border-slate-800/80 mt-6 flex gap-4 text-xs items-start">
        <Info className="w-5 h-5 shrink-0 text-indigo-500" />
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-zinc-850 dark:text-slate-200 block mb-1">Google Workspace Chat Guidelines:</span>
          <p className="leading-relaxed">
            Ensure that your Google Account is allowed to run Google Chat inside developer integrations. If you are using a personal Gmail account, you can create spaces instantly. If you are using a G Suite / Google Workspace corporate or educational account, make sure your Workspace Administrator has enabled Google Chat API access and scopes for external applications.
          </p>
        </div>
      </div>

    </div>
  );
}
