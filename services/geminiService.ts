
import { GoogleGenAI, Type } from "@google/genai";
import { TitleSuggestion, VideoDetails, ImageModelId, AspectRatio, Language, VideoScript } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) throw new Error("API Key is missing.");
  return new GoogleGenAI({ apiKey });
};

export const analyzeReferenceImage = async (base64Image: string, language: Language = 'Auto'): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze this image in detail. 
    Describe the visual style, lighting, composition, main subject, colors, and mood.
    Create a text prompt that I can use to generate a similar style image.
    Output ONLY the prompt string.
    Language of output: ${language === 'Auto' ? 'English (recommended for image gen)' : language}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  return response.text?.trim() || "Could not analyze image.";
};

export const generateVideoTitles = async (videoInput: string, language: Language = 'Auto'): Promise<TitleSuggestion[]> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const langInstruction = language === 'Auto' 
    ? "Detect the language of the video topic/idea. Output the titles in that same language." 
    : `Output the titles in ${language}.`;

  const prompt = `
    You are a world-class YouTube SEO Expert and Copywriter.
    I have a video topic/idea: "${videoInput}".
    
    Task:
    Generate 5 catchy, high-CTR (Click Through Rate) titles.
    ${langInstruction}
    Each title should have a "hook" (curiosity, urgency, benefit, shock, etc.) and be optimized for search intent.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                hookType: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Predicted score out of 100" }
              }
            }
          }
        },
        required: ["titles"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No data received from Gemini.");
  }

  const data = JSON.parse(response.text) as { titles: TitleSuggestion[] };
  return data.titles;
};

export const generateVideoDetails = async (selectedTitle: string, language: Language = 'Auto'): Promise<VideoDetails> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const langInstruction = language === 'Auto' 
    ? "Detect the language of the title and output the content in that same language." 
    : `Output the content (tips, description, hashtags, etc) in ${language}.`;
  
  const prompt = `
    You are a YouTube Growth Hacker.
    The user has selected the following title for their video: "${selectedTitle}".
    
    Task:
    1. Generate a list of 10 relevant, trending hashtags (#).
    2. Generate a list of 15 strong SEO keywords/tags strictly related to this title.
    3. Provide 3 specific, actionable tips to rank this video #1 for this specific title.
    4. Write a detailed visual prompt in English for a YouTube thumbnail. (Keep visual prompt in English for better image generation).
    5. Write a professional, SEO-optimized YouTube Video Description (Standard 2025).
       - It MUST include relevant Emojis/Icons (🚀, 🎬, ✅, 👇, etc.) to be engaging.
    
    Important: ${langInstruction}
    (Note: Keep the Visual Prompt in English regardless of the target language).

    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          seoTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualPrompt: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["hashtags", "keywords", "seoTips", "visualPrompt", "description"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No data received from Gemini.");
  }

  return JSON.parse(response.text) as VideoDetails;
};

export const generateVideoScript = async (title: string, language: Language = 'Auto'): Promise<VideoScript> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const langInstruction = language === 'Auto' 
    ? "Detect the language of the title and output the script in that same language." 
    : `Output the script in ${language}.`;

  const prompt = `
    Create a structured YouTube video script for the title: "${title}".
    ${langInstruction}
    
    Structure:
    1. Hook/Intro (First 30 seconds to grab attention).
    2. Main Content (Key points formatted as an array of strings).
    3. Call to Action (Outro).
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.STRING },
          mainContent: { type: Type.ARRAY, items: { type: Type.STRING } },
          callToAction: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) throw new Error("No script generated.");
  return JSON.parse(response.text) as VideoScript;
};

export const generateThumbnailImage = async (
  title: string, 
  visualPrompt: string, 
  modelId: ImageModelId = "gemini-2.5-flash-image",
  aspectRatio: AspectRatio = "16:9"
): Promise<string> => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const finalPrompt = `
    Create a high-converting YouTube thumbnail.
    Aspect Ratio: ${aspectRatio}.
    Style: Vibrant, High Contrast, 4K resolution, Digital Art or Photorealistic.
    
    Visual Description: ${visualPrompt}
    
    CRITICAL INSTRUCTION - TEXT RENDERING:
    You MUST include the text "${title}" prominently in the image.
    - The text should be in a bold, sans-serif font.
    - Use high contrast colors (e.g., Yellow text on Dark background, or White with Black outline).
    - Make the text the focal point of the composition alongside the main subject.
  `;

  // Imagen Models
  if (modelId.startsWith('imagen')) {
    const response = await ai.models.generateImages({
      model: modelId,
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });
    
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return imageBytes;
    }
    throw new Error("No image data received from Imagen.");
  } 
  
  // Gemini Models
  else {
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    };
    
    if (modelId === 'gemini-3-pro-image-preview') {
      config.imageConfig.imageSize = '1K';
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: finalPrompt }]
      },
      config: config
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data; 
        }
      }
    }
    throw new Error("No image data received from Gemini.");
  }
};
