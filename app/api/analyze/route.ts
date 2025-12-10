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
      너는 40년 경력의 대한민국 최고의 관상가이자 빅데이터 분석가야. 
      이 사람의 얼굴을 분석해서 다음 JSON 형식으로 결과를 줘. 
      말투는 아주 단호하고 신비롭게, 마치 도사가 말하는 것처럼 해.
      
      반드시 아래 JSON 형식을 지켜줘:
      {
        "richLookalike": "닮은 부자 이름 (예: 이건희, 일론 머스크)",
        "matchRate": "숫자 (70~99 사이)",
        "animalType": "동물상 (예: 호랑이, 두꺼비, 여우, 용 등)",
        "potentialWealth": "예상 잠재 자산 (예: 50억 ~ 1000억)",
        "summary": "관상에 대한 한 줄 요약 (자극적이고 흥미롭게)",
        "detailedAnalysis": "상세한 관상 풀이. 눈, 코, 입, 하관을 나누어 설명하고, 왜 이 사람이 부자가 될 상인지, 혹은 무엇을 조심해야 돈이 안 새는지 구체적으로 500자 이상 서술."
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
