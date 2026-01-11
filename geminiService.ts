
import { GoogleGenAI, Type } from "@google/genai";
import { HealthReport } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: '普瑞纳粪便评分 (1-7)。1表示干硬，7表示水样腹泻。2是理想状态。',
    },
    consistency: {
      type: Type.STRING,
      description: '质地描述（例如：坚实、软成型、松散等）。',
    },
    color: {
      type: Type.STRING,
      description: '粪便的颜色。',
    },
    findings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '具体观察结果列表，如粘液、血液、寄生虫或异物。',
    },
    analysis: {
      type: Type.STRING,
      description: '对图像显示的详细专业分析。',
    },
    recommendation: {
      type: Type.STRING,
      description: '给主人的建议（如：继续观察、咨询兽医、调整饮食等）。',
    },
  },
  required: ['score', 'consistency', 'color', 'findings', 'analysis', 'recommendation'],
};

export async function analyzeStoolImage(base64Image: string, dogId: string, proxyUrl?: string): Promise<HealthReport> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }

  try {
    // 如果提供了 proxyUrl，则传递给 SDK
    const config: any = { apiKey };
    if (proxyUrl && proxyUrl.trim() !== "") {
      config.baseUrl = proxyUrl.trim().replace(/\/$/, ""); // 去掉末尾斜杠
    }

    const ai = new GoogleGenAI(config);
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      你是一位专业的兽医助手，擅长犬类胃肠道健康分析。
      请分析这张狗狗粪便的照片，并提供详细的健康报告。
      请使用标准的普瑞纳粪便评分系统 (1-7) 进行评估。
      请以客观、专业的口吻用中文进行回复。必须包含医疗免责声明。
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1],
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      id: Date.now().toString(),
      dogId,
      date: new Date().toISOString(),
      imageUrl: base64Image,
      score: result.score || 0,
      consistency: result.consistency || "未知",
      color: result.color || "未知",
      findings: result.findings || [],
      analysis: result.analysis || "无法分析图像",
      recommendation: result.recommendation || "请咨询专业兽医",
    };
  } catch (err: any) {
    const msg = err.message || "";
    if (
      msg.includes("Requested entity was not found") || 
      msg.includes("API key not found") ||
      msg.includes("API Key must be set")
    ) {
      throw new Error("INVALID_KEY_ERROR");
    }
    throw err;
  }
}
