import {
  Info,
  FileText,
  Globe,
  Linkedin,
  MessageCircle,
  Youtube,
  Github,
  Link as LinkIcon,
  Mail,
  Instagram,
  Facebook,
  Camera,
  ArrowUpCircle,
} from "lucide-react";

/**
 * Icon component mapping for nanocard insights
 */
export const iconComponents = {
  information: Info,
  whitePaper: FileText,
  officialSite: Globe,
  linkedin: Linkedin,
  discord: MessageCircle,
  youtube: Youtube,
  github: Github,
  link: LinkIcon,
  email: Mail,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Camera,
  supabase: ArrowUpCircle,
} as const;

/**
 * Human-readable labels for insight types
 */
export const iconLabels: Record<keyof typeof iconComponents, string> = {
  information: "Info",
  whitePaper: "Paper",
  officialSite: "Site",
  linkedin: "LinkedIn",
  discord: "Discord",
  youtube: "YouTube",
  github: "GitHub",
  link: "Link",
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  supabase: "Supabase",
};
