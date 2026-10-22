import {
  getFlagStatusLabel,
  getFlagStatusStyle,
} from "../data/flagStatuses";

const FlagStatusBadge = ({ status, theme = "dark" }) => {
  const style = getFlagStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${style[theme]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {getFlagStatusLabel(status)}
    </span>
  );
};

export default FlagStatusBadge;
