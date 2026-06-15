import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ isInstructor: session.isInstructor === true });
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const instructorPassword = process.env.INSTRUCTOR_PASSWORD;

  if (!instructorPassword) {
    return NextResponse.json(
      { error: "강사 비밀번호가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  if (password !== instructorPassword) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.isInstructor = true;
  await session.save();

  return NextResponse.json({ isInstructor: true });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ isInstructor: false });
}
