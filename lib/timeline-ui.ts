import type { TimelineDocument, TimelineType } from "@/data/timeline";

export type CardAccent = "teal" | "amber" | "red" | "purple" | "green";

const accent: Record<CardAccent, { border: string; bg: string; dot: string; stem: string; text: string; badge: string }> = {
  teal: {
    border: "border-teal",
    bg: "bg-teal/[0.15]",
    dot: "bg-teal",
    stem: "bg-teal/50",
    text: "text-teal",
    badge: "text-teal",
  },
  amber: {
    border: "border-amber",
    bg: "bg-amber/[0.15]",
    dot: "bg-amber",
    stem: "bg-amber/50",
    text: "text-amber",
    badge: "text-amber",
  },
  red: {
    border: "border-red",
    bg: "bg-red/[0.15]",
    dot: "bg-red",
    stem: "bg-red/50",
    text: "text-red",
    badge: "text-red",
  },
  purple: {
    border: "border-purple",
    bg: "bg-purple/[0.15]",
    dot: "bg-purple",
    stem: "bg-purple/50",
    text: "text-purple",
    badge: "text-purple",
  },
  green: {
    border: "border-green",
    bg: "bg-green/[0.15]",
    dot: "bg-green",
    stem: "bg-green/50",
    text: "text-green",
    badge: "text-green",
  },
};

export function getAccentClasses(a: CardAccent) {
  return accent[a];
}

/**
 * Teal: no / zero flags (non-reference)
 * 1-2: amber, 3+: red, financial: green, reference / PPM: purple
 */
export function getCardAccent(doc: TimelineDocument): CardAccent {
  if (doc.type === "financial") return "green";
  if (doc.type === "reference" || (doc.isReference && doc.type === "ppm")) {
    return "purple";
  }
  if (doc.flagCount >= 3) return "red";
  if (doc.flagCount >= 1) return "amber";
  return "teal";
}

const typeAbbr: Record<TimelineType, string> = {
  investor_update: "U",
  ppm: "P",
  financial: "F",
  captable: "C",
  pitch_deck: "I",
  board_deck: "B",
  side_letter: "L",
  reference: "R",
};

export function typeLetter(doc: TimelineDocument): string {
  if (doc.type === "investor_update" && doc.label.match(/update/i)) {
    const m = doc.label.match(/(\d+)/);
    if (m) return m[1]!.length <= 2 ? m[1]! : m[1]!.slice(0, 2);
  }
  return typeAbbr[doc.type];
}
