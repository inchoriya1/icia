export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Supabase Storage 키는 ASCII만 허용 — 원본 파일명은 DB fileName에 따로 저장 */
export function buildStoragePath(folderId: string, originalName: string, index?: number) {
  const dot = originalName.lastIndexOf(".");
  const ext = dot >= 0 ? originalName.slice(dot).replace(/[^\w.\-]/g, "") : "";
  const unique =
    index !== undefined ? `${index}-${crypto.randomUUID()}` : crypto.randomUUID();
  return `${folderId}/${unique}${ext}`;
}
