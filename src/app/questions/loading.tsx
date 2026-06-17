import ListSkeleton from "@/components/ListSkeleton";

export default function QuestionsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200/60" />
        <div className="h-5 w-72 animate-pulse rounded-lg bg-slate-200/60" />
      </div>
      <div className="mb-4 h-11 animate-pulse rounded-xl bg-slate-200/60" />
      <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-slate-200/60" />
      <ListSkeleton count={3} height="h-28" />
    </div>
  );
}
