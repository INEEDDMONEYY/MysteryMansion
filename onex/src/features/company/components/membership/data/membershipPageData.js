import {
  CalendarClock,
  Coins,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const membershipPageData = {
  seo: {
    title: "Membership | Mystery Mansion",
    description:
      "Explore Mystery Mansion monthly memberships, coin-based billing, and subscription renewal information.",
  },

  hero: {
    eyebrow: "The Membership Experience",
    title: "Make more of",
    highlightedTitle: "Mystery Mansion.",
    description:
      "Explore monthly membership options powered by Mystery Mansion coins. Review each plan's cost and included benefits before subscribing.",
    primaryCta: {
      label: "Explore Memberships",
      href: "#membership-plans",
    },
    secondaryCta: {
      label: "How It Works",
      href: "#membership-how-it-works",
    },
    highlights: [
      "Monthly coin-based subscriptions",
      "Clear plan pricing",
      "Transparent renewal policy",
    ],
  },

  benefits: {
    eyebrow: "Designed Around Your Experience",
    title: "Membership, made clear.",
    description:
      "Know how membership billing works, what each plan includes, and when your next renewal is due.",
    items: [
      {
        id: "coin-billing",
        icon: Coins,
        title: "Coin-Based Billing",
        description:
          "Membership subscriptions use Mystery Mansion platform coins rather than a separate monthly card charge.",
      },
      {
        id: "monthly-access",
        icon: CalendarClock,
        title: "Monthly Membership",
        description:
          "Each subscription follows a monthly billing cycle, with its renewal date managed by the platform.",
      },
      {
        id: "secure-transactions",
        icon: ShieldCheck,
        title: "Backend-Controlled Payments",
        description:
          "The backend verifies your coin balance and processes every subscription charge and renewal.",
      },
      {
        id: "clear-information",
        icon: Sparkles,
        title: "Know Before You Subscribe",
        description:
          "Membership pricing and included benefits will be presented with each plan before you commit.",
      },
    ],
  },

  // Plans, prices and perks come from the backend catalog (GET /api/membership/plans).

  howItWorks: {
    eyebrow: "The Process",
    title: "Your membership, step by step.",
    description:
      "The membership experience is designed to make subscription costs and renewal expectations easy to understand.",
    steps: [
      {
        id: "choose",
        number: "01",
        title: "Choose a Membership",
        description:
          "Compare available plans, monthly coin costs, and included benefits before making your selection.",
      },
      {
        id: "subscribe",
        number: "02",
        title: "Confirm Your Subscription",
        description:
          "The backend verifies your account, checks your coin balance, and processes the subscription securely.",
      },
      {
        id: "renew",
        number: "03",
        title: "Renew Each Month",
        description:
          "Your membership follows its monthly billing schedule. The backend handles renewal and records the transaction.",
      },
      {
        id: "manage",
        number: "04",
        title: "Stay Informed",
        description:
          "Receive clear information about renewal results, insufficient coins, grace periods, and membership expiration.",
      },
    ],
  },

  renewal: {
    eyebrow: "Renewal Transparency",
    title: "A missed renewal doesn't leave you guessing.",
    description:
      "If a monthly renewal cannot be completed, Mystery Mansion provides a short window to resolve the payment issue.",
    gracePeriod: "2 hours",
    steps: [
      {
        title: "Renewal attempt fails",
        description:
          "The backend records the unsuccessful renewal and starts the two-hour grace period.",
      },
      {
        title: "You receive a notice",
        description:
          "The notice explains that renewal failed and tells you how to resolve the issue before the deadline.",
      },
      {
        title: "Resolve the payment issue",
        description:
          "Acquire sufficient coins and complete the renewal within the grace period.",
      },
      {
        title: "Membership expires if unpaid",
        description:
          "If renewal cannot be completed by the deadline, the backend expires the membership.",
      },
    ],
    note:
      "The backend determines the deadline and subscription status. A browser timer or frontend action cannot extend the grace period.",
  },

  faqs: [
    {
      id: "monthly-billing",
      question: "How are memberships paid for?",
      answer:
        "Memberships are monthly subscriptions paid with Mystery Mansion platform coins. The backend verifies your available balance and processes each charge.",
    },
    {
      id: "renewal-failure",
      question: "What happens if I don't have enough coins at renewal?",
      answer:
        "Your renewal will be marked unsuccessful, and a two-hour grace period will begin. You will receive a notice explaining how to resolve the issue. If the renewal remains unpaid when the deadline passes, your membership expires.",
    },
    {
      id: "transaction-security",
      question: "Can the website deduct coins from my account on its own?",
      answer:
        "The frontend cannot authorize or perform coin deductions. Subscription charges and renewals are validated and processed by the backend, which records the resulting transaction.",
    },
    {
      id: "plan-details",
      question: "Where can I see each membership's price and benefits?",
      answer:
        "Each available plan will show its monthly coin cost and included benefits before you subscribe. If a plan's details are not available, you should not be charged for that plan.",
    },
    {
      id: "membership-expiration",
      question: "What happens when my membership expires?",
      answer:
        "The backend updates your subscription status when the grace period ends without a successful renewal. Access to membership benefits should follow the expiration rules assigned to your subscription.",
    },
  ],

  cta: {
    eyebrow: "Your Next Chapter",
    title: "Explore the membership experience.",
    description:
      "Compare available membership options and understand the monthly coin commitment before subscribing.",
    primaryCta: {
      label: "View Memberships",
      href: "#membership-plans",
    },
    secondaryCta: {
      label: "Create an Account",
      href: "/signup",
    },
  },
};