"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Share2,
  Users,
  Copy,
  Check,
  Globe2,
  Filter,
  CheckCircle2,
  ArrowRight,
  Flame,
  Clock,
  ThumbsUp,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { cn, formatDateTime } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  channel: string;
  timestamp: string;
  likes: number;
}

interface SharedSignal {
  id: string;
  authorName: string;
  pair: string;
  direction: "BUY" | "SELL";
  timeframe: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  confluence: string;
  createdAt: string;
  likes: number;
}

const CHANNELS = [
  { id: "general", name: "#general-chat", desc: "Ethiopian & global forex trader discussion" },
  { id: "gold", name: "#gold-xauusd", desc: "Gold price action, London & NY volatility" },
  { id: "eurusd", name: "#eurusd-gbpusd", desc: "Major forex pairs & session liquidity sweeps" },
  { id: "psychology", name: "#discipline-mindset", desc: "Dealing with tilt, patience, and risk" },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"chat" | "signals">("chat");
  const [activeChannel, setActiveChannel] = useState("general");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tj_community_messages");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "msg-1",
        senderName: "Abebe Trader",
        senderRole: "Forex Specialist",
        text: "London session open swept Asian session lows on EURUSD. Watching for 15m bullish displacement.",
        channel: "general",
        timestamp: "10 mins ago",
        likes: 4,
      },
      {
        id: "msg-2",
        senderName: "Blen FX",
        senderRole: "Gold Scalper",
        text: "Gold (XAUUSD) holding $2,380 support tightly before US session news. Remember to manage your lot sizes!",
        channel: "gold",
        timestamp: "5 mins ago",
        likes: 6,
      },
    ];
  });
  const [newMessageText, setNewMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Signals Feed State
  const [signals, setSignals] = useState<SharedSignal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tj_shared_signals");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Signal Share Modal
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [signalPair, setSignalPair] = useState("EUR/USD");
  const [signalDirection, setSignalDirection] = useState<"BUY" | "SELL">("BUY");
  const [signalTimeframe, setSignalTimeframe] = useState("15m");
  const [signalEntry, setSignalEntry] = useState("");
  const [signalSL, setSignalSL] = useState("");
  const [signalTP, setSignalTP] = useState("");
  const [signalConfluence, setSignalConfluence] = useState("");
  const [copiedSignalId, setCopiedSignalId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tj_community_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tj_shared_signals", JSON.stringify(signals));
    }
  }, [signals]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: user?.name || "Retail Trader",
      senderRole: "Trader",
      text: newMessageText.trim(),
      channel: activeChannel,
      timestamp: "Just now",
      likes: 0,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleLikeMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
  };

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalEntry || !signalSL || !signalTP) {
      error("Please fill in Entry, Stop Loss, and Take Profit.");
      return;
    }

    const entryNum = Number(signalEntry);
    const slNum = Number(signalSL);
    const tpNum = Number(signalTP);
    const risk = Math.abs(entryNum - slNum);
    const reward = Math.abs(tpNum - entryNum);
    const rrRatio = risk > 0 ? `1:${(reward / risk).toFixed(1)}` : "1:2";

    const newSig: SharedSignal = {
      id: `sig-${Date.now()}`,
      authorName: user?.name || "Retail Trader",
      pair: signalPair,
      direction: signalDirection,
      timeframe: signalTimeframe,
      entryPrice: entryNum,
      stopLoss: slNum,
      takeProfit: tpNum,
      riskReward: rrRatio,
      confluence: signalConfluence || "Market structure alignment",
      createdAt: "Just now",
      likes: 0,
    };

    setSignals((prev) => [newSig, ...prev]);
    setSignalModalOpen(false);
    setSignalEntry("");
    setSignalSL("");
    setSignalTP("");
    setSignalConfluence("");
    success("Trade signal posted to community feed!");
  };

  const handleCopySignal = (sig: SharedSignal) => {
    const text = `Trade Signal: ${sig.pair} ${sig.direction} | Entry: ${sig.entryPrice} | SL: ${sig.stopLoss} | TP: ${sig.takeProfit} | R:R: ${sig.riskReward}`;
    navigator.clipboard.writeText(text);
    setCopiedSignalId(sig.id);
    setTimeout(() => setCopiedSignalId(null), 2000);
    success("Signal copied to clipboard! You can paste in your Trade Plan.");
  };

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Forex Community & Signal Hub
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
              • Live Room
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discuss market structure with fellow retail traders in Ethiopia and worldwide, share actionable trade setups, and collaborate.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "chat"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Trader Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("signals")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "signals"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Shared Signals ({signals.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Trader Chat */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Discussion Channels
            </span>
            <div className="space-y-1">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-2xl transition-all cursor-pointer",
                    activeChannel === ch.id
                      ? "bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/10 shadow-xs"
                      : "hover:bg-slate-100/70 dark:hover:bg-white/[0.03] text-slate-600 dark:text-slate-400"
                  )}
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    {ch.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {ch.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 text-xs space-y-2 mt-4">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                🇪🇹 Ethiopian Retail Traders
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect and share session observations during the London open (11:00 AM EAT) and New York open (4:00 PM EAT).
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col h-[560px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {CHANNELS.find((c) => c.id === activeChannel)?.name}
                </span>
                <p className="text-xs text-slate-400">
                  {CHANNELS.find((c) => c.id === activeChannel)?.desc}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Traders Online
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No messages in this channel yet.</p>
                  <p className="text-[11px]">Be the first to share your market view!</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {msg.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500">
                          {msg.senderRole}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/[0.04]">
                        {msg.text}
                      </p>
                      <button
                        onClick={() => handleLikeMessage(msg.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 mt-1 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{msg.likes > 0 ? msg.likes : "Like"}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={`Message ${CHANNELS.find((c) => c.id === activeChannel)?.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Shared Signals Feed */}
      {activeTab === "signals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Community shared setups: High-confluence entries, risk-to-reward ratios, and stop losses.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSignalModalOpen(true)}
              className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Post Trade Signal
            </Button>
          </div>

          {signals.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                No trade signals shared yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Found a clean setup on EURUSD, Gold (XAUUSD), or GBPUSD? Be the first to share your analysis with the community!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSignalModalOpen(true)}
                className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Post First Signal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.map((sig) => (
                <Card
                  key={sig.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {sig.pair}
                      </span>
                      <span
                        className={cn(
                          "font-bold text-xs px-2.5 py-0.5 rounded-full",
                          sig.direction === "BUY"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                        )}
                      >
                        {sig.direction}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {sig.timeframe}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      By {sig.authorName} • {sig.createdAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {sig.entryPrice}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-600">
                      <span className="text-[10px] text-rose-400 block font-medium">Stop Loss</span>
                      <span className="font-extrabold">
                        {sig.stopLoss}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600">
                      <span className="text-[10px] text-emerald-400 block font-medium">Target (TP)</span>
                      <span className="font-extrabold">
                        {sig.takeProfit}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/[0.04]">
                    💡 <strong>Analysis:</strong> {sig.confluence}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Planned R:R: {sig.riskReward}
                    </span>
                    <button
                      onClick={() => handleCopySignal(sig)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {copiedSignalId === sig.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSignalId === sig.id ? "Copied!" : "Copy Signal"}</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Signal Modal */}
      {signalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setSignalModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Share Trade Signal With Community
            </h3>

            <form onSubmit={handleCreateSignal} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Pair</label>
                  <select
                    value={signalPair}
                    onChange={(e) => setSignalPair(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="XAU/USD">XAU/USD (Gold)</option>
                    <option value="USD/JPY">USD/JPY</option>
                    <option value="BTC/USD">BTC/USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Direction</label>
                  <select
                    value={signalDirection}
                    onChange={(e) => setSignalDirection(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="BUY">BUY / LONG</option>
                    <option value="SELL">SELL / SHORT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    value={signalEntry}
                    onChange={(e) => setSignalEntry(e.target.value)}
                    required
                    placeholder="1.0850"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    value={signalSL}
                    onChange={(e) => setSignalSL(e.target.value)}
                    required
                    placeholder="1.0820"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    value={signalTP}
                    onChange={(e) => setSignalTP(e.target.value)}
                    required
                    placeholder="1.0920"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Analysis / Confluence Reason</label>
                <textarea
                  rows={3}
                  value={signalConfluence}
                  onChange={(e) => setSignalConfluence(e.target.value)}
                  placeholder="e.g. London session liquidity sweep, 15m order block tap with clean rejection..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSignalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Publish Signal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
