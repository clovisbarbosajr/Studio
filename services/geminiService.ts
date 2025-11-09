
import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error or disable the feature.
  // For this environment, we assume the key is present.
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

export const generateImageWithGemini = async (prompt: string, images: { data: string; mimeType: string }[] = []): Promise<string> => {
  const imageParts: Part[] = images.map(image => ({
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  }));

  const textPart: Part = { text: prompt };
  const parts: Part[] = [...imageParts, textPart];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("Nenhuma imagem foi gerada pela API.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Ocorreu um erro ao comunicar com a API. Verifique o console para mais detalhes.");
  }
};
