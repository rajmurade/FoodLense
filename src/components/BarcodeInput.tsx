import { uiStrings } from '../data/uiStrings';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function BarcodeInput({ value, onChange, onSubmit }: BarcodeInputProps) {
  return (
    <form
      className="space-y-2 rounded-2xl bg-white p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="barcode-input" className="block text-sm font-medium text-brand-dark">
        {uiStrings.scan.barcodeLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="barcode-input"
          name="barcode"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={uiStrings.scan.barcodePlaceholder}
          className="min-h-[44px] w-full rounded-xl border border-black/15 px-3 py-2 text-base text-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {uiStrings.scan.lookup}
        </button>
      </div>
    </form>
  );
}
