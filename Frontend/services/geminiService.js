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
    const prompt = `Generate a JSON array of 5 subtitles/shorts that might appear in a short viral video about "${videoTitle}". 
    The video is energetic. Provide timestamps in "MM:SS" format.
    The output must strictly be a JSON array of objects with keys: "shorts_id" (string), "start_second" (string), "end_second" (string), "text" (string).
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
              shorts_id: { type: "STRING" },
              start_second: { type: "STRING" },
              end_second: { type: "STRING" },
              text: { type: "STRING" },
            },
            propertyOrdering: ["shorts_id", "start_second", "end_second", "text"]
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
      { shorts_id: '1', start_second: '00:00', end_second: '00:02', text: '¡Espera, tienes que ver esto!', status: 'ready' },
      { shorts_id: '2', start_second: '00:02', end_second: '00:05', text: 'Esta IA cambia el juego por completo.', status: 'ready' },
      { shorts_id: '3', start_second: '00:05', end_second: '00:08', text: 'Solo arrastra, suelta y boom: video vertical.', status: 'ready' },
      { shorts_id: '4', start_second: '00:08', end_second: '00:12', text: 'Rastrea automáticamente al sujeto por ti.', status: 'ready' },
      { shorts_id: '5', start_second: '00:12', end_second: '00:15', text: '¡Link en la bio para probarlo!', status: 'ready' },
    ];
  }

  return [
    { shorts_id: '1', start_second: '00:00', end_second: '00:02', text: 'Wait, you need to see this!', status: 'ready' },
    { shorts_id: '2', start_second: '00:02', end_second: '00:05', text: 'This AI tool completely changes the game.', status: 'ready' },
    { shorts_id: '3', start_second: '00:05', end_second: '00:08', text: 'Just drag, drop, and boom—vertical video.', status: 'ready' },
    { shorts_id: '4', start_second: '00:08', end_second: '00:12', text: 'It automatically tracks the subject for you.', status: 'ready' },
    { shorts_id: '5', start_second: '00:12', end_second: '00:15', text: 'Link in bio to try it out!', status: 'ready' },
  ];
};
