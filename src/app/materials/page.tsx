import Link from "next/link";
import { isInstructor } from "@/lib/auth";
import {
  fetchMaterialsPage,
  parseMaterialsPage,
} from "@/lib/materials-list";
import MaterialsList from "@/components/MaterialsList";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MaterialsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseMaterialsPage(params.page);
  const [{ data }, instructor] = await Promise.all([
    fetchMaterialsPage(page),
    isInstructor(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">자료실</h1>
          <p className="mt-2 text-slate-500">강의 자료를 다운로드 받을 수 있습니다.</p>
        </div>
        {instructor && (
          <Link
            href="/materials/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
          >
            자료 업로드
          </Link>
        )}
      </div>

      <MaterialsList
        materials={data.materials}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        isInstructor={instructor}
      />
    </div>
  );
}
