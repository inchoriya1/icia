import ListSkeleton from "@/components/ListSkeleton";

export default function MaterialsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 space-y-3">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200/60" />
        <div className="h-5 w-64 animate-pulse rounded-lg bg-slate-200/60" />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}
