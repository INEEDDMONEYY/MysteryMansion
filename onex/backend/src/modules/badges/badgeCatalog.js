/**
 * Badge definitions. Each series is [threshold, tier, title, description].
 * `metric` names the stat in badgeEngine.js that is compared against threshold.
 * Forum badge ids are `<series>-<tier>`; time badge ids are `<series>-<threshold>`.
 */

const FORUM_SERIES = [
  {
    id: 'posts', metric: 'posts', rows: [
      [1, 1, 'Fresh Quill', 'Write 1 post'],
      [10, 2, 'Scribe', 'Write 10 posts'],
      [100, 3, 'Chronicler', 'Write 100 posts'],
      [500, 4, 'Bard', 'Write 500 posts'],
      [1000, 5, 'Loremaster', 'Write 1,000 posts'],
    ],
  },
  {
    id: 'replies', metric: 'replies', rows: [
      [1, 1, 'Echo', 'Post 1 reply'],
      [25, 2, 'Conversationalist', 'Post 25 replies'],
      [100, 3, 'Debater', 'Post 100 replies'],
      [500, 4, 'Orator', 'Post 500 replies'],
      [2500, 5, 'Voice of the Realm', 'Post 2,500 replies'],
    ],
  },
  {
    id: 'threads', metric: 'threads', rows: [
      [1, 1, 'Town Crier', 'Start 1 thread'],
      [5, 2, 'Storyteller', 'Start 5 threads'],
      [25, 3, 'Herald', 'Start 25 threads'],
      [100, 4, 'Pathfinder', 'Start 100 threads'],
      [250, 5, 'Realm Founder', 'Start 250 threads'],
    ],
  },
  {
    id: 'likes-given', metric: 'likesGiven', rows: [
      [1, 1, 'Kind Heart', 'Give 1 like'],
      [50, 2, 'Admirer', 'Give 50 likes'],
      [250, 3, 'Cheerleader', 'Give 250 likes'],
      [1000, 4, 'Patron', 'Give 1,000 likes'],
      [5000, 5, 'Benefactor', 'Give 5,000 likes'],
    ],
  },
  {
    id: 'likes-received', metric: 'likesReceived', rows: [
      [1, 1, 'Spark', 'Receive 1 like'],
      [25, 2, 'Rising Star', 'Receive 25 likes'],
      [100, 3, 'Beloved', 'Receive 100 likes'],
      [500, 4, 'Luminary', 'Receive 500 likes'],
      [2500, 5, 'Legend', 'Receive 2,500 likes'],
    ],
  },
  {
    id: 'solutions', metric: 'solutions', rows: [
      [1, 1, 'Key Finder', 'Have 1 reply marked as the solution'],
      [5, 2, 'Problem Solver', 'Have 5 replies marked as the solution'],
      [25, 3, 'Riddle Master', 'Have 25 replies marked as the solution'],
      [100, 4, 'Sage', 'Have 100 replies marked as the solution'],
      [250, 5, 'Oracle', 'Have 250 replies marked as the solution'],
    ],
  },
  {
    id: 'streak', metric: 'streak', rows: [
      [3, 1, 'Spark of Habit', 'Visit 3 days in a row'],
      [7, 2, 'Steady Flame', 'Visit 7 days in a row'],
      [30, 3, 'Bonfire', 'Visit 30 days in a row'],
      [100, 4, 'Eternal Flame', 'Visit 100 days in a row'],
      [365, 5, 'Phoenix', 'Visit 365 days in a row'],
    ],
  },
  {
    id: 'invites', metric: 'invites', rows: [
      [1, 1, 'Messenger', 'Invite 1 member'],
      [5, 2, 'Recruiter', 'Invite 5 members'],
      [10, 3, 'Envoy', 'Invite 10 members'],
      [25, 4, 'Ambassador', 'Invite 25 members'],
      [50, 5, 'Banner Bearer', 'Invite 50 members'],
    ],
  },
  {
    id: 'reputation', metric: 'reputation', rows: [
      [100, 1, 'Squire', 'Reach 100 reputation'],
      [500, 2, 'Knight', 'Reach 500 reputation'],
      [1000, 3, 'Baron', 'Reach 1,000 reputation'],
      [5000, 4, 'Duke', 'Reach 5,000 reputation'],
      [10000, 5, 'Monarch', 'Reach 10,000 reputation'],
    ],
  },
  {
    id: 'guardian', metric: 'guardian', rows: [
      [1, 1, 'Watchman', 'Submit 1 helpful report'],
      [10, 2, 'Sentinel', 'Submit 10 helpful reports'],
      [50, 3, 'Warden', 'Submit 50 helpful reports'],
      [150, 4, 'Protector', 'Submit 150 helpful reports'],
      [500, 5, 'Guardian', 'Submit 500 helpful reports'],
    ],
  },
];

const TIME_SERIES = [
  {
    id: 'days', metric: 'days', rows: [
      [1, 1, '1 Day', 'Member for 1 day'],
      [2, 1, '2 Days', 'Member for 2 days'],
      [3, 1, '3 Days', 'Member for 3 days'],
      [4, 1, '4 Days', 'Member for 4 days'],
      [5, 2, '5 Days', 'Member for 5 days'],
      [6, 2, '6 Days', 'Member for 6 days'],
      [7, 2, '7 Days', 'Member for 7 days'],
      [10, 2, '10 Days', 'Member for 10 days'],
      [14, 3, '14 Days', 'Member for 14 days'],
      [21, 3, '21 Days', 'Member for 21 days'],
      [30, 3, '30 Days', 'Member for 30 days'],
      [45, 3, '45 Days', 'Member for 45 days'],
      [60, 4, '60 Days', 'Member for 60 days'],
      [75, 4, '75 Days', 'Member for 75 days'],
      [90, 4, '90 Days', 'Member for 90 days'],
      [100, 4, '100 Days', 'Member for 100 days'],
      [150, 5, '150 Days', 'Member for 150 days'],
      [200, 5, '200 Days', 'Member for 200 days'],
      [250, 5, '250 Days', 'Member for 250 days'],
      [300, 5, '300 Days', 'Member for 300 days'],
    ],
  },
  {
    id: 'months', metric: 'months', rows: [
      [1, 1, '1 Month', 'Member for 1 month'],
      [2, 1, '2 Months', 'Member for 2 months'],
      [3, 1, '3 Months', 'Member for 3 months'],
      [4, 2, '4 Months', 'Member for 4 months'],
      [5, 2, '5 Months', 'Member for 5 months'],
      [6, 2, '6 Months', 'Member for 6 months'],
      [7, 3, '7 Months', 'Member for 7 months'],
      [8, 3, '8 Months', 'Member for 8 months'],
      [9, 3, '9 Months', 'Member for 9 months'],
      [10, 4, '10 Months', 'Member for 10 months'],
      [11, 4, '11 Months', 'Member for 11 months'],
      [12, 4, '12 Months', 'Member for 12 months'],
      [15, 5, '15 Months', 'Member for 15 months'],
      [18, 5, '18 Months', 'Member for 18 months'],
      [21, 5, '21 Months', 'Member for 21 months'],
    ],
  },
  {
    id: 'years', metric: 'years', rows: [
      [1, 1, '1 Year', 'Member for 1 year'],
      [2, 1, '2 Years', 'Member for 2 years'],
      [3, 1, '3 Years', 'Member for 3 years'],
      [4, 2, '4 Years', 'Member for 4 years'],
      [5, 2, '5 Years', 'Member for 5 years'],
      [6, 2, '6 Years', 'Member for 6 years'],
      [7, 3, '7 Years', 'Member for 7 years'],
      [8, 3, '8 Years', 'Member for 8 years'],
      [9, 3, '9 Years', 'Member for 9 years'],
      [10, 4, '10 Years', 'Member for 10 years'],
      [12, 4, '12 Years', 'Member for 12 years'],
      [15, 4, '15 Years', 'Member for 15 years'],
      [20, 5, '20 Years', 'Member for 20 years'],
      [25, 5, '25 Years', 'Member for 25 years'],
      [50, 5, '50 Years', 'Member for 50 years'],
    ],
  },
];

const forumBadges = FORUM_SERIES.flatMap((series) => series.rows.map(([threshold, tier, title, description]) => ({
  id: `${series.id}-${tier}`,
  set: 'forum',
  tier,
  title,
  description,
  threshold,
  metric: series.metric,
})));

const timeBadges = TIME_SERIES.flatMap((series) => series.rows.map(([threshold, tier, title, description]) => ({
  id: `${series.id}-${threshold}`,
  set: 'time',
  tier,
  title,
  description,
  threshold,
  metric: series.metric,
})));

export const BADGE_CATALOG = [...forumBadges, ...timeBadges];
