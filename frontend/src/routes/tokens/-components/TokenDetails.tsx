import { useFiltersForMode } from "@/store/useFiltersStore";

import NoPostsTokenMessage from "../../posts/-components/NoPostsMessage";
import TokensAiForecasts from "./TokensAiForecasts";

interface TokenLinkConfig {
  href: string | undefined;
  icon: string;
  label: string;
  shortLabel?: string;
  bgColor: string;
  hoverColor: string;
}

const linkBaseClass =
  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all rounded-lg";

function TokenLink({
  href,
  icon,
  label,
  shortLabel,
  bgColor,
  hoverColor,
}: TokenLinkConfig) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${linkBaseClass} ${bgColor} ${hoverColor}`}
    >
      <img className="w-4 h-4 sm:w-5 sm:h-5" src={icon} alt={label} />
      {shortLabel ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </>
      ) : null}
    </a>
  );
}

export function TokenDetails() {
  const { selectedToken } = useFiltersForMode();

  if (!selectedToken) return;

  const links: TokenLinkConfig[] = [
    {
      href: selectedToken.cmc,
      icon: "/links_logo/cmc.svg",
      label: "CoinMarketCap",
      shortLabel: "CMC",
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-500",
    },
    {
      href: selectedToken.coinglass,
      icon: "/links_logo/coinglass.png",
      label: "Coinglass",
      shortLabel: "CG",
      bgColor: "bg-gray-800",
      hoverColor: "hover:bg-gray-700",
    },
    {
      href: selectedToken.homelink,
      icon: "/links_logo/home.svg",
      label: "Official site",
      shortLabel: "Site",
      bgColor: "bg-orange-600",
      hoverColor: "hover:bg-orange-500",
    },
    {
      href: selectedToken.xlink,
      icon: "/links_logo/x-2.svg",
      label: "X",
      bgColor: "bg-gray-700",
      hoverColor: "hover:bg-gray-500",
    },
  ];

  return (
    <div className="flex flex-col items-center mt-3 text-xs text-gray-300 transition-all duration-300 sm:mt-4 sm:text-sm">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#111] rounded-xl sm:rounded-2xl shadow-md border border-gray-800 w-full max-w-2xl">
        {links.map((link) => (
          <TokenLink key={link.label} {...link} />
        ))}
        <TokensAiForecasts />
      </div>

      <NoPostsTokenMessage />
    </div>
  );
}
