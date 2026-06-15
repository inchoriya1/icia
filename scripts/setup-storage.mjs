import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 확인하세요.",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

const buckets = ["materials", "question-images"];

for (const name of buckets) {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: false,
  });

  if (error) {
    if (error.message?.toLowerCase().includes("already exists")) {
      console.log(`이미 존재함: ${name}`);
    } else {
      console.error(`생성 실패: ${name} -> ${error.message}`);
    }
  } else {
    console.log(`생성 완료: ${data?.name ?? name}`);
  }
}

console.log("완료");
