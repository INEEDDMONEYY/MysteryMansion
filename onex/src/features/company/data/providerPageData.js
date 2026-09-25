import {
  ArrowUpRight,
  BarChart3,
  Check,
  Compass,
  HeartHandshake,
  MessageCircle,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

export const providerPageData = {
  hero: {
    eyebrow: "Built for providers",
    title: "Turn what you do into",
    highlightedTitle: "something people can discover.",
    description:
      "Create your presence, showcase your work, connect with clients, and grow your reputation through Mystery Mansion.",
    primaryCta: {
      label: "Become a Provider",
      href: "/signup",
    },
    secondaryCta: {
      label: "See How It Works",
      href: "#how-it-works",
    },
    visual: {
      label: "Your provider journey",
      title: "Starts here.",
      steps: [
        "Create your profile",
        "Showcase your work",
        "Connect with clients",
      ],
    },
  },

  benefits: {
    eyebrow: "Why Mystery Mansion",
    title: "More than a profile. Build your presence.",
    description:
      "Mystery Mansion gives providers the tools to showcase what they do, connect with potential clients, and become part of a growing community.",
    items: [
      {
        icon: UserRound,
        title: "Build Your Presence",
        description:
          "Create a provider profile that gives potential clients a better understanding of who you are, what you offer, and what makes your work unique.",
      },
      {
        icon: Sparkles,
        title: "Showcase Your Work",
        description:
          "Share posts, experiences, updates, and other content that helps clients discover what you have to offer.",
      },
      {
        icon: MessageCircle,
        title: "Connect With Clients",
        description:
          "Communicate directly with people interested in your services and answer questions before working together.",
      },
      {
        icon: TrendingUp,
        title: "Grow Your Reputation",
        description:
          "Build your presence through client interactions, reviews, references, completed experiences, and continued participation.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "Simple Process",
    title: "From provider to presence.",
    description:
      "Getting started on Mystery Mansion is designed to be straightforward.",
    steps: [
      {
        number: "01",
        icon: UserRound,
        title: "Create Your Profile",
        description:
          "Build your provider profile and introduce clients to who you are, what you do, and the experiences you provide.",
      },
      {
        number: "02",
        icon: PenLine,
        title: "Showcase Your Work",
        description:
          "Publish posts, share experiences, add references, and keep your profile updated so clients can learn more about you.",
      },
      {
        number: "03",
        icon: MessageCircle,
        title: "Connect",
        description:
          "Respond to interested clients, answer questions, and start conversations directly through Mystery Mansion.",
      },
      {
        number: "04",
        icon: TrendingUp,
        title: "Build & Grow",
        description:
          "Continue participating, complete experiences, collect feedback, and develop your reputation within the community.",
      },
    ],
  },

  features: {
    eyebrow: "Built For Providers",
    title: "The tools to help you build your business presence.",
    description:
      "Mystery Mansion gives providers a collection of tools designed around visibility, communication, reputation, and growth.",
    items: [
      {
        icon: UserRound,
        title: "Provider Profiles",
        description:
          "Create a detailed public profile where clients can learn about you, your work, services, experience, and availability.",
      },
      {
        icon: Sparkles,
        title: "Posts & Experiences",
        description:
          "Share your work, updates, completed experiences, and content that gives potential clients a better look at what you provide.",
      },
      {
        icon: MessageCircle,
        title: "Client Communication",
        description:
          "Connect directly with interested clients and keep conversations moving throughout the process.",
      },
      {
        icon: Star,
        title: "Reviews & References",
        description:
          "Build social proof through client reviews, references, and completed experiences.",
      },
      {
        icon: BarChart3,
        title: "Provider Insights",
        description:
          "Use available activity and performance information to better understand how people interact with your presence.",
      },
      {
        icon: Wallet,
        title: "Manage Your Services",
        description:
          "Present your services, pricing, availability, and other important information in one place.",
      },
    ],
  },

  growth: {
    eyebrow: "Built For Growth",
    title: "Turn visibility into opportunity.",
    description:
      "Your presence on Mystery Mansion can become more than a profile. It can become a place where people discover your work and start conversations.",
    points: [
      {
        icon: Search,
        title: "Get Discovered",
        description:
          "Give potential clients more opportunities to find you through your profile, content, services, and participation on the platform.",
      },
      {
        icon: Users,
        title: "Build Your Audience",
        description:
          "Develop relationships with clients and members of the Mystery Mansion community through consistent participation.",
      },
      {
        icon: TrendingUp,
        title: "Strengthen Your Reputation",
        description:
          "Use reviews, references, completed experiences, and continued activity to build a stronger provider presence.",
      },
      {
        icon: HeartHandshake,
        title: "Create Better Connections",
        description:
          "Focus on meaningful conversations and experiences rather than simply putting your services in front of people.",
      },
    ],
    visual: {
      label: "Provider growth",
      metrics: [
        {
          value: "01",
          label: "Create",
        },
        {
          value: "02",
          label: "Connect",
        },
        {
          value: "03",
          label: "Grow",
        },
      ],
    },
  },

  trust: {
    eyebrow: "Built Around Trust",
    title: "Your reputation matters.",
    description:
      "Mystery Mansion is designed to give providers a place where their work, client relationships, and reputation can develop together.",
    points: [
      {
        icon: ShieldCheck,
        title: "Build With Transparency",
        description:
          "Give clients access to information about your services, experience, content, references, and other available details.",
      },
      {
        icon: Star,
        title: "Let Your Work Speak",
        description:
          "Showcase your experiences and allow client feedback to become part of your public provider presence.",
      },
      {
        icon: MessageCircle,
        title: "Communicate Directly",
        description:
          "Have direct conversations with clients so expectations and questions can be addressed before moving forward.",
      },
    ],
    quote: {
      icon: Check,
      text:
        "The goal is simple: give providers a better place to be discovered, build trust, and connect with the people they serve.",
      label: "The Mystery Mansion provider experience",
    },
  },

  cta: {
    eyebrow: "Ready to Build Your Presence?",
    title: "Your next client could be looking for you.",
    description:
      "Create your Mystery Mansion provider account and start building a presence around the work you do.",
    primaryCta: {
      label: "Become a Provider",
      href: "/signup",
    },
    secondaryCta: {
      label: "Sign In",
      href: "/signin",
    },
  },
};