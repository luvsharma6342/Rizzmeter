import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv"

dotenv.config();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profileType = formData.get("profileType") as string || "instagram";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if AWS S3 is configured
    const hasS3 =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_BUCKET_NAME;

    if (hasS3) {
      // Production Mode: Upload to AWS S3
      // We import S3Client dynamically so it doesn't fail if @aws-sdk/client-s3 is not installed in mock mode
      try {
        // @ts-ignore
        const awsSdk: any = await import("@aws-sdk/client-s3");

        const s3 = new awsSdk.S3Client({
          region: process.env.AWS_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split(".").pop() || "png";
        const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

        await s3.send(
          new awsSdk.PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        // Public URL: Use CloudFront CDN if provided, otherwise default to standard S3 bucket URL
        const publicUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL
          ? `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`
          : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return NextResponse.json({ url: publicUrl, key });
      } catch (err: any) {
        console.error("AWS S3 Upload error, falling back to Mock Upload:", err.message);
      }
    }

    // Mock Mode / Fallback: Read file as data URL (base64)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    // Return mock success response
    return NextResponse.json({
      url: dataUrl,
      key: `mock-${Date.now()}.png`,
      mock: true
    });

  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
