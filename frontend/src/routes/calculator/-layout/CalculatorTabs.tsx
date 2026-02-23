import { Link, useLocation } from '@tanstack/react-router';

import HelpInfo from './HelpInfo';
import { motion } from 'framer-motion';

interface CalculatorTabsProps {
  children: React.ReactNode;
}

export function CalculatorTabs({ children }: CalculatorTabsProps) {
  const location = useLocation();

  const tabs = [
    { label: 'Spot', path: '/calculator/spot' },
    { label: 'Futures', path: '/calculator/futures' },
  ];

  return (
    <div className="flex items-start justify-center px-3 py-6 sm:px-4 sm:py-10 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md p-4 bg-white shadow-lg sm:p-6 md:p-8 rounded-2xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h5 className="text-2xl font-semibold text-center sm:text-3xl">
            Crypto Calculator
          </h5>
          <HelpInfo />
        </div>
        <div className="relative flex items-center justify-center p-1 mx-auto shadow-inner bg-zinc-100 rounded-xl w-fit">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative z-10 flex items-center justify-center min-w-[80px] sm:min-w-[100px] px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 hover:text-zinc-900"
              >
                {isActive && (
                  <motion.div
                    layoutId="calculatorTabHighlight"
                    className="absolute inset-0 bg-orange-500 rounded-lg shadow-md "
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}

                <motion.span
                  className={`relative z-10 ${isActive ? 'text-white' : 'text-zinc-500'}`}
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    fontWeight: isActive ? 600 : 500,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  {tab.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
        {children}
        <span className="block px-2 mt-4 text-center sm:mt-6 sm:text-sm">
          Consider exchange fees and slippage!
        </span>
      </div>
    </div>
  );
}
