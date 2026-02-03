const baseButton =
  "group flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer";
const baseIcon =
  "transition-all duration-200 brightness-0 saturate-0 invert-[0.4]";
const activeIcon = "transition-all duration-200 brightness-0 invert";
const baseCount = "text-sm transition-colors duration-200";

type ReactionStyleConfig = {
  activeBg: string;
  hoverBg: string;
  activeText: string;
  hoverText: string;
};

export function getReactionClasses(
  isActive: boolean,
  canHover: boolean,
  config: ReactionStyleConfig,
) {
  const { activeBg, hoverBg } = config;
  const inactiveButton = "bg-transparent border-gray-500";

  return {
    button: [
      baseButton,
      isActive ? activeBg : canHover ? `${inactiveButton} ${hoverBg}` : inactiveButton,
    ].join(" "),
    icon: [
      isActive ? activeIcon : baseIcon,
      canHover && !isActive && "group-hover:brightness-0 group-hover:invert-[0.6]",
    ]
      .filter(Boolean)
      .join(" "),
    count: [baseCount, isActive ? "text-gray-100" : "text-gray-400"].join(" "),
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
