import {
  ArrowUpRight,
  Check,
  Compass,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  UserRound,
  Users,
  ShieldCheck,
} from "lucide-react";

export const clientPageData = {
  /*
   * ------------------------------------------------------------
   * HERO
   * ------------------------------------------------------------
   */

  hero: {
    eyebrow: "Built for better experiences",

    title: "Find the right",

    highlightedTitle: "experience for you.",

    description:
      "Discover providers, explore their work, connect directly, and find experiences that fit what you're looking for.",

    primaryCta: {
      label: "Get Started",
      href: "/signup",
    },

    secondaryCta: {
      label: "See How It Works",
      href: "#how-it-works",
    },

    visual: {
      label: "Your experience",
      title: "Starts here.",

      steps: [
        "Discover providers",
        "Explore available experiences",
        "Connect directly",
      ],
    },
  },

  /*
   * ------------------------------------------------------------
   * BENEFITS
   * ------------------------------------------------------------
   */

  benefits: {
    eyebrow: "Why Mystery Mansion",

    title: "A better way to find your next experience.",

    description:
      "Mystery Mansion gives clients a place to discover providers, explore their work, and connect with the people behind the experiences they are interested in.",

    items: [
      {
        icon: Compass,

        title: "Discover More",

        description:
          "Explore providers and experiences in one place so you can spend less time searching and more time finding what fits.",
      },

      {
        icon: MessageCircle,

        title: "Connect Directly",

        description:
          "Communicate with providers and get the information you need before moving forward.",
      },

      {
        icon: ShieldCheck,

        title: "Make Informed Decisions",

        description:
          "Review profiles, references, posts, and available information before choosing an experience.",
      },

      {
        icon: Star,

        title: "Build Better Experiences",

        description:
          "Keep track of your experiences and contribute feedback that can help strengthen the Mystery Mansion community.",
      },
    ],
  },

  /*
   * ------------------------------------------------------------
   * HOW IT WORKS
   * ------------------------------------------------------------
   */

  howItWorks: {
    eyebrow: "Simple Process",

    title: "From discovery to connection.",

    description:
      "Finding the right provider doesn't have to be complicated.",

    steps: [
      {
        number: "01",

        icon: Search,

        title: "Explore",

        description:
          "Browse providers and explore the experiences and services available through Mystery Mansion.",
      },

      {
        number: "02",

        icon: UserRound,

        title: "Choose",

        description:
          "Review provider profiles, posts, references, and other available information to help narrow down your options.",
      },

      {
        number: "03",

        icon: MessageCircle,

        title: "Connect",

        description:
          "Reach out, ask questions, and communicate with the provider before moving forward.",
      },
    ],
  },

  /*
   * ------------------------------------------------------------
   * FEATURES
   * ------------------------------------------------------------
   */

  features: {
    eyebrow: "Built Around You",

    title: "Everything you need to make better choices.",

    description:
      "Mystery Mansion brings the tools, information, and connections you need into one experience.",

    items: [
      {
        icon: UserRound,

        title: "Provider Profiles",

        description:
          "Explore provider profiles and learn more about the people behind the experiences you're interested in.",
      },

      {
        icon: Sparkles,

        title: "Posts & Experiences",

        description:
          "Discover published experiences, updates, and content from providers across the platform.",
      },

      {
        icon: MessageCircle,

        title: "Direct Communication",

        description:
          "Connect with providers and have conversations before deciding how you want to move forward.",
      },

      {
        icon: Star,

        title: "References & Reviews",

        description:
          "Use available references and reviews as part of your process when evaluating providers.",
      },

      {
        icon: ArrowUpRight,

        title: "Personalized Experience",

        description:
          "Keep your activity and interactions connected to your own Mystery Mansion experience.",
      },

      {
        icon: Users,

        title: "Community Participation",

        description:
          "Take part in the community by sharing feedback and contributing to the experiences you have.",
      },
    ],
  },

  /*
   * ------------------------------------------------------------
   * TRUST
   * ------------------------------------------------------------
   */

  trust: {
    eyebrow: "Confidence Matters",

    title: "Know who you're connecting with.",

    description:
      "Mystery Mansion is designed to give clients more information and visibility throughout the process.",

    points: [
      {
        icon: Search,

        title: "Explore Before You Decide",

        description:
          "Take the time to review provider information, content, references, and available reviews before making a decision.",
      },

      {
        icon: MessageCircle,

        title: "Stay Connected",

        description:
          "Keep communication with providers within your Mystery Mansion experience.",
      },

      {
        icon: Star,

        title: "Share Your Experience",

        description:
          "Your feedback can help other members of the community make more informed decisions.",
      },
    ],

    quote: {
      icon: Check,

      text:
        "The goal is simple: give clients more visibility, more information, and a better way to connect.",

      label: "The Mystery Mansion experience",
    },
  },

  /*
   * ------------------------------------------------------------
   * FINAL CTA
   * ------------------------------------------------------------
   */

  cta: {
    eyebrow: "Ready to Get Started?",

    title: "Your next experience starts here.",

    description:
      "Create your Mystery Mansion account and start discovering what the platform has to offer.",

    primaryCta: {
      label: "Create Your Account",
      href: "/signup",
    },

    secondaryCta: {
      label: "Sign In",
      href: "/signin",
    },
  },
};