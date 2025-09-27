import { GoogleGenAI } from "@google/genai";
import { type AnalysisReport, type Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPrompt = (): string => {
  return `
You are an expert financial analyst specializing in Indian equity and derivatives markets, focusing on Nifty 50 options.

**First, perform a web search to find the most recent closing level of the Nifty 50 index and the next weekly expiry date.** Use these as the basis for your analysis.

**IMPORTANT: At the very top of your entire response, YOU MUST include a markdown table summarizing the probability estimates.** This table must appear before any other text.
The table must have two columns: 'Direction' and 'Probability'.
The 'Direction' column must contain exactly these three values: 'Upside', 'Downside', and 'Flat/Sideways'.
Here is the required format:
\`\`\`markdown
| Direction | Probability |
|---|---|
| Upside | 35% |
| Downside | 25% |
| Flat/Sideways | 40% |
\`\`\`

After the table, utilize available tools (e.g., web searches, Twitter sentiment analysis, financial site scraping for charts/data/news) to gather the latest relevant data. This data should encompass: 
1.  Technical Indicators: Weekly candlesticks, Moving Averages (MAs), RSI/Stochastics, Implied Volatility (IV), and Option Greeks.
2.  Fundamentals: Macroeconomic releases, Foreign Institutional Investor (FII) and Domestic Institutional Investor (DII) flows, key sectoral news, and Reserve Bank of India (RBI) updates.
3.  Real-time Sentiment: Major market headlines, relevant geopolitical developments, and detailed option chain analysis.

Produce a concise weekly report that includes:

Part 1: Probability Estimates
Explain the reasoning behind the probabilities in the summary table. Estimate the probabilities (%) for Nifty 50 closing by the specified weekly expiry date in three distinct scenarios, relative to the current Nifty level:
- Upside: Nifty 50 closes above the At-The-Money (ATM) strike.
- Downside: Nifty 50 closes below the At-The-Money (ATM) strike.
- Flat/Sideways: Nifty 50 closes within a defined ATM band (e.g., within ±1% of the current Nifty 50 level).
Support these estimates with clear, concise assumptions derived from your analysis. For example: 'RSI oversold indicates 60% rebound chance' or 'FII inflows of ₹1,200 cr signal bullishness'.

Part 2: High-Risk Weekly Option Buying Strategy Recommendation
Based on the derived probabilities, recommend the optimal high-risk weekly option buying strategy for the specified expiry (assuming a trade duration from Wednesday's open to Tuesday's close). Choose one of the following:
- Buy Calls Only
- Buy Puts Only
- Buy Long Strangle
For the recommended strategy, estimate the expected return (%) and identify major risks (e.g., theta decay, IV crush).

Part 3: Actionable Summary
Conclude with an 'Actionable Summary' providing:
- Specific strike(s) to consider buying today.
- Approximate premium (₹) for the recommended strike(s).
- Estimated success probability (%) for the recommended trade.
`;
};

export const getTradingAnalysis = async (): Promise<AnalysisReport> => {
  const prompt = getPrompt();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: Source[] = groundingChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri ?? '',
        title: chunk.web?.title ?? 'Untitled',
      }))
      .filter((source: Source) => source.uri)
      // Deduplicate sources by URI
      .filter((source: Source, index: number, self: Source[]) =>
        index === self.findIndex((s) => s.uri === source.uri)
      );

    return { text, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
