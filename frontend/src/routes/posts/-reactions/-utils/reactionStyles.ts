export const baseButton =
  "group flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 border";
export const disabledButton = "opacity-50 cursor-not-allowed border-gray-500";

export const baseIcon =
  "transition-all duration-200 brightness-0 saturate-0 invert-[0.4]";
export const baseCount = "text-sm transition-colors duration-200 text-gray-400";

export function getReactionClasses({
  isActive,
  isDisabled,
  activeBg,
  hoverBg,
  activeText,
  hoverText,
}: {
  isActive: boolean;
  isDisabled: boolean;
  activeBg: string;
  hoverBg: string;
  activeText: string;
  hoverText: string;
}) {
  return {
    button: isDisabled
      ? `${baseButton} ${disabledButton}`
      : `${baseButton} cursor-pointer ${
          isActive ? activeBg : `bg-transparent border-gray-500 ${hoverBg}`
        }`,
    icon: isDisabled
      ? `${baseIcon} opacity-50`
      : isActive
        ? "transition-all duration-200 brightness-0 invert"
        : `${baseIcon} group-hover:brightness-0 group-hover:invert-[0.6]`,
    count: isDisabled
      ? "text-sm transition-colors duration-200 text-gray-400"
      : isActive
        ? `text-sm transition-colors duration-200 ${activeText}`
        : `${baseCount} ${hoverText}`,
  };
}

export const REACTIONS = {
  like: {
    icon: "/others/uptrading-arrow.svg",
    activeBg: "bg-green-500 border-green-600 hover:bg-green-600",
    hoverBg: "hover:border-green-500 hover:bg-green-50",
    activeText: "text-white",
    hoverText: "group-hover:text-green-600",
    countKey: "like_count",
    label: "Like",
  },
  dislike: {
    icon: "/others/downTrading-arrow.svg",
    activeBg: "bg-red-500 border-red-600 hover:bg-red-600",
    hoverBg: "hover:border-red-500 hover:bg-red-50",
    activeText: "text-white",
    hoverText: "group-hover:text-red-600",
    countKey: "dislike_count",
    label: "Dislike",
  },
} as const;
