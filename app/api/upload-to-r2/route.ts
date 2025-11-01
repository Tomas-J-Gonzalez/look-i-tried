import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * API Route: Upload image to Cloudflare R2
 * 
 * POST /api/upload-to-r2
 * Body: { imageData: string } // base64 data URL
 * Returns: { url: string } // Public URL of uploaded image
 */

export async function POST(request: Request) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Cloudflare R2 configuration
    const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "outfit-images";
    const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.warn("R2 credentials not configured - upload unavailable");
      return NextResponse.json(
        { 
          error: "R2 not configured",
          message: "Cloudflare R2 credentials not set. Add them to .env.local to enable cloud uploads. See R2_SETUP.md for instructions."
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Initialize S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const key = `outfits/${timestamp}-${randomId}.png`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000", // Cache for 1 year
    });

    await s3Client.send(command);

    // Construct public URL
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;

    console.log('✅ Upload successful:', publicUrl);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error("❌ R2 upload error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error",
        hint: "Check that your R2 bucket exists and credentials are correct"
      },
      { status: 500 }
    );
  }
}
