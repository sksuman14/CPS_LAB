import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return NextResponse.json({ error: 'AI API key not configured.' }, { status: 500 });
    }

    const { history, message, lang } = await request.json();

    const systemInstruction = lang === 'hi'
      ? "आप एक मित्रवत, प्रोत्साहित करने वाले AI शिक्षक हैं जो 10-15 साल के छात्रों को IoT, Robotics, Arduino और Block Coding सिखाते हैं। सरल उपमाओं का उपयोग करें। महत्वपूर्ण नियम: किसी भी Markdown फ़ॉर्मेटिंग (*, #, आदि) और इमोजी का उपयोग न करें। केवल सादे पाठ (plain text) में उत्तर दें। हमेशा हिंदी में उत्तर दें।"
      : "You are a friendly, encouraging AI tutor helping students (ages 10-15) learn about IoT, Robotics, Arduino, and Block Coding. use simple analogies. CRITICAL RULE: Do NOT use any Markdown formatting (*, #, etc.) and do NOT use emojis. Respond in plain text only.";
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      systemInstruction
    });

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const result = await model.generateContent({ contents: formattedHistory });
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: `Failed: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
