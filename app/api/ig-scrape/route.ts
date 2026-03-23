import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const IG_DIR = join(process.cwd(), ".data", "ig-references");

// GET /api/ig-scrape — lista los perfiles scrapeados
export async function GET() {
  try {
    const files = await readdir(IG_DIR).catch(() => []);
    const profiles = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const data = JSON.parse(await readFile(join(IG_DIR, file), "utf8"));
      profiles.push({
        username: data.username,
        captions_count: data.captions_with_text,
        scraped_at: data.scraped_at,
        top_caption: data.captions[0]?.caption?.slice(0, 100) || "",
      });
    }
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/ig-scrape — scrapea un perfil nuevo
export async function POST(req: NextRequest) {
  try {
    const { username, limit = 30 } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Falta username" }, { status: 400 });
    }

    const token = process.env.APIFY_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Falta APIFY_TOKEN en .env.local" }, { status: 500 });
    }

    const clean = username.replace(/^@/, "");
    const BASE = "https://api.apify.com/v2";

    // Start actor
    const startRes = await fetch(`${BASE}/acts/apify~instagram-post-scraper/runs?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: [clean], resultsLimit: limit }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return NextResponse.json({ error: `Apify error: ${err}` }, { status: 500 });
    }

    const runData = await startRes.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    // Poll
    let status = "RUNNING";
    let attempts = 0;
    while ((status === "RUNNING" || status === "READY") && attempts < 60) {
      await new Promise((r) => setTimeout(r, 3000));
      const sr = await fetch(`${BASE}/actor-runs/${runId}?token=${token}`);
      const sd = await sr.json();
      status = sd.data.status;
      attempts++;
    }

    if (status !== "SUCCEEDED") {
      return NextResponse.json({ error: `Apify run ${status}` }, { status: 500 });
    }

    // Get items
    const itemsRes = await fetch(`${BASE}/datasets/${datasetId}/items?token=${token}&format=json`);
    const items = await itemsRes.json();

    const captions = items
      .filter((item: Record<string, unknown>) => item.caption || item.text)
      .map((item: Record<string, unknown>) => ({
        caption: (item.caption || item.text || "") as string,
        likes: (item.likesCount || item.likes || 0) as number,
        comments: (item.commentsCount || item.comments || 0) as number,
        timestamp: (item.timestamp || item.takenAt || item.date || "") as string,
        type: (item.type || "post") as string,
        url: (item.url || (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : "")) as string,
      }))
      .filter((c: { caption: string }) => c.caption.length > 20)
      .sort((a: { likes: number; comments: number }, b: { likes: number; comments: number }) =>
        (b.likes + b.comments) - (a.likes + a.comments)
      );

    const output = {
      username: clean,
      scraped_at: new Date().toISOString(),
      total_posts: items.length,
      captions_with_text: captions.length,
      captions,
    };

    const { writeFile, mkdir } = await import("fs/promises");
    await mkdir(IG_DIR, { recursive: true });
    await writeFile(join(IG_DIR, `${clean}.json`), JSON.stringify(output, null, 2));

    return NextResponse.json({
      username: clean,
      captions_count: captions.length,
      top_3: captions.slice(0, 3).map((c: { caption: string }) => c.caption.slice(0, 150)),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
