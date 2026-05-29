import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Bookmark, Place } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnthropicMessage = {
  role: "user";
  content: string;
};

type RecommendedPlace = {
  id: string;
  reason: string;
};

const MODEL = "claude-haiku-4-5-20251001";

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "not_configured", message: "AI 추천이 아직 활성화되지 않았어요" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // 1. 사용자의 즐겨찾기 장소
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("target_type", "place");
  const bookmarkedIds = ((bookmarks ?? []) as Pick<Bookmark, "target_id">[]).map(
    (b) => b.target_id
  );

  const { data: bookmarkedPlaces } = bookmarkedIds.length
    ? await supabase
        .from("places")
        .select("id, name, tags, category_id")
        .in("id", bookmarkedIds)
    : { data: [] as Pick<Place, "id" | "name" | "tags" | "category_id">[] };

  // 2. 추천 후보 풀 (즐겨찾기 제외)
  const { data: candidatesRaw } = await supabase
    .from("places")
    .select("id, name, tags, category_id, description")
    .order("name");
  const candidates = ((candidatesRaw ?? []) as (Pick<
    Place,
    "id" | "name" | "tags" | "category_id" | "description"
  >)[]).filter((p) => !bookmarkedIds.includes(p.id));

  if (candidates.length === 0) {
    return NextResponse.json({ items: [], message: "모든 장소를 이미 저장하셨네요!" });
  }

  // 3. 프롬프트
  const userProfile =
    bookmarkedPlaces && bookmarkedPlaces.length > 0
      ? bookmarkedPlaces
          .map((p) => `- ${p.name} (태그: ${(p.tags ?? []).join(", ")})`)
          .join("\n")
      : "(즐겨찾기 비어있음)";

  const candidateList = candidates
    .map(
      (p) =>
        `id=${p.id} | 이름=${p.name} | 카테고리=${p.category_id} | 태그=${(p.tags ?? []).join(",")} | ${p.description.slice(0, 60)}`
    )
    .join("\n");

  const prompt = `당신은 교토 여가 가이드 앱의 추천 큐레이터입니다.

[사용자가 즐겨찾기한 장소]
${userProfile}

[추천 후보 풀 (${candidates.length}개)]
${candidateList}

위 후보 중 사용자에게 가장 잘 맞을 만한 3곳을 선정해주세요.
즐겨찾기가 비어있다면 교토를 처음 방문하는 교환학생에게 좋을 만한 다양한 카테고리 3곳을 골라주세요.

다음 JSON 형식만 응답하세요 (다른 텍스트 금지):
{"items":[{"id":"<place_id>","reason":"<왜 추천하는지 한국어 한 문장 30자 이내>"}, ...]}`;

  const messages: AnthropicMessage[] = [{ role: "user", content: prompt }];

  // 4. Anthropic API 호출
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages,
      }),
    });
  } catch (err) {
    console.error("anthropic fetch failed", err);
    return NextResponse.json(
      { error: "upstream_unreachable", message: "추천 서비스에 연결할 수 없어요" },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("anthropic api error", response.status, errText);
    return NextResponse.json(
      { error: "upstream_error", status: response.status },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    payload.content?.find((c) => c.type === "text")?.text?.trim() ?? "";

  // 5. JSON 파싱 (모델이 가끔 코드블록을 씌우므로 닦아냄)
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let parsed: { items?: RecommendedPlace[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.warn("recommend: failed to parse model output", text);
    return NextResponse.json(
      { error: "parse_failed", raw: text },
      { status: 502 }
    );
  }

  const validIds = new Set(candidates.map((c) => c.id));
  const items = (parsed.items ?? [])
    .filter((it) => it && validIds.has(it.id) && typeof it.reason === "string")
    .slice(0, 3);

  return NextResponse.json({ items });
}
