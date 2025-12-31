
import { GoogleGenAI } from "@google/genai";
import { Submission, Question } from "../types";

/**
 * Analyzes assessment submissions using Gemini 3 Pro to provide executive-level maturity insights and strategic recommendations.
 */
export const analyzeQuizResults = async (submissions: Submission[], questions: Question[]): Promise<string> => {
  if (!submissions || submissions.length === 0) {
    return "Insufficient data: No submissions found for analysis.";
  }

  // Initialize the Gemini API client using the environment variable API_KEY
  // Always use the named parameter { apiKey }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a structured summary of the data for the AI model
  const reportData = {
    totalSubmissions: submissions.length,
    averageScore: (submissions.reduce((acc, s) => acc + s.totalScore, 0) / submissions.length).toFixed(1),
    breakdown: questions.map(q => {
      const counts = q.options.map(opt => ({
        text: opt.text,
        count: submissions.filter(s => s.answers.find(a => a.questionId === q.id)?.optionIds.includes(opt.id)).length
      }));
      return { question: q.text, results: counts };
    })
  };

  const prompt = `
    You are a world-class Legal Tech and AI Consultant. Analyze the following Law Firm AI Maturity Assessment data.
    Produce a high-impact, professional executive summary in Markdown format.
    
    Assessment Data Summary:
    - Total Respondents: ${reportData.totalSubmissions}
    - Average Score: ${reportData.averageScore}
    - Detailed Question Breakdown: ${JSON.stringify(reportData.breakdown)}

    The report must include:
    1. **Executive Status**: A summary of the firm's current AI maturity posture.
    2. **Critical Gaps**: Identify 2-3 significant weaknesses or opportunities for improvement.
    3. **Strategic Roadmap**: 3-4 prioritized actionable steps for leadership.
    4. **Assigned Maturity Tier**: Define where the firm sits (e.g., Laggard, Explorer, Advancing, or Leader).

    Keep the tone authoritative, concise, and professional.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and strategic analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    // Access the .text property directly (it is not a method)
    return response.text || "Analysis generated successfully, but no content was returned.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "The AI consultant is currently unavailable. Please verify your configuration and try again.";
  }
};
