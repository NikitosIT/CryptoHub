type HandleResetProps = {
  handleReset: () => void;
};
export default function CalculatorButtons({ handleReset }: HandleResetProps) {
  return (
    <div className="flex justify-between gap-3">
      <button
        type="submit"
        className="px-4 py-2 text-sm transition bg-orange-400 cursor-pointer sm:px-6 sm:text-base text-zinc-900 rounded-2xl hover:bg-amber-500"
      >
        Calc profit
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="px-4 py-2 text-sm transition bg-orange-400 cursor-pointer sm:px-6 sm:text-base text-zinc-900 rounded-2xl hover:bg-amber-500"
      >
        Reset
      </button>
    </div>
  );
}
