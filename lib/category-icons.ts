import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  BookText,
  Coins,
  Heart,
  HelpingHand,
  Landmark,
  LifeBuoy,
  MoonStar,
  Salad,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';

export type CategoryIconComponent = LucideIcon;

type CategoryIconInfo = {
  regex: RegExp;
  icon: LucideIcon;
  emoji: string;
};

const CATEGORY_ICONS: CategoryIconInfo[] = [
  { regex: /ibadet/i, icon: Landmark, emoji: '🕌' },
  { regex: /inan[çc]/i, icon: ShieldCheck, emoji: '🛡️' },
  { regex: /(ahlak|tasavvuf)/i, icon: Heart, emoji: '❤️' },
  { regex: /(aile|sosyal)/i, icon: Users, emoji: '👨‍👩‍👧' },
  { regex: /(muamelat|ekonomi|ticaret|finans)/i, icon: Coins, emoji: '💰' },
  { regex: /helal|g[ıi]da/i, icon: Salad, emoji: '🥗' },
  { regex: /(mahremiyet|tesett[üu]r)/i, icon: LifeBuoy, emoji: '🧕' },
  { regex: /(islam|ilim)/i, icon: BookText, emoji: '📖' },
  { regex: /(ölüm|olum|ahiret)/i, icon: MoonStar, emoji: '🌙' },
  { regex: /(sa[ğg]l[ıi]k)/i, icon: Stethoscope, emoji: '🩺' },
  { regex: /(genel|soru)/i, icon: HelpingHand, emoji: '❓' },
];

const DEFAULT_ICON: CategoryIconInfo = {
  regex: /.*/,
  icon: BookOpen,
  emoji: '📘',
};

export function getCategoryIconInfo(name: string | undefined | null): CategoryIconInfo {
  const safe = name?.trim() ?? '';
  if (!safe) return DEFAULT_ICON;
  const match = CATEGORY_ICONS.find(entry => entry.regex.test(safe));
  return match ?? DEFAULT_ICON;
}

export function getCategoryIconComponent(name: string | undefined | null): LucideIcon {
  return getCategoryIconInfo(name).icon;
}

export function getCategoryEmoji(name: string | undefined | null): string {
  return getCategoryIconInfo(name).emoji;
}
