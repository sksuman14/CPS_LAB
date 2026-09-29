import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI API key not configured. Please add the API Key to your .env.local file.' },
        { status: 500 }
      );
    }

    const { code, language, responseLang } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided to explain.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const isHindi = responseLang === 'hi';

    const prompt = isHindi
      ? `आप एक मित्रवत, प्रोत्साहित करने वाले AI प्रोग्रामिंग शिक्षक हैं जो 10-15 साल के छात्रों को पढ़ाते हैं।
छात्र ने visual programming blocks का उपयोग करके निम्नलिखित ${language} कोड बनाया है।

कोड:
${code}

कार्य:
1. सरल हिंदी में बताएं कि यह कोड क्या करता है।
2. इसे आसान चरणों में समझाएं।
3. बहुत उत्साहजनक रहें।
4. यदि loops (for/while) या conditionals (if/else) जैसी अवधारणाएं हैं, तो उन्हें सरलता से समझाएं।
5. कठिन तकनीकी शब्दों का उपयोग न करें।

महत्वपूर्ण नियम: किसी भी Markdown फ़ॉर्मेटिंग जैसे एस्टरिस्क (*), हैशटैग (#) का उपयोग न करें। केवल सादे पाठ (plain text) का उपयोग करें और किसी भी इमोजी का उपयोग न करें।`
      : `You are a friendly, encouraging AI programming tutor for students (ages 10-15).
The student has just built the following ${language} code using visual programming blocks.

Code to explain:
${code}

Task:
1. Explain what this code does in simple, plain English.
2. Break it down into easy-to-understand steps.
3. Be highly encouraging.
4. If there are concepts like loops (for/while) or conditionals (if/else), briefly explain them intuitively.
5. Do NOT use overly complex technical jargon.

CRITICAL RULE: Do NOT use any Markdown formatting like asterisks (*), hashtags (#), or bullet points. Use plain text only, and do NOT use any emojis.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ explanation: text });
  } catch (error: any) {
    console.error('Error generating AI explanation:', error);
    return NextResponse.json(
      { error: `Failed: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
