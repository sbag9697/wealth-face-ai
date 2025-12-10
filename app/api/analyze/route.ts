import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // Base64 이미지

    if (!image) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    // Base64 헤더 제거 (data:image/jpeg;base64, 부분) - Safely handle if prefix exists or not
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // Use gemini-1.5-flash as requested, but cleaner error handling if it fails
    // Note: If 1.5 is deprecated, this might fail, but user specifically asked for this code.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      너는 40년 경력의 대한민국 최고의 관상가이자 현대적 빅데이터 분석가야.
      이 사람의 얼굴을 아주 면밀히 분석해서, 사용자가 감탄할 만큼 구체적이고 전문적인 결과를 JSON으로 줘.
      
      [분석 가이드라인]
      1. **말투**: 매우 단호하고 신비로우면서도, 데이터에 기반한 전문성을 갖출 것. (예: "눈매의 30%가 용의 형상을 띠고 있어...", "하관의 각도가 115도로 재물이 모이는 구조입니다.")
      2. **상세함**: '자세한 분석' 파트는 반드시 **공백 포함 최소 800자 이상**으로 작성할 것. 짧으면 안 됨.
      3. **구조**: 초년운(이마), 중년운/재물운(눈,코), 말년운(입,턱)을 명확히 구분하여 설명할 것.

      반드시 아래 JSON 형식을 지켜줘:
      {
        "richLookalike": "닮은 부자 이름 (예: 이건희, 워렌 버핏, 일론 머스크 등 구체적 인물)",
        "matchRate": "숫자 (85~99 사이, 소수점은 제외)",
        "animalType": "구체적인 동물상 (예: 황금 두꺼비, 백호, 천년 묵은 여우, 비상하는 용)",
        "potentialWealth": "예상 잠재 자산 (예: 500억 ~ 3,000억 원)",
        "summary": "관상에 대한 30자 이내의 아주 자극적인 한 줄 요약",
        "detailedAnalysis": "초년운, 중년운(재물운 핵심), 말년운, 직업/성향 조언을 포함한 아주 상세한 1000자 이상의 줄글 분석. 사용자가 읽다가 소름 돋게 만들 것."
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();

    // JSON 파싱 (Gemini가 마크다운 코드블럭을 포함할 경우 제거)
    const cleanedText = responseText.replace(/```json|```/g, "").trim();

    let analysisData;
    try {
      analysisData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Parse Error", cleanedText);
      // Fallback or retry? Let's just return error
      return NextResponse.json({ error: "분석 결과를 해석할 수 없습니다." }, { status: 500 });
    }

    return NextResponse.json(analysisData);

  } catch (error) {
    console.error("Gemini Error:", error);
    // If it's a 404, suggest model change in log
    return NextResponse.json({ error: "관상 분석 실패: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
