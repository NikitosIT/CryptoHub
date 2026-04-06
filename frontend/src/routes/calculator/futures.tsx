import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';

import { ROUTES } from '@/constants/routesPath';
import { calcFuturesSchema, type FuturesFormData } from '@/lib/validatorSchemas';

import CalculatorButtons from './-layout/CalculatorButtons';
import { CalculatorTabs } from './-layout/CalculatorTabs';
import { type PositionType, useFuturesStore } from './-store/useFuturesStore';
import { numberInputClass } from './spot';
export const Route = createFileRoute(ROUTES.CALCULATOR.FUTURES)({
  component: CalculatorFutures,
});

export function CalculatorFutures() {
  const { calculator, profit, entryPrice, exitPrice, position, setPosition, reset } =
    useFuturesStore();
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm<FuturesFormData>({
    resolver: zodResolver(calcFuturesSchema),
  });

  const onSubmit = (data: FuturesFormData) => {
    calculator(data);
  };

  const handleReset = () => {
    reset();
    resetForm();
  };

  const handlePosition = (type: PositionType) => {
    setPosition(type);
  };

  const isProfit = profit != null && profit >= 0;

  return (
    <CalculatorTabs>
      <div className="relative flex p-1 mt-6 mb-4 bg-zinc-200 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => handlePosition('long')}
          className="relative px-4 py-2 text-sm font-medium"
        >
          {position === 'long' && (
            <motion.div
              layoutId="positionHighlight"
              className="absolute inset-0 bg-green-500 rounded-lg"
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            />
          )}
          <span
            className={`relative z-10 ${
              position === 'long' ? 'text-white' : 'text-zinc-600'
            }`}
          >
            Long
          </span>
        </button>

        <button
          type="button"
          onClick={() => handlePosition('short')}
          className="relative px-4 py-2 text-sm font-medium"
        >
          {position === 'short' && (
            <motion.div
              layoutId="positionHighlight"
              className="absolute inset-0 bg-red-500 rounded-lg"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
          <span
            className={`relative z-10 ${
              position === 'short' ? 'text-white' : 'text-zinc-600'
            }`}
          >
            Short
          </span>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('margin', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="Margin $"
            className={numberInputClass}
          />
        </div>
        <div>
          <input
            {...register('leverage', { valueAsNumber: true })}
            type="number"
            step="1"
            min="1"
            max="200"
            placeholder="Leverage (1-200x)"
            className={numberInputClass}
          />
        </div>
        <div>
          <input
            {...register('entryPrice', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="Entry price $"
            className={numberInputClass}
          />
        </div>
        <div>
          <input
            {...register('exitPrice', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="Exit price $"
            className={numberInputClass}
          />
        </div>

        <CalculatorButtons handleReset={handleReset} />
      </form>
      {profit != null && entryPrice != null && exitPrice != null && (
        <div className="p-3 mt-4 text-center sm:p-4 sm:mt-6 rounded-xl bg-zinc-700">
          <p className="text-xs sm:text-sm text-zinc-300">
            {position === 'long' ? 'Long' : 'Short'} Profit
          </p>
          <p
            className="text-xl font-bold sm:text-2xl"
            style={{ color: isProfit ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}
          >
            {isProfit ? '+' : ''}
            {profit.toFixed(2)} $
          </p>
        </div>
      )}
    </CalculatorTabs>
  );
}
