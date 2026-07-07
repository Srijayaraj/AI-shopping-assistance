import React, { useState, useEffect, useRef } from 'react';
import { 
  googleSignIn, 
  logout, 
  initAuth, 
  getAccessToken 
} from '../lib/googleAuth';
import { User } from 'firebase/auth';
import { 
  Mail, 
  Send, 
  RefreshCw, 
  LogOut, 
  Check, 
  AlertTriangle,
  ShoppingBag,
  ArrowRightLeft,
  Sparkles,
  Search,
  ChevronRight,
  Info,
  Trash2,
  Plus,
  Inbox,
  Star,
  FileText,
  User as UserIcon,
  X,
  FileDown,
  CornerUpLeft,
  ChevronDown,
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface GmailSectionProps {
  darkMode: boolean;
  compareList: Product[];
  cart: CartItem[];
  onNavigateToScreen: (screen: 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'wishlist' | 'orders' | 'profile' | 'google-chat') => void;
  onSelectProduct: (productId: string) => void;
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  payload?: {
    headers: GmailMessageHeader[];
    body?: {
      size: number;
      data?: string;
    };
  };
  // Simplified fields for UI rendering
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

export default function GmailSection({
  darkMode,
  compareList,
  cart,
  onNavigateToScreen,
  onSelectProduct
}: GmailSectionProps) {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Gmail Data State
  const [emails, setEmails] = useState<GmailMessageDetail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compose State
  const [showCompose, setShowCompose] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Shopping Help State
  const [selectedProduct, setSelectedProduct] = useState<string>(MOCK_PRODUCTS[0]?.id || '');
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        fetchRecentEmails(currentToken);
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
        triggerNotification('success', 'Successfully connected Google Account with Gmail Scopes!');
        fetchRecentEmails(result.accessToken);
      }
    } catch (err: any) {
      console.error('Gmail login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your Workspace Gmail permissions.');
      triggerNotification('error', 'Google Sign-In failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to disconnect Gmail?');
    if (!confirmLogout) return;
    
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setEmails([]);
      setSelectedEmail(null);
      triggerNotification('success', 'Gmail disconnected successfully');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Helper: Extract headers from Gmail Message Payload
  const getHeader = (headers: GmailMessageHeader[] | undefined, name: string): string => {
    if (!headers) return '';
    const match = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return match ? match.value : '';
  };

  // Fetch Emails
  const fetchRecentEmails = async (accessToken: string) => {
    setIsLoadingEmails(true);
    setErrorMsg(null);
    try {
      const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12${queryParam}`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });

      if (!listResponse.ok) {
        if (listResponse.status === 401) {
          setNeedsAuth(true);
          throw new Error('Access Token expired or invalid. Please sign in again.');
        }
        const errorData = await listResponse.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Failed to fetch emails (Status ${listResponse.status})`);
      }

      const listData = await listResponse.json();
      const messages = listData.messages || [];

      // Fetch details for each message
      const detailedMessages = await Promise.all(
        messages.map(async (msg: { id: string; threadId: string }) => {
          try {
            const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              const headers = detail.payload?.headers || [];
              return {
                id: msg.id,
                threadId: msg.threadId,
                snippet: detail.snippet || '',
                subject: getHeader(headers, 'subject') || '(No Subject)',
                from: getHeader(headers, 'from') || 'Unknown Sender',
                to: getHeader(headers, 'to') || 'me',
                date: getHeader(headers, 'date') || ''
              };
            }
          } catch (e) {
            console.error(`Error loading message detail for ${msg.id}`, e);
          }
          return null;
        })
      );

      const filteredDetails = detailedMessages.filter(m => m !== null) as GmailMessageDetail[];
      setEmails(filteredDetails);

      if (filteredDetails.length > 0 && !selectedEmail) {
        setSelectedEmail(filteredDetails[0]);
      }
    } catch (err: any) {
      console.error('Fetch emails error:', err);
      setErrorMsg(err.message || 'Failed to sync Gmail. Verify API integration & internet connection.');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Trigger search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      fetchRecentEmails(token);
    }
  };

  // Base64url encode helper for RFC 5322 MIME
  const encodeRFC5322 = (to: string, subject: string, bodyText: string) => {
    const rawMessage = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyText
    ].join('\r\n');

    // Safe base64url encoding
    return btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Send Email API call
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim() || !token) {
      triggerNotification('error', 'Please fill in all email fields.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const rawBase64 = encodeRFC5322(emailTo.trim(), emailSubject.trim(), emailBody.replace(/\n/g, '<br />'));

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: rawBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Failed to send email through Google Workspace APIs.');
      }

      triggerNotification('success', 'Email dispatched successfully via Gmail!');
      
      // Reset state
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setShowCompose(false);
      
      // Refresh inbox
      fetchRecentEmails(token);
    } catch (err: any) {
      console.error('Gmail send error:', err);
      triggerNotification('error', err.message || 'Could not send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Quick Action: Send Cart Details to user's email
  const handleSendCartReceipt = () => {
    if (cart.length === 0) {
      triggerNotification('error', 'Your shopping cart is currently empty!');
      return;
    }
    if (!user?.email) {
      triggerNotification('error', 'Login is required to retrieve destination email.');
      return;
    }

    const totalCost = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    
    setEmailTo(user.email);
    setEmailSubject('🛒 Your AI Shopping Assistant - Current Cart Overview');
    
    let cartTable = `<h3>AI Shopping Assistant Workspace Summary</h3>
    <p>Hi ${user.displayName || 'Shopper'}, here is the draft specification of your active cart saved in your team workspace:</p>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: sans-serif; width: 100%;">
      <tr style="background-color: #f3f4f6;">
        <th>Product Name</th>
        <th>Brand</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Subtotal</th>
      </tr>`;

    cart.forEach(item => {
      cartTable += `<tr>
        <td><b>${item.product.title}</b></td>
        <td>${item.product.brand}</td>
        <td>₹${item.product.price.toLocaleString('en-IN')}</td>
        <td>${item.quantity}</td>
        <td>₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`;
    });

    cartTable += `</table>
    <h4>Total Order Amount Estimations: ₹${totalCost.toLocaleString('en-IN')}</h4>
    <p><i>Drafted securely via integration inside your AI Shopping Assistant App. Open the dashboard to finalize checkout.</i></p>`;

    setEmailBody(cartTable);
    setShowCompose(true);
    triggerNotification('success', 'Cart details populated into Compose Editor!');
  };

  // AI draft assistant logic
  const handleAIDraftEmail = async () => {
    const product = MOCK_PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return;

    setIsDraftingAI(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: 'gmail-draft-req',
              sender: 'user',
              text: `Draft a professional, politely worded e-mail to a retail distributor asking for a bulk discount quote, spec validation, and shipping availability for this product: ${product.title} (Current listed price is ₹${product.price}). The user's name is ${user?.displayName || 'Customer'}. Use clean, professional language.`
            }
          ],
          catalog: MOCK_PRODUCTS,
          cart: cart,
          orders: []
        })
      });

      if (!response.ok) {
        throw new Error('AI backend model draft failed');
      }

      const data = await response.json();
      if (data.text) {
        setEmailSubject(`Bulk Order Inquiry: ${product.title.split('(')[0].trim()}`);
        setEmailBody(data.text);
        setEmailTo('sales@vendor-distributor.com');
        setShowCompose(true);
        triggerNotification('success', 'Gemini successfully drafted your inquiry email!');
      }
    } catch (e) {
      console.error('AI draft error:', e);
      triggerNotification('error', 'AI was unable to generate draft at this moment.');
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Render Skeleton Placeholders for Inbox Emails
  const renderEmailSkeletons = () => (
    <div className="flex flex-col gap-2.5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse bg-zinc-100 dark:bg-slate-800/40 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="h-3.5 bg-zinc-200 dark:bg-slate-700 rounded-sm w-1/3" />
            <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded-sm w-12" />
          </div>
          <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded-sm w-2/3" />
          <div className="h-2.5 bg-zinc-200 dark:bg-slate-700 rounded-sm w-5/6" />
        </div>
      ))}
    </div>
  );

  if (needsAuth) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-zinc-150 dark:border-slate-800 shadow-xl overflow-hidden p-8 sm:p-12 text-center flex flex-col items-center gap-6 relative">
          
          {/* Ambient Decorative Blurs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Mail className="w-10 h-10 animate-bounce" />
          </div>

          {/* Heading */}
          <div className="max-w-md">
            <h1 className="text-3xl font-black font-display tracking-tight text-zinc-900 dark:text-slate-100">
              Workspace Gmail Client
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Maximize your shopping productivity. Securely link your Google Workspace / Gmail account to synchronize receipts, review order history status, draft bulk distributor queries, or mail spec grids to colleagues.
            </p>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left my-4">
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Inbox className="w-4 h-4" /> Sync Receipts
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Fetch and aggregate your recent order confirmations and retail updates instantly.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Send className="w-4 h-4" /> Direct Share
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Email spec sheets, custom comparisons, or saved cart quotes directly from the interface.
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-slate-950 p-5 rounded-2xl border border-zinc-100 dark:border-slate-800/80">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> AI Drafting
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Let Aria formulate formal vendor negotiation or help requests with professional tone settings.
              </p>
            </div>
          </div>

          {/* Secure auth warnings / error logs */}
          {errorMsg && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 px-4 py-3.5 rounded-2xl flex items-start gap-3 text-xs text-left max-w-lg mt-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">OAuth Validation Requirement:</span>
                <p className="mt-1 opacity-90 leading-normal">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Connect Trigger */}
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
            <span>{isLoggingIn ? 'Connecting Securely...' : 'Grant Gmail Scopes & Sign In'}</span>
          </button>

          <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">
            Authorized via secure Firebase & Google OAuth 2.0 API gateway
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Dynamic Notification Bubble */}
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

      <div className="bg-white dark:bg-[#020617] rounded-3xl border border-zinc-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden flex flex-col h-[750px] md:flex-row relative">
        
        {/* LEFT COLUMN: GMAIL MAILBOX & FOLDERS */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-150 dark:border-slate-800 flex flex-col bg-zinc-50/50 dark:bg-slate-900/10 shrink-0 h-2/5 md:h-full">
          
          {/* User Account / Connection bar */}
          <div className="p-4 border-b border-zinc-150 dark:border-slate-800 flex items-center justify-between gap-3 bg-zinc-100/40 dark:bg-slate-900/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500 overflow-hidden shrink-0 border border-indigo-200 dark:border-indigo-800">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-black uppercase">
                    {user?.displayName ? user.displayName.slice(0, 2) : 'GM'}
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
              title="Disconnect Gmail"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions / Compose toggle */}
          <div className="p-3 border-b border-zinc-150 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setEmailTo('');
                setEmailSubject('');
                setEmailBody('');
                setShowCompose(true);
              }}
              className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Compose Message
            </button>
            <button
              onClick={() => fetchRecentEmails(token || '')}
              disabled={isLoadingEmails}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Folder Filter Selection Tabs */}
          <div className="p-2 border-b border-zinc-150 dark:border-slate-800 flex gap-1 bg-zinc-100/10 dark:bg-slate-900/10">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'inbox' ? 'bg-white dark:bg-slate-850 shadow-xs text-indigo-600 dark:text-indigo-400 border border-zinc-100 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Inbox className="w-3.5 h-3.5" /> Inbox
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'sent' ? 'bg-white dark:bg-slate-850 shadow-xs text-indigo-600 dark:text-indigo-400 border border-zinc-100 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Send className="w-3.5 h-3.5" /> Sent
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="p-3 border-b border-zinc-150 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-950 border border-zinc-200 dark:border-slate-850 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    if (token) fetchRecentEmails(token);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Mailbox List */}
          <div className="flex-grow overflow-y-auto p-2 flex flex-col gap-1.5">
            {isLoadingEmails ? (
              renderEmailSkeletons()
            ) : emails.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Your Mailbox is Empty</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  No matching workspace messages synchronized. Compose drafts or trigger sample queries to begin.
                </p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full flex flex-col p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600/5 dark:bg-indigo-950/10 border-indigo-600 text-indigo-900 dark:text-indigo-400 font-medium' 
                        : 'bg-white dark:bg-slate-950 border-zinc-100 dark:border-slate-850 text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-900/50 hover:text-zinc-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wide truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                        {email.from.split('<')[0].trim()}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                        {email.date ? new Date(email.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : ''}
                      </span>
                    </div>
                    <span className={`text-xs font-black truncate block mt-1 ${isSelected ? 'text-indigo-900 dark:text-slate-100' : 'text-zinc-900 dark:text-slate-100'}`}>
                      {email.subject}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-1 leading-normal">
                      {email.snippet}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: DETAIL VIEW & COMPOSE SPLIT PANES */}
        <main className="flex-grow flex flex-col bg-white dark:bg-[#020617] h-3/5 md:h-full min-w-0 relative">
          
          <AnimatePresence>
            {/* 1. COMPOSE DRAWER overlay */}
            {showCompose && (
              <motion.div
                initial={{ opacity: 0, y: 300 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 300 }}
                className="absolute inset-0 z-20 bg-white dark:bg-[#020617] flex flex-col border-t md:border-t-0 border-zinc-150 dark:border-slate-800"
              >
                {/* Compose Header */}
                <div className="p-4 bg-zinc-50 dark:bg-slate-900/50 border-b border-zinc-150 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-black font-display text-zinc-900 dark:text-slate-100">
                      New Mail Message
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Compose Form */}
                <form onSubmit={handleSendEmail} className="flex-grow overflow-y-auto p-5 flex flex-col gap-4">
                  {/* To */}
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                      Recipient Email (To)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. support@brand-retailer.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Support inquiry regarding order status"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium"
                    />
                  </div>

                  {/* Body Textarea */}
                  <div className="flex-grow flex flex-col min-h-[180px]">
                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                      Message Content (HTML Supported)
                    </label>
                    <textarea
                      required
                      placeholder="Type your message body, or use AI Workspace Drafting tools on the right panel to formulate emails..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="flex-grow w-full px-3 py-2.5 text-xs bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-850 dark:text-slate-100 font-medium resize-none min-h-[140px]"
                    />
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end gap-2.5 border-t border-zinc-100 dark:border-slate-800/80 pt-4 mt-auto">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2.5 border border-zinc-200 dark:border-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Cancel Draft
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      {isSendingEmail ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isSendingEmail ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. STANDARD DETAIL PANEL: VIEW SELECTED EMAIL */}
          {!selectedEmail ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-3">
              <Mail className="w-16 h-16 text-indigo-500/80" />
              <div className="max-w-xs">
                <h3 className="text-base font-bold text-zinc-900 dark:text-slate-100">No Email Selected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Choose a receipt, inquiry, or transaction message from the mailbox folder list to display its complete payload.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col min-h-0">
              
              {/* Header metadata */}
              <div className="p-5 border-b border-zinc-150 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-900/10 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <h2 className="text-base sm:text-lg font-black font-display text-zinc-900 dark:text-slate-100 tracking-tight leading-snug">
                    {selectedEmail.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-850 dark:text-slate-200 block truncate leading-none">
                      From: {selectedEmail.from}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1.5 font-semibold leading-none">
                      To: {selectedEmail.to} | Date: {selectedEmail.date ? new Date(selectedEmail.date).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="flex-grow p-6 overflow-y-auto bg-white dark:bg-slate-950/20 text-xs sm:text-sm text-zinc-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                {selectedEmail.snippet}
                
                {/* Visual Placeholder informing about plain snippets vs rich MIME bodies */}
                <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex gap-2.5 items-start font-semibold">
                  <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-zinc-700 dark:text-slate-400 font-black block mb-0.5">MIME Structure Verified:</span>
                    <p>This message was rendered from a Gmail secure payload. To protect browser iframe security, complex scripting tags inside HTML snippets are filtered. Use standard actions below to draft responses.</p>
                  </div>
                </div>
              </div>

              {/* Action Rails: Reply / Draft helpers / AI Integration tools */}
              <div className="p-4 bg-zinc-50 dark:bg-slate-900/30 border-t border-zinc-150 dark:border-slate-800 flex flex-wrap items-center gap-3 mt-auto">
                <button
                  onClick={() => {
                    setEmailTo(selectedEmail.from.includes('<') ? selectedEmail.from.split('<')[1].replace('>', '') : selectedEmail.from);
                    setEmailSubject(`Re: ${selectedEmail.subject}`);
                    setEmailBody(`\n\nOn ${selectedEmail.date}, ${selectedEmail.from} wrote:\n> ${selectedEmail.snippet}`);
                    setShowCompose(true);
                  }}
                  className="flex items-center gap-1.5 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-zinc-700 dark:text-slate-300 border border-zinc-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <CornerUpLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Reply
                </button>

                {/* Share current comparison */}
                <button
                  onClick={handleSendCartReceipt}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/55 text-indigo-600 dark:text-indigo-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-100/30"
                  title="Compose email populated with current cart items table"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Mail Cart
                </button>

                {/* Divider */}
                <span className="h-5 w-[1px] bg-zinc-200 dark:bg-slate-800 hidden sm:inline" />

                {/* AI Draft Assist trigger */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-xl border border-zinc-200 dark:border-slate-800 shrink-0 ml-auto">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="text-[11px] bg-transparent text-zinc-700 dark:text-slate-300 font-bold focus:outline-hidden px-1.5 py-0.5 cursor-pointer max-w-[120px] sm:max-w-none"
                  >
                    {MOCK_PRODUCTS.map(p => (
                      <option key={p.id} value={p.id} className="dark:bg-slate-900 text-zinc-850 dark:text-slate-100">
                        Inquire: {p.title.split('(')[0]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAIDraftEmail}
                    disabled={isDraftingAI}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDraftingAI ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Draft Inquiry</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* Workspace Guidelines Card */}
      <div className="bg-indigo-50/30 dark:bg-slate-900/40 rounded-3xl p-5 border border-indigo-100/40 dark:border-slate-800/80 mt-6 flex gap-4 text-xs items-start">
        <Info className="w-5 h-5 shrink-0 text-indigo-500" />
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-zinc-850 dark:text-slate-200 block mb-1">Gmail Secure Credentials Notice:</span>
          <p className="leading-relaxed">
            AI Shopping Assistant communicates directly with official Google Gmail APIs via your OAuth client. No keys are ever exposed on the server. Your emails remain completely confidential and local to this instance. For enterprise accounts, please request your workspace administrator to grant application-level permissions.
          </p>
        </div>
      </div>

    </div>
  );
}
