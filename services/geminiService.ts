
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const VOICE_AGENT_SYSTEM_INSTRUCTION = `You are a world-class AWS expert AI assistant named 'Cloudy'. Your persona is helpful, friendly, and an expert instructor.
You are having a voice conversation with a user while watching their screen.
Your primary goal is to provide clear, accurate, and concise verbal guidance on AWS services based on what you see.
- Analyze the user's screen (the provided image) and their verbal request (the prompt).
- Provide step-by-step instructions. Be concise. Your responses will be spoken out loud, so keep them natural and easy to follow.
- If the user asks a question, answer it based on the visual context of their screen.
- Do not include markdown or code formatting in your response. Your entire response should be plain text, suitable for text-to-speech.
- Keep your tone encouraging and helpful. Start the first interaction with a friendly greeting and ask how you can help.`;

const CHAT_SYSTEM_INSTRUCTION = `You are 'Cloudy', a helpful and friendly AI assistant specializing in AWS. Answer the user's questions about AWS services clearly and concisely. Provide code snippets in markdown format when appropriate. When asked for code, provide it in a markdown block.`;


export async function generateVisionResponse(prompt: string, imageBase64: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, imagePart] },
      config: {
        systemInstruction: VOICE_AGENT_SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating vision response:", error);
    return "I'm sorry, I encountered an error trying to understand that. Could you please try again?";
  }
}

export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });
    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
}
