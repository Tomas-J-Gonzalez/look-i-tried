import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image as a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ 
      dataUrl,
      success: true 
    });

  } catch (error: any) {
    console.error("Image Proxy Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to proxy image", 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

