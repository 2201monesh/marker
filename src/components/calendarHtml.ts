// Sourcing calendar Gantt chart — raw HTML + embedded script
// Kept in a .ts file (not .tsx) to avoid JSX parsing of the template literal
export const CALENDAR_HTML = `<style>
  * { box-sizing: border-box; margin: 0; }
  .wf { padding: 0.5rem 0; font-family: var(--font-sans); }
  .header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
  .header h2 { font-size: 16px; font-weight: 500; color: var(--color-text-primary); }
  .stat { font-size: 13px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 8px; }
  .stat-bar { width: 90px; height: 5px; border-radius: 3px; background: var(--color-border-tertiary); overflow: hidden; }
  .stat-fill { height: 100%; border-radius: 3px; background: var(--color-text-info); }
  .metrics { display: flex; gap: 12px; margin-bottom: 12px; }
  .met { padding: 8px 14px; border-radius: var(--border-radius-md); background: var(--color-background-secondary); display: flex; align-items: center; gap: 8px; }
  .met .mn { font-size: 20px; font-weight: 500; min-width: 24px; }
  .met .ml { font-size: 11px; color: var(--color-text-secondary); line-height: 1.3; }
  .met.ma .mn { color: var(--color-text-info); }
  .met.mh .mn { color: var(--color-text-warning); }
  .controls { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .btn { padding: 6px 16px; border-radius: var(--border-radius-md); font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
  .btn:hover { opacity: 0.85; }
  .btn:disabled { opacity: 0.35; cursor: default; }
  .btn1 { background: var(--color-text-info); color: #fff; }
  .btn2 { background: var(--color-background-secondary); color: var(--color-text-secondary); border: 0.5px solid var(--color-border-secondary); }
  .sl { font-size: 11px; color: var(--color-text-tertiary); }
  .sw { overflow-x: auto; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); }
  .board { position: relative; }
  .phase-row { display: flex; height: 26px; border-bottom: 0.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); }
  .phase-row .hs { width: 100px; flex-shrink: 0; border-right: 0.5px solid var(--color-border-tertiary); position: sticky; left: 0; z-index: 2; background: var(--color-background-secondary); }
  .phase-row .pt { flex: 1; position: relative; }
  .plb { position: absolute; top: 0; height: 100%; display: flex; align-items: center; padding-left: 8px; font-size: 10px; font-weight: 500; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.4px; }
  .plb:not(:first-child) { border-left: 0.5px dashed var(--color-border-secondary); }
  .lane { display: flex; align-items: stretch; min-height: 88px; border-bottom: 0.5px solid var(--color-border-tertiary); }
  .lane:last-child { border-bottom: none; }
  .lh { width: 100px; flex-shrink: 0; display: flex; align-items: center; gap: 7px; padding: 8px 10px; border-right: 0.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); position: sticky; left: 0; z-index: 2; }
  .lh .li { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--color-background-warning); }
  .lh .li svg { width: 12px; height: 12px; }
  .lh .ln { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
  .lt { flex: 1; position: relative; min-height: 88px; }
  .c { position: absolute; border-radius: var(--border-radius-md); padding: 5px 7px; font-size: 10px; line-height: 1.2; display: flex; flex-direction: column; gap: 2px; transition: opacity 0.4s, box-shadow 0.4s, background 0.3s, border-color 0.3s; overflow: hidden; background: #FFFBF5; border: 1px solid #E8DFD0; }
  .c .ctp { display: flex; align-items: center; gap: 5px; }
  .c .ci { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
  .c .ci.hi { background: #D4A574; }
  .c .ci.hi img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
  .c .ci.ai { background: var(--color-text-info); }
  .c .ci svg { width: 12px; height: 12px; }
  .c .cw { font-size: 9px; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
  .c .cn { font-size: 10px; font-weight: 500; color: var(--color-text-primary); }
  .c .cd { font-size: 9px; color: var(--color-text-tertiary); display: none; }
  .c .cwait { display: none; font-size: 9px; color: var(--color-text-warning); font-weight: 500; }
  .c .ck { display: none; position: absolute; top: 3px; right: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-background-success); align-items: center; justify-content: center; }
  .c .ck svg { width: 9px; height: 9px; }
  .c.is-agent { background: #E8F5EC; border: 1.5px solid #A8D5BA; border-left: 4px solid var(--color-text-info); }
  .c.is-agent .cw { color: var(--color-text-info); font-weight: 700; }
  .c.waiting { opacity: 0.18; }
  @keyframes ap { 0%,100%{box-shadow:0 0 0 0 transparent} 50%{box-shadow:0 0 0 4px rgba(58,125,86,0.25)} }
  @keyframes hp { 0%,100%{box-shadow:0 0 0 0 transparent} 50%{box-shadow:0 0 0 4px rgba(184,134,11,0.25)} }
  @keyframes bk { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .c.act-a { animation: ap 1.5s ease-in-out infinite; border-color: var(--color-border-info); opacity: 1; }
  .c.act-h { animation: hp 2s ease-in-out infinite; border-color: var(--color-border-warning); opacity: 1; }
  .c.act-h .cwait { display: block; animation: bk 1.5s ease-in-out infinite; }
  .c.pend { opacity: 1; border-color: var(--color-border-warning); }
  .c.pend .cwait { display: block; animation: bk 1.5s ease-in-out infinite; }
  .c.done { opacity: 1; background: var(--color-background-secondary); }
  .c.done.is-agent { background: #E8F5EC; }
  .c.done .ck { display: flex; }
  .c.done .cn { color: var(--color-text-secondary); }
  .c.done .cd { display: block; }
  .cursor { position: absolute; top: 26px; width: 2px; background: var(--color-text-info); opacity: 0.4; pointer-events: none; transition: left 0.5s ease; z-index: 5; border-radius: 1px; display: none; }
  .feed { margin-top: 10px; border-top: 0.5px solid var(--color-border-tertiary); padding-top: 8px; overflow-y: auto; }
  .ftitle { font-size: 11px; color: var(--color-text-tertiary); margin-bottom: 4px; font-weight: 500; }
  .fi { display: flex; align-items: flex-start; gap: 6px; padding: 4px 0; font-size: 11px; color: var(--color-text-secondary); opacity: 0; transform: translateY(4px); transition: all 0.3s ease; line-height: 1.4; }
  .fi.v { opacity: 1; transform: translateY(0); }
  .fi .fic { width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .fi .fic.ag { background: var(--color-background-info); }
  .fi .fic.hu { background: var(--color-background-warning); }
  .fi .fic.tr { background: none; border: 1.5px solid var(--color-text-tertiary); }
  .fi .fic.sy { background: var(--color-background-success); }
  .fi .fic svg { width: 8px; height: 8px; }
  .fi .dur { display: inline-block; font-size: 9px; padding: 1px 5px; border-radius: 10px; margin-left: 3px; vertical-align: middle; }
  .fi .dur.fast { background: var(--color-background-info); color: var(--color-text-info); }
  .fi .dur.slow { background: var(--color-background-warning); color: var(--color-text-warning); }
</style>
<div class="wf">
  <div class="header">
    <h2>SS26 wovens &mdash; sourcing calendar</h2>
  </div>
  <div class="metrics">
    <div class="met ma"><div class="mn" id="an">0</div><div class="ml">auto<br>steps</div></div>
    <div class="met mh"><div class="mn" id="hn">0</div><div class="ml">human<br>steps</div></div>
  </div>
  <div class="controls">
    <button class="btn btn1" id="pbtn">Run simulation</button>
    <span class="sl">Speed</span>
    <input type="range" min="1" max="3" value="2" step="1" id="spd" style="width:60px">
    <span class="sl" id="spl">1x</span>
    <button class="btn btn2" id="rbtn" style="display:none">Reset</button>
  </div>
  <div class="sw"><div class="board" id="brd"></div></div>
  <div class="stat" style="margin-top: 8px;">15 of 35 steps automated (43%)<div class="stat-bar"><div class="stat-fill" style="width:43%"></div></div></div>
  <div class="feed"><div class="ftitle">Activity log</div><div id="fl"></div></div>
</div>
<script>
var U = 105;
var PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>';
var ROBOT = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="12" y1="2" x2="12" y2="5" stroke-linecap="round"/><circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/><rect x="4" y="5" width="16" height="14" rx="3"/><rect x="7" y="9" width="3" height="2" rx="0.5" fill="currentColor" stroke="none"/><rect x="14" y="9" width="3" height="2" rx="0.5" fill="currentColor" stroke="none"/><path d="M9 14h6" stroke-linecap="round"/><line x1="1" y1="10" x2="4" y2="10" stroke-linecap="round"/><line x1="20" y1="10" x2="23" y2="10" stroke-linecap="round"/></svg>';
var AVATARS = {
  PD: ["/avatars/sarah.png","/avatars/david.png"],
  Design: ["/avatars/priya.png","/avatars/james.png"],
  TD: ["/avatars/maria.png"],
  Merch: ["/avatars/emily.png"],
  Prod: ["/avatars/david.png"]
};
var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="5 12 10 17 19 7"/></svg>';
var TRIGGER = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
var LANES = ["PD","Design","TD","Merch","Prod"];

function svgI(svg,stroke,fill) {
  return svg.replace('stroke-width', 'stroke="'+stroke+'" fill="'+(fill||'none')+'" stroke-width');
}
var PI = svgI(PERSON,'var(--color-text-warning)');
var RI = svgI(ROBOT,'var(--color-text-info)','var(--color-text-info)');
var CI = svgI(CHECK,'var(--color-text-success)');
var TI = svgI(TRIGGER,'var(--color-text-tertiary)');
var RI_SM = svgI(ROBOT,'var(--color-text-info)','var(--color-text-info)');
var PI_SM = svgI(PERSON,'var(--color-text-warning)');
var TI_SM = svgI(TRIGGER,'var(--color-text-tertiary)');
var CI_SM = svgI(CHECK,'var(--color-text-success)');

var S = [
  // Step 1: PD
  {id:"p0",ln:"PD",c:0,w:0.9,t:"Collect fabric data sheets",a:1,dur:"5 min",
   logs:[
     {type:"tr",msg:"Season kickoff triggers vendor portal opening"},
     {type:"ag",msg:"Agent opens vendor portal for 8 mills to upload fabric data sheets across 127 woven styles",dur:"5 min"},
   ]},
  // Step 2: PD + Design
  {id:"p1",ln:"PD",c:1,w:0.9,t:"Review fabric details",a:0,dur:"3 days",
   logs:[
     {type:"hu",msg:"PD reviews uploaded fabric specs, hand-feel, lead times, and MOQs for 127 styles",dur:"3 days"},
     {type:"hu",msg:"PD confirms fabric selections and flags 12 styles needing alternate mill options"},
   ]},
  {id:"d0",ln:"Design",c:1,w:0.9,t:"Design direction",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"Design captures trend and R&D images, sets color palette and concept direction for the season",dur:"2 days"},
   ]},
  // Step 3: PD
  {id:"p2",ln:"PD",c:2,w:0.9,t:"Collect trim details",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"PD collects trim options (buttons, labels, interlining) from approved suppliers for 127 styles",dur:"2 days"},
   ]},
  // Step 4: Design
  {id:"d1",ln:"Design",c:3,w:0.9,t:"Assign style + body numbers",a:1,dur:"2 min",
   logs:[
     {type:"tr",msg:"Design direction complete triggers style number assignment"},
     {type:"ag",msg:"Agent auto-assigns style numbers and body codes for 127 styles from template library",dur:"2 min"},
     {type:"ag",msg:"Body codes linked to BP \\u2014 no manual SKU mapping needed"},
   ]},
  // Step 5: Design + TD
  {id:"d2",ln:"Design",c:4,w:0.9,t:"Create front + back sketches",a:0,dur:"3 days",
   logs:[
     {type:"hu",msg:"Design creates production-ready front and back sketches with construction details for 94 new styles",dur:"3 days"},
     {type:"hu",msg:"33 carryover styles pull existing sketches from library"},
   ]},
  {id:"t0",ln:"TD",c:4,w:0.9,t:"Load spec templates",a:1,dur:"1 min",
   logs:[
     {type:"tr",msg:"Style numbers assigned triggers spec template population"},
     {type:"ag",msg:"Agent pulls base spec templates from block library for all 127 styles (slim, regular, tall)",dur:"1 min"},
   ]},
  // Step 6: Design
  {id:"d3",ln:"Design",c:5,w:0.9,t:"Build bill of materials",a:0,dur:"3 days",
   logs:[
     {type:"hu",msg:"Design builds BOM for each style, breaking out fabric qualities by vendor and mill allocation",dur:"3 days"},
   ]},
  // Step 7: TD + Merch
  {id:"t1",ln:"TD",c:6,w:0.9,t:"Build initial spec package",a:0,dur:"5 days",
   logs:[
     {type:"hu",msg:"TD builds spec packages for 127 styles: measurements, tech diagrams, interlining placement, graded size specs",dur:"5 days"},
     {type:"hu",msg:"New bodies require full grade rules; established bodies use existing factory specs"},
   ]},
  {id:"m0",ln:"Merch",c:6,w:0.9,t:"Seasonal buy plan",a:0,dur:"4 days",
   logs:[
     {type:"hu",msg:"Merch builds seasonal buy plan: style count targets, price architecture, margin requirements across 127 woven styles",dur:"4 days"},
   ]},
  // Step 8: PD + TD
  {id:"p3",ln:"PD",c:7,w:0.9,t:"Request vendor costing",a:1,dur:"3 min",
   logs:[
     {type:"tr",msg:"Fabric selections confirmed triggers costing outreach"},
     {type:"ag",msg:"Agent sends costing request emails to 8 mills with fabric specs, target quantities, and costing template for 127 styles",dur:"3 min"},
     {type:"ag",msg:"Auto-reminders scheduled at 48h and 1 week if no response"},
   ]},
  {id:"t1b",ln:"TD",c:7,w:0.9,t:"Distribute initial tech pack",a:1,dur:"5 min",
   logs:[
     {type:"tr",msg:"Spec package complete triggers tech pack compilation"},
     {type:"ag",msg:"Agent compiles tech pack from spec, sketches, and BOM for 127 styles and distributes to sourcing agent and all assigned vendors",dur:"5 min"},
     {type:"ag",msg:"Previously required ~6 hours of manual PDF assembly and individual vendor emails"},
   ]},
  // Step 9: TD
  {id:"t2",ln:"TD",c:8,w:0.9,t:"Evaluate proto fit",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"TD evaluates fit, construction accuracy, and measurements against graded spec for selected styles",dur:"2 days"},
   ]},
  // Step 10: PD
  {id:"p4",ln:"PD",c:9,w:0.9,t:"Review vendor pricing",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"PD reviews vendor pricing in tracking view, flags outliers, negotiates with 3 mills on margin targets",dur:"2 days"},
   ]},
  // Step 11: PD + Design + TD + Merch (cross-team proto review)
  {id:"p5",ln:"PD",c:10,w:0.9,t:"Cross-team proto review",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"PD, Design, TD, and Merch evaluate physical proto samples \\u2014 currently called Handover meeting",dur:"2 days"},
     {type:"hu",msg:"Merch line plans ready; Merch reviews, edits, and selects styles"},
   ]},
  {id:"d4",ln:"Design",c:10,w:0.9,t:"Proto review (design)",a:0,dur:"2 days",logs:[]},
  {id:"t2b",ln:"TD",c:10,w:0.9,t:"Proto review (TD)",a:0,dur:"2 days",logs:[]},
  {id:"m1",ln:"Merch",c:10,w:0.9,t:"Proto review (merch)",a:0,dur:"2 days",logs:[]},
  // Step 12: Merch
  {id:"m2",ln:"Merch",c:11,w:0.9,t:"Final style sign-off",a:0,dur:"1 day",
   logs:[
     {type:"hu",msg:"Merch confirms final selection of 83 styles. Approved styles formally handed off to Production.",dur:"1 day"},
   ]},
  // Step 13: PD + Merch
  {id:"p6",ln:"PD",c:12,w:0.9,t:"Enter buy quantities",a:0,dur:"1 day",
   logs:[
     {type:"hu",msg:"PD enters finalized buy quantities from Merch into the business platform for 83 selected styles",dur:"1 day"},
   ]},
  {id:"m3",ln:"Merch",c:12,w:0.9,t:"Deliver final buy sheet",a:0,dur:"1 day",
   logs:[
     {type:"hu",msg:"Merch delivers final buy sheet with quantities by style, colorway, and size breakdown",dur:"1 day"},
   ]},
  // Step 14: PD + Design + TD
  {id:"p7",ln:"PD",c:13,w:0.9,t:"Send formal orders to factories",a:1,dur:"10 min",
   logs:[
     {type:"tr",msg:"Buy sheet entered triggers factory order generation"},
     {type:"ag",msg:"Agent auto-generates formal orders and style breakdowns for 83 styles across 6 factories",dur:"10 min"},
     {type:"ag",msg:"Previously required Netsuite + Excel PLUG-in + separate ID file \\u2014 took production team ~2 days"},
   ]},
  {id:"d5",ln:"Design",c:13,w:0.9,t:"Sync design to prod TP",a:1,dur:"8 min",
   logs:[
     {type:"tr",msg:"Proto sign-off triggers production tech pack update"},
     {type:"ag",msg:"Agent syncs all design changes from proto review to production tech pack for 83 styles \\u2014 sketches, artwork, BOM updates",dur:"8 min"},
     {type:"ag",msg:"No manual re-entry across systems needed"},
   ]},
  {id:"t3",ln:"TD",c:13,w:0.9,t:"Sync specs to prod TP",a:1,dur:"8 min",
   logs:[
     {type:"tr",msg:"Proto sign-off triggers spec sync"},
     {type:"ag",msg:"Agent pushes TD spec revisions and measurement corrections to production tech pack for 83 styles",dur:"8 min"},
     {type:"ag",msg:"Grade rule updates propagated to all sizes automatically"},
   ]},
  // Step 15: Design
  {id:"d6",ln:"Design",c:14,w:0.9,t:"Finalize production sketches",a:0,dur:"2 days",
   logs:[
     {type:"hu",msg:"Design finalizes production sketches incorporating proto review corrections for 83 styles",dur:"2 days"},
   ]},
  // Step 16: Design
  {id:"d7",ln:"Design",c:15,w:0.9,t:"Lock production BOM",a:0,dur:"1 day",
   logs:[
     {type:"hu",msg:"Design locks production BOM with confirmed fabric and trim selections for 83 styles",dur:"1 day"},
   ]},
  // Step 17: TD
  {id:"t4",ln:"TD",c:16,w:0.9,t:"Finalize production spec",a:0,dur:"4 days",
   logs:[
     {type:"hu",msg:"TD finalizes production spec with all proto corrections: measurements, tech diagrams, interlining, grade rules for 83 styles",dur:"4 days"},
   ]},
  // Step 18: PD + TD
  {id:"p8",ln:"PD",c:17,w:0.9,t:"Request production costing",a:1,dur:"3 min",
   logs:[
     {type:"tr",msg:"Production tech pack sent triggers costing request"},
     {type:"ag",msg:"Agent sends production costing requests to 6 factories with finalized specs and quantities for 83 styles",dur:"3 min"},
   ]},
  {id:"t5",ln:"TD",c:17,w:0.9,t:"Distribute production tech pack",a:1,dur:"5 min",
   logs:[
     {type:"tr",msg:"Spec finalized triggers final tech pack distribution"},
     {type:"ag",msg:"Agent compiles and distributes final production tech pack to all 6 factories and sourcing agents for 83 styles",dur:"5 min"},
   ]},
  // Step 19: PD + TD
  {id:"p9",ln:"PD",c:18,w:0.9,t:"Collect vendor pricing",a:1,dur:"3 days",
   logs:[
     {type:"tr",msg:"Costing request triggers vendor portal collection"},
     {type:"ag",msg:"Vendors enter production pricing directly in portal for 83 styles. Auto-reminders sent at 48h.",dur:"3 days"},
     {type:"ag",msg:"6 of 6 factories responded within window \\u2014 no manual email follow-up needed"},
   ]},
  {id:"t6",ln:"TD",c:18,w:0.9,t:"Request FIT samples",a:1,dur:"2 min",
   logs:[
     {type:"tr",msg:"PO confirmed triggers FIT sample request"},
     {type:"ag",msg:"Agent sends FIT sample requests to 6 factories with measurement requirements and ship-to for 83 styles",dur:"2 min"},
   ]},
  // Step 20: TD
  {id:"t7",ln:"TD",c:19,w:0.9,t:"Request PPS samples",a:1,dur:"2 min",
   logs:[
     {type:"tr",msg:"FIT approval triggers PPS request"},
     {type:"ag",msg:"Agent sends pre-production sample requests to 6 factories with final approved spec for 83 styles",dur:"2 min"},
   ]},
  // Step 21: PD + TD + Prod
  {id:"p10",ln:"PD",c:20,w:0.9,t:"Confirm final costing",a:0,dur:"1 day",
   logs:[
     {type:"hu",msg:"PD reviews final vendor pricing across all 83 styles and confirms in costing view",dur:"1 day"},
   ]},
  {id:"t8",ln:"TD",c:20,w:0.9,t:"Evaluate FIT + PPS samples",a:0,dur:"5 days",
   logs:[
     {type:"hu",msg:"TD evaluates FIT and PPS samples against approved spec \\u2014 measurement checks, construction review across 83 styles",dur:"5 days"},
     {type:"hu",msg:"Approved for bulk production"},
   ]},
  {id:"e0",ln:"Prod",c:20,w:0.9,t:"Generate purchase orders",a:1,dur:"15 min",
   logs:[
     {type:"tr",msg:"Vendor selection finalized triggers PO generation"},
     {type:"ag",msg:"Agent auto-generates purchase orders for 83 styles across 6 factories and syncs to Netsuite",dur:"15 min"},
     {type:"ag",msg:"Previously required 3 different systems + 3 different files \\u2014 took production team ~2 days"},
   ]},
  // Step 22: Prod
  {id:"e1",ln:"Prod",c:21,w:0.9,t:"Track production (WIP)",a:1,dur:"ongoing",
   logs:[
     {type:"tr",msg:"PO issued triggers WIP tracking activation"},
     {type:"ag",msg:"Agent activates work-in-progress tracking for 83 styles. Auto-pings 6 factories weekly for status updates."},
     {type:"ag",msg:"Flags any delivery delays >5 days. Replaces email-based WIP process."},
   ]},
];

var PHASES = [
  {c:0,t:"Development"},{c:6,t:"Costing + spec"},{c:9,t:"Proto review"},
  {c:12,t:"Buy + updates"},{c:14,t:"Prod spec + cost"},{c:18,t:"FIT / PPS"},{c:20,t:"Production"},
];

var SM = 1, TT = [], RN = false, aC = 0, hC = 0;

var _avatarIdx = {};
function mi(isA, lane) {
  if (isA) {
    return svgI(ROBOT,'#fff','#fff');
  }
  var avatars = AVATARS[lane] || ["/avatars/sarah.png"];
  if (!_avatarIdx[lane]) _avatarIdx[lane] = 0;
  var src = avatars[_avatarIdx[lane] % avatars.length];
  _avatarIdx[lane]++;
  return '<img src="'+src+'" style="width:24px;height:24px;border-radius:50%;object-fit:cover">';
}

function build() {
  _avatarIdx = {};
  var b = document.getElementById('brd');
  b.innerHTML = '';
  var mx = Math.max.apply(null, S.map(function(s){return s.c + s.w}));
  b.style.minWidth = ((mx + 0.5) * U + 100) + 'px';

  var pr = document.createElement('div');
  pr.className = 'phase-row';
  pr.innerHTML = '<div class="hs"></div><div class="pt" id="ptk"></div>';
  b.appendChild(pr);
  PHASES.forEach(function(p) {
    var d = document.createElement('div');
    d.className = 'plb';
    d.style.left = (p.c * U) + 'px';
    d.textContent = p.t;
    pr.querySelector('#ptk').appendChild(d);
  });

  var cur = document.createElement('div');
  cur.className = 'cursor';
  cur.id = 'cur';
  cur.style.height = (LANES.length * 88) + 'px';
  b.appendChild(cur);

  LANES.forEach(function(l) {
    var r = document.createElement('div');
    r.className = 'lane';
    r.innerHTML = '<div class="lh"><div class="li">'+PI+'</div><div class="ln">'+l+'</div></div><div class="lt" id="tk-'+l+'"></div>';
    b.appendChild(r);
  });

  S.forEach(function(s) {
    var tk = document.getElementById('tk-' + s.ln);
    var d = document.createElement('div');
    d.className = 'c waiting' + (s.a === 1 ? ' is-agent' : '');
    d.id = s.id;
    d.style.left = (s.c * U + 4) + 'px';
    d.style.width = (s.w * U - 6) + 'px';
    d.style.top = '4px';
    d.style.height = 'calc(100% - 8px)';
    var isA = s.a === 1;
    var iconHtml = mi(isA, s.ln);
    var label = isA ? 'Agent' : s.ln;
    d.innerHTML =
      '<div class="ctp"><div class="ci '+(isA?'ai':'hi')+'">'+iconHtml+'</div><span class="cw">'+label+'</span></div>' +
      '<div class="cn">'+s.t+'</div>' +
      '<div class="cd">'+s.dur+'</div>' +
      '<div class="cwait">Awaiting...</div>' +
      '<div class="ck">'+CI+'</div>';
    tk.appendChild(d);
  });

  aC = 0; hC = 0;
  document.getElementById('an').textContent = '0';
  document.getElementById('hn').textContent = '0';
}

function ss(id, st) {
  document.getElementById(id).className = 'c ' + st;
}

function mc(col) {
  var c = document.getElementById('cur');
  c.style.display = 'block';
  c.style.left = (100 + col * U) + 'px';
}

function bump(isA) {
  if (isA) { aC++; document.getElementById('an').textContent = aC; }
  else { hC++; document.getElementById('hn').textContent = hC; }
}

function afLine(type, msg, dur) {
  var fl = document.getElementById('fl');
  var e = document.createElement('div');
  e.className = 'fi';
  var iconMap = {
    ag: '<div class="fic ag">'+RI_SM+'</div>',
    hu: '<div class="fic hu">'+PI_SM+'</div>',
    tr: '<div class="fic tr">'+TI_SM+'</div>',
    sy: '<div class="fic sy">'+CI_SM+'</div>',
  };
  var icon = iconMap[type] || iconMap.sy;
  var durCls = dur && (dur.indexOf('min')!==-1 || dur.indexOf('sec')!==-1 || dur === 'ongoing') ? 'fast' : 'slow';
  var durHtml = dur ? ' <span class="dur '+durCls+'">'+dur+'</span>' : '';
  e.innerHTML = icon+'<span>'+msg+durHtml+'</span>';
  fl.insertBefore(e, fl.firstChild);
  requestAnimationFrame(function(){ e.classList.add('v'); });
}

function sch(fn, d) { var t = setTimeout(fn, d / SM); TT.push(t); }

function go() {
  if (RN) return;
  RN = true;
  document.getElementById('pbtn').disabled = true;
  document.getElementById('rbtn').style.display = 'inline-block';

  var sorted = S.slice().sort(function(a, b){ return a.c - b.c; });
  var sw = document.querySelector('.sw');
  var t = 0;
  var AG = 400;
  var HU_APP = 400;
  var HU_WAIT = 2400;
  var CG = 160;
  var LOG_GAP = 250;

  var i = 0;
  while (i < sorted.length) {
    var cluster = [sorted[i]];
    var j = i + 1;
    while (j < sorted.length && sorted[j].c - sorted[i].c < 0.3) {
      cluster.push(sorted[j]);
      j++;
    }
    var hasHuman = cluster.some(function(s){ return s.a === 0; });
    var co = 0;

    (function(cluster, t, co) {
      cluster.forEach(function(s) {
        var isA = s.a === 1;
        var myT = t + co;

        sch(function() {
          mc(s.c);
          ss(s.id, isA ? 'act-a' : 'act-h');
          var tx = s.c * U - 100;
          if (sw && tx > sw.scrollLeft + sw.clientWidth * 0.5) {
            sw.scrollTo({left: tx, behavior: 'smooth'});
          }
        }, myT);

        if (s.logs && s.logs.length) {
          s.logs.forEach(function(log, li) {
            sch(function(){ afLine(log.type, log.msg, log.dur); }, myT + 100 + li * LOG_GAP);
          });
        }

        if (isA) {
          sch(function(){ ss(s.id, 'done'); bump(true); }, myT + AG * 0.6 + (s.logs ? s.logs.length * LOG_GAP : 0));
        } else {
          sch(function(){ ss(s.id, 'pend'); }, myT + HU_APP);
          sch(function(){ ss(s.id, 'done'); bump(false); }, myT + HU_WAIT);
        }

        co += CG + (s.logs ? s.logs.length * LOG_GAP * 0.5 : 0);
      });
    })(cluster, t, co);

    var clusterCo = 0;
    cluster.forEach(function(s){ clusterCo += CG + (s.logs ? s.logs.length * LOG_GAP * 0.5 : 0); });
    t += clusterCo + (hasHuman ? HU_WAIT : AG + 200);
    i = j;
  }

  sch(function() {
    document.getElementById('cur').style.display = 'none';
    afLine('sy', 'Calendar complete \\u2014 '+aC+' steps ran automatically across 127 styles, '+hC+' required human input');
  }, t + 600);
}

function doReset() {
  TT.forEach(clearTimeout);
  TT = [];
  RN = false;
  document.getElementById('pbtn').disabled = false;
  document.getElementById('rbtn').style.display = 'none';
  document.getElementById('fl').innerHTML = '';
  build();
}

document.getElementById('pbtn').addEventListener('click', go);
document.getElementById('rbtn').addEventListener('click', doReset);
document.getElementById('spd').addEventListener('input', function() {
  document.getElementById('spl').textContent = ['0.5x','1x','2x'][this.value-1];
  SM = [0.5,1,2][this.value-1];
});

build();
<\/script>`;
