import { NextRequest, NextResponse } from "next/server";
import { getReportLocal, unlockReportLocal } from "../../../../utils/localDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try to fetch from Neon database via Prisma if configured
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("../../../../lib/prisma");
        const report = await prisma.report.findUnique({
          where: { id }
        });
        if (report) {
          // Parse JSON properties if they returned as strings or cast them
          const formattedReport = {
            ...report,
            // Prisma will return Json type directly, but if not, parse it
            photoRanking: typeof report.photoRanking === "string" 
              ? JSON.parse(report.photoRanking) 
              : report.photoRanking
          };
          return NextResponse.json(formattedReport);
        }
      } catch (dbErr: any) {
        console.error("Prisma report fetch failed, trying local fallback:", dbErr.message);
      }
    }

    // 2. Local fallback
    const report = getReportLocal(id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

// POST endpoint to simulate payment unlock
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await resJson(req);

    if (body.action === "unlock") {
      let reportData: any = null;

      // 1. Try to unlock in Neon database via Prisma if configured
      if (process.env.DATABASE_URL) {
        try {
          const { prisma } = await import("../../../../lib/prisma");
          const updated = await prisma.report.update({
            where: { id },
            data: { isUnlocked: true }
          });
          if (updated) {
            reportData = {
              ...updated,
              photoRanking: typeof updated.photoRanking === "string"
                ? JSON.parse(updated.photoRanking)
                : updated.photoRanking
            };
          }
        } catch (dbErr: any) {
          console.error("Prisma report unlock failed, using local database:", dbErr.message);
        }
      }

      // 2. Unlock in local JSON DB to ensure consistency
      const unlockedLocal = unlockReportLocal(id);
      
      if (!reportData) {
        reportData = unlockedLocal;
      }

      if (!reportData) {
        return NextResponse.json({ error: "Report not found to unlock" }, { status: 404 });
      }

      return NextResponse.json({ success: true, report: reportData });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Unlock report error:", error);
    return NextResponse.json({ error: "Failed to unlock report" }, { status: 500 });
  }
}

async function resJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
