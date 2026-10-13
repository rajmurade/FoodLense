import { uiStrings } from '../data/uiStrings';
import type { ProductResponse } from '../lib/api';

interface ProductCardProps {
  data: ProductResponse;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return uiStrings.product.unavailable;
  }
  return date.toLocaleString();
}

function orUnavailable(value: string | null): string {
  return value ?? uiStrings.product.unavailable;
}

export default function ProductCard({ data }: ProductCardProps) {
  const product = data.product;

  return (
    <article className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name ?? uiStrings.product.unavailable}
            className="h-24 w-24 shrink-0 rounded-xl object-contain"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-black/5 text-xs text-brand-dark/50"
          >
            {uiStrings.product.unavailable}
          </div>
        )}

        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold text-brand-dark">
            {orUnavailable(product?.name ?? null)}
          </h2>
          <p className="text-sm text-brand-dark/80">
            {orUnavailable(product?.brand ?? null)}
            {product?.quantity ? ` · ${product.quantity}` : ''}
          </p>
          <p className="text-sm text-brand-dark/80">
            <span className="font-medium">{uiStrings.product.barcodeLabel}</span>{' '}
            <span className="font-mono">{data.barcode}</span>
          </p>
        </div>
      </div>

      <dl className="space-y-1 text-sm text-brand-dark/80">
        <div>
          <dt className="inline font-medium">{uiStrings.product.sourceLabel}</dt>
        </div>
        <div>
          <dt className="inline font-medium">{uiStrings.product.retrievedLabel}:</dt>{' '}
          <dd className="inline">{formatDateTime(data.retrievedAt)}</dd>
        </div>
      </dl>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-brand-dark">
          {uiStrings.product.ingredientsHeading}
        </h3>
        <p className="whitespace-pre-wrap text-sm text-brand-dark/90">
          {product?.ingredientsText ?? uiStrings.product.ingredientsUnavailable}
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        <span aria-hidden="true" className="mt-0.5 font-bold">
          !
        </span>
        <span>{uiStrings.product.caveat}</span>
      </p>
    </article>
  );
}
