import { withDbFallback } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";

export const MATERIALS_PAGE_SIZE = 4;

export type MaterialListItem = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
};

export type MaterialsPageResult = {
  materials: MaterialListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseMaterialsPage(value: string | undefined) {
  return Math.max(1, Number(value ?? "1") || 1);
}

export function materialsPageHref(page: number) {
  if (page <= 1) return "/materials";
  return `/materials?page=${page}`;
}

export async function fetchMaterialsPage(page: number) {
  const skip = (page - 1) * MATERIALS_PAGE_SIZE;

  return withDbFallback<MaterialsPageResult>(
    {
      materials: [],
      total: 0,
      page,
      pageSize: MATERIALS_PAGE_SIZE,
      totalPages: 0,
    },
    async () => {
      const [rows, total] = await Promise.all([
        prisma.material.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: MATERIALS_PAGE_SIZE,
        }),
        prisma.material.count(),
      ]);

      return {
        materials: rows.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileName: m.fileName,
          fileSize: m.fileSize,
          createdAt: m.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize: MATERIALS_PAGE_SIZE,
        totalPages: Math.ceil(total / MATERIALS_PAGE_SIZE) || 0,
      };
    },
  );
}
