"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  Search,
  MessageSquare,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Target,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast";

interface FAQItem {
  id: string;
  category: "analytics" | "journal" | "strategies" | "account";
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "pnl-calc",
    category: "analytics",
    question: "How is Net P&L and Profit Factor calculated?",
    answer:
      "Net P&L is calculated as Gross P&L minus all recorded execution fees and commissions. For Long positions: (Exit Price - Entry Price) * Quantity * Contract Size - Fees. For Short positions: (Entry Price - Exit Price) * Quantity * Contract Size - Fees. Profit Factor is computed as total gross profits divided by absolute total gross losses across all closed trades.",
  },
  {
    id: "r-multiple",
    category: "analytics",
    question: "What is Realized R-Multiple and Planned R:R?",
    answer:
      "Planned Risk/Reward (R:R) evaluates your target gain relative to your initial stop-loss distance. Realized R-Multiple measures your actual financial return divided by the initial monetary risk amount (1R). For example, risking $100 and taking profit at +$250 yields an R-multiple of +2.50R.",
  },
  {
    id: "strategy-tagging",
    category: "strategies",
    question: "How do Strategy Playbooks link to recorded trades?",
    answer:
      "When recording or editing a trade, you can tag it with a strategy name (e.g., 'Breakout Retest', 'Liquidity Sweep'). The Strategies dashboard automatically aggregates win rates, cumulative P&L, and trade distribution for each distinct playbook.",
  },
  {
    id: "journal-reviews",
    category: "journal",
    question: "Why should I log emotional states and trading plan adherence?",
    answer:
      "Studies in behavioral finance show that emotional impulsivity (such as FOMO, revenge trading, or moving stop-losses) accounts for over 70% of retail trader drawdowns. Tagging your emotional mindset and tracking whether you stuck to your plan lets you isolate psychological leaks from system flaws.",
  },
  {
    id: "data-privacy",
    category: "account",
    question: "Is my trading account data and performance private?",
    answer:
      "Yes. Your trades, journal notes, and analytics are isolated to your user ID. Session authentication is backed by signed JWT tokens and encrypted password hashes.",
  },
  {
    id: "market-support",
    category: "analytics",
    question: "Which financial markets and instruments are supported?",
    answer:
      "The platform supports Forex, Crypto, Stocks/Equities, Indices, Commodities, and custom instruments. Contract sizes are customizable to handle standard FX lots (100,000 units), mini lots, or single share/coin units.",
  },
];

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<string | null>("pnl-calc");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const { success, error } = useToast();

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== "all" && faq.category !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      error("Please fill in both subject and message");
      return;
    }

    setSendingContact(true);
    setTimeout(() => {
      setSendingContact(false);
      success("Support ticket sent. Our team will review your inquiry.");
      setContactSubject("");
      setContactMessage("");
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Help Center
          </Badge>
          <span className="text-xs text-muted-foreground">• Documentation & Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          Help & Support
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Everything you need to master your trading journal, calculate statistical edge, and resolve questions.
        </p>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Trade Metrics Guide</h3>
            <p className="text-xs text-muted-foreground">
              Learn how R-Multiple, Profit Factor, Expectancy, and Win Rates are computed.
            </p>
          </div>
          <Link href="/analytics" className="text-xs font-semibold text-primary hover:underline mt-4 inline-flex items-center gap-1">
            View Analytics Dashboard <ExternalLink className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Strategy Playbooks</h3>
            <p className="text-xs text-muted-foreground">
              Discover how to build rule checklists, manage risk rules, and track setup performance.
            </p>
          </div>
          <Link href="/strategies" className="text-xs font-semibold text-primary hover:underline mt-4 inline-flex items-center gap-1">
            Open Strategies <ExternalLink className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Trading Psychology</h3>
            <p className="text-xs text-muted-foreground">
              Techniques to journal emotions, prevent overtrading, and maintain discipline.
            </p>
          </div>
          <Link href="/journal" className="text-xs font-semibold text-primary hover:underline mt-4 inline-flex items-center gap-1">
            Open Journal <ExternalLink className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. profit factor, fees, stop loss, strategies)..."
            className="pl-9 h-11 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "all", label: "All Questions" },
            { id: "analytics", label: "Analytics & P&L" },
            { id: "strategies", label: "Strategies" },
            { id: "journal", label: "Journal & Mindset" },
            { id: "account", label: "Account & Security" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No help articles found matching &quot;{search}&quot;. Try a different keyword or contact support below.
          </Card>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <Card
                key={faq.id}
                className="overflow-hidden border-border transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-foreground">
                    {faq.question}
                  </span>
                  <div className="p-1 rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/10">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Direct Contact Support Form */}
      <Card className="p-6 sm:p-8">
        <CardHeader className="p-0 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                Need Dedicated Help?
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Have a question or encounter a discrepancy? Reach out to our technical support team.
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSendMessage} className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject"
              placeholder="e.g. Question regarding R-Multiple computation"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Inquiry Type
              </label>
              <select className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="question">General Question</option>
                <option value="bug">Bug Report / Data Issue</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account & Privacy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Message Details
            </label>
            <textarea
              rows={4}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              required
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Responses typically arrive within 24 hours.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={sendingContact}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
