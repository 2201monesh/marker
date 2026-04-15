import type { Mill, Fabric } from "./types";

export const MILLS: Mill[] = [
  // ── Existing mills with full data ──────────────────────────────
  {
    id: "olah",
    name: "Olah Inc.",
    location: "Shanghai, China",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-1", name: "William Wood", role: "Textile & Sales Exp. Manager", email: "william@olah.com" },
      { id: "rep-2", name: "Rabia Kabal", role: "(role unknown)", email: "rabia.kabal@olah.com" },
    ],
    notes: [
      { id: "note-1", text: "Payment terms: T/T in advance, L/C at sight, or T/T 30 days after B/L thru factoring.", author: "Extracted from email", date: "Dec 23, 2025", type: "extracted" },
      { id: "note-2", text: "Good quality velvet but lead time is long. Budget $9/yd only works for 500+ yds.", author: "Vicki", date: "Jan 5, 2026", type: "manual" },
      { id: "note-3", text: "Lab dips looked great. Proceed with bulk.", author: "Sam", date: "Dec 12, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-1", subject: "FA 2 '26 UNTUCKIT-RAINBOW-ART#VV41023 VELVET / ART#CD62163 CORDUROY", messageCount: 12, participants: ["William Wood", "May De Chavez", "Sam Salzarulo", "Vicki Tam", "Sarah Hand"], dateRange: "Nov 12 – Dec 23, 2025", preview: "Vendor form submitted with bank details. Payment setup complete. Previously: 3 lab dips approved (Black Beauty, Ponderosa Pine, Maroon Banner). 15 yds sample shipped Nov 21." },
      { id: "thread-2", subject: "SS 26 UNTUCKIT - Corduroy Stock Check", messageCount: 4, participants: ["William Wood", "Vicki Tam"], dateRange: "Oct 8 – Oct 15, 2025", preview: "Stock confirmed for CD62163 SL: Gray 120Y, Orange 120Y, White 400Y, Charcoal 400Y. MOQ for custom colors: 3,300 yds total / 1,100 per color." },
      { id: "thread-3", subject: "Olah Inc. - New Fabric Collection FW26", messageCount: 2, participants: ["William Wood", "Sam Salzarulo"], dateRange: "Sep 20 – Sep 22, 2025", preview: "New swatch book shared for FW26 collection. Includes updated velvet and corduroy options with revised pricing." },
    ],
  },
  {
    id: "huafang",
    name: "Huafang Textiles",
    location: "Jiangsu, China",
    lastActive: "Nov 2025",
    representatives: [
      { id: "rep-3", name: "Jin Wei", role: "Sales Manager", email: "jin@huafang.cn" },
    ],
    notes: [
      { id: "note-4", text: "Payment terms: T/T 50/50.", author: "Extracted from email", date: "Nov 10, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-4", subject: "Huafang - Cotton Velvet & Sateen Swatches", messageCount: 5, participants: ["Jin Wei", "Vicki Tam"], dateRange: "Oct 1 – Nov 8, 2025", preview: "Swatch book received. HF2290 velvet is a good match for VV41023 at lower price point. Sateen HF3310 also promising." },
    ],
  },
  {
    id: "orient",
    name: "Orient Textiles",
    location: "Jiangsu, China",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-4", name: "Li Wei", role: "Export Manager", email: "li.wei@orienttex.com" },
    ],
    notes: [
      { id: "note-5", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Dec 1, 2025", type: "extracted" },
      { id: "note-6", text: "Very flexible on MOQ. Good for smaller runs.", author: "Sam", date: "Dec 10, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-5", subject: "Orient Textiles - Cotton Twill Pricing Update", messageCount: 3, participants: ["Li Wei", "Sam Salzarulo"], dateRange: "Nov 20 – Dec 15, 2025", preview: "Price updated to $8.20/yd (was $7.50). MOQ reduced to 300 yds. New pricing effective Jan 2026." },
    ],
  },

  // ── Mills from UNTUCKit cost tool CSV ──────────────────────────
  {
    id: "youngbo",
    name: "Youngbo Textile",
    location: "Daegu, Korea",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-5", name: "Park Joon-ho", role: "Sales Director", email: "joonho.park@youngbo.co.kr" },
    ],
    notes: [
      { id: "note-7", text: "Payment terms: T/T 30 days after B/L.", author: "Extracted from email", date: "Jan 15, 2026", type: "extracted" },
      { id: "note-8", text: "Bulk LT 55 days, sample LT 25 days. Working to reduce MOQ from 3K to 1K.", author: "Sam", date: "Feb 3, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-6", subject: "FA1 26 - Youngbo PN-41555F Shell Fabric for Ferrigan", messageCount: 6, participants: ["Park Joon-ho", "Vicki Tam", "Sam Salzarulo"], dateRange: "Jan 8 – Mar 10, 2026", preview: "SSY price $8.14 + $300 surcharge. 50 yds SSY MOQ. Bulk price confirmed at $5.35/yd for 1K+ yds. COO Korea confirmed." },
    ],
  },
  {
    id: "iljoong",
    name: "Iljoong Textile",
    location: "Incheon, Korea",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-6", name: "Kim Sang-woo", role: "Export Manager", email: "sangwoo@iljoong.com" },
    ],
    notes: [
      { id: "note-9", text: "No SSY available for TPS0475. Need full roll order for sampling.", author: "Vicki", date: "Feb 10, 2026", type: "manual" },
      { id: "note-10", text: "Factory suggests overlock at seams to prevent fabric fraying before sewing.", author: "Extracted from email", date: "Feb 3, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-7", subject: "Iljoong TPS0475 - Romano Vest Exterior Quality", messageCount: 4, participants: ["Kim Sang-woo", "Sam Salzarulo"], dateRange: "Jan 20 – Feb 15, 2026", preview: "Confirmed 210 GSM wool/poly/viscose blend. $5.95/yd at 500+ yds. Ask Polaris to locally comp or check if solid version available." },
    ],
  },
  {
    id: "sumec",
    name: "SUMEC Textile",
    location: "Nanjing, China",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-7", name: "Chen Wei", role: "Sales Manager", email: "chen.wei@sumec-textile.com" },
      { id: "rep-8", name: "Liu Fang", role: "Fabric Development", email: "liu.fang@sumec-textile.com" },
    ],
    notes: [
      { id: "note-11", text: "Payment terms: 20% bulk deposit upfront, balance 80% prior to shipment.", author: "Extracted from email", date: "Feb 20, 2026", type: "extracted" },
      { id: "note-12", text: "PFC-free water repellency on NR26091. Good sustainable story.", author: "Sam", date: "Mar 1, 2026", type: "manual" },
      { id: "note-13", text: "10 meters available in multiple colors per color card for sampling.", author: "Extracted from email", date: "Jan 25, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-8", subject: "SUMEC - Deluca Filled Shirt Jacket Shell Fabric", messageCount: 8, participants: ["Chen Wei", "Sam Salzarulo", "Vicki Tam"], dateRange: "Jan 8 – Mar 5, 2026", preview: "SMD-N25310 confirmed for Deluca shell. 93% nylon 7% poly, 60 GSM. Bulk $2.60/yd at 1000m MOQ. Combo fabric NR26091 also sourced from SUMEC." },
      { id: "thread-9", subject: "SUMEC FN1835 - Lining Quality for Romano Vest", messageCount: 3, participants: ["Chen Wei", "Vicki Tam"], dateRange: "Dec 10 – Jan 5, 2026", preview: "FN1835 confirmed as 1-layer (not 2-layer as header). $3.80/yd bulk, $4/yd SSY. 50m SSY MOQ." },
    ],
  },
  {
    id: "hongen",
    name: "Hongen Textiles",
    location: "Jiaxing, China",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-9", name: "Zhang Li", role: "Sales Representative", email: "zhang.li@hongen-tex.com" },
    ],
    notes: [
      { id: "note-14", text: "Payment terms: T/T 30d after shipment.", author: "Extracted from email", date: "Jan 20, 2026", type: "extracted" },
      { id: "note-15", text: "Handlooms being submitted in correct color for Ferraro herringbone.", author: "Sam", date: "Feb 5, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-10", subject: "Hongen 755S-22-065 - Herringbone Overshirt Fabric", messageCount: 3, participants: ["Zhang Li", "Sam Salzarulo"], dateRange: "Jan 8 – Feb 10, 2026", preview: "50% wool 40% poly 10% other. 430 GSM. $6.11/meter bulk at 500m-1K MOQ. 20 yds sent as header for proto." },
    ],
  },
  {
    id: "teijin",
    name: "Teijin Frontier",
    location: "Osaka, Japan",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-10", name: "Tanaka Yuki", role: "Overseas Sales", email: "y.tanaka@teijin.com" },
    ],
    notes: [
      { id: "note-16", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Dec 15, 2025", type: "extracted" },
      { id: "note-17", text: "Fails tear strength test but Bjorn signed off on this quality for Fiorley jacket.", author: "Sam", date: "Feb 12, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-11", subject: "Teijin GRCT10193 - Fiorley Field Jacket Shell", messageCount: 4, participants: ["Tanaka Yuki", "Sam Salzarulo"], dateRange: "Dec 1 – Feb 8, 2026", preview: "100% polyester, 175 GSM. $6.85/yd at 500 yd MOQ. Handloom submitted for color. Available in correct quality for proto." },
    ],
  },
  {
    id: "koojoo",
    name: "Koojoo Textile",
    location: "Suzhou, China",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-11", name: "Lee Min-jun", role: "Sales Manager", email: "minjun@koojoo.com" },
    ],
    notes: [
      { id: "note-18", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Dec 20, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-12", subject: "Koojoo KYD-1616TPU - Romano Vest Exterior Update", messageCount: 2, participants: ["Lee Min-jun", "Sam Salzarulo"], dateRange: "Dec 15 – Jan 10, 2026", preview: "100% polyester with TPU membrane. Updated exterior body quality for non-reversible Romano. P160D construction, 148 GSM." },
    ],
  },
  {
    id: "nst",
    name: "NST Apparel (Fabric Sourcing)",
    location: "Hong Kong / Philippines",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-12", name: "May De Chavez", role: "PD/SM, Merchandising", email: "may.dechaves@nst-apparel.com" },
      { id: "rep-13", name: "Mandy Chiang", role: "Merchandising Manager", email: "mandy.chiang@nst-apparel.com" },
    ],
    notes: [
      { id: "note-19", text: "NST is both garment factory and fabric sourcer. Can source vertically for some qualities.", author: "Sam", date: "Jan 10, 2026", type: "manual" },
      { id: "note-20", text: "Payment terms: Net 30 from shipment.", author: "Extracted from email", date: "Feb 1, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-13", subject: "NST Vertical Sourcing - Connolly & Raphael Qualities", messageCount: 7, participants: ["May De Chavez", "Sam Salzarulo", "Vicki Tam"], dateRange: "Jan 8 – Mar 15, 2026", preview: "RT265006 polyester confirmed water resistant PFC-free, 150 GSM, $6.50/yd. BOB-ST101350 wool/viscose at $9.00/yd for Raphael repeat. Lab dip in Pine Grove est 3/20." },
    ],
  },

  // ── Turkish Mills ──────────────────────────────────────────────
  {
    id: "soktas",
    name: "Soktas",
    location: "Soke, Turkey",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-14", name: "Emre Yilmaz", role: "Export Sales Manager", email: "emre.yilmaz@soktas.com.tr" },
    ],
    notes: [
      { id: "note-21", text: "Payment terms: L/C 60 days.", author: "Extracted from email", date: "Jan 5, 2026", type: "extracted" },
      { id: "note-22", text: "Premium quality. Great for dress shirts. Quick turnaround on lab dips.", author: "Vicki", date: "Feb 10, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-14", subject: "Soktas - SS26 Premium Shirting Collection", messageCount: 5, participants: ["Emre Yilmaz", "Sam Salzarulo"], dateRange: "Dec 1 – Feb 5, 2026", preview: "New collection includes superfine poplin and twill options. Wrinkle-free finish available on all qualities. Swatch book shipped Dec 15." },
    ],
  },
  {
    id: "bossa",
    name: "Bossa",
    location: "Adana, Turkey",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-15", name: "Mehmet Kaya", role: "Sales Director", email: "mehmet.kaya@bossa.com.tr" },
    ],
    notes: [
      { id: "note-23", text: "Payment terms: T/T 30d after B/L.", author: "Extracted from email", date: "Nov 20, 2025", type: "extracted" },
      { id: "note-24", text: "Strong on denim and twill. Good value for mid-range trouser fabrics.", author: "Sam", date: "Dec 5, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-15", subject: "Bossa - FW26 Denim & Twill Options", messageCount: 3, participants: ["Mehmet Kaya", "Vicki Tam"], dateRange: "Nov 1 – Jan 15, 2026", preview: "Updated pricing for stretch denim and cavalry twill. New indigo wash options for FW26." },
    ],
  },
  {
    id: "calik",
    name: "Calik Denim",
    location: "Malatya, Turkey",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-16", name: "Ayse Demir", role: "Key Account Manager", email: "ayse.demir@calikdenim.com" },
    ],
    notes: [
      { id: "note-25", text: "Payment terms: L/C at sight.", author: "Extracted from email", date: "Oct 15, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-16", subject: "Calik - Stretch Denim Developments FW26", messageCount: 4, participants: ["Ayse Demir", "Sam Salzarulo"], dateRange: "Oct 1 – Dec 10, 2025", preview: "New E-Denim recycled cotton options. Dual-core stretch at competitive pricing. Samples shipped Nov 20." },
    ],
  },
  {
    id: "isko",
    name: "ISKO",
    location: "Istanbul, Turkey",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-17", name: "Baris Ozturk", role: "Global Sales", email: "baris.ozturk@isko.com.tr" },
    ],
    notes: [
      { id: "note-26", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Nov 10, 2025", type: "extracted" },
      { id: "note-27", text: "Performance denim with Coolmax and Lycra tech. Premium pricing but strong brand story.", author: "Sam", date: "Dec 20, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-17", subject: "ISKO - R-TWO Recycled Denim Program", messageCount: 3, participants: ["Baris Ozturk", "Sam Salzarulo"], dateRange: "Nov 5 – Jan 8, 2026", preview: "R-TWO line uses 50%+ recycled content. GRS certified. New washes available for SS26 carry into FW26." },
    ],
  },
  {
    id: "sanko",
    name: "Sanko Tekstil",
    location: "Gaziantep, Turkey",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-18", name: "Hakan Celik", role: "Export Manager", email: "hakan.celik@sanko.com.tr" },
    ],
    notes: [
      { id: "note-28", text: "Payment terms: T/T 50/50.", author: "Extracted from email", date: "Dec 1, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-18", subject: "Sanko - Cotton Shirting Pricing FA26", messageCount: 2, participants: ["Hakan Celik", "Vicki Tam"], dateRange: "Jan 10 – Feb 5, 2026", preview: "Confirmed pricing on oxford and chambray qualities. New yarn-dyed options in seasonal colors." },
    ],
  },

  // ── Italian Mills ──────────────────────────────────────────────
  {
    id: "albini",
    name: "Albini Group",
    location: "Bergamo, Italy",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-19", name: "Marco Rossi", role: "Commercial Director", email: "m.rossi@albinigroup.com" },
    ],
    notes: [
      { id: "note-29", text: "Payment terms: Net 60 from invoice date.", author: "Extracted from email", date: "Feb 1, 2026", type: "extracted" },
      { id: "note-30", text: "Top-tier shirting. Thomas Mason and Albini brands. Worth the premium for hero styles.", author: "Sam", date: "Mar 5, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-19", subject: "Albini - FW26 Luxury Shirting Collection", messageCount: 5, participants: ["Marco Rossi", "Sam Salzarulo"], dateRange: "Jan 15 – Mar 10, 2026", preview: "New collection featuring organic Supima cotton and linen blends. Pricing updated for FW26 season." },
    ],
  },
  {
    id: "canclini",
    name: "Canclini",
    location: "Como, Italy",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-20", name: "Giulia Colombo", role: "Sales Manager", email: "g.colombo@canclini1925.it" },
    ],
    notes: [
      { id: "note-31", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Nov 15, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-20", subject: "Canclini - Fine Cotton Shirting Swatches", messageCount: 3, participants: ["Giulia Colombo", "Sam Salzarulo"], dateRange: "Nov 1 – Jan 10, 2026", preview: "Swiss cotton and Egyptian cotton options. Competitive with Albini on 2-ply qualities." },
    ],
  },
  {
    id: "vbc",
    name: "Vitale Barberis Canonico",
    location: "Biella, Italy",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-21", name: "Alessandro Bianchi", role: "Export Sales", email: "a.bianchi@vitalebarberiscanonico.it" },
    ],
    notes: [
      { id: "note-32", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Dec 10, 2025", type: "extracted" },
      { id: "note-33", text: "Best value Italian wool. 270-year heritage. Strong for blazer and trouser programs.", author: "Sam", date: "Jan 15, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-21", subject: "VBC - FW26 Wool Flannel & Hopsack Options", messageCount: 4, participants: ["Alessandro Bianchi", "Sam Salzarulo"], dateRange: "Dec 5 – Feb 10, 2026", preview: "Updated flannel collection with natural stretch options. Hopsack in 260-280 GSM range for unstructured blazers." },
    ],
  },
  {
    id: "reda",
    name: "Reda",
    location: "Biella, Italy",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-22", name: "Stefano Ferri", role: "Area Manager Americas", email: "s.ferri@reda.it" },
    ],
    notes: [
      { id: "note-34", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Nov 20, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-22", subject: "Reda - Active Merino Wool Collection", messageCount: 2, participants: ["Stefano Ferri", "Sam Salzarulo"], dateRange: "Nov 10 – Jan 5, 2026", preview: "Active line with natural stretch merino. Machine washable finish. Pricing competitive for the quality tier." },
    ],
  },
  {
    id: "limonta",
    name: "Limonta",
    location: "Costa Masnaga, Italy",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-23", name: "Luca Mazzoni", role: "Technical Sales", email: "l.mazzoni@limonta.com" },
    ],
    notes: [
      { id: "note-35", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Oct 20, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-23", subject: "Limonta - Technical Outerwear Fabrics FW26", messageCount: 3, participants: ["Luca Mazzoni", "Sam Salzarulo"], dateRange: "Oct 5 – Dec 15, 2025", preview: "Nylon/cotton blends with DWR finish. New micro-ripstop in 110 GSM range. PFC-free options available." },
    ],
  },
  {
    id: "loropiana",
    name: "Loro Piana",
    location: "Quarona, Italy",
    lastActive: "Nov 2025",
    representatives: [
      { id: "rep-24", name: "Fabio Galli", role: "Fabric Sales", email: "f.galli@loropiana.com" },
    ],
    notes: [
      { id: "note-36", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Oct 1, 2025", type: "extracted" },
      { id: "note-37", text: "Ultra-premium. Only worth it for capsule/limited pieces. Cashmere blend is stunning.", author: "Sam", date: "Nov 5, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-24", subject: "Loro Piana - Cashmere Blend for Holiday Capsule", messageCount: 2, participants: ["Fabio Galli", "Sam Salzarulo"], dateRange: "Oct 1 – Nov 10, 2025", preview: "Storm System cashmere/wool blend. $38/yd but exceptional hand feel and brand cachet." },
    ],
  },

  // ── Portuguese Mills ───────────────────────────────────────────
  {
    id: "tintex",
    name: "Tintex Textiles",
    location: "Santo Tirso, Portugal",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-25", name: "Ana Santos", role: "Sales Manager", email: "ana.santos@tintex.pt" },
    ],
    notes: [
      { id: "note-38", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Jan 5, 2026", type: "extracted" },
      { id: "note-39", text: "Strong sustainability credentials. GOTS certified. Good for marketing story.", author: "Sam", date: "Feb 1, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-25", subject: "Tintex - Organic Cotton Jersey & French Terry", messageCount: 4, participants: ["Ana Santos", "Vicki Tam"], dateRange: "Dec 15 – Feb 10, 2026", preview: "New organic pima cotton jersey in 180 GSM. French terry with recycled poly blend. All GOTS certified." },
    ],
  },
  {
    id: "valerius",
    name: "Valérius Têxteis",
    location: "Guimarães, Portugal",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-26", name: "Pedro Oliveira", role: "Export Director", email: "pedro@valerius.pt" },
    ],
    notes: [
      { id: "note-40", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Dec 1, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-26", subject: "Valérius - Pique Polo & Jersey Knit Options", messageCount: 3, participants: ["Pedro Oliveira", "Sam Salzarulo"], dateRange: "Nov 20 – Jan 15, 2026", preview: "Cotton pique for polo program. Long-staple cotton jersey for tees. Quick 3-week lead time on repeats." },
    ],
  },

  // ── Indian/Pakistani Mills ─────────────────────────────────────
  {
    id: "arvind",
    name: "Arvind Ltd",
    location: "Ahmedabad, India",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-27", name: "Rajesh Patel", role: "VP International Sales", email: "rajesh.patel@arvind.in" },
    ],
    notes: [
      { id: "note-41", text: "Payment terms: L/C 60 days.", author: "Extracted from email", date: "Jan 20, 2026", type: "extracted" },
      { id: "note-42", text: "Massive scale. Good for basics and volume programs. Denim is competitive.", author: "Sam", date: "Feb 15, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-27", subject: "Arvind - Cotton Shirting & Denim Bulk Pricing", messageCount: 5, participants: ["Rajesh Patel", "Sam Salzarulo"], dateRange: "Jan 10 – Mar 5, 2026", preview: "Volume pricing on cotton poplin and oxford. New sustainable denim line with BCI cotton. Competitive against Turkish mills." },
    ],
  },
  {
    id: "vardhman",
    name: "Vardhman Textiles",
    location: "Ludhiana, India",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-28", name: "Amit Sharma", role: "Export Manager", email: "amit.sharma@vardhman.com" },
    ],
    notes: [
      { id: "note-43", text: "Payment terms: L/C at sight.", author: "Extracted from email", date: "Nov 1, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-28", subject: "Vardhman - Yarn-Dyed Check & Stripe Collection", messageCount: 2, participants: ["Amit Sharma", "Vicki Tam"], dateRange: "Oct 15 – Dec 5, 2025", preview: "New yarn-dyed collection for FW26 casual shirts. Good range of checks and windowpanes." },
    ],
  },
  {
    id: "sapphire",
    name: "Sapphire Textile Mills",
    location: "Lahore, Pakistan",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-29", name: "Hassan Ali", role: "Sales Manager", email: "hassan.ali@sapphiretextile.com" },
    ],
    notes: [
      { id: "note-44", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Dec 10, 2025", type: "extracted" },
      { id: "note-45", text: "Strong on cotton twill for chinos. Consistent quality shipment to shipment.", author: "Vicki", date: "Jan 5, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-29", subject: "Sapphire - Chino Twill Program FW26", messageCount: 3, participants: ["Hassan Ali", "Sam Salzarulo"], dateRange: "Dec 1 – Jan 15, 2026", preview: "Cotton stretch twill confirmed at $4.80/yd. 98/2 cotton/elastane. Lab dips in 8 seasonal colors." },
    ],
  },
  {
    id: "artistic",
    name: "Artistic Fabric Mills",
    location: "Karachi, Pakistan",
    lastActive: "Nov 2025",
    representatives: [
      { id: "rep-30", name: "Farhan Khan", role: "Export Sales", email: "farhan@artisticfabric.com" },
    ],
    notes: [
      { id: "note-46", text: "Payment terms: L/C 30 days.", author: "Extracted from email", date: "Oct 15, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-30", subject: "Artistic Fabric - Cotton Poplin Pricing Update", messageCount: 2, participants: ["Farhan Khan", "Vicki Tam"], dateRange: "Oct 1 – Nov 10, 2025", preview: "Revised poplin pricing down 5% due to raw cotton drop. 60s compact cotton at $3.20/yd for 3K+ orders." },
    ],
  },

  // ── Chinese Mills ──────────────────────────────────────────────
  {
    id: "lutai",
    name: "Lutai Textile",
    location: "Zibo, China",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-31", name: "Wang Xiaoming", role: "Sales Director", email: "xiaoming.wang@lutai.com" },
    ],
    notes: [
      { id: "note-47", text: "Payment terms: T/T 30d after B/L.", author: "Extracted from email", date: "Feb 10, 2026", type: "extracted" },
      { id: "note-48", text: "Largest shirting mill in China. Consistent quality. Good for volume programs.", author: "Sam", date: "Mar 1, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-31", subject: "Lutai - Cotton Shirting Bulk Program SS/FW26", messageCount: 4, participants: ["Wang Xiaoming", "Sam Salzarulo"], dateRange: "Jan 20 – Mar 5, 2026", preview: "Volume pricing confirmed on oxford, twill, and poplin. New wrinkle-free treatment available. 35-day bulk lead time." },
    ],
  },
  {
    id: "esquel",
    name: "Esquel Group",
    location: "Gaoming, China",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-32", name: "Grace Chen", role: "Account Manager", email: "grace.chen@esquel.com" },
    ],
    notes: [
      { id: "note-49", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Jan 15, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-32", subject: "Esquel - Premium Cotton Shirting Options", messageCount: 3, participants: ["Grace Chen", "Sam Salzarulo"], dateRange: "Dec 20 – Feb 5, 2026", preview: "Supima cotton shirting with non-iron finish. Sustainability story with their cotton farm initiative." },
    ],
  },
  {
    id: "keqiao",
    name: "Shaoxing Keqiao Textile",
    location: "Shaoxing, China",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-33", name: "Zhao Jie", role: "Sales", email: "zhao.jie@keqiaotex.cn" },
    ],
    notes: [
      { id: "note-50", text: "Payment terms: T/T 50/50.", author: "Extracted from email", date: "Nov 5, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-33", subject: "Keqiao - Polyester Blend Lining & Shell Options", messageCount: 2, participants: ["Zhao Jie", "Vicki Tam"], dateRange: "Oct 20 – Dec 1, 2025", preview: "Stock lining fabrics available for immediate shipment. New shell qualities with DWR finish." },
    ],
  },
  {
    id: "shenda",
    name: "Wujiang Shenda",
    location: "Suzhou, China",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-34", name: "Sun Mei", role: "Export Sales", email: "sun.mei@shenda.cn" },
    ],
    notes: [
      { id: "note-51", text: "Payment terms: T/T advance.", author: "Extracted from email", date: "Dec 1, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-34", subject: "Shenda - Cupro & Bemberg Lining Collection", messageCount: 2, participants: ["Sun Mei", "Vicki Tam"], dateRange: "Nov 15 – Jan 5, 2026", preview: "Cupro lining at $2.40/yd. Bemberg alternative at $3.10/yd. Both available in 20+ stock colors." },
    ],
  },
  {
    id: "chunlan",
    name: "Jiangyin Chunlan",
    location: "Jiangyin, China",
    lastActive: "Nov 2025",
    representatives: [
      { id: "rep-35", name: "Li Hong", role: "Sales Manager", email: "li.hong@chunlan-tex.cn" },
    ],
    notes: [
      { id: "note-52", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Oct 10, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-35", subject: "Chunlan - Cotton Flannel Options FW26", messageCount: 3, participants: ["Li Hong", "Sam Salzarulo"], dateRange: "Sep 25 – Nov 10, 2025", preview: "Brushed cotton flannel in solid and plaid options. 180-220 GSM range. Good for casual shirting program." },
    ],
  },
  {
    id: "cellulose",
    name: "Nantong Cellulose Fiber",
    location: "Nantong, China",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-36", name: "Yang Wei", role: "Sales Representative", email: "yang.wei@ntcellulose.cn" },
    ],
    notes: [
      { id: "note-53", text: "Payment terms: T/T 50/50.", author: "Extracted from email", date: "Jan 10, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-36", subject: "Nantong - Modal/Tencel Blend Options", messageCount: 2, participants: ["Yang Wei", "Vicki Tam"], dateRange: "Dec 20 – Feb 5, 2026", preview: "Modal/cotton blend at 160 GSM for premium tees. Tencel/cotton for soft casual shirts. Both with great drape." },
    ],
  },

  // ── Korean Mills ───────────────────────────────────────────────
  {
    id: "hyosung",
    name: "Hyosung TNC",
    location: "Seoul, Korea",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-37", name: "Choi Soo-jin", role: "Global Sales Manager", email: "soojin.choi@hyosung.com" },
    ],
    notes: [
      { id: "note-54", text: "Payment terms: Net 45.", author: "Extracted from email", date: "Feb 15, 2026", type: "extracted" },
      { id: "note-55", text: "Creora stretch fiber supplier. Also offers woven stretch fabrics direct.", author: "Sam", date: "Mar 5, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-37", subject: "Hyosung - Stretch Woven & Performance Knit Options", messageCount: 3, participants: ["Choi Soo-jin", "Sam Salzarulo"], dateRange: "Jan 25 – Mar 10, 2026", preview: "New bi-stretch trouser fabric with Creora. Also offering moisture-wicking jersey for performance polo line." },
    ],
  },
  {
    id: "tkchemical",
    name: "TK Chemical",
    location: "Daegu, Korea",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-38", name: "Park Eun-ji", role: "Sales Manager", email: "eunji.park@tkchemical.co.kr" },
    ],
    notes: [
      { id: "note-56", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Dec 5, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-38", subject: "TK Chemical - Nylon Ripstop & Technical Wovens", messageCount: 2, participants: ["Park Eun-ji", "Sam Salzarulo"], dateRange: "Nov 20 – Jan 10, 2026", preview: "Ripstop nylon at 70 GSM for packable jackets. DWR treated. New recycled nylon option available." },
    ],
  },

  // ── Japanese Mills ─────────────────────────────────────────────
  {
    id: "kurabo",
    name: "Kurabo Industries",
    location: "Osaka, Japan",
    lastActive: "Dec 2025",
    representatives: [
      { id: "rep-39", name: "Sato Kenji", role: "Export Division", email: "k.sato@kurabo.co.jp" },
    ],
    notes: [
      { id: "note-57", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Nov 1, 2025", type: "extracted" },
      { id: "note-58", text: "Premium selvedge denim. Small MOQs compared to Turkish mills. Best for capsule collections.", author: "Sam", date: "Dec 10, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-39", subject: "Kurabo - Selvedge Denim Collection FW26", messageCount: 3, participants: ["Sato Kenji", "Sam Salzarulo"], dateRange: "Oct 15 – Dec 10, 2025", preview: "Rope-dyed selvedge in 12oz and 14oz. Limited stock available for immediate sampling. New kasuri-inspired weaves." },
    ],
  },
  {
    id: "toray",
    name: "Toray Industries",
    location: "Tokyo, Japan",
    lastActive: "Feb 2026",
    representatives: [
      { id: "rep-40", name: "Nakamura Hiroshi", role: "Textile Division Sales", email: "h.nakamura@toray.co.jp" },
    ],
    notes: [
      { id: "note-59", text: "Payment terms: Net 60.", author: "Extracted from email", date: "Jan 10, 2026", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-40", subject: "Toray - Dermizax & Technical Shell Fabrics", messageCount: 4, participants: ["Nakamura Hiroshi", "Sam Salzarulo"], dateRange: "Dec 5 – Feb 15, 2026", preview: "Dermizax membrane options for premium outerwear. 2.5L and 3L constructions. Pricing significantly higher but best-in-class performance." },
    ],
  },

  // ── Indonesian/Vietnamese Mills ────────────────────────────────
  {
    id: "sritex",
    name: "Sritex",
    location: "Solo, Indonesia",
    lastActive: "Jan 2026",
    representatives: [
      { id: "rep-41", name: "Budi Santoso", role: "Export Manager", email: "budi.santoso@sritex.co.id" },
    ],
    notes: [
      { id: "note-60", text: "Payment terms: T/T 30d.", author: "Extracted from email", date: "Dec 5, 2025", type: "extracted" },
    ],
    emailThreads: [
      { id: "thread-41", subject: "Sritex - Cotton Twill & Canvas Options", messageCount: 2, participants: ["Budi Santoso", "Vicki Tam"], dateRange: "Nov 15 – Jan 5, 2026", preview: "Heavy cotton twill and canvas for workwear-inspired pieces. Very competitive pricing on 280+ GSM qualities." },
    ],
  },
  {
    id: "thiennam",
    name: "Thien Nam Group",
    location: "Ho Chi Minh City, Vietnam",
    lastActive: "Mar 2026",
    representatives: [
      { id: "rep-42", name: "Nguyen Thi Lan", role: "Sales Director", email: "lan.nguyen@thiennam.com.vn" },
    ],
    notes: [
      { id: "note-61", text: "Payment terms: T/T 30d after B/L.", author: "Extracted from email", date: "Feb 1, 2026", type: "extracted" },
      { id: "note-62", text: "Good value knits. Quick turnaround. Local to our Vietnam factories.", author: "Sam", date: "Mar 1, 2026", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-42", subject: "Thien Nam - Jersey & Pique Knit Program", messageCount: 3, participants: ["Nguyen Thi Lan", "Vicki Tam"], dateRange: "Jan 15 – Mar 5, 2026", preview: "Cotton jersey at $3.50/yd. Pique polo fabric at $4.20/yd. Both with 3-week lead time for repeat orders." },
    ],
  },

  // ── Specialty Mills ────────────────────────────────────────────
  {
    id: "halley",
    name: "Halley Stevensons",
    location: "Dundee, Scotland",
    lastActive: "Oct 2025",
    representatives: [
      { id: "rep-43", name: "James MacLeod", role: "Sales Manager", email: "j.macleod@halleygroup.com" },
    ],
    notes: [
      { id: "note-63", text: "Payment terms: Net 30.", author: "Extracted from email", date: "Sep 15, 2025", type: "extracted" },
      { id: "note-64", text: "Heritage waxed cotton. Great for limited edition outerwear. Long lead times.", author: "Sam", date: "Oct 5, 2025", type: "manual" },
    ],
    emailThreads: [
      { id: "thread-43", subject: "Halley Stevensons - Waxed Cotton for FW26 Capsule", messageCount: 2, participants: ["James MacLeod", "Sam Salzarulo"], dateRange: "Sep 10 – Oct 15, 2025", preview: "British Millerain waxed cotton in 8oz and 10oz. Available in olive, navy, brown. 8-week lead time on custom colors." },
    ],
  },
];

export const FABRICS: Fabric[] = [
  // ── Olah Inc. ──────────────────────────────────────────────────
  { id: "fab-1", millId: "olah", artNumber: "VV41023", name: "Velvet", composition: "100% Cotton", weight: "175-190g", price: "$10.50/yd", moq: "3,000 yds", moc: "3,000/color", paymentTerms: "T/T advance, L/C at sight, T/T 30d", contactEmail: "william@olah.com" },
  { id: "fab-2", millId: "olah", artNumber: "CD62163 SL", name: "Corduroy", composition: "(pending)", weight: "-", price: "$6.75/yd", moq: "3,300 yds", moc: "1,100/color", paymentTerms: "T/T advance, L/C at sight, T/T 30d", contactEmail: "william@olah.com" },

  // ── Huafang Textiles ───────────────────────────────────────────
  { id: "fab-3", millId: "huafang", artNumber: "HF2290", name: "Velvet", composition: "100% Cotton", weight: "180g", price: "$7.80/yd", moq: "2,000 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "jin@huafang.cn" },
  { id: "fab-4", millId: "huafang", artNumber: "HF3310", name: "Cotton Sateen", composition: "100% Cotton", weight: "210g", price: "$6.20/yd", moq: "2,000 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "jin@huafang.cn" },

  // ── Orient Textiles ────────────────────────────────────────────
  { id: "fab-5", millId: "orient", artNumber: "CT8810", name: "Cotton Twill", composition: "100% Cotton", weight: "220g", price: "$8.20/yd", moq: "300 yds", moc: "300/color", paymentTerms: "Net 30", contactEmail: "li.wei@orienttex.com" },

  // ── Youngbo ────────────────────────────────────────────────────
  { id: "fab-6", millId: "youngbo", artNumber: "PN-41555F", name: "Poly/Cotton Shell", composition: "65% Polyester 35% Cotton", weight: "130g", price: "$8.14/yd", moq: "1,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "joonho.park@youngbo.co.kr" },

  // ── Iljoong ────────────────────────────────────────────────────
  { id: "fab-7", millId: "iljoong", artNumber: "IL-TPS0475", name: "Wool/Poly/Viscose Blend", composition: "44% Poly 41% Viscose 12% Wool 3% Spandex", weight: "210g", price: "$5.95/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "sangwoo@iljoong.com" },
  { id: "fab-8", millId: "iljoong", artNumber: "IL-EJ1295", name: "Nylon/Cotton Shell", composition: "75% Nylon 25% Cotton", weight: "98g", price: "$5.45/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "sangwoo@iljoong.com" },

  // ── SUMEC ──────────────────────────────────────────────────────
  { id: "fab-9", millId: "sumec", artNumber: "FN1835", name: "Poly Lining", composition: "100% Polyester", weight: "180g", price: "$3.80/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 20/80", contactEmail: "chen.wei@sumec-textile.com" },
  { id: "fab-10", millId: "sumec", artNumber: "SMD-N25310", name: "Nylon Shell", composition: "93% Nylon 7% Polyester", weight: "60g", price: "$2.60/yd", moq: "1,000m", moc: "1,000/color", paymentTerms: "T/T 20/80", contactEmail: "chen.wei@sumec-textile.com" },
  { id: "fab-11", millId: "sumec", artNumber: "NR26091", name: "Poly Twill PD (PFC-Free WR)", composition: "100% Polyester", weight: "228g", price: "$2.80/yd", moq: "1,000m", moc: "500/color", paymentTerms: "T/T 20/80", contactEmail: "chen.wei@sumec-textile.com" },

  // ── Hongen ─────────────────────────────────────────────────────
  { id: "fab-12", millId: "hongen", artNumber: "755S-22-065", name: "Wool Herringbone", composition: "50% Wool 40% Poly 10% Other", weight: "430g", price: "$6.11/m", moq: "500m", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "zhang.li@hongen-tex.com" },

  // ── Teijin ─────────────────────────────────────────────────────
  { id: "fab-13", millId: "teijin", artNumber: "GRCT10193", name: "Polyester Shell", composition: "100% Polyester", weight: "175g", price: "$6.85/yd", moq: "500 yds", moc: "500/color", paymentTerms: "Net 60", contactEmail: "y.tanaka@teijin.com" },

  // ── Koojoo ─────────────────────────────────────────────────────
  { id: "fab-14", millId: "koojoo", artNumber: "KYD-1616TPU", name: "Poly w/ TPU Membrane", composition: "100% Polyester + TPU", weight: "148g", price: "$5.95/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "minjun@koojoo.com" },

  // ── NST ────────────────────────────────────────────────────────
  { id: "fab-15", millId: "nst", artNumber: "RT265006", name: "Poly Shell (WR, PFC-Free)", composition: "100% Polyester", weight: "150g", price: "$6.50/yd", moq: "500 yds", moc: "500/color", paymentTerms: "Net 30", contactEmail: "may.dechaves@nst-apparel.com" },
  { id: "fab-16", millId: "nst", artNumber: "BOB-ST101350", name: "Wool/Viscose Coating", composition: "50% Wool 50% Viscose", weight: "413g", price: "$9.00/yd", moq: "650 pcs", moc: "650/color", paymentTerms: "Net 30", contactEmail: "may.dechaves@nst-apparel.com" },
  { id: "fab-17", millId: "nst", artNumber: "TKC0879TD", name: "Cotton/Poly Jersey", composition: "60% Cotton 40% Polyester", weight: "145g", price: "TBD", moq: "600 pcs", moc: "600/color", paymentTerms: "Net 30", contactEmail: "may.dechaves@nst-apparel.com" },

  // ── Soktas (Turkey - shirting) ─────────────────────────────────
  { id: "fab-18", millId: "soktas", artNumber: "SK-P120", name: "Superfine Poplin", composition: "100% Cotton (100s 2-ply)", weight: "95g", price: "$8.50/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "L/C 60d", contactEmail: "emre.yilmaz@soktas.com.tr" },
  { id: "fab-19", millId: "soktas", artNumber: "SK-T200", name: "Cotton Twill Shirting", composition: "100% Cotton", weight: "115g", price: "$7.20/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "L/C 60d", contactEmail: "emre.yilmaz@soktas.com.tr" },
  { id: "fab-20", millId: "soktas", artNumber: "SK-WF80", name: "Wrinkle-Free Poplin", composition: "100% Cotton (WF finish)", weight: "105g", price: "$9.10/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "L/C 60d", contactEmail: "emre.yilmaz@soktas.com.tr" },

  // ── Bossa (Turkey - denim/twill) ───────────────────────────────
  { id: "fab-21", millId: "bossa", artNumber: "BS-D3200", name: "Stretch Denim", composition: "98% Cotton 2% Elastane", weight: "340g", price: "$5.80/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "mehmet.kaya@bossa.com.tr" },
  { id: "fab-22", millId: "bossa", artNumber: "BS-CT450", name: "Cavalry Twill", composition: "100% Cotton", weight: "280g", price: "$4.90/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "mehmet.kaya@bossa.com.tr" },
  { id: "fab-23", millId: "bossa", artNumber: "BS-D2800", name: "Rigid Denim", composition: "100% Cotton", weight: "380g", price: "$5.20/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "mehmet.kaya@bossa.com.tr" },

  // ── Calik Denim ────────────────────────────────────────────────
  { id: "fab-24", millId: "calik", artNumber: "CK-ED210", name: "E-Denim Recycled Stretch", composition: "85% Cotton (recycled) 13% Poly 2% Elastane", weight: "320g", price: "$6.40/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "L/C at sight", contactEmail: "ayse.demir@calikdenim.com" },
  { id: "fab-25", millId: "calik", artNumber: "CK-DC350", name: "Dual-Core Stretch Denim", composition: "92% Cotton 6% Poly 2% Elastane", weight: "350g", price: "$7.10/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "L/C at sight", contactEmail: "ayse.demir@calikdenim.com" },

  // ── ISKO ───────────────────────────────────────────────────────
  { id: "fab-26", millId: "isko", artNumber: "IS-R2CL", name: "R-TWO Recycled Denim", composition: "58% Cotton (recycled) 22% Poly 18% Lyocell 2% Elastane", weight: "300g", price: "$8.90/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 60", contactEmail: "baris.ozturk@isko.com.tr" },
  { id: "fab-27", millId: "isko", artNumber: "IS-PF40", name: "Performance Coolmax Denim", composition: "72% Cotton 26% Coolmax 2% Lycra", weight: "310g", price: "$9.50/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 60", contactEmail: "baris.ozturk@isko.com.tr" },

  // ── Sanko ──────────────────────────────────────────────────────
  { id: "fab-28", millId: "sanko", artNumber: "SN-OX160", name: "Oxford Cloth", composition: "100% Cotton", weight: "160g", price: "$4.50/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 50/50", contactEmail: "hakan.celik@sanko.com.tr" },
  { id: "fab-29", millId: "sanko", artNumber: "SN-CH120", name: "Chambray", composition: "100% Cotton", weight: "120g", price: "$4.20/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 50/50", contactEmail: "hakan.celik@sanko.com.tr" },
  { id: "fab-30", millId: "sanko", artNumber: "SN-YD140", name: "Yarn-Dyed Check", composition: "100% Cotton", weight: "140g", price: "$5.10/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "T/T 50/50", contactEmail: "hakan.celik@sanko.com.tr" },

  // ── Albini ─────────────────────────────────────────────────────
  { id: "fab-31", millId: "albini", artNumber: "AL-TM80", name: "Thomas Mason Poplin", composition: "100% Cotton (140s)", weight: "85g", price: "$14.50/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "m.rossi@albinigroup.com" },
  { id: "fab-32", millId: "albini", artNumber: "AL-OC100", name: "Organic Cotton Twill", composition: "100% Organic Cotton", weight: "110g", price: "$10.20/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 60", contactEmail: "m.rossi@albinigroup.com" },
  { id: "fab-33", millId: "albini", artNumber: "AL-LB130", name: "Linen Blend Shirting", composition: "55% Linen 45% Cotton", weight: "130g", price: "$12.80/yd", moq: "600 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "m.rossi@albinigroup.com" },

  // ── Canclini ───────────────────────────────────────────────────
  { id: "fab-34", millId: "canclini", artNumber: "CC-SC90", name: "Swiss Cotton Poplin", composition: "100% Cotton (Giza 87)", weight: "90g", price: "$11.50/yd", moq: "600 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "g.colombo@canclini1925.it" },
  { id: "fab-35", millId: "canclini", artNumber: "CC-2P100", name: "2-Ply Twill", composition: "100% Cotton (2-ply)", weight: "105g", price: "$10.80/yd", moq: "600 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "g.colombo@canclini1925.it" },

  // ── VBC ────────────────────────────────────────────────────────
  { id: "fab-36", millId: "vbc", artNumber: "VBC-FL260", name: "Wool Flannel", composition: "100% Wool (Super 110s)", weight: "260g", price: "$13.50/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "a.bianchi@vitalebarberiscanonico.it" },
  { id: "fab-37", millId: "vbc", artNumber: "VBC-HP280", name: "Hopsack Blazer Cloth", composition: "100% Wool", weight: "280g", price: "$12.90/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "a.bianchi@vitalebarberiscanonico.it" },

  // ── Reda ───────────────────────────────────────────────────────
  { id: "fab-38", millId: "reda", artNumber: "RD-AM220", name: "Active Merino", composition: "100% Merino Wool (machine wash)", weight: "220g", price: "$14.20/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "s.ferri@reda.it" },
  { id: "fab-39", millId: "reda", artNumber: "RD-NS240", name: "Natural Stretch Suiting", composition: "100% Wool (twist-stretch)", weight: "240g", price: "$13.80/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "s.ferri@reda.it" },

  // ── Limonta ────────────────────────────────────────────────────
  { id: "fab-40", millId: "limonta", artNumber: "LM-NR110", name: "Micro Ripstop (DWR)", composition: "100% Nylon", weight: "110g", price: "$8.50/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 30", contactEmail: "l.mazzoni@limonta.com" },
  { id: "fab-41", millId: "limonta", artNumber: "LM-NC180", name: "Nylon/Cotton Shell", composition: "60% Nylon 40% Cotton", weight: "180g", price: "$9.20/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 30", contactEmail: "l.mazzoni@limonta.com" },

  // ── Loro Piana ─────────────────────────────────────────────────
  { id: "fab-42", millId: "loropiana", artNumber: "LP-SS280", name: "Storm System Cashmere/Wool", composition: "70% Cashmere 30% Wool", weight: "280g", price: "$38.00/yd", moq: "200 yds", moc: "200/color", paymentTerms: "Net 30", contactEmail: "f.galli@loropiana.com" },

  // ── Tintex ─────────────────────────────────────────────────────
  { id: "fab-43", millId: "tintex", artNumber: "TX-OJ180", name: "Organic Pima Jersey", composition: "100% Organic Pima Cotton", weight: "180g", price: "$6.80/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 30", contactEmail: "ana.santos@tintex.pt" },
  { id: "fab-44", millId: "tintex", artNumber: "TX-FT300", name: "French Terry (Recycled Blend)", composition: "60% Cotton 40% Recycled Poly", weight: "300g", price: "$7.50/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 30", contactEmail: "ana.santos@tintex.pt" },
  { id: "fab-45", millId: "tintex", artNumber: "TX-FL220", name: "Fleece (GOTS Certified)", composition: "100% Organic Cotton", weight: "280g", price: "$7.90/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 30", contactEmail: "ana.santos@tintex.pt" },

  // ── Valérius ───────────────────────────────────────────────────
  { id: "fab-46", millId: "valerius", artNumber: "VL-PQ200", name: "Cotton Pique", composition: "100% Cotton", weight: "200g", price: "$5.40/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "pedro@valerius.pt" },
  { id: "fab-47", millId: "valerius", artNumber: "VL-JK160", name: "Long-Staple Jersey", composition: "100% Cotton (long-staple)", weight: "160g", price: "$4.80/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "pedro@valerius.pt" },

  // ── Arvind ─────────────────────────────────────────────────────
  { id: "fab-48", millId: "arvind", artNumber: "AV-CP100", name: "Cotton Poplin", composition: "100% Cotton (60s compact)", weight: "100g", price: "$3.40/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "L/C 60d", contactEmail: "rajesh.patel@arvind.in" },
  { id: "fab-49", millId: "arvind", artNumber: "AV-OX150", name: "Oxford Shirting", composition: "100% Cotton", weight: "150g", price: "$3.80/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "L/C 60d", contactEmail: "rajesh.patel@arvind.in" },
  { id: "fab-50", millId: "arvind", artNumber: "AV-SD300", name: "Sustainable Denim (BCI)", composition: "100% BCI Cotton", weight: "340g", price: "$4.50/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "L/C 60d", contactEmail: "rajesh.patel@arvind.in" },

  // ── Vardhman ───────────────────────────────────────────────────
  { id: "fab-51", millId: "vardhman", artNumber: "VD-YD130", name: "Yarn-Dyed Check", composition: "100% Cotton", weight: "130g", price: "$4.10/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "L/C at sight", contactEmail: "amit.sharma@vardhman.com" },
  { id: "fab-52", millId: "vardhman", artNumber: "VD-WP120", name: "Yarn-Dyed Windowpane", composition: "100% Cotton", weight: "120g", price: "$4.30/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "L/C at sight", contactEmail: "amit.sharma@vardhman.com" },

  // ── Sapphire ───────────────────────────────────────────────────
  { id: "fab-53", millId: "sapphire", artNumber: "SP-ST250", name: "Stretch Chino Twill", composition: "98% Cotton 2% Elastane", weight: "250g", price: "$4.80/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "hassan.ali@sapphiretextile.com" },
  { id: "fab-54", millId: "sapphire", artNumber: "SP-CT280", name: "Cotton Twill (Heavy)", composition: "100% Cotton", weight: "280g", price: "$4.40/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "hassan.ali@sapphiretextile.com" },

  // ── Artistic ───────────────────────────────────────────────────
  { id: "fab-55", millId: "artistic", artNumber: "AF-CP90", name: "Compact Cotton Poplin", composition: "100% Cotton (60s compact)", weight: "90g", price: "$3.20/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "L/C 30d", contactEmail: "farhan@artisticfabric.com" },
  { id: "fab-56", millId: "artistic", artNumber: "AF-VL80", name: "Cotton Voile", composition: "100% Cotton", weight: "80g", price: "$2.90/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "L/C 30d", contactEmail: "farhan@artisticfabric.com" },

  // ── Lutai ──────────────────────────────────────────────────────
  { id: "fab-57", millId: "lutai", artNumber: "LT-OX155", name: "Oxford", composition: "100% Cotton", weight: "155g", price: "$3.60/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "T/T 30d", contactEmail: "xiaoming.wang@lutai.com" },
  { id: "fab-58", millId: "lutai", artNumber: "LT-TW110", name: "Cotton Twill Shirting", composition: "100% Cotton", weight: "110g", price: "$3.40/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "T/T 30d", contactEmail: "xiaoming.wang@lutai.com" },
  { id: "fab-59", millId: "lutai", artNumber: "LT-WF100", name: "Wrinkle-Free Broadcloth", composition: "100% Cotton (WF treated)", weight: "100g", price: "$4.20/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "xiaoming.wang@lutai.com" },

  // ── Esquel ─────────────────────────────────────────────────────
  { id: "fab-60", millId: "esquel", artNumber: "EQ-SP95", name: "Supima Cotton Poplin", composition: "100% Supima Cotton", weight: "95g", price: "$6.50/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "Net 30", contactEmail: "grace.chen@esquel.com" },
  { id: "fab-61", millId: "esquel", artNumber: "EQ-NI100", name: "Non-Iron Twill", composition: "100% Cotton (non-iron)", weight: "105g", price: "$7.20/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "Net 30", contactEmail: "grace.chen@esquel.com" },

  // ── Shaoxing Keqiao ────────────────────────────────────────────
  { id: "fab-62", millId: "keqiao", artNumber: "KQ-PL150", name: "Poly Lining (stock)", composition: "100% Polyester", weight: "65g", price: "$1.80/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "zhao.jie@keqiaotex.cn" },
  { id: "fab-63", millId: "keqiao", artNumber: "KQ-DW130", name: "DWR Shell Fabric", composition: "100% Polyester (DWR)", weight: "130g", price: "$3.20/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "zhao.jie@keqiaotex.cn" },

  // ── Wujiang Shenda ─────────────────────────────────────────────
  { id: "fab-64", millId: "shenda", artNumber: "SD-CU60", name: "Cupro Lining", composition: "100% Cupro", weight: "60g", price: "$2.40/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T advance", contactEmail: "sun.mei@shenda.cn" },
  { id: "fab-65", millId: "shenda", artNumber: "SD-BM70", name: "Bemberg Lining", composition: "100% Bemberg", weight: "70g", price: "$3.10/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T advance", contactEmail: "sun.mei@shenda.cn" },

  // ── Jiangyin Chunlan ───────────────────────────────────────────
  { id: "fab-66", millId: "chunlan", artNumber: "CL-BF180", name: "Brushed Flannel (Solid)", composition: "100% Cotton", weight: "180g", price: "$3.90/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "li.hong@chunlan-tex.cn" },
  { id: "fab-67", millId: "chunlan", artNumber: "CL-PF220", name: "Plaid Flannel", composition: "100% Cotton", weight: "220g", price: "$4.50/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "li.hong@chunlan-tex.cn" },

  // ── Nantong Cellulose ──────────────────────────────────────────
  { id: "fab-68", millId: "cellulose", artNumber: "NC-MC160", name: "Modal/Cotton Jersey", composition: "50% Modal 50% Cotton", weight: "160g", price: "$5.20/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "yang.wei@ntcellulose.cn" },
  { id: "fab-69", millId: "cellulose", artNumber: "NC-TC140", name: "Tencel/Cotton Shirting", composition: "55% Tencel 45% Cotton", weight: "140g", price: "$5.80/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 50/50", contactEmail: "yang.wei@ntcellulose.cn" },

  // ── Hyosung ────────────────────────────────────────────────────
  { id: "fab-70", millId: "hyosung", artNumber: "HS-BS240", name: "Bi-Stretch Trouser", composition: "68% Cotton 28% Poly 4% Creora", weight: "240g", price: "$6.90/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 45", contactEmail: "soojin.choi@hyosung.com" },
  { id: "fab-71", millId: "hyosung", artNumber: "HS-MW180", name: "Moisture-Wicking Jersey", composition: "92% Poly 8% Elastane", weight: "180g", price: "$5.50/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 45", contactEmail: "soojin.choi@hyosung.com" },

  // ── TK Chemical ────────────────────────────────────────────────
  { id: "fab-72", millId: "tkchemical", artNumber: "TK-RS70", name: "Nylon Ripstop (DWR)", composition: "100% Nylon (recycled)", weight: "70g", price: "$5.60/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "eunji.park@tkchemical.co.kr" },
  { id: "fab-73", millId: "tkchemical", artNumber: "TK-TW120", name: "Technical Woven Shell", composition: "100% Nylon", weight: "120g", price: "$6.20/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "eunji.park@tkchemical.co.kr" },

  // ── Kurabo ─────────────────────────────────────────────────────
  { id: "fab-74", millId: "kurabo", artNumber: "KB-SV12", name: "Selvedge Denim (12oz)", composition: "100% Cotton (rope-dyed)", weight: "340g", price: "$11.50/yd", moq: "300 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "k.sato@kurabo.co.jp" },
  { id: "fab-75", millId: "kurabo", artNumber: "KB-SV14", name: "Selvedge Denim (14oz)", composition: "100% Cotton (rope-dyed)", weight: "400g", price: "$12.80/yd", moq: "300 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "k.sato@kurabo.co.jp" },

  // ── Toray ──────────────────────────────────────────────────────
  { id: "fab-76", millId: "toray", artNumber: "TR-DM25", name: "Dermizax 2.5L Shell", composition: "100% Nylon (Dermizax membrane)", weight: "135g", price: "$15.00/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "h.nakamura@toray.co.jp" },
  { id: "fab-77", millId: "toray", artNumber: "TR-DM3L", name: "Dermizax 3L Shell", composition: "100% Nylon (3-layer)", weight: "160g", price: "$18.50/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "h.nakamura@toray.co.jp" },

  // ── Sritex ─────────────────────────────────────────────────────
  { id: "fab-78", millId: "sritex", artNumber: "SR-HT300", name: "Heavy Cotton Twill", composition: "100% Cotton", weight: "300g", price: "$3.50/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "T/T 30d", contactEmail: "budi.santoso@sritex.co.id" },
  { id: "fab-79", millId: "sritex", artNumber: "SR-CV350", name: "Cotton Canvas", composition: "100% Cotton", weight: "350g", price: "$3.80/yd", moq: "3,000 yds", moc: "1,500/color", paymentTerms: "T/T 30d", contactEmail: "budi.santoso@sritex.co.id" },

  // ── Thien Nam ──────────────────────────────────────────────────
  { id: "fab-80", millId: "thiennam", artNumber: "TN-CJ160", name: "Cotton Jersey", composition: "100% Cotton", weight: "160g", price: "$3.50/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "T/T 30d", contactEmail: "lan.nguyen@thiennam.com.vn" },
  { id: "fab-81", millId: "thiennam", artNumber: "TN-PQ190", name: "Cotton Pique (Polo)", composition: "100% Cotton", weight: "190g", price: "$4.20/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "T/T 30d", contactEmail: "lan.nguyen@thiennam.com.vn" },

  // ── Halley Stevensons ──────────────────────────────────────────
  { id: "fab-82", millId: "halley", artNumber: "HS-WX8", name: "British Millerain Waxed Cotton (8oz)", composition: "100% Cotton (waxed)", weight: "270g", price: "$12.50/yd", moq: "300 yds", moc: "300/color", paymentTerms: "Net 30", contactEmail: "j.macleod@halleygroup.com" },

  // ── Additional fabrics for variety (second articles from existing mills) ──
  { id: "fab-83", millId: "youngbo", artNumber: "PN-42180S", name: "Stretch Poly/Cotton Shell", composition: "63% Polyester 34% Cotton 3% Spandex", weight: "145g", price: "$9.20/yd", moq: "1,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "joonho.park@youngbo.co.kr" },
  { id: "fab-84", millId: "hongen", artNumber: "755S-24-090", name: "Wool/Poly Plaid", composition: "55% Wool 35% Poly 10% Other", weight: "380g", price: "$7.20/m", moq: "500m", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "zhang.li@hongen-tex.com" },
  { id: "fab-85", millId: "teijin", artNumber: "GRCT10250", name: "Recycled Poly Shell", composition: "100% Recycled Polyester", weight: "150g", price: "$7.40/yd", moq: "500 yds", moc: "500/color", paymentTerms: "Net 60", contactEmail: "y.tanaka@teijin.com" },
  { id: "fab-86", millId: "soktas", artNumber: "SK-LN150", name: "Linen Shirting", composition: "100% Linen", weight: "150g", price: "$9.80/yd", moq: "800 yds", moc: "400/color", paymentTerms: "L/C 60d", contactEmail: "emre.yilmaz@soktas.com.tr" },
  { id: "fab-87", millId: "albini", artNumber: "AL-FL160", name: "Brushed Flannel Shirting", composition: "100% Cotton", weight: "160g", price: "$11.20/yd", moq: "600 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "m.rossi@albinigroup.com" },
  { id: "fab-88", millId: "arvind", artNumber: "AV-LN120", name: "Linen/Cotton Blend", composition: "55% Linen 45% Cotton", weight: "120g", price: "$4.80/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "L/C 60d", contactEmail: "rajesh.patel@arvind.in" },
  { id: "fab-89", millId: "sapphire", artNumber: "SP-BD260", name: "Bedford Cord", composition: "100% Cotton", weight: "260g", price: "$4.60/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "hassan.ali@sapphiretextile.com" },
  { id: "fab-90", millId: "lutai", artNumber: "LT-DB140", name: "Dobby Shirting", composition: "100% Cotton", weight: "140g", price: "$4.00/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "xiaoming.wang@lutai.com" },
  { id: "fab-91", millId: "bossa", artNumber: "BS-ST260", name: "Stretch Trouser Twill", composition: "97% Cotton 3% Elastane", weight: "260g", price: "$5.40/yd", moq: "2,000 yds", moc: "1,000/color", paymentTerms: "T/T 30d", contactEmail: "mehmet.kaya@bossa.com.tr" },
  { id: "fab-92", millId: "tintex", artNumber: "TX-WF250", name: "Waffle Knit", composition: "100% Organic Cotton", weight: "250g", price: "$6.50/yd", moq: "800 yds", moc: "400/color", paymentTerms: "Net 30", contactEmail: "ana.santos@tintex.pt" },
  { id: "fab-93", millId: "hyosung", artNumber: "HS-PF200", name: "Performance Fleece", composition: "85% Poly 15% Elastane", weight: "260g", price: "$6.20/yd", moq: "1,000 yds", moc: "500/color", paymentTerms: "Net 45", contactEmail: "soojin.choi@hyosung.com" },
  { id: "fab-94", millId: "vbc", artNumber: "VBC-TW300", name: "Wool Tweed", composition: "85% Wool 15% Silk", weight: "300g", price: "$14.80/yd", moq: "400 yds", moc: "200/color", paymentTerms: "Net 60", contactEmail: "a.bianchi@vitalebarberiscanonico.it" },
  { id: "fab-95", millId: "canclini", artNumber: "CC-JQ105", name: "Jacquard Shirting", composition: "100% Cotton", weight: "105g", price: "$12.40/yd", moq: "500 yds", moc: "300/color", paymentTerms: "Net 60", contactEmail: "g.colombo@canclini1925.it" },
  { id: "fab-96", millId: "sanko", artNumber: "SN-FL170", name: "Cotton Flannel", composition: "100% Cotton", weight: "170g", price: "$4.80/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "T/T 50/50", contactEmail: "hakan.celik@sanko.com.tr" },
  { id: "fab-97", millId: "limonta", artNumber: "LM-WX200", name: "Waxed Nylon/Cotton", composition: "50% Nylon 50% Cotton (waxed)", weight: "200g", price: "$10.50/yd", moq: "600 yds", moc: "300/color", paymentTerms: "Net 30", contactEmail: "l.mazzoni@limonta.com" },
  { id: "fab-98", millId: "thiennam", artNumber: "TN-FT280", name: "French Terry", composition: "80% Cotton 20% Polyester", weight: "280g", price: "$4.50/yd", moq: "1,500 yds", moc: "750/color", paymentTerms: "T/T 30d", contactEmail: "lan.nguyen@thiennam.com.vn" },
  { id: "fab-99", millId: "esquel", artNumber: "EQ-ST110", name: "Stretch Poplin", composition: "97% Cotton 3% Elastane", weight: "110g", price: "$7.80/yd", moq: "1,200 yds", moc: "600/color", paymentTerms: "Net 30", contactEmail: "grace.chen@esquel.com" },
  { id: "fab-100", millId: "koojoo", artNumber: "KYD-2020S", name: "Stretch Poly Shell", composition: "90% Polyester 10% Spandex", weight: "160g", price: "$6.40/yd", moq: "500 yds", moc: "500/color", paymentTerms: "T/T 30d", contactEmail: "minjun@koojoo.com" },
];
