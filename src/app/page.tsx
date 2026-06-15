import Link from "next/link";
import ChatAccordion from "@/components/ChatAccordion";

const features = [
  {
    href: "/materials",
    title: "자료실",
    description: "강의 슬라이드, 코드, 참고 자료를 다운로드하세요.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: "from-violet-500/20 to-purple-500/5",
  },
  {
    href: "/questions",
    title: "질문게시판",
    description: "익명으로 질문하고, 해결 여부를 확인하세요.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-indigo-500/20 to-blue-500/5",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          2026 Spring Lecture
        </div>

        <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          AI 사무자동화
          <br />
          실무 전문가 과정
        </h1>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-8 transition hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5`}
          >
            <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3 text-violet-300 ring-1 ring-white/10">
              {feature.icon}
            </div>
            <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-400 transition group-hover:gap-2">
              이동하기
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </section>

      <ChatAccordion />
    </div>
  );
}
