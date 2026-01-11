import { HealthReport } from "../types";

export async function analyzeStoolImage(base64Image: string, dogId: string, proxyUrl?: string): Promise<HealthReport> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }

  try {
    const prompt = `
      你是一位专业的兽医助手，擅长犬类胃肠道健康分析。
      请分析这张狗狗粪便的照片，并提供详细的健康报告。
      请使用标准的普瑞纳粪便评分系统 (1-7) 进行评估。
      请以客观、专业的口吻用中文进行回复。必须包含医疗免责声明。
      请返回以下 JSON 格式的结果：
      {
        "score": 数字,
        "consistency": "质地描述",
        "color": "颜色",
        "findings": ["观察结果1", "观察结果2"],
        "analysis": "详细分析",
        "recommendation": "建议"
      }
    `;

    // 先获取模型列表
    const modelsResponse = await fetch("https://api.deepseek.com/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    if (!modelsResponse.ok) {
      throw new Error(`Failed to get models: ${await modelsResponse.text()}`);
    }
    
    const models = await modelsResponse.json();
    console.log("Available models:", models);
    
    // 选择正确的模型
    let modelName = "deepseek-chat";
    
    // 检查是否有视觉模型
    if (models.list && models.list.data) {
      const visionModels = models.list.data.filter((model: any) => 
        model.id.includes("vl") || model.id.includes("vision")
      );
      
      if (visionModels.length > 0) {
        modelName = visionModels[0].id;
        console.log("Selected vision model:", modelName);
      }
    }
    
    // 限制消息长度
    const imageData = base64Image.split(',')[1];
    // 只使用图像数据的前10000个字符（大约30KB）
    const truncatedImageData = imageData.substring(0, 10000);
    
    // 调用 DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt + "\n\n[Image (truncated)]\n" + truncatedImageData
          }
        ],
        response_format: { type: "text" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API error: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("API response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Raw response:", responseText);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(`Invalid API response format: ${JSON.stringify(data)}`);
    }
    
    const content = data.choices[0].message.content;
    console.log("AI response content:", content);
    
    let result;
    try {
      result = JSON.parse(content);
    } catch (jsonError) {
      console.error("Failed to parse AI response as JSON:", jsonError);
      console.error("AI response:", content);
      
      // 尝试从响应中提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log("Extracted JSON from response:", result);
        } catch (extractError) {
          throw new Error(`Failed to extract JSON from response: ${extractError.message}`);
        }
      } else {
        // 如果无法解析为 JSON，返回默认结构
        result = {
          score: 3,
          consistency: "未知",
          color: "未知",
          findings: [],
          analysis: "AI 分析失败，无法解析响应。",
          recommendation: "请重新尝试分析。"
        };
      }
    }
    
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
      msg.includes("API key") || 
      msg.includes("authentication")
    ) {
      throw new Error("INVALID_KEY_ERROR");
    }
    throw err;
  }
}
