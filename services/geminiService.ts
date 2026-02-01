import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PropertyDetails, RenovationPlan, ImageAsset } from "../types";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the renovation strategy." },
    buildingStyle: { type: Type.STRING, description: "Detected architectural style (e.g., Altbau, Plattenbau)." },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          durationWeeks: { type: Type.NUMBER },
          costEstimate: { type: Type.NUMBER },
          description: { type: Type.STRING },
        },
        required: ["name", "durationWeeks", "costEstimate", "description"]
      }
    },
    roiProjection: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          value: { type: Type.NUMBER, description: "ROI Percentage" },
        },
        required: ["year", "value"]
      }
    },
    co2Savings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Area of saving (e.g., Heating, Insulation)" },
          savingTons: { type: Type.NUMBER },
          description: { type: Type.STRING, description: "Brief explanation of how this saving is achieved." },
        },
        required: ["category", "savingTons", "description"]
      }
    },
    funding: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "amount", "description"]
      }
    },
    totalCost: { type: Type.NUMBER },
    totalDuration: { type: Type.NUMBER, description: "Total duration in weeks" }
  },
  required: ["summary", "phases", "roiProjection", "co2Savings", "funding", "totalCost", "totalDuration", "buildingStyle"]
};

export const analyzeRenovation = async (
  details: PropertyDetails,
  images: ImageAsset[]
): Promise<RenovationPlan> => {
  
  // Initialize Gemini Client inside the function to ensure process.env is ready and avoid top-level init issues
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  // Prepare Image Parts
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: img.type,
      data: img.base64
    }
  }));

  const prompt = `
    Act as an expert renovation consultant for multifamily properties in Berlin, Germany.
    Analyze the provided images of the property and the following details:
    Address: ${details.address}
    Size: ${details.sqm} sqm
    Budget: €${details.budget}
    Current Efficiency Class: ${details.currentEfficiency}

    Generate a comprehensive renovation plan that focuses on energy efficiency, ROI, and modernization.
    Include specific German funding programs (KfW, BAFA) where applicable.
    Provide realistic timelines and cost estimates for Berlin market rates.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Keep it grounded and analytical
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RenovationPlan;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const generateRenovationImage = async (
  prompt: string,
  style: string,
  size: '1K' | '2K' | '4K'
): Promise<string> => {
  // Always create a new instance to pick up the latest API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fullPrompt = `Photorealistic architectural visualization of a building renovation phase in Berlin. 
  Style: ${style}. 
  Phase detail: ${prompt}. 
  Professional architectural photography, high detail, daylight, 8k resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: fullPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Generation Failed:", error);
    throw error;
  }
};

export const generateBlueprintImage = async (
  phaseName: string,
  description: string,
  style: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fullPrompt = `Technical architectural blueprint drawing of a building renovation phase.
  Phase: ${phaseName}.
  Description: ${description}.
  Building Style: ${style}.
  Visual Style: Classic blueprint, white technical lines on blue background, schematic, precise, high contrast, top-down or isometric view.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: fullPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No blueprint generated");
  } catch (error) {
    console.error("Blueprint Generation Failed:", error);
    throw error;
  }
};