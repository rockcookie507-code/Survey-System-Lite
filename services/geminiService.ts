
import { GoogleGenAI } from "@google/genai";
import { Submission, Question } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeQuizResults = async (submissions: Submission[], questions: Question[]) => {
  if (submissions.length === 0) return "No data available for analysis yet.";

  const avgScore = submissions.reduce((acc, s) => acc + s.totalScore, 0) / submissions.length;
  
  const prompt = `
    As a professional legal technology consultant, analyze the following quiz results for a law firm IT maturity assessment.
    
    Context:
    - Assessment Name: ${questions[0]?.quizId || 'General IT Assessment'}
    - Number of Respondents: ${submissions.length}
    - Average Score: ${avgScore.toFixed(2)}
    
    Data Summary:
    ${questions.map(q => {
      const counts: Record<string, number> = {};
      submissions.forEach(s => {
        const ans = s.answers.find(a => a.questionId === q.id);
        ans?.optionIds.forEach(oid => {
          const opt = q.options.find(o => o.id === oid);
          if (opt) counts[opt.text] = (counts[opt.text] || 0) + 1;
        });
      });
      return `- Question: "${q.text}"\n  Responses: ${JSON.stringify(counts)}`;
    }).join('\n')}

    Please provide:
    1. A summary of the current maturity level.
    2. Key strengths identified.
    3. Critical gaps or risks.
    4. Three actionable recommendations for the firm's leadership.

    Keep the tone professional, authoritative, and concise.
  `;

  try {
    // Use gemini-3-pro-preview for complex reasoning tasks like professional consulting analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Property .text is correctly accessed as a getter (not a method)
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analysis currently unavailable. Please check back later.";
  }
};
