// utils/stateNormalizer.js
// Map of US state abbreviations to full names
const stateAbbreviations = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  // Canadian provinces
  'AB': 'Alberta',
  'BC': 'British Columbia',
  'MB': 'Manitoba',
  'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador',
  'NS': 'Nova Scotia',
  'ON': 'Ontario',
  'PE': 'Prince Edward Island',
  'QC': 'Quebec',
  'SK': 'Saskatchewan',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
  'YT': 'Yukon'
};

/**
 * Normalizes a state name by converting abbreviations to full names
 * @param {string} state - The state name or abbreviation
 * @returns {string} - The normalized full state name
 */
export function normalizeState(state) {
  if (!state) return state;

  // Strip punctuation/symbols (e.g. trailing commas, dots) before normalizing
  const cleaned = String(state).replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  const trimmedState = cleaned;
  const upperState = trimmedState.toUpperCase();

  // If it's an abbreviation, return the full name
  if (stateAbbreviations[upperState]) {
    return stateAbbreviations[upperState];
  }

  // Otherwise, return the trimmed original value.
  return trimmedState;
}

/**
 * Checks if two state names match (handles abbreviations)
 * @param {string} state1 - First state name/abbreviation
 * @param {string} state2 - Second state name/abbreviation
 * @returns {boolean} - Whether they match
 */
export function statesMatch(state1, state2) {
  if (!state1 || !state2) return false;

  const normalized1 = normalizeState(state1);
  const normalized2 = normalizeState(state2);

  return normalized1.toLowerCase() === normalized2.toLowerCase();
}

export default { normalizeState, statesMatch };