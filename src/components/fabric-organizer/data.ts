import type { Mill, Fabric } from "./types";

export const MILLS: Mill[] = [
  {
    id: "olah",
    name: "Olah Inc.",
    location: "Shanghai, China",
    lastActive: "Dec 2025",
    representatives: [
      {
        id: "rep-1",
        name: "William Wood",
        role: "Textile & Sales Exp. Manager",
        email: "william@olah.com",
      },
      {
        id: "rep-2",
        name: "Rabia Kabal",
        role: "(role unknown)",
        email: "rabia.kabal@olah.com",
      },
    ],
    notes: [
      {
        id: "note-1",
        text: "Payment terms: T/T in advance, L/C at sight, or T/T 30 days after B/L thru factoring.",
        author: "Extracted from email",
        date: "Dec 23, 2025",
        type: "extracted",
      },
      {
        id: "note-2",
        text: "Good quality velvet but lead time is long. Budget $9/yd only works for 500+ yds.",
        author: "Vicki",
        date: "Jan 5, 2026",
        type: "manual",
      },
      {
        id: "note-3",
        text: "Lab dips looked great. Proceed with bulk.",
        author: "Sam",
        date: "Dec 12, 2025",
        type: "manual",
      },
    ],
    emailThreads: [
      {
        id: "thread-1",
        subject:
          "FA 2 '26 UNTUCKIT-RAINBOW-ART#VV41023 VELVET / ART#CD62163 CORDUROY",
        messageCount: 12,
        participants: [
          "William Wood",
          "May De Chavez",
          "Sam Salzarulo",
          "Vicki Tam",
          "Sarah Hand",
        ],
        dateRange: "Nov 12 – Dec 23, 2025",
        preview:
          "Vendor form submitted with bank details. Payment setup complete. Previously: 3 lab dips approved (Black Beauty, Ponderosa Pine, Maroon Banner). 15 yds sample shipped Nov 21.",
      },
      {
        id: "thread-2",
        subject: "SS 26 UNTUCKIT - Corduroy Stock Check",
        messageCount: 4,
        participants: ["William Wood", "Vicki Tam"],
        dateRange: "Oct 8 – Oct 15, 2025",
        preview:
          "Stock confirmed for CD62163 SL: Gray 120Y, Orange 120Y, White 400Y, Charcoal 400Y. MOQ for custom colors: 3,300 yds total / 1,100 per color.",
      },
      {
        id: "thread-3",
        subject: "Olah Inc. - New Fabric Collection FW26",
        messageCount: 2,
        participants: ["William Wood", "Sam Salzarulo"],
        dateRange: "Sep 20 – Sep 22, 2025",
        preview:
          "New swatch book shared for FW26 collection. Includes updated velvet and corduroy options with revised pricing.",
      },
    ],
  },
  {
    id: "huafang",
    name: "Huafang Textiles",
    location: "Jiangsu, China",
    lastActive: "Nov 2025",
    representatives: [
      {
        id: "rep-3",
        name: "Jin Wei",
        role: "Sales Manager",
        email: "jin@huafang.cn",
      },
    ],
    notes: [
      {
        id: "note-4",
        text: "Payment terms: T/T 50/50.",
        author: "Extracted from email",
        date: "Nov 10, 2025",
        type: "extracted",
      },
    ],
    emailThreads: [
      {
        id: "thread-4",
        subject: "Huafang - Cotton Velvet & Sateen Swatches",
        messageCount: 5,
        participants: ["Jin Wei", "Vicki Tam"],
        dateRange: "Oct 1 – Nov 8, 2025",
        preview:
          "Swatch book received. HF2290 velvet is a good match for VV41023 at lower price point. Sateen HF3310 also promising.",
      },
    ],
  },
  {
    id: "orient",
    name: "Orient Textiles",
    location: "Jiangsu, China",
    lastActive: "Dec 2025",
    representatives: [
      {
        id: "rep-4",
        name: "Li Wei",
        role: "Export Manager",
        email: "li.wei@orienttex.com",
      },
    ],
    notes: [
      {
        id: "note-5",
        text: "Payment terms: Net 30.",
        author: "Extracted from email",
        date: "Dec 1, 2025",
        type: "extracted",
      },
      {
        id: "note-6",
        text: "Very flexible on MOQ. Good for smaller runs.",
        author: "Sam",
        date: "Dec 10, 2025",
        type: "manual",
      },
    ],
    emailThreads: [
      {
        id: "thread-5",
        subject: "Orient Textiles - Cotton Twill Pricing Update",
        messageCount: 3,
        participants: ["Li Wei", "Sam Salzarulo"],
        dateRange: "Nov 20 – Dec 15, 2025",
        preview:
          "Price updated to $8.20/yd (was $7.50). MOQ reduced to 300 yds. New pricing effective Jan 2026.",
      },
    ],
  },
];

export const FABRICS: Fabric[] = [
  {
    id: "fab-1",
    millId: "olah",
    artNumber: "VV41023",
    name: "Velvet",
    composition: "100% Cotton",
    weight: "175-190g",
    price: "$10.50/yd",
    paymentTerms: "T/T advance, L/C at sight, T/T 30d",
    contactEmail: "william@olah.com",
  },
  {
    id: "fab-2",
    millId: "olah",
    artNumber: "CD62163 SL",
    name: "Corduroy",
    composition: "(pending)",
    weight: "-",
    price: "$6.75/yd",
    paymentTerms: "T/T advance, L/C at sight, T/T 30d",
    contactEmail: "william@olah.com",
  },
  {
    id: "fab-3",
    millId: "huafang",
    artNumber: "HF2290",
    name: "Velvet",
    composition: "100% Cotton",
    weight: "180g",
    price: "$7.80/yd",
    paymentTerms: "T/T 50/50",
    contactEmail: "jin@huafang.cn",
  },
  {
    id: "fab-4",
    millId: "huafang",
    artNumber: "HF3310",
    name: "Cotton Sateen",
    composition: "100% Cotton",
    weight: "210g",
    price: "$6.20/yd",
    paymentTerms: "T/T 50/50",
    contactEmail: "jin@huafang.cn",
  },
  {
    id: "fab-5",
    millId: "orient",
    artNumber: "CT8810",
    name: "Cotton Twill",
    composition: "100% Cotton",
    weight: "220g",
    price: "$8.20/yd",
    paymentTerms: "Net 30",
    contactEmail: "li.wei@orienttex.com",
  },
];
