interface HandleResetProps {
  handleReset: () => void;
}
export default function CalculatorButtons({ handleReset }: HandleResetProps) {
  return (
    <div className="flex justify-between gap-3">
      <button
        type="submit"
        className="px-4 sm:px-6 py-2 text-sm sm:text-base transition bg-orange-400 cursor-pointer text-zinc-900 rounded-2xl hover:bg-amber-500"
      >
        Calc profit
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="px-4 sm:px-6 py-2 text-sm sm:text-base transition bg-orange-400 cursor-pointer text-zinc-900 rounded-2xl hover:bg-amber-500"
      >
        Reset
      </button>
    </div>
  );
}
