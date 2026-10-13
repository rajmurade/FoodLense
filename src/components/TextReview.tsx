import type { ChangeEvent } from 'react';
import { uiStrings } from '../data/uiStrings';

interface TextReviewProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TextReview({ value, onChange, disabled = false }: TextReviewProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="ingredients-text" className="text-sm font-semibold text-brand-dark">
        {uiStrings.label.textareaLabel}
      </label>
      <textarea
        id="ingredients-text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={8}
        placeholder={uiStrings.label.placeholder}
        className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-brand-dark shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
      />
      <p className="text-xs text-brand-dark/70">{uiStrings.label.reviewHint}</p>
    </div>
  );
}
