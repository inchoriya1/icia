import { formatDate } from "@/lib/utils";

export function chatMessageTitle(content: string, createdAt: Date): string {
  const firstLine = content.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  if (firstLine) return firstLine.slice(0, 80);
  return `공지 ${formatDate(createdAt.toISOString())}`;
}

export function chatMessageFileName(title: string, createdAt: Date): string {
  const stamp = createdAt.toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const safe = title.replace(/[^\w가-힣.\-()]/g, "_").slice(0, 40) || "notice";
  return `${safe}-${stamp}.txt`;
}
