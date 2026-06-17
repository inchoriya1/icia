import { Prisma } from "@prisma/client";
import { withDbFallback } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";

export const QUESTIONS_PAGE_SIZE = 10;

export type QuestionListItem = {
  id: string;
  title: string;
  content: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  _count: { images: number };
};

export type QuestionsPageResult = {
  questions: QuestionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type QuestionListFilters = {
  page: number;
  status: "all" | "open" | "resolved";
  q: string;
};

function buildWhere(search: string, status: string): Prisma.QuestionWhereInput {
  const conditions: Prisma.QuestionWhereInput[] = [];

  if (status === "open") {
    conditions.push({ isResolved: false });
  } else if (status === "resolved") {
    conditions.push({ isResolved: true });
  }

  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export function parseQuestionsPage(value: string | undefined) {
  return Math.max(1, Number(value ?? "1") || 1);
}

export function parseQuestionStatus(value: string | undefined): QuestionListFilters["status"] {
  if (value === "open" || value === "resolved") return value;
  return "all";
}

export function questionsListHref({ page, status, q }: QuestionListFilters) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/questions?${qs}` : "/questions";
}

export async function fetchQuestionsPage(filters: QuestionListFilters) {
  const { page, status, q } = filters;
  const where = buildWhere(q, status);
  const skip = (page - 1) * QUESTIONS_PAGE_SIZE;

  return withDbFallback<QuestionsPageResult>(
    {
      questions: [],
      total: 0,
      page,
      pageSize: QUESTIONS_PAGE_SIZE,
      totalPages: 0,
    },
    async () => {
      const [rows, total] = await Promise.all([
        prisma.question.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: QUESTIONS_PAGE_SIZE,
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            _count: { select: { images: true } },
          },
        }),
        prisma.question.count({ where }),
      ]);

      return {
        questions: rows.map((question) => ({
          id: question.id,
          title: question.title,
          content: question.content,
          isResolved: question.isResolved,
          resolvedAt: question.resolvedAt?.toISOString() ?? null,
          createdAt: question.createdAt.toISOString(),
          _count: question._count,
        })),
        total,
        page,
        pageSize: QUESTIONS_PAGE_SIZE,
        totalPages: Math.ceil(total / QUESTIONS_PAGE_SIZE) || 0,
      };
    },
  );
}
