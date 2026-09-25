import {
  BadgeCheck,
  Ban,
  HeartHandshake,
  LockKeyhole,
  MessageCircleWarning,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

export const communityGuidelinesData = {
  hero: {
    eyebrow: "Community Guidelines",
    title: "Build a better",
    highlightedTitle: "Mystery Mansion.",
    description:
      "Mystery Mansion is built around a community of providers and clients. These guidelines help keep interactions respectful, authentic, and safer for everyone using the platform.",
    updatedLabel: "Community Guidelines",
  },

  introduction: {
    eyebrow: "Our Standard",
    title: "Respect the people behind every profile.",
    description:
      "Every account represents a real person or business using Mystery Mansion. Use the platform honestly, respect boundaries, protect personal information, and help keep the community welcoming.",
  },

  guidelines: [
    {
      title: "Respect Others",
      description:
        "Treat providers, clients, and other members with basic respect. Harassment, intimidation, threats, targeted abuse, and repeated unwanted contact are not appropriate.",
      icon: HeartHandshake,
    },
    {
      title: "Keep Interactions Consensual",
      description:
        "Respect clearly communicated boundaries. Do not pressure another person to continue a conversation, interaction, or request after they have indicated that they do not want to continue.",
      icon: UserRoundCheck,
    },
    {
      title: "Be Authentic",
      description:
        "Use accurate information when creating and maintaining your account. Do not intentionally impersonate another person, create deceptive profiles, or misrepresent your identity in a way intended to mislead others.",
      icon: BadgeCheck,
    },
    {
      title: "Protect Personal Information",
      description:
        "Do not publish, distribute, threaten to distribute, or use another person's private information without appropriate permission. Respect the privacy of everyone you interact with.",
      icon: LockKeyhole,
    },
    {
      title: "No Threats or Harm",
      description:
        "Threats of violence, coercion, stalking, extortion, or other behavior intended to cause harm are not permitted on the platform.",
      icon: ShieldCheck,
    },
    {
      title: "No Fraud or Deception",
      description:
        "Do not use Mystery Mansion to conduct scams, fraudulent transactions, financial deception, or other activity intended to unlawfully obtain money, information, or access.",
      icon: Ban,
    },
    {
      title: "Keep Reports Honest",
      description:
        "Use reporting and moderation tools responsibly. Do not submit knowingly false reports or use reports to harass, retaliate against, or unfairly target another member.",
      icon: MessageCircleWarning,
    },
    {
      title: "Follow the Law",
      description:
        "Do not use Mystery Mansion for illegal activity or to facilitate unlawful conduct. Content and activity must comply with applicable laws and platform requirements.",
      icon: ShieldCheck,
    },
  ],

  moderation: {
    eyebrow: "Enforcement",
    title: "Keeping the community accountable.",
    description:
      "Mystery Mansion may review reported activity and take action when accounts or content violate these guidelines, applicable policies, or platform requirements.",
    items: [
      "Content may be reviewed when it is reported or identified through platform safety processes.",
      "Accounts or content may be limited, removed, suspended, or otherwise restricted when appropriate.",
      "Serious or repeated violations may result in stronger account restrictions.",
      "Reports involving immediate threats or potentially illegal activity may require additional action.",
    ],
  },

  closing: {
    eyebrow: "Be Part of the Community",
    title: "Use the platform with intention.",
    description:
      "A strong community depends on people treating one another with respect, protecting boundaries, and using the platform responsibly.",
  },
};