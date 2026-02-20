"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Menu,
    Plus,
    Trash2,
    Globe,
    Compass,
    MapPin,
    Map,
    Zap,
    Mic,
    X,
    Sparkles,
    Search,
    ChevronLeft,
    ChevronRight,
    Settings,
    User
} from 'lucide-react';

// Types
interface Message {
    role: "user" | "model";
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    lastModified: number;
}

const SUGGESTIONS = [
    { icon: <Sparkles className="w-5 h-5 text-amber-400" />, label: "Luxury Stays", desc: "Top 5 suites in Santorini" },
    { icon: <MapPin className="w-5 h-5 text-sky-400" />, label: "Hidden Gems", desc: "Secret spots in Tokyo" },
    { icon: <Compass className="w-5 h-5 text-indigo-400" />, label: "Itineraries", desc: "5-day Bali adventure" },
    { icon: <Zap className="w-5 h-5 text-emerald-400" />, label: "Quick Trip", desc: "Weekend in Paris" },
];

/* ── Simple markdown-to-HTML ── */
function renderMarkdown(text: string): string {
    let html = text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold text-sky-200 mt-4 mb-2'>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold text-sky-300 mt-6 mb-3'>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold text-sky-400 mt-8 mb-4 border-b border-white/10 pb-2'>$1</h1>")
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong class='text-sky-200'><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong class='text-sky-100'>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em class='text-slate-300'>$1</em>")
        .replace(/`([^`]+)`/g, "<code class='bg-slate-800/50 px-1.5 py-0.5 rounded text-sky-200 font-mono text-sm'>$1</code>")
        .replace(/^---$/gm, "<hr class='border-white/10 my-6'/>")
        .replace(/^&gt; (.+)$/gm, "<blockquote class='border-l-4 border-sky-500/50 pl-4 py-1 my-4 text-slate-400 italic bg-white/5 rounded-r'>$1</blockquote>")
        .replace(/^[\-\*] (.+)$/gm, "<li class='ml-4 list-disc marker:text-sky-500'>$1</li>")
        .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal marker:text-sky-500'>$1</li>");

    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul class='space-y-1 my-3 pl-4'>$1</ul>");

    html = html
        .split("\n\n")
        .map((block) => {
            const trimmed = block.trim();
            if (!trimmed) return "";
            if (/^<(h[1-3]|ul|ol|blockquote|hr|li)/.test(trimmed)) return trimmed;
            return `<p class='mb-3 text-slate-300 leading-relaxed'>${trimmed.replace(/\n/g, "<br/>")}</p>`;
        })
        .join("");

    return html;
}

export default function ChatPage() {
    // State
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial Load
    useEffect(() => {
        const savedChats = localStorage.getItem("nomad-chats");
        if (savedChats) {
            try {
                const parsed = JSON.parse(savedChats);
                setChats(parsed);
                if (parsed.length > 0) setCurrentChatId(parsed[0].id);
                else createNewChat();
            } catch (e) {
                console.error(e);
                createNewChat();
            }
        } else {
            createNewChat();
        }

        // Check screen size for initial sidebar state
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, []);

    // Save
    useEffect(() => {
        if (chats.length > 0) localStorage.setItem("nomad-chats", JSON.stringify(chats));
    }, [chats]);

    const createNewChat = () => {
        const newChat: ChatSession = {
            id: crypto.randomUUID(),
            title: "New Adventure",
            messages: [],
            lastModified: Date.now(),
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setInput("");
        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
    };

    const deleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newChats = chats.filter(c => c.id !== id);
        setChats(newChats);
        if (currentChatId === id) {
            setCurrentChatId(newChats.length > 0 ? newChats[0].id : null);
        }
    };

    const activeChat = chats.find(c => c.id === currentChatId);
    const messages = activeChat?.messages || [];

    // Scroll
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    useEffect(() => scrollToBottom(), [messages, scrollToBottom]);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
        }
    }, [input]);

    const sendMessage = async (text: string) => {
        if (!currentChatId || !text.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: text.trim() };
        const updatedMessages = [...messages, userMsg];

        // Optimistic UI
        setChats(prev => prev.map(c => c.id === currentChatId ? {
            ...c,
            messages: updatedMessages,
            title: c.title === "New Adventure" ? text.slice(0, 30) : c.title
        } : c));

        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No stream");

            let aiContent = "";
            const StreamDecoder = new TextDecoder();

            // Add placeholder
            setChats(prev => prev.map(c => c.id === currentChatId ? {
                ...c, messages: [...updatedMessages, { role: "model", content: "" }]
            } : c));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                aiContent += StreamDecoder.decode(value, { stream: true });

                // Live update & Smooth Scroll
                setChats(prev => prev.map(c => c.id === currentChatId ? {
                    ...c,
                    messages: [...updatedMessages, { role: "model", content: aiContent }]
                } : c));
            }
        } catch (err: unknown) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div className="flex w-full h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 overflow-hidden font-sans">

            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Compass className="text-white w-5 h-5" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight">NomadAI</span>
                </div>
                <div className="w-8" /> {/* Spacer */}
            </header>

            {/* Sidebar (Desktop & Mobile) */}
            <aside className={`
                fixed md:relative inset-y-0 left-0 z-40
                w-[280px] bg-slate-950/50 backdrop-blur-2xl border-r border-white/5
                flex flex-col
                transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${!isSidebarOpen && 'md:w-[72px]'}
            `}>
                {/* Collapse Button (Desktop) */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:flex absolute top-4 -right-3 w-6 h-6 bg-slate-800 border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Sidebar Header */}
                <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} h-16`}>
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Compass className="text-white w-5 h-5" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                NomadAI
                            </span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Compass className="text-white w-5 h-5" />
                        </div>
                    )}
                    {isSidebarOpen && (
                        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* New Chat Button */}
                <div className="px-4 py-2">
                    <button
                        onClick={createNewChat}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            bg-gradient-to-r from-sky-500/10 to-blue-500/10 
                            hover:from-sky-500/20 hover:to-blue-500/20
                            border border-sky-500/20 hover:border-sky-500/40
                            text-sky-100 font-medium transition-all duration-300
                            shadow-lg shadow-sky-500/5
                            ${!isSidebarOpen && 'justify-center px-0'}
                        `}
                    >
                        <Plus size={20} className="text-sky-400" />
                        {isSidebarOpen && <span>New Adventure</span>}
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-hide">
                    {isSidebarOpen && <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Journeys</div>}
                    <div className="space-y-1">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => { setCurrentChatId(chat.id); if (window.innerWidth < 768) setIsMobileMenuOpen(false); }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left group
                                    transition-all duration-200
                                    ${chat.id === currentChatId ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                                    ${!isSidebarOpen && 'justify-center'}
                                `}
                            >
                                <span className="shrink-0"><Map className="w-4 h-4 opacity-70" /></span>
                                {isSidebarOpen && (
                                    <>
                                        <span className="truncate flex-1">{chat.title}</span>
                                        <div
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                                            onClick={(e) => deleteChat(e, chat.id)}
                                        >
                                            <Trash2 size={12} className="text-slate-500 hover:text-rose-400" />
                                        </div>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/5">
                    <button className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg
                        text-slate-400 hover:text-white hover:bg-white/5 transition-all
                        ${!isSidebarOpen && 'justify-center'}
                    `}>
                        <Settings size={18} />
                        {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
                    </button>
                    <button className={`
                        mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg
                        text-slate-400 hover:text-white hover:bg-white/5 transition-all
                        ${!isSidebarOpen && 'justify-center'}
                    `}>
                        <User size={18} />
                        {isSidebarOpen && <span className="text-sm font-medium">Profile</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative h-[100dvh]"> {/* 100dvh for mobile browsers */}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-20 md:py-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-[0_0_50px_-10px_rgba(14,165,233,0.3)] animate-pulse-glow">
                                    <Globe className="w-10 h-10 text-cyan-400" strokeWidth={1.5} />
                                </div>
                                <h2 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 mb-4">
                                    Where to next?
                                </h2>
                                <p className="text-lg text-slate-400 max-w-lg mb-12 leading-relaxed">
                                    Your personal concierge for global exploration. Discover hidden gems, luxury stays, and curated adventures.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    {SUGGESTIONS.map((s, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ y: -2, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => sendMessage(s.label)}
                                            className="group relative overflow-hidden p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 text-left"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            <div className="flex items-start gap-4 sticky z-10">
                                                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                                                    {s.icon}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{s.label}</div>
                                                    <div className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5">{s.desc}</div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-8 pb-32">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        key={i}
                                        className={`flex gap-4 md:gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div className={`
                                            shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border
                                            ${msg.role === "model"
                                                ? "bg-slate-900 border-white/10 text-cyan-400 shadow-lg shadow-cyan-900/20"
                                                : "bg-slate-800 border-white/10 text-slate-200"}
                                        `}>
                                            {msg.role === "model" ? <Sparkles size={18} /> : <User size={18} />}
                                        </div>

                                        <div className={`relative max-w-[85%] md:max-w-[75%] rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md border ${msg.role === "user"
                                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400/20 text-white rounded-tr-md"
                                                : "bg-slate-900/40 border-white/5 text-slate-300 rounded-tl-md"
                                            }`}>
                                            <div
                                                className="prose prose-invert prose-p:leading-relaxed prose-headings:text-sky-200"
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.role === "model"
                                                        ? renderMarkdown(msg.content)
                                                        : msg.content.replace(/\n/g, "<br/>"),
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && messages[messages.length - 1]?.role === "user" && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex gap-4 md:gap-6"
                                    >
                                        <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                                            <Sparkles size={18} className="animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-1.5 p-4 bg-slate-900/40 rounded-3xl rounded-tl-md border border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-20">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={false}
                            animate={{
                                boxShadow: isLoading ? "0 0 0 1px rgba(56, 189, 248, 0.2)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                            }}
                            className="relative group rounded-[28px] bg-slate-900/80 backdrop-blur-xl border border-white/10 transition-all duration-300 focus-within:border-sky-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(14,165,233,0.15)] flex items-end p-2 gap-2"
                        >
                            <button className="p-3 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 shrink-0">
                                <Plus size={20} />
                            </button>

                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything..."
                                rows={1}
                                disabled={isLoading}
                                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 py-3 px-1 resize-none max-h-32 text-[15px] leading-relaxed scrollbar-hide"
                            />

                            <div className="flex items-center gap-2 pb-1 pr-1">
                                <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                                    <Mic size={20} />
                                </button>
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isLoading}
                                    className={`
                                        p-2 rounded-full transition-all duration-300
                                        ${input.trim() && !isLoading
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:scale-105 hover:bg-sky-400'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                                    `}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </motion.div>
                        <p className="text-center text-xs text-slate-600 mt-3 font-medium">
                            NomadAI can make mistakes. Verify important travel info.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
