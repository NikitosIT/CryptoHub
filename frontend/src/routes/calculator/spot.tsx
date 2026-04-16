import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';

import { calcSpotSchema, type SpotFormData } from '@/lib/validatorSchemas';
import { useSpotStore } from '@/routes/calculator/-store/useSpotStore';

import CalculatorButtons from './-components/CalculatorButtons';
import { CalculatorTabs } from './-components/CalculatorTabs';

export const Route = createFileRoute('/calculator/spot')({
  component: CalculatorSpot,
});

export function CalculatorSpot() {
  const { calculator, profit, entryPrice, exitPrice, reset } = useSpotStore();
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm<SpotFormData>({
    resolver: zodResolver(calcSpotSchema),
  });

  const onSubmit = (data: SpotFormData) => {
    calculator(data);
  };

  const handleReset = () => {
    reset();
    resetForm();
  };

  return (
    <CalculatorTabs>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
            {...register('entryPrice', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="Entry Price $"
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

      {profit !== null && entryPrice !== null && exitPrice !== null && (
        <div className="p-3 mt-4 text-center sm:p-4 sm:mt-6 rounded-xl bg-zinc-700">
          <p className="text-xs sm:text-sm text-zinc-300">Profit</p>
          <p
            className="text-xl font-bold sm:text-2xl"
            style={{
              color:
                exitPrice > entryPrice
                  ? 'rgb(34 197 94)'
                  : exitPrice < entryPrice
                    ? 'rgb(239 68 68)'
                    : 'white',
            }}
          >
            {exitPrice > entryPrice ? '+' : ''}
            {profit.toFixed(2)} $
          </p>
        </div>
      )}
    </CalculatorTabs>
  );
}

export const numberInputClass =
  'w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
