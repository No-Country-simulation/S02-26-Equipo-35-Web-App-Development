import { GoogleGenAI } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSmartCaptions = async (videoTitle, language = 'en') => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided. Returning mock data.");
    return getMockCaptions(language);
  }

  try {
    const model = "gemini-3-flash-preview";
    const langName = language === 'es' ? 'Spanish' : 'English';
    const prompt = `Generate a JSON array of 5 subtitles/captions that might appear in a short viral video about "${videoTitle}". 
    The video is energetic. Provide timestamps in "MM:SS" format.
    The output must strictly be a JSON array of objects with keys: "id" (string), "start" (string), "end" (string), "text" (string).
    IMPORTANT: The "text" field must be in ${langName}.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              start: { type: "STRING" },
              end: { type: "STRING" },
              text: { type: "STRING" },
            },
            propertyOrdering: ["id", "start", "end", "text"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return getMockCaptions(language);

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockCaptions(language);
  }
};

const getMockCaptions = (language) => {
  if (language === 'es') {
    return [
      { id: '1', start: '00:00', end: '00:02', text: '¡Espera, tienes que ver esto!' },
      { id: '2', start: '00:02', end: '00:05', text: 'Esta IA cambia el juego por completo.' },
      { id: '3', start: '00:05', end: '00:08', text: 'Solo arrastra, suelta y boom: video vertical.' },
      { id: '4', start: '00:08', end: '00:12', text: 'Rastrea automáticamente al sujeto por ti.' },
      { id: '5', start: '00:12', end: '00:15', text: '¡Link en la bio para probarlo!' },
    ];
  }

  return [
    { id: '1', start: '00:00', end: '00:02', text: 'Wait, you need to see this!' },
    { id: '2', start: '00:02', end: '00:05', text: 'This AI tool completely changes the game.' },
    { id: '3', start: '00:05', end: '00:08', text: 'Just drag, drop, and boom—vertical video.' },
    { id: '4', start: '00:08', end: '00:12', text: 'It automatically tracks the subject for you.' },
    { id: '5', start: '00:12', end: '00:15', text: 'Link in bio to try it out!' },
  ];
};