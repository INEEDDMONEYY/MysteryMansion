import {
  BadgeCheck,
  BarChart3,
  Crown,
  Flag,
  Gift,
  Medal,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const milestonesPageData = {
  hero: {
    eyebrow: "Mystery Mansion Milestones",
    title: "Progress that",
    highlightedTitle: "means something.",
    description:
      "Milestones give providers and clients a clear way to recognize meaningful participation, activity, and progression across the Mystery Mansion platform.",
    primaryCta: {
      label: "Explore Milestones",
      href: "#milestones",
    },
    secondaryCta: {
      label: "Community Guidelines",
      href: "/community-guidelines",
    },
    visual: {
      label: "Platform Progression",
      title: "Keep moving forward",
      steps: [
        "Create your account",
        "Complete meaningful activity",
        "Reach milestone requirements",
        "Unlock recognition and progression",
      ],
    },
  },

  overview: {
    eyebrow: "Why Milestones",
    title: "A platform built around progression.",
    description:
      "Milestones help turn everyday platform activity into visible progression. They are designed to recognize participation while giving members something meaningful to work toward.",
    items: [
      {
        title: "Clear Progress",
        description:
          "Understand where you are in your platform journey and what meaningful activity can move you forward.",
        icon: BarChart3,
      },
      {
        title: "Recognition",
        description:
          "Milestones can recognize important moments and accomplishments throughout your Mystery Mansion experience.",
        icon: Medal,
      },
      {
        title: "Motivation",
        description:
          "Progression gives members additional reasons to stay active and continue building their presence on the platform.",
        icon: Rocket,
      },
      {
        title: "Community Growth",
        description:
          "Meaningful participation contributes to a stronger and more engaged Mystery Mansion community.",
        icon: Users,
      },
    ],
  },

  tracks: {
    eyebrow: "Two Progression Paths",
    title: "Milestones for every side of the platform.",
    description:
      "Providers and clients have different platform goals, so their milestone progression can reflect the way they use Mystery Mansion.",
    provider: {
      label: "Provider Milestones",
      title: "Build your presence.",
      description:
        "Provider milestones focus on meaningful participation, profile development, platform activity, and continued growth.",
      icon: Crown,
      milestones: [
        {
          title: "Get Started",
          description:
            "Complete your account and establish your initial presence on Mystery Mansion.",
          icon: Flag,
        },
        {
          title: "Build Your Profile",
          description:
            "Continue developing your profile and maintaining the information that represents you on the platform.",
          icon: UserRoundCheck,
        },
        {
          title: "Stay Active",
          description:
            "Reach meaningful activity milestones through continued participation and platform usage.",
          icon: TrendingUp,
        },
        {
          title: "Build Recognition",
          description:
            "Continue progressing toward higher levels of platform recognition as your activity grows.",
          icon: Star,
        },
      ],
    },
    client: {
      label: "Client Milestones",
      title: "Explore and engage.",
      description:
        "Client milestones focus on meaningful platform participation, engagement, and continued use of Mystery Mansion.",
      icon: Sparkles,
      milestones: [
        {
          title: "Get Started",
          description:
            "Create your account and begin exploring what Mystery Mansion has to offer.",
          icon: Flag,
        },
        {
          title: "Discover",
          description:
            "Explore providers, categories, profiles, and other areas of the platform.",
          icon: Target,
        },
        {
          title: "Engage",
          description:
            "Continue participating in meaningful platform activity and interactions.",
          icon: MessageCircle,
        },
        {
          title: "Build Progress",
          description:
            "Keep using the platform and work toward higher levels of client progression.",
          icon: TrendingUp,
        },
      ],
    },
  },

  principles: {
    eyebrow: "How Milestones Work",
    title: "Progress should be meaningful.",
    description:
      "Milestones are intended to recognize genuine participation rather than encourage artificial activity or behavior that does not benefit the community.",
    items: [
      {
        title: "Meaningful Activity",
        description:
          "Milestone progress is tied to platform activity that has a meaningful connection to the member's experience.",
        icon: ShieldCheck,
      },
      {
        title: "Consistent Progress",
        description:
          "Some milestones may require continued participation rather than a single action.",
        icon: TrendingUp,
      },
      {
        title: "Fair Recognition",
        description:
          "Milestone recognition is designed around the member's role and the way they use the platform.",
        icon: BadgeCheck,
      },
      {
        title: "Evolving System",
        description:
          "Milestones may be updated as Mystery Mansion develops new features and improves the platform.",
        icon: Sparkles,
      },
    ],
  },

  closing: {
    eyebrow: "Keep Progressing",
    title: "Every milestone starts with the next step.",
    description:
      "Whether you're building your provider presence or exploring the platform as a client, meaningful participation is what moves your journey forward.",
  },
};