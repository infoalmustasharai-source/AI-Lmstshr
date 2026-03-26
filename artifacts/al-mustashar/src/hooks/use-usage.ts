import { useState, useEffect } from "react";

const STORAGE_KEY = "al_mustashar_usage";
const FREE_LIMIT = 3;

interface UsageData {
  analysesCount: number;
  plan: "free" | "basic" | "pro" | "enterprise";
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { analysesCount: 0, plan: "free" };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  const canAnalyze = usage.plan !== "free" || usage.analysesCount < FREE_LIMIT;
  const remaining = usage.plan !== "free" ? Infinity : Math.max(0, FREE_LIMIT - usage.analysesCount);
  const isLimitReached = usage.plan === "free" && usage.analysesCount >= FREE_LIMIT;

  const incrementUsage = () => {
    if (usage.plan === "free") {
      setUsage((prev) => ({ ...prev, analysesCount: prev.analysesCount + 1 }));
    }
  };

  const upgradePlan = (plan: "basic" | "pro" | "enterprise") => {
    setUsage({ analysesCount: 0, plan });
  };

  return { usage, canAnalyze, remaining, isLimitReached, incrementUsage, upgradePlan, FREE_LIMIT };
}
