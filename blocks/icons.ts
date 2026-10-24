// A curated set keeps the select field short and the bundle small.
import {
  BadgeCheck,
  Clock,
  Globe,
  Heart,
  Layers,
  type LucideIcon,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react"

export const FEATURE_ICONS = {
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  rocket: Rocket,
  users: Users,
  heart: Heart,
  clock: Clock,
  layers: Layers,
  wrench: Wrench,
  "badge-check": BadgeCheck,
} satisfies Record<string, LucideIcon>

export type FeatureIconName = keyof typeof FEATURE_ICONS
export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS) as [
  FeatureIconName,
  ...FeatureIconName[],
]
