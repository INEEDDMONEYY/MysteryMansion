import {
  BadgeCheck,
  CreditCard,
  Gift,
  Rocket,
  ShieldCheck,
  Sparkles,
  WalletCards,
  CircleHelp,
  Coins,
  History,
  Info,
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
      href: "/credit-packages",
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

export const creditsLearnMoreData = {
  hero: {
    eyebrow: "The Mystery Mansion Credit System",
    title: "Everything you need to know about",
    highlightedTitle: "credits.",
    description:
      "Learn how Mystery Mansion credits work, how to add them to your account, where they can be used, and how to keep track of your balance.",
    primaryCta: {
      label: "View Credit Options",
      href: "/credit-packages",
    },
    secondaryCta: {
      label: "How Credits Work",
      href: "/credits/how-it-works",
    },
    visual: {
      label: "Credit Guide",
      title: "Your credits, explained",
      steps: [
        "Add or receive credits",
        "Keep them in your account",
        "Use them on eligible features",
        "Review your credit activity",
      ],
    },
  },

  introduction: {
    eyebrow: "Getting Started",
    title: "One balance. More ways to use Mystery Mansion.",
    description:
      "Mystery Mansion credits provide an account-based way to access eligible platform features. Instead of managing a separate payment process for every eligible feature, you can maintain a credit balance and use it when needed.",
    items: [
      {
        title: "Understand Your Balance",
        description:
          "Your credit balance represents the credits associated with your account that are available for eligible usage.",
        icon: Coins,
      },
      {
        title: "Know Where Credits Apply",
        description:
          "Credits can be used for eligible Mystery Mansion features. Not every platform feature necessarily requires credits.",
        icon: Info,
      },
      {
        title: "Keep Track of Activity",
        description:
          "Your account is the place to manage your available balance and review credit activity.",
        icon: History,
      },
    ],
  },

  gettingCredits: {
    eyebrow: "Adding Credits",
    title: "How do you get credits?",
    description:
      "Credits may be added to your account through available credit packages or eligible platform activities that award credits.",
    steps: [
      {
        number: "01",
        title: "Explore Available Options",
        description:
          "Review the credit packages or other credit-acquiring options currently made available by Mystery Mansion.",
        icon: Coins,
      },
      {
        number: "02",
        title: "Add or Receive Credits",
        description:
          "Follow the applicable process to purchase an available package or receive credits through an eligible platform activity.",
        icon: CreditCard,
      },
      {
        number: "03",
        title: "Check Your Balance",
        description:
          "Review your account's available credit balance before using credits on eligible features.",
        icon: WalletCards,
      },
    ],
  },

  usingCredits: {
    eyebrow: "Using Your Credits",
    title: "Use credits when eligible features require them.",
    description:
      "Credits are intended to support access to eligible Mystery Mansion functionality. Their use depends on the feature and the applicable platform requirements.",
    items: [
      {
        title: "Check Feature Eligibility",
        description:
          "Look for the applicable credit requirements when using a feature. Credits are not necessarily required for every platform activity.",
        icon: BadgeCheck,
      },
      {
        title: "Understand the Requirements",
        description:
          "Review the instructions and applicable credit requirements for the feature you intend to use.",
        icon: Info,
      },
      {
        title: "Keep Your Balance in Mind",
        description:
          "Consider your available credit balance when deciding which eligible features to use.",
        icon: WalletCards,
      },
    ],
  },

  trackingCredits: {
    eyebrow: "Your Account",
    title: "Stay informed about your credit activity.",
    description:
      "Your credits are associated with your Mystery Mansion account, helping keep your balance and eligible usage connected to one place.",
    items: [
      {
        title: "Available Balance",
        description:
          "Check the credits available in your account before planning their use.",
        icon: WalletCards,
      },
      {
        title: "Credit Activity",
        description:
          "Use the credit activity information available in your account to understand your recorded credit transactions and usage.",
        icon: History,
      },
      {
        title: "Account Responsibility",
        description:
          "Keep your account secure and use the platform's account-management tools to manage access to your credits.",
        icon: ShieldCheck,
      },
    ],
  },

  importantInformation: {
    eyebrow: "Before You Begin",
    title: "A few things to understand about credits.",
    description:
      "Knowing how credit eligibility and account balances work can help you make informed decisions when using Mystery Mansion.",
    items: [
      {
        title: "Credits Have Specific Uses",
        description:
          "Credits apply to eligible features rather than automatically granting access to every feature on the platform.",
        icon: BadgeCheck,
      },
      {
        title: "Availability May Vary",
        description:
          "Available packages, credit-acquiring options, and feature requirements depend on what Mystery Mansion currently offers.",
        icon: Info,
      },
      {
        title: "Review Applicable Policies",
        description:
          "Before purchasing credits, review the applicable platform terms and any published conditions concerning purchases and credit usage.",
        icon: ShieldCheck,
      },
    ],
  },

  faqs: {
    eyebrow: "Frequently Asked Questions",
    title: "Questions about credits?",
    description:
      "Here are some basics to help you understand the Mystery Mansion credit system.",
    items: [
      {
        question: "What are Mystery Mansion credits?",
        answer:
          "Mystery Mansion credits are an account-based balance that can be used to access eligible platform features when credits are required.",
        icon: Coins,
      },
      {
        question: "How can I get credits?",
        answer:
          "You can purchase an available credit package or receive credits through an eligible platform activity when that option is offered.",
        icon: CreditCard,
      },
      {
        question: "Can I use credits for every feature?",
        answer:
          "Not necessarily. Credits are intended for eligible features, and individual features may have different access requirements.",
        icon: BadgeCheck,
      },
      {
        question: "Where can I check my credit balance?",
        answer:
          "Check your Mystery Mansion account for the available balance and credit activity information provided by the platform.",
        icon: WalletCards,
      },
      {
        question: "Do credits expire or qualify for refunds?",
        answer:
          "Expiration, refund eligibility, and other purchase conditions should be determined by the current published credit policies and applicable terms. Review those policies before purchasing.",
        icon: CircleHelp,
      },
      {
        question: "What if I have a question about a credit transaction?",
        answer:
          "Review your available account activity and the applicable platform policies. Contact Mystery Mansion through its available support channel if you need help understanding a transaction.",
        icon: Info,
      },
    ],
  },

  cta: {
    eyebrow: "Ready to Get Started?",
    title: "Make the most of your Mystery Mansion credits.",
    description:
      "Explore the available credit options and learn which platform features support credit usage.",
    primaryCta: {
      label: "View Credit Options",
      href: "/credit-packages",
    },
    secondaryCta: {
      label: "How Credits Work",
      href: "/credits",
    },
  },
};