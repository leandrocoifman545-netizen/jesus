# Script Output JSON Schema

When generating scripts from conversation, output this exact JSON structure:

```json
{
  "platform_adaptation": {
    "platform": "TikTok | Instagram Reels | YouTube Shorts",
    "recommended_duration_seconds": number,
    "content_style": "string describing visual style",
    "key_considerations": "platform-specific notes"
  },
  "hooks": [
    {
      "variant_number": 1,
      "hook_type": "curiosity_gap | contrarian | question | statistical | pain_point | pattern_interrupt | reveal_teaser | authority_social_proof",
      "script_text": "the hook text (5-10 words max, sayable in 3s)",
      "timing_seconds": 3
    }
  ],
  "development": {
    "framework_used": "AIDA | PAS | BAB | Hook-Story-Offer | 3_Acts",
    "emotional_arc": "description of emotional journey",
    "sections": [
      {
        "section_name": "name",
        "is_rehook": false,
        "script_text": "section script text",
        "timing_seconds": number
      }
    ]
  },
  "cta": {
    "verbal_cta": "CTA text (max 8 words)",
    "reason_why": "why act now",
    "timing_seconds": number,
    "cta_type": "swipe_up | link_bio | comment | shop_now | learn_more | download | sign_up | custom"
  },
  "total_duration_seconds": number,
  "word_count": number
}
```

## Rules
- Hooks: 5-10 words, sayable in 3 seconds, each different type
- Hooks must be INDEPENDENT from body - any hook works with same development
- Sections: 3-5 seconds each, never >7s. Total max 60s
- Re-hook: mandatory in videos 20s+, between second 10-15
- Emotional arc: start negative (pain) → pivot to positive (solution)
- Word count guide: 15s=30-40, 30s=65-85, 45s=95-115, 60s=125-150
- CTA: dual (verbal + visual), max 8 words, include reason_why with urgency

## Save command
```bash
echo '{"brief":{"productDescription":"...","targetAudience":"..."},"script":{...}}' | node scripts/save-generation.mjs
```
Returns: `{"generationId":"...","briefId":"...","url":"/scripts/..."}`
