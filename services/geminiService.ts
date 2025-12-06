import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIAnalysisResult, Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeInventoryWithGemini = async (items: InventoryItem[]): Promise<AIAnalysisResult> => {
  if (!items || items.length === 0) {
    return {
      summary: "재고가 비어있습니다. 항목을 추가하여 분석을 시작하세요.",
      alerts: [],
      suggestions: ["자주 사용하는 세포주나 배지를 먼저 등록해보세요."]
    };
  }

  // Simplify data to reduce token usage and focus on key metrics
  const inventorySummary = items.map(item => {
    const base = {
      name: item.name,
      category: item.category,
      qty: item.quantity,
      unit: item.unit,
      expiry: item.expiryDate || 'N/A',
    };
    if (item.category === Category.CELL_STOCK) {
      return { ...base, passage: item.passage, freezeDate: item.freezeDate };
    }
    return base;
  });

  const prompt = `
    당신은 전문적인 실험실 관리자(Lab Manager) AI 비서입니다. 다음 실험실 재고 목록을 분석해 주세요.
    
    재고 데이터:
    ${JSON.stringify(inventorySummary)}
    
    작업:
    1. 재고가 부족하거나 유효기간이 지난 중요한 항목을 식별하세요.
    2. 세포주(Cell stock)를 분석하여 Passage가 너무 높거나 동결일(Freeze date)이 오래되어 갱신이 필요한 항목을 찾으세요.
    3. 실험실 현황에 대한 간략한 임원용 요약 보고서를 작성하세요.
    4. 구체적인 실행 조치(예: "DMEM 주문 필요", "HeLa 세포주 새로 해동 필요")를 제안하세요.
    
    모든 응답은 한국어로 작성해 주세요.
    
    현재 날짜: ${new Date().toLocaleDateString()}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  message: { type: Type.STRING },
                  itemId: { type: Type.STRING, nullable: true } // mapped back conceptually
                },
                required: ["severity", "message"]
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "alerts", "suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("AI Analysis Failed", error);
    // Fallback in case of error
    return {
      summary: "AI 분석을 수행할 수 없습니다. 네트워크 연결을 확인해 주세요.",
      alerts: [{ severity: 'medium', message: "AI 서비스 응답 없음" }],
      suggestions: ["인터넷 연결 확인", "API 키 확인"]
    };
  }
};