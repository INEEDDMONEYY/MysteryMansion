import {
  BadgeCheck,
  Gift,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

export const reviewIncentivesPageData = {
  hero: {
    eyebrow: "Review Incentives",
    title: "Share your experience.",
    highlightedTitle: "Help the community.",
    description:
      "Mystery Mansion uses review incentives to encourage thoughtful, honest feedback that helps providers and clients make more informed decisions.",
    primaryCta: {
      label: "Explore the Program",
      href: "*",
    },
    secondaryCta: {
      label: "View Community Guidelines",
      href: "/community-guidelines",
    },
    visual: {
      label: "Review Program",
      title: "A simple feedback cycle",
      steps: [
        "Complete an eligible interaction",
        "Share an honest review",
        "Review eligibility is checked",
        "Receive an eligible incentive",
      ],
    },
  },

  overview: {
    eyebrow: "Why Reviews Matter",
    title: "Better feedback creates a better community.",
    description:
      "Reviews can help members understand experiences before making decisions while giving the community more useful information to work with.",
    items: [
      {
        title: "Real Experiences",
        description:
          "Thoughtful reviews give community members a clearer picture of what to expect from an interaction.",
        icon: MessageSquareText,
      },
      {
        title: "Useful Information",
        description:
          "Detailed feedback can help people make more informed choices when exploring profiles and experiences.",
        icon: Sparkles,
      },
      {
        title: "Verified Participation",
        description:
          "Eligible review activity can be tied to qualifying platform interactions and program requirements.",
        icon: BadgeCheck,
      },
      {
        title: "Community Trust",
        description:
          "Honest feedback contributes to a platform where members can learn from one another.",
        icon: ShieldCheck,
      },
    ],
  },

  howItWorks: {
    eyebrow: "How It Works",
    title: "The review incentive process.",
    description:
      "The program is designed to encourage genuine feedback without turning reviews into scripted or misleading endorsements.",
    steps: [
      {
        number: "01",
        title: "Have an Eligible Interaction",
        description:
          "Participate in an interaction or activity that qualifies under the current review incentive program.",
        icon: UserRoundCheck,
      },
      {
        number: "02",
        title: "Submit Your Review",
        description:
          "Share honest and useful feedback based on your actual experience.",
        icon: MessageSquareText,
      },
      {
        number: "03",
        title: "Review Eligibility",
        description:
          "The submitted review may be checked against the program's current requirements and platform rules.",
        icon: BadgeCheck,
      },
      {
        number: "04",
        title: "Receive the Incentive",
        description:
          "Eligible participants receive the applicable incentive associated with the current program.",
        icon: Gift,
      },
    ],
  },

  standards: {
    eyebrow: "Review Standards",
    title: "Incentives should never replace honesty.",
    description:
      "A review incentive exists to encourage participation, not to influence what someone says about their experience.",
    items: [
      "Reviews should be based on a genuine experience.",
      "Participants should describe their own experience honestly.",
      "Reviews should not be created solely to obtain an incentive.",
      "False, misleading, abusive, or manipulated reviews may be removed.",
      "Program requirements may change as Mystery Mansion updates the platform.",
    ],
  },

  closing: {
    eyebrow: "Contribute to the Community",
    title: "Your experience can help someone else.",
    description:
      "Thoughtful feedback gives the community more information while helping Mystery Mansion build a more useful platform for everyone.",
  },
};