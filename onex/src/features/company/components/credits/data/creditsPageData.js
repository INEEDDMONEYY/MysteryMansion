import {
  BadgeCheck,
  CreditCard,
  Gift,
  Rocket,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

export const creditsPageData = {
  hero: {
    eyebrow: "Mystery Mansion Credits",
    title: "More ways to use",
    highlightedTitle: "Mystery Mansion.",
    description:
      "Credits give you a simple way to access eligible platform features without having to manage each feature as a separate purchase.",
    primaryCta: {
      label: "View Credit Options",
      href: "*",
    },
    secondaryCta: {
      label: "Create an Account",
      href: "/signup",
    },
    visual: {
      label: "Credit System",
      title: "How credits work",
      steps: [
        "Purchase or receive credits",
        "Keep credits in your account",
        "Use credits on eligible features",
        "Track your remaining balance",
      ],
    },
  },

  overview: {
    eyebrow: "One Balance",
    title: "A simpler way to use platform features.",
    description:
      "Mystery Mansion credits are designed to give users one account-based balance that can be used across eligible platform features.",
    items: [
      {
        title: "One Credit Balance",
        description:
          "Keep your available credits in one place and use them when an eligible feature requires them.",
        icon: WalletCards,
      },
      {
        title: "Flexible Usage",
        description:
          "Use credits when you need them instead of managing multiple feature-specific payment methods.",
        icon: Sparkles,
      },
      {
        title: "Clear Transactions",
        description:
          "Keep track of credit purchases, usage, and remaining balances through your account.",
        icon: CreditCard,
      },
      {
        title: "Account Protection",
        description:
          "Credits stay associated with your account so your balance and eligible usage can be managed in one place.",
        icon: ShieldCheck,
      },
    ],
  },

  howItWorks: {
    eyebrow: "How It Works",
    title: "Credits are simple by design.",
    description:
      "The system is built around a straightforward cycle: add credits, keep your balance, and use them when an eligible platform feature requires them.",
    steps: [
      {
        number: "01",
        title: "Add Credits",
        description:
          "Purchase an available credit package or receive credits through an eligible platform action.",
        icon: CreditCard,
      },
      {
        number: "02",
        title: "Keep Your Balance",
        description:
          "Your available credits remain associated with your account so you can use them when needed.",
        icon: WalletCards,
      },
      {
        number: "03",
        title: "Use Eligible Features",
        description:
          "Apply credits toward eligible Mystery Mansion features when an applicable feature requires them.",
        icon: Rocket,
      },
      {
        number: "04",
        title: "Track Your Activity",
        description:
          "Review your available balance and credit activity from your account.",
        icon: BadgeCheck,
      },
    ],
  },

  benefits: {
    eyebrow: "Why Credits",
    title: "Built around flexibility.",
    description:
      "Credits make it easier to manage access to eligible features while keeping your platform balance centralized.",
    items: [
      {
        title: "Simple",
        description:
          "A straightforward credit balance keeps platform usage easier to understand.",
        icon: Sparkles,
      },
      {
        title: "Flexible",
        description:
          "Use credits when eligible features require them instead of paying separately every time.",
        icon: WalletCards,
      },
      {
        title: "Trackable",
        description:
          "Keep your credit activity and remaining balance tied to your account.",
        icon: BadgeCheck,
      },
      {
        title: "Available",
        description:
          "Credit packages can provide another way to access eligible platform functionality.",
        icon: Gift,
      },
    ],
  },
};