import {
  ArrowRight,
  BadgeCheck,
  Gift,
  Link2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

export const referralsPageData = {
  hero: {
    eyebrow: "Provider Referrals",
    title: "Bring someone",
    highlightedTitle: "into the community.",
    description:
      "Mystery Mansion referrals give providers a simple way to invite potential clients to join the platform and begin exploring.",
    primaryCta: {
      label: "How Referrals Work",
      href: "*",
    },
    secondaryCta: {
      label: "Become a Client",
      href: "/signup?type=client",
    },
    visual: {
      label: "Referral Flow",
      title: "From invitation to account",
      steps: [
        "Provider shares a referral link",
        "Visitor opens the invitation",
        "Mystery Mansion identifies the referral",
        "Visitor continues to Client registration",
      ],
    },
  },

  overview: {
    eyebrow: "The Referral Program",
    title: "A simple way to invite new clients.",
    description:
      "Providers can share referral links with people they want to introduce to Mystery Mansion. The public referral experience explains who invited the visitor and provides a clear path into the platform.",
    items: [
      {
        title: "Share a Link",
        description:
          "Providers can generate or receive a referral link to share with a potential client.",
        icon: Link2,
      },
      {
        title: "Identify the Invitation",
        description:
          "When a visitor opens the link, Mystery Mansion can associate the visit with the referring provider.",
        icon: BadgeCheck,
      },
      {
        title: "Welcome the Visitor",
        description:
          "The public landing page explains that the visitor was invited by a provider and introduces the next step.",
        icon: Users,
      },
      {
        title: "Start the Journey",
        description:
          "Visitors can continue into the Client registration and account setup experience.",
        icon: UserPlus,
      },
    ],
  },

  howItWorks: {
    eyebrow: "How It Works",
    title: "The referral journey.",
    description:
      "The public experience is designed to keep the referral journey clear from the first click through the beginning of account setup.",
    steps: [
      {
        number: "01",
        title: "Provider Shares a Referral",
        description:
          "A provider generates or receives a referral link and shares it with a potential client.",
        icon: Link2,
      },
      {
        number: "02",
        title: "Visitor Opens the Link",
        description:
          "The potential client follows the referral link and arrives at the public referral experience.",
        icon: ArrowRight,
      },
      {
        number: "03",
        title: "Referral Source Is Identified",
        description:
          "Mystery Mansion identifies the provider associated with the referral before showing the landing page.",
        icon: BadgeCheck,
      },
      {
        number: "04",
        title: "Provider Invitation Is Shown",
        description:
          "The visitor sees a public page explaining that they were invited by the provider.",
        icon: MessageCircle,
      },
      {
        number: "05",
        title: "Visitor Continues",
        description:
          "The visitor can choose to continue into the Client registration and account setup process.",
        icon: UserPlus,
      },
      {
        number: "06",
        title: "Progress Can Be Tracked",
        description:
          "Referral activity can support administrative tracking and provider milestone progression.",
        icon: Target,
      },
    ],
  },

  benefits: {
    eyebrow: "Why Referrals",
    title: "Built around a clear invitation.",
    description:
      "Referral links create a direct connection between a provider's invitation and a new visitor's introduction to Mystery Mansion.",
    items: [
      {
        title: "Direct Invitations",
        description:
          "Give potential clients a direct path into the platform instead of sending them through a generic entry point.",
        icon: Link2,
      },
      {
        title: "Clear Attribution",
        description:
          "The referral experience can identify which provider sent the invitation.",
        icon: BadgeCheck,
      },
      {
        title: "Easy Onboarding",
        description:
          "Visitors can move directly from the invitation into the Client registration experience.",
        icon: UserPlus,
      },
      {
        title: "Meaningful Progress",
        description:
          "Referral activity can contribute to provider progression and milestone systems.",
        icon: Sparkles,
      },
    ],
  },

  standards: {
    eyebrow: "Referral Standards",
    title: "Keep invitations authentic.",
    description:
      "The referral system works best when links are shared intentionally and visitors understand who invited them.",
    items: [
      "Referral links should be shared with people who may genuinely be interested in the platform.",
      "Providers should not misrepresent Mystery Mansion or the purpose of the referral.",
      "Visitors should be able to clearly identify the provider associated with their invitation.",
      "Referral activity should not be manipulated through fraudulent, automated, or deceptive behavior.",
      "Referral program rules may evolve as Mystery Mansion expands its referral and milestone systems.",
    ],
  },

  closing: {
    eyebrow: "Invite Someone New",
    title: "Your next referral starts with one link.",
    description:
      "A clear invitation can give a potential client a direct introduction to Mystery Mansion and the community waiting for them.",
  },
};