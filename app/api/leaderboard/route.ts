import { NextRequest, NextResponse } from "next/server";
import { Report } from "@prisma/client"
import { getLeaderboardLocal } from "../../../utils/localDb";

export async function GET(req: NextRequest) {
  try {
    // 1. Try to fetch top scoring reports from Neon via Prisma
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("../../../lib/prisma");
        const topReports: Report[] = await prisma.report.findMany({
          orderBy: { overallScore: "desc" },
          take: 10
        });

        if (topReports.length > 0) {
          const mappedLeaderboard = topReports.map((report: Report, index: number) => {
            // Generate deterministic mock usernames and avatars based on report ID
            const charCodeSum = report.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const adjs = ["Sleek", "Chill", "Hyper", "Vibrant", "Cool", "Alpha", "Aesthetic", "Dapper"];
            const nouns = ["Coder", "Influencer", "Hustler", "Explorer", "Nomad", "Designer", "Creator"];
            const username = `${adjs[charCodeSum % adjs.length]}_${nouns[(charCodeSum + index) % nouns.length]}`;

            const genders = ["men", "women"];
            const avatarId = charCodeSum % 99;
            const avatarUrl = `https://randomuser.me/api/portraits/${genders[charCodeSum % 2]}/${avatarId}.jpg`;

            return {
              id: report.id,
              username,
              profileType: report.profileType,
              score: report.overallScore,
              avatarUrl,
              roastTeaser: report.roast.length > 60 ? report.roast.substring(0, 57) + "..." : report.roast
            };
          });

          return NextResponse.json(mappedLeaderboard);
        }
      } catch (dbErr: any) {
        console.error("Prisma leaderboard fetch failed, falling back to local data:", dbErr.message);
      }
    }

    // 2. Fallback to local DB records
    const data = getLeaderboardLocal();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
