#!/usr/bin/env python3
"""
Ad Factory — Crear campaña completa en Meta Ads API.

Uso:
  python3 create_campaign.py config.json --creds credentials/meta_ads.json

config.json:
{
  "campaign_name": "ADP_2026_TEST_MASIVO",
  "ad_account_id": "act_123456789",
  "page_id": "123456789",
  "pixel_id": "123456789",
  "destination_url": "https://ejemplo.com/clase",
  "daily_budget_cents": 1000,
  "countries": ["AR", "MX", "CO", "CL"],
  "age_min": 25,
  "age_max": 55,
  "nichos_dir": "./output",
  "utm_template": "?utm_source=facebook&utm_medium=paid&utm_campaign={campaign}&utm_content={ad}"
}

credentials/meta_ads.json:
{"access_token": "EAA..."}

Estructura de nichos_dir:
  nicho_01_nombre/
    img_01.png + COPY_01.txt
    img_02.png + COPY_02.txt
"""
import argparse, requests, json, os, sys, time, re

API = "https://graph.facebook.com/v21.0"

def load_config(path):
    with open(path) as f:
        return json.load(f)

def api_call(method, url, token, **kwargs):
    """Make API call with retry on rate limit."""
    kwargs.setdefault("params", {})
    kwargs["params"]["access_token"] = token
    for attempt in range(3):
        r = getattr(requests, method)(f"{API}/{url}", **kwargs)
        if r.status_code == 200:
            return r.json()
        if r.status_code == 429 or "rate" in r.text.lower():
            wait = 60 * (attempt + 1)
            print(f"  Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        print(f"  ERROR {r.status_code}: {r.text[:300]}")
        return None
    return None

def parse_copy_file(path):
    """Parse COPY_XX.txt into components."""
    with open(path) as f:
        content = f.read()
    
    result = {"headline": "", "description": "", "body": "", "angle": ""}
    
    for line in content.split("\n"):
        if line.startswith("ÁNGULO:"):
            result["angle"] = line.split(":", 1)[1].strip()
        elif line.startswith("HEADLINE:"):
            result["headline"] = line.split(":", 1)[1].strip()
        elif line.startswith("DESCRIPCIÓN:"):
            result["description"] = line.split(":", 1)[1].strip()
    
    # Body is everything after "TEXTO PRINCIPAL:"
    if "TEXTO PRINCIPAL:" in content:
        result["body"] = content.split("TEXTO PRINCIPAL:", 1)[1].strip()
    
    return result

def create_campaign(config, token, dry_run=False):
    """Create full campaign structure."""
    act = config["ad_account_id"]
    
    # 1. Create campaign
    print("Creating campaign...")
    campaign_data = {
        "name": config["campaign_name"],
        "objective": "OUTCOME_SALES",
        "status": "PAUSED",
        "special_ad_categories": "[]"
    }
    if dry_run:
        print(f"  DRY RUN: Campaign '{config['campaign_name']}'")
        campaign_id = "FAKE_CAMPAIGN_ID"
    else:
        result = api_call("post", f"{act}/campaigns", token, data=campaign_data)
        if not result:
            print("Failed to create campaign")
            return
        campaign_id = result["id"]
    print(f"  Campaign: {campaign_id}")
    
    # 2. Iterate nichos
    nichos_dir = config["nichos_dir"]
    nicho_dirs = sorted([d for d in os.listdir(nichos_dir) 
                         if os.path.isdir(os.path.join(nichos_dir, d))])
    
    total_ads = 0
    for nicho_dir in nicho_dirs:
        nicho_path = os.path.join(nichos_dir, nicho_dir)
        
        # Find copy files
        copy_files = sorted([f for f in os.listdir(nicho_path) if f.startswith("COPY_") and f.endswith(".txt")])
        if not copy_files:
            continue
            
        print(f"\nAd Set: {nicho_dir} ({len(copy_files)} ads)")
        
        # 3. Create ad set
        adset_data = {
            "campaign_id": campaign_id,
            "name": f"{config['campaign_name']}_{nicho_dir}",
            "status": "PAUSED",
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "OFFSITE_CONVERSIONS",
            "daily_budget": config["daily_budget_cents"],
            "targeting": json.dumps({
                "geo_locations": {"countries": config["countries"]},
                "age_min": config["age_min"],
                "age_max": config["age_max"]
            }),
            "promoted_object": json.dumps({
                "pixel_id": config["pixel_id"],
                "custom_event_type": "VIEW_CONTENT"
            }),
            "attribution_spec": json.dumps([{
                "event_type": "CLICK_THROUGH",
                "window_days": 7
            }])
        }
        
        if dry_run:
            adset_id = f"FAKE_ADSET_{nicho_dir}"
        else:
            result = api_call("post", f"{act}/adsets", token, data=adset_data)
            if not result:
                print(f"  Failed to create ad set for {nicho_dir}")
                continue
            adset_id = result["id"]
        print(f"  Ad Set: {adset_id}")
        
        # 4. Create ads for each copy
        for copy_file in copy_files:
            copy_num = re.search(r"(\d+)", copy_file).group(1)
            img_file = f"img_{copy_num}.png"
            img_path = os.path.join(nicho_path, img_file)
            copy_path = os.path.join(nicho_path, copy_file)
            
            if not os.path.exists(img_path):
                print(f"    SKIP {copy_file} (no matching image {img_file})")
                continue
            
            copy = parse_copy_file(copy_path)
            ad_name = f"{config['campaign_name']}_{nicho_dir}_angulo_{copy_num}_{copy['angle'][:20]}"
            
            url = config["destination_url"] + config.get("utm_template", "").format(
                campaign=config["campaign_name"],
                ad=ad_name
            )
            
            if dry_run:
                print(f"    DRY RUN: Ad '{ad_name}'")
                print(f"      Headline: {copy['headline'][:40]}")
                print(f"      Description: {copy['description'][:60]}...")
                total_ads += 1
                continue
            
            # Upload image
            with open(img_path, "rb") as f:
                img_result = api_call("post", f"{act}/adimages", token,
                                      files={"filename": f})
            if not img_result or "images" not in img_result:
                print(f"    Failed to upload image for {copy_file}")
                continue
            
            img_hash = list(img_result["images"].values())[0]["hash"]
            
            # Create creative
            creative_data = {
                "name": ad_name,
                "object_story_spec": json.dumps({
                    "page_id": config["page_id"],
                    "link_data": {
                        "image_hash": img_hash,
                        "link": url,
                        "message": copy["body"],
                        "name": copy["headline"],
                        "description": copy["description"],
                        "call_to_action": {"type": "SIGN_UP", "value": {"link": url}}
                    }
                })
            }
            creative_result = api_call("post", f"{act}/adcreatives", token, data=creative_data)
            if not creative_result:
                print(f"    Failed to create creative for {copy_file}")
                continue
            
            # Create ad
            ad_data = {
                "adset_id": adset_id,
                "creative": json.dumps({"creative_id": creative_result["id"]}),
                "name": ad_name,
                "status": "PAUSED"
            }
            ad_result = api_call("post", f"{act}/ads", token, data=ad_data)
            if ad_result:
                total_ads += 1
                print(f"    Ad: {ad_result['id']} — {copy['headline']}")
            
            time.sleep(2)  # Rate limit safety
        
        time.sleep(3)
    
    print(f"\n=== DONE: {total_ads} ads created (PAUSED) ===")

def main():
    parser = argparse.ArgumentParser(description="Create Meta Ads campaign")
    parser.add_argument("config", help="Campaign config JSON")
    parser.add_argument("--creds", default="credentials/meta_ads.json", help="Meta API credentials")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be created without API calls")
    args = parser.parse_args()
    
    config = load_config(args.config)
    creds = load_config(args.creds)
    token = creds["access_token"]
    
    create_campaign(config, token, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
