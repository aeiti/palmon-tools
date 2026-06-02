import CompactInput from './CompactInput.jsx';

// CompactInput wrapped with explicit "−" and "+" buttons for click-to-step
// adjustments. Same compact (K/M/B) display and parsing as CompactInput;
// the buttons are an additive surface for tapping discrete counts up or
// down without using the keyboard.
//
// The buttons call `onChange(value ± 1)` directly. Clamps at `min` (default
// 0) on the decrement side; no clamp on the increment side. If the input
// has an in-flight draft and the user clicks a button, the input blurs
// first (browser default) — its onBlur commits the draft, then the button
// click fires onChange again with `value + 1` / `value - 1`. That's the
// desired ordering: commit-then-step.
//
// Forwarded props (`...rest`) reach the underlying CompactInput, so `id`
// can be threaded through for label associations.
export default function StepperInput({
  value,
  onChange,
  min = 0,
  ariaLabel,
  className,
  ...rest
}) {
  const canDecrement = value > min;

  const decrement = () => {
    if (canDecrement) onChange(value - 1);
  };

  const increment = () => {
    onChange(value + 1);
  };

  return (
    <div
      className={[
        'flex h-7 items-stretch overflow-hidden rounded-md bg-slate-800 ring-1 ring-slate-700 transition-shadow focus-within:ring-2 focus-within:ring-indigo-400',
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease'}
        onClick={decrement}
        disabled={!canDecrement}
        className="flex w-6 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100 disabled:cursor-not-allowed disabled:text-slate-700 disabled:hover:bg-transparent"
      >
        <span aria-hidden="true" className="text-base leading-none">
          −
        </span>
      </button>
      <CompactInput
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        className="min-w-0 flex-1 bg-transparent px-1 text-center tabular-nums text-sm leading-none text-slate-100 focus:outline-none"
        {...rest}
      />
      <button
        type="button"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase'}
        onClick={increment}
        className="flex w-6 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
      >
        <span aria-hidden="true" className="text-base leading-none">
          +
        </span>
      </button>
    </div>
  );
}
