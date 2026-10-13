import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { ACCEPTED_IMAGE_TYPES } from '../lib/constants';
import { uiStrings } from '../data/uiStrings';

interface ImagePickerProps {
  previewUrl: string | null;
  disabled?: boolean;
  onFileChosen: (file: File) => void;
  onRetake: () => void;
}

const accept = ACCEPTED_IMAGE_TYPES.join(',');

export default function ImagePicker({
  previewUrl,
  disabled = false,
  onFileChosen,
  onRetake,
}: ImagePickerProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChosen(file);
    }
    event.target.value = '';
  };

  if (previewUrl) {
    return (
      <div className="space-y-3">
        <img
          src={previewUrl}
          alt={uiStrings.label.previewAlt}
          className="max-h-72 w-full rounded-2xl bg-white object-contain shadow-sm"
        />
        <button
          type="button"
          onClick={onRetake}
          disabled={disabled}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        >
          {uiStrings.label.retake}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraInput.current?.click()}
          disabled={disabled}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        >
          {uiStrings.label.takePhoto}
        </button>
        <button
          type="button"
          onClick={() => uploadInput.current?.click()}
          disabled={disabled}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        >
          {uiStrings.label.uploadImage}
        </button>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept={accept}
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      <input
        ref={uploadInput}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />

      <p className="text-xs text-brand-dark/70">{uiStrings.label.privacyNote}</p>
    </div>
  );
}
