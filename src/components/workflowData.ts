// ─── Workflow Data Registry ──────────────────────────────────────────────────
// All workflow definitions, independent of persona assignments.
// Personas reference these by ID.

import type { ScenarioDef } from "./AgentDemo";

export const ALL_WORKFLOWS: ScenarioDef[] = [
  {
    id: "weekly-eta-report",
    title: "Compile the weekly ETA report for merch and planning",
    subtitle:
      "Automated ETA consolidation from supplier emails, NetSuite POs, and shipment data",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll compile this week's ETA report. This is a pre-configured workflow with read-only access to your connected systems. I'll flag anything that needs your attention before taking action.\n\n1. Pull all supplier ETA-update emails received since last Friday and parse updated ship/delivery dates\n2. Cross-reference parsed ETAs against open POs and ASNs in NetSuite\n3. Flag mismatches, highlight delays >3 days, and calculate revised delivery windows\n4. Format the consolidated ETA report and send to merch, planning, and logistics — you'll approve before it goes out\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read supplier emails from Outlook",
        "Read PO and ASN data from NetSuite",
        "Read shipment tracking from freight portals",
        "Generate and format reports",
      ],
      requiresApproval: [
        "Update ETA fields in NetSuite POs",
        "Send the ETA report via email",
        "Escalate delay alerts to team leads",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to email and ERP systems",
        detail:
          "Authenticating to Outlook via service account and connecting to NetSuite REST API. All connections are read-only — no records will be modified until you approve.",
        sources: [
          "Email (Outlook)",
          "ERP (NetSuite) — Purchase Orders",
          "ERP (NetSuite) — ASN Module",
          "Flexport Shipment Tracker",
        ],
      },
      {
        type: "data_pull",
        label: "Parsing supplier ETA emails",
        detail:
          'Found 22 emails from suppliers since last Friday containing ETA updates. Extracted dates from structured and unstructured formats across 9 suppliers. Zhenmei Textiles updated 4 POs, Samil Dyeing updated 3, and Huafeng Knitting sent a blanket update for all open orders. Cross-referencing against 47 open POs in NetSuite and 18 active ASNs...',
        sources: [
          "Outlook — 22 emails matching supplier ETA patterns",
          "NetSuite — 47 open POs (filtered by ship window Mar 15–Apr 30)",
          "NetSuite — 18 active ASNs",
        ],
      },
      {
        type: "reasoning",
        label: "Matching ETAs to POs and detecting conflicts",
        detail:
          "Matched 19 of 22 email ETAs to specific PO lines. 3 emails reference PO numbers that don't exist in NetSuite — likely typos (e.g., supplier wrote PO #88421 but closest match is PO #88412). Found 6 POs where the emailed ETA differs from NetSuite by more than 3 days:\n\n• PO #88412 (Zhenmei, greige cotton twill) — supplier says Apr 12, NetSuite shows Mar 28. 15-day slip.\n• PO #90215 (Samil, reactive-dyed jersey) — supplier says Apr 3, NetSuite shows Mar 30. 4-day slip.\n• PO #90220 (Samil, yarn-dyed stripe) — supplier says Mar 22, NetSuite shows Mar 25. 3 days early.\n• PO #91003 (Huafeng, 1x1 rib knit) — supplier says Apr 8, NetSuite shows Mar 29. 10-day slip.\n• PO #91007 (Huafeng, french terry) — supplier says Apr 10, NetSuite shows Mar 31. 10-day slip.\n• PO #87550 (Pacific Garments, woven shorts) — supplier says Apr 1, NetSuite shows Mar 27. 5-day slip.\n\nThe Huafeng delays are connected — their facility had a boiler issue affecting all dyeing operations.",
      },
      {
        type: "human_input",
        label: "Confirm NetSuite ETA updates",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've reconciled all supplier ETAs against NetSuite. Updating PO records is not auto-approved for this workflow.\n\n**Summary of proposed NetSuite updates:**\n\n- **16 POs** — ETAs match or are within 3-day tolerance. No update needed.\n- **6 POs** — ETAs differ by >3 days. I'll update the Expected Ship Date and add a note with the supplier's email reference.\n- **3 emails** — Unmatched PO numbers. I'll flag these for manual review.\n\nThe 6 delayed POs represent **$218K in open order value**. The two Huafeng POs alone account for $87K and feed into the Spring drop 2 assortment launching Apr 15.\n\nShould I update the 6 POs in NetSuite with the revised ETAs?",
        approvalButtons: ["Update NetSuite ETAs", "Review details first"],
      },
      {
        type: "data_pull",
        label: "Pulling shipment tracking for in-transit orders",
        detail:
          "Cross-referencing ASNs with live container tracking... 14 of 18 shipments are on schedule. Container OOLU7834521 (PO #87330, Pacific Garments) arrived at Long Beach 2 days early. Container CMAU5598210 (PO #89901, Zhenmei) is showing a transshipment delay in Busan — revised port ETA is Mar 26 vs. original Mar 22. Two containers pending vessel assignment at Yantian.",
        sources: [
          "Flexport — 18 active shipments",
          "NetSuite — ASN Module",
          "OOCL Track & Trace",
          "CMA CGM eSolutions",
        ],
      },
      {
        type: "reasoning",
        label: "Compiling consolidated ETA report",
        detail:
          "Building the weekly ETA report across 3 sections: (1) In-Transit Shipments with live tracking ETAs, (2) Pre-Ship POs with supplier-confirmed ETAs, (3) Exception Summary with the 6 delayed POs and 3 unmatched references. Formatting for the merch/planning template with color-coded status bands. Calculating revised warehouse-receipt dates using standard port-to-DC transit times (Long Beach: +5 days, Savannah: +7 days).",
      },
      {
        type: "human_input",
        label: "Review ETA report before distribution",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "The weekly ETA report is ready. Sending emails is not auto-approved, so I need your sign-off.\n\n**Weekly ETA Report — Week Ending Mar 20**\n\n**In-Transit (18 shipments)**\n- 14 on schedule, 1 early arrival (Long Beach), 2 pending vessel, 1 transshipment delay (Busan +4 days)\n\n**Pre-Ship POs (47 open)**\n- 38 on track, 6 delayed (combined value: $218K), 3 unmatched PO refs flagged for manual review\n\n**Critical Delays**\n- Huafeng Knitting — boiler issue affecting all dyeing. 2 POs slipping 10 days. Risk to Spring drop 2 launch (Apr 15).\n- Zhenmei Textiles — PO #88412 slipping 15 days. Greige cotton twill for Fall proto development.\n\n**Recommendation:** Escalate Huafeng delays to sourcing director — may need to explore backup dyehouse for Spring drop 2 fabrics.\n\nSend to merch-planning-eta@company.com and logistics-team@company.com?",
        approvalButtons: ["Send report", "Edit before sending"],
      },
      {
        type: "result",
        label: "ETA report distributed",
        detail:
          "Weekly ETA report sent to merch-planning-eta@company.com and logistics-team@company.com. NetSuite updated with 6 revised ETAs. 3 unmatched PO references added to the team's manual-review queue in Asana. Calendar reminder set for Monday to check Huafeng boiler recovery status.",
      },
    ],
    completionMessage:
      "Weekly ETA report compiled from 22 supplier emails, 47 POs, and 18 live shipments — reconciled and delivered. That replaced about 4 hours of inbox scanning and spreadsheet matching.",
  },
  {
    id: "create-purchase-order",
    title: "Create and distribute purchase orders to factories",
    subtitle:
      "End-to-end PO creation from style finalization through factory confirmation",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the PO creation workflow for the finalized styles. This workflow touches multiple systems and requires your approval before POs are sent to factories.\n\n1. Pull the order file from BeProduct, match against the smart SKU file and approved costing, and validate factory allocations\n2. Distribute styles across POs by factory and destination, then create POs in NetSuite\n3. Export POs as PDFs, swap consignee details for Canada/UK shipments, and prepare factory email packages\n4. Send POs to each factory for confirmation — you'll approve the final packages before they go out\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read from BeProduct, costing files, and allocation sheets",
        "Read and validate data in NetSuite",
        "Generate PDF exports",
        "Cross-reference SKUs across systems",
      ],
      requiresApproval: [
        "Create new POs in NetSuite",
        "Send PO PDFs to factories via email",
        "Modify consignee details on PO PDFs",
        "Update POs after factory change requests",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pulling source files and validating inputs",
        detail:
          "Connecting to BeProduct to pull the Spring '26 order file (148 styles, 12 factories). Loading the smart SKU master file from Google Drive and the approved costing file from the shared costing folder. Cross-checking factory allocation sheets for capacity and delivery windows.",
        sources: [
          "BeProduct — Spring '26 Order File",
          "Google Drive — Smart SKU Master v4.2",
          "Google Drive — Approved Costing File (Spring '26 Final)",
          "Google Sheets — Factory Allocation by Destination",
          "ERP (NetSuite) — Vendor Master",
        ],
      },
      {
        type: "reasoning",
        label: "Distributing styles across POs",
        detail:
          "Grouping 148 styles into POs by factory + destination country. This yields 23 POs across 12 factories:\n\n• Zhenmei Textiles (Dongguan): 4 POs — US (31 styles), Canada (8 styles), UK (5 styles), EU (3 styles)\n• Pacific Garments (HCMC): 3 POs — US (22 styles), Canada (6 styles), UK (4 styles)\n• Samil Industries (Seoul): 2 POs — US (14 styles), Canada (3 styles)\n• Huafeng Knitting (Hangzhou): 3 POs — US (18 styles), Canada (4 styles), UK (2 styles)\n• 8 remaining factories: 11 POs with 28 styles total\n\nTotal first cost across all POs: $2.14M. Validating each SKU against approved costing — checking for price discrepancies, missing color/size combos, and inactive SKUs...",
      },
      {
        type: "data_pull",
        label: "Validation complete — flagging errors",
        detail:
          "Found 4 issues that need resolution before PO creation:\n\n1. SKU WVN-8834-NVY-S has no approved cost in the costing file — style was added after final costing review\n2. Style STY-3310 allocated to Pacific Garments but factory allocation sheet shows Zhenmei for this fabric type\n3. Canada PO for Samil — 3 styles totaling only 120 units, below Samil's MOQ of 300/style\n4. Size curve for STY-2890 doesn't match the smart SKU file (missing XXL)\n\nThe remaining 144 styles across 22 POs validated clean against all source files.",
        sources: [
          "BeProduct — SKU validation",
          "Costing File — Price match",
          "Allocation Sheet — Factory assignment",
          "Smart SKU File — Size curve validation",
        ],
      },
      {
        type: "human_input",
        label: "Resolve validation errors before PO creation",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I found 4 issues that need resolution before I can create the POs in NetSuite.\n\n1. **SKU WVN-8834-NVY-S** — No approved cost. Last directional quote from Zhenmei was $14.20 FOB. Use that, or hold this style?\n2. **STY-3310** — Factory mismatch. BeProduct says Pacific Garments, allocation sheet says Zhenmei. Which is correct?\n3. **Samil Canada PO** — 120 units/style, below 300 MOQ. Combine with US PO (single consignee) or proceed with surcharge?\n4. **STY-2890** — Missing XXL in smart SKU file. Add XXL to the size run, or drop it?\n\nI can proceed with the clean 144 styles now and hold these 4 for your resolution, or wait until everything is resolved.\n\nHow would you like to proceed?",
        approvalButtons: [
          "Proceed with clean styles, hold 4",
          "Wait — I'll resolve now",
        ],
      },
      {
        type: "system_read",
        label: "Creating POs in NetSuite",
        detail:
          "Creating 22 purchase orders in NetSuite for the validated 144 styles. Each PO includes: vendor, ship-to destination, style/SKU detail, unit cost, quantity, expected ship date, payment terms (Net 30 from B/L date), and freight terms (FOB origin). Total PO value: $2.08M across 22 POs. All POs created successfully — NetSuite assigned PO numbers #92401 through #92422.",
        sources: [
          "ERP (NetSuite) — Purchase Order Module",
          "ERP (NetSuite) — Vendor Master",
        ],
      },
      {
        type: "reasoning",
        label: "Generating PO PDFs and swapping consignee for intl shipments",
        detail:
          "Exporting all 22 POs as PDFs from NetSuite. For the 7 Canada-destined POs, swapping US consignee (Acme Apparel Inc., 1200 Commerce Dr, Carson CA 90745) to Canadian consignee (Acme Apparel Canada Ltd., 450 Industrial Pkwy, Mississauga ON L5T 2R3). For the 4 UK-destined POs, swapping to UK consignee (Acme Apparel UK Ltd., Unit 12 Regency Park, Northampton NN3 8EB). EU POs route through the Netherlands DC (Acme Europe BV, Havenweg 8, 3115 HC Schiedam). PDF packages ready for review.",
      },
      {
        type: "human_input",
        label: "Approve PO packages for factory distribution",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "All 22 PO PDFs are generated and consignee details have been swapped for international shipments. Here's the summary before I email them to factories:\n\n| Factory | # POs | Styles | Total Value | Ship Window |\n|---|---|---|---|---|\n| Zhenmei Textiles | 4 | 44 | $682K | Apr 15 – May 10 |\n| Pacific Garments | 3 | 32 | $498K | Apr 20 – May 15 |\n| Huafeng Knitting | 3 | 24 | $344K | Apr 10 – May 5 |\n| Samil Industries | 2 | 17 | $231K | May 1 – May 20 |\n| Other (8 factories) | 10 | 27 | $325K | Various |\n\nEach factory will receive their POs as PDF attachments with a confirmation request. I'll ask them to confirm or flag changes within 48 hours.\n\nSend PO packages to all 12 factories?",
        approvalButtons: ["Send all PO packages", "Review PDFs first"],
      },
      {
        type: "result",
        label: "POs created and distributed to factories",
        detail:
          "22 purchase orders created in NetSuite (#92401–#92422) totaling $2.08M across 144 styles. PO PDFs sent to all 12 factories with 48-hour confirmation deadline. 4 styles held for manual resolution (tracked in Asana task #PO-HOLD-0320). I'll monitor factory reply emails and flag any change requests or confirmations as they come in.",
      },
    ],
    completionMessage:
      "22 POs created, formatted, and sent to 12 factories covering $2.08M in Spring '26 orders. This workflow normally takes a full day of manual data entry, PDF editing, and emailing — done in minutes.",
  },
  {
    id: "shipment-delay-cascade",
    title: "Cascade a shipment delay notification across teams",
    subtitle:
      "Automated delay impact analysis and cross-functional notification",
    industry: "Apparel & Footwear",
    acknowledgment:
      "Got it — I'll run the delay cascade workflow for this shipment. This workflow analyzes downstream impact and notifies the right teams, but I'll need your sign-off before any notifications go out.\n\n1. Parse the supplier's delay notification and pull the original PO ship dates and order details from NetSuite\n2. Analyze downstream impact on logistics, marketing, and retail launch timelines\n3. Determine if the delay triggers penalty terms (>1 week late = 50/50 air freight split) and draft PO amendments\n4. Notify all affected teams with context-specific alerts — you'll review the notification plan before it's sent\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read supplier emails and parse delay details",
        "Read PO data, ship dates, and logistics plans from NetSuite",
        "Analyze downstream calendar impact",
        "Draft notifications and PO amendments",
      ],
      requiresApproval: [
        "Send delay notifications to teams",
        "Update PO terms with penalty clauses",
        "Modify ship dates in NetSuite",
        "Notify marketing to hold campaign emails",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Parsing delay notification and pulling PO data",
        detail:
          "Reading the email from Huafeng Knitting (received 9:14am today). They're reporting a 10-day delay on PO #91003 (1x1 rib knit, 4,200 units) and PO #91007 (french terry, 3,800 units). Reason cited: boiler malfunction at their Hangzhou dyehouse disrupting all reactive-dye processing. Pulling original PO details and ship windows from NetSuite...",
        sources: [
          "Outlook — Huafeng Knitting delay email",
          "ERP (NetSuite) — PO #91003",
          "ERP (NetSuite) — PO #91007",
          "ERP (NetSuite) — Logistics Calendar",
        ],
      },
      {
        type: "data_pull",
        label: "Mapping affected styles, SKUs, and downstream milestones",
        detail:
          "PO #91003 feeds 6 styles (STY-3401 through STY-3406) in the Spring drop 2 collection. PO #91007 feeds 4 styles (STY-3410 through STY-3413) also in drop 2. Combined first-cost value: $87,400. These POs were originally due to ship Mar 29 and Mar 31 respectively. The 10-day slip pushes ship dates to Apr 8 and Apr 10.\n\nDownstream timeline:\n• Original port arrival (Long Beach): Apr 14–16 → Now Apr 24–26\n• DC receipt (Ontario, CA): Apr 19–21 → Now Apr 29–May 1\n• Retail floor date was Apr 25 → Now at risk, only lands May 3–5\n• Spring drop 2 marketing email was scheduled for Apr 22",
        sources: [
          "NetSuite — Style/SKU cross-reference",
          "Flexport — Transit time estimates",
          "NetSuite — DC receipt calendar",
          "Marketing Calendar (Google Sheets)",
        ],
      },
      {
        type: "reasoning",
        label: "Evaluating delay severity and penalty terms",
        detail:
          "The 10-day delay exceeds the 1-week threshold specified in the vendor agreement. Per the standing policy, delays >7 days trigger a 50/50 air freight cost split between brand and supplier. Air freight from Shanghai to LAX for this volume (~2.8 CBM combined) would cost approximately $8,400 total — so $4,200 to us vs. ~$1,100 ocean freight. Net incremental cost to brand: $3,100.\n\nHowever, air-freighting would recover 7 of the 10 lost days, getting product to DC by Apr 22 — just barely making the Apr 25 floor date. Without air freight, drop 2 launch slips to May 3 at the earliest, which conflicts with the Memorial Day markdown cadence.\n\nRecommendation: invoke the 50/50 air freight clause. The $3,100 incremental cost is far less than the margin erosion from a late launch landing in markdown window.",
      },
      {
        type: "human_input",
        label: "Approve delay response and notification plan",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's my recommended response plan for the Huafeng delay. All actions below require your approval.\n\n**PO Amendments:**\n- PO #91003 — Update ship date to Apr 8. Add penalty term: 50/50 air freight split per vendor agreement clause 4.2\n- PO #91007 — Update ship date to Apr 10. Same penalty term.\n- Combined air freight cost: ~$8,400 ($4,200 brand / $4,200 supplier)\n\n**Team Notifications:**\n- **Logistics** — Book air freight ex-Shanghai for ~2.8 CBM, target pickup Apr 8–10. Carrier: FedEx International Priority Freight.\n- **Merchandising** — 10 styles in Spring drop 2 affected. Floor date recoverable if air-freighted. No action needed yet.\n- **Marketing** — Hold the Apr 22 Spring drop 2 email until logistics confirms delivery. Tentative reschedule: Apr 24.\n- **Production lead (Jenny Chen)** — FYI on Huafeng boiler issue. May affect other open POs with reactive-dye fabrics.\n\nShould I proceed with this plan?",
        approvalButtons: ["Proceed with plan", "Adjust before sending"],
      },
      {
        type: "system_read",
        label: "Updating POs and sending notifications",
        detail:
          "Updated PO #91003 and PO #91007 in NetSuite with revised ship dates and penalty terms. Added internal notes referencing Huafeng email and approval timestamp. Sending tailored notifications to each team:\n\n• Logistics team — detailed air freight booking request with CBM, pickup window, and carrier preference\n• Merch team — style-level impact summary with revised floor dates\n• Marketing — hold notice for Apr 22 email campaign with suggested reschedule date\n• Jenny Chen — supplier reliability flag with link to Huafeng's open PO dashboard",
        sources: [
          "ERP (NetSuite) — PO #91003, PO #91007",
          "Outlook — 4 notification emails",
          "Asana — Task creation for logistics follow-up",
        ],
      },
      {
        type: "result",
        label: "Delay cascaded and teams notified",
        detail:
          "Huafeng 10-day delay fully cascaded. POs #91003 and #91007 updated in NetSuite with revised dates and 50/50 air freight penalty. Four teams notified with context-specific action items. Logistics has an Asana task to book air freight by EOD Thursday. Marketing hold confirmed for Apr 22 email. Follow-up reminder set for Monday to confirm Huafeng boiler is back online.",
      },
    ],
    completionMessage:
      "Delay cascade complete — POs updated, penalty terms applied, and 4 teams notified with specific action items. This normally takes half a day of Slack threads and email chains to coordinate.",
  },
  {
    id: "pre-costing-fabric-vetting",
    title: "Vet fabric options and build pre-costing estimates",
    subtitle:
      "Mill outreach for minimums, pricing, and lead times on new fabric picks",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the fabric vetting workflow for the new design picks. This involves outreach to mills and building pre-costing estimates, so I'll need your input at key decision points.\n\n1. Review the fabric picks from design and identify which are new/out-of-range vs. existing mill programs\n2. Reach out to mills for MOQs, price per yard, lead times, and available colorways\n3. Build pre-costing estimates for each fabric option and flag any that push styles over target cost\n4. Present vetted options with trade-offs for design and merchandising review\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read design fabric picks and tech packs",
        "Read mill contact databases and pricing history",
        "Read costing parameters and target margins",
        "Generate pre-costing spreadsheets",
      ],
      requiresApproval: [
        "Send inquiry emails to mills",
        "Share pre-costing estimates with design team",
        "Recommend fabric substitutions",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Reviewing design fabric picks",
        detail:
          "Loading the Fall '26 fabric selection board from BeProduct. Design has picked 18 fabrics across 34 styles. Cross-referencing against our mill library and prior season usage... 11 fabrics are repeat/carry-over with known pricing. 7 are new picks that need mill outreach:\n\n1. 12oz organic selvedge denim — new mill (Kaihara, Japan)\n2. Recycled poly ripstop — sustainability requirement, no existing source\n3. Brushed moleskin (8.5oz) — previously sourced from Zhenmei but out of stock\n4. Boiled wool blend (70/30) — new fabrication, no prior quotes\n5. Waxed cotton canvas (10oz) — specialty finish, limited mills\n6. Cupro twill lining — design upgrade from standard poly lining\n7. Double-cloth knit (ponte weight) — new construction for the jersey program",
        sources: [
          "BeProduct — Fall '26 Fabric Board",
          "Mill Library (Google Sheets)",
          "Prior Season Costing — Spring '26, Fall '25",
        ],
      },
      {
        type: "reasoning",
        label: "Prioritizing mill outreach and identifying contacts",
        detail:
          "Prioritizing the 7 new fabrics by style count and launch criticality. The recycled poly ripstop feeds 6 styles in the core outerwear program — highest priority. The organic selvedge denim is for a 2-style capsule but design considers it a hero fabric for the collection.\n\nIdentified mill contacts:\n• Kaihara (Japan) — organic selvedge denim. Contact: Yuki Tanaka, yuki.t@kaihara.co.jp\n• Hyosung (South Korea) — recycled poly ripstop, Regen Ocean program. Contact: Min-Jun Park\n• Zhenmei Textiles (China) — moleskin restock check. Contact: Lily Wang\n• Tollegno 1900 (Italy) — boiled wool blend. Contact: Marco Bianchi\n• British Millerain (UK) — waxed cotton canvas. Contact: James Hargreaves\n• Asahi Kasei (Japan) — cupro twill lining. Contact: Kenji Sato\n• Namyeung Vivitex (South Korea) — double-cloth ponte knit. Contact: Soo-Yeon Kim\n\nDrafting RFQ emails with our standard parameters: MOQ, MCQ, price/yard, lead time, available colors, and sample yardage availability.",
      },
      {
        type: "human_input",
        label: "Approve mill outreach emails",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've drafted RFQ emails for 7 mills. Each email requests: MOQ, MCQ, price per yard (in $USD), lead time from order to ship, available colorways, and 3-yard sample availability.\n\nA few notes before I send:\n\n- **Kaihara (selvedge denim)** — Japanese selvedge typically runs $12–18/yd. If design's 2-style capsule is only ~800 units, we may not hit Kaihara's MOQ. Should I also request a small-lot surcharge quote?\n- **Hyosung (recycled ripstop)** — Their Regen Ocean line requires a 5,000-yard MOQ. Our 6-style outerwear program projects ~7,200 yards, so we should be safe, but it's tight.\n- **British Millerain (waxed canvas)** — Lead time is typically 10–14 weeks. This may conflict with the Fall production calendar. Want me to flag this risk to design now?\n\nSend all 7 RFQ emails?",
        approvalButtons: ["Send all RFQs", "Adjust before sending"],
      },
      {
        type: "data_pull",
        label: "Collecting mill responses and pricing",
        detail:
          "Mill responses received over 5 business days. Compiling pricing data:\n\n| Fabric | Mill | MOQ | Price/Yd | Lead Time | Notes |\n|---|---|---|---|---|---|\n| Organic selvedge denim | Kaihara | 1,500 yd | $16.80 | 8 weeks | Small-lot surcharge: +15% under 1,500 yd |\n| Recycled poly ripstop | Hyosung | 5,000 yd | $4.20 | 6 weeks | Regen Ocean cert included |\n| Brushed moleskin | Zhenmei | 3,000 yd | $5.60 | 5 weeks | Back in stock, same quality |\n| Boiled wool blend | Tollegno | 800 yd | $22.40 | 10 weeks | Only available in 5 colors |\n| Waxed cotton canvas | British Millerain | 2,000 yd | $11.50 | 12 weeks | Wax finish adds 3 weeks |\n| Cupro twill lining | Asahi Kasei | 2,000 yd | $6.80 | 6 weeks | Bemberg cupro, premium hand |\n| Double-cloth ponte | Namyeung | 4,000 yd | $7.40 | 5 weeks | Min 2 colors per order |",
        sources: [
          "Outlook — 7 mill response emails",
          "Mill Library — pricing history comparison",
        ],
      },
      {
        type: "reasoning",
        label: "Building pre-costing estimates and flagging issues",
        detail:
          "Building pre-costing estimates for all 34 styles using the updated fabric pricing. Calculating fabric cost per unit based on marker yield (avg 1.4 yd/unit for tops, 1.8 yd/unit for bottoms, 2.6 yd/unit for outerwear).\n\nThree styles are now above target FOB cost:\n• STY-4010 (selvedge denim jacket) — $16.80/yd fabric pushes FOB to $48.20 vs. $38 target. $10.20 overage.\n• STY-4022 (boiled wool overcoat) — $22.40/yd at 3.1 yd/unit = $69.44 fabric alone. FOB estimate: $112 vs. $85 target.\n• STY-4031 (waxed canvas field jacket) — $11.50/yd is manageable but 12-week lead time misses the Aug 15 production start.\n\nThe recycled ripstop, moleskin, cupro, and ponte all come in within target cost parameters.",
      },
      {
        type: "human_input",
        label: "Review pre-costing and design trade-offs",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Pre-costing is complete. 4 of 7 new fabrics are within target. 3 need design/merch decisions:\n\n**Over Target Cost:**\n1. **Selvedge denim jacket (STY-4010)** — $10.20/unit over target. Options: (a) accept higher cost for hero fabric, (b) switch to non-selvedge organic denim at ~$8.50/yd, (c) reduce style details to offset.\n2. **Boiled wool overcoat (STY-4022)** — $27/unit over target. Options: (a) reposition as premium price tier, (b) switch to wool/poly blend at ~$14/yd, (c) drop style.\n\n**Lead Time Risk:**\n3. **Waxed canvas field jacket (STY-4031)** — 12-week fabric lead time means we need to commit by May 15 to hit Aug 15 production. That's 3 weeks before design typically finalizes Fall fabrics.\n\nShould I share this pre-costing summary with the design and merch teams for their input?",
        approvalButtons: [
          "Share with design & merch",
          "Hold — need more info",
        ],
      },
      {
        type: "result",
        label: "Fabric vetting complete",
        detail:
          "Pre-costing estimates built for all 34 Fall '26 styles using live mill quotes. 4 new fabrics cleared within target cost. 3 flagged for design/merch review with specific trade-off options. Summary shared with design (Sarah K.) and merchandising (Tom R.) for decisions needed by Apr 4. Mill sample yardage requested for all 7 fabrics — arriving in 7–10 days for hand-feel review.",
      },
    ],
    completionMessage:
      "Fabric vetting complete — 7 mills contacted, pricing compiled, and pre-costing built for 34 styles. Three over-target situations flagged with clear trade-off options. This usually takes 2 weeks of back-and-forth emails with mills.",
  },
  {
    id: "email-triage-delegation",
    title: "Triage supplier emails and delegate to team",
    subtitle:
      "Automated email classification, context enrichment, and task assignment",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll triage the incoming supplier emails and route them to your team with the right context. I'll check work before it goes to factories.\n\n1. Scan all unread supplier emails and classify by urgency, topic, and responsible team member\n2. Pull reference data (tech packs, POs, BOMs) from connected systems to enrich each email with context\n3. Draft responses for routine items and assign tasks to team members based on their style/supplier ownership\n4. Queue junior PD responses for your review before they're sent to factories\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read all incoming supplier emails",
        "Read tech packs, POs, and BOMs from PLM and ERP",
        "Classify and prioritize emails",
        "Draft response suggestions",
      ],
      requiresApproval: [
        "Assign tasks to team members",
        "Send responses to suppliers",
        "Escalate urgent issues",
        "Forward emails to team members",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Scanning supplier inbox",
        detail:
          "Reading the shared sourcing inbox (sourcing@company.com). Found 31 unread emails from 16 suppliers received since yesterday 5pm. Connecting to Centric PLM, NetSuite, and the shared tech pack drive to pull reference data for context enrichment.",
        sources: [
          "Outlook — sourcing@company.com (31 unread)",
          "PLM (Centric) — Tech Packs & BOMs",
          "ERP (NetSuite) — Open POs",
          "Google Drive — Shared Tech Pack Folder",
        ],
      },
      {
        type: "data_pull",
        label: "Classifying emails and enriching with system context",
        detail:
          "Classified all 31 emails into categories:\n\n**Urgent (4)**\n• Huafeng — Quality hold on PO #91440. Shade variation on 2 colorways exceeding tolerance. Photos attached. Need response by EOD.\n• Pacific Garments — Factory requesting pattern correction on STY-3202 before they cut. Blocking production.\n• Samil Industries — Raw material price increase notification (+8% on nylon). Affects 7 open POs.\n• Lucky Textile — Container missed vessel cutoff. Next sailing in 5 days.\n\n**Action Required (12)**\n• 5 lab dip submissions for approval\n• 3 pre-production sample shipping confirmations\n• 2 requests for revised tech pack specs\n• 2 counter-proposals on pricing negotiations\n\n**Informational (15)**\n• 8 production milestone updates\n• 4 shipping document transmittals (B/Ls, packing lists)\n• 3 holiday/closure notices\n\nPulled matching POs, tech packs, and BOMs for all 31 emails to attach as reference.",
        sources: [
          "Centric PLM — 14 tech packs referenced",
          "NetSuite — 22 POs cross-referenced",
          "Google Drive — 6 BOM files matched",
        ],
      },
      {
        type: "reasoning",
        label: "Mapping emails to team members and drafting responses",
        detail:
          "Assigning based on style/supplier ownership matrix:\n\n• **Jenny Chen (Sr. PD)** — Huafeng quality hold (her supplier), 2 lab dip approvals, Samil price increase negotiation. 4 emails.\n• **Marcus Williams (PD)** — Pacific Garments pattern correction (his styles), 2 lab dip approvals, 1 tech pack revision. 4 emails.\n• **Priya Patel (Jr. PD)** — Lucky Textile vessel miss (her POs), 3 lab dip submissions for approval, 1 tech pack revision. 5 emails.\n• **Alex Torres (Logistics)** — Container/shipping docs, holiday notices. 7 emails.\n• **You** — Samil price increase (strategic decision), 2 pricing counter-proposals. 3 emails.\n• **Auto-file (no action)** — 8 milestone updates filed to PO records in NetSuite.\n\nDrafted responses for 6 routine items (sample confirmations, document acknowledgments). Flagged Priya's responses for your review since she's junior.",
      },
      {
        type: "human_input",
        label: "Review task assignments and junior PD responses",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the triage plan for your approval. I've also drafted 2 responses from Priya that need your review before going to factories.\n\n**Task Assignments (23 actionable emails):**\n- Jenny Chen: 4 emails (incl. urgent Huafeng quality hold)\n- Marcus Williams: 4 emails (incl. urgent Pacific Garments pattern block)\n- Priya Patel: 5 emails\n- Alex Torres: 7 emails (logistics/docs)\n- You: 3 emails (strategic pricing decisions)\n- Auto-filed: 8 milestone updates\n\n**Priya's Drafted Responses (for your review):**\n\n1. **To Lucky Textile re: missed vessel** — \"Hi Ms. Lam, Thanks for the update. Please book the next available sailing and send the revised B/L once confirmed. We'll update our receiving schedule. Can you also confirm the cargo is stored in a temperature-controlled facility until shipment? Best, Priya\"\n\n2. **To Dongguan Hua Mei re: lab dip submission** — \"Hi Kevin, Lab dips received for STY-3890 in 3 colorways. We'll review against the Pantone standards and respond within 48 hours. Best, Priya\"\n\nAre the assignments and drafted responses okay to send?",
        approvalButtons: [
          "Approve all assignments & responses",
          "Adjust assignments",
        ],
      },
      {
        type: "system_read",
        label: "Distributing tasks and sending responses",
        detail:
          "Forwarding emails to assigned team members with enriched context (attached POs, tech packs, BOMs). Creating Asana tasks for the 4 urgent items with EOD deadlines. Sending Priya's approved responses to Lucky Textile and Dongguan Hua Mei. Filing 8 milestone updates to corresponding PO records in NetSuite with timestamps.",
        sources: [
          "Outlook — 15 forwarded emails with context",
          "Asana — 4 urgent tasks created",
          "NetSuite — 8 PO milestone records updated",
          "Outlook — 2 supplier responses sent (Priya)",
        ],
      },
      {
        type: "result",
        label: "Email triage complete",
        detail:
          "31 supplier emails triaged and routed: 4 urgent items assigned with Asana tasks (EOD deadline), 12 action items distributed to team with reference docs attached, 8 milestone updates auto-filed in NetSuite, 2 routine responses sent on Priya's behalf (approved by you), and 3 strategic items queued for your direct response. Follow-up check scheduled for 4pm to verify Jenny and Marcus have addressed the urgent items.",
      },
    ],
    completionMessage:
      "31 emails triaged, contextualized, and distributed in minutes. That's usually 90 minutes of reading, cross-referencing, and forwarding every morning.",
  },
  {
    id: "multi-round-costing",
    title: "Run multi-round costing through development stages",
    subtitle:
      "Iterative supplier costing from directional estimate to final landed cost",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll manage the multi-round costing process for this style. This workflow spans the full development cycle, so I'll keep you updated at each decision point.\n\n1. Pull the pattern and design specs to request a directional cost estimate from the primary supplier\n2. Track costing through proto and counter-sourcing rounds, flagging when quotes exceed target margins\n3. Run the adoption round and negotiate final FOB, then build the fully landed cost with freight, duty, and overhead\n4. Enter the final landed cost into Centric PLM — you'll approve before the PO is cut\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read patterns, tech packs, and BOMs from PLM",
        "Read costing history and margin targets",
        "Generate cost comparison analyses",
        "Draft costing negotiation emails",
      ],
      requiresApproval: [
        "Send cost requests to suppliers",
        "Enter or update costs in Centric PLM",
        "Approve final FOB for PO creation",
        "Initiate counter-sourcing with alternate suppliers",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pulling design specs and costing parameters",
        detail:
          "Loading style STY-4500 (Men's Quilted Shirt Jacket) from Centric PLM. Design specs: quilted nylon shell with recycled polyester fill, snap front closure, 4 patch pockets, corduroy collar detail. Target retail: $148. Target margin: 68%. That means target landed cost must be at or below $47.36, and target FOB should be ~$28–32 depending on freight/duty assumptions.\n\nPrimary supplier for this category: Pacific Garments (HCMC). Secondary options: Zhenmei Textiles (Dongguan), Youngone (Bangladesh).",
        sources: [
          "PLM (Centric) — STY-4500 Tech Pack",
          "PLM (Centric) — BOM v1.0",
          "Costing Parameters — Fall '26 Margin Targets",
          "Vendor Matrix — Outerwear Category",
        ],
      },
      {
        type: "data_pull",
        label: "Round 1 — Directional cost received",
        detail:
          "Sent BOM and tech pack to Pacific Garments for directional pricing. Response received in 3 business days:\n\n• Fabric (quilted nylon + fill): $8.40/yd × 2.6 yd = $21.84\n• Trims (snaps, labels, corduroy collar, zipper): $3.20\n• Cut/Make/Finish (CMT): $9.50\n• **Directional FOB: $34.54**\n\nThis is $2.54–$6.54 above our $28–32 FOB target. The main driver is the quilted nylon with recycled fill at $8.40/yd — prior season's non-recycled version was $6.20/yd. The sustainability premium is adding ~$5.72 per unit.",
        sources: [
          "Outlook — Pacific Garments costing email",
          "Costing Spreadsheet — STY-4500 Round 1",
          "Prior Season Comparison — STY-3200 (similar style)",
        ],
      },
      {
        type: "reasoning",
        label: "Round 2 — Post-proto analysis and counter-sourcing decision",
        detail:
          "Proto sample received from Pacific Garments. Quality is strong — stitching, quilting pattern, and overall construction meet spec. However, at $34.54 FOB, the landed cost would be approximately $52.80 (adding $6.20 freight, $10.56 duty at 27.6%, $3.50 overhead). That puts us at a 64.3% margin — 3.7 points below target.\n\nOptions to close the gap:\n1. Negotiate CMT down — Pacific's $9.50 is high for HCMC. Comparable styles have been $7.80–8.50.\n2. Counter-source fabric — Hyosung recycled nylon at $7.10/yd would save $3.38/unit\n3. Counter-source garment — Send to Zhenmei and Youngone for competitive bids\n4. Reduce spec — Remove 2 pockets, switch corduroy collar to self-fabric. Saves ~$1.80.\n\nRecommendation: pursue options 1 and 2 in parallel. Counter-source the garment only if Pacific can't get below $31.",
      },
      {
        type: "human_input",
        label: "Approve counter-sourcing strategy",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "STY-4500 directional cost came in at **$34.54 FOB** — $2.54 above the high end of our target. Proto quality from Pacific Garments is good. Here's my recommended approach:\n\n**Primary path:** Negotiate with Pacific Garments\n- Push CMT from $9.50 to $8.20 (in line with HCMC benchmarks)\n- Switch quilted nylon sourcing to Hyosung recycled at $7.10/yd (saves $3.38/unit)\n- Combined savings target: ~$4.70/unit → revised FOB of ~$29.84\n\n**Backup path (if Pacific can't hit $31):**\n- Send to Zhenmei Textiles and Youngone for competitive garment bids\n- Timeline impact: adds 2 weeks to costing cycle\n\nShould I proceed with the primary negotiation path?",
        approvalButtons: [
          "Proceed with negotiation",
          "Go straight to counter-source",
        ],
      },
      {
        type: "data_pull",
        label: "Round 3 — Adoption costing finalized",
        detail:
          "Negotiation results from Pacific Garments after 2 rounds of emails and a Teams call:\n\n• Fabric: Switched to Hyosung recycled nylon at $7.10/yd × 2.6 yd = $18.46 (was $21.84)\n• Trims: Held at $3.20 (no change)\n• CMT: Negotiated to $8.40 (down from $9.50, split the difference from our $8.20 ask)\n• **Revised FOB: $30.06**\n\nLanded cost calculation:\n• FOB: $30.06\n• Ocean freight (FCL, Long Beach): $2.80/unit\n• Duty (HTS 6201.93, 27.6%): $8.30\n• Warehouse/handling: $1.20\n• Overhead allocation: $2.30\n• **Fully landed cost: $44.66**\n\nMargin at $148 retail: **69.8%** — exceeds the 68% target by 1.8 points.",
        sources: [
          "Outlook — Pacific Garments negotiation thread",
          "Teams — Call notes Mar 28",
          "Costing Spreadsheet — STY-4500 Round 3 Final",
          "Duty Calculator — HTS 6201.93",
        ],
      },
      {
        type: "human_input",
        label: "Approve final cost entry and PO readiness",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Costing is finalized for STY-4500 (Men's Quilted Shirt Jacket).\n\n**Final Cost Summary:**\n- FOB: **$30.06** (Pacific Garments, HCMC)\n- Fully Landed: **$44.66**\n- Retail: $148.00\n- Margin: **69.8%** (target: 68%)\n\n**Key negotiation wins:**\n- Fabric savings of $3.38/unit by switching to Hyosung recycled nylon\n- CMT reduction of $1.10/unit through benchmarking\n- Total savings vs. directional: $4.48/unit ($34.54 → $30.06)\n\nI'm ready to enter the final FOB ($30.06) into Centric PLM and mark this style as PO-ready. Should I proceed?",
        approvalButtons: ["Enter cost & mark PO-ready", "Hold for adjustment"],
      },
      {
        type: "result",
        label: "Costing finalized and entered in PLM",
        detail:
          "Final FOB of $30.06 entered in Centric PLM for STY-4500. Style marked as PO-ready with Pacific Garments (HCMC) as confirmed supplier. Costing history (all 3 rounds) archived in the costing spreadsheet. Notification sent to the PO creation workflow queue — this style will be included in the next PO batch for Pacific Garments.",
      },
    ],
    completionMessage:
      "Multi-round costing complete for STY-4500 — directional $34.54 negotiated down to $30.06 FOB, hitting 69.8% margin. Normally this takes 3–4 weeks of emails, calls, and spreadsheet updates across development stages.",
  },
  {
    id: "quantity-break-negotiation",
    title: "Negotiate quantity-based pricing tiers with supplier",
    subtitle:
      "Structured pricing requests across volume tiers with cost breakdowns",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the quantity-break negotiation workflow for this program. I'll structure the pricing request, analyze responses, and help you decide on the optimal volume commitment.\n\n1. Pull volume projections, MOQ/MCQ thresholds, and prior season pricing for the program\n2. Send a structured 3-tier pricing request to the supplier with specific quantity breakpoints\n3. Analyze the supplier's response, compare to prior season and competitive benchmarks, and model margin impact\n4. Present a recommendation with clear trade-offs at each tier — you'll approve the final pricing agreement\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read volume projections and buy plans",
        "Read prior season pricing and supplier history",
        "Read MOQ/MCQ thresholds from vendor agreements",
        "Generate pricing analysis and margin models",
      ],
      requiresApproval: [
        "Send pricing requests to suppliers",
        "Accept or counter pricing tiers",
        "Commit to volume levels",
        "Request cost breakdowns (cut/make, overhead, profit)",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pulling volume projections and pricing history",
        detail:
          "Loading the core knits program for Fall '26. This program covers 14 styles across basic tees, long-sleeves, and henleys — all produced at Huafeng Knitting (Hangzhou). Pulling data from buy plan, vendor agreement, and prior season actuals.\n\n• Fall '25 actual order: 42,000 units at $6.80 FOB (Tier 2 pricing)\n• Fall '26 projected buy: 38,000–55,000 units depending on early reads\n• MOQ per style: 500 units. MCQ per color: 200 units.\n• Huafeng standard surcharge below MOQ: 15%\n• Prior season tier breaks: Tier 1 (<30K): $7.20, Tier 2 (30–50K): $6.80, Tier 3 (>50K): $6.45",
        sources: [
          "Buy Plan — Fall '26 Core Knits",
          "Vendor Agreement — Huafeng Knitting",
          "Costing History — Fall '25 Core Knits",
          "ERP (NetSuite) — Prior Season PO Actuals",
        ],
      },
      {
        type: "reasoning",
        label: "Structuring the 3-tier pricing request",
        detail:
          "Designing the request around three realistic volume scenarios:\n\n• **Tier 1 (Conservative):** 38,000 units — this is the floor based on carry-over styles only. Below last season's 42K.\n• **Tier 2 (Base):** 48,000 units — reflects the planned buy with moderate new style adoption.\n• **Tier 3 (Upside):** 58,000 units — assumes strong early reads and reorder potential.\n\nI'll also request a cost breakdown at Tier 2 level (cut/make vs. fabric vs. overhead vs. profit) to understand where margin compression is happening. This gives us negotiation leverage if we need to push back — we can point to specific line items.\n\nBenchmark context: comparable programs at Samil Industries (Seoul) and Youngone (Bangladesh) quoted $6.20–$7.00 for similar jersey weights last season.",
      },
      {
        type: "human_input",
        label: "Approve pricing request before sending to supplier",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the structured pricing request I'll send to Huafeng Knitting (contact: David Luo, david.luo@huafeng.cn).\n\n**Request: Fall '26 Core Knits Program — 3-Tier Quantity Pricing**\n\n| Tier | Volume | Description |\n|---|---|---|\n| Tier 1 | 38,000 units | Conservative (carry-over only) |\n| Tier 2 | 48,000 units | Base plan |\n| Tier 3 | 58,000 units | Upside with reorders |\n\nAdditional requests:\n- Cost breakdown at Tier 2: fabric, cut/make, trims, overhead, profit\n- Sub-MOQ surcharge confirmation (currently 15% — still valid?)\n- Any raw material price changes since last season (cotton yarn +/- %?)\n\nTimeline: requesting response within 5 business days.\n\nShould I send this request?",
        approvalButtons: ["Send pricing request", "Modify tiers"],
      },
      {
        type: "data_pull",
        label: "Analyzing supplier pricing response",
        detail:
          "Huafeng responded in 4 business days. Here are their proposed tiers vs. last season:\n\n| Tier | Volume | Fall '25 Price | Fall '26 Quote | Change |\n|---|---|---|---|---|\n| Tier 1 | 38,000 | $7.20 | $7.50 | +4.2% |\n| Tier 2 | 48,000 | $6.80 | $7.10 | +4.4% |\n| Tier 3 | 58,000 | $6.45 | $6.75 | +4.7% |\n\n**Cost breakdown at Tier 2 (48K):**\n- Fabric (cotton jersey, 180gsm): $3.40 (+$0.30 vs. last season — cotton yarn up 9%)\n- Cut/Make: $2.10 (flat)\n- Trims (labels, tags, packaging): $0.45 (flat)\n- Overhead: $0.65 (+$0.05 — energy cost pass-through)\n- Profit: $0.50 (flat, 7% margin)\n- **Total: $7.10**\n\nSub-MOQ surcharge confirmed at 15%. No change.",
        sources: [
          "Outlook — Huafeng pricing response",
          "Costing Spreadsheet — Fall '26 vs. Fall '25 comparison",
          "Cotton Yarn Index — CCFI spot price data",
        ],
      },
      {
        type: "reasoning",
        label: "Modeling margin impact and counter-offer strategy",
        detail:
          "The 4.4% average increase is almost entirely driven by cotton yarn (+9%, accounting for $0.30 of the $0.30 increase). The CCFI cotton index confirms this — 32s combed cotton yarn is up ~8.5% YoY. The overhead pass-through ($0.05) is reasonable given China energy price trends. Profit margin held flat at 7%, which is fair.\n\nMargin impact at $148 retail (basic tee program at $48 retail, weighted avg):\n- Tier 1 ($7.50): landed ~$17.80, margin 62.9% — below 65% floor\n- Tier 2 ($7.10): landed ~$16.85, margin 64.9% — just under 65% floor\n- Tier 3 ($6.75): landed ~$16.02, margin 66.6% — meets target\n\nCounter-offer strategy: The fabric increase is market-driven and hard to push back on. But I'd recommend asking for:\n1. Tier 2 at $6.95 (split the cotton increase 50/50) — gets us to 65.3% margin\n2. Tier 3 threshold lowered to 52K from 58K — we're more likely to hit 52K\n3. Hold the sub-MOQ surcharge at 12% instead of 15% as a goodwill gesture\n\nIf Huafeng holds firm, the Tier 3 price is still workable at 66.6% margin, but we need confidence in hitting 58K units.",
      },
      {
        type: "human_input",
        label: "Approve counter-offer or accept pricing",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Huafeng's pricing is largely driven by the cotton yarn market (+9% YoY), which is verifiable. Here are your options:\n\n**Option A: Counter-offer** (recommended)\n- Tier 2: Request $6.95 instead of $7.10 (split the cotton increase)\n- Tier 3: Lower threshold to 52K units (more achievable than 58K)\n- Sub-MOQ surcharge: Request 12% instead of 15%\n- Rationale: Shows we've analyzed their breakdown and are being fair about market-driven increases\n\n**Option B: Accept Tier 3 at 58K**\n- Best price ($6.75) but requires committing to 58K units\n- Risk: Fall '25 actual was only 42K. Need high confidence in new style adoption.\n\n**Option C: Accept Tier 2 as-is at $7.10**\n- Safe volume commitment (48K) but margin is 64.9% — just below 65% floor\n- Would need to offset elsewhere (retail price adjustment or trim savings)\n\nWhich approach would you like to take?",
        approvalButtons: ["Send counter-offer (Option A)", "Accept Tier 3"],
      },
      {
        type: "result",
        label: "Pricing agreement reached",
        detail:
          "Counter-offer sent to Huafeng. After one round of negotiation, agreed terms:\n\n• Tier 1 (38K): $7.35 (down from $7.50)\n• Tier 2 (48K): $6.98 (down from $7.10 — close to our $6.95 ask)\n• Tier 3 (52K): $6.70 (threshold lowered from 58K, price adjusted from $6.75)\n• Sub-MOQ surcharge: 13% (compromise from 15%/12%)\n\nPricing tiers entered into the costing system and linked to the Fall '26 core knits buy plan. At Tier 2, margin is now 65.2% — above the 65% floor. Pricing agreement PDF archived in the vendor folder.",
      },
    ],
    completionMessage:
      "Quantity-break negotiation complete — 3-tier pricing agreed with Huafeng Knitting. Saved $0.12/unit at Tier 2 vs. initial quote, and lowered the Tier 3 threshold by 6,000 units. This negotiation cycle usually takes 2–3 weeks of email volleys.",
  },
  {
    id: "ebom-mbom-reconciliation",
    title: "Reconcile engineering and manufacturing BOMs",
    subtitle:
      "Cross-reference brand BOM with supplier manufacturing BOM for production readiness",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll reconcile the engineering BOM against the supplier's manufacturing BOM. Mismatches here can cause production defects, so I'll be thorough.\n\n1. Pull the brand engineering BOM from Centric PLM and the supplier's manufacturing BOM from their submission\n2. Map components line-by-line, flagging additions, omissions, and specification differences\n3. Identify manufacturing-only components the supplier added (wash chemicals, interlinings, etc.) and verify they meet brand standards\n4. Present the reconciled BOM for your approval before sending to the supplier as the final production BOM\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read engineering BOM from Centric PLM",
        "Read supplier manufacturing BOM submissions",
        "Read material standards and restricted substance lists",
        "Generate BOM comparison reports",
      ],
      requiresApproval: [
        "Approve supplier-added manufacturing components",
        "Send reconciled BOM to supplier",
        "Update BOM in Centric PLM",
        "Flag restricted substance concerns to compliance",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Loading both BOMs for comparison",
        detail:
          "Pulling the engineering BOM (eBOM) for STY-4120 (Women's Enzyme-Wash Denim Trucker Jacket) from Centric PLM — 24 line items covering shell fabric, lining, trims, labels, and packaging. Loading the manufacturing BOM (mBOM) submitted by Zhenmei Textiles via email — 41 line items. The mBOM has 17 additional components not in the eBOM, which is expected for a garment with enzyme wash and specialty finishing.",
        sources: [
          "PLM (Centric) — STY-4120 eBOM v2.1",
          "Outlook — Zhenmei mBOM submission (Excel attachment)",
          "Material Standards — Restricted Substance List (RSL) v8",
        ],
      },
      {
        type: "data_pull",
        label: "Line-by-line component mapping",
        detail:
          "Mapped all 24 eBOM components to their mBOM counterparts. Results:\n\n**Matched (19 of 24):** Shell denim (11oz rigid), cotton lining, YKK brass buttons (8), rivets (6), leather back patch, woven main label, care label, size label, hangtag, poly bag, tissue paper, and 7 other trims — all match spec.\n\n**Discrepancies (5 of 24):**\n1. Thread — eBOM specifies Coats Epic 120 (cotton-wrapped poly). mBOM shows Coats Dual Duty (all-purpose). Different tensile strength.\n2. Interfacing — eBOM specifies Freudenberg SF-6018 (woven fusible). mBOM shows a generic non-branded fusible. Could affect collar/cuff hand feel.\n3. Zipper — eBOM specifies YKK #5 Excella (brass). mBOM shows YKK #5 standard (nickel). Different finish and price point.\n4. Back pocket lining — eBOM specifies 100% cotton drill. mBOM shows 65/35 poly-cotton. Cost-saving substitution by factory.\n5. Snap buttons — eBOM specifies antique brass finish. mBOM shows standard brass. Different colorway.\n\n**Supplier-Added Manufacturing Components (17 items):**\nEnzyme wash chemicals, softener, anti-back-stain agent, cellulose enzyme concentrate, pumice stones, rinse agents, pressing steam supplies, fusible tape for seams, bartack reinforcement thread, pocketing stabilizer, and 7 others.",
        sources: [
          "Centric PLM — Component spec sheets",
          "Zhenmei mBOM — Manufacturing detail",
          "YKK Product Catalog — Excella vs. standard spec",
        ],
      },
      {
        type: "reasoning",
        label: "Analyzing discrepancies and manufacturing additions",
        detail:
          "Assessing each discrepancy by severity:\n\n**Must Fix (3):**\n1. Zipper — Excella brass was a deliberate design choice for the premium positioning. Nickel standard is a $0.40/unit cost save for the factory but changes the aesthetic. Non-negotiable.\n2. Snap buttons — Antique brass finish was selected to match the Excella zipper hardware. Standard brass won't match. Non-negotiable.\n3. Back pocket lining — Cotton drill is specified for hand-feel and sustainability claims (100% natural fiber marketing). Poly-cotton substitution invalidates the claim.\n\n**Acceptable with Note (2):**\n4. Thread — Coats Dual Duty is functionally equivalent for this application. Tensile difference is negligible on denim weight. Accept with note.\n5. Interfacing — The generic fusible needs a sample test. If hand-feel matches SF-6018, acceptable. If not, revert.\n\n**Manufacturing Additions — RSL Check:**\nCross-referenced all 17 supplier-added chemicals against the Restricted Substance List v8. The cellulose enzyme (Novozymes CelluSoft Ultra) is compliant. The anti-back-stain agent needs verification — checking the MSDS against ZDHC MRSL standards. All other additions are standard and compliant.",
      },
      {
        type: "human_input",
        label: "Approve reconciled BOM decisions",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the BOM reconciliation summary for STY-4120. I need your sign-off before I send the corrections to Zhenmei.\n\n**Corrections Required (send back to factory):**\n1. Zipper — Revert to YKK #5 Excella brass. Non-negotiable, design-critical.\n2. Snap buttons — Revert to antique brass finish to match hardware family.\n3. Pocket lining — Revert to 100% cotton drill. Required for sustainability claims.\n\n**Accepted Substitutions:**\n4. Thread — Coats Dual Duty accepted. Functionally equivalent.\n5. Interfacing — Conditionally accepted, pending hand-feel test on pre-production sample.\n\n**Manufacturing Additions:**\n- 16 of 17 supplier-added components are RSL-compliant and approved.\n- 1 item (anti-back-stain agent, Hunstman Dekol SN) needs ZDHC MRSL verification. I'll flag this to the compliance team.\n\nEstimated cost impact of corrections: +$0.85/unit (zipper upgrade is the main driver at +$0.40).\n\nShould I send the corrected BOM back to Zhenmei?",
        approvalButtons: [
          "Send corrections to Zhenmei",
          "Discuss zipper further",
        ],
      },
      {
        type: "system_read",
        label: "Updating PLM and sending reconciled BOM",
        detail:
          "Updated the eBOM in Centric PLM to v2.2, incorporating the 2 accepted substitutions and adding the 16 approved manufacturing components. The BOM now has 40 line items (was 24). Sent the reconciled BOM to Zhenmei with 3 correction requests highlighted in red. Flagged the anti-back-stain agent to the compliance team via Asana task with MSDS attached.",
        sources: [
          "PLM (Centric) — STY-4120 eBOM v2.2",
          "Outlook — Reconciled BOM sent to Zhenmei",
          "Asana — Compliance review task created",
        ],
      },
      {
        type: "result",
        label: "BOM reconciliation complete",
        detail:
          "Engineering and manufacturing BOMs reconciled for STY-4120. 3 factory substitutions rejected and sent back for correction (zipper, snaps, pocket lining). 2 substitutions accepted. 16 manufacturing-only components approved and added to PLM. 1 chemical flagged for compliance review. Zhenmei has been asked to confirm corrections within 3 business days. Follow-up reminder set for Thursday.",
      },
    ],
    completionMessage:
      "BOM reconciliation complete — caught 3 unauthorized substitutions that would have affected product quality and sustainability claims. This manual comparison usually takes a full afternoon with printed BOMs side by side.",
  },
  {
    id: "wip-tracking",
    title: "Track work-in-progress milestones across suppliers",
    subtitle:
      "Production milestone monitoring with exception flagging and PO updates",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the WIP tracking workflow across all active suppliers. I'll flag any milestones that are slipping and recommend PO adjustments where needed.\n\n1. Pull all active POs with production milestones and connect to supplier status update channels\n2. Compare reported milestone dates against planned dates and calculate variance for each PO\n3. Flag exceptions — any milestone slipping more than 3 days — and assess impact on ship dates\n4. Present exception report with recommended PO modifications for your review\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read PO milestones from NetSuite",
        "Read supplier WIP status updates from email and portals",
        "Calculate milestone variance and downstream impact",
        "Generate exception reports",
      ],
      requiresApproval: [
        "Update milestone dates in NetSuite",
        "Modify PO ship dates or quantities",
        "Send follow-up requests to suppliers",
        "Escalate delayed POs to management",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Loading active POs and milestone templates",
        detail:
          "Pulling all POs in production status from NetSuite. Found 34 active POs across 9 suppliers with standard milestone tracking: (1) Fabric in-house, (2) Cutting start, (3) Sewing start, (4) Sewing complete, (5) Wash/finish, (6) Final QC, (7) Pack/ship. Loading supplier WIP updates from email and the Zhenmei/Pacific Garments vendor portals.",
        sources: [
          "ERP (NetSuite) — 34 active POs in production",
          "Zhenmei Vendor Portal — WIP dashboard",
          "Pacific Garments Portal — Production tracker",
          "Outlook — Supplier WIP update emails (last 7 days)",
        ],
      },
      {
        type: "data_pull",
        label: "Collecting and reconciling milestone status",
        detail:
          "Reconciled milestone status across all 34 POs. Data sources are inconsistent — 3 suppliers report via portal, 4 via weekly email, and 2 only update when prompted.\n\nOverall status:\n• **On Track (24 POs):** All milestones within 3-day tolerance\n• **Minor Delay (6 POs):** 1–2 milestones slipping 3–5 days\n• **Significant Delay (3 POs):** Milestones slipping >5 days\n• **No Update (1 PO):** Lucky Textile hasn't reported in 12 days on PO #90880\n\nSignificant delays:\n1. PO #91440 (Huafeng, knit polos) — Fabric in-house delayed 8 days. Dye lot failed first attempt, re-dyeing in progress. Cascading all downstream milestones.\n2. PO #90772 (Samil, woven pants) — Cutting delayed 6 days. Factory prioritized another brand's urgent order. Our sewing hasn't started.\n3. PO #89950 (Zhenmei, denim jackets) — Wash/finish delayed 7 days. Equipment maintenance on enzyme wash machines. QC and ship dates at risk.",
        sources: [
          "Zhenmei Portal — 8 POs updated",
          "Pacific Garments Portal — 11 POs updated",
          "Outlook — WIP emails from 6 suppliers",
          "NetSuite — Milestone planned dates",
        ],
      },
      {
        type: "reasoning",
        label: "Analyzing downstream impact of significant delays",
        detail:
          "Modeling the cascade effect for the 3 significantly delayed POs:\n\n**PO #91440 (Huafeng, knit polos, $62K)**\nFabric re-dye adds 8 days. Factory says they can compress sewing timeline by adding a second line, recovering 3 days. Net slip: 5 days. Original ship date Apr 5 → revised Apr 10. This still makes the vessel cutoff on Apr 12 from Shanghai, so ocean transit is unaffected. DC receipt slips from Apr 20 to Apr 25.\n\n**PO #90772 (Samil, woven pants, $44K)**\n6-day cutting delay is a capacity allocation issue. Samil deprioritized our order. If they start cutting by Monday (Mar 23), sewing can begin Mar 28 and complete by Apr 8. Ship date slips from Apr 2 to Apr 12 — misses the Apr 8 vessel cutoff, next sailing Apr 15. DC receipt slips from Apr 17 to Apr 30. This impacts the Spring basics restock.\n\n**PO #89950 (Zhenmei, denim jackets, $118K)**\nWash equipment back online tomorrow per Zhenmei portal. 7-day delay at wash, but QC and packing can overlap to recover 2 days. Net slip: 5 days. Ship date Apr 8 → Apr 13. Catches the Apr 15 vessel from Yantian. DC receipt slips from Apr 22 to Apr 29.\n\n**PO #90880 (Lucky Textile, no update, $28K)**\nNo WIP update in 12 days is a red flag. Last known status: fabric in-house. Need to contact them immediately.",
      },
      {
        type: "human_input",
        label: "Review exception report and approve actions",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the WIP exception report for the week. 3 POs have significant delays and 1 supplier is unresponsive.\n\n**Significant Delays:**\n\n| PO | Supplier | Issue | Ship Slip | Value | DC Impact |\n|---|---|---|---|---|---|\n| #91440 | Huafeng | Dye lot failure, re-dyeing | +5 days | $62K | Apr 20→25 |\n| #90772 | Samil | Deprioritized our order | +10 days | $44K | Apr 17→30 |\n| #89950 | Zhenmei | Wash equipment down | +5 days | $118K | Apr 22→29 |\n\n**Unresponsive:**\n| #90880 | Lucky Textile | No update in 12 days | Unknown | $28K | Unknown |\n\n**Recommended Actions:**\n1. **PO #91440** — Accept 5-day slip. No PO change needed, makes vessel cutoff.\n2. **PO #90772** — Escalate to Samil management. A 10-day slip because they deprioritized us is unacceptable. Request a formal recovery plan by EOD Friday.\n3. **PO #89950** — Accept 5-day slip. Update ship date in NetSuite.\n4. **PO #90880** — Send urgent status request to Lucky Textile with 24-hour response deadline.\n\nShould I proceed with these actions?",
        approvalButtons: ["Proceed with all actions", "Adjust recommendations"],
      },
      {
        type: "system_read",
        label: "Updating POs and sending supplier communications",
        detail:
          "Updated NetSuite milestone dates for POs #91440, #90772, and #89950. Added variance notes and delay reason codes. Sent escalation email to Samil Industries GM (Mr. Kim Dong-Hyun) requesting a formal recovery plan with daily WIP updates until PO #90772 ships. Sent urgent status request to Lucky Textile (Ms. Lam) with 24-hour deadline on PO #90880. Updated the 6 minor-delay POs with revised milestone dates (no ship date impact).",
        sources: [
          "ERP (NetSuite) — 9 POs updated",
          "Outlook — Samil escalation email sent",
          "Outlook — Lucky Textile urgent request sent",
          "Asana — Follow-up tasks created",
        ],
      },
      {
        type: "result",
        label: "WIP tracking cycle complete",
        detail:
          "Weekly WIP tracking complete across 34 active POs. 24 on track, 6 minor delays (milestone dates updated, no ship impact), 3 significant delays (POs updated, suppliers contacted), 1 unresponsive supplier (urgent request sent with 24-hour deadline). Samil escalation sent to GM level. Exception report saved to the shared WIP folder. Next tracking cycle scheduled for next Wednesday.",
      },
    ],
    completionMessage:
      "WIP tracking complete — 34 POs monitored, 3 significant delays caught and actioned, 1 unresponsive supplier escalated. This weekly check normally takes 3+ hours of portal logins, email scanning, and spreadsheet updating.",
  },
  {
    id: "moq-mcq-compliance",
    title: "Check buy quantities against MOQ and MCQ thresholds",
    subtitle:
      "Pre-PO validation of order quantities against factory minimums",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll validate the buy plan against all MOQ and MCQ thresholds before POs are cut. Better to catch shortfalls now than get surcharges or factory rejections later.\n\n1. Load the finalized buy quantities by style, color, and size from the buy plan\n2. Pull MOQ (minimum order quantity) and MCQ (minimum color quantity) thresholds for each factory from vendor agreements\n3. Run compliance checks at the style, color, and factory level — flagging any lines that fall below minimums\n4. Present a pass/fail report with surcharge estimates and consolidation options for your review\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read buy plan quantities from planning system",
        "Read MOQ/MCQ thresholds from vendor agreements",
        "Read factory allocation data",
        "Generate compliance reports",
      ],
      requiresApproval: [
        "Recommend buy quantity adjustments",
        "Apply surcharge flags to PO lines",
        "Consolidate styles or colors across POs",
        "Send exception report to planning team",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Loading buy plan and factory thresholds",
        detail:
          "Loading the Fall '26 finalized buy plan from the planning system. Total: 148 styles, 612 style-color combinations, 4,896 style-color-size SKUs across 12 factories. Pulling MOQ and MCQ thresholds from each factory's vendor agreement...\n\nFactory minimums loaded:\n• Zhenmei Textiles: MOQ 500/style, MCQ 200/color\n• Pacific Garments: MOQ 600/style, MCQ 250/color\n• Huafeng Knitting: MOQ 300/style, MCQ 150/color\n• Samil Industries: MOQ 500/style, MCQ 200/color\n• Lucky Textile: MOQ 400/style, MCQ 150/color\n• 7 other factories: various thresholds loaded",
        sources: [
          "Planning System — Fall '26 Buy Plan (Final)",
          "Vendor Agreements — 12 factory MOQ/MCQ schedules",
          "Factory Allocation — Style-to-factory mapping",
        ],
      },
      {
        type: "data_pull",
        label: "Running compliance checks across all PO lines",
        detail:
          "Validated 612 style-color combinations against factory-specific thresholds. Results:\n\n**Style-Level MOQ Check (148 styles):**\n• Pass: 131 styles (88.5%)\n• Fail: 17 styles below factory MOQ\n\n**Color-Level MCQ Check (612 style-colors):**\n• Pass: 574 combinations (93.8%)\n• Fail: 38 combinations below factory MCQ\n\n**Worst offenders:**\n• STY-4055 (linen camp shirt) at Samil — Total buy: 320 units vs. 500 MOQ. 4 colors, smallest color (Sage) at only 55 units vs. 200 MCQ.\n• STY-4210 (merino crewneck) at Zhenmei — Total buy: 410 units vs. 500 MOQ. 3 colors all under 200 MCQ individually.\n• STY-4088 (corduroy overshirt) at Pacific — Total buy: 480 units vs. 600 MOQ. Close but under.\n• 14 additional styles with minor MOQ shortfalls (within 15% of threshold)",
        sources: [
          "Planning System — Buy quantities by SKU",
          "Vendor Agreements — Threshold matrix",
          "Compliance Calculator — Pass/fail logic",
        ],
      },
      {
        type: "reasoning",
        label: "Analyzing consolidation options and surcharge impact",
        detail:
          "Categorizing the 17 MOQ failures into resolution buckets:\n\n**Can Consolidate (6 styles):**\nThese styles are split across 2 factories — combining into a single factory would clear MOQ. Example: STY-4088 has 480 units at Pacific but another 220 units of a similar fabric at Zhenmei. Consolidating to Pacific = 700 units (clears 600 MOQ).\n\n**Near-Miss — Bump Up (5 styles):**\nWithin 15% of MOQ. Can increase buy by 1–2 units per size to clear. Total incremental units needed: ~380 units across 5 styles. Incremental cost: ~$3,200. Planning may accept this as safety stock.\n\n**Deep Under — Surcharge (4 styles):**\nMore than 25% below MOQ. Surcharge is the most practical path. At avg 15% surcharge, incremental cost:\n• STY-4055 (linen camp shirt): 320 units × $12.40 FOB × 15% = $595 surcharge\n• STY-4210 (merino crewneck): 410 units × $18.60 × 15% = $1,144 surcharge\n• STY-4290 (silk-blend blouse): 180 units × $24.00 × 15% = $648 surcharge\n• STY-4315 (cashmere beanie): 150 units × $22.00 × 15% = $495 surcharge\nTotal surcharge exposure: $2,882\n\n**Drop Consideration (2 styles):**\nSTY-4315 (cashmere beanie, 150 units) and STY-4290 (silk-blend blouse, 180 units) are so far below MOQ that even with surcharge, the unit economics are poor. May be better to drop or combine into a different program.\n\n**MCQ Failures (38 color-level):**\n22 of 38 are resolved by the MOQ fixes above. Remaining 16 are individual colors with low demand — mostly XS/XXL sizes in less popular colors. Recommend either dropping these color-sizes or distributing units across fewer colors.",
      },
      {
        type: "human_input",
        label: "Review compliance report and approve resolution plan",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "MOQ/MCQ compliance check complete. Here's the summary and my recommended resolution plan.\n\n**Overall: 131 of 148 styles pass (88.5%). 17 need action.**\n\n| Resolution | Styles | Action | Cost Impact |\n|---|---|---|---|\n| Consolidate factories | 6 | Move units to single factory | None |\n| Bump up buy | 5 | Add ~380 units total | +$3,200 (safety stock) |\n| Accept surcharge | 4 | Pay 15% surcharge | +$2,882 |\n| Consider dropping | 2 | STY-4315, STY-4290 | Saves $6,480 in buys |\n\n**MCQ Failures:** 38 color-level, 22 resolved by MOQ fixes. Remaining 16 recommend dropping lowest-demand colors (avg 40 units each).\n\n**Total surcharge exposure if all proceed: $2,882**\n**Total incremental buy if bumping: $3,200**\n\nShould I send this compliance report to the planning team with these recommendations?",
        approvalButtons: [
          "Send report to planning",
          "Adjust recommendations",
        ],
      },
      {
        type: "system_read",
        label: "Distributing compliance report and flagging PO lines",
        detail:
          "Compliance report formatted and sent to the planning team (planning-team@company.com) and sourcing leads. Flagged the 17 non-compliant styles in the buy plan system with resolution codes: CONSOLIDATE (6), BUMP (5), SURCHARGE (4), DROP-REVIEW (2). Added surcharge flags to the 4 applicable PO lines in the pre-PO staging queue. MCQ failures marked with color-drop recommendations.",
        sources: [
          "Planning System — 17 styles flagged",
          "Outlook — Compliance report sent",
          "PO Staging Queue — Surcharge flags added",
        ],
      },
      {
        type: "result",
        label: "MOQ/MCQ compliance check complete",
        detail:
          "Pre-PO compliance check complete for 148 styles across 12 factories. 131 styles pass outright. 17 styles flagged with specific resolution paths: 6 to consolidate, 5 to bump up, 4 to accept surcharge ($2,882 total), 2 recommended for drop review. 16 residual MCQ color failures flagged for planning decision. Report distributed to planning and sourcing teams. Recommend resolving all flags before PO creation workflow runs next Tuesday.",
      },
    ],
    completionMessage:
      "MOQ/MCQ compliance validated across 148 styles and 612 color combinations. 17 exceptions caught before POs were cut — preventing factory rejections and surprise surcharges. This check normally takes a full day of cross-referencing buy plans against vendor agreements.",
  },
  {
    id: "late-item-chargeback",
    title: "Process chargebacks for late vendor deliveries",
    subtitle:
      "Automated late-delivery detection with contract penalty enforcement",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the late-delivery chargeback workflow. This workflow has pre-authorized read access to your ERP, vendor portal, receiving logs, and contract management system. I can detect late shipments and calculate penalties automatically, but issuing chargebacks or contacting vendors requires your sign-off.\n\n1. Pull PO ship dates and actual receiving dates from ERP and warehouse systems (pre-authorized, read-only)\n2. Cross-reference against vendor contract penalty terms\n3. Calculate chargeback amounts and identify any previously missed penalties\n4. Prepare chargeback notices — you'll approve before anything is sent\n\nLet me start scanning for late deliveries.",
    permissions: {
      autoApproved: [
        "Read PO data and ship dates from ERP",
        "Read receiving logs from WMS",
        "Read vendor contract terms and penalty schedules",
      ],
      requiresApproval: [
        "Issue chargeback debit memos",
        "Send vendor notifications",
        "Update vendor scorecards",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to procurement and warehouse systems",
        detail:
          "Authenticating via pre-configured service accounts to ERP, WMS, and vendor portal. All connections are read-only — no data will be modified.",
        sources: [
          "ERP (SAP S/4HANA)",
          "WMS (Blue Yonder)",
          "Vendor Portal (Coupa)",
          "Contract Management (Icertis)",
          "Accounts Payable (SAP)",
        ],
      },
      {
        type: "data_pull",
        label: "Scanning POs for late deliveries",
        detail:
          "Checked 147 POs with delivery dates in the last 30 days. Found 9 POs with late deliveries across 4 vendors:\n\n• **PO-88412** (Jiangsu Textile Co.) — 12,000 units of cotton twill, due Mar 2, received Mar 11. 9 days late.\n• **PO-88455** (Jiangsu Textile Co.) — 8,500 units of stretch denim, due Mar 5, received Mar 14. 9 days late.\n• **PO-87930** (Nha Trang Garments) — 6,200 units of men's chinos, due Feb 28, received Mar 7. 7 days late.\n• **PO-88201** (Aksara Knitting, Indonesia) — 4,800 units of performance polo, due Mar 8, still not received (10+ days late).\n• 5 additional POs from Sunrise Apparel (Bangladesh) — all 2-3 days late, minor delays.",
        sources: [
          "SAP S/4HANA — PO Delivery Report",
          "Blue Yonder WMS — Receiving Timestamps",
          "Coupa — ASN Records",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling contract penalty terms",
        detail:
          "Retrieved penalty schedules from Icertis for all 4 vendors:\n\n• **Jiangsu Textile Co.** — Contract #VND-2024-0087: 2% of PO value per week late, capped at 10%. Grace period: 3 days. Both POs qualify (9 days late = 1 week penalty after grace). PO-88412 value: $216,000 → $4,320 penalty. PO-88455 value: $148,750 → $2,975 penalty.\n• **Nha Trang Garments** — Contract #VND-2024-0134: 1.5% per week, no cap. Grace period: 5 days. PO-87930 value: $93,000 → $1,395 penalty (2 days over grace = 1 week).\n• **Aksara Knitting** — Contract #VND-2023-0211: 3% per week, capped at 15%. No grace period. PO-88201 value: $67,200 → $2,016/week, currently at $4,032 (2 weeks).\n• **Sunrise Apparel** — Contract #VND-2024-0156: 1% per week, 5-day grace. All 5 POs within grace period — no penalty applies.\n\nTotal chargebacks pending: **$12,722**.",
        sources: [
          "Icertis — Vendor Contracts",
          "SAP — PO Values",
        ],
      },
      {
        type: "reasoning",
        label: "Checking for previously missed chargebacks",
        detail:
          "Cross-referencing AP records against late deliveries from the past 90 days. Found 3 missed chargebacks that were never processed:\n\n• **PO-86744** (Jiangsu Textile Co.) — Delivered Jan 18, was 11 days late. Penalty: $5,100. No debit memo on file.\n• **PO-87102** (Aksara Knitting) — Delivered Feb 4, was 8 days late. Penalty: $3,360. No debit memo on file.\n• **PO-86990** (Nha Trang Garments) — Delivered Feb 12, was 6 days late. Penalty: $1,890. No debit memo on file.\n\nThese 3 missed chargebacks total **$10,350** in uncollected penalties. Combined with current period: **$23,072** in total actionable chargebacks.\n\nJiangsu Textile has a pattern — 4 late deliveries in 90 days. Recommend flagging for vendor performance review alongside the chargebacks.",
      },
      {
        type: "human_input",
        label: "Approve chargeback issuance",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the chargeback summary for your approval. Issuing debit memos and sending vendor notifications both require sign-off.\n\n**Current Period (9 POs reviewed, 4 with penalties):**\n• Jiangsu Textile Co. — 2 POs — $7,295\n• Nha Trang Garments — 1 PO — $1,395\n• Aksara Knitting — 1 PO — $4,032 (still accumulating)\n\n**Previously Missed (3 chargebacks never processed):**\n• Jiangsu Textile Co. — $5,100\n• Aksara Knitting — $3,360\n• Nha Trang Garments — $1,890\n\n**Total: $23,072** in debit memos to issue\n\nI'll also flag Jiangsu Textile for vendor performance review (4 late deliveries in 90 days). Shall I proceed?",
        approvalButtons: ["Issue all chargebacks", "Let me review individually"],
      },
      {
        type: "result",
        label: "Chargebacks issued and vendors notified",
        detail:
          "7 debit memos created in SAP AP totaling $23,072. Vendor notification emails sent via Coupa portal with penalty breakdowns and supporting documentation (ASN timestamps, receiving logs). Jiangsu Textile flagged for quarterly vendor performance review. Aksara Knitting PO-88201 set to auto-recalculate penalty weekly until delivery is confirmed. Dashboard updated with late-delivery trend data.",
      },
    ],
    completionMessage:
      "Chargeback cycle complete — $23,072 in penalties identified (including $10,350 previously missed), debit memos issued, and repeat offender flagged for review.",
  },
  {
    id: "email-triage-assignment",
    title: "Triage and assign inbound supplier messages",
    subtitle:
      "Multi-channel message routing with deadline tracking across email, WhatsApp, and Slack",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the supplier message triage workflow. This workflow has pre-authorized read access to your email, WhatsApp Business, Slack channels, and team calendar. I can categorize and prioritize messages automatically, but assigning tasks to team members and setting deadlines requires your sign-off.\n\n1. Ingest and categorize all inbound supplier messages across email, WhatsApp, and Slack (pre-authorized, read-only)\n2. Identify urgency levels and required actions for each thread\n3. Draft assignments with suggested deadlines based on team workload\n4. Route assignments to team members — you'll approve the assignments before they go out\n\nLet me start scanning your inboxes.",
    permissions: {
      autoApproved: [
        "Read inbound emails from supplier domains",
        "Read WhatsApp Business message threads",
        "Read Slack supplier channels",
        "Read team calendar and workload",
      ],
      requiresApproval: [
        "Assign tasks to team members",
        "Send reply acknowledgments to suppliers",
        "Set deadlines in project tracker",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to messaging channels",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no messages will be sent or modified.",
        sources: [
          "Email (Outlook / Exchange)",
          "WhatsApp Business API",
          "Slack (supplier channels)",
          "Team Calendar (Outlook)",
          "Project Tracker (Monday.com)",
        ],
      },
      {
        type: "data_pull",
        label: "Ingesting 53 unprocessed supplier threads",
        detail:
          "Pulled messages from the last 48 hours across all channels:\n\n• **Email**: 31 threads from 18 suppliers (sourcing@, production@, logistics@ inboxes)\n• **WhatsApp**: 14 threads from 9 suppliers (mostly APAC factories — faster response expected)\n• **Slack #supplier-comms**: 8 threads from internal team relaying supplier questions\n\nOldest unread message is 41 hours old (from Yantai Huasheng, re: lab dip approval for SS26 collection). 7 threads are flagged high-priority by sender or contain keywords like \"urgent,\" \"deadline,\" or \"cancellation.\"",
        sources: [
          "Outlook — sourcing@, production@, logistics@",
          "WhatsApp Business — APAC Supplier Group",
          "Slack — #supplier-comms, #production-updates",
        ],
      },
      {
        type: "reasoning",
        label: "Categorizing and prioritizing messages",
        detail:
          "Categorized all 53 threads into action buckets:\n\n**Critical (respond within 4 hours) — 7 threads:**\n• Yantai Huasheng — lab dip approval needed or SS26 fabric booking deadline missed (tomorrow)\n• Pratibha Syntex (India) — strike at dyeing facility, 3 POs at risk ($412K total)\n• Li & Fung — shipping docs for PO-89102 have customs discrepancy, container held at port\n• Macy's compliance team CC'd — asking about ASN for PO-MCS-7745\n\n**Needs reply within 24 hours — 19 threads:**\n• 6 threads re: price confirmations for FW26 development\n• 5 threads re: shipment ETAs and booking confirmations\n• 4 threads re: quality inspection results (2 with minor defects)\n• 4 threads re: payment status inquiries\n\n**Informational / Low priority — 27 threads:**\n• Factory holiday notices, capacity updates, trade show invitations, newsletter-style updates\n\nTeam availability check: Sarah is out today (PTO). Marcus has 3 open critical items already. Priya and James have bandwidth.",
      },
      {
        type: "human_input",
        label: "Approve triage assignments",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here are the proposed assignments. Task creation and deadline setting require your approval.\n\n**Critical — 4-hour deadline:**\n• Yantai Huasheng lab dip → **Priya** (she owns SS26 fabric development)\n• Pratibha Syntex strike impact → **You** (escalation needed, $412K exposure)\n• Li & Fung customs docs → **James** (he handled the original booking)\n• Macy's ASN inquiry → **James** (same PO family)\n\n**24-hour deadline (19 threads):**\n• Price confirmations (6) → **Priya** (4) and **Marcus** (2, his vendors)\n• Shipment ETAs (5) → **James** (logistics lead)\n• QA results (4) → **Priya** (2) and **Marcus** (2)\n• Payment inquiries (4) → **Finance team** via Slack\n\n**Low priority (27 threads):** Auto-filed, no assignment needed.\n\nShall I create these assignments in Monday.com and send acknowledgment replies to the critical suppliers?",
        approvalButtons: [
          "Assign all and notify suppliers",
          "Let me adjust assignments",
        ],
      },
      {
        type: "data_pull",
        label: "Creating assignments and sending acknowledgments",
        detail:
          "Created 26 tasks in Monday.com with deadlines and thread links. Sent auto-acknowledgment replies to the 7 critical-priority suppliers confirming receipt and providing a team contact name. Tagged assigned team members in relevant Slack threads. Payment inquiry threads forwarded to #accounts-payable with supplier context attached.",
        sources: [
          "Monday.com — Task Board",
          "Outlook — Auto-replies Sent",
          "Slack — Team Notifications",
        ],
      },
      {
        type: "result",
        label: "All 53 threads triaged and routed",
        detail:
          "53 supplier threads processed: 7 critical (4-hour SLA), 19 standard (24-hour SLA), 27 auto-filed. 26 tasks created in Monday.com across 4 team members. Acknowledgment replies sent to all critical suppliers. Deadline tracking enabled — I'll flag any assignments that approach their SLA without a response.",
      },
    ],
    completionMessage:
      "Supplier inbox zero achieved — 53 threads triaged, 26 tasks assigned with deadlines, and critical suppliers acknowledged within minutes.",
  },
  {
    id: "exception-delay-hindsighting",
    title: "Hindsight a missed deadline to identify root cause",
    subtitle:
      "Communication trace-back with root cause documentation and process improvement",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the delay hindsighting workflow. This workflow has pre-authorized read access to your email, Slack, PLM, calendar, and production tracking systems. I can trace communications and build a timeline automatically, but documenting root cause findings and recommending process changes requires your sign-off.\n\n1. Pull the original milestone timeline and identify the missed deadline (pre-authorized, read-only)\n2. Trace back through all communications to build a day-by-day timeline of what happened\n3. Identify the root cause and assess downstream impact on dependent milestones\n4. Draft a root cause report with process improvement recommendations — you'll approve before it's shared\n\nLet me start building the timeline.",
    permissions: {
      autoApproved: [
        "Read email threads related to the PO/style",
        "Read Slack messages in supplier and production channels",
        "Read PLM milestone and calendar data",
        "Read production tracking system",
      ],
      requiresApproval: [
        "Publish root cause report",
        "Update process documentation",
        "Send findings to stakeholders",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to communication and tracking systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no records will be modified.",
        sources: [
          "Email (Outlook)",
          "Slack (production channels)",
          "PLM (Centric PLM)",
          "Production Tracker (internal)",
          "Calendar (Outlook)",
          "Vendor Portal (supplier comms)",
        ],
      },
      {
        type: "data_pull",
        label: "Identifying the missed deadline",
        detail:
          "Style MN-4420 (men's quilted vest, FW26 collection) missed its proto sample approval deadline by 18 days. Original milestone: proto approval by Feb 14. Actual approval: Mar 4. This style is for Nordstrom's fall floor-set with a hard ship date of Aug 15 — the 18-day delay compresses every downstream milestone.\n\nCentric PLM shows 6 dependent milestones now at risk: fit sample (was Mar 1, now pushed to Mar 19), fabric booking (was Mar 7, now TBD), size set (was Apr 1, now TBD), PP sample (was May 1, now TBD), production start (was Jun 1, now TBD), and ship date (Aug 15, hard deadline).",
        sources: [
          "Centric PLM — Style MN-4420 Milestones",
          "Production Tracker — FW26 Timeline",
        ],
      },
      {
        type: "data_pull",
        label: "Tracing communications timeline",
        detail:
          "Built a day-by-day timeline from 47 messages across email, Slack, and vendor portal:\n\n• **Jan 10** — Proto sample request sent to Shenzhen Grandway Apparel. 4-week lead time agreed.\n• **Jan 24** — Supplier emails: quilted fabric from sub-supplier delayed, new ETA Feb 5. No escalation internally.\n• **Jan 28** — Slack #fw26-development: designer asks for status. Sourcing associate replies \"on track\" (did not relay supplier delay).\n• **Feb 5** — Supplier sends proto, but quilting pattern is wrong (horizontal vs. diamond). Designer rejects same day via email.\n• **Feb 6** — Sourcing associate forwards rejection. Supplier says 10 days for redo.\n• **Feb 7–14** — No follow-up from either side. Deadline passes.\n• **Feb 18** — Production manager notices missed deadline in weekly report, escalates.\n• **Feb 19** — Supplier confirms they hadn't started the redo — misunderstood the rejection as a \"comment\" not a hard reject.\n• **Feb 20** — Corrected proto rushed, 10-day turnaround.\n• **Mar 2** — Corrected proto received. **Mar 4** — Approved.",
        sources: [
          "Outlook — 23 emails, Shenzhen Grandway thread",
          "Slack — #fw26-development, 18 messages",
          "Vendor Portal — 6 messages",
        ],
      },
      {
        type: "reasoning",
        label: "Analyzing root cause and downstream impact",
        detail:
          "**Root Cause: Communication breakdown at two points.**\n\n1. **Jan 24 — Supplier delay not escalated internally.** The sourcing associate received the fabric delay notice but did not update PLM or notify the team. Four days later, when asked directly, they reported \"on track.\" If escalated immediately, the team could have sourced alternative quilted fabric (2 domestic options were available with 5-day lead time, ~$0.80/yd premium).\n\n2. **Feb 6 — Rejection not clearly communicated to supplier.** The email said \"this isn't what we need — see attached markup.\" Supplier interpreted this as feedback for next order, not a redo request. A clear \"REJECTED — please remake per attached specs, confirm new ship date\" would have prevented the 12-day gap.\n\n**Downstream Impact:**\nWith the 18-day compression, the Nordstrom Aug 15 ship date is achievable only if: (a) fit sample is approved first pass, (b) fabric is booked this week, and (c) production gets 2 weeks compressed via overtime ($8,200 premium). If any further delay occurs, the ship date is at risk — and Nordstrom's late-delivery penalty is 5% of the $340K order ($17,000).",
      },
      {
        type: "human_input",
        label: "Approve root cause report and process changes",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the root cause report and recommended process improvements. Publishing the report and updating SOPs require your approval.\n\n**Root Cause Summary:**\n1. Supplier fabric delay (Jan 24) not escalated — sourcing associate did not update PLM or team\n2. Sample rejection (Feb 6) ambiguously communicated — supplier didn't start redo for 13 days\n\n**Recommended Process Changes:**\n• Require PLM milestone status update within 24 hours of any supplier delay notification\n• Standardize rejection email template with clear \"REJECTED / REDO REQUIRED\" header and required response fields\n• Add automated PLM alert when milestone is within 5 days of deadline with no status update\n\n**Recovery Plan for MN-4420:**\n• Book fabric this week (Jiangsu Huayi, $0.80/yd premium, $2,400 total)\n• Authorize production overtime ($8,200) to compress 2 weeks\n• Total recovery cost: $10,600 to protect $340K Nordstrom order\n\nShall I publish this report and update the process documentation?",
        approvalButtons: [
          "Publish report and update SOPs",
          "Let me edit the findings first",
        ],
      },
      {
        type: "result",
        label: "Root cause documented and process improvements filed",
        detail:
          "Root cause report published to the FW26 shared drive and linked in Centric PLM against style MN-4420. Process improvement tickets created: (1) PLM auto-alert rule configured for 5-day milestone warning, (2) rejection email template drafted and added to SOP library, (3) escalation protocol updated to require same-day PLM update on supplier delays. Recovery plan for MN-4420 timeline shared with production manager and Shenzhen Grandway.",
      },
    ],
    completionMessage:
      "Hindsighting complete — 18-day delay traced to two communication breakdowns, root cause documented, three process improvements filed, and recovery plan in motion to protect the Nordstrom ship date.",
  },
  {
    id: "retailer-compliance",
    title: "Ensure shipment meets retailer compliance requirements",
    subtitle:
      "Packaging, labeling, and deadline verification against retailer handbooks",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the retailer compliance verification workflow. This workflow has pre-authorized read access to your PLM, retailer compliance portals, vendor handbooks, and warehouse systems. I can verify packaging, labeling, and deadline requirements automatically, but issuing compliance instructions to suppliers or warehouses requires your sign-off.\n\n1. Pull the retailer's compliance handbook and specific PO requirements (pre-authorized, read-only)\n2. Cross-reference current shipment specs against every compliance requirement\n3. Flag any gaps in packaging, labeling, logo placement, or routing\n4. Generate compliance checklist and corrective actions — you'll approve before instructions go out\n\nLet me start pulling the requirements.",
    permissions: {
      autoApproved: [
        "Read retailer compliance handbooks and portals",
        "Read PO and shipment details from ERP",
        "Read warehouse packing specs",
        "Read licensor brand guidelines",
      ],
      requiresApproval: [
        "Send compliance instructions to suppliers",
        "Update packing specs in WMS",
        "Submit ASN and routing requests to retailer",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to compliance and order systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no data will be modified.",
        sources: [
          "Retailer Portal (Macy's Partner Portal)",
          "PLM (Centric PLM)",
          "ERP (SAP S/4HANA)",
          "WMS (Blue Yonder)",
          "Licensor Portal (PGA Tour Licensing)",
          "Brand Guidelines Library (SharePoint)",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling Macy's compliance requirements for PO-MCS-7745",
        detail:
          "PO-MCS-7745: 3,600 units across 4 styles of PGA Tour licensed men's polos for Macy's fall golf floor-set. Ship-not-before: Jul 28. Must-arrive-by: Aug 8 at Macy's Cheshire, CT DC.\n\nMacy's Vendor Handbook v2026 requirements:\n• Carton labeling: GS1-128 barcode, Macy's specific format, PO number on every carton\n• Hangtags: Macy's price ticket + PGA Tour co-branded hangtag (specific Pantone 349C green)\n• Packaging: Individual polybag (min 1.5 mil), tissue paper for darks, folded to 12\"x10\" spec\n• Routing: Must use Macy's assigned carrier (XPO Logistics), book via Macy's routing portal 10 days before ship\n• ASN: EDI 856 submitted within 24 hours of shipment, must match carton-level detail exactly\n• Penalties: $2/unit for labeling violations, 10% chargeback for late ASN, $5,000 flat for routing violations",
        sources: [
          "Macy's Partner Portal — Vendor Handbook v2026",
          "SAP — PO-MCS-7745",
          "Macy's Routing Guide",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling PGA Tour licensor requirements",
        detail:
          "PGA Tour licensing agreement (License #PGA-2025-0441) adds additional requirements on top of Macy's:\n\n• Logo placement: PGA Tour logo must appear on left chest, minimum 1.5\" width, maximum 2.0\". Pantone 349C only — no substitutions.\n• Hangtag: Co-branded hangtag must show PGA Tour logo at minimum 40% of tag area. Approval stamp required — current approval expires Apr 30 (still valid).\n• Quality: PGA Tour requires pre-shipment inspection report (AQL 2.5 for critical defects, AQL 4.0 for major).\n• Restricted: No use of \"Official\" or \"Championship\" language on packaging without separate event approval.\n\nCross-referencing against current production specs in Centric PLM...",
        sources: [
          "PGA Tour Licensing Portal — License #PGA-2025-0441",
          "Centric PLM — Style Specs",
        ],
      },
      {
        type: "reasoning",
        label: "Identifying compliance gaps",
        detail:
          "Found 4 compliance gaps that need correction before shipment:\n\n1. **Hangtag color mismatch** — Current production hangtags from supplier use Pantone 348C (close but not correct). PGA Tour requires exact Pantone 349C. Supplier must reprint. Lead time: 5 days. Cost: ~$0.08/unit ($288 total).\n\n2. **Polybag thickness** — WMS packing spec shows 1.2 mil polybags in stock. Macy's requires 1.5 mil minimum. Need to order correct polybags or risk $2/unit penalty ($7,200).\n\n3. **Routing not booked** — Ship date is Jul 28, routing must be booked by Jul 18. Today is Mar 18 — not urgent yet, but adding a calendar reminder for Jul 14 (4-day buffer).\n\n4. **Pre-shipment inspection not scheduled** — PGA Tour requires AQL inspection report. Need to schedule with Bureau Veritas or SGS at least 2 weeks before ship date.\n\nNo issues found with: carton labeling format, fold specs, logo placement dimensions, or EDI 856 template.",
      },
      {
        type: "human_input",
        label: "Approve compliance corrections",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here are the 4 compliance gaps and proposed corrections. Sending instructions to suppliers and updating warehouse specs require your approval.\n\n**1. Hangtag Reprint (Critical)**\n• Issue: Pantone 348C instead of required 349C\n• Fix: Instruct supplier to reprint hangtags to PGA Tour spec\n• Cost: $288 | Lead time: 5 days\n\n**2. Polybag Upgrade (Critical)**\n• Issue: 1.2 mil on hand, Macy's requires 1.5 mil\n• Fix: Order 1.5 mil polybags from packaging supplier\n• Cost: ~$180 | Lead time: 3 days\n\n**3. Routing Reminder (Preventive)**\n• Set calendar reminder for Jul 14 to book Macy's routing via XPO\n\n**4. Pre-Shipment Inspection (Required)**\n• Schedule Bureau Veritas AQL inspection for week of Jul 21\n• Estimated cost: $1,800\n\n**Total compliance cost: $2,268** — avoids potential $12,200+ in Macy's penalties.\n\nShall I send these instructions and schedule the inspection?",
        approvalButtons: [
          "Send all compliance instructions",
          "Let me review the details",
        ],
      },
      {
        type: "result",
        label: "Compliance checklist activated",
        detail:
          "Hangtag reprint instructions sent to supplier with PGA Tour spec sheet attached. Polybag order placed with packaging supplier (1.5 mil, qty 4,000, delivery by Mar 25). Calendar reminders set: Jul 14 for Macy's routing booking, Jul 7 for Bureau Veritas inspection scheduling. Compliance checklist saved to PO-MCS-7745 in SAP with all Macy's and PGA Tour requirements linked. WMS packing spec updated to reflect 1.5 mil polybag requirement.",
      },
    ],
    completionMessage:
      "Compliance verification complete — 4 gaps identified and corrected before they became costly penalties. Checklist active with automated reminders through ship date.",
  },
  {
    id: "approvals-management",
    title: "Route and track supplier approval submissions",
    subtitle:
      "Internal consultation and decision routing for fabric, pattern, and wash approvals",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the approvals management workflow. This workflow has pre-authorized read access to your PLM, email, and internal design review systems. I can track submission status and prepare approval summaries automatically, but communicating decisions to suppliers or updating approval records requires your sign-off.\n\n1. Pull all pending supplier submissions and their current status from PLM (pre-authorized, read-only)\n2. Match each submission against brand standards and prior approvals\n3. Prepare approval summaries with recommendations for internal review\n4. Route decisions to suppliers — you'll approve the final responses before they're sent\n\nLet me pull the pending submissions.",
    permissions: {
      autoApproved: [
        "Read supplier submissions from PLM and email",
        "Read brand standards and color libraries",
        "Read prior approval history",
        "Read internal review meeting notes",
      ],
      requiresApproval: [
        "Update approval status in PLM",
        "Send approval/rejection to suppliers",
        "Schedule re-submission deadlines",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to PLM and design systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no approval statuses will be changed.",
        sources: [
          "PLM (Centric PLM)",
          "Email (Outlook)",
          "Color Library (Pantone Connect)",
          "Design Review Board (SharePoint)",
          "Supplier Portal",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling 14 pending supplier submissions",
        detail:
          "Found 14 pending approval submissions across 6 suppliers, grouped by type:\n\n**Lab Dips (Color Approvals) — 6 pending:**\n• Yantai Huasheng — 3 lab dips for SS26 linen-blend program (styles LN-801, LN-802, LN-803). Submitted Mar 12. Colors: \"Desert Sand,\" \"Coastal Blue,\" \"Sage.\"\n• Guangzhou Yeeka — 2 lab dips for FW26 wool flannel (styles WF-210, WF-211). Submitted Mar 14. Colors: \"Charcoal Heather,\" \"Burgundy.\"\n• Pratibha Syntex — 1 lab dip for organic cotton tee (style OC-550). Submitted Mar 10. Color: \"Clay.\"\n\n**Fabric Hand-Feels — 4 pending:**\n• Albini Group (Italy) — 2 shirting fabrics for dress program. Submitted Mar 8. 8 days without review.\n• Jiangsu Textile Co. — 2 stretch twill variations for chino program. Submitted Mar 11.\n\n**Wash Approvals — 3 pending:**\n• Saitex (Vietnam) — 2 denim wash submissions for SS26 jeans (styles DJ-440, DJ-441). Submitted Mar 13.\n• Nha Trang Garments — 1 garment wash for cargo pant (style CP-660). Submitted Mar 15.\n\n**Print/Pattern — 1 pending:**\n• Texollini — 1 engineered stripe for polo program (style PS-720). Submitted Mar 9. 9 days without review.",
        sources: [
          "Centric PLM — Approval Queue",
          "Outlook — Supplier Submission Emails",
        ],
      },
      {
        type: "reasoning",
        label: "Evaluating submissions against brand standards",
        detail:
          "Cross-referenced all 14 submissions against brand color library, prior season approvals, and design intent:\n\n**Recommend Approve (8):**\n• Yantai Huasheng \"Desert Sand\" and \"Sage\" — within Delta E 1.0 of target. Clean match.\n• Guangzhou Yeeka \"Charcoal Heather\" — excellent hand-feel per spec. Dead-on color.\n• Pratibha Syntex \"Clay\" — matches Pantone 18-1336 target. Third submission — finally nailed it.\n• Albini Group — both shirting fabrics match hand-feel and weight spec (120gsm ± 5%). Premium quality.\n• Saitex \"DJ-440\" medium wash — matches approved wash standard from SS25 recolor.\n\n**Recommend Reject / Revise (4):**\n• Yantai Huasheng \"Coastal Blue\" — Delta E 2.8 from target. Too green. Needs re-dip.\n• Guangzhou Yeeka \"Burgundy\" — reads more plum than burgundy. Delta E 3.1. Likely a dye lot issue.\n• Saitex \"DJ-441\" dark wash — whiskering too aggressive vs. approved wash standard. Design won't accept.\n• Nha Trang garment wash — too much shrinkage (9% vs. 5% max). Needs process adjustment.\n\n**Needs Internal Discussion (2):**\n• Jiangsu Textile stretch twill — both options meet spec, but stretch recovery differs (Option A: 92%, Option B: 88%). Need design input on preference.\n• Texollini engineered stripe — stripe width is 2mm wider than design intent. May be intentional — need designer confirmation at Wednesday's review meeting.",
      },
      {
        type: "human_input",
        label: "Approve routing of decisions",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the approval summary for your review. Updating PLM records and notifying suppliers require your sign-off.\n\n**Approve (8 submissions):**\n• 3 lab dips — Desert Sand, Sage (Yantai), Charcoal Heather (Yeeka), Clay (Pratibha)\n• 2 fabric hand-feels — Albini Group shirting\n• 1 wash — Saitex DJ-440 medium wash\n\n**Reject with Feedback (4 submissions):**\n• Coastal Blue — re-dip needed, reduce green cast (target Pantone 16-4120)\n• Burgundy — re-dip needed, shift warmer (target Pantone 19-1725)\n• DJ-441 dark wash — reduce whiskering intensity\n• CP-660 garment wash — address 9% shrinkage (max 5%)\n\n**Hold for Wednesday Review Meeting (2 submissions):**\n• Jiangsu stretch twill — need designer input on stretch recovery\n• Texollini stripe — need designer confirmation on width\n\nShall I update PLM and send all decisions to suppliers?",
        approvalButtons: [
          "Send all decisions to suppliers",
          "Let me adjust some decisions",
        ],
      },
      {
        type: "data_pull",
        label: "Updating PLM and notifying suppliers",
        detail:
          "Updated all 14 submission statuses in Centric PLM. Sent approval emails to 4 suppliers (8 approvals) with \"APPROVED\" headers and next-step instructions. Sent rejection emails to 3 suppliers (4 rejections) with specific color/spec targets and re-submission deadlines (Mar 28 for lab dips, Apr 1 for wash adjustments). Added Jiangsu twill and Texollini stripe to Wednesday's design review meeting agenda in Outlook.",
        sources: [
          "Centric PLM — Status Updates",
          "Outlook — Supplier Notifications",
          "Calendar — Wednesday Review Agenda",
        ],
      },
      {
        type: "result",
        label: "All 14 submissions processed",
        detail:
          "8 approvals communicated to suppliers — production can proceed on those styles. 4 rejections sent with clear targets and Mar 28/Apr 1 re-submission deadlines. 2 submissions queued for Wednesday design review. PLM approval queue cleared. Average turnaround reduced from 8.2 days to same-day for this batch.",
      },
    ],
    completionMessage:
      "Approval cycle complete — 14 submissions processed (8 approved, 4 rejected with guidance, 2 held for design review). Suppliers notified and PLM updated.",
  },
  {
    id: "supplier-onboarding",
    title: "Onboard a new supplier into the vendor ecosystem",
    subtitle:
      "Capability mapping, documentation, and system setup for new vendor relationships",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the supplier onboarding workflow. This workflow has pre-authorized read access to your vendor database, compliance records, and internal process documentation. I can gather and organize supplier information automatically, but adding new vendors to systems and sharing access credentials requires your sign-off.\n\n1. Collect and verify the new supplier's capabilities, certifications, and compliance status (pre-authorized, read-only)\n2. Map their capabilities against your category needs and existing vendor coverage\n3. Prepare all system setup requirements and onboarding documentation\n4. Execute system provisioning and send onboarding packet — you'll approve before anything is created\n\nLet me start gathering supplier details.",
    permissions: {
      autoApproved: [
        "Read existing vendor database and capability maps",
        "Read compliance and audit databases",
        "Read internal onboarding SOPs",
        "Read supplier-submitted documentation",
      ],
      requiresApproval: [
        "Create new vendor record in ERP",
        "Grant portal access to supplier",
        "Send onboarding packet and NDA",
        "Add supplier to approved vendor list",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to vendor management systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no vendor records will be created.",
        sources: [
          "ERP (SAP S/4HANA)",
          "Vendor Database (internal)",
          "Compliance Database (Sedex/SMETA)",
          "SharePoint (onboarding SOPs)",
          "Email (supplier correspondence)",
        ],
      },
      {
        type: "data_pull",
        label: "Collecting new supplier information",
        detail:
          "New supplier: **Dong Guan Evergreen Textiles Co., Ltd.** (Guangdong, China). Referred by Li & Fung sourcing team.\n\nCollected from email correspondence and submitted documents:\n• Factory size: 1,200 workers across 2 facilities (main cut-and-sew + dedicated wash house)\n• Product categories: men's and women's casual bottoms (chinos, joggers, shorts), capacity 80,000 units/month\n• Key certifications: BSCI rating \"B\" (audit Jun 2025), OEKO-TEX Standard 100, ISO 9001:2015\n• Current clients: Uniqlo (since 2022), Zara (since 2023), H&M (since 2021)\n• MOQ: 1,500 units/style/color\n• Lead time: 45-60 days from fabric-in-house\n• Payment terms requested: Net 60 from B/L date\n• Bank details: HSBC Hong Kong, account submitted\n• Contact: Jenny Wu, Merchandising Director, jenny.wu@dg-evergreen.com",
        sources: [
          "Email — Li & Fung Introduction Thread",
          "Supplier Submitted Docs — Capability Deck, Audit Reports",
          "Sedex — BSCI Audit Record",
        ],
      },
      {
        type: "reasoning",
        label: "Mapping capabilities against category needs",
        detail:
          "**Capability Fit Assessment:**\n\nDong Guan Evergreen maps well to our casual bottoms category, which is currently served by 3 vendors:\n• Nha Trang Garments (Vietnam) — 60% of volume, strong but at capacity\n• Jiangsu Textile Co. (China) — 25% of volume, primarily chinos\n• Sunrise Apparel (Bangladesh) — 15% of volume, basics only\n\n**Gap Evergreen fills:** We need additional jogger and short capacity for SS27 (projected 40,000 unit increase). Nha Trang is maxed out. Evergreen's wash house capability is a differentiator — currently we outsource garment washing to a third party for Jiangsu orders (adds 7 days and $1.20/unit).\n\n**Risk Assessment:**\n• BSCI \"B\" rating is acceptable but below our \"A\" preferred threshold. Recommend scheduling a follow-up audit within 6 months.\n• Uniqlo and Zara references are strong — indicates quality systems and on-time delivery discipline.\n• Net 60 payment terms are outside our standard Net 45. Recommend negotiating to Net 45.\n• No WRAP certification — required for some US retail accounts. Flag for future.\n\n**Recommendation:** Approve onboarding. Start with a trial order (2,000 units, single style) before committing volume.",
      },
      {
        type: "data_pull",
        label: "Preparing onboarding documentation package",
        detail:
          "Compiled the complete onboarding packet:\n\n• **Vendor Agreement** — Standard terms (Net 45, FOB origin, 2% late-delivery penalty). Pre-filled with Evergreen's details.\n• **NDA** — Mutual non-disclosure, standard 3-year term.\n• **Quality Manual** — Our QC standards, AQL requirements, defect classification guide.\n• **Shipping & Logistics Guide** — Preferred freight forwarders, carton specs, ASN requirements.\n• **Compliance Requirements** — Code of conduct, audit schedule, restricted substances list (RSL).\n• **System Access Setup** — Vendor portal login, EDI setup instructions (856/810/850), PLM access for tech packs.\n• **Trial Order Brief** — Style CP-680 (men's twill jogger), 2,000 units, 4 colors, target FOB $8.50.\n\nAll documents ready. ERP vendor record pre-staged as #VND-2026-0298 (draft, not yet active).",
        sources: [
          "SharePoint — Onboarding Templates",
          "SAP — Vendor Master Draft",
          "Legal — Standard NDA Template",
        ],
      },
      {
        type: "human_input",
        label: "Approve vendor creation and onboarding",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the onboarding summary for Dong Guan Evergreen Textiles. Creating the vendor record and sending the onboarding packet require your approval.\n\n**Supplier:** Dong Guan Evergreen Textiles Co., Ltd.\n**Category:** Men's & women's casual bottoms\n**Capacity:** 80,000 units/month\n**Key Advantage:** In-house wash facility (saves $1.20/unit vs. current outsourcing)\n\n**Onboarding Actions:**\n• Activate vendor record #VND-2026-0298 in SAP\n• Send NDA + Vendor Agreement (Net 45 terms)\n• Grant vendor portal and PLM access\n• Issue trial order brief: Style CP-680, 2,000 units, $8.50 FOB target\n\n**Flags:**\n• BSCI \"B\" — schedule follow-up audit within 6 months\n• No WRAP cert — flag for US retail compliance\n\nShall I activate the vendor and send the onboarding packet?",
        approvalButtons: [
          "Activate vendor and send packet",
          "Let me review the terms first",
        ],
      },
      {
        type: "result",
        label: "Supplier onboarded and trial order initiated",
        detail:
          "Vendor record #VND-2026-0298 activated in SAP S/4HANA. NDA and vendor agreement emailed to Jenny Wu at Dong Guan Evergreen with DocuSign for e-signature. Portal access credentials generated and sent. PLM access provisioned for tech pack retrieval. Trial order brief (CP-680, 2,000 units) shared via vendor portal. Follow-up audit reminder set for Sep 2026. Vendor capability profile added to internal sourcing database with category tags.",
      },
    ],
    completionMessage:
      "Supplier onboarding complete — Dong Guan Evergreen activated as vendor #VND-2026-0298, agreements sent for signature, trial order initiated, and follow-up audit scheduled.",
  },
  {
    id: "rfq-bid-management",
    title: "Run an RFQ process and evaluate supplier bids",
    subtitle: "Multi-supplier bid collection, comparison, and sourcing decision",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the RFQ bid management workflow. This workflow has pre-authorized read access to your PLM, vendor database, email, and costing tools. I can collect and consolidate bids automatically, but sending RFQs, communicating with suppliers during the bid process, and awarding business requires your sign-off.\n\n1. Pull product specs and identify qualified suppliers from the vendor database (pre-authorized, read-only)\n2. Collect and consolidate all supplier bids into a comparable format\n3. Analyze bids on cost, quality, lead time, and risk factors\n4. Present a sourcing recommendation — you'll approve the supplier selection before it's communicated\n\nLet me start pulling the RFQ requirements.",
    permissions: {
      autoApproved: [
        "Read product specs from PLM",
        "Read vendor database and capability profiles",
        "Read inbound bid emails and attachments",
        "Read historical costing data",
      ],
      requiresApproval: [
        "Send RFQ packages to suppliers",
        "Communicate with suppliers during bid process",
        "Award business to selected supplier",
        "Update costing records",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to sourcing systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no RFQs will be sent.",
        sources: [
          "PLM (Centric PLM)",
          "Vendor Database (internal)",
          "Email (Outlook)",
          "Costing Tool (Excel / SharePoint)",
          "ERP (SAP S/4HANA)",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling RFQ requirements and qualifying suppliers",
        detail:
          "RFQ for SS27 men's performance chino program — 6 styles, projected volume 45,000 units across the season.\n\nSpecs from Centric PLM:\n• Fabric: 97% cotton / 3% elastane stretch twill, 7 oz, mechanical stretch\n• Construction: Flat front, hidden flex waistband, 5-pocket styling\n• Finishes: Enzyme wash, wrinkle-free treatment, moisture-wicking finish\n• Target FOB: $9.00–$11.00/unit\n• Target lead time: 60 days from fabric-in-house\n• Annual volume commitment: 45,000 units (with option for 60,000 if sell-through exceeds 70%)\n\nQualified suppliers from vendor database (capability match + compliance status):\n1. **Nha Trang Garments** (Vietnam) — current supplier, strong track record\n2. **Dong Guan Evergreen** (China) — newly onboarded, in-house wash capability\n3. **Aksara Knitting** (Indonesia) — experienced in stretch programs\n4. **Crystal Group** (Vietnam) — premium positioning, strong with performance fabrics\n5. **Hirdaramani** (Sri Lanka) — competitive pricing, WRAP certified",
        sources: [
          "Centric PLM — SS27 Chino Program Specs",
          "Vendor Database — Capability Matching",
          "SAP — Historical Volume Data",
        ],
      },
      {
        type: "human_input",
        label: "Approve RFQ distribution",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here are the 5 qualified suppliers for the SS27 chino program RFQ. Sending the RFQ package requires your approval.\n\n**RFQ Package Contents:**\n• Tech pack with all 6 style specs\n• Fabric requirement (97/3 stretch twill, 7 oz)\n• Target volume: 45,000 units (6 styles x ~7,500 avg)\n• Required information: FOB price, lead time, MOQ, fabric sourcing plan\n• Bid deadline: Mar 28 (10 days)\n\n**Suppliers:**\n1. Nha Trang Garments (Vietnam)\n2. Dong Guan Evergreen (China)\n3. Aksara Knitting (Indonesia)\n4. Crystal Group (Vietnam)\n5. Hirdaramani (Sri Lanka)\n\nShall I send the RFQ to all 5 suppliers?",
        approvalButtons: [
          "Send RFQ to all 5",
          "Let me adjust the supplier list",
        ],
      },
      {
        type: "data_pull",
        label: "Collecting and consolidating bids",
        detail:
          "All 5 bids received by deadline. Consolidated into comparison matrix:\n\n| Supplier | FOB/unit | Lead Time | MOQ | Fabric Source | Wash In-House |\n|----------|----------|-----------|-----|---------------|---------------|\n| Nha Trang | $10.20 | 55 days | 1,000 | Nominated (Jiangsu) | No (outsource) |\n| Evergreen | $9.45 | 50 days | 1,500 | Self-sourced | Yes |\n| Aksara | $10.80 | 65 days | 2,000 | Nominated | No (outsource) |\n| Crystal | $11.40 | 50 days | 800 | Self-sourced (premium) | Yes |\n| Hirdaramani | $8.90 | 60 days | 2,500 | Nominated | No |\n\nAdditional notes from bid Q&A:\n• Evergreen offered 5% volume discount at 50,000+ units\n• Crystal included free wrinkle-free treatment (others quoted $0.40–$0.60/unit add-on)\n• Hirdaramani's $8.90 excludes wrinkle-free finish — add $0.55 brings to $9.45\n• Aksara flagged potential capacity conflict with existing Nike commitment in Jul-Aug window",
        sources: [
          "Outlook — 5 Bid Responses",
          "Excel — Bid Consolidation Matrix",
          "Slack — Supplier Q&A Thread",
        ],
      },
      {
        type: "reasoning",
        label: "Analyzing bids and building recommendation",
        detail:
          "**Weighted Scoring (Cost 35%, Quality 25%, Lead Time 20%, Risk 20%):**\n\n1. **Dong Guan Evergreen — Score: 87/100** (Recommended)\n   - Cost: $9.45 FOB is within target, drops to $8.98 at 50K+ volume. Strong.\n   - Quality: In-house wash eliminates third-party quality risk. New relationship is a risk factor, but trial order (CP-680) is tracking well — 98% on-spec so far.\n   - Lead time: 50 days is best-in-class for this category.\n   - Risk: New supplier (6-month relationship). Mitigate with split order.\n\n2. **Nha Trang Garments — Score: 82/100** (Strong backup)\n   - Proven partner, but outsourced wash adds 7 days and $1.20/unit effective cost (not in FOB).\n   - Reliable but at capacity — may struggle with upside volume.\n\n3. **Hirdaramani — Score: 76/100**\n   - Cheapest on paper but wrinkle-free add-on erases advantage. High MOQ limits flexibility.\n\n4. **Crystal Group — Score: 74/100**\n   - Premium quality but $11.40 is at ceiling. Better suited for elevated product tiers.\n\n5. **Aksara — Score: 68/100**\n   - Capacity conflict and longest lead time. Not competitive for this program.\n\n**Recommendation:** Award 60% to Evergreen (27,000 units) and 40% to Nha Trang (18,000 units) as a dual-source strategy. This hedges the new-supplier risk while capturing Evergreen's cost and lead time advantages.",
      },
      {
        type: "human_input",
        label: "Approve supplier selection",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the sourcing recommendation for the SS27 chino program. Awarding business and notifying suppliers requires your approval.\n\n**Recommended: Dual-Source Strategy**\n\n**Primary — Dong Guan Evergreen (60%, 27,000 units)**\n• FOB: $9.45/unit ($8.98 if we commit to 50K option)\n• Lead time: 50 days | In-house wash capability\n• Risk mitigated by secondary source\n\n**Secondary — Nha Trang Garments (40%, 18,000 units)**\n• FOB: $10.20/unit\n• Lead time: 55 days | Proven 3-year track record\n• Reliable backup if Evergreen hits any issues\n\n**Blended FOB: $9.75/unit** (vs. $10.20 current single-source with Nha Trang)\n**Annual savings: ~$20,250** on 45,000 units\n\nShall I award the business and notify all 5 suppliers?",
        approvalButtons: [
          "Award and notify suppliers",
          "Let me reconsider the split",
        ],
      },
      {
        type: "result",
        label: "Business awarded and suppliers notified",
        detail:
          "Award notifications sent to Dong Guan Evergreen (27,000 units) and Nha Trang Garments (18,000 units) with PO allocation details and timeline expectations. Thank-you/decline emails sent to Aksara, Crystal, and Hirdaramani with feedback notes. Costing records updated in Excel and SAP with new blended FOB of $9.75. RFQ decision rationale documented in SharePoint sourcing library for future reference.",
      },
    ],
    completionMessage:
      "RFQ process complete — 5 suppliers evaluated, dual-source strategy selected, $20,250 annual savings captured, and all suppliers notified with documented rationale.",
  },
  {
    id: "supplier-data-standardization",
    title: "Standardize supplier data across regions",
    subtitle:
      "Cross-org supplier consolidation from US, international, and legacy databases",
    industry: "Retail",
    acknowledgment:
      "On it — I'll run the supplier data standardization workflow. This workflow has pre-authorized read access to your US vendor master, international procurement database, legacy systems, and Sam's Club supplier records. I can identify duplicates and standardize formats automatically, but merging records and updating master data requires your sign-off.\n\n1. Pull supplier records from all regional databases and legacy systems (pre-authorized, read-only)\n2. Identify duplicates, format inconsistencies, and data gaps across regions\n3. Build a unified supplier view with standardized fields and reconciled records\n4. Apply the standardized data to the master database — you'll approve before any records are modified\n\nLet me start pulling records across all sources.",
    permissions: {
      autoApproved: [
        "Read US vendor master (SAP)",
        "Read international procurement database (Oracle)",
        "Read Sam's Club supplier records (legacy AS/400)",
        "Read M&A integration staging tables",
      ],
      requiresApproval: [
        "Merge duplicate supplier records",
        "Update master vendor database",
        "Archive deprecated records",
        "Publish unified supplier directory",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to regional vendor databases",
        detail:
          "Authenticating via pre-configured service accounts across 4 systems. All connections are read-only — no records will be modified.",
        sources: [
          "US Vendor Master (SAP S/4HANA)",
          "International Procurement DB (Oracle Fusion)",
          "Sam's Club Supplier Records (AS/400 Legacy)",
          "M&A Integration Staging (SQL Server)",
          "MDM Platform (Informatica)",
        ],
      },
      {
        type: "data_pull",
        label: "Extracting supplier records across all sources",
        detail:
          "Extracted supplier records from all 4 databases:\n\n• **US Vendor Master (SAP)**: 2,847 active suppliers. Fields: vendor ID, legal name, DUNS, address, payment terms, bank details, category codes.\n• **International (Oracle)**: 1,392 active suppliers. Fields: supplier ID, trading name, VAT/tax ID, country, Incoterms, currency, bank details. Different ID schema.\n• **Sam's Club (AS/400)**: 943 active suppliers. Fields: legacy vendor code, name (often abbreviated), address, phone. Minimal data — no DUNS, no category codes, no compliance status.\n• **M&A Staging**: 234 suppliers from recent Moosejaw acquisition. Partially mapped — 89 already have SAP IDs, 145 unmapped.\n\nTotal records to reconcile: **5,416 across 4 systems.**",
        sources: [
          "SAP — Vendor Master Export",
          "Oracle Fusion — Supplier Extract",
          "AS/400 — Legacy Vendor Dump",
          "SQL Server — M&A Staging Tables",
        ],
      },
      {
        type: "reasoning",
        label: "Identifying duplicates and inconsistencies",
        detail:
          "Ran matching algorithm across all 5,416 records using legal name, DUNS number, address, and tax ID as match keys. Findings:\n\n**Duplicates Found: 387 supplier entities exist in multiple systems.**\n• 214 suppliers appear in both US (SAP) and International (Oracle) with different IDs — e.g., \"Li & Fung Trading Ltd\" in SAP is \"Li and Fung Trading Limited\" in Oracle. Same DUNS (548912736).\n• 98 Sam's Club suppliers already exist in SAP under different vendor codes — e.g., AS/400 vendor \"PROCTER&G\" = SAP vendor #10004821 \"Procter & Gamble Co.\"\n• 75 M&A staging records match existing SAP vendors when matched by DUNS.\n\n**Data Quality Issues:**\n• 312 SAP records missing DUNS numbers (11% of US vendors)\n• 187 Oracle records have outdated addresses (matched against USPS/international address validation)\n• 441 Sam's Club records have no email contact — only fax numbers\n• 56 records have conflicting payment terms between SAP and Oracle (e.g., Net 30 in US, Net 60 in international for the same legal entity)\n• 23 suppliers have expired compliance certifications that haven't been flagged\n\n**Format Inconsistencies:**\n• Address formats differ across all 4 systems (no standardized country codes, mixed abbreviations)\n• Phone numbers: US format, international format, and raw digits with no formatting\n• Category codes: SAP uses UNSPSC, Oracle uses custom codes, Sam's Club has no codes",
      },
      {
        type: "data_pull",
        label: "Building unified supplier view",
        detail:
          "Constructed a consolidated master file with standardized fields for all 5,029 unique supplier entities (after de-duplication):\n\n• **Standardized fields**: Legal name, trading name(s), DUNS, tax IDs (by country), ISO 3166 country codes, formatted addresses, UNSPSC category codes, primary contact (name + email + phone), payment terms, bank details, compliance status, active/inactive flag\n• **Cross-reference map**: Every unified record links back to its source system IDs (SAP vendor #, Oracle supplier ID, AS/400 code, M&A staging ID) so no audit trail is lost\n• **Gap fill**: Used DUNS lookups to populate 218 of 312 missing DUNS numbers. Validated 187 addresses against postal databases — 134 auto-corrected, 53 flagged for manual review.\n• **Payment term conflicts**: Documented all 56 cases with both terms preserved — recommend using the US (SAP) terms as the master for domestic transactions.\n\nUnified file staged in Informatica MDM as a preview — not yet published.",
        sources: [
          "Informatica MDM — Staging Preview",
          "D&B Direct — DUNS Lookup API",
          "Address Validation Service",
        ],
      },
      {
        type: "human_input",
        label: "Approve data standardization and merge",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the standardization summary. Merging records and publishing the unified view require your approval.\n\n**Scope: 5,416 records → 5,029 unique suppliers**\n• 387 duplicate entities identified and mapped for merge\n• 218 DUNS numbers populated via D&B lookup\n• 134 addresses auto-corrected via postal validation\n\n**Actions Requiring Approval:**\n1. **Merge 387 duplicate records** — consolidate into single master entries with all source system IDs preserved\n2. **Update 134 corrected addresses** in source systems\n3. **Archive 441 Sam's Club fax-only records** — flag for contact info refresh campaign\n4. **Flag 23 suppliers with expired compliance** for re-audit\n5. **Publish unified directory** to Informatica MDM as the new single source of truth\n\n**53 addresses need manual review** — these will be routed to regional teams.\n**56 payment term conflicts** — recommend defaulting to SAP (US) terms for domestic.\n\nShall I execute the merge and publish the unified supplier directory?",
        approvalButtons: [
          "Execute merge and publish",
          "Let me review the duplicates first",
        ],
      },
      {
        type: "result",
        label: "Unified supplier directory published",
        detail:
          "387 duplicate records merged in Informatica MDM with full audit trail preserved. 134 corrected addresses pushed back to SAP, Oracle, and AS/400. 23 expired-compliance suppliers flagged and re-audit requests sent to compliance team. 53 manual-review addresses routed to regional procurement leads with 2-week deadline. Unified directory published to Informatica MDM — all 4 source systems now sync to the master. Sam's Club contact refresh campaign queued for next sprint.",
      },
    ],
    completionMessage:
      "Data standardization complete — 5,416 records consolidated into 5,029 unique suppliers, 387 duplicates merged, and unified directory published as the organization's single source of truth.",
  },
  {
    id: "invoice-reconciliation",
    title: "Reconcile 3PL and factory invoices against rate sheets",
    subtitle:
      "Charge validation against contracted rates with packing list verification",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the invoice reconciliation workflow. This workflow has pre-authorized read access to your AP system, 3PL portal, factory invoices, contracted rate sheets, and packing lists. I can validate charges and flag discrepancies automatically, but approving payments or disputing invoices requires your sign-off.\n\n1. Pull incoming invoices and match against contracted rate sheets (pre-authorized, read-only)\n2. Cross-reference line items with packing lists and shipment records\n3. Flag any overcharges, missing documentation, or rate discrepancies\n4. Prepare payment approvals or dispute notices — you'll approve before anything is processed\n\nLet me start pulling the invoices.",
    permissions: {
      autoApproved: [
        "Read invoices from AP system and email",
        "Read contracted rate sheets",
        "Read packing lists and shipment records",
        "Read 3PL billing portal",
      ],
      requiresApproval: [
        "Approve invoices for payment",
        "Submit invoice disputes",
        "Update rate sheet records",
        "Process payment batches",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to AP and logistics systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no payments will be initiated.",
        sources: [
          "AP System (SAP S/4HANA)",
          "3PL Billing Portal (Radial)",
          "Factory Invoice Inbox (Outlook)",
          "Rate Sheet Library (SharePoint)",
          "WMS (Blue Yonder — Packing Lists)",
          "Freight Forwarder Portal (Flexport)",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling 23 invoices pending reconciliation",
        detail:
          "Retrieved all invoices received in the last 2 weeks awaiting reconciliation:\n\n**3PL Invoices (Radial) — 8 invoices, $127,450 total:**\n• Pick & pack charges for 14,200 units across 6 POs\n• Storage charges for Mar 1–15 (2 warehouses)\n• 2 special handling invoices (kitting for Nordstrom floor-set display)\n\n**Factory Invoices — 11 invoices, $892,300 total:**\n• Jiangsu Textile Co. — 3 invoices ($312,000)\n• Nha Trang Garments — 3 invoices ($245,800)\n• Saitex — 2 invoices ($189,500)\n• Dong Guan Evergreen — 2 invoices ($98,000)\n• Aksara Knitting — 1 invoice ($47,000)\n\n**Freight Invoices (Flexport) — 4 invoices, $48,200 total:**\n• 2 ocean FCL shipments from Vietnam\n• 1 ocean LCL from Indonesia\n• 1 air freight from China (expedited)",
        sources: [
          "SAP AP — Invoice Queue",
          "Radial — Billing Dashboard",
          "Outlook — Factory Invoice Attachments",
          "Flexport — Freight Invoices",
        ],
      },
      {
        type: "data_pull",
        label: "Cross-referencing against rate sheets and packing lists",
        detail:
          "Validated all 23 invoices line-by-line against contracted rates and shipment records:\n\n**3PL (Radial):**\n• Pick & pack: Contracted rate $2.85/unit. 6 of 8 invoices match. Invoice #RAD-28847 charges $3.10/unit for PO-88412 (1,200 units, $300 overcharge). Invoice #RAD-28903 charges $3.40/unit for kitting — but kitting rate is $3.40, so this is correct.\n• Storage: Contracted rate $0.42/CBM/day. Invoice matches within rounding.\n\n**Factory Invoices:**\n• Jiangsu INV-JX-4401: Lists 8,500 units at $17.50/unit = $148,750. PO-88455 confirms 8,500 units at $17.50. Match.\n• Jiangsu INV-JX-4402: Lists 6,000 units at $18.00/unit = $108,000. PO-88470 shows $17.80/unit. Overcharge of $0.20/unit = **$1,200 discrepancy**.\n• Nha Trang INV-NT-7820: Lists 6,200 units but packing list shows 6,148 units received (52-unit shortfall). **$780 overcharge** based on units not delivered.\n• All other factory invoices match PO terms and packing lists.\n\n**Freight (Flexport):**\n• Ocean FCL rates match contract ($3,200/40ft container). 2 invoices correct.\n• LCL invoice charges $68/CBM — contracted rate is $62/CBM on 14.2 CBM. **$85.20 overcharge**.\n• Air freight invoice: $4.80/kg on 1,850 kg. Rate sheet shows $4.50/kg for China origin. **$555 overcharge**.",
        sources: [
          "SharePoint — Contracted Rate Sheets",
          "Blue Yonder — Packing List Verification",
          "SAP — PO Terms",
        ],
      },
      {
        type: "reasoning",
        label: "Summarizing discrepancies and recommended actions",
        detail:
          "**Invoice Reconciliation Summary:**\n\n• **19 of 23 invoices are clean** — match contracted rates and packing lists. Total: $1,065,570. Ready for payment.\n\n• **4 invoices have discrepancies** — Total overcharges: **$2,920.20**\n  1. Radial #RAD-28847: $300 overcharge (pick rate $3.10 vs. contracted $2.85)\n  2. Jiangsu INV-JX-4402: $1,200 overcharge (unit price $18.00 vs. PO $17.80)\n  3. Nha Trang INV-NT-7820: $780 overcharge (billed 6,200 units, received 6,148)\n  4. Flexport LCL + Air: $640.20 combined overcharge (rate discrepancies)\n\n**Recommended approach:**\n• Approve the 19 clean invoices for immediate payment ($1,065,570)\n• Send dispute notices for the 4 discrepant invoices with supporting documentation\n• For Jiangsu: likely a unit price error — reference PO-88470 in dispute\n• For Nha Trang: packing list discrepancy — may indicate units still in transit or a receiving error worth investigating\n• For Flexport: rate sheet may need updating if new contract terms took effect — verify with logistics team",
      },
      {
        type: "human_input",
        label: "Approve payments and disputes",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the reconciliation outcome. Processing payments and sending disputes require your approval.\n\n**Ready for Payment (19 invoices):**\n• 3PL (Radial): 7 invoices — $127,150\n• Factory: 10 invoices — $890,320\n• Freight (Flexport): 2 invoices — $48,100\n• **Total: $1,065,570**\n\n**Disputes to Send (4 invoices, $2,920.20 total):**\n• Radial #RAD-28847 — $300 (wrong pick rate)\n• Jiangsu INV-JX-4402 — $1,200 (unit price vs. PO mismatch)\n• Nha Trang INV-NT-7820 — $780 (52-unit packing list shortfall)\n• Flexport LCL + Air — $640.20 (rate sheet discrepancies)\n\nDispute notices will include PO references, rate sheet excerpts, and packing list evidence.\n\nShall I process the payments and send the disputes?",
        approvalButtons: [
          "Process payments and send disputes",
          "Let me review the disputes",
        ],
      },
      {
        type: "result",
        label: "Payments processed and disputes submitted",
        detail:
          "19 invoices totaling $1,065,570 submitted for payment in SAP AP (payment batch #PAY-2026-0312, scheduled for next payment run Mar 21). 4 dispute notices sent via email with attached evidence packages: PO confirmations, rate sheet excerpts, and packing list scans. Dispute tracking entries created in SAP with 14-day response deadline. Nha Trang 52-unit shortfall flagged to warehouse team for receiving investigation.",
      },
    ],
    completionMessage:
      "Invoice reconciliation complete — $1,065,570 approved for payment, $2,920.20 in overcharges disputed with documentation, and packing list discrepancy flagged for investigation.",
  },
  {
    id: "demand-planning-reorder",
    title: "Plan reorder quantities based on demand and inventory",
    subtitle:
      "Sales-driven inventory analysis with freight coordination and supplier reorder",
    industry: "DTC / E-commerce",
    acknowledgment:
      "On it — I'll run the demand planning and reorder workflow. This workflow has pre-authorized read access to your Shopify store, warehouse inventory system, freight forwarder quotes, and supplier order history. I can analyze sell-through and calculate reorder quantities automatically, but placing orders with suppliers and booking freight requires your sign-off.\n\n1. Pull sales velocity and inventory levels from Shopify and warehouse systems (pre-authorized, read-only)\n2. Calculate weeks of supply and identify items at risk of stockout\n3. Generate reorder quantities with freight options and landed cost analysis\n4. Place reorders and book freight — you'll approve before any commitments are made\n\nLet me start pulling the latest data.",
    permissions: {
      autoApproved: [
        "Read Shopify sales and inventory data",
        "Read warehouse stock levels (ShipBob)",
        "Read supplier MOQs and lead times",
        "Read freight rate quotes",
      ],
      requiresApproval: [
        "Place purchase orders with suppliers",
        "Book freight shipments",
        "Update inventory forecasts",
        "Adjust safety stock levels",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting to sales and inventory systems",
        detail:
          "Authenticating via pre-configured API keys and service accounts. All connections are read-only — no orders will be placed.",
        sources: [
          "Shopify (sales data)",
          "ShipBob (warehouse inventory)",
          "Supplier Portal (order history)",
          "Flexport (freight quotes)",
          "Google Sheets (demand planning model)",
        ],
      },
      {
        type: "data_pull",
        label: "Pulling 90-day sales velocity and current inventory",
        detail:
          "Analyzed sales data for all 42 active SKUs across the last 90 days:\n\n**Top Performers (sell-through > 80%):**\n• SKU TRV-100 (travel pant, black) — 847 units sold, avg 9.4/day. Current inventory: 312 units. **33 days of supply.**\n• SKU TRV-102 (travel pant, navy) — 723 units sold, avg 8.0/day. Current inventory: 198 units. **25 days of supply.**\n• SKU PLO-200 (performance polo, white) — 612 units sold, avg 6.8/day. Current inventory: 89 units. **13 days of supply. CRITICAL.**\n• SKU JOG-310 (stretch jogger, charcoal) — 534 units sold, avg 5.9/day. Current inventory: 421 units. 71 days of supply. OK.\n\n**At Risk of Stockout (< 30 days supply):**\n• PLO-200 (white polo) — **13 days** ← Will stock out before any reorder can arrive\n• PLO-201 (blue polo) — **22 days**\n• TRV-102 (navy travel pant) — **25 days**\n• TRV-100 (black travel pant) — **33 days** (marginal, given 45-day lead time)\n• SHT-405 (linen shirt, sand) — **28 days** (seasonal — demand accelerating into spring)\n\n**Overstocked (> 120 days supply):**\n• 6 SKUs with combined excess inventory of 4,200 units ($73,500 at cost). Recommend markdown or channel reallocation.",
        sources: [
          "Shopify — Sales Analytics API",
          "ShipBob — Inventory Levels API",
          "Google Sheets — Demand Model",
        ],
      },
      {
        type: "reasoning",
        label: "Calculating reorder quantities and freight options",
        detail:
          "**Reorder Calculations (targeting 90-day supply post-delivery):**\n\n• **PLO-200 (white polo)**: Need 612 units (90-day demand) - 89 current + ~102 units sold during 45-day lead time = **625 units to order**. Supplier MOQ is 500, so order 625. FOB $12.50/unit = $7,812.50.\n\n• **PLO-201 (blue polo)**: Need 450 units. Order **500** (MOQ). FOB $12.50 = $6,250.\n\n• **TRV-102 (navy pant)**: Need 720 units - 198 + 360 sold during lead = **882 units**. Round to 900. FOB $14.80 = $13,320.\n\n• **TRV-100 (black pant)**: Need 846 - 312 + 423 = **957 units**. Round to 1,000. FOB $14.80 = $14,800.\n\n• **SHT-405 (linen shirt)**: Seasonal acceleration — projecting 30% demand increase Apr-Jun. Need **750 units**. FOB $11.20 = $8,400.\n\n**Total reorder: 3,775 units across 5 SKUs. Total FOB: $50,582.50.**\n\n**Freight Options:**\n1. **Ocean (standard)**: 45 days transit. $2,800 for LCL shipment. Landed cost: $50,582 + $2,800 = **$53,382** ($14.14/unit avg). PLO-200 will stock out 30+ days before arrival.\n2. **Air for PLO-200 + PLO-201 only (1,125 units, 680 kg)**: 5 days transit. $4.60/kg = $3,128. Ship remaining 2,650 units ocean ($2,200). Total freight: **$5,328**. PLO-200 arrives before stockout.\n3. **Full air**: 5 days transit. $4.60/kg x 2,280 kg = $10,488. Fastest but expensive. **$61,070 total** ($16.18/unit avg).\n\n**Recommendation:** Option 2 — air the polos ($3,128), ocean the rest ($2,200). Total freight: $5,328. Prevents the PLO-200 stockout (losing ~$290/day in revenue at current velocity) while keeping pants on the cheaper ocean rate.",
      },
      {
        type: "human_input",
        label: "Approve reorder plan and freight booking",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the reorder plan. Placing POs and booking freight require your approval.\n\n**Reorders (5 SKUs, 3,775 units total):**\n• PLO-200 white polo — 625 units — $7,813 (via AIR, arrives ~Mar 25)\n• PLO-201 blue polo — 500 units — $6,250 (via AIR, arrives ~Mar 25)\n• TRV-102 navy pant — 900 units — $13,320 (via OCEAN, arrives ~May 5)\n• TRV-100 black pant — 1,000 units — $14,800 (via OCEAN, arrives ~May 5)\n• SHT-405 linen shirt — 750 units — $8,400 (via OCEAN, arrives ~May 5)\n\n**Freight:**\n• Air (polos only): $3,128 — prevents PLO-200 stockout ($290/day lost revenue)\n• Ocean (pants + shirt): $2,200\n• **Total freight: $5,328**\n\n**Total landed cost: $55,911** ($14.81/unit avg)\n\nAlso recommend scheduling a markdown review for the 6 overstocked SKUs (4,200 units, $73,500 at cost).\n\nShall I place the POs and book freight?",
        approvalButtons: [
          "Place orders and book freight",
          "Let me adjust quantities",
        ],
      },
      {
        type: "data_pull",
        label: "Placing POs and booking shipments",
        detail:
          "POs submitted to suppliers:\n• **PO-DTC-2280** — Dong Guan Evergreen: 1,125 polo units (PLO-200 + PLO-201). Confirmed FOB $12.50. Air pickup scheduled Mar 20 via Flexport.\n• **PO-DTC-2281** — Nha Trang Garments: 1,900 pant units (TRV-100 + TRV-102). Confirmed FOB $14.80. Ocean booking confirmed, vessel ETD Apr 5.\n• **PO-DTC-2282** — Jiangsu Textile: 750 linen shirt units (SHT-405). Confirmed FOB $11.20. Consolidated with Nha Trang ocean shipment.\n\nFlexport air waybill generated for polo shipment. Ocean booking reference: FLEX-OCN-48821.",
        sources: [
          "Supplier Portal — PO Confirmations",
          "Flexport — Booking Confirmations",
        ],
      },
      {
        type: "result",
        label: "Reorders placed and logistics coordinated",
        detail:
          "3 POs placed totaling $50,583 for 3,775 units across 5 SKUs. Air shipment for 1,125 polo units booked — arrival Mar 25 at ShipBob LA warehouse (prevents PLO-200 stockout). Ocean shipment for 2,650 units booked — arrival May 5. Inventory forecast updated in Google Sheets demand model. ShipBob inbound shipment notifications created for both deliveries. Overstocked SKU markdown review added to next week's planning agenda.",
      },
    ],
    completionMessage:
      "Demand planning cycle complete — 5 at-risk SKUs reordered, critical polo stockout prevented via air freight, and $55,911 in inventory replenishment coordinated with suppliers and freight.",
  },
  // ── 21. multi-channel-triage ───────────────────────────────────────────
  {
    id: "multi-channel-triage",
    title: "Triage messages across Slack, WhatsApp, email, and WeChat",
    subtitle:
      "Cross-platform message prioritization and response routing",
    industry: "Apparel & Footwear",
    acknowledgment: `Got it — I'll triage the 70+ inbound messages across all four channels and make sure nothing falls through the cracks.

1. Pull unread messages from Slack, WhatsApp, email, and WeChat
2. Classify each thread by urgency, owner, and required action
3. Route supplier messages vs. internal messages vs. customer escalations
4. Draft responses for threads that need your voice and assign the rest

Let me get started.`,
    permissions: {
      autoApproved: [
        "Slack — read channels & DMs",
        "WhatsApp Business API — read inbound",
        "Gmail — read inbox & sent",
        "WeChat Work — read messages",
      ],
      requiresApproval: [
        "Send replies on your behalf",
        "Reassign threads to team members",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Ingest messages from all channels",
        detail:
          "Pulled 74 unread threads: 31 from Slack (#sourcing-updates, #logistics-apac, DMs from Lisa Chen), 18 from Gmail (12 supplier threads, 6 internal), 14 from WhatsApp (Dongguan Textiles group, Saigon Knits direct), and 11 from WeChat (Shanghai Dyeing Co., Hangzhou Trim Supply). Oldest unread is 6 hours old — a WhatsApp voice note from Tony at Dongguan Textiles about fabric shrinkage on PO-4417.",
        sources: [
          "Slack API",
          "Gmail API",
          "WhatsApp Business API",
          "WeChat Work API",
        ],
      },
      {
        type: "reasoning",
        label: "Classify urgency and assign owners",
        detail:
          'Classified all 74 threads into four tiers:\n\n**Critical (needs your reply now) — 6 threads:**\n• WhatsApp: Tony @ Dongguan Textiles — fabric shrinkage test failed on PO-4417 ($128K, ships Mar 28)\n• Email: Jennifer Wu @ Saigon Knits — counter-offer on SS26 costing, $0.42 above target\n• Slack DM: Lisa Chen (your director) — asking for update on Vietnam capacity for Q4\n• WeChat: Mr. Zhang @ Shanghai Dyeing — dye lot approval needed by EOD or 3-day delay\n• Email: Bill.com notification — 4 invoices past payment terms, vendors escalating\n• Slack #logistics-apac: Freight forwarder flagging container rollover at Yantian port\n\n**Team can handle — 28 threads:**\n• 14 routine WIP updates from vendors (route to Sarah, production coordinator)\n• 8 internal Slack threads about sample approvals (route to design team)\n• 6 logistics status pings (route to Mike, logistics lead)\n\n**FYI only — 31 threads:**\n• Slack channel announcements, newsletter digests, meeting reminders\n\n**Spam/irrelevant — 9 threads:**\n• Vendor marketing emails, duplicate notifications',
      },
      {
        type: "data_pull",
        label: "Pull context for critical threads",
        detail:
          "Gathered background on the 6 critical threads:\n\n• **PO-4417 (Dongguan Textiles):** 12,000 yds cotton twill for Style FW26-3382. Shrinkage spec is ≤3%, Tony reports lab result at 4.1%. Re-test or re-dye adds 5 days. Current on-time rate for this vendor: 82%.\n• **Saigon Knits SS26 costing:** 8 styles, average target $4.85/unit, their counter is $5.27. Gap is $0.42 × 45,000 units = $18,900 total impact.\n• **Lisa Chen capacity ask:** Vietnam factories at 91% utilization through Oct. Only Saigon Knits has 15K unit/month slack.\n• **Shanghai Dyeing dye lot:** Pantone 19-4052 (Classic Blue) — lab dip #3 approved last week, but production lot shifted 0.5 delta E. Need visual sign-off.\n• **Bill.com invoices:** Apex Trim ($14,200, 8 days past Net-30), Jiangsu Buttons ($8,750, 3 days past), two others under $5K.\n• **Yantian container:** COSCO vessel CSCL Saturn, ETD was Mar 20, now showing Mar 24. Affects 3 POs worth $287K retail.",
        sources: [
          "ERP — PO detail",
          "PLM — style costing",
          "Bill.com — invoice aging",
          "CargoSmart — vessel tracking",
        ],
      },
      {
        type: "reasoning",
        label: "Draft responses for critical threads",
        detail:
          'Prepared 6 draft responses:\n\n1. **Tony @ Dongguan (WhatsApp):** "Tony, thanks for flagging. Please send the full test report — we need wash method, cycle count, and measurement points. If confirmed at 4.1%, let\'s discuss a re-finish treatment before re-dyeing. Can you get a re-test by tomorrow 2pm HKT?"\n\n2. **Jennifer @ Saigon Knits (Email):** Counter-proposal breaking down the $0.42 gap: accept $0.18 on yarn cost increase (verified via CCF index), push back on $0.24 margin uplift. Propose meeting halfway at $5.06 with volume commitment of 50K+ units.\n\n3. **Lisa Chen (Slack DM):** Summary of Vietnam capacity — Saigon Knits has 15K/mo slack, recommend shifting 2 styles from Dongguan to free up capacity and de-risk.\n\n4. **Mr. Zhang @ Shanghai Dyeing (WeChat):** Request side-by-side photo of lab dip vs. production lot under D65 light. If delta E is truly 0.5, recommend approval with note.\n\n5. **Bill.com invoices (Email to AP):** Priority list — pay Apex Trim immediately (they hold up 3 POs if they stop shipping), Jiangsu Buttons can wait 5 more days.\n\n6. **Yantian rollover (Slack):** Alert team, check if air-freight partial shipment is viable for the highest-margin PO (PO-4401, $94K retail, 62% margin).',
      },
      {
        type: "human_input",
        label: "Review and approve message responses",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've drafted responses for all 6 critical threads. The key decisions embedded in these replies:\n\n• **Dongguan shrinkage** — requesting re-test before committing to re-finish (saves 2 days vs. jumping to re-dye)\n• **Saigon Knits costing** — counter at $5.06/unit (splitting the $0.42 gap, accepting yarn increase, rejecting margin uplift)\n• **Shanghai Dyeing dye lot** — leaning approve if delta E confirmed at 0.5\n• **AP prioritization** — Apex Trim first ($14.2K), Jiangsu Buttons can wait\n• **Yantian rollover** — flagging air-freight option for PO-4401 only\n\nShall I send all responses as drafted, or do you want to revise any before they go out?",
        approvalButtons: ["Send all responses", "Let me revise first"],
      },
      {
        type: "data_pull",
        label: "Route remaining threads to team",
        detail:
          "Assigned 28 threads to team members:\n• **Sarah (Production Coordinator):** 14 WIP update threads — tagged in Slack with summary of what each vendor reported and which milestones moved\n• **Design Team:** 8 sample approval threads — forwarded with lab dip photos and approval deadlines\n• **Mike (Logistics Lead):** 6 logistics threads — consolidated into a single status table with PO numbers, current location, and ETA changes\n\nArchived 31 FYI threads with read receipts. Marked 9 spam threads as junk across all platforms.",
        sources: [
          "Slack API — message routing",
          "Gmail API — forwarding",
          "Team assignment matrix",
        ],
      },
      {
        type: "result",
        label: "All channels triaged and cleared",
        detail:
          "All 74 messages processed:\n\n• **6 critical threads** — responses sent from your accounts across WhatsApp, email, Slack, and WeChat\n• **28 threads** — routed to Sarah (14), Design (8), and Mike (6) with context summaries\n• **31 FYI threads** — archived\n• **9 spam threads** — marked junk\n\n**Zero threads without an owner.** Next check-in recommended in 4 hours. I've set a reminder to re-scan all channels at 2:00 PM your time.",
      },
    ],
    completionMessage:
      "All 74 messages triaged — 6 critical responses sent, 28 routed to team, 40 archived. No threads left unowned.",
  },

  // ── 22. calendar-production-tracking ────────────────────────────────────
  {
    id: "calendar-production-tracking",
    title: "Track production milestones against the master calendar",
    subtitle:
      "Calendar-based milestone verification with on-time metrics and cost tracking",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll check all upcoming milestones against the master production calendar and flag anything that's slipping.

1. Pull the master calendar and identify milestones due this week and overdue
2. Cross-reference vendor-reported dates against planned dates
3. Calculate on-time delivery rate and flag duty/cost impacts from delays
4. Compile a status report with updated metrics by season

Let me get started.`,
    permissions: {
      autoApproved: [
        "Master Calendar — Google Sheets (read)",
        "ERP — PO milestone dates",
        "Vendor portal — shipment status",
        "Duty rate schedule — customs database",
      ],
      requiresApproval: [
        "Update milestone dates in master calendar",
        "Send delay notifications to stakeholders",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Load master production calendar",
        detail:
          "Loaded the SS26 and FW26 master calendars from Google Sheets. Currently tracking 342 active POs across 18 vendors.\n\n**This week's milestones (Mar 16–22):**\n• 27 milestones due: 14 fabric-in-house, 6 cutting complete, 4 PP sample approval, 3 final inspection\n• 8 milestones already overdue from last week (carried forward)\n\n**Season breakdown:**\n• SS26: 189 POs, 78% of milestones on track\n• FW26: 153 POs, early stage — 91% on track (mostly fabric sourcing phase)",
        sources: [
          "Master Calendar — Google Sheets",
          "ERP — PO milestone extract",
        ],
      },
      {
        type: "data_pull",
        label: "Cross-reference vendor-reported dates",
        detail:
          'Checked vendor-reported updates against planned dates for all 35 milestones (27 due + 8 overdue):\n\n**On track (19 milestones):**\n• 14 fabric-in-house confirmed by mills, 5 cutting/sewing on schedule\n\n**Delayed (12 milestones):**\n• PO-4388 (Saigon Knits) — cutting delayed 4 days, fabric arrived with shade variation. Impact: ex-factory pushed from Apr 8 → Apr 12\n• PO-4392, PO-4395 (Dongguan Textiles) — fabric-in-house late by 6 days. Waiting on re-dyed lot. Combined value: $214,000\n• PO-4401 (Apex Manufacturing) — PP sample rejected, re-submit due Mar 20. If approved, no ex-factory impact\n• PO-4410 through PO-4414 (Hangzhou Garment Co.) — 5 POs, cutting delayed 2 days due to Chinese holiday overtime restrictions. Vendor says recoverable\n• PO-4420, PO-4421, PO-4423 (Jiangsu Prime) — 3 POs, sewing behind by 3 days. Vendor added second shift\n\n**At risk (4 milestones):**\n• PO-4399 (Myanmar Stitch Co.) — final inspection was due Mar 14, vendor unresponsive for 48 hours. $87,500 PO value.',
        sources: [
          "Vendor portal — milestone updates",
          "WhatsApp message history",
          "Email — vendor correspondence",
        ],
      },
      {
        type: "reasoning",
        label: "Calculate on-time metrics and cost impact",
        detail:
          "**On-Time Delivery Rate (rolling 90 days):**\n• Overall: 74.3% (target: 85%) — down from 78.1% last month\n• By vendor tier:\n  - Tier 1 (strategic): 81.2% — Saigon Knits 79%, Dongguan Textiles 76%, Apex Manufacturing 88%\n  - Tier 2 (preferred): 71.4% — Hangzhou Garment 68%, Jiangsu Prime 74%\n  - Tier 3 (spot): 62.0% — Myanmar Stitch 55%\n\n**Cost Impact of Current Delays:**\n• PO-4392/4395 delay → misses vessel cutoff Mar 25. Air freight option: +$18,400 (vs. $3,200 ocean). Recommend ocean + 4-day delay to DC.\n• PO-4399 (Myanmar) — if ships 7+ days late, hits 25% duty rate window instead of 19.5% under GSP timing. Duty impact: +$4,812 on $87,500 FOB.\n• PO-4410–4414 (Hangzhou) — if 2-day delay holds, no cost impact. If extends to 5+, overlaps with SS26 markdown calendar → margin erosion of ~$32K retail.\n\n**Season Cost Summary:**\n• SS26 landed margin: 58.2% (budget: 59.5%) — $1.3M gap driven by freight surcharges and 3 air-shipped POs in Feb\n• FW26 projected margin: 61.0% (budget: 60.5%) — favorable, wool costs came in 4% below estimate",
      },
      {
        type: "human_input",
        label: "Approve calendar updates and delay notifications",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Based on the milestone check, here are the proposed actions:\n\n**Calendar updates (12 milestones):**\n• Push ex-factory dates for PO-4388, PO-4392, PO-4395, PO-4420/21/23 per vendor-confirmed revised dates\n• Keep PO-4410–4414 at original dates (vendor says recoverable)\n• Flag PO-4399 as \"at risk — vendor unresponsive\"\n\n**Notifications to send:**\n• Planning team: 4 POs will miss DC receipt window — recommend markdown calendar adjustment for PO-4392/4395\n• Logistics: Request vessel booking change for PO-4388 (new ETD Apr 14)\n• Sourcing director: Escalation on Myanmar Stitch — 48hr no-response, OTD at 55%\n\n**Cost decision needed:**\n• PO-4392/4395: Ocean freight (save $15.2K, 4-day late to DC) vs. air freight (on-time to DC)\n\nShall I update the calendar and send these notifications?",
        approvalButtons: [
          "Update calendar & notify",
          "Let me adjust first",
        ],
      },
      {
        type: "data_pull",
        label: "Update master calendar and send notifications",
        detail:
          "Updated 12 milestone dates in the master calendar Google Sheet. Color-coded:\n• Red: PO-4399 (vendor unresponsive)\n• Orange: PO-4392, PO-4395 (confirmed delays, vessel rebooking needed)\n• Yellow: PO-4388, PO-4420/21/23 (minor delays, recoverable)\n\nSent 3 notification emails:\n• Planning team — DC receipt impact summary with affected POs and recommended markdown calendar shifts\n• Logistics (Mike) — vessel rebooking request for PO-4388, including new ETD and container details\n• Sourcing director (Lisa Chen) — Myanmar Stitch escalation with vendor scorecard attached (55% OTD, 3 quality incidents in 6 months)",
        sources: [
          "Master Calendar — Google Sheets (write)",
          "Gmail — outbound notifications",
        ],
      },
      {
        type: "result",
        label: "Production calendar updated with current status",
        detail:
          "**Milestone check complete for week of Mar 16–22:**\n\n• **19 of 35 milestones on track** (54%)\n• **12 milestones delayed** — calendar updated with revised dates\n• **4 milestones at risk** — escalation sent on Myanmar Stitch\n• **Rolling OTD: 74.3%** (target 85%) — trending down, driven by Tier 2/3 vendors\n\n**Cost exposure from delays:** $55.2K potential (duty timing + possible air freight + markdown risk)\n\n**SS26 landed margin:** 58.2% vs. 59.5% budget — $1.3M gap\n**FW26 projected margin:** 61.0% vs. 60.5% budget — on track\n\nNext milestone check scheduled for Friday Mar 20.",
      },
    ],
    completionMessage:
      "Calendar updated — 12 delays logged, 3 escalations sent. OTD at 74.3%, $55.2K cost exposure flagged.",
  },

  // ── 23. supplier-cost-negotiation ──────────────────────────────────────
  {
    id: "supplier-cost-negotiation",
    title: "Negotiate style costs with suppliers via email",
    subtitle:
      "Tech pack distribution and iterative cost negotiation with target price alignment",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll manage the cost negotiation for these new styles — from tech pack distribution through to agreed pricing.

1. Export tech packs from PLM as PDFs and distribute to target suppliers
2. Collect and compare supplier cost proposals against target margins
3. Negotiate line-by-line on cost drivers where proposals exceed targets
4. Finalize agreed costs and update the costing sheet

Let me get started.`,
    permissions: {
      autoApproved: [
        "PLM (Centric) — export tech packs as PDF",
        "Gmail — read/send supplier correspondence",
        "Costing Sheet — Google Sheets (read)",
      ],
      requiresApproval: [
        "Accept supplier cost proposals",
        "Update final costs in costing sheet",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Export tech packs from PLM",
        detail:
          "Exported 6 tech packs from Centric PLM as PDFs for the FW26 outerwear capsule:\n\n• Style FW26-7201 — Quilted Puffer Jacket (3 colorways)\n• Style FW26-7202 — Wool Blend Topcoat (2 colorways)\n• Style FW26-7203 — Waterproof Shell Parka (4 colorways)\n• Style FW26-7204 — Sherpa-Lined Trucker Jacket (3 colorways)\n• Style FW26-7205 — Down Vest (2 colorways)\n• Style FW26-7206 — Waxed Cotton Field Jacket (2 colorways)\n\nEach PDF includes BOM, construction details, measurements, artwork placement, and packaging specs. Total: 142 pages across 6 files. Vendors cannot access PLM directly, so PDF export is required for every costing round.",
        sources: ["Centric PLM — tech pack export"],
      },
      {
        type: "data_pull",
        label: "Send tech packs to suppliers and collect proposals",
        detail:
          "Emailed tech packs to 3 suppliers with costing request (7-day turnaround):\n\n• **Saigon Knits (Vietnam)** — received all 6 style proposals\n• **Dongguan Textiles (China)** — received 5 of 6 (declined FW26-7203 waterproof shell — not in their capability)\n• **Apex Manufacturing (Bangladesh)** — received 4 of 6 (declined FW26-7202 wool coat and FW26-7206 waxed cotton — material sourcing challenges)\n\n**Cost comparison vs. target (FOB per unit):**\n\n| Style | Target | Saigon Knits | Dongguan | Apex |\n|-------|--------|-------------|----------|------|\n| FW26-7201 Puffer | $28.50 | $30.20 | $29.85 | $27.90 |\n| FW26-7202 Topcoat | $42.00 | $46.50 | $44.75 | — |\n| FW26-7203 Shell | $35.00 | $38.10 | — | $34.20 |\n| FW26-7204 Trucker | $24.00 | $25.40 | $24.80 | $23.60 |\n| FW26-7205 Vest | $18.50 | $19.20 | $18.90 | $17.80 |\n| FW26-7206 Field Jkt | $33.00 | $35.80 | $34.50 | — |\n\nLargest gap: FW26-7202 Topcoat — Saigon Knits at $46.50 vs. $42.00 target (+$4.50, 10.7% over).",
        sources: [
          "Gmail — supplier proposals",
          "Costing Sheet — Google Sheets",
        ],
      },
      {
        type: "reasoning",
        label: "Analyze cost breakdowns and identify negotiation levers",
        detail:
          "Broke down supplier costs by component to find negotiation points:\n\n**FW26-7202 Topcoat (biggest gap — Saigon Knits $46.50 vs. $42.00):**\n• Fabric: $22.80 (wool blend at $14.20/yd × 1.6 yds) — wool prices up 8% YoY, partially justified\n• Trim: $3.40 — horn buttons at $0.85 each × 4 — suggest switching to resin horn-look ($0.32 each), saves $2.12\n• Labor: $12.50 — 85 minutes at $8.82/hr — high for Vietnam, benchmark is 72 min. Push for efficiency\n• Packaging: $1.80 — standard, no issue\n• Margin: $6.00 (12.9%) — above their typical 10%, room to negotiate\n\n**Negotiation strategy per style:**\n• FW26-7201: Apex is below target at $27.90 — award to Apex if quality sample passes\n• FW26-7202: Negotiate Saigon Knits down via trim swap + labor efficiency + margin compression → target $43.20 (accept $1.20 over original target given wool market)\n• FW26-7203: Apex at $34.20 — already $0.80 below target. Lock in.\n• FW26-7204: Apex lowest at $23.60, below target. Award.\n• FW26-7205: Apex lowest at $17.80, below target. Award.\n• FW26-7206: Dongguan at $34.50 — negotiate trim and finishing costs, target $33.50",
      },
      {
        type: "data_pull",
        label: "Send counter-proposals to suppliers",
        detail:
          "Sent detailed counter-proposal emails to each supplier:\n\n**To Saigon Knits:**\n• FW26-7202: Counter at $43.20 — itemized: accept fabric at $22.80, trim reduction to $1.28 (resin buttons), labor at $11.50 (72 min benchmark), margin at 10.5%. Attached comparable labor rates from 2 other Vietnamese factories.\n• FW26-7201: Counter at $28.50 (target) — noted Apex is more competitive; giving Saigon Knits right of first refusal given relationship\n\n**To Dongguan Textiles:**\n• FW26-7206: Counter at $33.50 — identified $1.00 savings in wax treatment (their quote used premium Japanese wax; suggest UK-sourced alternative at same spec)\n\n**To Apex Manufacturing:**\n• FW26-7201, 7203, 7204, 7205: Confirming intent to award at quoted prices pending quality samples. Requested sample ship by Mar 28.\n\nAwaiting responses — typically 48–72 hours for counter-round.",
        sources: ["Gmail — outbound counter-proposals"],
      },
      {
        type: "system_read",
        label: "Receive and evaluate counter-responses",
        detail:
          "All 3 suppliers responded within 48 hours:\n\n**Saigon Knits:**\n• FW26-7202: Accepted trim swap to resin buttons. Countered at $44.10 (vs. our $43.20). Split difference on labor — 78 min instead of 72 min. Margin at 11%.\n• FW26-7201: Matched $28.50 target to retain the style\n\n**Dongguan Textiles:**\n• FW26-7206: Accepted UK wax alternative. Final offer $33.80 — $0.30 of difference is MOQ-related (need 3,000 unit minimum for that price vs. our planned 2,200). Willing to do $33.80 at 2,500+.\n\n**Apex Manufacturing:**\n• FW26-7201, 7203, 7204, 7205: Confirmed all prices. Samples shipping Mar 27. Requested 50% deposit on FW26-7203 due to waterproof membrane pre-buy ($12,400 deposit).",
        sources: ["Gmail — supplier responses"],
      },
      {
        type: "human_input",
        label: "Approve final cost agreements",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's where negotiations landed. Recommended awards:\n\n| Style | Supplier | Agreed FOB | vs. Target | Notes |\n|-------|----------|-----------|------------|-------|\n| FW26-7201 Puffer | Saigon Knits | $28.50 | On target | Matched to retain |\n| FW26-7202 Topcoat | Saigon Knits | $44.10 | +$2.10 (5%) | Wool market + labor, best available |\n| FW26-7203 Shell | Apex Mfg | $34.20 | -$0.80 | Needs $12.4K membrane deposit |\n| FW26-7204 Trucker | Apex Mfg | $23.60 | -$0.40 | Below target |\n| FW26-7205 Vest | Apex Mfg | $17.80 | -$0.70 | Below target |\n| FW26-7206 Field Jkt | Dongguan | $33.80 | +$0.80 (2.4%) | Need to increase MOQ to 2,500 |\n\n**Total capsule FOB cost:** $181.00/set vs. $181.00 target = exactly on aggregate target\n**Apex deposit required:** $12,400 for waterproof membrane pre-buy\n\nShall I lock in these costs and update the costing sheet?",
        approvalButtons: ["Lock in all costs", "Renegotiate selected styles"],
      },
      {
        type: "result",
        label: "Costs agreed and costing sheet updated",
        detail:
          "**FW26 Outerwear Capsule — Costing Complete**\n\nAll 6 styles costed and awarded:\n• **Saigon Knits:** 2 styles (FW26-7201, FW26-7202) — $72.60 combined FOB\n• **Apex Manufacturing:** 3 styles (FW26-7203, 7204, 7205) — $75.60 combined FOB\n• **Dongguan Textiles:** 1 style (FW26-7206) — $33.80 FOB\n\nCosting sheet updated in Google Sheets with final FOB, duty rates, landed costs, and target retail margins. Confirmation emails sent to all 3 suppliers with agreed pricing. Apex deposit request of $12,400 forwarded to AP for processing.\n\nOverall capsule landed margin: 59.8% vs. 59.5% budget — on track.",
      },
    ],
    completionMessage:
      "All 6 FW26 outerwear styles costed — aggregate FOB on target at $181.00/set. Costing sheet updated, supplier confirmations sent.",
  },

  // ── 24. po-payment-prioritization ──────────────────────────────────────
  {
    id: "po-payment-prioritization",
    title: "Prioritize and process PO payments to vendors",
    subtitle:
      "Payment queue management with vendor term compliance and AP coordination",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll sort through the pending PO payments, prioritize by urgency, and get them queued for processing.

1. Scrape email and ERP for all outstanding vendor invoices and payment requests
2. Match invoices to POs and verify payment terms per vendor agreement
3. Prioritize payments based on ship-before-pay requirements and relationship risk
4. Submit to Bill.com/Ramp and coordinate with AP for release

Let me get started.`,
    permissions: {
      autoApproved: [
        "Gmail — search for invoices and payment requests",
        "ERP — PO and invoice data",
        "Bill.com — read payment queue",
        "Ramp — read pending transactions",
      ],
      requiresApproval: [
        "Submit payments via Bill.com",
        "Escalate payment priority to AP/Finance",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Collect outstanding invoices from all sources",
        detail:
          "Scraped Gmail, ERP, and payment platforms for all outstanding vendor invoices:\n\n**Total outstanding: 23 invoices, $847,320**\n\nBreakdown by source:\n• Gmail (invoice PDFs attached): 9 invoices — vendors emailed directly\n• ERP (auto-matched to POs): 11 invoices — entered by receiving team\n• Bill.com queue (pending approval): 3 invoices — already uploaded but not approved\n\nOldest unpaid: INV-2024-1187 from Apex Trim Supply, $14,200, issued Feb 12 (34 days outstanding). Newest: INV-2024-1298 from Saigon Knits, $128,500, issued Mar 15 (3 days outstanding).",
        sources: [
          "Gmail — invoice search",
          "ERP — AP module",
          "Bill.com — pending queue",
        ],
      },
      {
        type: "data_pull",
        label: "Match invoices to POs and verify payment terms",
        detail:
          "Matched all 23 invoices to POs and pulled vendor payment terms:\n\n**Pay-before-ship (CRITICAL — blocks production):**\n• Jiangsu Buttons — INV-1245, $8,750 — Net-15 terms, 3 days past due. PO-4388 buttons won't ship until paid. Blocks cutting for 4 POs.\n• Shanghai Dyeing Co. — INV-1261, $34,200 — 50% deposit required before dye lot starts. PO-4410–4414 fabric dyeing on hold.\n• Hangzhou Trim — INV-1270, $6,100 — COD terms. Zippers for PO-4401 ready but held at factory gate.\n\n**Pay-on-shipment (due within days of vessel):**\n• Saigon Knits — INV-1298, $128,500 — Net-30 from B/L date. B/L issued Mar 12. Due Apr 11. No urgency yet.\n• Dongguan Textiles — INV-1289, $97,800 — Net-45 from invoice date. Due Apr 22. On track.\n• Apex Manufacturing — INV-1291, $64,300 — Net-30, due Apr 8.\n\n**Standard terms (not blocking):**\n• 17 remaining invoices, $507,670 total — all within terms, due dates ranging Apr 1–May 15.\n\n**Discrepancies found:**\n• INV-1256 (Dongguan Textiles, $12,400) — invoice amount doesn't match PO. PO-4395 shows $11,800. Difference of $600 — likely a surcharge not on PO. Need clarification.",
        sources: [
          "ERP — PO terms & matching",
          "Vendor master — payment terms",
        ],
      },
      {
        type: "reasoning",
        label: "Build prioritized payment queue",
        detail:
          "**Priority 1 — PAY IMMEDIATELY ($49,050):**\nThese block active production:\n1. Shanghai Dyeing Co. — $34,200 (deposit, blocks 5 POs worth $214K retail)\n2. Apex Trim Supply — $14,200 (34 days past due, vendor threatening to halt shipments — affects 3 POs)\n3. Hangzhou Trim — $6,100 (COD, zippers sitting at factory gate)\n4. Jiangsu Buttons — $8,750 (3 days past Net-15, blocks cutting) — *but subtract $600 to investigate INV-1256 discrepancy, pay $8,150 now*\n\nWait — Jiangsu Buttons $8,750 is a separate invoice from the $12,400 discrepancy. Pay full $8,750 on INV-1245.\n\nRevised Priority 1 total: $63,250\n\n**Priority 2 — PAY THIS WEEK ($0 additional):**\nNothing else due this week.\n\n**Priority 3 — SCHEDULE FOR TERMS ($507,670):**\nSchedule in Bill.com for auto-pay on due dates.\n\n**Hold for clarification ($12,400):**\nINV-1256 — email Dongguan for invoice breakdown before paying.\n\n**Not yet due ($271,600):**\nSaigon Knits, Dongguan Textiles, Apex Manufacturing — schedule reminders 5 days before due.",
      },
      {
        type: "human_input",
        label: "Approve payment priority and amounts",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the proposed payment plan:\n\n**Pay today — $63,250 (blocks production if delayed):**\n• Shanghai Dyeing Co. — $34,200 (deposit for 5 POs)\n• Apex Trim Supply — $14,200 (34 days overdue, vendor escalating)\n• Jiangsu Buttons — $8,750 (buttons for PO-4388)\n• Hangzhou Trim — $6,100 (COD, zippers at gate)\n\n**On hold — $12,400:**\n• Dongguan Textiles INV-1256 — $600 discrepancy vs. PO. Will email vendor for clarification.\n\n**Scheduled for due dates — $771,670:**\n• 18 invoices queued in Bill.com for auto-pay on respective due dates\n\nI'll submit the Priority 1 payments via Bill.com and send an email to AP (Karen in Finance) flagging these as urgent releases. Shall I proceed?",
        approvalButtons: [
          "Process payments",
          "Adjust priority list",
        ],
      },
      {
        type: "data_pull",
        label: "Submit payments and coordinate with AP",
        detail:
          "**Payments submitted:**\n• Bill.com: Created 4 payment requests totaling $63,250\n  - Shanghai Dyeing Co. — $34,200 via wire (same-day for international)\n  - Apex Trim Supply — $14,200 via ACH (2-day domestic)\n  - Jiangsu Buttons — $8,750 via wire\n  - Hangzhou Trim — $6,100 via wire\n\n**AP coordination:**\n• Emailed Karen (AP Manager) with subject \"URGENT: 4 payments blocking production — $63,250\" — included PO numbers, production impact, and requested same-day approval for wire transfers\n• Karen responded within 20 minutes — approved all 4, wires processing today\n\n**Discrepancy follow-up:**\n• Emailed Dongguan Textiles about INV-1256 $600 variance — asked for itemized breakdown\n\n**Scheduled payments:**\n• 18 invoices set up in Bill.com with auto-pay on due dates. Earliest: Apr 1 ($42,300 to Pacific Shipping). Latest: May 15 ($18,900 to Fabric World).",
        sources: [
          "Bill.com — payment submission",
          "Gmail — AP coordination",
        ],
      },
      {
        type: "result",
        label: "Payments prioritized and processed",
        detail:
          "**Payment processing complete:**\n\n• **4 urgent payments submitted:** $63,250 — all approved by AP, wires processing today\n  - Shanghai Dyeing ($34.2K), Apex Trim ($14.2K), Jiangsu Buttons ($8.75K), Hangzhou Trim ($6.1K)\n• **18 payments scheduled:** $771,670 — queued in Bill.com for auto-pay on due dates\n• **1 invoice on hold:** $12,400 — pending vendor clarification on $600 discrepancy\n\n**Production unblocked:**\n• 5 POs can start fabric dyeing (Shanghai Dyeing deposit released)\n• 3 POs at Apex Trim resume shipping\n• PO-4388 cutting can proceed (buttons releasing)\n• PO-4401 zippers releasing from Hangzhou factory gate\n\nTotal outstanding AP: $847,320 → $784,070 after today's payments clear.",
      },
    ],
    completionMessage:
      "4 urgent payments ($63.2K) processed to unblock 9+ POs. 18 invoices scheduled. 1 held for discrepancy review.",
  },

  // ── 25. wip-tracking-vendor-scorecard ──────────────────────────────────
  {
    id: "wip-tracking-vendor-scorecard",
    title: "Track WIP milestones and score vendor performance",
    subtitle:
      "Production milestone tracking with audit trail and vendor performance scoring",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll track all active WIP milestones, log any date changes with an audit trail, and update vendor scorecards.

1. Pull current milestone status for all in-production POs
2. Compare vendor-reported dates against original PO dates and log changes
3. Calculate lateness metrics and update vendor performance scores
4. Flag critical late items and generate the weekly scorecard report

Let me get started.`,
    permissions: {
      autoApproved: [
        "ERP — PO milestone dates (read)",
        "WIP Tracker — Google Sheets (read/write)",
        "Vendor portal — status updates",
        "Gmail — vendor correspondence",
      ],
      requiresApproval: [
        "Publish vendor scorecards to sourcing team",
        "Flag vendors for performance review",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull WIP status for all active POs",
        detail:
          "Loaded WIP status for 47 active POs across 8 vendors. Milestones tracked per PO:\n• Fabric in-house → Cutting start → Cutting complete → Sewing start → Sewing complete → Washing/finishing → Final inspection → Ex-factory\n\n**Current snapshot:**\n• 12 POs in fabric stage (early)\n• 18 POs in cutting/sewing (mid-production)\n• 11 POs in finishing/inspection (late stage)\n• 6 POs shipped but not yet at port (in-transit WIP)\n\nVendors reporting via: WhatsApp photos (31 POs), email updates (9 POs), vendor portal uploads (7 POs). Three vendors still send updates via WeChat voice messages that need manual transcription.",
        sources: [
          "WIP Tracker — Google Sheets",
          "ERP — PO milestone extract",
          "Vendor portal",
        ],
      },
      {
        type: "data_pull",
        label: "Compare reported dates against original PO dates",
        detail:
          "Cross-referenced all vendor-reported milestone dates against original PO schedule. Logging every change with timestamp and source:\n\n**Date changes detected this week (18 changes across 11 POs):**\n\n• **PO-4388 (Saigon Knits):**\n  - Cutting complete: Mar 10 → Mar 14 (+4 days) — logged Mar 14, source: WhatsApp photo of cutting room\n  - Sewing start: Mar 12 → Mar 16 (+4 days) — cascading delay\n  - Audit note: \"Fabric shade variation on lot SK-2024-887. Re-cut 800 units.\"\n\n• **PO-4392 (Dongguan Textiles):**\n  - Fabric in-house: Mar 8 → Mar 14 (+6 days) — logged Mar 14, source: email from factory manager\n  - All downstream milestones pushed 6 days\n  - Audit note: \"Re-dye required per buyer request (shade too dark on first lot)\"\n\n• **PO-4399 (Myanmar Stitch Co.):**\n  - Sewing complete: Mar 10 → unknown — vendor unresponsive since Mar 12\n  - Final inspection: Mar 14 → TBD\n  - Audit note: \"48+ hours no response. Last contact: WhatsApp read receipt Mar 12 3:47 PM.\"\n\n• **PO-4410–4414 (Hangzhou Garment, 5 POs):**\n  - Cutting start delayed 2 days across all 5 — overtime restrictions during Qingming prep\n  - Vendor committed to recover by sewing stage\n\n• **PO-4420–4423 (Jiangsu Prime, 3 POs):**\n  - Sewing behind 3 days — second shift added\n  - Audit note: \"Machine breakdown on Line 4, repaired Mar 15. Second shift operational.\"",
        sources: [
          "WhatsApp — vendor photos/messages",
          "Gmail — vendor emails",
          "WIP Tracker — historical dates",
        ],
      },
      {
        type: "reasoning",
        label: "Calculate vendor performance scores",
        detail:
          "Calculated vendor scorecards using weighted metrics (rolling 6 months):\n\n**Scoring model:** OTD (40%) + Quality (25%) + Communication (20%) + Cost Competitiveness (15%)\n\n| Vendor | OTD | Quality | Comms | Cost | **Overall** | Trend |\n|--------|-----|---------|-------|------|-------------|-------|\n| Apex Manufacturing | 88% | 92% | 90% | 85% | **89.1** | ↑ +2.3 |\n| Saigon Knits | 79% | 85% | 88% | 82% | **82.8** | ↓ -1.5 |\n| Dongguan Textiles | 76% | 80% | 82% | 88% | **80.4** | ↓ -3.1 |\n| Jiangsu Prime | 74% | 78% | 75% | 90% | **78.1** | → flat |\n| Hangzhou Garment | 68% | 82% | 70% | 86% | **74.8** | ↓ -2.0 |\n| Shanghai Dyeing (mill) | 72% | 88% | 65% | 80% | **75.5** | → flat |\n| Hangzhou Trim (trim) | 85% | 90% | 60% | 78% | **79.3** | ↑ +1.0 |\n| **Myanmar Stitch Co.** | **55%** | **70%** | **40%** | **92%** | **62.3** | **↓ -8.7** |\n\n**Flags:**\n• Myanmar Stitch Co. score dropped below 65 threshold — triggers mandatory performance review per sourcing policy\n• Dongguan Textiles down 3.1 points — approaching watch list (below 78)\n• Hangzhou Garment communication score (70%) driven by inconsistent WIP reporting format — they send WeChat voice memos instead of structured updates",
      },
      {
        type: "human_input",
        label: "Review scorecards and approve distribution",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Vendor scorecards are ready for the week of Mar 16. Key actions I recommend:\n\n**Mandatory performance review:**\n• Myanmar Stitch Co. — score 62.3 (below 65 threshold). Recommend scheduling a call with their GM this week. They're the cheapest vendor (cost score 92%) but OTD at 55% and communication at 40% is unsustainable. Currently unresponsive on PO-4399 ($87.5K).\n\n**Watch list addition:**\n• Dongguan Textiles — score 80.4, down 3.1 points. Two consecutive months of decline. Re-dye issues on PO-4392/4395 are symptomatic.\n\n**Positive recognition:**\n• Apex Manufacturing — score 89.1, up 2.3 points. Best performer. Recommend increasing allocation for FW26.\n\nShall I publish these scorecards to the sourcing team and flag Myanmar Stitch for performance review?",
        approvalButtons: [
          "Publish & flag Myanmar Stitch",
          "Hold for my review",
        ],
      },
      {
        type: "data_pull",
        label: "Publish scorecards and update WIP tracker",
        detail:
          "**Published:**\n• Vendor scorecard report emailed to sourcing team (Lisa Chen, Sarah, Mike) with full breakdown and trend charts\n• Myanmar Stitch Co. flagged in vendor master as \"Performance Review Required\" — calendar invite sent for Thursday Mar 19 at 9:00 AM with Lisa Chen and Myanmar GM\n• Dongguan Textiles added to watch list with 60-day review period\n\n**WIP Tracker updated:**\n• All 18 date changes logged with audit trail (who reported, when, why)\n• Color-coded status: 36 green (on track), 8 yellow (1–3 days late), 3 red (4+ days late or unresponsive)\n• Historical date change log now has 247 entries for the current season — fully auditable",
        sources: [
          "WIP Tracker — Google Sheets (write)",
          "Gmail — scorecard distribution",
          "Google Calendar — review meeting",
        ],
      },
      {
        type: "result",
        label: "WIP milestones tracked and vendor scorecards published",
        detail:
          "**Weekly WIP & Vendor Scorecard Summary:**\n\n**Milestone tracking:**\n• 47 active POs monitored across 8 vendors\n• 18 date changes logged this week (11 POs affected)\n• 36 POs on track, 8 minor delays, 3 critical\n\n**Vendor scores (top/bottom):**\n• Best: Apex Manufacturing — 89.1 (+2.3) ↑\n• Worst: Myanmar Stitch Co. — 62.3 (-8.7) ↓ — performance review scheduled Thu Mar 19\n\n**Critical flags:**\n• PO-4399 (Myanmar Stitch) — vendor unresponsive 48+ hours, $87.5K at risk\n• PO-4392/4395 (Dongguan) — 6-day delay, re-dye in progress\n• Dongguan added to watch list (60-day review)\n\nFull audit trail maintained in WIP Tracker with 247 date-change entries this season.",
      },
    ],
    completionMessage:
      "47 POs tracked, 18 date changes logged. Myanmar Stitch flagged for review (score 62.3). Scorecards published to sourcing team.",
  },

  // ── 26. budget-file-alignment ──────────────────────────────────────────
  {
    id: "budget-file-alignment",
    title: "Align seasonal budget across finance, planning, and buying",
    subtitle:
      "Top-down/bottom-up budget reconciliation with leadership sign-off",
    industry: "Retail",
    acknowledgment: `I'll reconcile the top-down finance forecast with bottom-up buyer estimates and prepare for leadership sign-off.

1. Pull the finance forecast, planning targets, and buyer bottom-up estimates
2. Identify gaps between top-down and bottom-up by category and brand
3. Prepare reconciliation scenarios for the budget alignment meetings
4. Track sign-off on the final approved budget file

Let me get started.`,
    permissions: {
      autoApproved: [
        "Finance forecast — shared drive (read)",
        "Planning targets — Google Sheets (read)",
        "Buyer estimates — category spreadsheets (read)",
        "Prior season actuals — BI dashboard",
      ],
      requiresApproval: [
        "Lock final budget file",
        "Distribute approved budget to departments",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull finance forecast and planning targets",
        detail:
          "Loaded three source files for FW26 seasonal budget:\n\n**Finance top-down forecast:**\n• Total revenue target: $42.8M (+6% vs. FW25 actual $40.4M)\n• Gross margin target: 54.0% (vs. FW25 actual 52.8%)\n• Markdown budget: 18% of gross sales (vs. FW25 actual 21%)\n• Inventory turn target: 3.2x (vs. FW25 actual 2.9x)\n\n**Planning director targets (by division):**\n• Women's: $18.5M (43% of total)\n• Men's: $14.2M (33%)\n• Accessories: $6.8M (16%)\n• Kids: $3.3M (8%)\n\n**Key brands in plan:**\n• Nike: $8.6M allocation\n• Adidas: $5.2M\n• Own label: $12.4M\n• Other national brands: $16.6M",
        sources: [
          "Finance FW26 Forecast — shared drive",
          "Planning targets — Google Sheets",
          "FW25 actuals — BI dashboard",
        ],
      },
      {
        type: "data_pull",
        label: "Collect buyer bottom-up estimates",
        detail:
          "Gathered bottom-up estimates from 6 buyers across all categories:\n\n**Bottom-up total: $45.1M** (vs. finance top-down: $42.8M — **$2.3M gap, 5.4% over**)\n\nGap by division:\n• Women's: Buyers say $19.8M vs. plan $18.5M (+$1.3M) — driven by Buyer A's bullish coat forecast\n• Men's: Buyers say $14.6M vs. plan $14.2M (+$0.4M) — modest overshoot in athletic\n• Accessories: Buyers say $7.4M vs. plan $6.8M (+$0.6M) — new handbag brand launch\n• Kids: Buyers say $3.3M vs. plan $3.3M (on target)\n\n**Margin gap:**\n• Bottom-up blended margin: 52.1% vs. finance target 54.0% — 190bps gap\n• Root cause: Own-label margin strong at 62%, but buyer estimates assume heavier mix of national brands (lower margin) especially in Women's coats\n\n**Markdown gap:**\n• Buyers assume 22% markdown rate vs. finance target 18% — 4-point gap\n• Buyers cite FW25 reality (21%) and say 18% is unrealistic without reducing seasonal inventory risk",
        sources: [
          "Buyer A (Women's) — category spreadsheet",
          "Buyer B (Men's) — category spreadsheet",
          "Buyer C (Accessories) — category spreadsheet",
          "Buyer D (Kids) — category spreadsheet",
          "Buyer E (Own label) — costing workbook",
          "Buyer F (Athletic) — vendor plan",
        ],
      },
      {
        type: "reasoning",
        label: "Build reconciliation scenarios",
        detail:
          "Prepared 3 scenarios for the budget alignment meetings:\n\n**Scenario A — \"Meet finance target\" ($42.8M, 54% margin):**\n• Cut Women's by $1.3M — reduce coat depth (Buyer A will push back — coats were #1 category FW25)\n• Cut Accessories by $0.6M — defer handbag launch to SS27\n• Cut Men's by $0.4M — reduce athletic allocation (conflicts with Nike relationship)\n• Force 18% markdown — requires buying 12% less seasonal inventory (risky for in-stocks)\n• Margin lift: shift 8% of buy from national brands to own-label\n\n**Scenario B — \"Split the difference\" ($43.9M, 53.0% margin):**\n• Accept $1.1M overshoot from finance target (2.6%)\n• Women's: $19.2M (trim $0.6M from coats, keep core)\n• Accessories: $7.1M (launch handbag brand but at reduced depth)\n• Markdown at 20% (realistic based on FW25)\n• Own-label mix stays at current plan\n\n**Scenario C — \"Buyer-led growth\" ($45.1M, 52.1% margin):**\n• Accept full buyer estimates\n• Higher topline but margin 190bps below target\n• Requires CFO approval for increased inventory investment ($3.8M more working capital)\n• Risk: if markdowns hit 22%, actual margin drops to ~50.5%\n\n**Recommendation:** Scenario B. Achievable growth, realistic markdown, and only requires $1.1M flexibility from finance. Three budget meetings needed to align (1 per day this week).",
      },
      {
        type: "human_input",
        label: "Select scenario for leadership presentation",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've prepared three reconciliation scenarios. For the budget alignment meetings this week (3 meetings scheduled: Tue/Wed/Thu at 2 PM):\n\n• **Scenario A** — $42.8M, 54.0% margin (meets finance exactly, requires significant cuts)\n• **Scenario B** — $43.9M, 53.0% margin (recommended — balanced, realistic markdown at 20%)\n• **Scenario C** — $45.1M, 52.1% margin (buyer-led, needs CFO approval for extra working capital)\n\nI recommend presenting **Scenario B as the base case** with Scenario A as the downside and Scenario C as the upside. This gives leadership a range and lets them decide the risk appetite.\n\nShall I prepare the meeting deck with Scenario B as the lead recommendation?",
        approvalButtons: [
          "Prepare with Scenario B",
          "Choose different scenario",
        ],
      },
      {
        type: "data_pull",
        label: "Run budget meetings and track sign-offs",
        detail:
          "Facilitated 3 budget alignment meetings:\n\n**Meeting 1 (Tue) — Category deep-dive:**\n• Presented all 3 scenarios. CFO pushed for Scenario A. VP Merchandising pushed for C. Agreed to work through category-level detail.\n• Action: Buyer A to identify $600K in Women's cuts that don't touch top-performing coat styles.\n\n**Meeting 2 (Wed) — Brand-level alignment:**\n• Nike allocation locked at $8.6M (Nike rep confirmed allocation, can't reduce). Adidas flexible — buyer agreed to trim $200K.\n• Own-label team committed to 3 additional styles to capture $400K of margin improvement.\n• Running total: $44.2M topline, 53.3% margin — converging on modified Scenario B.\n\n**Meeting 3 (Thu) — Final sign-off:**\n• Leadership agreed on $44.0M topline, 53.5% margin, 19.5% markdown rate\n• Stock levels by brand approved: Nike $8.6M, Adidas $5.0M, Own-label $13.1M, Other $17.3M\n• CFO signed off on modified working capital plan ($1.2M incremental)\n• VP Merchandising signed off on category allocations\n• Planning Director confirmed inventory turn target revised to 3.1x (from 3.2x)",
        sources: [
          "Meeting notes — Google Docs",
          "Budget model — Google Sheets",
          "Sign-off emails — Gmail",
        ],
      },
      {
        type: "result",
        label: "FW26 budget file approved and distributed",
        detail:
          "**FW26 Budget File — \"The Bible\" — APPROVED**\n\n• **Topline:** $44.0M (+8.9% vs. FW25)\n• **Gross margin:** 53.5%\n• **Markdown rate:** 19.5%\n• **Inventory turn:** 3.1x\n• **Working capital:** +$1.2M incremental approved by CFO\n\n**By division:**\n• Women's: $19.2M (43.6%)\n• Men's: $14.4M (32.7%)\n• Accessories: $7.1M (16.1%)\n• Kids: $3.3M (7.5%)\n\n**By brand:** Nike $8.6M | Adidas $5.0M | Own-label $13.1M | Other $17.3M\n\nBudget file locked and distributed to all 6 buyers, planning director, finance, and VP Merchandising. Version saved as FW26_Budget_FINAL_v1_approved_20260318.xlsx.",
      },
    ],
    completionMessage:
      "FW26 budget approved at $44.0M, 53.5% margin. Budget file locked and distributed to all stakeholders.",
  },

  // ── 27. brand-buy-signoff ─────────────────────────────────────────────
  {
    id: "brand-buy-signoff",
    title: "Build and get sign-off on brand buy plan",
    subtitle:
      "Vendor assortment planning with forecast-driven buy justification",
    industry: "Retail",
    acknowledgment: `I'll build out the brand buy plans against the approved budget and prepare them for director sign-off.

1. Pull the approved budget file and vendor assortment options
2. Build buy plans per brand with style-level depth and flow timing
3. Validate buys against forecast confidence and historical sell-through
4. Present to planning and buying directors for justification and approval

Let me get started.`,
    permissions: {
      autoApproved: [
        "Budget file — Google Sheets (read)",
        "Vendor line sheets — shared drive",
        "Brand flow file — Google Sheets (read/write)",
        "BI dashboard — historical sell-through",
      ],
      requiresApproval: [
        "Submit final buy plan to vendor",
        "Lock brand flow file",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Load budget allocations and vendor assortments",
        detail:
          "Loaded the approved FW26 budget file and vendor assortment details for the top 3 brands:\n\n**Nike — $8.6M allocation:**\n• Line sheet has 284 styles offered for FW26\n• Key categories: Running ($2.8M), Lifestyle ($3.1M), Training ($1.5M), Jordan ($1.2M)\n• Nike requires buy commitments by Apr 15 (45-day lead on Fashion Tracker)\n• Historical sell-through FW25: 78% at full price\n\n**Adidas — $5.0M allocation:**\n• Line sheet has 196 styles offered\n• Key categories: Originals ($2.1M), Performance ($1.8M), Outdoor ($1.1M)\n• Adidas OOR deadline: Apr 22\n• Historical sell-through FW25: 71% at full price\n\n**Own Label — $13.1M allocation:**\n• 142 styles in development (from PLM)\n• Key categories: Outerwear ($4.2M), Knitwear ($3.5M), Denim ($2.8M), Basics ($2.6M)\n• No external deadline — controlled by internal production calendar\n• Historical sell-through FW25: 68% at full price (below target, markdown-heavy in basics)",
        sources: [
          "FW26 Budget file",
          "Nike FW26 line sheet",
          "Adidas FW26 line sheet",
          "PLM — own-label style list",
        ],
      },
      {
        type: "data_pull",
        label: "Build style-level buy plans with flow timing",
        detail:
          "Built draft buy plans for all 3 brands:\n\n**Nike — 94 styles selected from 284 offered (33% selection rate):**\n• Q3 flow (Aug–Oct): 52 styles, $5.1M — heavy on running and back-to-school lifestyle\n• Q4 flow (Nov–Jan): 42 styles, $3.5M — holiday gifting, Jordan retros\n• Average depth: 840 units/style (range: 360–2,400)\n• Top bet: Nike Air Max Pulse '26 colorway — 2,400 units, $186K cost, projected 89% sell-through\n\n**Adidas — 68 styles from 196 (35% selection rate):**\n• Q3 flow: 38 styles, $2.9M\n• Q4 flow: 30 styles, $2.1M\n• Average depth: 620 units/style\n• Top bet: Adidas Samba Lux (3 colorways) — 1,800 units total, $97K cost, projected 85% sell-through\n\n**Own Label — 118 styles from 142 in development (83% adoption):**\n• Q3 flow: 64 styles, $7.4M — outerwear and knitwear launch\n• Q4 flow: 54 styles, $5.7M — holiday basics refresh\n• Average depth: 1,100 units/style\n• Top bet: Wool-blend overcoat (Style OL-7801) — 3,200 units, $134K cost, projected 74% sell-through\n• Flagged 24 basic styles for reduced depth vs. FW25 (basics had 61% sell-through — dragged own-label average down)",
        sources: [
          "Brand flow file — Google Sheets",
          "BI — historical sell-through by style/category",
          "Demand planning forecast model",
        ],
      },
      {
        type: "reasoning",
        label: "Validate buys against forecast confidence",
        detail:
          "Ran each buy plan through forecast confidence checks:\n\n**Nike — $8.6M plan: HIGH confidence (82%)**\n• Running category forecast confidence: 88% — stable demand, repeat styles\n• Lifestyle: 79% — some risk on new colorways, but Air Max Pulse has strong pre-order signals\n• Jordan: 85% — retro releases consistently perform\n• Risk flag: 4 styles in Training category have <70% confidence — recommend reducing depth by 15% ($42K savings)\n\n**Adidas — $5.0M plan: MEDIUM confidence (74%)**\n• Originals: 82% — Samba franchise still strong but may be peaking\n• Performance: 68% — running category underperforming at our doors, down 12% YoY\n• Outdoor: 71% — new Terrex line untested at our stores\n• Risk flag: Recommend cutting Adidas Performance running by $180K and reallocating to Originals lifestyle\n\n**Own Label — $13.1M plan: MEDIUM confidence (71%)**\n• Outerwear: 78% — strong category, FW is peak season\n• Knitwear: 75% — good historical performance\n• Denim: 72% — stable but low growth\n• Basics: 59% — low confidence, FW25 clearance still fresh. Reduced depth already helps but may need further cuts.\n• Risk flag: Basics plan still at $2.6M. Recommend cutting to $2.2M and shifting $400K to knitwear (higher margin, better sell-through)",
      },
      {
        type: "human_input",
        label: "Review buy plans before director presentation",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Buy plans are built for all 3 brands. Before I present to the planning and buying directors, here are the key decisions:\n\n**Recommended adjustments:**\n1. **Nike Training:** Cut 4 low-confidence styles by 15% depth (-$42K) → reallocate to Running\n2. **Adidas Performance Running:** Cut $180K → shift to Originals lifestyle\n3. **Own-label Basics:** Cut $400K → shift to Knitwear\n\nThese changes improve blended forecast confidence from 74% to 79% without changing topline budget.\n\n**Director presentation deck includes:**\n• Style-level buy plan with unit depth, cost, and projected sell-through\n• Quarterly flow calendar showing receipt dates\n• Forecast confidence heat map by category\n• FW25 hindsight analysis supporting the adjustments\n\nShall I finalize these adjustments and present to directors?",
        approvalButtons: [
          "Finalize & present",
          "Revise adjustments first",
        ],
      },
      {
        type: "data_pull",
        label: "Present to directors and capture sign-off",
        detail:
          "Presented buy plans in two sessions:\n\n**Session 1 — Planning Director (Rachel Kim):**\n• Approved Nike plan as-is with Training adjustment\n• Challenged Adidas Samba depth — \"Samba is peaking, I've seen the Google Trends data.\" Agreed to reduce Samba from 1,800 to 1,400 units (-$22K), add to Adidas Forum instead\n• Approved own-label basics cut. Asked for weekly sell-through monitoring plan on basics to react faster this season.\n• Sign-off: Conditional on Samba adjustment\n\n**Session 2 — Buying Director (Tom Walsh):**\n• Approved all plans with Rachel's Samba adjustment\n• Added one request: Increase Nike Jordan allocation by $85K for a late Q4 retro drop (Air Jordan 4 \"Bred\" restock, confirmed by Nike rep)\n• Offset: Trim Adidas Outdoor Terrex by $85K (lowest confidence category)\n• Sign-off: Approved\n\n**Final approved plan:**\n• Nike: $8.685M (Jordan +$85K, Training -$42K, Running +$42K)\n• Adidas: $4.735M (Originals rebalanced, Performance -$180K, Outdoor -$85K)\n• Own-label: $13.1M (Basics -$400K, Knitwear +$400K)\n• **Total: $26.52M of $44.0M budget** (remaining $17.48M across other national brands — separate process)",
        sources: [
          "Meeting notes — Google Docs",
          "Sign-off emails — Rachel Kim, Tom Walsh",
        ],
      },
      {
        type: "result",
        label: "Brand buy plans approved and flow file locked",
        detail:
          "**FW26 Brand Buy Plans — APPROVED**\n\nAll 3 major brand plans signed off by Planning Director and Buying Director:\n\n• **Nike:** $8.685M — 94 styles, 33% of line sheet. Submit to Nike Fashion Tracker by Apr 15.\n• **Adidas:** $4.735M — 68 styles, 35% of line sheet. Submit to Adidas OOR by Apr 22.\n• **Own-label:** $13.1M — 118 styles, 83% of development pipeline. Internal production calendar updated.\n\n**Total approved:** $26.52M across 280 styles\n**Blended forecast confidence:** 79%\n**Projected full-price sell-through:** 74.2%\n\nBrand flow file locked in Google Sheets (FW26_BrandFlow_APPROVED_v1). Vendor submission deadlines added to team calendar.",
      },
    ],
    completionMessage:
      "3 brand buy plans approved ($26.52M, 280 styles). Flow file locked. Nike due Apr 15, Adidas Apr 22.",
  },

  // ── 28. on-order-report ────────────────────────────────────────────────
  {
    id: "on-order-report",
    title: "Consolidate on-order status across vendor-specific trackers",
    subtitle:
      "Multi-vendor PO status consolidation into a unified tracking view",
    industry: "Retail",
    acknowledgment: `I'll pull status from each vendor's tracking system and consolidate into your unified on-order report.

1. Download vendor-specific status reports (Nike Fashion Tracker, Adidas OOR, others)
2. Normalize formats and map statuses to our standard milestone definitions
3. Flag discrepancies between vendor-reported and our expected dates
4. Update the master on-order Excel with current status across all vendors

Let me get started.`,
    permissions: {
      autoApproved: [
        "Nike Fashion Tracker — portal access (read)",
        "Adidas OOR — portal access (read)",
        "Gmail — vendor status email attachments",
        "On-Order Excel — shared drive (read/write)",
      ],
      requiresApproval: [
        "Send status discrepancy emails to vendors",
        "Escalate late POs to merchandising leadership",
      ],
    },
    steps: [
      {
        type: "data_pull",
        label: "Download vendor-specific status reports",
        detail:
          "Pulled status data from 5 different vendor tracking systems:\n\n**Nike Fashion Tracker (portal):**\n• 42 POs on order, $8.2M total. Downloaded CSV with columns: PO#, style-color, order qty, confirmed ship date, current status, allocation %. Nike uses statuses: Confirmed / In Production / Ready to Ship / Shipped / Invoiced.\n\n**Adidas OOR (portal):**\n• 31 POs, $4.6M. Downloaded Excel with different column structure. Adidas uses: Order Acknowledged / Picking / Packed / Dispatched / Delivered. Dates in DD/MM/YYYY format (European).\n\n**New Balance (email — PDF attachment):**\n• 18 POs, $2.1M. Received as PDF table emailed weekly by rep (Maria Santos). Manual format — no consistent column headers. Statuses described in free text: \"shipping next week,\" \"delayed due to material.\"\n\n**Own-label vendors (WhatsApp + email):**\n• 47 POs across 8 vendors, $12.8M. Status updates arrive via WhatsApp photos, email threads, and vendor portal. No standardized format.\n\n**Other national brands (various):**\n• 23 POs, $3.9M. Mix of EDI confirmations, email PDFs, and portal downloads. 5 different date formats encountered.",
        sources: [
          "Nike Fashion Tracker portal",
          "Adidas OOR portal",
          "Gmail — New Balance PDF",
          "WhatsApp — own-label vendor updates",
          "Various brand portals",
        ],
      },
      {
        type: "reasoning",
        label: "Normalize formats and map statuses",
        detail:
          "Standardized all 161 POs into unified format:\n\n**Status mapping:**\n• Nike \"Confirmed\" / Adidas \"Order Acknowledged\" → Our \"PO Confirmed\"\n• Nike \"In Production\" / Adidas \"Picking\" / NB \"in production\" → Our \"In Production\"\n• Nike \"Ready to Ship\" / Adidas \"Packed\" / NB \"shipping next week\" → Our \"Ready to Ship\"\n• Nike \"Shipped\" / Adidas \"Dispatched\" / NB \"shipped\" → Our \"In Transit\"\n\n**Date normalization:**\n• Converted all dates to MM/DD/YYYY\n• Adidas dates flipped from DD/MM to MM/DD (caught 4 cases where day ≤12 could have been ambiguous — verified against PO confirmation emails)\n• New Balance free-text dates interpreted: \"shipping next week\" → estimated ship Mar 23; \"delayed due to material\" → flagged, no date available\n\n**Column standardization:**\n• Unified schema: PO# | Vendor | Brand | Style-Color | Qty | Unit Cost | Total Cost | PO Date | Expected Ship | Vendor-Reported Ship | Status | Days Variance | Notes\n\n**Discrepancies found (14 POs):**\n• 6 POs with ship dates later than our expected dates (total 2–14 days late)\n• 3 POs with quantities that don't match our records (short-ships)\n• 2 Nike POs showing \"allocation reduced\" — lost 340 units on Air Max Pulse\n• 3 own-label POs with no update in 10+ days",
      },
      {
        type: "system_read",
        label: "Update master on-order Excel",
        detail:
          "Updated the master On-Order Excel tracker (On_Order_FW26_Master.xlsx):\n\n**Summary dashboard:**\n• Total POs: 161 (was 158 last week — 3 new POs placed)\n• Total on-order value: $31.6M\n• On track: 128 POs (79.5%)\n• Delayed: 19 POs (11.8%) — average delay 5.2 days\n• At risk: 8 POs (5.0%) — no update or significant delay\n• Shipped/in-transit: 6 POs (3.7%)\n\n**VLOOKUP formulas updated:**\n• PO-to-style mapping refreshed (3 new POs added)\n• Ship date variance calculated automatically\n• Conditional formatting applied: green (<3 days early/late), yellow (3–7 days late), red (7+ days late)\n\n**By vendor category:**\n• Nike: 42 POs, $8.2M — 90% on track, 2 allocation issues\n• Adidas: 31 POs, $4.6M — 84% on track, 3 delays in Performance line\n• Own-label: 47 POs, $12.8M — 72% on track (worst performer, 3 POs no update)\n• New Balance: 18 POs, $2.1M — 83% on track, 2 material delays\n• Others: 23 POs, $3.9M — 87% on track",
        sources: [
          "On-Order Excel — shared drive",
        ],
      },
      {
        type: "human_input",
        label: "Review discrepancies and approve escalations",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "The on-order report is consolidated. I found 14 POs with discrepancies that need action:\n\n**Ship date delays (6 POs, $1.4M):**\n• 2 Nike POs delayed 5–7 days (seasonal lifestyle styles for Aug floor set)\n• 2 Adidas POs delayed 8–14 days (Terrex outdoor line — vendor citing material shortage)\n• 2 own-label POs delayed 6 days (Hangzhou Garment — holiday overtime issue)\n\n**Quantity short-ships (3 POs, $87K impact):**\n• Nike Air Max Pulse allocation reduced by 340 units ($52K) — Nike reallocated to larger accounts\n• 2 New Balance POs short by 120 units combined ($35K) — material yield issue\n\n**No update / unresponsive (3 POs, $214K):**\n• 3 own-label POs from Jiangsu Prime — last update was Mar 5 (13 days ago)\n\n**Other (2 POs):**\n• Nike allocation reduction on Jordan retro — need to discuss with Nike rep\n\nShall I send discrepancy emails to the relevant vendors and escalate the 3 unresponsive POs?",
        approvalButtons: [
          "Send discrepancy emails",
          "Let me review details first",
        ],
      },
      {
        type: "data_pull",
        label: "Send discrepancy notifications",
        detail:
          "Sent targeted communications:\n\n**Vendor emails (6 sent):**\n• Nike rep (Jason Park): Flagged 2 ship date delays + Air Max Pulse allocation cut. Requested revised dates and asked to protect Jordan retro allocation.\n• Adidas rep (Sarah Mitchell): Flagged Terrex delays, asked for material shortage details and realistic revised ship dates.\n• New Balance rep (Maria Santos): Flagged short-ships on 2 POs, asked for updated yield estimates.\n• Hangzhou Garment: Reminder on 2 delayed POs with updated milestone request.\n• Jiangsu Prime: Escalation email — 13 days without update on 3 POs ($214K). Requested immediate status by EOD tomorrow.\n\n**Internal escalation:**\n• Emailed Tom Walsh (Buying Director): Nike allocation reduction on Air Max Pulse — $52K impact, recommend Tom call Nike directly to negotiate reallocation.\n• Updated merchandising team Slack channel with weekly on-order summary.",
        sources: [
          "Gmail — vendor communications",
          "Slack — #merchandising-updates",
        ],
      },
      {
        type: "result",
        label: "Consolidated on-order report published",
        detail:
          "**Weekly On-Order Report — FW26 — Week of Mar 16:**\n\n• **161 POs consolidated** from 5 vendor tracking systems into unified Excel\n• **Total on-order:** $31.6M across 13 vendors\n• **On track:** 79.5% (128 POs)\n• **Delayed:** 11.8% (19 POs, avg 5.2 days)\n• **At risk:** 5.0% (8 POs, $402K)\n\n**Actions taken:**\n• 6 discrepancy emails sent to vendors\n• Nike allocation issue escalated to Buying Director\n• Jiangsu Prime escalation for 13-day silence on $214K of POs\n\n**Key risk:** Own-label on-track rate at 72% vs. 90% for Nike. Sourcing team alerted.\n\nExcel file updated: On_Order_FW26_Master.xlsx — shared drive, timestamped Mar 18, 2026.",
      },
    ],
    completionMessage:
      "161 POs consolidated from 5 vendor systems. 14 discrepancies flagged. On-order report updated and distributed.",
  },

  // ── 29. seasonal-material-buy ─────────────────────────────────────────
  {
    id: "seasonal-material-buy",
    title: "Execute seasonal material procurement with pricing negotiation",
    subtitle:
      "Commodity-indexed pricing negotiation with multi-supplier capacity planning",
    industry: "CPG / Food & Beverage",
    acknowledgment: `I'll manage the seasonal material procurement — from cost targeting through supplier negotiation to PO creation in SAP.

1. Pull prior year costs and current commodity index pricing
2. Set cost targets and choose pricing models per material category
3. Negotiate with suppliers via email and chat to hit targets
4. Create POs in SAP once pricing is agreed

Let me get started.`,
    permissions: {
      autoApproved: [
        "SAP — material master & PO history (read)",
        "CME / London Metal Exchange — commodity pricing",
        "Gmail — supplier correspondence",
        "Supplier capacity database — shared drive",
      ],
      requiresApproval: [
        "Create POs in SAP",
        "Accept pricing above prior year + 3% threshold",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull prior year costs and commodity indices",
        detail:
          "Loaded material cost history and current market pricing for the Christmas 2026 seasonal product line (chocolate gift boxes, candy assortments, seasonal beverages):\n\n**Prior year costs (Christmas 2025 actuals):**\n• Cocoa butter: $4,820/MT (supplier: Barry Callebaut) — purchased Jul 2025\n• Sugar (refined): $0.234/lb (supplier: Domino Foods) — contract price\n• Milk powder: $3,150/MT (supplier: Fonterra) — spot purchase\n• Aluminum foil (packaging): $2,680/MT (supplier: Novelis) — 6-month contract\n• Corrugated board: $0.82/sqft (supplier: WestRock) — annual contract\n• Vanilla extract: $285/gal (supplier: Nielsen-Massey) — spot\n\n**Current commodity indices (Mar 18, 2026):**\n• ICE Cocoa futures (Jul '26): $5,340/MT (+10.8% vs. last year purchase price)\n• ICE Sugar #11: $0.218/lb (-6.8% — good crop year)\n• CME Milk powder: $3,380/MT (+7.3%)\n• LME Aluminum: $2,520/MT (-6.0%)\n• Corrugated: $0.85/sqft (+3.7% — pulp prices up)\n• Vanilla: $310/gal (+8.8% — Madagascar crop concerns)",
        sources: [
          "SAP — PO history, material master",
          "ICE Futures — cocoa, sugar",
          "CME — dairy",
          "LME — aluminum",
          "Industry reports — corrugated, vanilla",
        ],
      },
      {
        type: "reasoning",
        label: "Set cost targets and pricing models",
        detail:
          "**Cost targeting rule:** At or below prior year unless force majeure (>15% commodity swing, documented supply disruption, or regulatory change).\n\n**Material-by-material strategy:**\n\n1. **Cocoa butter — Target: $5,060/MT** (allowing +5% vs. last year)\n   - Index is +10.8% but we won't accept full pass-through. Propose index-based pricing: ICE Jul '26 reference minus $280/MT processing discount (Barry Callebaut's margin was inflated last year).\n   - Pricing model: **Index-based + freight** (lock at time of shipment)\n\n2. **Sugar — Target: $0.218/lb** (below last year, market is favorable)\n   - Market down 6.8%. Push for full pass-through of commodity decline.\n   - Pricing model: **Fixed price** (lock now while market is low)\n\n3. **Milk powder — Target: $3,280/MT** (allow +4% vs. last year)\n   - Fonterra likely to push for full index. Counter with volume commitment: 120MT vs. last year's 95MT for better pricing.\n   - Pricing model: **Fixed + transport** (ocean freight volatile, separate line item)\n\n4. **Aluminum foil — Target: $2,520/MT** (below last year, market is down)\n   - LME is -6.0%. Novelis should pass through. Lock 6-month contract.\n   - Pricing model: **Fixed price, 6-month term**\n\n5. **Corrugated — Target: $0.84/sqft** (allow +2.4%)\n   - Pulp up but we have volume leverage. WestRock annual renewal.\n   - Pricing model: **Annual contract, quarterly price review**\n\n6. **Vanilla — Target: $295/gal** (allow +3.5%)\n   - Madagascar concerns may be overblown. Use threat of synthetic alternative to negotiate.\n   - Pricing model: **Fixed price with 90-day re-opener if Madagascar crop confirmed bad**\n\n**Total seasonal material budget: $2.14M** (vs. $1.98M last year — +8.1% driven by volume growth and cocoa)",
      },
      {
        type: "data_pull",
        label: "Send RFQs and negotiate with suppliers",
        detail:
          "Sent pricing proposals to all 6 suppliers. Negotiation results after 5 days of email/chat:\n\n**1. Barry Callebaut (cocoa butter):**\n• Initial offer: $5,480/MT (full index pass-through + margin)\n• Our counter: $5,060 (index minus processing discount)\n• Round 2: $5,290 — they cited energy costs in Netherlands processing plant\n• Round 3: $5,180 — we showed competitor quote from Cargill at $5,150\n• **Agreed: $5,150/MT** (Cargill match, +6.8% vs. last year — above target but below force majeure threshold)\n\n**2. Domino Foods (sugar):**\n• Accepted $0.218/lb immediately — they want to lock volume before market rebounds\n• **Agreed: $0.218/lb** (-6.8% vs. last year, on target)\n\n**3. Fonterra (milk powder):**\n• Initial: $3,520/MT (full CME pass-through + NZ dollar hedge)\n• Our counter: $3,280 with 120MT commitment (26% volume increase)\n• They countered: $3,350 at 120MT\n• **Agreed: $3,320/MT** at 120MT (+5.4% vs. last year, $40 above target — acceptable)\n\n**4. Novelis (aluminum):**\n• Accepted $2,520/MT — matched LME. 6-month contract signed.\n• **Agreed: $2,520/MT** (-6.0% vs. last year, on target)\n\n**5. WestRock (corrugated):**\n• Proposed $0.88/sqft citing pulp costs\n• Countered at $0.84 with annual volume guarantee of 2.2M sqft\n• **Agreed: $0.85/sqft** (split difference, +3.7% — $0.01 above target)\n\n**6. Nielsen-Massey (vanilla):**\n• Initially firm at $318/gal citing Madagascar\n• We mentioned testing synthetic vanilla blend for 30% of volume\n• They dropped to $298/gal with commitment to 100% natural\n• **Agreed: $298/gal** (+4.6% vs. last year, $3 above target)",
        sources: [
          "Gmail — negotiation threads",
          "WhatsApp — Barry Callebaut quick responses",
          "Competitor quotes — Cargill, Tate & Lyle",
        ],
      },
      {
        type: "human_input",
        label: "Approve final pricing and PO creation",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Negotiations are complete on all 6 materials. Summary:\n\n| Material | Supplier | Agreed Price | vs. Last Year | vs. Target | Model |\n|----------|----------|-------------|---------------|------------|-------|\n| Cocoa butter | Barry Callebaut | $5,150/MT | +6.8% | +$90 above | Index-based |\n| Sugar | Domino Foods | $0.218/lb | -6.8% | On target | Fixed |\n| Milk powder | Fonterra | $3,320/MT | +5.4% | +$40 above | Fixed + transport |\n| Aluminum | Novelis | $2,520/MT | -6.0% | On target | Fixed, 6-mo |\n| Corrugated | WestRock | $0.85/sqft | +3.7% | +$0.01 above | Annual |\n| Vanilla | Nielsen-Massey | $298/gal | +4.6% | +$3 above | Fixed w/ re-opener |\n\n**Total material cost: $2.18M** (vs. $1.98M last year, +10.1% driven by volume growth + cocoa/dairy increases)\n**vs. budget: $2.14M — over by $40K (1.9%)** — driven by cocoa settling $90 above target\n\nAll prices are within the force majeure thresholds. Shall I create the POs in SAP?",
        approvalButtons: ["Create POs in SAP", "Renegotiate cocoa pricing"],
      },
      {
        type: "data_pull",
        label: "Create purchase orders in SAP",
        detail:
          "Created 6 POs in SAP (transaction ME21N):\n\n• **PO 4500087201** — Barry Callebaut, cocoa butter, 85 MT @ $5,150/MT = $437,750. Delivery: Jul 15–Aug 30, 2026. Payment: Net-60.\n• **PO 4500087202** — Domino Foods, refined sugar, 340,000 lbs @ $0.218/lb = $74,120. Delivery: Jul 1–Sep 30. Payment: Net-30.\n• **PO 4500087203** — Fonterra, milk powder, 120 MT @ $3,320/MT = $398,400. Delivery: Jun 15–Aug 15. Payment: Net-45. Freight separate (estimated $28,400).\n• **PO 4500087204** — Novelis, aluminum foil, 68 MT @ $2,520/MT = $171,360. Delivery: Jul–Dec (monthly releases). Payment: Net-30.\n• **PO 4500087205** — WestRock, corrugated board, 2.2M sqft @ $0.85/sqft = $1,870,000 (annual contract, quarterly invoicing at $467,500). Delivery: rolling. Payment: Net-45.\n• **PO 4500087206** — Nielsen-Massey, vanilla extract, 420 gal @ $298/gal = $125,160. Delivery: Aug 1. Payment: Net-30. Re-opener clause if Madagascar crop report (Jun 30) shows >20% decline.\n\nAll POs approved through SAP workflow — auto-routed to procurement manager (David Chen) for final release.",
        sources: ["SAP — ME21N PO creation"],
      },
      {
        type: "result",
        label: "Seasonal material procurement complete",
        detail:
          "**Christmas 2026 Seasonal Material Buy — Complete**\n\n6 POs created in SAP, total value: **$2.18M** (+10.1% vs. prior year, 1.9% above budget)\n\n**Wins:**\n• Sugar locked at -6.8% (market timing)\n• Aluminum locked at -6.0% (LME favorable)\n• Vanilla negotiated down $20/gal from initial offer using synthetic leverage\n\n**Concessions:**\n• Cocoa butter +6.8% — global market driven, mitigated by competitor benchmarking\n• Milk powder +5.4% — offset by 26% volume increase securing priority allocation\n\n**Key dates:**\n• First delivery: Jun 15 (Fonterra milk powder)\n• Vanilla re-opener: Jun 30 (pending Madagascar crop report)\n• All materials in-house by Aug 30 for Sep production start\n\nPOs pending final release by David Chen in SAP. Confirmation emails sent to all 6 suppliers.",
      },
    ],
    completionMessage:
      "6 material POs created in SAP ($2.18M). Sugar and aluminum below last year. All materials due by Aug 30 for Sep production.",
  },

  // ── 30. supplier-compliance-tracking ───────────────────────────────────
  {
    id: "supplier-compliance-tracking",
    title: "Track supplier audit compliance and flag risks",
    subtitle:
      "Social and environmental audit monitoring with supplier benchmarking",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll review the current state of supplier compliance audits and flag any risks or gaps.

1. Pull all supplier audit reports and expiration dates
2. Identify suppliers with expired, failing, or missing audits
3. Benchmark suppliers against compliance standards and flag non-compliance
4. Chase the sourcing team for overdue reports and manage escalation

Let me get started.`,
    permissions: {
      autoApproved: [
        "Compliance database — shared drive (read)",
        "Supplier master — ERP (read)",
        "Gmail — audit report correspondence",
        "SEDEX / BSCI portal — audit status (read)",
      ],
      requiresApproval: [
        "Block POs for non-compliant suppliers",
        "Escalate compliance issues to VP Sourcing",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Load supplier audit database",
        detail:
          "Loaded compliance records for all 24 active suppliers across social and environmental audit categories:\n\n**Audit types tracked:**\n• Social: BSCI (Business Social Compliance Initiative) or WRAP (Worldwide Responsible Accredited Production)\n• Environmental: Higg FEM (Facility Environmental Module) or OEKO-TEX\n• Chemical: ZDHC MRSL (Manufacturing Restricted Substances List)\n\n**Current status overview:**\n• Fully compliant (all audits current + passing): 14 suppliers (58%)\n• Partially compliant (1+ audit expiring within 60 days): 4 suppliers (17%)\n• Non-compliant (1+ audit expired or failed): 4 suppliers (17%)\n• Missing audits (never completed): 2 suppliers (8%) — both new suppliers onboarded in Q1 2026\n\n**Audit expiration timeline:**\n• Expired: 6 audit reports across 4 suppliers\n• Expiring in 30 days: 3 reports\n• Expiring in 60 days: 5 reports\n• Current (60+ days remaining): 41 reports",
        sources: [
          "Compliance database — Google Sheets",
          "SEDEX portal — audit status",
          "BSCI portal — rating lookup",
        ],
      },
      {
        type: "data_pull",
        label: "Pull detailed findings for non-compliant suppliers",
        detail:
          "Deep-dive on the 6 suppliers with issues:\n\n**NON-COMPLIANT (4 suppliers):**\n\n1. **Myanmar Stitch Co.** — BSCI audit expired Dec 2025 (3 months overdue)\n   - Last rating: C (acceptable) but auditor noted overtime violations (avg 68 hrs/week vs. 60 hr limit)\n   - No Higg FEM on file — never completed environmental module\n   - Active POs: 3 ($214K). Sourcing team's excuse: \"We didn't have time to schedule the audit.\"\n\n2. **Jiangsu Prime** — BSCI current but scored D (insufficient improvements)\n   - Findings: fire exit blocked in Building 2, incomplete wage records for contract workers\n   - Corrective action plan submitted Jan 2026 but no follow-up audit scheduled\n   - Active POs: 8 ($347K)\n\n3. **Fabric World (mill)** — ZDHC MRSL failed Nov 2025\n   - 2 restricted chemicals found above limits: APEO in washing agent, chlorinated solvents in spotting\n   - Supplier claims they switched chemicals in Jan 2026 but no re-test submitted\n   - Supplies fabric to 12 of our POs ($890K total)\n\n4. **Pacific Trim** — WRAP certificate expired Feb 2026\n   - Was WRAP Gold. Renewal application submitted but audit not yet scheduled.\n   - Low risk — historical strong performance\n\n**MISSING AUDITS (2 new suppliers):**\n\n5. **Dhaka Garments Ltd** — onboarded Jan 2026, zero audits on file\n   - First PO (PO-4450, $62K) scheduled for production start Apr 1\n   - Located in Gazipur, Bangladesh — high-risk region, mandatory BSCI before production\n\n6. **Colombo Knits** — onboarded Feb 2026, zero audits on file\n   - First PO (PO-4455, $48K) scheduled for May production\n   - Sri Lanka — medium risk, WRAP preferred",
        sources: [
          "BSCI portal — audit reports",
          "WRAP database — certificate lookup",
          "ZDHC Gateway — MRSL results",
          "Higg Index portal",
          "Gmail — sourcing team correspondence",
        ],
      },
      {
        type: "reasoning",
        label: "Benchmark and assess risk levels",
        detail:
          "**Risk assessment and recommended actions:**\n\n**CRITICAL RISK (immediate action required):**\n\n1. **Fabric World — ZDHC failure**\n   Risk: APEO and chlorinated solvents in our supply chain = brand reputation risk + potential regulatory penalty (EU REACH compliance). These chemicals are in fabric going into 12 POs ($890K).\n   Action: Demand re-test results within 14 days or suspend new PO placement. Current POs in production can continue but require chemical testing at final inspection.\n\n2. **Dhaka Garments — no audit, production starting Apr 1**\n   Risk: Bangladesh factory with zero social audit = highest compliance risk. Cannot start production without BSCI.\n   Action: Emergency BSCI audit must be scheduled within 7 days. If audit cannot happen before Apr 1, delay PO-4450 production start.\n\n**HIGH RISK (30-day resolution needed):**\n\n3. **Myanmar Stitch Co. — expired BSCI + overtime violations**\n   Risk: Overtime finding + expired audit + vendor performance issues (62.3 score). This supplier is accumulating red flags.\n   Action: Schedule BSCI re-audit within 30 days. If overtime findings repeat, recommend exit strategy.\n\n4. **Jiangsu Prime — BSCI D rating**\n   Risk: D rating means insufficient improvements. Fire exit blocked is a life-safety issue.\n   Action: Follow-up audit within 30 days to verify corrective actions. If still D, escalate to PO block.\n\n**MEDIUM RISK (monitor):**\n\n5. **Pacific Trim — WRAP renewal pending**\n   Risk: Low — strong historical performance, renewal in progress.\n   Action: Follow up on audit scheduling. No PO impact.\n\n6. **Colombo Knits — no audit, production in May**\n   Risk: Medium — Sri Lanka is lower risk region, and there's time before production.\n   Action: Schedule WRAP audit for April. First PO not until May.",
      },
      {
        type: "human_input",
        label: "Approve compliance actions and escalations",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here are the compliance actions I recommend. Two require your approval because they impact active production:\n\n**Immediate actions:**\n1. **Fabric World** — Send formal notice: provide ZDHC re-test results within 14 days or new POs suspended. Add chemical testing to QC protocol for 12 in-production POs ($890K). Estimated testing cost: $3,600.\n2. **Dhaka Garments** — Block PO-4450 production start until BSCI audit completed. Request emergency audit via BSCI partner (TUV SUD). Estimated audit cost: $2,800, timeline: 10–14 days.\n\n**30-day actions:**\n3. **Myanmar Stitch** — Schedule BSCI re-audit. Combine with the performance review already scheduled for Thu Mar 19.\n4. **Jiangsu Prime** — Schedule follow-up audit to verify fire exit and wage record corrective actions.\n\n**Monitoring:**\n5. Pacific Trim — chase WRAP renewal\n6. Colombo Knits — schedule WRAP for April\n\n**Escalation to VP Sourcing:** I recommend escalating the Fabric World chemical issue and Dhaka Garments situation, as both carry brand risk. The sourcing team's \"no time for audits\" excuse is not acceptable per policy.\n\nShall I proceed with all actions and the VP escalation?",
        approvalButtons: [
          "Proceed with all actions",
          "Modify action plan",
        ],
      },
      {
        type: "data_pull",
        label: "Execute compliance actions and send notifications",
        detail:
          "**Actions executed:**\n\n1. **Fabric World — formal notice sent:**\n   - Email to Mr. Li (factory GM): 14-day deadline for ZDHC re-test results on APEO and chlorinated solvents. Template included specific chemical limits per ZDHC MRSL v3.1.\n   - QC team notified: chemical testing added to inspection protocol for POs 4360–4371 (12 POs). Testing lab: Bureau Veritas Shenzhen, $300/test × 12 = $3,600.\n\n2. **Dhaka Garments — PO blocked:**\n   - PO-4450 status changed to \"Hold — Pending Compliance\" in ERP\n   - TUV SUD contacted: emergency BSCI audit requested for Gazipur factory. Earliest available: Mar 28. Cost: $2,800. Audit booked.\n   - Dhaka Garments GM (Rashid Ahmed) notified: production start delayed from Apr 1 to Apr 5 minimum (pending audit result).\n\n3. **Myanmar Stitch — audit scheduled:**\n   - BSCI re-audit requested through SGS. Scheduled Apr 8. Added to Mar 19 performance review agenda.\n\n4. **Jiangsu Prime — follow-up audit:**\n   - Intertek follow-up audit scheduled Apr 2. Scope: fire safety + wage records only (reduced scope, $1,500).\n\n5. **Pacific Trim & Colombo Knits:**\n   - Pacific Trim: emailed WRAP coordinator for renewal timeline. Response expected 48 hrs.\n   - Colombo Knits: WRAP audit requested via Bureau Veritas. Targeting Apr 15.\n\n6. **VP Sourcing escalation:**\n   - Email sent to VP Sourcing (David Kim): summary of Fabric World chemical risk and Dhaka Garments unaudited factory. Included recommendation to add mandatory pre-production audit gate to supplier onboarding process.",
        sources: [
          "Gmail — compliance notifications",
          "ERP — PO hold",
          "TUV SUD — audit booking",
          "SGS — audit scheduling",
          "Intertek — follow-up audit",
        ],
      },
      {
        type: "result",
        label: "Compliance status updated with risk flags",
        detail:
          "**Supplier Compliance Report — Mar 18, 2026**\n\n**Portfolio status:**\n• 24 active suppliers: 14 compliant, 4 partially compliant, 4 non-compliant, 2 pending first audit\n\n**Actions taken:**\n• Fabric World — 14-day chemical re-test ultimatum sent. Chemical testing added to 12 POs ($3,600).\n• Dhaka Garments — PO-4450 blocked. Emergency BSCI audit booked Mar 28 ($2,800).\n• Myanmar Stitch — BSCI re-audit scheduled Apr 8. Linked to performance review.\n• Jiangsu Prime — follow-up audit scheduled Apr 2 ($1,500).\n• Pacific Trim — WRAP renewal tracked.\n• Colombo Knits — WRAP audit targeted Apr 15.\n\n**Total compliance spend this cycle:** $7,900 (audits + testing)\n\n**Escalated to VP Sourcing:** Chemical risk at Fabric World, unaudited supplier (Dhaka Garments), systemic \"no time for audits\" pattern in sourcing team.\n\n**Next review:** Apr 1 — verify Fabric World re-test received, Dhaka audit result, Jiangsu corrective action status.",
      },
    ],
    completionMessage:
      "Compliance review complete — 6 suppliers flagged, 2 critical actions taken (PO block + chemical ultimatum). VP Sourcing escalation sent.",
  },
  // ── 31. po-amendments ──────────────────────────────────────────────
  {
    id: "po-amendments",
    title: "Process amendments to existing purchase orders",
    subtitle:
      "Automated PO change management with cross-system tracking",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll process the amendment to PO #NFW-2026-04418 and keep every system in sync. Here's my plan:

1. Pull the original PO details and the incoming change request from the automated PO system
2. Cross-reference the amendment against Smartsheet tracking and value chain views
3. Validate the amendment doesn't violate contract terms or landed-cost thresholds
4. Issue the amended PO and propagate changes across all downstream systems

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read PO system records",
        "Read Smartsheet project tracker",
        "Query value chain dashboard",
      ],
      requiresApproval: [
        "Issue amended PO to supplier",
        "Update Smartsheet milestone dates",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Retrieve original PO",
        detail:
          "Pulled PO #NFW-2026-04418 from the automated PO platform. Original order: 12,400 units of style WMN-RUN-370 (women's running shoe) placed with Pou Chen Group on 2026-01-15. Unit FOB $18.42, total FOB value $228,408. Ship-by date 2026-04-20, destination DC: Cranbury, NJ. Payment terms NET 45 from BL date. Current status: production confirmed, fabric cutting complete.",
        sources: ["PO Management System", "Vendor Portal"],
      },
      {
        type: "data_pull",
        label: "Load change request and Smartsheet tracker",
        detail:
          "Change request CR-0887 submitted by merchant Kelly Thornton on 2026-03-16: increase quantity from 12,400 to 14,800 units (+2,400 units) and shift ship-by date from 2026-04-20 to 2026-04-28. Reason: strong pre-season sell-through at Nordstrom drove upside demand. Smartsheet tracker row NFW-SS26-LINE42 shows current milestone is \"Production — Cutting\" with 68% completion. Downstream milestones: QC inspection 2026-04-08, cargo ready 2026-04-18, vessel booking 2026-04-22.",
        sources: ["Smartsheet", "Change Request Log"],
      },
      {
        type: "reasoning",
        label: "Validate amendment feasibility",
        detail:
          "Analyzing the amendment against contract and capacity constraints:\n\n• Quantity increase of 2,400 units (19.4%) is within the +/- 20% flex clause in Master Supply Agreement MSA-PCG-2024 with Pou Chen Group — no renegotiation needed.\n• Revised FOB total: 14,800 × $18.42 = $272,616 (+$44,208). This stays within Kelly's open-to-buy ceiling of $310,000 for this style.\n• Ship-by date extension to 2026-04-28 gives the factory 8 additional days. Pou Chen confirmed via last capacity report (2026-03-12) that Line 7 has availability through end of April.\n• Landed cost impact: incremental freight est. $1,860 (pro-rata ocean FCL share). Duty at 10% adds $4,420. Total landed increase ~$50,488.\n• Downstream: vessel booking with Maersk (BKG-MAE-226841) needs amendment from 1× 40' FCL to 1× 40' + 1× 20' FCL. Cranbury DC has receiving capacity on revised ETA window (2026-05-18).",
      },
      {
        type: "data_pull",
        label: "Check value chain view impacts",
        detail:
          "Queried the value chain dashboard for downstream dependencies. Nordstrom ASN window for PO #NORD-882710 closes 2026-05-25 — the revised ETA of 2026-05-18 still gives 7 days of buffer. Warehouse allocation plan at Cranbury shows slots available 2026-05-16 through 2026-05-22. Retail floor set date is 2026-06-01; no risk. Financial calendar: amended cost hits April accrual as planned, no period-end issues.",
        sources: ["Value Chain Dashboard", "Retail Calendar"],
      },
      {
        type: "human_input",
        label: "Approve amended PO issuance",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Ready to issue amended PO #NFW-2026-04418-A1 to Pou Chen Group:\n\n• Quantity: 12,400 → 14,800 units (+2,400)\n• FOB total: $228,408 → $272,616 (+$44,208)\n• Ship-by: 2026-04-20 → 2026-04-28\n• Est. landed cost increase: $50,488\n• Vessel booking amendment required (Maersk BKG-MAE-226841)\n\nAll changes are within MSA flex terms. Shall I issue the amendment?",
        approvalButtons: ["Issue Amendment", "Hold for Review"],
      },
      {
        type: "result",
        label: "Amended PO issued and systems updated",
        detail:
          "Amendment PO #NFW-2026-04418-A1 has been issued to Pou Chen Group and confirmed via vendor portal at 2026-03-18T14:22Z. All systems updated:\n\n• PO system: revised quantity, value, and ship-by date recorded\n• Smartsheet tracker row NFW-SS26-LINE42: milestones recalculated — QC inspection shifted to 2026-04-15, cargo ready to 2026-04-26\n• Value chain dashboard: Nordstrom ASN and Cranbury DC allocation refreshed\n• Maersk booking amendment request submitted (BKG-MAE-226841-R1)\n• Change log: CR-0887 marked complete, audit trail attached\n\nKelly Thornton and the logistics team have been notified via email.",
      },
    ],
    completionMessage:
      "PO amendment processed — revised order for 14,800 units issued to Pou Chen Group with all tracking systems synchronized.",
  },

  // ── 32. open-to-buy-capacity ───────────────────────────────────────
  {
    id: "open-to-buy-capacity",
    title: "Check supplier capacity against open-to-buy budget",
    subtitle:
      "Real-time capacity matching for additional merchant spend optimization",
    industry: "Retail",
    acknowledgment: `I'll help you deploy the remaining $185,000 in open-to-buy budget against available supplier capacity. Here's my plan:

1. Pull your current OTB position and identify budget available by category
2. Query supplier capacity data across your vendor base for open production slots
3. Match available budget to the highest-margin capacity windows
4. Generate optimized PO recommendations for your approval

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read OTB budget tracker",
        "Query supplier capacity portal",
        "Access margin planning models",
      ],
      requiresApproval: [
        "Place additional POs against OTB budget",
        "Send capacity hold requests to suppliers",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull open-to-buy position",
        detail:
          "Retrieved OTB tracker for merchant group \"Women's Contemporary\" managed by Rachel Simmons. FY26 Spring season budget: $2,400,000. Committed to date: $2,215,000 across 38 POs. Remaining OTB: $185,000. Budget must be committed by 2026-03-28 (10 days) or it lapses to the reserve pool. Category breakdown of remaining budget: knit tops $72,000, woven bottoms $58,000, dresses $55,000. Average target IMU: 62%.",
        sources: ["OTB Budget Tracker", "Merch Planning System"],
      },
      {
        type: "data_pull",
        label: "Query supplier capacity across vendor base",
        detail:
          "Polled capacity data from 6 approved vendors. Note: portal data has a 7–10 day lag from real-time factory status.\n\n• Esquel Group (Vietnam): 3,200 units available Apr 15–30 on knit lines. FOB $11.80–$13.50 depending on fabric.\n• Crystal International (Cambodia): 2,800 units available Apr 20–May 5 on woven bottoms lines. FOB $14.20.\n• Brandix (Sri Lanka): 1,500 units available Apr 10–25 for jersey dresses. FOB $16.90.\n• TAL Apparel (Vietnam): no open capacity until June.\n• Hirdaramani (Bangladesh): 4,000 units on knit lines Apr 1–20. FOB $10.60, but minimum order 3,000 units.\n• Pacific Textiles (China): 2,000 units on woven dresses Apr 8–22. FOB $15.40.",
        sources: [
          "Supplier Capacity Portal",
          "Sourcing Office Updates",
        ],
      },
      {
        type: "reasoning",
        label: "Optimize budget allocation against capacity",
        detail:
          "Running allocation optimization against $185,000 OTB with target IMU ≥ 62%:\n\n1. **Knit tops via Hirdaramani**: 3,000 units × $10.60 FOB = $31,800. Retail $32.00 → IMU 66.9%. Strong margin, meets MOQ. Uses $31,800 of $72,000 knit budget.\n2. **Knit tops via Esquel**: 3,200 units × $12.40 FOB (mid-range) = $39,680. Retail $34.00 → IMU 63.5%. Uses remaining $39,680 of knit budget. Total knit: $71,480.\n3. **Woven bottoms via Crystal Intl**: 2,800 units × $14.20 FOB = $39,760. Retail $42.00 → IMU 66.2%. Uses $39,760 of $58,000 woven budget.\n4. **Dresses via Brandix**: 1,500 units × $16.90 FOB = $25,350. Retail $48.00 → IMU 64.8%. Uses $25,350 of $55,000 dress budget.\n5. **Dresses via Pacific Textiles**: 1,200 units × $15.40 FOB = $18,480. Retail $44.00 → IMU 65.0%. Uses $18,480 of remaining dress budget.\n\nTotal spend: $154,770. Remaining $30,230 can be held for chase orders. Blended IMU: 65.1% (above 62% target). All deliveries land before May 10, well within floor-set windows.",
      },
      {
        type: "human_input",
        label: "Approve PO placement plan",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Recommended allocation of $154,770 against $185,000 OTB budget (leaves $30,230 for chase):\n\n• Hirdaramani — 3,000 knit tops — $31,800 (IMU 66.9%)\n• Esquel Group — 3,200 knit tops — $39,680 (IMU 63.5%)\n• Crystal Intl — 2,800 woven bottoms — $39,760 (IMU 66.2%)\n• Brandix — 1,500 dresses — $25,350 (IMU 64.8%)\n• Pacific Textiles — 1,200 dresses — $18,480 (IMU 65.0%)\n\nBlended IMU: 65.1%. All deliveries by May 10. Shall I place these POs?",
        approvalButtons: ["Place All POs", "Revise Allocation"],
      },
      {
        type: "data_pull",
        label: "Confirm live capacity with sourcing offices",
        detail:
          "Sent real-time capacity confirmation requests to sourcing offices in Ho Chi Minh City (Esquel, Hirdaramani), Phnom Penh (Crystal Intl), Colombo (Brandix), and Shanghai (Pacific Textiles). Responses received within 35 minutes:\n\n• Hirdaramani: confirmed 3,000 units, line booked Apr 1–20\n• Esquel: confirmed 3,200 units, line booked Apr 15–30\n• Crystal Intl: confirmed 2,800 units, line booked Apr 20–May 5\n• Brandix: confirmed 1,500 units, line booked Apr 10–25\n• Pacific Textiles: confirmed 2,000 available but we only need 1,200 — confirmed at 1,200 units Apr 8–22\n\nAll five vendors confirmed capacity at quoted FOB prices.",
        sources: ["Sourcing Office (5 locations)", "Vendor Email"],
      },
      {
        type: "result",
        label: "POs placed and OTB updated",
        detail:
          "Five new POs issued against the Women's Contemporary OTB budget:\n\n• PO #WC-2026-1147 — Hirdaramani, 3,000 knit tops, $31,800\n• PO #WC-2026-1148 — Esquel Group, 3,200 knit tops, $39,680\n• PO #WC-2026-1149 — Crystal Intl, 2,800 woven bottoms, $39,760\n• PO #WC-2026-1150 — Brandix, 1,500 dresses, $25,350\n• PO #WC-2026-1151 — Pacific Textiles, 1,200 dresses, $18,480\n\nTotal committed: $154,770. Remaining OTB: $30,230 reserved for chase. OTB tracker and merch planning system updated. Rachel Simmons notified with PO confirmation summary.",
      },
    ],
    completionMessage:
      "Open-to-buy budget optimized — $154,770 allocated across 5 suppliers with 65.1% blended IMU, $30,230 held for chase orders.",
  },

  // ── 33. continuous-weekly-reorder ──────────────────────────────────
  {
    id: "continuous-weekly-reorder",
    title: "Place weekly reorders based on demand signal",
    subtitle:
      "Demand-driven weekly replenishment with air freight and supplier coordination",
    industry: "DTC / E-commerce",
    acknowledgment: `I'll process this week's replenishment orders based on latest demand signals. Here's my plan:

1. Pull last 7 days of sales data and current inventory positions from Shopify and the 3PL
2. Analyze demand velocity and calculate reorder quantities by SKU
3. Generate weekly POs for Leverstyle and coordinate air freight via Flexport
4. Confirm payment terms and delivery schedule to keep inventory under 60 days old

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read Shopify sales data",
        "Read 3PL inventory levels",
        "Query Flexport shipment data",
      ],
      requiresApproval: [
        "Place weekly POs with Leverstyle",
        "Book air freight with Flexport",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull weekly sales and inventory data",
        detail:
          "Retrieved 7-day sales from Shopify (2026-03-11 to 2026-03-17) for 42 active SKUs. Top movers:\n\n• SKU ESS-TEE-BLK-M: 312 units sold, 4.2× velocity vs. forecast\n• SKU ESS-TEE-BLK-L: 287 units sold, 3.8× velocity\n• SKU ESS-CREW-NVY-S: 198 units sold, 2.1× velocity\n• SKU ESS-JOGGER-GRY-M: 176 units sold, 1.9× velocity\n\nCurrent 3PL inventory (Quiet Logistics, Williamsburg): 8,420 total units across all SKUs. Days of supply at current run rate: 14.2 days (target: 21–28 days). 6 SKUs are below safety stock. No SKU has inventory older than 52 days.",
        sources: ["Shopify Analytics", "Quiet Logistics WMS"],
      },
      {
        type: "data_pull",
        label: "Retrieve Flexport logistics and payment data",
        detail:
          "Pulled Flexport account data for shipper account FL-DTC-29441:\n\n• Last air shipment (AWB 160-4821-7733) delivered 2026-03-14, 2,800 units, transit time 4 days HKG→JFK.\n• Flexport paid Leverstyle on our behalf: invoice LVS-20260310 for $47,600 (NET 90 terms — due 2026-06-08).\n• Current Flexport financing balance: $142,300 outstanding across 3 invoices.\n• Financing limit: $500,000. Available: $357,700.\n• Preferred air route: HKG → JFK via Cathay Cargo, $4.20/kg. Average shipment weight: 680 kg.\n• Lead time from PO to delivery: 12 days (5 days production at Leverstyle + 3 days QC/pack + 4 days air transit).",
        sources: ["Flexport Platform", "Flexport Capital"],
      },
      {
        type: "reasoning",
        label: "Calculate reorder quantities by SKU",
        detail:
          "Computing weekly reorder to maintain 21-day forward cover at current demand velocity:\n\n• ESS-TEE-BLK-M: current stock 84 units, 21-day need 936 → reorder 852 units\n• ESS-TEE-BLK-L: current stock 112 units, 21-day need 861 → reorder 749 units\n• ESS-CREW-NVY-S: current stock 203 units, 21-day need 594 → reorder 391 units\n• ESS-JOGGER-GRY-M: current stock 156 units, 21-day need 528 → reorder 372 units\n• 12 additional SKUs need replenishment totaling 2,140 units\n\nTotal reorder this week: 4,504 units. Estimated FOB value: $76,568 (avg $17.00/unit). Flexport financing covers this — balance would move to $218,868, well within $500K limit. Estimated air freight: ~1,090 kg × $4.20 = $4,578. All inventory will be under 12 days old at receipt, keeping the portfolio well under the 60-day freshness target.",
      },
      {
        type: "human_input",
        label: "Approve weekly reorder POs",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Weekly replenishment order for week of 2026-03-18:\n\n• Total units: 4,504 across 16 SKUs\n• Supplier: Leverstyle (Hong Kong)\n• FOB value: $76,568\n• Air freight estimate: $4,578 (Cathay Cargo HKG→JFK)\n• Flexport pays Leverstyle NET 90 — new financing balance: $218,868 / $500K limit\n• Expected delivery at Quiet Logistics: 2026-03-30\n\nTop 4 SKUs account for 52% of the order. All inventory will be <12 days old at receipt. Shall I place this week's order?",
        approvalButtons: ["Place Weekly Order", "Adjust Quantities"],
      },
      {
        type: "data_pull",
        label: "Submit POs and book air freight",
        detail:
          "Submitted PO #LVS-WK12-2026 to Leverstyle via their order portal. Leverstyle confirmed production slot for 2026-03-19 start, pack-out by 2026-03-24. Booked air freight with Flexport: shipment FLX-AIR-2026-1847, Cathay Cargo CX-2206 departing HKG 2026-03-25, arriving JFK 2026-03-29. Quiet Logistics receiving appointment confirmed for 2026-03-30 AM window. Flexport Capital financing authorized for invoice amount up to $76,568.",
        sources: [
          "Leverstyle Order Portal",
          "Flexport Platform",
          "Quiet Logistics WMS",
        ],
      },
      {
        type: "result",
        label: "Weekly reorder placed and logistics confirmed",
        detail:
          "Week 12 replenishment cycle complete:\n\n• PO #LVS-WK12-2026: 4,504 units, $76,568 FOB, placed with Leverstyle\n• Production: 2026-03-19 to 2026-03-24\n• Air shipment FLX-AIR-2026-1847: departs HKG 2026-03-25, arrives JFK 2026-03-29\n• 3PL receiving: 2026-03-30 at Quiet Logistics Williamsburg\n• Flexport financing: $76,568 added, total outstanding $218,868\n• Projected days of supply after receipt: 24.6 days (within 21–28 target)\n• Inventory freshness: all replenished SKUs at 0 days age on receipt\n\nNext weekly reorder cycle: 2026-03-25.",
      },
    ],
    completionMessage:
      "Weekly reorder of 4,504 units placed with Leverstyle — air freight booked, delivery expected March 30 at Quiet Logistics.",
  },

  // ── 34. cross-system-po-flow ───────────────────────────────────────
  {
    id: "cross-system-po-flow",
    title: "Route PO through OMS, WMS, and TMS systems",
    subtitle:
      "Cross-system order flow management with field mapping and status monitoring",
    industry: "Retail",
    acknowledgment: `I'll route PO #AS4-0026-88412 through the full order management pipeline and ensure field mapping is correct at every handoff. Here's my plan:

1. Pull the original PO from AS400 and validate all required fields
2. Map and transform PO data for ingestion by OMS, WMS, and TMS
3. Monitor EDI message flow and confirm successful handoffs at each stage
4. Consolidate status across the combined dashboard for end-to-end visibility

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read AS400 PO records",
        "Query OMS order status",
        "Read WMS inventory allocations",
        "Read TMS shipment records",
      ],
      requiresApproval: [
        "Push PO data to OMS",
        "Trigger WMS allocation",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Extract PO from AS400",
        detail:
          "Retrieved PO #AS4-0026-88412 from AS400 green-screen (program POENTRY, library PRODLIB). PO details: vendor #V-4418 (Li & Fung Trading), 6 line items totaling 18,200 units across styles MNS-POLO-SS26-001 through MNS-POLO-SS26-006. Total cost $246,714. Ship-to: DC East (Secaucus, NJ), DC code 0040. Required delivery: 2026-04-15. Terms: FOB Shanghai, NET 60. AS400 fields extracted: VNDNO, PONBR, STYLE, COLOR, SIZE, QTY, UCOST, SHPTO, RQDDT, FOBPT, TERMS. EDI 850 generated at 2026-03-18T08:15Z.",
        sources: ["AS400 (PRODLIB/POENTRY)", "EDI Gateway"],
      },
      {
        type: "reasoning",
        label: "Map fields between AS400, OMS, WMS, and TMS",
        detail:
          "Performing field mapping and transformation for cross-system routing:\n\n**AS400 → OMS (Manhattan Active Omni):**\n• PONBR → ExternalOrderId (AS4-0026-88412)\n• VNDNO → VendorCode (map V-4418 → LF-TRADING-HK via vendor xref table)\n• STYLE+COLOR+SIZE → SKU (concatenate with dash separator per OMS convention)\n• QTY → OrderedQuantity; UCOST → UnitCost\n• SHPTO 0040 → FulfillmentNode SEC-DC-EAST\n• RQDDT → RequiredShipDate (convert YYYYMMDD → ISO 8601)\n\n**OMS → WMS (Blue Yonder):**\n• ExternalOrderId → InboundShipmentRef\n• SKU → ItemNumber (1:1 match, no transformation needed)\n• FulfillmentNode → WarehouseId (SEC-DC-EAST → WH-040)\n• Add ReceivingDoor assignment based on vendor routing guide: Door 12\n\n**OMS → TMS (Oracle Transportation Management):**\n• ExternalOrderId → ShipmentReferenceId\n• FOB Shanghai → OriginPort CNSHA, DestinationPort USNWK\n• RequiredShipDate → PlannedDeliveryDate\n• Weight/cube calculated from item master: est. 4,200 kg / 22.4 CBM → 1× 40' FCL\n\nAll field mappings validated against integration spec doc INT-SPEC-2024-v3.2. No unmapped fields.",
      },
      {
        type: "human_input",
        label: "Approve cross-system PO routing",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "PO #AS4-0026-88412 is ready to route through the order management pipeline:\n\n• AS400 → OMS (Manhattan Active Omni): 6 line items, 18,200 units, EDI 850 staged\n• OMS → WMS (Blue Yonder): Inbound shipment to WH-040 (Secaucus), Door 12\n• OMS → TMS (Oracle TM): Ocean FCL, Shanghai → Newark, delivery by 2026-04-15\n\nAll field mappings validated against INT-SPEC-2024-v3.2. Shall I push the PO through all three systems?",
        approvalButtons: ["Route PO", "Review Mappings"],
      },
      {
        type: "data_pull",
        label: "Push PO through OMS, WMS, and TMS",
        detail:
          "Transmitted PO data through the integration pipeline:\n\n• EDI 850 sent to Li & Fung at 2026-03-18T09:02Z — EDI 855 (acknowledgment) received at 09:18Z, all 6 lines accepted.\n• OMS: Order ORD-MH-2026-44182 created in Manhattan Active Omni. Status: \"Confirmed.\" Fulfillment node SEC-DC-EAST assigned.\n• WMS: Inbound ASN IB-BY-2026-08841 created in Blue Yonder. Receiving door 12 reserved for 2026-04-15. Put-away strategy: directed to zone B (menswear staging).\n• TMS: Shipment SHP-OTM-2026-33120 created in Oracle TM. Carrier assignment: COSCO Shipping, vessel CSCL Star, voyage 2026-E014, ETD Shanghai 2026-03-28, ETA Newark 2026-04-12.",
        sources: [
          "Manhattan Active Omni",
          "Blue Yonder WMS",
          "Oracle TM",
          "EDI Gateway",
        ],
      },
      {
        type: "data_pull",
        label: "Verify end-to-end dashboard status",
        detail:
          "Confirmed PO status across the combined operations dashboard:\n\n• Buying/Merch view: PO #AS4-0026-88412 — \"Order Acknowledged\" (green)\n• Supply Chain view: vessel CSCL Star tracking active, on-time probability 94%\n• DC Operations view: receiving appointment 2026-04-15 AM, door 12, zone B — scheduled\n• Finance view: accrual of $246,714 posted to AP sub-ledger, payment due 2026-05-14\n\nAll four dashboard tiles showing consistent data. No field mapping errors or EDI rejections logged.",
        sources: ["Operations Dashboard", "AP Sub-Ledger"],
      },
      {
        type: "result",
        label: "PO routed and visible across all systems",
        detail:
          "PO #AS4-0026-88412 has been successfully routed through the full system chain:\n\n• AS400: PO created and EDI 850 transmitted\n• Li & Fung: EDI 855 acknowledgment received — all 6 lines confirmed\n• OMS (Manhattan Active Omni): Order ORD-MH-2026-44182 — status \"Confirmed\"\n• WMS (Blue Yonder): Inbound ASN IB-BY-2026-08841 — door 12, zone B scheduled\n• TMS (Oracle TM): Shipment SHP-OTM-2026-33120 — COSCO CSCL Star, ETD 2026-03-28\n• Dashboard: all four views (merch, supply chain, DC ops, finance) showing consistent status\n\nNext milestone: vessel departure from Shanghai on 2026-03-28. Automated alerts set for booking confirmation and container gate-in.",
      },
    ],
    completionMessage:
      "PO routed through AS400 → OMS → WMS → TMS — all systems synchronized, vessel departure March 28 from Shanghai.",
  },

  // ── 35. rfq-response-factory ───────────────────────────────────────
  {
    id: "rfq-response-factory",
    title: "Respond to brand RFQ with detailed cost breakdown",
    subtitle:
      "Factory-side RFQ processing with multi-round pricing negotiation",
    industry: "Manufacturing",
    acknowledgment: `I'll prepare our response to the RFQ from Everlane for their Fall 2026 cashmere program. Here's my plan:

1. Parse the incoming RFQ and extract all required specifications and cost formats
2. Pull internal costing data from our PLM system and production cost models
3. Build the cost breakdown per Everlane's requested format and identify negotiation levers
4. Prepare the initial quote for your review before sending

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read incoming RFQ documents",
        "Access PLM costing data",
        "Query internal cost models",
      ],
      requiresApproval: [
        "Send cost breakdown to Everlane",
        "Accept revised pricing terms",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Parse Everlane RFQ",
        detail:
          "Received RFQ #EVL-FW26-RFQ-0034 from Everlane sourcing manager David Chen on 2026-03-16 via email. Program: Fall 2026 Grade-A Cashmere Crew Neck, 4 colorways. Target quantity: 8,000 units (2,000/color). Requested FOB: $38.00–$42.00 per unit. Required cost breakdown format: yarn, knitting, linking, washing, finishing, trim, packaging, margin — per Everlane's Radical Transparency template (Excel). Fabric spec: 100% Grade-A Mongolian cashmere, 12-gauge, 210 GSM. Deadline for initial quote: 2026-03-22. Production delivery: ex-factory by 2026-08-15.",
        sources: ["Email (David Chen)", "Everlane RFQ Portal"],
      },
      {
        type: "data_pull",
        label: "Pull internal costing from PLM and cost models",
        detail:
          "Retrieved costing data from PLM (Centric) and internal spreadsheets:\n\n• Yarn: Grade-A Mongolian cashmere at $128/kg from Erdos Cashmere. Consumption: 0.28 kg/unit = $35.84/unit for yarn alone.\n• Knitting: 12-gauge flat-knit on Shima Seiki machines, 14 min/panel × 4 panels = $4.20/unit\n• Linking: hand-linking seams, 22 min/garment = $3.80/unit\n• Washing & finishing: enzyme wash + steam press = $2.10/unit\n• Trim: woven label, care label, hangtag (Everlane-supplied artwork) = $0.65/unit\n• Packaging: tissue wrap, poly bag, carton (8 pcs/carton) = $0.90/unit\n• Factory overhead allocation: $2.40/unit\n• Target margin: 12% on total cost\n\nTotal calculated FOB: $55.90/unit at 12% margin. This is significantly above Everlane's $38–$42 target.",
        sources: ["Centric PLM", "Internal Cost Spreadsheets"],
      },
      {
        type: "reasoning",
        label: "Identify negotiation levers and prepare cost scenarios",
        detail:
          "The gap between our $55.90 FOB and Everlane's $38–$42 target is substantial ($13.90–$17.90/unit). Analyzing negotiation levers:\n\n**Scenario A — Grade-A cashmere, reduced margin:**\nDrop margin to 8%, reduce overhead allocation by streamlining QC → FOB $52.10. Still $10+ above target. Not viable alone.\n\n**Scenario B — Blended cashmere (70/30 cashmere-wool):**\nYarn cost drops to $18.40/unit. Total FOB: $35.20 at 10% margin. Within target but changes spec — Everlane may reject.\n\n**Scenario C — Grade-A cashmere, volume increase:**\nIf Everlane commits to 15,000 units, yarn MOQ discount from Erdos brings cashmere to $118/kg. Plus knitting efficiency gains. FOB: $49.80 at 10% margin. Closer but still above.\n\n**Scenario D — Grade-B cashmere (still 100%):**\nYarn at $96/kg from Erdos, consumption 0.28 kg = $26.88. Total FOB: $44.60 at 10% margin. Close to top of range with slight margin compression.\n\nRecommendation: Lead with Scenario D ($44.60) as initial quote, note that Grade-A at target price requires volume commitment (Scenario C), and be prepared to discuss blended option (Scenario B) if needed. This gives us 3 negotiation rounds of concessions.",
      },
      {
        type: "human_input",
        label: "Approve initial quote to Everlane",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Ready to send initial cost breakdown to Everlane (RFQ #EVL-FW26-RFQ-0034):\n\n**Recommended lead quote — 100% Grade-B Cashmere:**\n• Yarn: $26.88 | Knitting: $4.20 | Linking: $3.80\n• Wash/Finish: $2.10 | Trim: $0.65 | Packaging: $0.90\n• Overhead: $2.20 | Margin (10%): $4.07\n• **FOB: $44.80/unit** (at 8,000 units)\n\nNegotiation strategy: start at $44.80, have room to move to $42.50 at 8% margin. Can offer Grade-A at $49.80 with 15K unit commitment, or blended 70/30 at $35.20 if they flex on spec.\n\nShall I send this quote to David Chen?",
        approvalButtons: ["Send Quote", "Revise Pricing"],
      },
      {
        type: "data_pull",
        label: "Track negotiation rounds",
        detail:
          "Tracking negotiation history over 8 rounds (2026-03-18 to 2026-04-02):\n\n• Round 1 (email): We sent $44.80 FOB for Grade-B. David countered: must be Grade-A, target $42.\n• Round 2 (WhatsApp): We explained Grade-A yarn cost reality. Offered $49.80 at 15K units.\n• Round 3 (email): David said max volume is 10K. Asked for $46 at 10K.\n• Round 4 (WeChat — via sourcing office): Our agent proposed $48.20 at 10K with Grade-A, 8% margin.\n• Round 5 (phone call): David's manager joined. They'll do 12K units if we hit $46.50.\n• Round 6 (email): We countered $47.40 at 12K with 9% margin, Erdos volume discount.\n• Round 7 (WhatsApp): David proposed $46.90 — split the difference.\n• Round 8 (email): We accepted $46.90 at 12,000 units, Grade-A, 8.6% margin.\n\nFinal agreed FOB: $46.90/unit × 12,000 units = $562,800 total order value.",
        sources: [
          "Email Thread",
          "WhatsApp Chat",
          "WeChat (Sourcing Office)",
        ],
      },
      {
        type: "result",
        label: "Quote accepted — PO expected from Everlane",
        detail:
          "RFQ #EVL-FW26-RFQ-0034 negotiation complete:\n\n• Product: Grade-A Mongolian Cashmere Crew Neck, 4 colorways\n• Quantity: 12,000 units (3,000/color) — up from original 8,000\n• Agreed FOB: $46.90/unit\n• Total order value: $562,800\n• Factory margin: 8.6%\n• Yarn supplier: Erdos Cashmere (volume discount at 12K unit commitment)\n• Ex-factory date: 2026-08-15\n• Payment terms: NET 60 from BL date (per Everlane standard)\n\nEverlane will issue PO within 5 business days. Cost breakdown in Radical Transparency format filed in PLM. Negotiation history logged for future RFQ benchmarking. 8 rounds of negotiation across email, WhatsApp, WeChat, and phone over 15 days.",
      },
    ],
    completionMessage:
      "RFQ negotiation complete — $46.90 FOB agreed with Everlane for 12,000 cashmere units, PO expected within 5 business days.",
  },

  // ── 36. vendor-costing-gate-reviews ────────────────────────────────
  {
    id: "vendor-costing-gate-reviews",
    title: "Manage vendor costing and gate review milestones",
    subtitle:
      "CAD-to-vendor costing pipeline with gate milestone tracking",
    industry: "CPG / Packaging",
    acknowledgment: `I'll manage the vendor costing process for the new 16oz recyclable bottle redesign and track it through all gate milestones. Here's my plan:

1. Pull the CAD files and specifications from the engineering team and send to the vendor for quoting
2. Collect vendor pricing and compare against target cost and budget thresholds
3. Negotiate vendor pricing down to meet FEP targets at each gate
4. Track and update gate milestone dates through the full development pipeline

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read CAD files from engineering vault",
        "Query FEP milestone tracker",
        "Access vendor costing history",
      ],
      requiresApproval: [
        "Send CAD files to vendor",
        "Accept negotiated vendor price",
        "Advance gate milestone status",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Retrieve CAD files and project specs",
        detail:
          "Pulled CAD package for project PKG-2026-RB16 (16oz Recyclable PET Bottle Redesign) from the engineering vault:\n\n• SolidWorks file: RB16-BODY-v4.2.sldprt (bottle body, 100% rPET)\n• SolidWorks file: RB16-CAP-v3.1.sldprt (cap, HDPE with tamper-evident band)\n• 2D drawing: RB16-ASSY-v4.2.pdf (assembly drawing with tolerances)\n• Material spec: MS-rPET-2026-003 (100% post-consumer recycled PET, FDA compliant)\n• Target cost: $0.082/unit at 5M annual volume\n• Current packaging cost (legacy design): $0.094/unit\n• Gate schedule: FEP Gate 1 (concept) ✓ complete | Gate 2 (design freeze) due 2026-03-25 | Gate 3 (tooling approval) due 2026-04-15 | Gate 4 (production validation) due 2026-05-20",
        sources: ["Engineering Vault (PDM)", "FEP Tracker"],
      },
      {
        type: "data_pull",
        label: "Send CAD to vendor and collect costing",
        detail:
          "Sent CAD package to two approved vendors for competitive quoting:\n\n**Amcor Rigid Packaging (Vendor #V-8820):**\n• Quoted: $0.091/unit at 5M volume\n• Breakdown: rPET resin $0.048, blow molding $0.022, cap $0.012, labeling $0.005, QC/scrap $0.004\n• Tooling: $184,000 (new 8-cavity mold, 14-week lead)\n• Minimum order: 500K units\n\n**Graham Packaging (Vendor #V-6215):**\n• Quoted: $0.088/unit at 5M volume\n• Breakdown: rPET resin $0.046, blow molding $0.021, cap $0.013, labeling $0.005, QC/scrap $0.003\n• Tooling: $168,000 (new 8-cavity mold, 12-week lead)\n• Minimum order: 750K units\n\nBoth quotes exceed the $0.082 target by $0.006–$0.009/unit.",
        sources: ["Amcor Portal", "Graham Packaging Portal"],
      },
      {
        type: "reasoning",
        label: "Analyze costs and prepare negotiation strategy",
        detail:
          "Gap analysis against $0.082 target:\n\n• Amcor: $0.091 → needs $0.009 reduction (9.9%)\n• Graham: $0.088 → needs $0.006 reduction (6.8%)\n\nNegotiation levers identified:\n\n1. **Volume commitment**: Offer 8M annual volume (vs. 5M quoted) in exchange for unit cost reduction. rPET resin volume discount alone could save $0.003–$0.004/unit.\n2. **Multi-year contract**: 3-year supply agreement locks in pricing and gives vendor amortization runway on tooling.\n3. **Tooling co-investment**: We fund 50% of tooling upfront in exchange for $0.002/unit reduction (payback in 18 months at 8M volume).\n4. **Lightweighting**: Engineering confirms body can be reduced from 18g to 16.5g without structural compromise — saves ~$0.003 on resin.\n\nWith lightweighting + volume commitment, Graham can likely reach $0.081–$0.083. Recommend leading negotiation with Graham and using Amcor as leverage.",
      },
      {
        type: "human_input",
        label: "Approve negotiation approach and Gate 2 advancement",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Vendor costing update for PKG-2026-RB16 (16oz Recyclable Bottle):\n\n• Target: $0.082/unit | Amcor: $0.091 | Graham: $0.088\n• Recommended strategy: negotiate with Graham using lightweighting (18g→16.5g saves $0.003) + 8M volume commitment (saves $0.003–$0.004) to reach ~$0.081–$0.083\n• Tooling: $168K (Graham), 12-week lead time\n• Gate 2 (design freeze): design is stable at v4.2 with lightweighting update — ready to advance\n\nShall I proceed with Graham negotiation and advance Gate 2?",
        approvalButtons: ["Proceed & Advance Gate", "Hold at Gate 2"],
      },
      {
        type: "data_pull",
        label: "Execute negotiation and update gate milestones",
        detail:
          "Negotiation with Graham Packaging completed over 3 rounds:\n\n• Round 1: Presented 8M volume + lightweighting. Graham revised to $0.084.\n• Round 2: Offered 3-year contract + 50% tooling co-investment ($84K). Graham revised to $0.081.\n• Round 3: Final — agreed $0.082/unit at 8M annual volume, 3-year agreement, tooling co-investment of $84K. Graham absorbs remaining $84K.\n\nGate milestones updated in FEP Tracker:\n• Gate 2 (design freeze): COMPLETE — 2026-03-18 (7 days ahead of schedule)\n• Gate 3 (tooling approval): scheduled 2026-04-15 — tooling PO to be issued this week, mold delivery in 12 weeks (2026-06-10)\n• Gate 4 (production validation): rescheduled to 2026-06-24 (after mold delivery + 2-week trial run)\n• Production launch: 2026-07-15",
        sources: [
          "Graham Packaging (Email)",
          "FEP Milestone Tracker",
        ],
      },
      {
        type: "result",
        label: "Vendor selected and gate milestones on track",
        detail:
          "Vendor costing and gate review complete for PKG-2026-RB16:\n\n• Selected vendor: Graham Packaging (Vendor #V-6215)\n• Agreed unit cost: $0.082/unit (meets target exactly)\n• Annual volume commitment: 8M units, 3-year agreement\n• Tooling: $168K total ($84K co-investment, 12-week lead)\n• Savings vs. legacy design: $0.012/unit → $96,000 annual savings at 8M volume\n\nGate status:\n• Gate 1 (concept): ✓ Complete\n• Gate 2 (design freeze): ✓ Complete (2026-03-18)\n• Gate 3 (tooling approval): Scheduled 2026-04-15\n• Gate 4 (production validation): Scheduled 2026-06-24\n• Production launch: 2026-07-15\n\nAll milestone dates entered in FEP Tracker. Tooling PO ready for issuance.",
      },
    ],
    completionMessage:
      "Vendor costing finalized at $0.082/unit with Graham Packaging — Gate 2 advanced, all milestones on track for July production launch.",
  },

  // ── 37. licensed-product-approvals ─────────────────────────────────
  {
    id: "licensed-product-approvals",
    title: "Manage licensed product approval workflows",
    subtitle:
      "Brand DNA compliance and retailer deadline management for licensed products",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll manage the approval workflow for the DKNY licensed handbag collection heading to Saks and Bloomingdale's. Here's my plan:

1. Pull the brand DNA guidelines and current design submissions for the DKNY license
2. Validate each design against brand restrictions and flag any compliance issues
3. Submit compliant designs for licensor approval and track the 4-week retailer lead time
4. Escalate any unanswered decisions to keep the Saks/Bloomingdale's deadlines on track

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read brand DNA guidelines",
        "Access design submission portal",
        "Query retailer deadline calendar",
      ],
      requiresApproval: [
        "Submit designs to licensor for approval",
        "Escalate unanswered approvals to VP level",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Load brand DNA rules and retailer deadlines",
        detail:
          "Retrieved DKNY Brand DNA Guidelines (v2026-SS, document BD-DKNY-2026-02) and retailer calendar:\n\n**Brand DNA restrictions:**\n• Logo: DKNY lockup must be minimum 1.5\" height, white or black only, no metallic treatments\n• Hardware: must be brushed silver or matte gold only — no polished/shiny finishes\n• Materials: no exotic skins or animal-derived materials per DKNY sustainability charter\n• Color palette: limited to 12 approved Pantone values per season (listed in Appendix C)\n• Packaging: DKNY dust bag required for all styles over $150 retail\n\n**Retailer deadlines:**\n• Saks Fifth Avenue — PO #SAK-FW26-7820: final approved samples due 2026-04-15 (4 weeks from today)\n• Bloomingdale's — PO #BLM-FW26-3341: final approved samples due 2026-04-22 (5 weeks from today)\n• Both retailers require licensor-signed approval form attached to samples",
        sources: [
          "DKNY Brand Portal",
          "Saks Vendor Portal",
          "Bloomingdale's Vendor Portal",
        ],
      },
      {
        type: "data_pull",
        label: "Pull current design submissions",
        detail:
          "Retrieved 8 design submissions from the product development team for DKNY FW26 handbags:\n\n1. Style DK-FW26-TOTE-001 (City Tote, black pebble leather) — ✓ compliant\n2. Style DK-FW26-TOTE-002 (City Tote, cognac) — ⚠ Pantone 18-1248 not in approved palette\n3. Style DK-FW26-XBDY-003 (Crossbody, black nylon) — ✓ compliant\n4. Style DK-FW26-XBDY-004 (Crossbody, olive) — ✓ compliant\n5. Style DK-FW26-SATCH-005 (Satchel, navy) — ⚠ polished gold hardware violates matte-only rule\n6. Style DK-FW26-SATCH-006 (Satchel, burgundy) — ✓ compliant\n7. Style DK-FW26-CLCH-007 (Clutch, metallic silver) — ⚠ DKNY logo uses metallic treatment — prohibited\n8. Style DK-FW26-CLCH-008 (Clutch, black) — ✓ compliant\n\n5 styles compliant, 3 styles have Brand DNA violations.",
        sources: ["Centric PLM", "Design Submission Portal"],
      },
      {
        type: "reasoning",
        label: "Assess compliance issues and timeline risk",
        detail:
          "Analyzing the 3 non-compliant styles and their impact on retailer deadlines:\n\n**Style DK-FW26-TOTE-002 (cognac):** Pantone 18-1248 (Rust) is not in DKNY's approved palette. Closest approved alternative: Pantone 18-1142 (Amber Brown). Design team can swap the Pantone in 1 day — low risk.\n\n**Style DK-FW26-SATCH-005 (navy satchel):** Polished gold hardware must be changed to matte gold. Hardware supplier (YKK/Riri) lead time for matte gold buckle: 10 days. This is tight — sample revision + licensor review needs 14 days minimum before Saks deadline of 2026-04-15. Risk: MEDIUM.\n\n**Style DK-FW26-CLCH-007 (metallic clutch):** Metallic logo treatment is a fundamental design element. Switching to white or black logo on metallic material changes the design intent significantly. Design director needs to decide whether to revise or drop this style. Risk: HIGH — could miss both retailer windows if decision drags.\n\nRecommendation: Submit 5 compliant styles immediately for licensor approval. Fast-track fixes for TOTE-002 and SATCH-005. Escalate CLCH-007 to design director for same-day decision.",
      },
      {
        type: "human_input",
        label: "Approve submission plan and escalation",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "DKNY FW26 Handbag Approval Status:\n\n✓ 5 styles compliant — ready to submit to DKNY licensor today\n⚠ 3 styles need action:\n  • TOTE-002: swap Pantone to Amber Brown (1-day fix)\n  • SATCH-005: change to matte gold hardware (10-day lead — tight for Saks 4/15 deadline)\n  • CLCH-007: metallic logo violation — needs design director decision to revise or drop\n\nPlan: Submit 5 clean styles now, fast-track the 2 fixable styles, escalate CLCH-007 to design director Lisa Park for same-day decision.\n\nShall I proceed with submissions and escalation?",
        approvalButtons: ["Submit & Escalate", "Review Designs First"],
      },
      {
        type: "data_pull",
        label: "Submit designs and track approvals",
        detail:
          "Actions taken:\n\n• Submitted 5 compliant styles to DKNY Brand Approval Portal at 2026-03-18T10:30Z. Confirmation #DKNY-APR-2026-1182. Estimated review time: 5–7 business days.\n• TOTE-002: design team updated Pantone to 18-1142 (Amber Brown). Revised rendering uploaded. Will submit with next batch.\n• SATCH-005: rush order placed with YKK for matte gold buckles — PO #YKK-RUSH-4481, $2,200, delivery by 2026-03-28. Sample revision scheduled for 2026-03-30.\n• CLCH-007: escalation email sent to design director Lisa Park at 10:45Z. Response received at 14:20Z — Lisa approved switching to black embossed logo on metallic body. Revised design due from team by 2026-03-20.\n\nLicensor approval tracker set up with reminders at day 3 and day 5 if no response.",
        sources: [
          "DKNY Brand Approval Portal",
          "YKK Order Portal",
          "Email (Lisa Park)",
        ],
      },
      {
        type: "data_pull",
        label: "Monitor licensor response and deadline compliance",
        detail:
          "Approval tracking update as of 2026-03-24 (6 days post-submission):\n\n• Batch 1 (5 styles): DKNY approved 4 of 5 styles on 2026-03-23. Style XBDY-004 (olive crossbody) sent back with minor comment — adjust strap length from 52\" to 48\" per brand standard. Fix in progress, resubmit by 2026-03-25.\n• TOTE-002 (Amber Brown): submitted 2026-03-19, approved 2026-03-24. ✓\n• SATCH-005 (matte gold hardware): sample revision complete 2026-03-30, submitted same day. Awaiting licensor review — auto-reminder set for 2026-04-02.\n• CLCH-007 (black embossed logo): revised design submitted 2026-03-21, approved 2026-03-24. ✓\n\nSaks deadline (2026-04-15): 6 of 8 styles approved, 2 in final review. On track.\nBloomingdale's deadline (2026-04-22): 7 additional days of buffer. Low risk.",
        sources: [
          "DKNY Brand Approval Portal",
          "Retailer Deadline Calendar",
        ],
      },
      {
        type: "result",
        label: "All designs approved within retailer windows",
        detail:
          "DKNY FW26 Handbag Collection — approval workflow complete:\n\n• 8 of 8 styles approved by DKNY licensor (final approval on SATCH-005 received 2026-04-04)\n• All licensor-signed approval forms generated and attached to sample shipments\n• Saks Fifth Avenue (PO #SAK-FW26-7820): 8 approved samples shipped via FedEx Priority, tracking #7742-8810-3356, delivery 2026-04-10 — 5 days ahead of deadline\n• Bloomingdale's (PO #BLM-FW26-3341): 8 approved samples shipped 2026-04-10, delivery 2026-04-14 — 8 days ahead of deadline\n\nBrand DNA compliance: 100% — all hardware, logos, colors, and materials verified. Three initial violations caught and resolved before submission. Escalation to design director resolved CLCH-007 within 4 hours.\n\nApproval cycle: 17 days from first submission to final sign-off across 3 submission batches.",
      },
    ],
    completionMessage:
      "All 8 DKNY licensed handbag styles approved — samples delivered to Saks and Bloomingdale's ahead of deadline.",
  },

  // ── 38. multi-brand-calendar-management ────────────────────────────
  {
    id: "multi-brand-calendar-management",
    title: "Maintain and distribute multi-brand production calendars",
    subtitle:
      "Cross-brand calendar synchronization with bi-weekly distribution and impact analysis",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll process the bi-weekly calendar update across all brand calendars and flag downstream impacts. Here's my plan:

1. Pull the latest Excel calendars for each brand and identify changes since the last distribution
2. Analyze downstream impacts of any date shifts on production, logistics, and retail
3. Prepare the consolidated master calendar with change annotations
4. Distribute the updated calendar to all stakeholders with impact notes

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read brand calendar files",
        "Query stakeholder distribution lists",
        "Access production milestone data",
      ],
      requiresApproval: [
        "Distribute updated master calendar to all stakeholders",
        "Flag critical path changes to executive team",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Load brand calendars and detect changes",
        detail:
          "Loaded Excel calendars from shared drive for 4 brands, 2 seasons each (8 files total):\n\n• **Brand A (Vince):** SS26 calendar (v14) and FW26 calendar (v8). SS26: 3 date changes detected since v13 — proto review shifted from 2026-03-20 to 2026-03-27, fabric approval shifted from 2026-03-15 to 2026-03-22, bulk production start shifted from 2026-04-10 to 2026-04-17.\n• **Brand B (Theory):** SS26 calendar (v12) and FW26 calendar (v6). No changes since last distribution.\n• **Brand C (Helmut Lang):** SS26 calendar (v9) and FW26 calendar (v5). FW26: 1 change — design handoff moved from 2026-04-01 to 2026-04-08.\n• **Brand D (Contemporary Outlet):** SS26 calendar (v11) and FW26 calendar (v7). SS26: 2 changes — shipping window compressed by 5 days (was 2026-05-01–05-15, now 2026-05-01–05-10); DC receipt deadline unchanged.\n\nTotal: 6 date changes across 3 brands since last bi-weekly distribution on 2026-03-04.",
        sources: ["Shared Drive (Calendar Folder)", "Version Log"],
      },
      {
        type: "reasoning",
        label: "Analyze downstream impacts of calendar changes",
        detail:
          "Assessing downstream impacts of the 6 detected changes:\n\n**Vince SS26 — Proto review +7 days:**\n• Impact: Sales sample delivery shifts from 2026-04-25 to 2026-05-02. This puts Nordstrom buy appointment (2026-05-05) at risk — only 3 days buffer vs. normal 10 days.\n• Severity: HIGH. If proto review slips further, Nordstrom buy appointment may need to be rescheduled.\n\n**Vince SS26 — Fabric approval +7 days:**\n• Impact: Bulk fabric booking with Albini Group shifts by 7 days. Current lead time is 8 weeks, so bulk fabric arrival moves from 2026-05-10 to 2026-05-17. Production can absorb if cutting starts within 3 days of fabric receipt.\n• Severity: MEDIUM.\n\n**Vince SS26 — Bulk production start +7 days:**\n• Impact: Ex-factory date shifts from 2026-06-15 to 2026-06-22. Ocean transit to US East Coast is 28 days, so DC arrival moves from 2026-07-13 to 2026-07-20. Floor set date is 2026-08-01 — still 11 days buffer.\n• Severity: LOW.\n\n**Helmut Lang FW26 — Design handoff +7 days:**\n• Impact: Pattern making and proto development shift by 7 days. Cascading effect on first fit (from 2026-05-15 to 2026-05-22) and sales samples (from 2026-06-20 to 2026-06-27). Market week start is 2026-07-08 — buffer reduced from 18 to 11 days.\n• Severity: MEDIUM.\n\n**Contemporary Outlet SS26 — Shipping window compressed by 5 days:**\n• Impact: Factory must complete all shipments by 2026-05-10 instead of 05-15. Three POs (#CO-2026-440, 441, 442) with Texhong Textile have final inspection on 2026-05-08 — only 2 days between QC pass and shipping cutoff.\n• Severity: HIGH. Any QC failures leave zero recovery time.",
      },
      {
        type: "human_input",
        label: "Approve calendar distribution with impact flags",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Bi-weekly calendar update ready for distribution (2026-03-18 cycle):\n\n6 changes across 3 brands. Critical impacts flagged:\n\n🔴 HIGH: Vince SS26 proto review delay puts Nordstrom buy appointment (May 5) at risk — only 3 days buffer\n🔴 HIGH: Contemporary Outlet SS26 compressed shipping window leaves only 2 days between QC and ship cutoff for 3 POs\n🟡 MEDIUM: Vince SS26 fabric approval delay cascades to bulk booking\n🟡 MEDIUM: Helmut Lang FW26 design handoff delay reduces market week buffer to 11 days\n🟢 LOW: Vince SS26 production start delay — sufficient buffer to floor set\n\nShall I distribute the updated master calendar and escalate the two HIGH items to the executive team?",
        approvalButtons: [
          "Distribute & Escalate",
          "Hold Distribution",
        ],
      },
      {
        type: "data_pull",
        label: "Distribute calendar and send escalations",
        detail:
          "Master calendar distributed and escalations sent:\n\n• **Master calendar v26-W12** emailed to 34 stakeholders across design (8), production (6), sourcing (5), logistics (4), merchandising (7), and retail planning (4). Distribution list per stakeholder assignment matrix (last updated 2026-02-01).\n• Each recipient's email includes: updated Excel calendar for their brands, change summary table, and impact assessment for any HIGH/MEDIUM items affecting their function.\n• **Executive escalation**: email sent to SVP of Production (Maria Gonzalez) and VP of Merchandising (Tom Whitfield) flagging Vince/Nordstrom risk and Contemporary Outlet shipping compression. Recommended actions included: (1) Request Vince design team pull proto review back by 3 days, (2) Add pre-final QC check on Contemporary Outlet POs to catch issues earlier.\n• Shared drive updated: all 8 calendar files replaced with latest versions, previous versions archived in /Archive/2026-W10/.",
        sources: [
          "Email Distribution System",
          "Shared Drive",
          "Stakeholder Matrix",
        ],
      },
      {
        type: "result",
        label: "Calendars distributed and teams aligned",
        detail:
          "Bi-weekly calendar distribution cycle complete (2026-03-18):\n\n• Master calendar v26-W12 distributed to 34 stakeholders across 6 functional teams\n• 6 date changes flagged across Vince (3), Helmut Lang (1), and Contemporary Outlet (2)\n• 2 HIGH-severity impacts escalated to SVP Production and VP Merchandising:\n  — Vince/Nordstrom buy appointment at risk (3-day buffer)\n  — Contemporary Outlet shipping window compression (2-day QC-to-ship gap)\n• 2 MEDIUM-severity impacts communicated to affected teams with recommended mitigations\n• All calendar files updated on shared drive; previous versions archived\n• Next bi-weekly distribution scheduled: 2026-04-01\n\nStakeholder read receipts: 28 of 34 confirmed within 4 hours of distribution.",
      },
    ],
    completionMessage:
      "Master calendar distributed to 34 stakeholders — 2 high-severity impacts escalated to executive team for action.",
  },

  // ── 39. visual-assortment-planning ─────────────────────────────────
  {
    id: "visual-assortment-planning",
    title: "Build visual assortment plan for store execution",
    subtitle:
      "Digital product visualization for assortment review and store layout planning",
    industry: "Apparel & Footwear",
    acknowledgment: `I'll build the digital visual assortment plan for the FW26 women's ready-to-wear collection. Here's my plan:

1. Pull product imagery and attribute data from DPC assets and Centric PLM
2. Organize the assortment into a visual workspace matching store department layout
3. Generate the store execution view with style groupings, color stories, and fixture plans
4. Prepare the assortment review board for merchant sign-off

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read DPC product photography assets",
        "Query Centric PLM product data",
        "Access Miro workspace",
        "Read CLOSET 3D renders",
      ],
      requiresApproval: [
        "Finalize assortment plan for buyer review",
        "Publish store execution guide to retail ops",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull product imagery and PLM data",
        detail:
          "Aggregated assets for FW26 Women's RTW assortment (86 styles):\n\n**DPC Assets (Digital Product Creation):**\n• 72 of 86 styles have finalized product photography (front, back, detail shots)\n• 14 styles still in sample stage — using CLOSET 3D renders as placeholders\n• Image quality: 2400×3200px, white background, color-calibrated\n\n**Centric PLM data:**\n• All 86 styles have complete attribute records: style number, description, colorway, size range, wholesale price, MSRP, fabric composition, delivery window, and department assignment\n• Department breakdown: Dresses (22 styles), Tops (28 styles), Bottoms (18 styles), Outerwear (12 styles), Knitwear (6 styles)\n• Color stories: \"Storm\" (greys/blacks, 34 styles), \"Ember\" (burgundy/rust, 26 styles), \"Frost\" (ivory/pale blue, 16 styles), \"Pop\" (cobalt/fuchsia, 10 styles)\n• Wholesale price range: $42–$285. MSRP range: $98–$650.\n\n**Miro workspace:** Board \"FW26-WMS-RTW-ASSORTMENT\" created, currently empty.",
        sources: ["DPC Asset Manager", "Centric PLM", "CLOSET", "Miro"],
      },
      {
        type: "data_pull",
        label: "Map assortment to store department layout",
        detail:
          "Retrieved store planogram template for flagship format (Soho, NYC — 4,200 sq ft women's floor):\n\n• Zone A (entrance wall, 12 fixtures): Outerwear feature + key looks — mapped 12 outerwear styles + 8 complementary tops\n• Zone B (center floor, 18 fixtures): Dresses by color story — 22 dress styles across 4 color groupings\n• Zone C (right wall, 14 fixtures): Tops assortment — 20 remaining tops organized by silhouette (blouses, tees, knits)\n• Zone D (back wall, 10 fixtures): Bottoms — 18 styles (trousers, skirts, denim)\n• Zone E (feature table, 4 fixtures): Knitwear capsule — 6 styles as curated collection\n• Window display: 3 hero looks from \"Ember\" color story (highest-margin styles)\n\nTotal fixture count: 58 fixtures. Capacity: ~210 units on floor (average 3.6 units per fixture across sizes). Assortment density: 1.45 styles per fixture — within 1.2–1.8 target range.",
        sources: [
          "Store Planning System",
          "Planogram Template Library",
        ],
      },
      {
        type: "reasoning",
        label: "Evaluate assortment balance and identify gaps",
        detail:
          "Analyzing assortment composition against performance benchmarks and store layout:\n\n**Color story balance:**\n• \"Storm\" represents 40% of styles but historically drives 48% of revenue in FW — appropriately weighted\n• \"Ember\" at 30% is strong for a trend story — monitor sell-through for markdown risk\n• \"Frost\" at 19% is adequate for the neutrals/basics role\n• \"Pop\" at 11% is right for an accent story — should be concentrated in Zone A and window for visual impact\n\n**Price architecture:**\n• Opening price: 14 styles under $125 MSRP (16%) — slightly below the 20% target for flagship. Gap: need 3–4 more opening-price tops or bottoms.\n• Core price: 52 styles at $125–$350 (60%) — on target\n• Premium price: 20 styles above $350 (23%) — on target for flagship\n\n**Gaps identified:**\n1. No printed blouse in the \"Frost\" color story — buyers at Saks and Neiman's typically expect at least one printed option in pale palette\n2. Knitwear collection (6 styles) uses 4 fixtures but could support 6 — underpenetrated vs. FW seasonality\n3. 14 styles using 3D renders instead of photography — these need to be clearly marked as \"pending final photo\" in the assortment review\n\nRecommendation: Flag gaps for merchant review but do not hold assortment plan — these can be addressed in the chase/add cycle.",
      },
      {
        type: "human_input",
        label: "Approve visual assortment for buyer review",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Visual assortment plan ready for FW26 Women's RTW (86 styles, flagship format):\n\n• 5 store zones mapped to 58 fixtures with color story groupings\n• 72 styles with final photography, 14 using CLOSET 3D renders (marked pending)\n• Color balance: Storm 40%, Ember 30%, Frost 19%, Pop 11%\n• Price architecture: 16% opening / 60% core / 23% premium (opening slightly below 20% target)\n\nGaps flagged for merchant discussion:\n• No printed blouse in Frost color story\n• Knitwear underpenetrated vs. fixture capacity\n• 3-4 more opening-price styles recommended\n\nMiro board \"FW26-WMS-RTW-ASSORTMENT\" is populated and ready. Shall I finalize for the buyer assortment review meeting?",
        approvalButtons: [
          "Finalize for Review",
          "Adjust Assortment",
        ],
      },
      {
        type: "data_pull",
        label: "Publish store execution guide",
        detail:
          "Generated store execution deliverables from the approved visual assortment:\n\n• **Miro board** finalized: 86 styles placed in zone layout with product images, style numbers, MSRP, color story tags, and fixture assignments. Shared with 12 participants for the assortment review meeting on 2026-03-22.\n• **Store execution PDF** (42 pages): zone-by-zone fixture guide with planogram images, style/color/size recommendations per fixture, and visual merchandising notes. Published to retail ops portal.\n• **Fixture inventory request** sent to store ops: 58 fixtures needed (12 wall units, 36 floor racks, 6 display tables, 4 feature pedestals). Soho store confirms all fixtures available.\n• **Window display brief** sent to visual merchandising team: 3 hero looks from \"Ember\" story with styling notes and prop recommendations.\n• **Data sync**: Centric PLM assortment flags updated — all 86 styles marked \"Assortment Approved\" with zone and fixture assignments written back to product records.",
        sources: [
          "Miro",
          "Retail Ops Portal",
          "Centric PLM",
          "Store Ops System",
        ],
      },
      {
        type: "result",
        label: "Visual assortment approved with store execution plan",
        detail:
          "FW26 Women's RTW visual assortment plan complete:\n\n• 86 styles organized into 5 store zones across 58 fixtures for flagship format\n• Digital visual workspace replaces physical sample wall — all product imagery in Miro board for remote and in-person review\n• Assortment review meeting scheduled 2026-03-22 with buying team (12 participants)\n• Store execution guide (42 pages) published to retail ops portal\n• Window display brief sent to visual merchandising\n• Centric PLM records updated with zone/fixture assignments\n\nGaps documented for merchant follow-up:\n• Printed blouse for Frost palette (potential chase style)\n• 3–4 additional opening-price styles to hit 20% target\n• Knitwear expansion opportunity (2 additional fixtures available)\n\n14 styles pending final photography — photo shoot scheduled for week of 2026-03-23.",
      },
    ],
    completionMessage:
      "Visual assortment plan finalized — 86 styles mapped to store layout, execution guide published, buyer review meeting set for March 22.",
  },

  // ── 40. ecom-performance-tracking ──────────────────────────────────
  {
    id: "ecom-performance-tracking",
    title: "Monitor e-commerce performance and flag risks to P&L",
    subtitle:
      "Cross-platform sales monitoring with promotion tracking and data cascade management",
    industry: "DTC / E-commerce",
    acknowledgment: `I'll run the weekly e-commerce performance review and flag any risks to the P&L. Here's my plan:

1. Pull sales, inventory, and promotion data from Salesforce Commerce Cloud and Centric PLM
2. Analyze performance against targets — revenue, margin, ROAS, and inventory health
3. Check for data cascade issues when Centric attribute changes flow downstream to SFCC
4. Flag any P&L risks to the head of e-commerce with recommended actions

Let me get started.`,
    permissions: {
      autoApproved: [
        "Read Salesforce Commerce Cloud analytics",
        "Read Centric PLM product data",
        "Query marketing/ad spend dashboards",
      ],
      requiresApproval: [
        "Push Centric attribute updates to SFCC",
        "Send P&L risk alert to head of ecom",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Pull SFCC sales and inventory data",
        detail:
          "Retrieved Salesforce Commerce Cloud data for the week of 2026-03-11 to 2026-03-17:\n\n**Revenue:**\n• Gross revenue: $847,200 (target: $890,000 — 4.8% below plan)\n• Net revenue (after returns): $762,480 (return rate: 10.0%, in line with 9.5% target)\n• AOV: $128.40 (target: $132.00 — 2.7% below)\n• Conversion rate: 2.8% (target: 3.1% — 0.3pp below)\n• Sessions: 234,800 (target: 220,000 — 6.7% above, traffic is healthy)\n\n**Inventory:**\n• Total units on hand: 42,180\n• Weeks of supply at current sell rate: 8.2 weeks (target: 6–8 weeks — slightly over)\n• Aging inventory (>90 days): 6,840 units (16.2% of total — threshold: 15%)\n• Out-of-stock SKUs: 14 of 380 active SKUs (3.7%)\n• Top OOS: ESS-CREW-BLK-M (120 units/week demand, OOS since 2026-03-14)\n\n**Promotions active:**\n• \"Spring Forward\" — 20% off select styles, running since 2026-03-10\n• Free shipping threshold: $75 (permanent)\n• Affiliate program: 8% commission on first-time customer orders",
        sources: [
          "Salesforce Commerce Cloud",
          "Inventory Management System",
        ],
      },
      {
        type: "data_pull",
        label: "Pull marketing spend and ROAS data",
        detail:
          "Retrieved marketing performance for the same week:\n\n**Paid channels:**\n• Meta (Facebook/Instagram): $38,400 spend, $142,080 attributed revenue, ROAS 3.7× (target: 4.0×)\n• Google (Search + Shopping): $22,600 spend, $108,480 attributed revenue, ROAS 4.8× (target: 4.5×) ✓\n• TikTok: $8,200 spend, $18,860 attributed revenue, ROAS 2.3× (target: 3.0×) — underperforming\n• Affiliate: $12,400 commission paid, $155,000 attributed revenue, effective ROAS 12.5× ✓\n\n**Total paid spend:** $81,600 | **Blended ROAS:** 5.2× (target: 5.0×) ✓\n\n**Email/SMS (owned):**\n• Email revenue: $186,200 (22.0% of total — target: 25%)\n• SMS revenue: $42,800 (5.1% — target: 5%)\n• Email list: 284,000 subscribers (+2,100 this week)\n• Unsubscribe rate: 0.18% (healthy)\n\n**Customer acquisition cost:** $34.20 (target: $32.00 — 6.9% above)",
        sources: [
          "Meta Ads Manager",
          "Google Ads",
          "TikTok Ads",
          "Klaviyo",
        ],
      },
      {
        type: "data_pull",
        label: "Check Centric-to-SFCC data cascade",
        detail:
          "Audited Centric PLM → Salesforce Commerce Cloud data sync for the past 7 days:\n\n• 12 product attribute changes made in Centric this week\n• 9 of 12 synced correctly to SFCC within the 4-hour SLA\n• **3 sync failures detected:**\n  1. Style RTW-DRS-044: color name changed from \"Midnight\" to \"Midnight Blue\" in Centric. SFCC still shows \"Midnight\" — PDP displaying incorrect color name. Impact: low (cosmetic).\n  2. Style ACC-BAG-018: price updated from $245 to $265 in Centric. SFCC still showing $245 — customers can purchase at old price. Impact: HIGH — $20/unit margin erosion, 8 units sold at wrong price since 2026-03-15 = $160 margin loss.\n  3. Style ESS-TEE-012: new size \"XXS\" added in Centric. SFCC product page does not show XXS option — inventory exists but is not purchasable. Impact: MEDIUM — lost sales on new size, estimated 15–20 units/week demand.\n\nRoot cause for all 3: Integration middleware (MuleSoft) job failed at 2026-03-15T02:15Z due to API rate limit exceeded. Subsequent runs did not retry the failed batch.",
        sources: [
          "Centric PLM Sync Log",
          "MuleSoft Integration Dashboard",
          "SFCC Product Catalog",
        ],
      },
      {
        type: "reasoning",
        label: "Assess P&L risks and build action plan",
        detail:
          "Consolidating all performance data into P&L risk assessment:\n\n**Revenue risk: -$42,800 vs. weekly plan**\nGross revenue gap of $42,800 (4.8% miss). Root causes:\n• Conversion rate 0.3pp below target — likely driven by \"Spring Forward\" promo fatigue (running 8 days, diminishing returns after day 5 per historical pattern)\n• AOV down 2.7% — promo-driven traffic buying discounted items at lower cart values\n• 14 OOS SKUs contributing est. $18,000 in lost sales (based on demand velocity)\n\n**Margin risk: pricing sync failure**\nACC-BAG-018 pricing error: $160 already lost, ongoing $20/unit erosion until fixed. At 3–4 units/day sell rate, this costs ~$420–$560/week. Must fix immediately.\n\n**Marketing efficiency risk: TikTok ROAS at 2.3×**\nTikTok spend of $8,200/week at 2.3× ROAS is below the 3.0× floor. Recommend pausing underperforming ad sets and reallocating $3,000 to Google Shopping (performing at 4.8×).\n\n**Inventory risk: aging above threshold**\n16.2% of inventory is >90 days old (threshold: 15%). Need to markdown or promote 500+ aging units to bring back below threshold before end of month.\n\n**Overall weekly P&L impact:** estimated -$58,000 vs. plan if no action taken (revenue shortfall + margin erosion + inefficient spend).",
      },
      {
        type: "human_input",
        label: "Approve risk alert and corrective actions",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Weekly ecom performance review — P&L risk alert for head of ecom:\n\nRevenue: $847,200 vs. $890,000 target (-4.8%)\nBlended ROAS: 5.2× (on target) but TikTok at 2.3× (below 3.0× floor)\nData cascade: 3 Centric→SFCC sync failures including a live pricing error on ACC-BAG-018 ($245 instead of $265)\n\nRecommended immediate actions:\n1. Fix MuleSoft sync failures — push correct price for ACC-BAG-018 now ($160 margin already lost)\n2. Pause TikTok underperforming ad sets, reallocate $3K to Google Shopping\n3. Replenish top OOS SKU (ESS-CREW-BLK-M) — est. $18K/week lost sales\n4. Plan markdown event for 500+ aging units (>90 days) to clear before month-end\n\nShall I send this risk alert and trigger the data sync fix?",
        approvalButtons: ["Send Alert & Fix Sync", "Review First"],
      },
      {
        type: "data_pull",
        label: "Execute fixes and send P&L risk alert",
        detail:
          "Corrective actions executed:\n\n• **MuleSoft sync fix**: Triggered manual re-sync for 3 failed products at 2026-03-18T11:45Z. ACC-BAG-018 price corrected to $265 on SFCC — confirmed live at 11:48Z. RTW-DRS-044 color name updated. ESS-TEE-012 XXS size now visible on PDP. MuleSoft team notified to increase API rate limit from 500 to 1,000 calls/hour to prevent future failures.\n• **TikTok budget reallocation**: Paused 3 lowest-performing ad sets (combined spend $3,200/week). Reallocated budget to Google Shopping campaign \"Spring-GShopping-Core\" — expected ROAS improvement from 5.2× blended to 5.5×.\n• **P&L risk alert**: Email sent to Head of Ecom Sarah Kim at 2026-03-18T12:00Z with full performance summary, risk quantification (-$58K vs. plan), and 4-point action plan. CC'd VP Finance and Demand Planning.\n• **Restock request**: ESS-CREW-BLK-M replenishment request submitted to warehouse — 400 units available in reserve stock, transfer to ecom fulfillment by 2026-03-19.",
        sources: [
          "MuleSoft Dashboard",
          "TikTok Ads Manager",
          "Email (Sarah Kim)",
          "WMS",
        ],
      },
      {
        type: "result",
        label: "Performance reviewed and risks flagged to leadership",
        detail:
          "Weekly e-commerce performance review complete (week of 2026-03-11):\n\n**Performance Summary:**\n• Revenue: $847,200 / $890,000 target (-4.8%)\n• Blended ROAS: 5.2× (on target)\n• Return rate: 10.0% (in line)\n• Conversion: 2.8% (0.3pp below — promo fatigue suspected)\n\n**Issues Resolved:**\n• 3 Centric→SFCC data sync failures fixed (including live pricing error on ACC-BAG-018)\n• MuleSoft API rate limit increased to prevent recurrence\n• TikTok underperforming ad sets paused, $3.2K reallocated to Google Shopping\n• ESS-CREW-BLK-M restock of 400 units initiated from reserve\n\n**Pending Actions (assigned to teams):**\n• Demand Planning: markdown plan for 500+ aging units by 2026-03-22\n• Merchandising: evaluate \"Spring Forward\" promo — consider refreshing or ending by 2026-03-20\n• Marketing: monitor Google Shopping ROAS with reallocated budget through 2026-03-25\n\nP&L risk alert delivered to Head of Ecom Sarah Kim with full quantification and action plan.",
      },
    ],
    completionMessage:
      "Weekly ecom review complete — pricing sync error fixed, TikTok budget reallocated, P&L risk alert sent to head of ecom with action plan.",
  },
];
