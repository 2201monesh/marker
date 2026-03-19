// ─── Role Definitions ────────────────────────────────────────────────────────
// Each role references workflow IDs from workflowData.ts.
// A workflow can appear under multiple roles.

export interface RoleDef {
  id: string;
  name: string;
  title: string;
  initials: string;
  /** Workflow IDs shown as "Your Pre-built Workflows" */
  prebuiltWorkflowIds: string[];
  /** Scheduled workflows with cron-like descriptions */
  scheduledWorkflows: {
    workflowId: string;
    schedule: string;
    lastRun: string;
  }[];
  /** Triggered workflows with event descriptions */
  triggeredWorkflows: {
    workflowId: string;
    trigger: string;
  }[];
  /** Recent run history shown in the sidebar */
  recentRuns: { title: string; time: string }[];
}

export const ROLES: RoleDef[] = [
  {
    id: "richard-berwick",
    name: "Richard Berwick",
    title: "VP Supply Chain",
    initials: "RB",
    prebuiltWorkflowIds: [
      "weekly-status",
      "cost-analysis",
      "supplier-risk",
      "order-expedite",
    ],
    scheduledWorkflows: [
      {
        workflowId: "weekly-status",
        schedule: "Every Monday, 10:00 AM",
        lastRun: "Mar 17, 10:01 AM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "order-expedite",
        trigger: "Customer order flagged at-risk in CRM",
      },
    ],
    recentRuns: [
      { title: "Weekly status report", time: "2 hours ago" },
      { title: "Landed-cost — Refresh line", time: "Yesterday" },
      { title: "Q2 supplier risk assessment", time: "Yesterday" },
      { title: "Fleet Feet order expedite", time: "Mar 14" },
      { title: "Zhenmei lead time analysis", time: "Mar 13" },
      { title: "Weekly status report", time: "Mar 10" },
      { title: "Packaging cost comparison", time: "Mar 8" },
    ],
  },
  {
    id: "catherine-wu",
    name: "Richard Berwick",
    title: "CEO",
    initials: "RB",
    prebuiltWorkflowIds: [
      "weekly-eta-report",
      "create-purchase-order",
      "shipment-delay-cascade",
      "continuous-weekly-reorder",
      "retailer-compliance",
    ],
    scheduledWorkflows: [
      {
        workflowId: "weekly-eta-report",
        schedule: "Every Friday, 3:00 PM",
        lastRun: "Mar 14, 3:02 PM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "shipment-delay-cascade",
        trigger: "Supplier emails an updated ship date",
      },
    ],
    recentRuns: [
      { title: "Weekly ETA report", time: "4 days ago" },
      { title: "PO creation — Hangzhou Knits", time: "Mar 13" },
      { title: "Shipment delay cascade — PO #7821", time: "Mar 12" },
      { title: "Weekly reorder — Leverstyle", time: "Mar 11" },
      { title: "Retailer compliance — Macy's spring", time: "Mar 10" },
      { title: "Weekly ETA report", time: "Mar 7" },
    ],
  },
  {
    id: "sarah-chen",
    name: "Richard Berwick",
    title: "Product Developer",
    initials: "RB",
    prebuiltWorkflowIds: [
      "pre-costing-fabric-vetting",
      "multi-round-costing",
      "supplier-cost-negotiation",
      "quantity-break-negotiation",
      "seasonal-material-buy",
    ],
    scheduledWorkflows: [],
    triggeredWorkflows: [
      {
        workflowId: "pre-costing-fabric-vetting",
        trigger: "Design selects new or out-of-range fabrics",
      },
    ],
    recentRuns: [
      { title: "Fabric vetting — Italian wool blends", time: "3 hours ago" },
      { title: "Multi-round costing — STY-4510", time: "Yesterday" },
      { title: "Supplier cost negotiation — Saigon Knits", time: "Mar 14" },
      { title: "Quantity break — Zhenmei program", time: "Mar 13" },
      { title: "Seasonal material buy — FW26 outerwear", time: "Mar 11" },
      { title: "Multi-round costing — STY-4488", time: "Mar 10" },
    ],
  },
  {
    id: "marcus-torres",
    name: "Richard Berwick",
    title: "Director, Production & Planning",
    initials: "RB",
    prebuiltWorkflowIds: [
      "wip-tracking",
      "calendar-production-tracking",
      "shipment-delay-cascade",
      "multi-channel-triage",
      "rfq-response-factory",
    ],
    scheduledWorkflows: [
      {
        workflowId: "calendar-production-tracking",
        schedule: "Every Monday, 8:00 AM",
        lastRun: "Mar 17, 8:03 AM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "shipment-delay-cascade",
        trigger: "Supplier emails an updated ship date",
      },
    ],
    recentRuns: [
      { title: "Production tracking — week of Mar 17", time: "Yesterday" },
      { title: "WIP tracking — 34 active POs", time: "Yesterday" },
      { title: "Delay cascade — PO #6619", time: "Mar 15" },
      { title: "Multi-channel triage — 74 threads", time: "Mar 14" },
      { title: "RFQ response — Nike FW26", time: "Mar 12" },
      { title: "WIP tracking — 31 active POs", time: "Mar 10" },
    ],
  },
  {
    id: "diana-okafor",
    name: "Richard Berwick",
    title: "Manager, Sourcing & Production",
    initials: "RB",
    prebuiltWorkflowIds: [
      "email-triage-delegation",
      "email-triage-assignment",
      "rfq-bid-management",
      "po-amendments",
      "open-to-buy-capacity",
      "po-payment-prioritization",
      "wip-tracking-vendor-scorecard",
      "supplier-onboarding",
    ],
    scheduledWorkflows: [
      {
        workflowId: "email-triage-assignment",
        schedule: "Every 4 hours, business days",
        lastRun: "Mar 18, 12:05 PM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "po-amendments",
        trigger: "Change request received on existing PO",
      },
    ],
    recentRuns: [
      { title: "Email triage — 53 threads", time: "4 hours ago" },
      { title: "Vendor scorecard — Q1 update", time: "Yesterday" },
      { title: "PO amendment — #NFW-2026-04418", time: "Mar 16" },
      { title: "RFQ — activewear sourcing", time: "Mar 15" },
      { title: "Supplier onboarding — Evergreen Textiles", time: "Mar 14" },
      { title: "Open-to-buy check — spring budget", time: "Mar 13" },
      { title: "PO payment priority — 12 vendors", time: "Mar 11" },
    ],
  },
  {
    id: "lea-moreau",
    name: "Richard Berwick",
    title: "Senior Designer",
    initials: "RB",
    prebuiltWorkflowIds: [
      "pre-costing-fabric-vetting",
      "visual-assortment-planning",
      "licensed-product-approvals",
    ],
    scheduledWorkflows: [],
    triggeredWorkflows: [
      {
        workflowId: "licensed-product-approvals",
        trigger: "New licensed product enters development",
      },
    ],
    recentRuns: [
      { title: "Fabric vetting — organic cotton blends", time: "Yesterday" },
      { title: "Visual assortment — SS26 women's", time: "Mar 15" },
      { title: "Licensed approvals — PGA spring '26", time: "Mar 13" },
      { title: "Fabric vetting — recycled nylon", time: "Mar 10" },
      { title: "Visual assortment — FW26 outerwear", time: "Mar 7" },
    ],
  },
  {
    id: "james-whitfield",
    name: "Richard Berwick",
    title: "Technical Designer",
    initials: "RB",
    prebuiltWorkflowIds: [
      "ebom-mbom-reconciliation",
      "approvals-management",
      "vendor-costing-gate-reviews",
      "multi-brand-calendar-management",
    ],
    scheduledWorkflows: [
      {
        workflowId: "multi-brand-calendar-management",
        schedule: "Every other Monday, 9:00 AM",
        lastRun: "Mar 17, 9:01 AM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "approvals-management",
        trigger: "Supplier sends fabric, pattern, or wash for approval",
      },
    ],
    recentRuns: [
      { title: "BOM reconciliation — STY-3120", time: "3 hours ago" },
      { title: "Multi-brand calendar reissue", time: "Yesterday" },
      { title: "Approval routing — 14 submissions", time: "Mar 15" },
      { title: "Vendor costing — Gate 2 review", time: "Mar 14" },
      { title: "BOM reconciliation — STY-3094", time: "Mar 12" },
      { title: "Approval routing — 8 submissions", time: "Mar 10" },
    ],
  },
  {
    id: "priya-sharma",
    name: "Richard Berwick",
    title: "Merchandiser",
    initials: "RB",
    prebuiltWorkflowIds: [
      "budget-file-alignment",
      "brand-buy-signoff",
      "on-order-report",
      "demand-planning-reorder",
      "ecom-performance-tracking",
    ],
    scheduledWorkflows: [
      {
        workflowId: "ecom-performance-tracking",
        schedule: "Daily, 7:00 AM",
        lastRun: "Mar 18, 7:02 AM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "demand-planning-reorder",
        trigger: "SKU drops below reorder threshold in Shopify",
      },
    ],
    recentRuns: [
      { title: "Ecom performance — daily review", time: "This morning" },
      { title: "On-order report — Nike + Adidas", time: "Yesterday" },
      { title: "Budget alignment — FW26 season", time: "Mar 16" },
      { title: "Brand buy sign-off — Nike Q3", time: "Mar 14" },
      { title: "Demand planning — 42 SKUs", time: "Mar 13" },
      { title: "Ecom performance — daily review", time: "Mar 12" },
    ],
  },
  {
    id: "tom-gallagher",
    name: "Richard Berwick",
    title: "VP Finance & Planning",
    initials: "RB",
    prebuiltWorkflowIds: [
      "invoice-reconciliation",
      "late-item-chargeback",
      "budget-file-alignment",
      "po-payment-prioritization",
    ],
    scheduledWorkflows: [
      {
        workflowId: "invoice-reconciliation",
        schedule: "Every Wednesday, 2:00 PM",
        lastRun: "Mar 12, 2:04 PM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "late-item-chargeback",
        trigger: "Item arrives late vs. PO ship date",
      },
    ],
    recentRuns: [
      { title: "Invoice reconciliation — 23 invoices", time: "Last Wed" },
      { title: "Late chargebacks — Q1 review", time: "Mar 14" },
      { title: "Budget alignment — FW26 season", time: "Mar 13" },
      { title: "PO payment priority — 8 vendors", time: "Mar 11" },
      { title: "Invoice reconciliation — 19 invoices", time: "Mar 5" },
    ],
  },
  {
    id: "rachel-kim",
    name: "Richard Berwick",
    title: "Director, Ops & Strategy",
    initials: "RB",
    prebuiltWorkflowIds: [
      "supplier-data-standardization",
      "supplier-compliance-tracking",
      "exception-delay-hindsighting",
      "moq-mcq-compliance",
      "continuous-weekly-reorder",
    ],
    scheduledWorkflows: [
      {
        workflowId: "continuous-weekly-reorder",
        schedule: "Every Monday, 11:00 AM",
        lastRun: "Mar 17, 11:02 AM",
      },
    ],
    triggeredWorkflows: [
      {
        workflowId: "exception-delay-hindsighting",
        trigger: "Production deadline is missed",
      },
    ],
    recentRuns: [
      { title: "Weekly reorder — Leverstyle", time: "Yesterday" },
      { title: "Supplier compliance — 24 vendors", time: "Mar 15" },
      { title: "Delay hindsighting — STY-2201", time: "Mar 14" },
      { title: "MOQ/MCQ check — spring buy plan", time: "Mar 13" },
      { title: "Supplier data standardization", time: "Mar 11" },
      { title: "Weekly reorder — Leverstyle", time: "Mar 10" },
    ],
  },
  {
    id: "alex-novak",
    name: "Richard Berwick",
    title: "Head of IT & Security",
    initials: "RB",
    prebuiltWorkflowIds: [
      "cross-system-po-flow",
      "supplier-data-standardization",
      "moq-mcq-compliance",
    ],
    scheduledWorkflows: [],
    triggeredWorkflows: [
      {
        workflowId: "cross-system-po-flow",
        trigger: "PO cut by buying/merch team",
      },
    ],
    recentRuns: [
      { title: "Cross-system PO flow — 14 orders", time: "Yesterday" },
      { title: "Supplier data standardization", time: "Mar 14" },
      { title: "MOQ/MCQ compliance check", time: "Mar 12" },
      { title: "Cross-system PO flow — 9 orders", time: "Mar 10" },
      { title: "Supplier data standardization", time: "Mar 6" },
    ],
  },
];

export const DEFAULT_ROLE_ID = "richard-berwick";
