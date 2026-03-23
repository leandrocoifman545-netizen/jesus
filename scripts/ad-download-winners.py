#!/usr/bin/env python3
"""
Ad Factory — Descargar winners de Facebook Ad Library.

Usa la Ad Library API (requiere access token con ads_read permission).

Uso:
  python3 download_winners.py --query "productos digitales" --country AR --output research/winners --creds credentials/meta_ads.json
  python3 download_winners.py --query "digital products AI" --country US --output research/winners --creds credentials/meta_ads.json

Alternativa sin API (browser automation):
  Se puede usar el browser tool para navegar facebook.com/ads/library y descargar manualmente.
"""
import argparse, requests, json, os, time, re, sys
from urllib.parse import urlencode

API = "https://graph.facebook.com/v21.0"

def search_ads(query, country, token, limit=50):
    """Search Ad Library API."""
    params = {
        "search_terms": query,
        "ad_reached_countries": f'["{country}"]',
        "ad_type": "ALL",
        "ad_active_status": "ACTIVE",
        "fields": "id,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_descriptions,ad_creative_link_captions,ad_delivery_start_time,ad_snapshot_url,page_id,page_name",
        "limit": limit,
        "access_token": token
    }
    
    r = requests.get(f"{API}/ads_archive", params=params, timeout=30)
    if r.status_code == 200:
        return r.json().get("data", [])
    else:
        print(f"Error {r.status_code}: {r.text[:300]}")
        return []

def download_snapshot(ad_id, snapshot_url, output_dir, token):
    """Download ad snapshot (image/video)."""
    try:
        r = requests.get(snapshot_url, params={"access_token": token}, timeout=30)
        if r.status_code == 200:
            # Parse HTML to find media URL (simplified)
            # In practice, may need browser automation for full media download
            html = r.text
            # Save HTML snapshot
            path = os.path.join(output_dir, f"ad_{ad_id}_snapshot.html")
            with open(path, "w") as f:
                f.write(html)
            return path
    except Exception as e:
        print(f"  Error downloading {ad_id}: {e}")
    return None

def analyze_ad(ad):
    """Extract analysis from ad data."""
    bodies = ad.get("ad_creative_bodies", [])
    titles = ad.get("ad_creative_link_titles", [])
    descriptions = ad.get("ad_creative_link_descriptions", [])
    
    body = bodies[0] if bodies else ""
    title = titles[0] if titles else ""
    desc = descriptions[0] if descriptions else ""
    
    return {
        "id": ad.get("id", ""),
        "page_name": ad.get("page_name", ""),
        "start_date": ad.get("ad_delivery_start_time", ""),
        "headline": title,
        "description": desc,
        "body": body,
        "body_length": len(body.split()),
        "snapshot_url": ad.get("ad_snapshot_url", ""),
        "has_question_hook": body.startswith("¿") or body.startswith("?"),
        "has_story_hook": any(w in body[:100].lower() for w in ["hace", "recuerdo", "cuando", "ayer", "anoche"]),
        "has_numbers": bool(re.search(r'\$[\d,.]+|\d+%|\d+ ventas|\d+ días', body)),
    }

def main():
    parser = argparse.ArgumentParser(description="Download Ad Library winners")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--country", default="US", help="Country code (US, AR, MX, etc)")
    parser.add_argument("--output", default="./research/winners", help="Output directory")
    parser.add_argument("--creds", default="credentials/meta_ads.json", help="Meta credentials")
    parser.add_argument("--limit", type=int, default=50, help="Max results")
    args = parser.parse_args()
    
    with open(args.creds) as f:
        token = json.load(f)["access_token"]
    
    country_dir = os.path.join(args.output, args.country.lower())
    os.makedirs(country_dir, exist_ok=True)
    
    print(f"Searching Ad Library: '{args.query}' in {args.country}...")
    ads = search_ads(args.query, args.country, token, args.limit)
    print(f"Found {len(ads)} active ads\n")
    
    analyses = []
    for i, ad in enumerate(ads):
        analysis = analyze_ad(ad)
        analyses.append(analysis)
        
        print(f"[{i+1}/{len(ads)}] {analysis['page_name']} (since {analysis['start_date'][:10] if analysis['start_date'] else '?'})")
        print(f"  Headline: {analysis['headline'][:60]}")
        print(f"  Body: {analysis['body'][:100]}...")
        print(f"  Words: {analysis['body_length']} | Story hook: {analysis['has_story_hook']} | Numbers: {analysis['has_numbers']}")
        
        # Download snapshot
        if analysis["snapshot_url"]:
            download_snapshot(analysis["id"], analysis["snapshot_url"], country_dir, token)
        
        time.sleep(1)
    
    # Sort by start date (oldest = most proven winner)
    analyses.sort(key=lambda x: x.get("start_date", ""), reverse=False)
    
    # Save analysis
    analysis_path = os.path.join(country_dir, "ANALYSIS.json")
    with open(analysis_path, "w") as f:
        json.dump(analyses, f, ensure_ascii=False, indent=2)
    
    # Save markdown summary
    md_path = os.path.join(country_dir, "WINNERS.md")
    with open(md_path, "w") as f:
        f.write(f"# Winners — {args.query} ({args.country})\n\n")
        for a in analyses[:20]:  # Top 20
            f.write(f"## {a['page_name']} (since {a['start_date'][:10] if a['start_date'] else '?'})\n")
            f.write(f"**ID:** {a['id']}\n")
            f.write(f"**Headline:** {a['headline']}\n")
            f.write(f"**Body ({a['body_length']} words):**\n{a['body']}\n\n")
            f.write(f"Story hook: {a['has_story_hook']} | Numbers: {a['has_numbers']}\n\n---\n\n")
    
    print(f"\n=== Saved {len(analyses)} ads to {country_dir}/ ===")
    print(f"Analysis: {analysis_path}")
    print(f"Summary: {md_path}")

if __name__ == "__main__":
    main()
