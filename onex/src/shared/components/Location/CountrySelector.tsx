// components/CountrySelector.tsx
export const countriesByRegion = {
  Europe: ['France', 'Germany', 'Italy', 'Spain', 'Sweden'],
  Asia: ['China', 'India', 'Japan', 'Thailand', 'Vietnam'],
  Africa: ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Morocco'],
};

export function getGroupedCountryOptions() {
  return Object.entries(countriesByRegion).map(([region, countries]) => ({
    label: region,
    options: countries.map((country) => ({
      value: { state: "", city: "", country },
      label: country,
    })),
  }));
}
