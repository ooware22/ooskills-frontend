/**
 * Category icons, shared by the admin category editor (which saves these names
 * to Category.icon) and every public page that displays categories.
 *
 * Keep this the only list: when the admin and the courses page each had their
 * own map, the courses page didn't know most of the names the admin saved and
 * showed a generic cube for them.
 */
import type { ComponentType, SVGProps } from "react";
import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalculatorIcon,
  CameraIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CubeIcon,
  GlobeAltIcon,
  HeartIcon,
  LanguageIcon,
  LightBulbIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  StarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Icons the admin can pick. The keys are the values stored on Category.icon. */
export const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  star: StarIcon,
  code: CodeBracketIcon,
  briefcase: BriefcaseIcon,
  palette: PaintBrushIcon,
  globe: GlobeAltIcon,
  book: BookOpenIcon,
  music: MusicalNoteIcon,
  camera: CameraIcon,
  heart: HeartIcon,
  chart: ChartBarIcon,
  calculator: CalculatorIcon,
  cpu: CpuChipIcon,
  academic: AcademicCapIcon,
  lightbulb: LightBulbIcon,
  wrench: WrenchScrewdriverIcon,
  rocket: RocketLaunchIcon,
  shield: ShieldCheckIcon,
  cube: CubeIcon,
};

/** Names the public courses page used to understand, kept so older values still render. */
const LEGACY_ICON_NAMES: Record<string, IconComponent> = {
  science: BeakerIcon,
  language: LanguageIcon,
  computer: ComputerDesktopIcon,
  business: BriefcaseIcon,
  art: PaintBrushIcon,
  health: HeartIcon,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP);

export function getCategoryIcon(name?: string | null): IconComponent {
  if (!name) return CubeIcon;
  return CATEGORY_ICON_MAP[name] || LEGACY_ICON_NAMES[name] || CubeIcon;
}
