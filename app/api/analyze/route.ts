import { NextRequest, NextResponse } from "next/server";
import { generateMockReport } from "../../../utils/mockData";
import { saveReportLocal } from "../../../utils/localDb";

export async function POST(req: NextRequest) {
  try {
    const { url, profileType } = await resJson(req);

    if (!url) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    const reportId = `rep_${Math.random().toString(36).substring(2, 11)}`;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Production Mode: Call Gemini 2.5 Flash Vision & Text API
      try {
        // Parse base64 or fetch remote image
        let base64Data = "";
        let mimeType = "image/png";

        if (url.startsWith("data:")) {
          const match = url.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64Data = match[2];
          }
        } else {
          const imgRes = await fetch(url);
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString("base64");
            mimeType = imgRes.headers.get("content-type") || "image/png";
          }
        }

        if (!base64Data) {
          throw new Error("Could not parse image data");
        }

        const payload = {
          contents: [
            {
              parts: [
                {
                  text: `You are a brutal, hilarious, but good-natured profile reviewer for Gen-Z users.
Your task is to analyze the uploaded ${profileType} profile screenshot.
Examine the profile image(s), bio text, grid consistency, aesthetics, and overall vibe.
You MUST output a valid JSON object matching this schema exactly. Do not wrap it in markdown codeblocks - return pure JSON:
{
  "overallScore": number (1-100),
  "firstImpression": string[] (3 brief impressions),
  "attractiveness": number (1-100),
  "trustworthiness": number (1-100),
  "bioQuality": number (1-100),
  "visualConsistency": number (1-100),
  "roast": string (brutally honest, funny, roast paragraph, Gen-Z slang, not offensive),
  "originalBio": string (extracted original bio from screenshot),
  "bioRewrite": string (funny bio rewrite using emojis and clear bullet points),
  "redFlags": string[] (3 red flags),
  "greenFlags": string[] (3 green flags),
  "photoRanking": [
    { "index": number, "score": number, "review": string, "action": string }
  ] (evaluate up to 3 visible photos/panels),
  "glowUpPlan": string[] (3 actionable glow-up instructions)
}`
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API returned error: ${errText}`);
        }

        const data = await response.json();
        const contentStr = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(contentStr);

        const report = {
          id: reportId,
          profileType: profileType || "instagram",
          screenshotUrl: url,
          isUnlocked: true,
          ...result
        };

        // Cache/persist report locally
        saveReportLocal(report);

        // Persist in Neon database via Prisma if configured
        const hasDb = process.env.DATABASE_URL;
        if (hasDb) {
          try {
            const { prisma } = await import("../../../lib/prisma");
            await prisma.report.create({
              data: {
                id: report.id,
                profileType: report.profileType,
                screenshotUrl: report.screenshotUrl,
                overallScore: report.overallScore,
                attractiveness: report.attractiveness,
                trustworthiness: report.trustworthiness,
                bioQuality: report.bioQuality,
                visualConsistency: report.visualConsistency,
                firstImpression: report.firstImpression,
                roast: report.roast,
                originalBio: report.originalBio,
                bioRewrite: report.bioRewrite,
                redFlags: report.redFlags,
                greenFlags: report.greenFlags,
                photoRanking: report.photoRanking, // Prisma supports direct JSON parsing on PostgreSQL
                glowUpPlan: report.glowUpPlan,
                isUnlocked: true
              }
            });
            console.log(`Report ${report.id} saved in Neon database via Prisma.`);
          } catch (dbErr: any) {
            console.error("Prisma database save failed, using local fallback:", dbErr.message);
          }
        }

        return NextResponse.json(report);
      } catch (err: any) {
        console.error("Gemini vision analysis failed, falling back to mock:", err.message);
      }
    }

    // Mock Mode Fallback:
    // Add a simulated AI processing lag (2.0 seconds) to give premium UX vibe
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockReport = generateMockReport(profileType || "instagram", reportId);
    mockReport.screenshotUrl = url; // preserve original image

    // Save report in local JSON DB so the client can retrieve it by ID later
    saveReportLocal(mockReport);

    return NextResponse.json(mockReport);

  } catch (error: any) {
    console.error("Analysis handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze profile" }, { status: 500 });
  }
}

// Utility to parse request json body safely
async function resJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
