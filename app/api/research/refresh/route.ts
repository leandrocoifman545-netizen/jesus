import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { isResearchStale } from "@/lib/ai/angle-discovery";

const execAsync = promisify(exec);

/**
 * POST /api/research/refresh
 * Runs the research-angles.mjs script to refresh Google Suggest data.
 * Takes ~5-10 minutes. Returns immediately with status.
 *
 * Query params:
 *   ?force=true  — skip staleness check and always refresh
 *   ?keywords=keyword1,keyword2  — custom keywords to research
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";
  const keywords = url.searchParams.get("keywords");

  // Check if refresh is actually needed
  if (!force) {
    const { stale, daysOld } = await isResearchStale();
    if (!stale) {
      return NextResponse.json({
        status: "skipped",
        message: `Research tiene ${daysOld} día(s). No necesita refresh (threshold: 3 días). Usá ?force=true para forzar.`,
      });
    }
  }

  try {
    const scriptPath = "scripts/research-angles.mjs";
    const cmd = keywords
      ? `node ${scriptPath} "${keywords}"`
      : `node ${scriptPath}`;

    // Run in background — don't wait for completion
    const child = exec(cmd, { cwd: process.cwd(), timeout: 600_000 });
    const pid = child.pid;

    // Detach so the process continues even if the request closes
    child.unref();

    return NextResponse.json({
      status: "started",
      pid,
      message: "Research started in background. Takes ~5-10 minutes. Check GET /api/research for freshness.",
      command: cmd,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start research" },
      { status: 500 },
    );
  }
}
