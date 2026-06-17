type Props = {
  count?: number;
  height?: string;
};

export default function ListSkeleton({ count = 3, height = "h-24" }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${height} animate-pulse rounded-2xl bg-slate-200/60`} />
      ))}
    </div>
  );
}
