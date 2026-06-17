import Link from "next/link";
import { notFound } from "next/navigation";
import QuestionDetailView from "@/components/QuestionDetailView";
import { isInstructor } from "@/lib/auth";
import { fetchQuestionById } from "@/lib/questions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;
  const [{ data: question }, instructor] = await Promise.all([
    fetchQuestionById(id),
    isInstructor(),
  ]);

  if (!question) {
    notFound();
  }

  return (
    <QuestionDetailView
      key={`${question.id}-${question.replies.length}`}
      question={question}
      isInstructor={instructor}
    />
  );
}
