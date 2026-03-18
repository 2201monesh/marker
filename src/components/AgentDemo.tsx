import { useState, useEffect, useRef, useCallback } from "react";
import { CALENDAR_HTML } from "./calendarHtml";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepDef {
  type: "system_read" | "reasoning" | "data_pull" | "human_input" | "result";
  label: string;
  detail: string;
  sources?: string[];
  /** If true, the step pauses and waits for user approval */
  requiresApproval?: boolean;
  /** Options shown during human_input steps */
  approvalPrompt?: string;
  /** Custom labels for the approval buttons [primary, secondary] */
  approvalButtons?: [string, string];
}

interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  acknowledgment: string;
  permissions: {
    autoApproved: string[];
    requiresApproval: string[];
  };
  steps: StepDef[];
  completionMessage: string;
}

// ─── Scenario data ────────────────────────────────────────────────────────────

const SCENARIOS: ScenarioDef[] = [
  {
    id: "weekly-status",
    title: "Produce the weekly status update for leadership",
    subtitle: "Cross-functional report across sourcing, costing, and logistics",
    industry: "Apparel & Footwear",
    acknowledgment:
      "On it — I'll run the weekly status workflow. This is a pre-configured workflow with read-only access to your connected systems. I'll flag anything that needs your attention before taking action.\n\n1. Connect to and read from your PLM, ERP, costing, procurement, WMS, email, and shared drives (pre-authorized, read-only)\n2. Cross-reference supplier communications with system data\n3. Flag any conflicts or delays and analyze downstream impact\n4. Compile everything into the leadership template — you'll review before anything is sent\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read from all connected systems",
        "Cross-reference data across sources",
        "Generate reports and summaries",
      ],
      requiresApproval: [
        "Send emails or reports",
        "Escalate issues to team members",
        "Update records in any system",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting & reading systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no data will be modified.",
        sources: [
          "PLM (Centric)",
          "ERP (NetSuite)",
          "Costing Tool",
          "Coupa Procurement",
          "WMS (ShipHero)",
          "Email (Outlook)",
          "Shared Drives (Google Sheets)",
        ],
      },
      {
        type: "data_pull",
        label: "Reading supplier emails & spreadsheets",
        detail:
          'Found 14 unread supplier emails since last Monday. Cross-referencing with the shared "Vendor Tracker Q1" spreadsheet from ops team... 3 suppliers have updated lead times that conflict with dates in NetSuite.',
        sources: [
          "Outlook — 14 emails from @suppliers",
          "Google Sheets — Vendor Tracker Q1",
          "NetSuite — Purchase Orders",
        ],
      },
      {
        type: "reasoning",
        label: "Reconciling conflicting lead times",
        detail:
          "Supplier Zhenmei Textiles emailed a 12-day delay on greige fabric (PO #4412) but this wasn't reflected in NetSuite. Meanwhile, the costing tool still shows the original freight estimate. If the delay holds, this pushes the cut-start date past the factory booking window — we'd need to either expedite air freight (+$2.40/unit) or renegotiate the factory slot. Checking downstream calendar impact...",
      },
      {
        type: "human_input",
        label: "Flagging significant finding",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I found something that needs your attention before I continue.\n\nThe Zhenmei delay on PO #4412 cascades into 2 other styles (STY-2291, STY-2294) that share the same fabric. Combined, these represent **$340K in first-cost exposure**. The factory in Ho Chi Minh has a 3-day buffer before the booking lapses.\n\nThis is above the $100K escalation threshold configured for this workflow. I'd recommend flagging this as critical in the report and recommending the procurement lead escalate by EOD Wednesday.\n\nShould I proceed with that recommendation, or would you like to adjust it?",
        approvalButtons: ["Proceed with recommendation", "Adjust"],
      },
      {
        type: "data_pull",
        label: "Pulling logistics & inventory status",
        detail:
          "Pulling real-time container tracking from freight forwarder portal... 6 of 8 inbound shipments are on schedule. Container MEDU4217890 is held at port of Yantian (customs review). WMS shows 92% fill-rate on active SKUs.",
        sources: [
          "Flexport Shipment Tracker",
          "WMS (ShipHero)",
          "ERP (NetSuite) — Inventory Module",
        ],
      },
      {
        type: "reasoning",
        label: "Compiling executive summary",
        detail:
          "Aggregating data across 7 systems into a structured status report. Flagging 2 critical items (Zhenmei delay, Yantian customs hold), 3 watch items, and 12 on-track workstreams. Formatting for the leadership template...",
      },
      {
        type: "human_input",
        label: "Review draft report before sending",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've drafted the weekly status report. Sending emails is not auto-approved for this workflow, so I need your sign-off.\n\n**Weekly Supply Chain Status — Week of Mar 16**\n\n🔴 **Critical (2)**\n• Zhenmei Textiles — 12-day fabric delay on PO #4412. Cascading impact to STY-2291 & STY-2294 ($340K exposure). Recommend: escalate to procurement by EOD Wed.\n• Container MEDU4217890 — held at Yantian port, customs review. ETA slip: 4–7 days. Logistics team notified.\n\n🟡 **Watch (3)**\n• Factory slot in HCMC expires Fri — decision needed on air freight vs. renegotiation by Thu.\n• Coupa PO approval queue has 6 items pending >48hrs.\n• Fabric lab dip for STY-2310 rejected on 2nd attempt — supplier re-submitting.\n\n🟢 **On Track (12 workstreams)**\nAll other development, sourcing, and logistics milestones progressing per plan.\n\n---\nWould you like me to send this to the leadership distribution list (exec-supply-chain@company.com)?",
        approvalButtons: ["Send it", "Open draft to edit"],
      },
      {
        type: "result",
        label: "Report sent",
        detail:
          "Weekly status report sent to exec-supply-chain@company.com. Calendar reminder set for Thursday to follow up on the Zhenmei escalation and factory slot decision.",
      },
    ],
    completionMessage:
      "Weekly status report compiled from 7 systems, delivered to leadership. That just saved you about 3 hours of spreadsheet wrangling and email digging.",
  },
  {
    id: "cost-analysis",
    title: "Run a landed-cost analysis on the new product line",
    subtitle: "Full cost build-up from ingredients and packaging to warehouse door",
    industry: "CPG",
    acknowledgment:
      "Got it — I'll run the landed-cost workflow. This workflow has pre-authorized read access to your formulation, ERP, and procurement systems. I'll pull the data automatically but check with you before sharing results or making recommendations.\n\n1. Connect to and read formulations, ingredient pricing, and packaging specs from PLM, ERP, and procurement (pre-authorized, read-only)\n2. Resolve any pricing discrepancies across sources\n3. Layer in co-manufacturing, freight, and distribution costs\n4. Compare against your target — you'll review the full breakdown before I share it\n\nLet me get started.",
    permissions: {
      autoApproved: [
        "Read formulations and pricing from PLM & ERP",
        "Query freight and co-man rate tables",
        "Cross-reference supplier quotes",
      ],
      requiresApproval: [
        "Share analysis with teams",
        "Create follow-up tasks",
        "Flag discrepancies to suppliers",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting & reading systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no data will be modified.",
        sources: [
          "PLM (Specright)",
          "ERP (SAP S/4HANA)",
          "Costing Tool",
          "Coupa Procurement",
          "Co-Man Portal",
          "Shared Drives (Excel formulations)",
        ],
      },
      {
        type: "data_pull",
        label: "Extracting formulations & ingredient pricing",
        detail:
          'Pulled 3 product formulations from PLM for the "Refresh" sparkling beverage line. Cross-referencing ingredient costs across 4 suppliers in Coupa. Found pricing discrepancies: citric acid supplier AmeriChem quotes $2.85/kg in Coupa but the formulation costing spreadsheet from R&D shows $2.52/kg from a quote dated 8 weeks ago.',
        sources: [
          "Specright PLM — Refresh Line Formulations",
          "Coupa — Supplier Quotes",
          "Shared Drive — R&D Costing Model v4.xlsx",
        ],
      },
      {
        type: "human_input",
        label: "Pricing discrepancy — confirming source of truth",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I found a discrepancy I want to confirm before building the cost model.\n\nAmeriChem's citric acid pricing differs between two sources:\n• **Coupa (current):** $2.85/kg — reflects a commodity surcharge added Mar 1\n• **R&D costing spreadsheet:** $2.52/kg — quote is 8 weeks old, doesn't reflect the surcharge\n\nThe Coupa quote appears to be the more current and accurate source. I'd like to use **$2.85/kg as the source of truth** for this analysis.\n\nDoes that look right, or should I use a different figure?",
        approvalButtons: ["Use $2.85, proceed", "Use a different figure"],
      },
      {
        type: "reasoning",
        label: "Resolving pricing discrepancies",
        detail:
          "Confirmed: using Coupa quote at $2.85/kg. The $0.33 delta traces back to a citric acid commodity spike (+13%) driven by a poor citrus harvest in Brazil. Alternative supplier PureChem has a valid quote at $2.71/kg but requires a 20-ton MOQ vs AmeriChem's 5-ton. At our forecasted volume of 12 tons for the launch run, AmeriChem is more cost-effective when factoring in storage costs and shelf-life constraints on excess inventory.",
      },
      {
        type: "data_pull",
        label: "Pulling co-man, packaging & freight rates",
        detail:
          "Querying co-manufacturing rates from partner portal... PackRight Co-Man quotes $0.38/unit for fill & pack on 12oz cans. Packaging costs: cans at $0.09/unit, shrink wrap at $0.03/unit, case packing at $0.05/unit. Freight: co-man facility (Indiana) → regional DC (Dallas), LTL rate $1,840/shipment at 22,000 units/load.",
        sources: [
          "Co-Man Portal — PackRight",
          "Coupa — Packaging Quotes",
          "Freight Calculator",
        ],
      },
      {
        type: "reasoning",
        label: "Building full landed-cost model",
        detail:
          "Compiling all cost layers:\n\n• Ingredients (per 12oz unit): $0.41\n• Flavoring & additives: $0.08\n• Can & packaging materials: $0.17\n• Co-manufacturing (fill, pack, label): $0.38\n• Quality testing (batch): $0.02\n• Freight to DC: $0.08\n• Warehousing & handling: $0.05\n• Insurance & shrink allowance: $0.02\n\n**Total landed cost: $1.21/unit**\n\nTarget was $1.10. We're $0.11 over. The main driver is the citric acid surcharge (+$0.06) and co-man rates running higher than budgeted (+$0.04). Two levers: negotiate co-man volume discount for the full-year commitment, or reformulate to reduce citric acid concentration (R&D estimates 1-week timeline, minimal flavor impact).",
      },
      {
        type: "human_input",
        label: "Review landed-cost breakdown",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the full landed-cost analysis. Sharing with other teams requires your approval.\n\n**Landed Cost Summary — Refresh Sparkling Line (per 12oz unit)**\n\n| Cost Layer | $/Unit |\n|---|---|\n| Ingredients | $0.41 |\n| Flavoring & Additives | $0.08 |\n| Can & Packaging | $0.17 |\n| Co-Manufacturing | $0.38 |\n| Quality Testing | $0.02 |\n| Freight to DC | $0.08 |\n| Warehousing & Handling | $0.05 |\n| Insurance & Shrink | $0.02 |\n| **Total Landed** | **$1.21** |\n\n⚠️ **$0.11 over target ($1.10)**\n\nRecommended actions:\n1. Negotiate co-man volume discount with PackRight for full-year commitment (potential savings: $0.03–0.05)\n2. Reformulate to reduce citric acid concentration (est. 1 week, potential savings: $0.04–0.06)\n\nShall I save this analysis and share it with the brand & procurement teams?",
        approvalButtons: ["Share with teams", "Open draft to review"],
      },
      {
        type: "result",
        label: "Analysis shared",
        detail:
          "Landed-cost analysis saved to the Refresh project folder and shared with brand@company.com and procurement@company.com. Follow-up tasks created: (1) PackRight volume discount negotiation, (2) R&D reformulation feasibility review.",
      },
    ],
    completionMessage:
      "Full landed-cost model built from 6 systems with discrepancy resolution. That's typically a 2-day exercise compressed into minutes.",
  },
  {
    id: "supplier-risk",
    title: "Assess supplier risk for Q2 planning",
    subtitle: "Multi-tier supplier health check with contingency mapping",
    industry: "Food & Beverage",
    acknowledgment:
      "Sure — I'll run the supplier risk workflow. This workflow has pre-authorized read access to your ERP, SRM, procurement, and compliance systems, plus external risk feeds. I'll surface everything I find but check with you before sending assessments or drafting RFQs.\n\n1. Connect to and read performance scorecards and compliance records across all active suppliers (pre-authorized, read-only)\n2. Check external risk signals — financials, news, credit ratings\n3. Identify compounding risk factors and single-source dependencies\n4. Map contingency options — you'll approve before anything goes out\n\nLet me dig in.",
    permissions: {
      autoApproved: [
        "Read supplier data from ERP & SRM",
        "Query external risk and news feeds",
        "Read email for supplier communications",
      ],
      requiresApproval: [
        "Share assessments with teams",
        "Draft or send RFQs",
        "Log findings in QMS",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting & reading systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no data will be modified.",
        sources: [
          "ERP (Oracle Cloud)",
          "SRM (SAP Ariba)",
          "Coupa Procurement",
          "Quality Management System",
          "Compliance Database",
          "Email (Outlook)",
          "News & Risk Feeds",
        ],
      },
      {
        type: "data_pull",
        label: "Aggregating supplier scorecards",
        detail:
          "Pulled performance data on 34 active suppliers across packaging, ingredients, and co-manufacturing. Cross-referencing on-time delivery rates from ERP with quality incident reports from QMS. Found: 4 suppliers below 90% OTD threshold, 2 with open CAPA items.",
        sources: [
          "Oracle Cloud — Vendor Performance",
          "QMS — CAPA Tracker",
          "SAP Ariba — Scorecards",
        ],
      },
      {
        type: "data_pull",
        label: "Checking external risk signals",
        detail:
          'Scanning recent news and risk feeds... Flagged: GreenPak Industries (packaging supplier) — parent company reported Q4 loss and credit downgrade to BB-. Also found an email thread from procurement lead about "quality concerns" with FreshBlend Co-Manufacturing from 3 weeks ago that wasn\'t logged in the QMS.',
        sources: [
          "Risk Feed — Dun & Bradstreet",
          "News API — GreenPak Industries",
          "Outlook — Procurement Lead emails",
        ],
      },
      {
        type: "human_input",
        label: "Unlogged quality issues found — flagging for review",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I found something that may need attention outside this workflow.\n\nI discovered 3 quality complaints about FreshBlend Co-Manufacturing in email threads that were **never logged in your QMS**. The complaints reference off-spec viscosity issues over the past 3 weeks.\n\nThis is a compliance gap — these should have been recorded as quality incidents. I can include this finding in the risk assessment, but wanted to flag it separately since it may require a process review.\n\nShould I:\n1. Include it in the assessment and move on?\n2. Include it and also flag to your quality team that these need to be retroactively logged?",
        approvalButtons: ["Include and flag quality team", "Include and move on"],
      },
      {
        type: "reasoning",
        label: "Assessing compounding risk factors",
        detail:
          "GreenPak supplies 60% of our sustainable packaging — a single-source dependency. Their credit downgrade + our 35-day payment terms creates a working capital risk for them. If they go into distress, lead times on packaging could blow out 4–6 weeks, halting 3 product lines. Meanwhile, FreshBlend's unlogged quality issues combined with their 87% OTD rate makes them a dual risk: quality AND delivery.",
      },
      {
        type: "reasoning",
        label: "Mapping contingency options",
        detail:
          "For GreenPak: identified 2 alternative packaging suppliers (EcoPack Solutions, PakRight) who are pre-qualified but not active. EcoPack can ramp in 6 weeks; PakRight needs re-certification (8–10 weeks). Recommendation: dual-source by activating EcoPack for 30% of volume as a hedge.\n\nFor FreshBlend: only 1 alternative co-man in region with available capacity (Precision Foods). They quoted 15% higher but have 98% OTD. Risk-adjusted, the switch saves $120K/year in disruption costs.",
      },
      {
        type: "human_input",
        label: "Review risk assessment & recommendations",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the Q2 Supplier Risk Assessment. Sharing this and drafting RFQs both require your approval.\n\n**🔴 High Risk (2 suppliers)**\n\n**GreenPak Industries** (Packaging)\n• Single-source dependency (60% of sustainable packaging)\n• Credit downgraded to BB- (parent company Q4 loss)\n• Risk: 4–6 week supply disruption if financial distress worsens\n• **Recommendation:** Activate EcoPack Solutions for 30% of volume (6-week ramp)\n\n**FreshBlend Co-Manufacturing** (Co-Man)\n• 87% OTD (below 90% threshold)\n• 3 unlogged quality complaints (off-spec viscosity)\n• **Recommendation:** Begin transition to Precision Foods (+15% cost, but 98% OTD; net savings $120K/yr risk-adjusted)\n\n**🟡 Watch (4 suppliers)**\n• Below 90% OTD but no compounding risk factors\n\n**🟢 Healthy (28 suppliers)**\n• All metrics within acceptable ranges\n\nShall I:\n1. Share this assessment with the procurement & quality teams?\n2. Draft RFQs for EcoPack and Precision Foods?\n3. Both?",
        approvalButtons: ["Share and draft RFQs", "Open draft to review"],
      },
      {
        type: "result",
        label: "Assessment distributed & RFQs drafted",
        detail:
          "Risk assessment shared with procurement@company.com and quality@company.com. Draft RFQs prepared for EcoPack Solutions and Precision Foods and placed in the procurement approval queue in Coupa. Quality team notified about unlogged FreshBlend incidents for retroactive QMS entry.",
      },
    ],
    completionMessage:
      "Supplier risk assessment complete — 34 suppliers evaluated across 7 data sources with actionable contingency plans. That typically takes a team 2–3 days of manual work.",
  },
  {
    id: "order-expedite",
    title: "Investigate and expedite a delayed wholesale order",
    subtitle: "End-to-end order tracking with root-cause analysis",
    industry: "Sports Retailer",
    acknowledgment:
      "On it — I'll run the order investigation workflow. This workflow has pre-authorized read access to your OMS, WMS, 3PL portal, and wholesale CRM. I can trace the order and identify issues automatically, but any actions — reallocating inventory, updating accounts, or contacting wholesale partners — require your sign-off.\n\n1. Connect to and read the order from OMS, then trace through warehouse and logistics (pre-authorized, read-only)\n2. Identify the root cause of any delays\n3. Evaluate expedite options with cost and timeline trade-offs\n4. Recommend a recovery plan — you'll approve before I execute anything\n\nLet me start tracking.",
    permissions: {
      autoApproved: [
        "Read order data from OMS & wholesale CRM",
        "Read inventory and allocation from WMS",
        "Read 3PL tracking and email",
      ],
      requiresApproval: [
        "Reallocate inventory across channels",
        "Update wholesale account records",
        "Send partner notifications",
      ],
    },
    steps: [
      {
        type: "system_read",
        label: "Connecting & reading systems",
        detail:
          "Authenticating via pre-configured service accounts. All connections are read-only — no data will be modified.",
        sources: [
          "OMS (NetSuite)",
          "WMS (Manhattan Active)",
          "3PL Portal (Radial)",
          "Wholesale CRM (NuOrder)",
          "Email (Outlook)",
          "Supplier Portal",
        ],
      },
      {
        type: "data_pull",
        label: "Tracing order through systems",
        detail:
          'Wholesale order WO-14208 (Fleet Feet, 2,400 units across 3 SKUs, $186K) due to arrive at their DC by Mar 24 for spring floor-set. NuOrder shows the account manager flagged this 2 days ago — Fleet Feet is threatening to reduce next season\'s buy. Tracing back: OMS shows the order was released to fulfillment on Mar 8, but WMS shows only SKU RUN-340 (men\'s trail runner) has been picked. The other 2 SKUs are blocked.',
        sources: [
          "NetSuite OMS — WO-14208",
          "Manhattan Active WMS — Pick Status",
          "NuOrder — Fleet Feet Account",
        ],
      },
      {
        type: "data_pull",
        label: "Identifying root cause of fulfillment block",
        detail:
          'SKU FIT-220 (women\'s training shoe) is blocked because allocated inventory was pulled for a flash sale on the DTC site that ran Mar 10–12. 800 of the 1,000 units earmarked for Fleet Feet were reallocated to DTC without updating the wholesale commitment. SKU TRK-115 (unisex hiking boot) shows "awaiting receiving" — the inbound shipment from the Vietnam factory cleared customs but the 3PL hasn\'t checked it in yet. An email from Radial on Mar 13 mentions a backlog at the receiving dock.',
        sources: [
          "WMS — Inventory Allocation Log",
          "DTC Platform — Flash Sale Mar 10–12",
          "3PL Portal — Radial Receiving Queue",
          "Outlook — Radial backlog notification",
        ],
      },
      {
        type: "human_input",
        label: "Root cause identified — confirming before evaluating options",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "I've identified two separate issues and want to confirm before I spend time evaluating recovery options.\n\n**Issue 1 — FIT-220 (women's training shoe):** 800 units were reallocated from this wholesale order to a DTC flash sale on Mar 10–12. The wholesale commitment in NuOrder was never updated. This is a channel conflict — inventory was moved without checking wholesale obligations.\n\n**Issue 2 — TRK-115 (unisex hiking boot):** Inbound shipment has cleared customs but is sitting in Radial's receiving backlog. The 3PL flagged dock congestion on Mar 13 but the alert wasn't actioned.\n\nFleet Feet needs all 3 SKUs by Mar 24 for their spring floor-set. Should I proceed with evaluating recovery options?",
        approvalButtons: ["Evaluate options", "I'll handle this manually"],
      },
      {
        type: "reasoning",
        label: "Evaluating recovery options",
        detail:
          "For FIT-220 (800-unit shortfall):\n1. **Reallocate from DTC safety stock** — 600 units available in the same DC. Covers 75% of the gap immediately, no shipping cost. Remaining 200 can ship from the West Coast DC via 2-day air ($3.20/unit, $640 total).\n2. **Pull from another wholesale allocation** — 800 units allocated to a Nordstrom order shipping Apr 3. We could borrow and replenish from the next factory shipment (arrives Mar 28). Risk: tight turnaround on Nordstrom.\n3. **Short-ship Fleet Feet** — Send what we have, backfill the rest. Risk: they've already threatened to cut next season's buy.\n\nOption 1 is safest — preserves all wholesale commitments and only costs $640 in expedited freight.\n\nFor TRK-115: Radial can prioritize the receiving check-in if we flag it. Estimated 24-hour turnaround once escalated. No additional cost.",
      },
      {
        type: "human_input",
        label: "Approve recovery plan",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the proposed recovery plan. Reallocating inventory and contacting partners both require your approval.\n\n**FIT-220 Recovery:**\n• Reallocate 600 units from DTC safety stock (same DC, immediate)\n• Ship remaining 200 units from West Coast DC via 2-day air ($640)\n• Total cost: $640 | Fleet Feet gets full quantity by Mar 22 ✅\n\n**TRK-115 Recovery:**\n• Escalate receiving priority with Radial — 24hr turnaround\n• No additional cost | Available for pick by Mar 20 ✅\n\n**Process Fix:** Add wholesale commitment checks to the DTC inventory allocation workflow so future flash sales can't pull from committed wholesale orders.\n\nShall I:\n1. Submit the inventory reallocation in WMS?\n2. Escalate the TRK-115 receiving with Radial?\n3. Update the Fleet Feet account manager with the recovery timeline?",
        approvalButtons: ["Execute recovery plan", "Let me review the options"],
      },
      {
        type: "result",
        label: "Recovery in motion",
        detail:
          "Inventory reallocation submitted in Manhattan Active WMS. Radial receiving escalation sent via 3PL portal. Fleet Feet account updated in NuOrder with revised delivery timeline (Mar 22). DTC allocation workflow flagged for process review to prevent future channel conflicts.",
      },
    ],
    completionMessage:
      "Order rescue complete — root cause identified across two systems, recovery plan executed, and process gap flagged. A $186K wholesale order preserved and a key account relationship protected.",
  },
];

// ─── Palette ──────────────────────────────────────────────────────────────────
// Inspired by botanical gouache / de Gournay mural aesthetic:
// cream backgrounds, sage greens, warm ochre, soft browns

const C = {
  cream: "#FAF6F0",
  creamDark: "#F0E9DE",
  parchment: "#F5EFE5",
  border: "#DDD2C0",
  borderLight: "#E8DFD0",
  text: "#2D2418",
  textMuted: "#6B5638",
  textLight: "#7D6B4F",
  sage: "#3A7D56",
  sageMuted: "#4E9A6A",
  sageLight: "#EAF3ED",
  sageBorder: "#B8D4C2",
  ochre: "#B8860B",
  ochreMuted: "#C4922A",
  ochreLight: "#FBF5E6",
  ochreBorder: "#E5D5A8",
  warmAmber: "#FDF8EF",
  amberBorder: "#EBD9B8",
  brown: "#6B4E2E",
};

/** Parse simple markdown bold (**text**) into React elements */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Remove any trailing orphaned ** that haven't closed yet (mid-stream)
  let cleaned = text.replace(/\*\*([^*]*)$/, "$1");
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleaned.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < cleaned.length) {
    parts.push(cleaned.slice(lastIndex));
  }
  return parts;
}

// ─── Helper components ────────────────────────────────────────────────────────

/** Classical dentil-style ornamental divider */
function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px" style={{ background: C.borderLight }} />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rotate-45"
            style={{ background: C.border }}
          />
        ))}
      </div>
      <div className="flex-1 h-px" style={{ background: C.borderLight }} />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span
        className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_ease-in-out_0s_infinite]"
        style={{ background: C.sage }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_ease-in-out_0.15s_infinite]"
        style={{ background: C.sage }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full animate-[bounce_1s_ease-in-out_0.3s_infinite]"
        style={{ background: C.sage }}
      />
    </span>
  );
}

function SystemBadge({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-0.5"
      style={{
        background: C.sageLight,
        color: C.sage,
        border: `1px solid ${C.sageBorder}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: C.sageMuted }}
      />
      {name}
    </span>
  );
}

/** Animated pill for the system_read step — transitions through connecting → connected */
function AnimatedSystemPill({
  name,
  status,
}: {
  name: string;
  status: "waiting" | "connecting" | "connected";
}) {
  const isWaiting = status === "waiting";
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 transition-all duration-500"
      style={{
        background: isConnected ? C.sageLight : isConnecting ? C.cream : C.creamDark,
        color: isConnected ? C.sage : isConnecting ? C.textMuted : C.textLight,
        border: `1px solid ${isConnected ? C.sageBorder : isConnecting ? C.border : C.borderLight}`,
        opacity: isWaiting ? 0.6 : 1,
      }}
    >
      {/* Status indicator */}
      {isWaiting && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: C.borderLight }}
        />
      )}
      {isConnecting && (
        <span className="relative w-1.5 h-1.5">
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: C.ochre, opacity: 0.6 }}
          />
          <span
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ background: C.ochre }}
          />
        </span>
      )}
      {isConnected && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {name}
    </span>
  );
}

/** The animated "Connecting & reading systems" step with two-section pill layout */
function SystemConnectStep({
  sources,
  onComplete,
}: {
  sources: string[];
  onComplete: () => void;
}) {
  const [pillStatuses, setPillStatuses] = useState<
    Record<number, "waiting" | "connecting" | "connected">
  >(() => Object.fromEntries(sources.map((_, i) => [i, "waiting"])));
  const [phase, setPhase] = useState<"starting" | "connecting" | "done">("starting");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Brief initial pause
    const startTimeout = setTimeout(() => {
      setPhase("connecting");

      // Stagger each pill: first set to "connecting", then after a random delay, "connected"
      const shuffled = sources
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5);

      shuffled.forEach((pillIndex, order) => {
        // Start connecting with stagger
        const connectDelay = 500 + order * 600 + Math.random() * 500;
        const t1 = setTimeout(() => {
          setPillStatuses((prev) => ({ ...prev, [pillIndex]: "connecting" }));
        }, connectDelay);

        // Complete connection after authenticating
        const completeDelay = connectDelay + 1800 + Math.random() * 1500;
        const t2 = setTimeout(() => {
          setPillStatuses((prev) => ({ ...prev, [pillIndex]: "connected" }));
        }, completeDelay);

        timeoutsRef.current.push(t1, t2);
      });

      // All done — calculate max delay
      const maxDelay =
        500 +
        (sources.length - 1) * 600 +
        500 + // max random from connect
        1800 +
        1500 + // max random from complete
        800; // buffer
      const doneTimeout = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, maxDelay);
      timeoutsRef.current.push(doneTimeout);
    }, 600);
    timeoutsRef.current.push(startTimeout);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [sources, onComplete]);

  const connectingPills = sources.filter(
    (_, i) => pillStatuses[i] === "waiting" || pillStatuses[i] === "connecting"
  );
  const connectedPills = sources.filter((_, i) => pillStatuses[i] === "connected");

  return (
    <div className="space-y-3">
      {/* Authenticating section */}
      {connectingPills.length > 0 && (
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-medium mb-2"
            style={{ color: C.textLight }}
          >
            {phase === "starting" ? "Queuing connections..." : "Connecting & reading..."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map(
              (src, i) =>
                (pillStatuses[i] === "waiting" ||
                  pillStatuses[i] === "connecting") && (
                  <AnimatedSystemPill
                    key={src}
                    name={src}
                    status={pillStatuses[i]}
                  />
                )
            )}
          </div>
        </div>
      )}

      {/* Connected section */}
      {connectedPills.length > 0 && (
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-medium mb-2"
            style={{ color: C.sage }}
          >
            Data read
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map(
              (src, i) =>
                pillStatuses[i] === "connected" && (
                  <AnimatedSystemPill
                    key={src}
                    name={src}
                    status="connected"
                  />
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Permissions summary card shown after the acknowledgment */
function PermissionsCard({
  permissions,
}: {
  permissions: ScenarioDef["permissions"];
}) {
  return (
    <div
      className="rounded-xl p-4 text-xs"
      style={{
        background: C.cream,
        border: `1px solid ${C.borderLight}`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke={C.sage}
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <span className="font-semibold uppercase tracking-wider" style={{ color: C.text }}>
          Workflow permissions
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-medium mb-1.5" style={{ color: C.sage }}>
            Auto-approved (read-only)
          </p>
          <ul className="space-y-1">
            {permissions.autoApproved.map((item) => (
              <li key={item} className="flex items-start gap-1.5" style={{ color: C.textMuted }}>
                <svg
                  className="w-3 h-3 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={C.sage}
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1.5" style={{ color: C.ochre }}>
            Requires your approval
          </p>
          <ul className="space-y-1">
            {permissions.requiresApproval.map((item) => (
              <li key={item} className="flex items-start gap-1.5" style={{ color: C.textMuted }}>
                <svg
                  className="w-3 h-3 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={C.ochre}
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Compact workflow step diagram shown inside scenario buttons */
function WorkflowDiagram({ steps }: { steps: StepDef[] }) {
  // Collapse consecutive same-type steps and map to visual nodes
  const nodes: { type: StepDef["type"]; label: string; count: number }[] = [];
  for (const step of steps) {
    const last = nodes[nodes.length - 1];
    if (last && last.type === step.type) {
      last.count++;
    } else {
      // Short labels for each type
      const shortLabel: Record<StepDef["type"], string> = {
        system_read: "Connect",
        data_pull: "Read",
        reasoning: "Analyze",
        human_input: "Review",
        result: "Act",
      };
      nodes.push({ type: step.type, label: shortLabel[step.type], count: 1 });
    }
  }

  const nodeColor: Record<StepDef["type"], string> = {
    system_read: C.sage,
    data_pull: C.sage,
    reasoning: C.ochre,
    human_input: C.brown,
    result: C.sage,
  };

  return (
    <div className="flex items-center gap-0 mt-2.5 overflow-hidden">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div
              className="w-3 h-px shrink-0"
              style={{ background: C.borderLight }}
            />
          )}
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0"
            style={{
              background: `${nodeColor[node.type]}14`,
              border: `1px solid ${nodeColor[node.type]}30`,
            }}
          >
            {/* Tiny icon per type */}
            {(node.type === "system_read" || node.type === "data_pull") && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={nodeColor[node.type]} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            )}
            {node.type === "reasoning" && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={nodeColor[node.type]} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
            {node.type === "human_input" && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={nodeColor[node.type]} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
            )}
            {node.type === "result" && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={nodeColor[node.type]} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            <span
              className="text-[9px] font-medium leading-none"
              style={{ color: nodeColor[node.type] }}
            >
              {node.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Sticky workflow progress bar shown during an active workflow run */
function WorkflowProgressInline({
  steps,
  currentStep,
  allDone,
}: {
  steps: StepDef[];
  currentStep: number;
  allDone: boolean;
}) {
  // Collapse consecutive same-type steps into nodes (same logic as WorkflowDiagram)
  const nodes: { type: StepDef["type"]; label: string; startIndex: number; endIndex: number }[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const last = nodes[nodes.length - 1];
    if (last && last.type === step.type) {
      last.endIndex = i;
    } else {
      const shortLabel: Record<StepDef["type"], string> = {
        system_read: "Connect",
        data_pull: "Read",
        reasoning: "Analyze",
        human_input: "Review",
        result: "Act",
      };
      nodes.push({ type: step.type, label: shortLabel[step.type], startIndex: i, endIndex: i });
    }
  }

  const nodeColor: Record<StepDef["type"], string> = {
    system_read: C.sage,
    data_pull: C.sage,
    reasoning: C.ochre,
    human_input: C.brown,
    result: C.sage,
  };

  return (
    <div className="contents">
        {nodes.map((node, i) => {
          const isDone = allDone || currentStep > node.endIndex;
          const isActive = !allDone && currentStep >= node.startIndex && currentStep <= node.endIndex;
          const isPending = !isDone && !isActive;
          const color = nodeColor[node.type];

          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="w-4 sm:w-6 h-px shrink-0 transition-colors duration-500"
                  style={{ background: isDone ? `${color}60` : C.borderLight }}
                />
              )}
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1 shrink-0 transition-all duration-500"
                style={{
                  background: isDone ? `${color}20` : isActive ? `${color}14` : `${C.borderLight}80`,
                  border: `1px solid ${isDone ? `${color}40` : isActive ? `${color}50` : C.borderLight}`,
                  boxShadow: isActive ? `0 0 0 2px ${C.cream}, 0 0 0 4px ${color}40` : "none",
                  opacity: isPending ? 0.5 : 1,
                } as React.CSSProperties}
              >
                {/* Icon: checkmark if done, type icon if active/pending */}
                {isDone ? (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <>
                    {(node.type === "system_read" || node.type === "data_pull") && (
                      <svg className={`w-2.5 h-2.5 ${isActive ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke={isPending ? C.textLight : color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    )}
                    {node.type === "reasoning" && (
                      <svg className={`w-2.5 h-2.5 ${isActive ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke={isPending ? C.textLight : color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    {node.type === "human_input" && (
                      <svg className={`w-2.5 h-2.5 ${isActive ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke={isPending ? C.textLight : color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                      </svg>
                    )}
                    {node.type === "result" && (
                      <svg className={`w-2.5 h-2.5 ${isActive ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke={isPending ? C.textLight : color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </>
                )}
                <span
                  className="text-[9px] font-medium leading-none"
                  style={{ color: isDone ? color : isActive ? color : C.textLight }}
                >
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}

/** Sidebar nav button — icon with inline label that appears when sidebar is expanded */
function SidebarButton({
  icon,
  label,
  active = false,
  expanded = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-10 rounded-lg flex items-center gap-2.5 px-2.5 transition-colors shrink-0"
      style={{
        background: active ? C.border : "transparent",
        color: active ? C.text : C.textLight,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = C.creamDark;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
      <span
        className="text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-200"
        style={{
          width: expanded ? "auto" : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Workflow builder data ────────────────────────────────────────────────────

interface BuilderStep {
  type: "trigger" | "connect" | "send" | "wait" | "read" | "review" | "write" | "notify";
  title: string;
  /** Config fields shown inside the card — what you'd fill in when building this step */
  config: { label: string; value: string }[];
  permission?: "auto" | "approval";
}

interface BuilderWorkflow {
  id: string;
  calendarStepId: string;
  title: string;
  subtitle: string;
  steps: BuilderStep[];
}

const BUILDER_WORKFLOWS: BuilderWorkflow[] = [
  {
    id: "collect-fabric-data",
    calendarStepId: "p0",
    title: "Collect fabric data sheets",
    subtitle: "Automated vendor portal workflow — triggered at season kickoff",
    steps: [
      {
        type: "trigger",
        title: "Season kickoff",
        config: [
          { label: "Trigger", value: "Manual start" },
          { label: "Started by", value: "PD Lead" },
        ],
      },
      {
        type: "connect",
        title: "Pull style list",
        config: [
          { label: "Connector", value: "Centric PLM" },
          { label: "Query", value: "All active woven styles for SS26" },
          { label: "Returns", value: "127 styles with fabric requirements" },
        ],
        permission: "auto",
      },
      {
        type: "send",
        title: "Request data sheets from mills",
        config: [
          { label: "Connector", value: "Outlook — Email" },
          { label: "To", value: "8 mills (from approved vendor list)" },
          { label: "Template", value: "Fabric data sheet request — SS26" },
          { label: "Attach", value: "Style list, spec requirements" },
        ],
        permission: "approval",
      },
      {
        type: "wait",
        title: "Await mill uploads",
        config: [
          { label: "Listen for", value: "Vendor Portal — new file uploads" },
          { label: "Remind", value: "Auto-email at 48h, 1 week" },
          { label: "Timeout", value: "10 business days" },
        ],
      },
      {
        type: "read",
        title: "Extract fabric specs",
        config: [
          { label: "Source", value: "Vendor Portal — uploaded PDFs" },
          { label: "Extract", value: "Composition, weight, width, MOQ, lead time, pricing" },
          { label: "Match to", value: "Style list from Centric PLM" },
        ],
        permission: "auto",
      },
      {
        type: "write",
        title: "Write specs to PLM",
        config: [
          { label: "Connector", value: "Centric PLM" },
          { label: "Action", value: "Update fabric spec fields for matched styles" },
          { label: "Attach", value: "Original mill data sheets as reference" },
        ],
        permission: "approval",
      },
      {
        type: "review",
        title: "Flag mismatches for PD",
        config: [
          { label: "Check", value: "MOQ vs. buy plan, pricing vs. targets" },
          { label: "Route to", value: "PD Lead — via Slack + email" },
          { label: "Threshold", value: "Any pricing >5% over target" },
        ],
        permission: "approval",
      },
      {
        type: "notify",
        title: "Confirm completion to team",
        config: [
          { label: "Connector", value: "Outlook — Email" },
          { label: "To", value: "PD Lead, Design Lead" },
          { label: "Template", value: "Fabric data collection complete — SS26" },
          { label: "Include", value: "Summary: styles matched, flags raised" },
        ],
        permission: "auto",
      },
    ],
  },
];

const STEP_META: Record<BuilderStep["type"], { label: string; color: string; iconPath: string }> = {
  trigger: {
    label: "Trigger",
    color: C.textLight,
    iconPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  connect: {
    label: "Connect",
    color: C.sage,
    iconPath: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  },
  send: {
    label: "Send",
    color: C.sage,
    iconPath: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
  },
  wait: {
    label: "Wait",
    color: C.ochre,
    iconPath: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  read: {
    label: "Read",
    color: C.sage,
    iconPath: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  },
  review: {
    label: "Review",
    color: C.brown,
    iconPath: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0",
  },
  write: {
    label: "Write",
    color: C.sage,
    iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
  },
  notify: {
    label: "Notify",
    color: C.sage,
    iconPath: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  },
};

/** Single step card for the workflow builder canvas */
function BuilderStepCard({ step }: { step: BuilderStep }) {
  const meta = STEP_META[step.type];
  const isApproval = step.permission === "approval";
  const hasPermission = step.permission !== undefined;

  return (
    <div
      className="rounded-xl shrink-0 flex flex-col"
      style={{
        width: 210,
        background: C.cream,
        border: `1px solid ${C.borderLight}`,
        boxShadow: `0 1px 4px ${C.borderLight}60`,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${meta.color}14`, color: meta.color }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={meta.iconPath} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: C.text }}>
            {step.title}
          </p>
        </div>
      </div>

      {/* Config fields */}
      <div className="px-3 py-2 flex-1 space-y-1.5">
        {step.config.map((cfg) => (
          <div key={cfg.label}>
            <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: C.textLight }}>
              {cfg.label}
            </span>
            <p className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {cfg.value}
            </p>
          </div>
        ))}
      </div>

      {/* Permission badge */}
      {hasPermission && (
        <div className="px-3 pb-2.5 pt-1">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium w-fit"
            style={{
              background: isApproval ? `${C.ochre}10` : `${C.sage}10`,
              color: isApproval ? C.ochre : C.sage,
              border: `1px solid ${isApproval ? C.ochre : C.sage}25`,
            }}
          >
            {isApproval ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isApproval ? "Requires approval" : "Auto-approved"}
          </div>
        </div>
      )}
    </div>
  );
}

/** Workflow builder canvas view — horizontal card layout */
function WorkflowBuilderView({
  workflow,
  onBack,
}: {
  workflow: BuilderWorkflow;
  onBack: () => void;
}) {
  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{
        background: C.cream,
        backgroundImage: `radial-gradient(circle, ${C.borderLight}66 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Header bar */}
      <div
        className="shrink-0 px-6 py-3 flex items-center gap-3"
        style={{
          background: `${C.cream}ee`,
          borderBottom: `1px solid ${C.borderLight}`,
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: C.text }}>{workflow.title}</h2>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ml-3"
          style={{ background: `${C.sage}14`, border: `1px solid ${C.sage}30`, color: C.sage }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Automated workflow
        </div>
      </div>

      {/* Canvas — horizontally scrollable cards */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        <div className="flex items-start gap-0 pl-8 py-8 min-w-max" style={{ minHeight: "100%" }}>
          {workflow.steps.map((step, i) => (
            <div key={i} className="flex items-start">
              {/* Connector line */}
              {i > 0 && (
                <div className="flex items-center self-center shrink-0" style={{ marginTop: 0 }}>
                  <div className="w-6 h-px" style={{ background: C.borderLight }} />
                  <svg className="w-2 h-2 -ml-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={C.borderLight} strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              )}
              <BuilderStepCard step={step} />
            </div>
          ))}
          <div className="shrink-0 w-8" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Sourcing calendar Gantt chart view */
function SourcingCalendar({ onAgentClick }: { onAgentClick?: (stepId: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onAgentClick);
  callbackRef.current = onAgentClick;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const cssVars: Record<string, string> = {
      "--color-text-primary": C.text,
      "--color-text-secondary": C.textMuted,
      "--color-text-tertiary": C.textLight,
      "--color-text-info": C.sage,
      "--color-text-warning": C.ochre,
      "--color-text-success": "#4E9A6A",
      "--color-background-primary": C.cream,
      "--color-background-secondary": C.parchment,
      "--color-background-info": C.sageLight,
      "--color-background-warning": C.ochreLight,
      "--color-background-success": C.sageLight,
      "--color-border-secondary": C.border,
      "--color-border-tertiary": C.borderLight,
      "--color-border-info": C.sageBorder,
      "--color-border-warning": C.ochreBorder,
      "--border-radius-md": "8px",
      "--border-radius-lg": "12px",
      "--font-sans": "inherit",
    };
    for (const [k, v] of Object.entries(cssVars)) {
      el.style.setProperty(k, v);
    }

    el.innerHTML = CALENDAR_HTML;

    // Execute the calendar script, exposing a cleanup hook via a global
    const scriptEl = el.querySelector("script");
    if (scriptEl) {
      const wrappedScript = scriptEl.textContent + "\nwindow.__calendarTT = TT;";
      const fn = new Function(wrappedScript);
      fn();
    }

    // Add click delegation for agent steps
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(".c.is-agent") as HTMLElement | null;
      if (target?.id && callbackRef.current) {
        callbackRef.current(target.id);
      }
    };
    el.addEventListener("click", handleClick);

    return () => {
      el.removeEventListener("click", handleClick);
      // Clear any running simulation timeouts
      const tt = (window as unknown as Record<string, ReturnType<typeof setTimeout>[]>).__calendarTT;
      if (tt) {
        tt.forEach(clearTimeout);
        delete (window as unknown as Record<string, unknown>).__calendarTT;
      }
      el.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="px-6 py-4" />;
}

function MarkerLogo() {
  return (
    <a href="/" className="flex items-center">
      <img src="/logo.png" alt="Marker" className="h-7" />
    </a>
  );
}

/** The "M" avatar for agent messages */
function AgentAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
      style={{ background: C.sage }}
    >
      M
    </div>
  );
}

/** The "R" avatar for Richard's messages */
function UserAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
      style={{ background: C.brown }}
    >
      R
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AgentDemo() {
  const [activeView, setActiveView] = useState<"chat" | "workflows" | "calendars" | "workflow-builder">("chat");
  const [builderWorkflowId, setBuilderWorkflowId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [workflowsCollapsed, setWorkflowsCollapsed] = useState(false);
  const [automatedCollapsed, setAutomatedCollapsed] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDef | null>(
    null
  );
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [currentStepDone, setCurrentStepDone] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [ackText, setAckText] = useState("");
  const [ackDone, setAckDone] = useState(false);
  const [typewriterText, setTypewriterText] = useState<
    Record<number, string>
  >({});
  const [typewriterDone, setTypewriterDone] = useState<
    Record<number, boolean>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const systemConnectResolveRef = useRef<(() => void) | null>(null);

  // Auto-scroll — scroll during streaming, but stop if user scrolls up
  const autoScrollEnabledRef = useRef(true);

  // Track user scroll: if they scroll up, disable auto-scroll
  // If they scroll back to bottom, re-enable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 150;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      autoScrollEnabledRef.current = atBottom;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Re-enable auto-scroll when a new scenario starts
  useEffect(() => {
    autoScrollEnabledRef.current = true;
  }, [selectedScenario]);

  // Scroll to bottom as content changes
  useEffect(() => {
    if (autoScrollEnabledRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps, currentStepDone, waitingForApproval, allDone, ackDone, typewriterText, ackText]);

  // Stream text in word-sized chunks to simulate LLM token output
  const streamText = useCallback(
    (
      text: string,
      onUpdate: (partial: string) => void,
      onDone: () => void,
    ): void => {
      // Split into word-like tokens (words + whitespace/punctuation)
      const tokens = text.match(/\S+\s*/g) || [text];
      let tokenIndex = 0;
      const tick = () => {
        // Emit 1–3 tokens per tick for natural variation
        const count = 1 + Math.floor(Math.random() * 2);
        tokenIndex = Math.min(tokenIndex + count, tokens.length);
        onUpdate(tokens.slice(0, tokenIndex).join(""));
        if (tokenIndex < tokens.length) {
          // Vary delay: shorter for small tokens, occasional pause
          const delay = 30 + Math.random() * 40;
          timeoutRef.current = setTimeout(tick, delay);
        } else {
          onDone();
        }
      };
      tick();
    },
    []
  );

  // Typewriter effect for a step
  const typewrite = useCallback(
    (stepIndex: number, text: string): Promise<void> => {
      return new Promise((resolve) => {
        streamText(
          text,
          (partial) => setTypewriterText((prev) => ({ ...prev, [stepIndex]: partial })),
          () => {
            setTypewriterDone((prev) => ({ ...prev, [stepIndex]: true }));
            resolve();
          },
        );
      });
    },
    [streamText]
  );

  // Typewriter for the acknowledgment message
  const typewriteAck = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        streamText(
          text,
          (partial) => setAckText(partial),
          () => {
            setAckDone(true);
            resolve();
          },
        );
      });
    },
    [streamText]
  );

  // Advance steps automatically
  const advanceSteps = useCallback(
    async (scenario: ScenarioDef, fromStep: number) => {
      // Show acknowledgment first (only on initial run)
      if (fromStep === 0) {
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, 800);
        });
        await typewriteAck(scenario.acknowledgment);
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, 1800);
        });
      }

      for (let i = fromStep; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];

        // Show the step
        setVisibleSteps(i + 1);
        setCurrentStepDone(false);

        if (step.type === "system_read" && step.sources) {
          // For system_read steps, wait for the SystemConnectStep animation
          await new Promise<void>((resolve) => {
            systemConnectResolveRef.current = resolve;
          });
          setCurrentStepDone(true);
        } else {
          // Simulate work with typewriter
          const textToType =
            step.type === "human_input"
              ? step.approvalPrompt || ""
              : step.detail;

          // Brief pause before starting to type
          await new Promise((r) => {
            timeoutRef.current = setTimeout(r, 1200);
          });

          await typewrite(i, textToType);

          // Show sources if any (after typing)
          setCurrentStepDone(true);
        }

        if (step.requiresApproval) {
          setWaitingForApproval(true);
          return i; // pause here
        }

        // Pause between steps
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, 1800);
        });
      }

      // All steps done
      setAllDone(true);
      return -1;
    },
    [typewrite, typewriteAck]
  );

  const handleSelectScenario = (scenario: ScenarioDef) => {
    setSelectedScenario(scenario);
    setVisibleSteps(0);
    setCurrentStepDone(false);
    setWaitingForApproval(false);
    setAllDone(false);
    setAckText("");
    setAckDone(false);
    setTypewriterText({});
    setTypewriterDone({});
    // Start advancing after a brief delay
    setTimeout(() => advanceSteps(scenario, 0), 500);
  };

  const handleSystemConnectComplete = useCallback(() => {
    if (systemConnectResolveRef.current) {
      systemConnectResolveRef.current();
      systemConnectResolveRef.current = null;
    }
  }, []);

  const handleApproval = () => {
    if (!selectedScenario) return;
    setWaitingForApproval(false);
    // Find where we left off and continue
    const currentIndex = visibleSteps - 1;
    setTimeout(() => advanceSteps(selectedScenario, currentIndex + 1), 400);
  };

  const handleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSelectedScenario(null);
    setVisibleSteps(0);
    setCurrentStepDone(false);
    setWaitingForApproval(false);
    setAllDone(false);
    setAckText("");
    setAckDone(false);
    setTypewriterText({});
    setTypewriterDone({});
    setActiveView("chat");
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  };

  // Step type → style mapping for the botanical palette
  const stepStyles: Record<
    StepDef["type"],
    { bg: string; border: string; iconColor: string }
  > = {
    system_read: {
      bg: C.parchment,
      border: C.borderLight,
      iconColor: C.sage,
    },
    data_pull: {
      bg: C.parchment,
      border: C.borderLight,
      iconColor: C.sage,
    },
    reasoning: {
      bg: C.warmAmber,
      border: C.amberBorder,
      iconColor: C.ochre,
    },
    human_input: {
      bg: C.ochreLight,
      border: C.ochreBorder,
      iconColor: C.ochre,
    },
    result: {
      bg: C.sageLight,
      border: C.sageBorder,
      iconColor: C.sage,
    },
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: C.cream, color: C.text }}
    >
      {/* Top bar — with subtle classical bottom border */}
      <header
        className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 backdrop-blur-md"
        style={{
          background: `${C.cream}ee`,
          borderBottom: `1px solid ${C.borderLight}`,
        }}
      >
        <MarkerLogo />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-xs font-medium leading-tight" style={{ color: C.text }}>Richard Berwick</p>
              <p className="text-[10px] leading-tight" style={{ color: C.textLight }}>VP Supply Chain</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: C.brown }}
            >
              RB
            </div>
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Sidebar */}
        <nav
          className="hidden sm:flex flex-col shrink-0 py-3 px-2 transition-all duration-200 overflow-hidden"
          style={{
            width: 200,
            background: C.parchment,
            borderRight: `1px solid ${C.borderLight}`,
          }}
        >
          {/* Sidebar content area — flex-1 so bottom nav stays pinned */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeView !== "calendars" ? (
              <>
                {/* New task button */}
                <button
                  onClick={handleReset}
                  className="w-full h-9 rounded-lg flex items-center gap-2 px-2.5 mb-3 text-xs font-medium transition-colors shrink-0"
                  style={{
                    color: "#ffffff",
                    background: C.sage,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New task
                </button>

                {/* Recent runs */}
                <div className="flex-1 overflow-y-auto">
                  <p
                    className="text-[10px] uppercase tracking-wider font-medium px-2.5 mb-2"
                    style={{ color: C.textLight }}
                  >
                    Recent
                  </p>
                  <div className="space-y-0.5">
                    {[
                      { title: "Weekly status report", time: "2 hours ago" },
                      { title: "Landed-cost — Refresh line", time: "Yesterday" },
                      { title: "Q2 supplier risk assessment", time: "Yesterday" },
                      { title: "Fleet Feet order expedite", time: "Mar 14" },
                      { title: "Zhenmei lead time analysis", time: "Mar 13" },
                      { title: "Weekly status report", time: "Mar 10" },
                      { title: "Packaging cost comparison", time: "Mar 8" },
                    ].map((run, i) => (
                      <button
                        key={i}
                        className="w-full text-left rounded-lg px-2.5 py-2 transition-colors"
                        style={{ color: C.textMuted }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.creamDark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <p className="text-xs truncate" style={{ color: i === 0 ? C.text : C.textMuted }}>{run.title}</p>
                        <p className="text-[10px]" style={{ color: C.textLight }}>{run.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Calendar list */
              <div className="flex-1 overflow-y-auto">
                <p
                  className="text-[10px] uppercase tracking-wider font-medium px-2.5 pb-2"
                  style={{ color: C.textLight }}
                >
                  Calendars
                </p>
                <div className="space-y-0.5 pt-1">
                  {[
                    { title: "SS26 wovens", active: true },
                    { title: "SS26 knits", active: false },
                    { title: "FW26 outerwear", active: false },
                    { title: "FW26 denim", active: false },
                    { title: "Resort 26 swim", active: false },
                  ].map((cal, i) => (
                    <button
                      key={i}
                      className="w-full text-left rounded-lg px-2.5 py-2 transition-colors"
                      style={{
                        color: cal.active ? C.text : C.textMuted,
                        background: cal.active ? C.border : "transparent",
                        fontWeight: cal.active ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!cal.active) e.currentTarget.style.background = C.creamDark;
                      }}
                      onMouseLeave={(e) => {
                        if (!cal.active) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <p className="text-xs truncate">{cal.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div
            className="pt-3 mt-auto shrink-0"
            style={{ borderTop: `1px solid ${C.borderLight}`, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <SidebarButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              }
              label="Workflows"
              active={activeView === "chat"}
              expanded={sidebarExpanded}
              onClick={() => { handleReset(); setActiveView("chat"); }}
            />
            <SidebarButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              }
              label="Calendars"
              active={activeView === "calendars"}
              expanded={sidebarExpanded}
              onClick={() => setActiveView(activeView === "calendars" ? "chat" : "calendars")}
            />
            <SidebarButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              }
              label="Connectors"
              expanded={sidebarExpanded}
            />
            <SidebarButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
              label="Permissions"
              expanded={sidebarExpanded}
            />
            <SidebarButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Settings"
              expanded={sidebarExpanded}
            />
          </div>
        </nav>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
          {/* Workflows calendar view */}
          {activeView === "calendars" && (
            <div className="flex-1 overflow-y-auto min-h-0" style={{ contain: "inline-size", overscrollBehavior: "contain" }}>
              <SourcingCalendar
                onAgentClick={(stepId) => {
                  const wf = BUILDER_WORKFLOWS.find((w) => w.calendarStepId === stepId);
                  if (wf) {
                    setBuilderWorkflowId(wf.id);
                    setActiveView("workflow-builder");
                  }
                }}
              />
            </div>
          )}
          {/* Workflow builder canvas view */}
          {activeView === "workflow-builder" && (() => {
            const wf = BUILDER_WORKFLOWS.find((w) => w.id === builderWorkflowId);
            return wf ? (
              <WorkflowBuilderView
                workflow={wf}
                onBack={() => setActiveView("calendars")}
              />
            ) : null;
          })()}
          {/* Workflow progress bar — fixed at top of chat area */}
          {activeView === "chat" && selectedScenario && (
            <div
              className="z-10 shrink-0 py-3 px-4 backdrop-blur-md"
              style={{
                background: `${C.cream}ee`,
                borderBottom: `1px solid ${C.borderLight}`,
              }}
            >
              <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
                <WorkflowProgressInline
                  steps={selectedScenario.steps}
                  currentStep={visibleSteps - 1}
                  allDone={allDone}
                />
              </div>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0"
            style={{ display: activeView === "chat" ? undefined : "none" }}
          >
        <div className="px-4 py-8 max-w-3xl mx-auto w-full">
        {/* Greeting */}
        {!selectedScenario && (
          <div className="mb-10 pt-8">
            <h1
              className="text-3xl sm:text-4xl font-semibold leading-snug tracking-tight"
              style={{ color: C.text }}
            >
              Your supply chain coordinator is ready. What should I work on?
            </h1>
          </div>
        )}

        {/* Pre-built Workflows */}
        {!selectedScenario && (
          <div className="mb-8">
            <button
              onClick={() => setWorkflowsCollapsed(!workflowsCollapsed)}
              className="flex items-center gap-1.5 mb-3 group"
            >
              <svg
                className="w-3 h-3 transition-transform duration-200"
                style={{
                  color: C.textLight,
                  transform: workflowsCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              <span
                className="text-xs uppercase tracking-wider font-medium"
                style={{ color: C.textLight }}
              >
                Your Pre-built Workflows
              </span>
            </button>
            {!workflowsCollapsed && (
            <div className="grid gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectScenario(s)}
                className="text-left p-4 rounded-xl transition-all group"
                style={{ border: `1px solid ${C.borderLight}` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.sageBorder;
                  e.currentTarget.style.background = C.parchment;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.borderLight;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="font-medium transition-colors"
                      style={{ color: C.text }}
                    >
                      {s.title}
                    </p>
                    <span
                      className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 shrink-0 mt-1"
                      style={{
                        color: C.textLight,
                        border: `1px solid ${C.borderLight}`,
                      }}
                    >
                      {s.industry}
                    </span>
                  </div>
                  <WorkflowDiagram steps={s.steps} />
                </div>
              </button>
            ))}
            </div>
            )}

            {/* Automated Workflows */}
            <button
              onClick={() => setAutomatedCollapsed(!automatedCollapsed)}
              className="flex items-center gap-1.5 mt-8 mb-3 group"
            >
              <svg
                className="w-3 h-3 transition-transform duration-200"
                style={{
                  color: C.textLight,
                  transform: automatedCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              <span
                className="text-xs uppercase tracking-wider font-medium"
                style={{ color: C.textLight }}
              >
                Scheduled & Triggered Workflows
              </span>
            </button>
            {!automatedCollapsed && (
            <div className="grid gap-3">
              {/* Scheduled: Weekly status */}
              <div
                className="p-4 rounded-xl"
                style={{ border: `1px solid ${C.borderLight}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium" style={{ color: C.text }}>
                    Produce the weekly status update for leadership
                  </p>
                  <span
                    className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 shrink-0 mt-1"
                    style={{
                      color: C.textLight,
                      border: `1px solid ${C.borderLight}`,
                    }}
                  >
                    Apparel & Footwear
                  </span>
                </div>
                <WorkflowDiagram steps={SCENARIOS[0].steps} />
                <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${C.borderLight}` }}>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={C.sage} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: C.sage }}>
                      Every Monday, 10:00 AM
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textLight }}>
                    Last run: Mar 17, 10:01 AM
                  </span>
                </div>
              </div>

              {/* Triggered: Order escalation */}
              <div
                className="p-4 rounded-xl"
                style={{ border: `1px solid ${C.borderLight}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium" style={{ color: C.text }}>
                    Investigate and expedite a delayed wholesale order
                  </p>
                  <span
                    className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 shrink-0 mt-1"
                    style={{
                      color: C.textLight,
                      border: `1px solid ${C.borderLight}`,
                    }}
                  >
                    Sports Retailer
                  </span>
                </div>
                <WorkflowDiagram steps={SCENARIOS[3].steps} />
                <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${C.borderLight}` }}>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={C.ochre} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: C.ochre }}>
                      Triggered when a customer order is flagged at-risk in CRM
                    </span>
                  </div>
                </div>
              </div>
            </div>
            )}

            <p
              className="text-xs uppercase tracking-wider font-medium mt-8 mb-3"
              style={{ color: C.textLight }}
            >
              Or ask anything
            </p>
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: C.cream,
                border: `1px solid ${C.border}`,
                boxShadow: `0 1px 3px ${C.border}44`,
              }}
            >
              <input
                type="text"
                placeholder="Ask Marker anything about your supply chain..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: C.text }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: C.sage, color: "#ffffff" }}
                onClick={(e) => {
                  const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                  if (input) input.value = "";
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* User's selected task */}
        {selectedScenario && (
          <div className="flex gap-3 mb-8 justify-end">
            <div
              className="rounded-2xl rounded-br-md px-4 py-3 max-w-md"
              style={{
                background: C.sageLight,
                border: `1px solid ${C.sageBorder}`,
              }}
            >
              <p style={{ color: C.text }}>{selectedScenario.title}</p>
            </div>
            <UserAvatar />
          </div>
        )}

        {/* Acknowledgment message */}
        {selectedScenario && ackText && (
          <div className="flex gap-3 mb-6">
            <AgentAvatar />
            <div className="flex-1 min-w-0 space-y-3">
              <div
                className="text-sm leading-relaxed rounded-xl p-4 whitespace-pre-wrap"
                style={{
                  background: C.parchment,
                  border: `1px solid ${C.borderLight}`,
                  color: C.textMuted,
                }}
              >
                {renderInlineMarkdown(ackText)}
                {!ackDone && <TypingDots />}
              </div>
              {ackDone && (
                <PermissionsCard permissions={selectedScenario.permissions} />
              )}
            </div>
          </div>
        )}

        {/* Agent steps */}
        {selectedScenario &&
          Array.from({ length: visibleSteps }).map((_, idx) => {
            const step = selectedScenario.steps[idx];
            const isLast = idx === visibleSteps - 1;
            const isTyping = !typewriterDone[idx];
            const displayText = typewriterText[idx] || "";
            const stepDone = typewriterDone[idx];
            const style = stepStyles[step.type];

            return (
              <div key={idx} className="flex gap-3 mb-6">
                <AgentAvatar />
                <div className="flex-1 min-w-0">
                  {/* Step label */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Step type icon */}
                    <span style={{ color: style.iconColor }}>
                      {step.type === "system_read" && (
                        <svg
                          className={`w-4 h-4 ${isLast && !stepDone ? "animate-spin" : ""}`}
                          style={isLast && !stepDone ? { animationDuration: "2s" } : {}}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      {step.type === "reasoning" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      )}
                      {step.type === "data_pull" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                          />
                        </svg>
                      )}
                      {step.type === "human_input" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      )}
                      {step.type === "result" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: C.text }}
                    >
                      {step.label}
                    </span>
                    {(step.type === "system_read" || step.type === "data_pull" || step.type === "reasoning") && (
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5"
                        style={{
                          color: C.sage,
                          background: C.sageLight,
                          border: `1px solid ${C.sageBorder}`,
                        }}
                      >
                        Auto
                      </span>
                    )}
                    {step.type === "human_input" && (
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5"
                        style={{
                          color: C.ochre,
                          background: C.ochreLight,
                          border: `1px solid ${C.ochreBorder}`,
                        }}
                      >
                        Approval required
                      </span>
                    )}
                    {isLast && isTyping && step.type !== "system_read" && <TypingDots />}
                  </div>

                  {/* Step content */}
                  <div
                    className="text-sm leading-relaxed rounded-xl p-4"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    {step.type === "system_read" && step.sources ? (
                      <SystemConnectStep
                        sources={step.sources}
                        onComplete={handleSystemConnectComplete}
                      />
                    ) : (
                      <>
                        <div
                          className="whitespace-pre-wrap"
                          style={{ color: C.textMuted }}
                        >
                          {renderInlineMarkdown(displayText)}
                        </div>

                        {/* Sources */}
                        {step.sources && stepDone && (
                          <div
                            className="flex flex-wrap gap-1.5 mt-3 pt-3"
                            style={{ borderTop: `1px solid ${style.border}` }}
                          >
                            {step.sources.map((src) => (
                              <SystemBadge key={src} name={src} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Approval buttons */}
                  {step.requiresApproval &&
                    waitingForApproval &&
                    isLast &&
                    stepDone && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleApproval}
                          className="px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-colors hover:opacity-90"
                          style={{
                            background: C.sage,
                            boxShadow: `0 4px 12px ${C.sage}33`,
                          }}
                        >
                          {step.approvalButtons?.[0] || "Approve"}
                        </button>
                        <button
                          onClick={handleApproval}
                          className="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors hover:opacity-80"
                          style={{
                            color: C.textMuted,
                            border: `1px solid ${C.border}`,
                            background: C.cream,
                          }}
                        >
                          {step.approvalButtons?.[1] || "Review"}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}

        {/* Completion message */}
        {allDone && selectedScenario && (
          <div className="flex gap-3 mb-8 mt-4">
            <AgentAvatar />
            <div className="flex-1">
              <div
                className="rounded-xl p-5"
                style={{
                  background: `linear-gradient(135deg, ${C.sageLight}, ${C.cream})`,
                  border: `1px solid ${C.sageBorder}`,
                }}
              >
                <p className="font-medium mb-2" style={{ color: C.sage }}>
                  Task complete
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  {selectedScenario.completionMessage}
                </p>
              </div>

              <OrnamentalDivider className="my-5" />

              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors hover:opacity-80"
                style={{
                  color: C.sage,
                  border: `1px solid ${C.sageBorder}`,
                  background: C.sageLight,
                }}
              >
                Start a new task
              </button>
            </div>
          </div>
        )}
        <div ref={scrollAnchorRef} />
      </div>
      {/* end inner content wrapper */}
      </div>
      {/* end scrollable area */}
      </div>
      {/* end chat area outer */}
      </div>
      {/* end sidebar + main flex */}

    </div>
  );
}
