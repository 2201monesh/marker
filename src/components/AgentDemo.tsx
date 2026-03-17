import { useState, useEffect, useRef, useCallback } from "react";

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
}

interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
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
    steps: [
      {
        type: "system_read",
        label: "Connecting to systems",
        detail:
          "Authenticating and pulling latest data from connected platforms...",
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
        type: "reasoning",
        label: "Analyzing downstream impact",
        detail:
          "The Zhenmei delay cascades into 2 other styles (STY-2291, STY-2294) that share the same fabric. Combined, these represent $340K in first-cost exposure. The factory in Ho Chi Minh has a 3-day buffer before the booking lapses. Recommendation: escalate PO #4412 to procurement lead, hold air freight decision until Thursday.",
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
          "I've drafted the weekly status report. Here's the executive summary:\n\n**Weekly Supply Chain Status — Week of Mar 16**\n\n🔴 **Critical (2)**\n• Zhenmei Textiles — 12-day fabric delay on PO #4412. Cascading impact to STY-2291 & STY-2294 ($340K exposure). Recommend: escalate to procurement by EOD Wed.\n• Container MEDU4217890 — held at Yantian port, customs review. ETA slip: 4–7 days. Logistics team notified.\n\n🟡 **Watch (3)**\n• Factory slot in HCMC expires Fri — decision needed on air freight vs. renegotiation by Thu.\n• Coupa PO approval queue has 6 items pending >48hrs.\n• Fabric lab dip for STY-2310 rejected on 2nd attempt — supplier re-submitting.\n\n🟢 **On Track (12 workstreams)**\nAll other development, sourcing, and logistics milestones progressing per plan.\n\n---\nWould you like me to send this to the leadership distribution list (exec-supply-chain@company.com)?",
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
    subtitle: "Full cost build-up from raw materials to warehouse door",
    industry: "Consumer Electronics",
    steps: [
      {
        type: "system_read",
        label: "Connecting to systems",
        detail:
          "Pulling BOM data, supplier quotes, and logistics rates from connected platforms...",
        sources: [
          "PLM (Arena)",
          "ERP (SAP S/4HANA)",
          "Costing Tool (Pivot88)",
          "Coupa Procurement",
          "Freight Calculator",
          "Shared Drives (Excel BOMs)",
        ],
      },
      {
        type: "data_pull",
        label: "Extracting BOM & component pricing",
        detail:
          'Pulled 4 product BOMs from PLM for the "Nova" line. Cross-referencing component costs across 3 suppliers in Coupa. Found pricing discrepancies: Supplier A quotes PCB assembly at $4.12/unit in Coupa but the BOM spreadsheet from engineering shows $3.87/unit from a quote dated 6 weeks ago.',
        sources: [
          "Arena PLM — Nova Line BOMs",
          "Coupa — Supplier Quotes",
          "Shared Drive — Engineering BOM v3.xlsx",
        ],
      },
      {
        type: "reasoning",
        label: "Resolving pricing discrepancies",
        detail:
          "The $0.25 delta on PCB assembly traces back to a raw material surcharge Supplier A added on Feb 28 (copper index +8%). The engineering spreadsheet is stale. Using the Coupa quote as source of truth. However, Supplier B has a valid quote at $3.95/unit — $0.17 cheaper — but requires a 10K MOQ vs Supplier A's 5K. At our forecasted volume of 8K units, Supplier A is actually more cost-effective when factoring in carrying cost of excess inventory.",
      },
      {
        type: "data_pull",
        label: "Pulling freight & duty rates",
        detail:
          "Querying freight forwarder rate tables for Shenzhen → Los Angeles (FCL, 40ft). Current spot rate: $2,840/container. Duty rate for HTS 8471.30: 0% (covered under ITA). Drayage + last-mile to warehouse: $680. Insurance: 0.35% of declared value.",
        sources: [
          "Flexport Rate API",
          "HTS Duty Lookup",
          "Insurance Calculator",
        ],
      },
      {
        type: "reasoning",
        label: "Building full landed-cost model",
        detail:
          "Compiling all cost layers:\n\n• Raw materials & components: $28.41/unit\n• Assembly & labor: $6.20/unit\n• Factory overhead & margin: $4.10/unit\n• Inland freight (factory to port): $0.32/unit\n• Ocean freight: $0.71/unit (at 4,000 units/container)\n• Duty: $0.00 (ITA exempt)\n• Drayage + last-mile: $0.17/unit\n• Insurance: $0.14/unit\n• Quality inspection (pre-ship): $0.22/unit\n\n**Total landed cost: $40.27/unit**\n\nTarget was $39.00. We're $1.27 over. The main driver is the copper surcharge on PCBs. Two levers: negotiate Supplier A down, or redesign the PCB layout to use less copper (engineering estimates 2-week timeline).",
      },
      {
        type: "human_input",
        label: "Review landed-cost breakdown",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the full landed-cost analysis for the Nova product line:\n\n**Landed Cost Summary — Nova Line (per unit)**\n\n| Cost Layer | $/Unit |\n|---|---|\n| Raw Materials & Components | $28.41 |\n| Assembly & Labor | $6.20 |\n| Factory Overhead & Margin | $4.10 |\n| Inland Freight | $0.32 |\n| Ocean Freight | $0.71 |\n| Duty | $0.00 |\n| Drayage + Last-Mile | $0.17 |\n| Insurance | $0.14 |\n| QC Inspection | $0.22 |\n| **Total Landed** | **$40.27** |\n\n⚠️ **$1.27 over target ($39.00)**\n\nRecommended actions:\n1. Renegotiate PCB assembly with Supplier A (potential savings: $0.40–0.60)\n2. Evaluate PCB redesign to reduce copper usage (est. 2 weeks, potential savings: $0.80)\n\nShall I save this analysis and share it with the product & procurement teams?",
      },
      {
        type: "result",
        label: "Analysis shared",
        detail:
          "Landed-cost analysis saved to the Nova project folder and shared with product@company.com and procurement@company.com. Follow-up tasks created: (1) Supplier A negotiation call, (2) PCB redesign feasibility review.",
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
    steps: [
      {
        type: "system_read",
        label: "Connecting to systems",
        detail:
          "Pulling supplier performance data, financial health indicators, and compliance records...",
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
        type: "reasoning",
        label: "Assessing compounding risk factors",
        detail:
          "GreenPak supplies 60% of our sustainable packaging — a single-source dependency. Their credit downgrade + our 35-day payment terms creates a working capital risk for them. If they go into distress, lead times on packaging could blow out 4–6 weeks, halting 3 product lines. Meanwhile, FreshBlend's unlogged quality issues (found 3 email complaints about off-spec viscosity) combined with their 87% OTD rate makes them a dual risk: quality AND delivery.",
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
          "Here's the Q2 Supplier Risk Assessment:\n\n**🔴 High Risk (2 suppliers)**\n\n**GreenPak Industries** (Packaging)\n• Single-source dependency (60% of sustainable packaging)\n• Credit downgraded to BB- (parent company Q4 loss)\n• Risk: 4–6 week supply disruption if financial distress worsens\n• **Recommendation:** Activate EcoPack Solutions for 30% of volume (6-week ramp)\n\n**FreshBlend Co-Manufacturing** (Co-Man)\n• 87% OTD (below 90% threshold)\n• 3 unlogged quality complaints (off-spec viscosity)\n• **Recommendation:** Begin transition to Precision Foods (+15% cost, but 98% OTD; net savings $120K/yr risk-adjusted)\n\n**🟡 Watch (4 suppliers)**\n• Below 90% OTD but no compounding risk factors\n\n**🟢 Healthy (28 suppliers)**\n• All metrics within acceptable ranges\n\nShall I:\n1. Share this assessment with the procurement & quality teams?\n2. Draft RFQs for EcoPack and Precision Foods?\n3. Both?",
      },
      {
        type: "result",
        label: "Assessment distributed & RFQs drafted",
        detail:
          "Risk assessment shared with procurement@company.com and quality@company.com. Draft RFQs prepared for EcoPack Solutions and Precision Foods and placed in the procurement approval queue in Coupa.",
      },
    ],
    completionMessage:
      "Supplier risk assessment complete — 34 suppliers evaluated across 7 data sources with actionable contingency plans. That typically takes a team 2–3 days of manual work.",
  },
  {
    id: "order-expedite",
    title: "Investigate and expedite a delayed customer order",
    subtitle: "End-to-end order tracking with root-cause analysis",
    industry: "Industrial & B2B",
    steps: [
      {
        type: "system_read",
        label: "Connecting to systems",
        detail:
          "Pulling order details, production status, and logistics data...",
        sources: [
          "ERP (Microsoft Dynamics 365)",
          "MES (Plex)",
          "TMS (BluJay)",
          "CRM (Salesforce)",
          "Email (Outlook)",
          "Supplier Portal",
        ],
      },
      {
        type: "data_pull",
        label: "Tracing order through systems",
        detail:
          'Customer order SO-88712 (Apex Manufacturing, $485K) due to ship Mar 21. CRM shows sales rep escalated 2 days ago — customer threatening to pull the order. Tracing back: ERP shows production order PO-6633 is at 60% completion. MES data reveals a 3-day stoppage on Line 4 starting Mar 12.',
        sources: [
          "Dynamics 365 — SO-88712",
          "Plex MES — PO-6633",
          "Salesforce — Case #41205",
        ],
      },
      {
        type: "data_pull",
        label: "Identifying root cause of production stoppage",
        detail:
          'Line 4 stoppage caused by a missing component — Hydraulic Valve Assembly (HVA-200). Checking supplier portal: the HVA-200 order was placed on Feb 20 with 15-day lead time but supplier (TechFlow Hydraulics) shows "delayed — awaiting raw material." An email from TechFlow on Mar 10 warned of the delay, but it was only sent to the buyer who was on PTO last week.',
        sources: [
          "Plex MES — Line 4 Downtime Log",
          "Supplier Portal — TechFlow Hydraulics",
          "Outlook — TechFlow delay notification",
          "HR System — Buyer PTO calendar",
        ],
      },
      {
        type: "reasoning",
        label: "Evaluating expedite options",
        detail:
          "Three options to recover the schedule:\n\n1. **Expedite from TechFlow** — They can ship partial (60 of 100 units) by Mar 18, remaining by Mar 25. This gets Line 4 running but we'd ship partial order.\n2. **Alternative supplier** — HydraForce has HVA-200 equivalent in stock, can ship overnight. Cost premium: $12/unit ($1,200 total). Gets full production done by Mar 20.\n3. **Partial ship + air freight** — Build what we can with TechFlow partial, air freight final batch. Total premium: $4,800.\n\nOption 2 is fastest and cheapest for full order recovery. Line 4 can resume by Mar 19, production complete by Mar 20, ship by Mar 21 — meeting the original deadline.",
      },
      {
        type: "human_input",
        label: "Approve expedite plan",
        detail: "",
        requiresApproval: true,
        approvalPrompt:
          "Here's the proposed recovery plan for SO-88712 (Apex Manufacturing, $485K):\n\n**Root Cause:** Missed supplier delay notification (buyer on PTO) for Hydraulic Valve Assembly.\n\n**Recommended Action:** Source HVA-200 from HydraForce (alternative supplier)\n• Cost premium: $1,200 (vs. $4,800 for air freight option)\n• Timeline: Overnight ship → Line 4 resumes Mar 19 → Production complete Mar 20 → Ships Mar 21 ✅\n• Customer impact: None — original delivery date preserved\n\n**Process Fix:** Set up backup notification routing so supplier delay alerts go to team channel when primary buyer is OOO.\n\nShall I:\n1. Place the emergency PO with HydraForce?\n2. Update the sales rep in Salesforce with the recovery plan?\n3. Notify the customer with an updated confirmation?",
      },
      {
        type: "result",
        label: "Expedite in motion",
        detail:
          "Emergency PO placed with HydraForce in Dynamics 365. Salesforce case updated with recovery timeline. Customer notification drafted and sent via sales rep. Backup notification rule created for supplier delay alerts.",
      },
    ],
    completionMessage:
      "Order rescue complete — root cause identified, expedite plan executed, and process gap fixed. A $485K order saved from cancellation in under 10 minutes.",
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
  textMuted: "#8B7355",
  textLight: "#A99B82",
  sage: "#5B7C5A",
  sageMuted: "#7A9A6D",
  sageLight: "#EDF3EB",
  sageBorder: "#C5D8BF",
  ochre: "#B8860B",
  ochreMuted: "#C4922A",
  ochreLight: "#FBF5E6",
  ochreBorder: "#E5D5A8",
  warmAmber: "#FDF8EF",
  amberBorder: "#EBD9B8",
  brown: "#6B4E2E",
};

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

function MarkerLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
        style={{ background: C.sage }}
      >
        M
      </div>
      <span className="font-semibold text-lg" style={{ color: C.text }}>
        Marker
      </span>
    </div>
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

/** The "B" avatar for Bjorn's messages */
function UserAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
      style={{ background: C.brown }}
    >
      B
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AgentDemo() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDef | null>(
    null
  );
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [currentStepDone, setCurrentStepDone] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [typewriterText, setTypewriterText] = useState<
    Record<number, string>
  >({});
  const [typewriterDone, setTypewriterDone] = useState<
    Record<number, boolean>
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps, currentStepDone, waitingForApproval, allDone, typewriterText]);

  // Typewriter effect for a step
  const typewrite = useCallback(
    (stepIndex: number, text: string): Promise<void> => {
      return new Promise((resolve) => {
        let i = 0;
        const speed = 12; // ms per char
        const tick = () => {
          // Advance by a chunk for long texts
          const chunk = Math.min(3, text.length - i);
          i += chunk;
          setTypewriterText((prev) => ({ ...prev, [stepIndex]: text.slice(0, i) }));
          if (i < text.length) {
            timeoutRef.current = setTimeout(tick, speed);
          } else {
            setTypewriterDone((prev) => ({ ...prev, [stepIndex]: true }));
            resolve();
          }
        };
        tick();
      });
    },
    []
  );

  // Advance steps automatically
  const advanceSteps = useCallback(
    async (scenario: ScenarioDef, fromStep: number) => {
      for (let i = fromStep; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];

        // Show the step
        setVisibleSteps(i + 1);
        setCurrentStepDone(false);

        // Simulate work with typewriter
        const textToType =
          step.type === "human_input"
            ? step.approvalPrompt || ""
            : step.detail;

        // Brief pause before starting to type
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, 600);
        });

        await typewrite(i, textToType);

        // Show sources if any (after typing)
        setCurrentStepDone(true);

        if (step.requiresApproval) {
          setWaitingForApproval(true);
          return i; // pause here
        }

        // Pause between steps
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, 800);
        });
      }

      // All steps done
      setAllDone(true);
      return -1;
    },
    [typewrite]
  );

  const handleSelectScenario = (scenario: ScenarioDef) => {
    setSelectedScenario(scenario);
    setVisibleSteps(0);
    setCurrentStepDone(false);
    setWaitingForApproval(false);
    setAllDone(false);
    setTypewriterText({});
    setTypewriterDone({});
    // Start advancing after a brief delay
    setTimeout(() => advanceSteps(scenario, 0), 500);
  };

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
    setTypewriterText({});
    setTypewriterDone({});
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
      className="min-h-screen flex flex-col"
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
          <span className="text-xs" style={{ color: C.textLight }}>
            Supply Chain Coordinator
          </span>
          {selectedScenario && (
            <button
              onClick={handleReset}
              className="text-xs rounded-lg px-3 py-1.5 transition-colors hover:opacity-80"
              style={{
                color: C.textMuted,
                border: `1px solid ${C.border}`,
              }}
            >
              New task
            </button>
          )}
        </div>
      </header>

      {/* Ornamental border accent below header */}
      <div
        className="h-[3px]"
        style={{
          background: `linear-gradient(to right, ${C.cream}, ${C.sageBorder}, ${C.ochreBorder}, ${C.sageBorder}, ${C.cream})`,
        }}
      />

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl mx-auto w-full"
      >
        {/* Greeting */}
        <div className="flex gap-3 mb-8">
          <AgentAvatar />
          <div>
            <p className="text-lg font-medium mb-1" style={{ color: C.text }}>
              Hey Bjorn!
            </p>
            <p className="leading-relaxed" style={{ color: C.textMuted }}>
              Welcome back. Let's crush some grunt work — what do you want to
              tackle today?
            </p>
          </div>
        </div>

        {/* Scenario picker */}
        {!selectedScenario && (
          <div className="grid gap-3 mb-8">
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="font-medium transition-colors"
                      style={{ color: C.text }}
                    >
                      {s.title}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: C.textLight }}
                    >
                      {s.subtitle}
                    </p>
                  </div>
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
              </button>
            ))}
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
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
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
                    {isLast && isTyping && <TypingDots />}
                  </div>

                  {/* Step content */}
                  <div
                    className="text-sm leading-relaxed rounded-xl p-4"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    <div
                      className="whitespace-pre-wrap"
                      style={{ color: C.textMuted }}
                    >
                      {displayText}
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
                          Yes, send it out
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
                          Looks good, proceed
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
      </div>

      {/* Bottom input (decorative) */}
      <div
        className="px-4 py-4"
        style={{
          background: C.cream,
          borderTop: `1px solid ${C.borderLight}`,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: C.parchment,
              border: `1px solid ${C.borderLight}`,
            }}
          >
            <input
              type="text"
              readOnly
              placeholder="Ask Marker anything about your supply chain..."
              className="flex-1 bg-transparent text-sm outline-none cursor-default"
              style={{ color: C.textLight }}
            />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: C.creamDark, color: C.textLight }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
