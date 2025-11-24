import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeSales = async (transactions: Transaction[]) => {
  const ai = getAiClient();
  if (!ai) {
    return "未配置 API Key，无法生成 AI 报告。";
  }

  // Summarize data for the prompt to save tokens and avoid noise
  const today = new Date().toDateString();
  const todaysTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  
  if (todaysTransactions.length === 0) {
    return "今日暂无销售记录，快去开单吧！";
  }

  const totalSales = todaysTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalProfit = todaysTransactions.reduce((acc, t) => acc + t.totalProfit, 0);
  
  // Group by product
  const productStats: Record<string, number> = {};
  todaysTransactions.forEach(t => {
    t.items.forEach(item => {
      productStats[item.name] = (productStats[item.name] || 0) + item.quantity;
    });
  });

  const prompt = `
    你是一位小型零售店的高级业务分析师。
    以下是今天的销售数据摘要：
    - 日期: ${today}
    - 总收入: ¥${totalSales.toFixed(2)}
    - 总利润: ¥${totalProfit.toFixed(2)}
    - 各商品销售数量: ${JSON.stringify(productStats)}
    
    请提供一份简短、鼓励性且可操作的今日绩效分析报告（使用中文回答）。
    请包含以下三点：
    1. 利润率分析。
    2. 今天的畅销冠军。
    3. 给明天的经营建议。
    
    语气请保持专业但亲切。请使用 Markdown 格式（如项目符号）进行排版。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "抱歉，暂时无法分析数据，请检查网络连接。";
  }
};