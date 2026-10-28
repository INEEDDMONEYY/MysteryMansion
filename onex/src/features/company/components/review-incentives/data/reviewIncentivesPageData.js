import {
  BadgeCheck,
  Coins,
  CreditCard,
  Gift,
  Link2,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

export const reviewIncentivesPageData = {
  hero: {
    eyebrow: "Provider Credits & Rewards",
    title: "Share your link.",
    highlightedTitle: "Earn as you grow.",
    description:
      "Build your presence on Mystery Mansion, share your unique signup link, and earn credit rewards as eligible new users join through your referrals. Eligible milestones may also unlock monetary incentives through supported payout methods.",
    primaryCta: {
      label: "Become a Provider",
      href: "/become-a-provider",
    },
    secondaryCta: {
      label: "Explore Reward Milestones",
      href: "#incentive-milestones",
    },
    visual: {
      label: "Provider Incentives",
      title: "From sharing to rewards",
      steps: [
        "Get your unique signup link",
        "Share it with potential users",
        "Reach verified signup milestones",
        "Earn eligible credit rewards",
        "Unlock eligible monetary incentives",
      ],
    },
  },

  overview: {
    eyebrow: "The Incentive Program",
    title: "Grow your network. Earn as you progress.",
    description:
      "The program rewards eligible provider participation by connecting referral activity with milestone-based incentives. Your tracked signup progress determines when you reach the next reward threshold.",
    items: [
      {
        title: "Your Signup Link",
        description:
          "Share your unique referral signup link so new users can register through your invitation.",
        icon: Link2,
      },
      {
        title: "Credit Milestones",
        description:
          "Reach configured signup milestones to qualify for the corresponding credit rewards.",
        icon: Coins,
      },
      {
        title: "Monetary Incentives",
        description:
          "Eligible milestones may unlock monetary rewards that can be requested through supported payout methods under the program rules.",
        icon: Wallet,
      },
    ],
  },

  howItWorks: {
    eyebrow: "How It Works",
    title: "Five steps from referral to reward.",
    description:
      "The process starts with your personal signup link and continues as eligible registrations are tracked and milestone requirements are met.",
    steps: [
      {
        number: "01",
        title: "Get Your Signup Link",
        description:
          "Access your unique provider referral link through the designated area of your account.",
        icon: Link2,
      },
      {
        number: "02",
        title: "Share Your Link",
        description:
          "Share your link with people who may be interested in joining Mystery Mansion. Use appropriate channels and follow platform rules.",
        icon: Users,
      },
      {
        number: "03",
        title: "Generate Eligible Signups",
        description:
          "When a new user registers through your link, the platform can attribute the registration to your referral, subject to verification.",
        icon: UserPlus,
      },
      {
        number: "04",
        title: "Reach Reward Milestones",
        description:
          "Your verified referral count progresses toward the thresholds listed below. Each qualifying reward should be recorded against the correct account.",
        icon: Gift,
      },
      {
        number: "05",
        title: "Receive Eligible Rewards",
        description:
          "Credit rewards are subject to the configured milestone rules. Eligible monetary incentives may be requested through a supported payout method after applicable checks.",
        icon: CreditCard,
      },
    ],
  },

  milestones: {
    eyebrow: "Referral Milestones",
    title: "Every milestone is progress.",
    description:
      "Track your verified signups and work toward each reward threshold. Configure the exact credit amounts and monetary reward eligibility for each milestone below.",
    countLabel: "Verified signups",
    creditRewardLabel: "Credit reward",
    moneyRewardLabel: "Monetary incentive",
    rewardNote:
      "Reward amounts and eligibility must be configured in the program data before the program is published with final reward promises.",
    tiers: [
      {
        id: "milestone-5",
        signups: 5,
        label: "5 Signups",
        creditsAwarded: 50,
        moneyRewardEnabled: true,
        moneyReward: 5,
        description:
          "Reach your first referral milestone with five eligible registrations.",
      },
      {
        id: "milestone-10",
        signups: 10,
        label: "10 Signups",
        creditsAwarded: 150,
        moneyRewardEnabled: true,
        moneyReward: 10,
        description:
          "Keep building your referral network and reach ten eligible registrations.",
      },
      {
        id: "milestone-15",
        signups: 15,
        label: "15 Signups",
        creditsAwarded: 220,
        moneyRewardEnabled: true,
        moneyReward: 15,
        description:
          "Continue growing your network and reach your next milestone.",
      },
      {
        id: "milestone-20",
        signups: 20,
        label: "20 Signups",
        creditsAwarded: 270,
        moneyRewardEnabled: true,
        moneyReward: 20,
        description:
          "Build on your referral activity with twenty eligible registrations.",
      },
      {
        id: "milestone-25",
        signups: 25,
        label: "25 Signups",
        creditsAwarded: 345,
        moneyRewardEnabled: true,
        moneyReward: 25,
        description:
          "Reach twenty-five eligible registrations through your signup link.",
      },
      {
        id: "milestone-40",
        signups: 40,
        label: "40 Signups",
        creditsAwarded: 415,
        moneyRewardEnabled: true,
        moneyReward: 30,
        description:
          "Grow your referral activity toward forty eligible registrations.",
      },
      {
        id: "milestone-45",
        signups: 45,
        label: "45 Signups",
        creditsAwarded: 500,
        moneyRewardEnabled: true,
        moneyReward: 35,
        description:
          "Keep progressing toward your next referral reward threshold.",
      },
      {
        id: "milestone-50",
        signups: 50,
        label: "50 Signups",
        creditsAwarded: 600,
        moneyRewardEnabled: true,
        moneyReward: 40,
        description:
          "Reach fifty eligible registrations through your shared link.",
      },
      {
        id: "milestone-100",
        signups: 100,
        label: "100+ Signups",
        creditsAwarded: 1400,
        moneyRewardEnabled: true,
        moneyReward: 45,
        isOpenEnded: true,
        description:
          "Reach one hundred eligible registrations and continue building your referral network.",
      },
    ],
  },

  moneyIncentives: {
    eyebrow: "Monetary Rewards",
    title: "Eligible milestones may unlock monetary incentives.",
    description:
      "Where a milestone has a monetary reward enabled, eligible providers can follow the program's payout process and choose from the supported payout methods listed below.",
    eligibilityDescription:
      "Monetary rewards are separate from credit rewards. Eligibility, availability, verification, minimum payout requirements, and processing conditions should follow the program's published rules.",
    payoutOptions: ['cashapp', 'Paypal', 'Venmo'],
  },

  standards: {
    eyebrow: "Program Standards",
    title: "Fair rewards start with trustworthy activity.",
    description:
      "Referral tracking and review participation should remain transparent so the incentive program rewards genuine engagement.",
    items: [
      {
        title: "Eligible Registrations Only",
        description:
          "Signup milestones should count completed, eligible registrations attributed to your link, not link clicks or incomplete signup attempts.",
        icon: UserPlus,
      },
      {
        title: "No Artificial Referrals",
        description:
          "Duplicate accounts, self-referrals, fraudulent activity, or attempts to manipulate the reward system should not qualify.",
        icon: ShieldCheck,
      },
      {
        title: "Honest Reviews",
        description:
          "When reviews are part of platform participation, they should reflect genuine experiences. Rewards must not depend on a review being positive.",
        icon: MessageSquareText,
      },
      {
        title: "Transparent Rewards",
        description:
          "Credit amounts, monetary incentive eligibility, payout methods, and any applicable restrictions should be clearly documented before rewards are offered.",
        icon: BadgeCheck,
      },
    ],
  },

  cta: {
    eyebrow: "Start Growing",
    title: "Build your network on Mystery Mansion.",
    description:
      "Get started as a provider, share your referral signup link, and track your progress toward eligible incentive milestones.",
    primaryCta: {
      label: "Become a Provider",
      href: "/become-a-provider",
    },
    secondaryCta: {
      label: "Explore Referrals",
      href: "/referrals",
    },
  },

  
reviewMilestones: {
  eyebrow: "Review Milestones",
  title: "Every eligible review counts.",
  description:
    "Earn rewards as you contribute eligible reviews. Milestones are based on verified reviews, not whether a review is positive or negative.",
  countLabel: "Eligible reviews",
  creditRewardLabel: "Credit reward",
  moneyRewardLabel: "Monetary incentive",
  rewardNote:
    "Reward amounts and monetary eligibility must be configured before the program goes live. Reviews must meet the platform's eligibility and verification requirements.",
  tiers: [
    {
      id: "review-milestone-5",
      reviews: 5,
      label: "5 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 5 eligible reviews to unlock this milestone."
    },
    {
      id: "review-milestone-10",
      reviews: 10,
      label: "10 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Build your review history with 10 eligible reviews."
    },
    {
      id: "review-milestone-15",
      reviews: 15,
      label: "15 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 15 eligible reviews and continue progressing."
    },
    {
      id: "review-milestone-20",
      reviews: 20,
      label: "20 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 20 eligible reviews."
    },
    {
      id: "review-milestone-25",
      reviews: 25,
      label: "25 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 25 eligible reviews and advance to the next milestone."
    },
    {
      id: "review-milestone-40",
      reviews: 40,
      label: "40 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 40 eligible reviews."
    },
    {
      id: "review-milestone-45",
      reviews: 45,
      label: "45 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 45 eligible reviews."
    },
    {
      id: "review-milestone-50",
      reviews: 50,
      label: "50 Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      description: "Reach 50 eligible reviews and continue building your contribution history."
    },
    {
      id: "review-milestone-100",
      reviews: 100,
      label: "100+ Reviews",
      creditsAwarded: null,
      moneyRewardEnabled: null,
      moneyReward: null,
      isOpenEnded: true,
      description: "Reach 100 eligible reviews and keep progressing beyond this milestone."
    }
  ]
},

};