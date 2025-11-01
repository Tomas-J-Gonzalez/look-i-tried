import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Generate shirt
    const shirtPrompt = `Professional product photography of a ${prompt} shirt on a mannequin. 
    Transparent background, clean cutout, front view, well-lit, high quality, 
    e-commerce style. Only the shirt visible, centered, facing forward.`;

    const shirtResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: shirtPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    // Generate pants
    const pantsPrompt = `Professional product photography of ${prompt} pants/trousers on a mannequin. 
    Transparent background, clean cutout, front view, well-lit, high quality, 
    e-commerce style. Only the pants visible, centered, facing forward.`;

    const pantsResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: pantsPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const shirtUrl = shirtResponse.data[0]?.url;
    const pantsUrl = pantsResponse.data[0]?.url;

    if (!shirtUrl || !pantsUrl) {
      return NextResponse.json(
        { error: "Failed to generate outfit items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      shirtUrl,
      pantsUrl,
      prompt 
    });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: "OpenAI API error", 
          message: error.response.data?.error?.message || "Unknown error" 
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate outfit", message: error.message },
      { status: 500 }
    );
  }
}
