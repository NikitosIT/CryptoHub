import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
const spotHelpText = [
  { label: 'Margin', desc: 'Total amount you invest in USD.' },
  { label: 'Entry Price', desc: 'Current price of the token when you buy.' },
  { label: 'Exit price', desc: 'Price at which you plan to sell the token.' },
];

const futuresHelpText = [
  { label: 'Margin', desc: 'Your collateral — the amount you put up for the trade.' },
  { label: 'Leverage', desc: 'Multiplier (1-200x) applied to your margin.' },
  { label: 'Entry price', desc: 'Price at which you open the position.' },
  { label: 'Exit price', desc: 'Price at which you close the position.' },
  { label: 'Long', desc: 'You profit when the price goes up.' },
  { label: 'Short', desc: 'You profit when the price goes down.' },
];

export default function HelpInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isSpot = location.pathname === '/calculator/spot';
  const items = isSpot ? spotHelpText : futuresHelpText;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClick);
    return () => {
      document.removeEventListener('pointerdown', handleClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center justify-center transition cursor-pointer w-7 h-7 hover:opacity-70"
        aria-label="Help"
      >
        <img
          src="/others/free-icon-info-symbol-4765886.png"
          alt="Info"
          className="object-contain w-5 h-5"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute z-50 p-3 mt-2 overflow-hidden text-white -translate-x-1/2 shadow-xl sm:p-4 left-1/2 w-60 sm:w-72 rounded-xl bg-zinc-800"
          >
            <h4 className="mb-3 text-sm font-semibold text-orange-400">
              {isSpot ? 'Spot Calculator' : 'Futures Calculator'}
            </h4>

            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.label} className="text-xs leading-relaxed">
                  <span className="font-medium text-orange-300">{item.label}</span>
                  {' — '}
                  {item.desc}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
