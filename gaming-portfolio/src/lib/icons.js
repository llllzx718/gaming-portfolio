import {
  Activity,
  Crosshair,
  Crown,
  Percent,
  Shield,
  Star,
  Sword,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

const ICONS = {
  activity: Activity,
  crosshair: Crosshair,
  crown: Crown,
  percent: Percent,
  shield: Shield,
  star: Star,
  sword: Sword,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

export function getIcon(name) {
  return ICONS[name] || Target;
}
