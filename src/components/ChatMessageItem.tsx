"use client";

export type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
};

type Props = {
  message: ChatMessage;
  formattedTime: string;
  copied?: boolean;
  canDelete?: boolean;
  deleting?: boolean;
  onCopy: (content: string) => void;
  onDelete?: (id: string) => void;
};

export default function ChatMessageItem({
  message,
  formattedTime,
  copied,
  canDelete,
  deleting,
  onCopy,
  onDelete,
}: Props) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-violet-300">
      <button
        type="button"
        onClick={() => onCopy(message.content)}
        className="w-full p-4 text-left"
        title="클릭하여 복사"
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-violet-600">{formattedTime}</p>
          {copied ? (
            <span className="text-xs font-medium text-emerald-600">복사됨!</span>
          ) : (
            <span className="text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
              클릭하여 복사
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {message.content}
        </p>
      </button>

      {canDelete && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(message.id)}
          disabled={deleting}
          className="absolute right-3 top-3 rounded-lg bg-red-50 p-1.5 text-red-500 opacity-0 transition hover:bg-red-100 group-hover:opacity-100 disabled:opacity-50"
          title="삭제"
          aria-label="공지 삭제"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
