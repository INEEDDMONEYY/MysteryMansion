const normalizeCategory = (value = "") => String(value).trim().toLowerCase();

export default function CategoryList({ onSelect, selectedCategories = [], multiple = false }) {
  const categories = [
    'Restrictions 🚫',
    'Only AA 🔥',
    ' Baddies 💝',
    ' Latinas ❤️‍🔥',
    ' BBW ⛱️',
    ' Asians 🌏',
    ' LGBQT+ 🌈',
    ' Party N Play ❄️',
    '40+ 🔞',
    ' MILF 💅',
    ' Request Pickup/Dropoff 💳',
    ' Car Dates 🚘',
    'No AA ❌',
    'GFE 💋',
    'Mature 💦',
    'BDSM 👣',
    '24/7 ☀️',
  ];

  const selectedSet = new Set(
    (Array.isArray(selectedCategories) ? selectedCategories : [])
      .map((category) => normalizeCategory(category))
      .filter(Boolean)
  );

  return (
    <div className="w-full py-6 px-4 md:px-8 lg:px-12">
      <div className="flex overflow-x-auto gap-4 scrollbar-hide px-2">
        {categories.map((category, index) => {
          const isSelected = selectedSet.has(normalizeCategory(category));

          return (
            <button
              key={index}
              onClick={() => onSelect(category)}
              className={`
                min-w-[120px]
                font-semibold
                border
                py-3 px-3 rounded-lg shadow-md
                flex items-center justify-center text-center
                hover:scale-105 hover:bg-gradient-to-r hover:from-pink-400 hover:to-yellow-300
                transition duration-300 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-white
                ${multiple && isSelected
                  ? "bg-gradient-to-r from-pink-500 to-yellow-300 text-white border-pink-500"
                  : "bg-black text-white border-pink-600"}
              `}
              aria-pressed={multiple ? isSelected : undefined}
            >
              <span className="text-sm">{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


