import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("=== Supabase 연동 점검 ===\n");

// 1) 환경변수
const envOk =
  !!process.env.DATABASE_URL &&
  !!process.env.DIRECT_URL &&
  !!url &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!key;

console.log("환경변수:", envOk ? "✓ 설정됨" : "✗ 누락");
if (url) console.log("  프로젝트 URL:", url);

// 2) DB
let dbOk = false;
try {
  const prisma = new PrismaClient();
  const count = await prisma.material.count();
  console.log("\nPostgreSQL(DB): ✓ 연결됨");
  console.log("  Material 테이블 조회 성공, 현재 자료 수:", count);
  dbOk = true;
  await prisma.$disconnect();
} catch (e) {
  console.log("\nPostgreSQL(DB): ✗ 연결 실패");
  console.log(" ", e instanceof Error ? e.message : e);
}

// 3) Storage
let storageOk = false;
if (url && key) {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log("\nStorage: ✗ 조회 실패");
    console.log(" ", error.message);
  } else {
    const names = data.map((b) => b.name);
    const hasMaterials = names.includes("materials");
    const hasImages = names.includes("question-images");
    storageOk = hasMaterials && hasImages;
    console.log("\nStorage: ✓ 연결됨");
    console.log("  버킷 목록:", names.join(", ") || "(없음)");
    console.log("  materials:", hasMaterials ? "✓" : "✗");
    console.log("  question-images:", hasImages ? "✓" : "✗");
  }
}

console.log("\n=== 결과 ===");
console.log(
  envOk && dbOk && storageOk
    ? "Supabase 연동이 정상입니다."
    : "일부 항목에 문제가 있습니다. 위 메시지를 확인하세요.",
);
