import { formatDate } from "@/lib/utils";

type ChatMessageLike = {
  content: string;
  createdAt: Date;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatExportDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}(${WEEKDAYS[date.getDay()]})`;
}

export function formatAllChatMessages(messages: ChatMessageLike[]): string {
  return messages
    .map((message) => {
      const time = formatDate(message.createdAt.toISOString());
      return `${time}\n\n${message.content.trim()}`;
    })
    .join("\n\n" + "-".repeat(40) + "\n\n");
}

export function buildChatExportBundle(messages: ChatMessageLike[]) {
  const exportedAt = new Date();
  const stamp = exportedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const dateLabel = formatExportDateLabel(exportedAt);
  const title = `실시간 공지 채팅 모음 (${formatDate(exportedAt.toISOString())})`;
  const description = `${dateLabel} 채팅 ${messages.length}건 자료`;
  const fileName = `chat-export-${stamp}.txt`;
  const content = formatAllChatMessages(messages);

  return { title, description, fileName, content };
}
