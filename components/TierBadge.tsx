import type { HotelTier } from "@/types/hotel";

const STYLES: Record<HotelTier, string> = {
  A: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  B: "bg-green-100 text-green-800 border border-green-200",
  C: "bg-orange-100 text-orange-800 border border-orange-200",
  D: "bg-red-100 text-red-800 border border-red-200",
};

const LABELS: Record<HotelTier, string> = {
  A: "🏆 A",
  B: "✅ B",
  C: "⚠️ C",
  D: "❌ D",
};

export function TierBadge({ tier }: { tier: HotelTier }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${STYLES[tier]}`}>
      {LABELS[tier]}
    </span>
  );
}
