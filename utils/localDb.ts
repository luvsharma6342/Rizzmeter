import fs from "fs";
import path from "path";
import { ReportData, generateMockReport } from "./mockData";

const DB_FILE = path.join(process.cwd(), "utils", "local_db.json");

interface LocalDbSchema {
  reports: Record<string, ReportData>;
  leaderboard: Array<{
    id: string;
    username: string;
    profileType: string;
    score: number;
    avatarUrl: string;
    roastTeaser: string;
  }>;
}

const DEFAULT_LEADERBOARD = [
  { id: "leader_1", username: "Aesthetic_Sam", profileType: "instagram", score: 94, avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", roastTeaser: "Lightroom wizard. Zero photos of them smiling." },
  { id: "leader_2", username: "Code_Wizard", profileType: "linkedin", score: 91, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", roastTeaser: "Agile enthusiast who forgot what sunlight looks like." },
  { id: "leader_3", username: "Dog_Dad_Dave", profileType: "dating", score: 88, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", roastTeaser: "Cute golden retriever does 99% of the heavy lifting." },
  { id: "leader_4", username: "No_More_WhatsApp", profileType: "whatsapp", score: 85, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", roastTeaser: "DP is a black screen. In their feelings." }
];

function getDb(): LocalDbSchema {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: LocalDbSchema = {
        reports: {},
        leaderboard: DEFAULT_LEADERBOARD
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Local DB read error, returning defaults:", error);
    return { reports: {}, leaderboard: DEFAULT_LEADERBOARD };
  }
}

function saveDb(db: LocalDbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Local DB save error:", error);
  }
}

export function saveReportLocal(report: ReportData): void {
  const db = getDb();
  db.reports[report.id] = report;
  saveDb(db);
}

export function getReportLocal(id: string): ReportData | null {
  const db = getDb();
  return db.reports[id] || null;
}

export function getLeaderboardLocal() {
  const db = getDb();
  return db.leaderboard;
}

export function unlockReportLocal(id: string): ReportData | null {
  const db = getDb();
  if (db.reports[id]) {
    db.reports[id].isUnlocked = true;
    saveDb(db);
    return db.reports[id];
  }
  return null;
}
