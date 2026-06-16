# Men's Health — Google Ads Campaign Build

Everything you need to launch the PPC campaign that drives traffic to **/mens-health**.
Work top to bottom: set up tracking first, then build the campaign, then launch.

> **Framing rule (important):** Ads and keywords stay on **health & weight loss** — never name
> peptides or restricted drugs (Tirzepatide, Retatrutide, semaglutide, etc.) in keywords or ad copy.
> Peptide *guidance* is introduced on the landing page only, framed as wellness guidance.
> Google reviews the landing page too, so keep the page coaching-first (it already is).

---

## 0. Before you start — what to create

1. **Google Ads account** → https://ads.google.com (use the `besmartaico` / business Google login).
2. **Google Business Profile** (optional but boosts trust + enables location assets).
3. **Conversion action** (next section) — this is what makes "automation" possible: Google can only
   optimize bids toward a goal once it can see conversions.

---

## 1. Conversion tracking setup (do this first)

The landing page is already wired for Google Ads conversion tracking — it just needs your real IDs.

**In Google Ads:**
1. **Tools → Conversions → New conversion action → Website.**
2. Enter your domain. If it offers to scan, skip — we've already installed the tag in code.
3. Create a conversion named **"Lead — Men's Health Form"**:
   - Category: **Submit lead form**
   - Value: choose "Use the same value" and set an estimated value per lead (e.g. $25) so Google
     can optimize. (You can refine later.)
   - Count: **One** (one lead per click is what matters).
4. After saving, open **Tag setup → "Use Google tag" / "Install manually."** You'll see two values:
   - **Conversion ID** — looks like `AW-123456789`
   - **Conversion label** — looks like `AbC-D_efGhIjKlmN`

**In the code** — open `app/mens-health/page.tsx` and replace the two placeholders near the top:
```ts
const GOOGLE_ADS_ID = 'AW-CONVERSION_ID';     // → your AW-123456789
const CONVERSION_LABEL = 'CONVERSION_LABEL';  // → your AbC-D_efGhIjKlmN
```
Tell Claude Code "drop in my Google Ads ID `AW-…` and label `…`" and it'll do it for you.
Once those are real, every form submit on `/mens-health` fires the conversion automatically.

**Verify:** after deploying, use the **Google Tag Assistant** (Chrome extension) on `/mens-health`,
submit a test lead, and confirm the conversion fires. It can take Google a few hours to show in the UI.

---

## 2. Campaign structure

Create **one Search campaign** to start. Keep it simple; expand once you have data.

- **Campaign type:** Search
- **Goal:** Leads
- **Networks:** Search only (uncheck "Search partners" and "Display network" to start — cleaner data)
- **Locations:** your target area (city/state/radius). Set to **"Presence: people in your targeted locations"** (not "interest").
- **Bidding:** start on **Maximize clicks** with a max CPC cap (~$2–3) for the first ~2 weeks to gather
  data, then switch to **Maximize conversions** once you have ~15–30 conversions.
- **Budget:** start at **$20–40/day**. (Search "men's weight loss" CPCs typically run ~$1.50–4.)
- **Ad rotation:** Optimize.

### Ad groups (start with 3, tightly themed)

| Ad group | Theme | Match types |
|---|---|---|
| Weight Loss – Men | weight/fat loss intent | phrase + exact |
| Men's Health Coaching | coaching/program intent | phrase + exact |
| Meal & Fitness Plans | plan intent | phrase + exact |

Keep each ad group's keywords tightly themed so the ad copy matches the search (better Quality Score = lower CPC).

---

## 3. Keywords

Use **phrase match** `"like this"` and **exact match** `[like this]`. Avoid broad match until you trust the account.

**Ad group: Weight Loss – Men**
```
"weight loss for men"
"mens weight loss program"
"how to lose weight men"
"fat loss program for men"
"lose belly fat men"
[weight loss program for men]
[mens weight loss coach]
```

**Ad group: Men's Health Coaching**
```
"mens health coach"
"online health coach for men"
"mens wellness program"
"health coaching for men"
[mens health coaching]
[online wellness coach men]
```

**Ad group: Meal & Fitness Plans**
```
"custom meal plan for men"
"personalized fitness plan"
"meal and workout plan"
"mens nutrition plan"
[custom meal plan men]
[personalized workout plan men]
```

### Negative keywords (add at campaign level)

Block junk and non-buyers:
```
free
jobs
salary
recipe
recipes
diy
near me cheap
reddit
youtube
pdf
app free
student
certification
how to become
```
Also add restricted-term negatives so you never accidentally show on drug queries you can't advertise:
```
peptide
peptides
tirzepatide
retatrutide
semaglutide
ozempic
wegovy
steroids
trt
testosterone
```
(These stay as negatives because the ads must remain coaching/weight-loss focused.)

---

## 4. Ad copy (Responsive Search Ads)

Create **one RSA per ad group**. Paste these in, then tailor the first headline to the ad group theme.
Keep claims about *coaching and plans*, not medical/drug outcomes. No "guaranteed," no specific lb claims.

**Headlines (add 10–15; Google mixes them):**
```
Men's Weight Loss, Done Right
Custom Plans Built For Men
Lose Weight Without The Guesswork
Nutrition + Training, Personalized
Free Consultation For Men
Get Your Energy Back
A Plan You'll Actually Stick To
1-on-1 Health Coaching For Men
Real Results, Real Support
Built Around Your Body & Goals
Start With A Free Consultation
No Fads. No Crash Diets.
Custom Meal & Fitness Plans
Men's Health, Simplified
Take The First Step Today
```

**Descriptions (add 4):**
```
Personalized nutrition and training built for your body and your goals. Book a free consultation.
Stop guessing. Get a custom men's health plan and 1-on-1 guidance that fits your life.
Lose weight, build strength, and get your energy back — with expert support every step.
Free, no-obligation consultation. See exactly how we'll help before you commit.
```

**Display path:** `/mens-health` → e.g. `yourdomain.com/Mens-Health/Free-Consult`

**Final URL:** `https://YOUR_DOMAIN/mens-health`
Add tracking params for reporting: `?utm_source=google&utm_medium=cpc&utm_campaign=mens-health`

---

## 5. Assets / extensions (add all that apply — they lift CTR for free)

- **Sitelinks:** "How It Works", "Meal Plans", "Fitness Plans", "Free Consultation"
- **Callouts:** "Free Consultation", "Personalized Plans", "1-on-1 Support", "No Crash Diets"
- **Structured snippet:** Header "Services" → Meal Plans, Fitness Plans, Wellness Coaching
- **Call asset:** your phone number (enables click-to-call on mobile)
- **Lead form asset:** optional — but our on-page form already captures + tracks, so prefer landing page.

---

## 6. Launch checklist

- [ ] Conversion action created; `AW-…` ID + label pasted into `app/mens-health/page.tsx`
- [ ] `NEXT_PUBLIC_SITE_URL` set in Vercel to the real public domain
- [ ] Page deployed and loading at `https://YOUR_DOMAIN/mens-health`
- [ ] Tag Assistant confirms the gtag fires and a test lead records a conversion
- [ ] Campaign locations, budget, and bidding set
- [ ] 3 ad groups, keywords, and negatives added
- [ ] 1 RSA per ad group, all assets attached
- [ ] UTM params on final URLs
- [ ] Billing set in Google Ads

---

## 7. First 2 weeks — what to watch & adjust ("the automation")

You asked about automation. The most reliable lever is **Smart Bidding**, which automates bids once it
has conversion data. Path:

1. **Week 1–2:** Maximize clicks (cap CPC). Let it gather ~15–30 conversions.
2. **Then switch to Maximize conversions** (or Target CPA once you know your cost per lead).
   Google now auto-adjusts every bid in real time toward leads — that's the core automation.
3. **Search terms report** (weekly): mine for new negatives and new winning keywords.
4. **Optional automated rules** (Tools → Rules) — e.g. "pause keywords with >40 clicks and 0 conversions,"
   or "email me if daily spend exceeds $X." Ask Claude Code and we can spec these out, or add a
   **Google Ads Script** for budget pacing / auto-pausing if you want code-level automation later.

---

## Compliance notes (read once)

- **No medical/drug claims** in ads. Personalized health/coaching framing only.
- Google's **personalized advertising** policy limits targeting on health status — keep audience targeting
  generic (location + search intent), not "people trying to lose weight" health-condition audiences.
- The landing page carries a wellness disclaimer in the footer — keep it.
- If you later want to advertise peptides directly, that's a different, restricted path (pharmacy/health
  certifications) — talk to me before trying it.
