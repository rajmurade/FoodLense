interface LoadingProps {
  label: string;
}

export default function Loading({ label }: LoadingProps) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{label}</span>
      <div className="h-40 w-full animate-pulse rounded-2xl bg-black/5" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-black/5" />
    </div>
  );
}
