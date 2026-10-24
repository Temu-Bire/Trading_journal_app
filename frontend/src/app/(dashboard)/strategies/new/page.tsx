"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { saveStrategy } from "@/lib/strategies";

export default function CreateStrategyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMarket, setFormMarket] = useState("forex");
  const [formSymbols, setFormSymbols] = useState("");
  const [formEntryRules, setFormEntryRules] = useState("");
  const [formExitRules, setFormExitRules] = useState("");
  const [formRiskRules, setFormRiskRules] = useState("");
  const [formTags, setFormTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error("Strategy name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const entryRules = formEntryRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const exitRules = formExitRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const riskRules = formRiskRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      saveStrategy(
        {
          name: formName.trim(),
          description: formDescription.trim(),
          market: formMarket,
          symbols: formSymbols.trim(),
          entryRules: entryRules.length ? entryRules : ["Follow confirmation setup"],
          exitRules: exitRules.length ? exitRules : ["Target 2.0R or trailing stop"],
          riskRules: riskRules.length ? riskRules : ["1% account risk limit"],
          tags: tags.length ? tags : ["Standard"],
        },
        user?.id
      );

      success("New strategy playbook created!");
      router.push("/strategies");
    } catch {
      error("Failed to save strategy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/strategies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Strategies
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="pb-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            New Strategy Playbook
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Define your trading rules, execution parameters, and risk management guidelines.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Strategy Name *"
              placeholder="e.g. Trend Breakout"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Select
              label="Target Market"
              value={formMarket}
              onChange={(e) => setFormMarket(e.target.value)}
              options={[
                { value: "forex", label: "Forex" },
                { value: "crypto", label: "Crypto" },
                { value: "stocks", label: "Stocks" },
                { value: "indices", label: "Indices" },
                { value: "commodities", label: "Commodities" },
                { value: "all", label: "All Markets" },
              ]}
            />
          </div>

          <Input
            label="Target Symbols"
            placeholder="e.g. EURUSD, GBPUSD"
            value={formSymbols}
            onChange={(e) => setFormSymbols(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of this strategy premise..."
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Entry Rules (one per line)
            </label>
            <textarea
              rows={3}
              value={formEntryRules}
              onChange={(e) => setFormEntryRules(e.target.value)}
              placeholder="e.g. Break above 20 EMA&#10;RSI confirmation above 50"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Exit Rules (one per line)
              </label>
              <textarea
                rows={3}
                value={formExitRules}
                onChange={(e) => setFormExitRules(e.target.value)}
                placeholder="e.g. Take profit at 2R&#10;Move SL to breakeven at 1R"
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Risk Controls (one per line)
              </label>
              <textarea
                rows={3}
                value={formRiskRules}
                onChange={(e) => setFormRiskRules(e.target.value)}
                placeholder="e.g. Max 1% risk per trade&#10;Hard stop below recent swing low"
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>
          </div>

          <Input
            label="Tags"
            placeholder="e.g. Scalping, Breakout"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Link href="/strategies">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Strategy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
