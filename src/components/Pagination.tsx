import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export default function Pagination({ page, totalPages, hrefForPage }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
  });

  const navButtonClass =
    "rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100";
  const disabledClass = `${navButtonClass} pointer-events-none opacity-40`;

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="페이지">
      {page <= 1 ? (
        <span className={disabledClass}>이전</span>
      ) : (
        <Link href={hrefForPage(page - 1)} className={navButtonClass} prefetch>
          이전
        </Link>
      )}

      {pages.map((p, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;

        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-slate-400">…</span>}
            <Link
              href={hrefForPage(p)}
              prefetch
              className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                p === page
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}

      {page >= totalPages ? (
        <span className={disabledClass}>다음</span>
      ) : (
        <Link href={hrefForPage(page + 1)} className={navButtonClass} prefetch>
          다음
        </Link>
      )}
    </nav>
  );
}
