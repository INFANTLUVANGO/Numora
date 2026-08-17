import {
  BadgeIndianRupee,
  Gem,
  House,
  Landmark,
  PlaneTakeoff,
  Route,
  Repeat2,
  Scale,
  ScanLine,
  Sunset,
  TrendingUp,
  Umbrella,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'badge-indian-rupee': BadgeIndianRupee,
  gem: Gem,
  house: House,
  landmark: Landmark,
  'plane-takeoff': PlaneTakeoff,
  route: Route,
  'repeat-2': Repeat2,
  scale: Scale,
  'scan-line': ScanLine,
  stairs: TrendingUp,
  sunset: Sunset,
  'trending-up': TrendingUp,
  umbrella: Umbrella,
  'users-round': UsersRound,
  'wallet-cards': WalletCards,
}

export function NumoraIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? BadgeIndianRupee
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
