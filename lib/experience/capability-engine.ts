import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, lerp, smooth } from "./timeline";

const CYAN = "#78d5ea";
const BRIGHT = "#e2fbff";
const LAVENDER = "#9ca8e2";
const EMERALD = "#6ee7b7";
const SLATE = "#102536";

interface CodeSlateSpec {
  file: string;
  badge: string;
  blueprintTitle: string;
  blueprintSub: string;
  highlightRow: number;
  wallSide: -1 | 1;
  corridorZ: number;
  corridorY: number;
  lines: Array<Array<{ text: string; color: string }>>;
}

const CODE_SLATES: CodeSlateSpec[] = [
  {
    file: "src/engine/01-write.ts",
    badge: "01 · WRITE & DRAFT",
    blueprintTitle: "BILINGUAL DOCUMENT UI",
    blueprintSub: "PROPOSAL · SV / EN STREAM",
    highlightRow: 1,
    wallSide: -1,
    corridorZ: 0.45,
    corridorY: 1.05,
    lines: [
      [{ text: "// 01 · Editorial Document & Proposal Synthesis", color: "#6898b2" }],
      [
        { text: "const ", color: CYAN },
        { text: "doc ", color: BRIGHT },
        { text: "= ", color: "#88b4ca" },
        { text: "await ", color: LAVENDER },
        { text: "budai.write({", color: BRIGHT },
      ],
      [
        { text: "  locale: ", color: "#96bfd4" },
        { text: '"sv-SE" | "en-US"', color: EMERALD },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  surface: ", color: "#96bfd4" },
        { text: '"executive_one_pager"', color: EMERALD },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  voice: ", color: "#96bfd4" },
        { text: "memory.preferredRegister,", color: CYAN },
      ],
      [{ text: "}); // -> Renders Document Card UI", color: "#7cc8dc" }],
    ],
  },
  {
    file: "src/engine/02-automate.ts",
    badge: "02 · AUTOMATE",
    blueprintTitle: "4-STAGE PLAYBOOK BOARD",
    blueprintSub: "TRIGGER -> PARSE -> VERIFY -> SEND",
    highlightRow: 3,
    wallSide: 1,
    corridorZ: -0.25,
    corridorY: 0.65,
    lines: [
      [{ text: "// 02 · Deterministic Multi-Step Playbook", color: "#6898b2" }],
      [
        { text: "export const ", color: CYAN },
        { text: "playbook ", color: BRIGHT },
        { text: "= budai.automate({", color: LAVENDER },
      ],
      [
        { text: "  trigger: ", color: "#96bfd4" },
        { text: '"weekly.ops_digest"', color: EMERALD },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  pipeline: [", color: "#96bfd4" },
        { text: "collect", color: CYAN },
        { text: ", ", color: "#96bfd4" },
        { text: "verify", color: CYAN },
        { text: ", ", color: "#96bfd4" },
        { text: "dispatch", color: CYAN },
        { text: "],", color: "#96bfd4" },
      ],
      [
        { text: "  deterministic: ", color: "#96bfd4" },
        { text: "true", color: EMERALD },
      ],
      [{ text: "}); // -> Builds 4-Stage Pipeline UI", color: "#7cc8dc" }],
    ],
  },
  {
    file: "src/engine/03-decide.ts",
    badge: "03 · DECIDE",
    blueprintTitle: "DECISION MATRIX DASHBOARD",
    blueprintSub: "RISK · IMPACT · NEXT STEPS",
    highlightRow: 2,
    wallSide: -1,
    corridorZ: -0.95,
    corridorY: 0.2,
    lines: [
      [{ text: "// 03 · Analytical Tradeoff & Risk Matrix", color: "#6898b2" }],
      [
        { text: "const ", color: CYAN },
        { text: "decision ", color: BRIGHT },
        { text: "= ", color: "#88b4ca" },
        { text: "await ", color: LAVENDER },
        { text: "budai.decide({", color: BRIGHT },
      ],
      [
        { text: "  compare: ", color: "#96bfd4" },
        { text: '["option_a", "option_b"]', color: EMERALD },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  metrics: [", color: "#96bfd4" },
        { text: '"impact"', color: CYAN },
        { text: ", ", color: "#96bfd4" },
        { text: '"risk"', color: CYAN },
        { text: "],", color: "#96bfd4" },
      ],
      [
        { text: "  output: ", color: "#96bfd4" },
        { text: '"ranked_recommendation"', color: EMERALD },
      ],
      [{ text: "}); // -> Assembles Analytics Board", color: "#7cc8dc" }],
    ],
  },
  {
    file: "src/engine/04-bilingual.ts",
    badge: "04 · SWEDISH + ENGLISH",
    blueprintTitle: "DUAL-PANE BILINGUAL UI",
    blueprintSub: "SV-SE <-> EN-US TONE LOCK",
    highlightRow: 2,
    wallSide: 1,
    corridorZ: -1.65,
    corridorY: -0.25,
    lines: [
      [{ text: "// 04 · Native Nordic Bilingual Bridge", color: "#6898b2" }],
      [
        { text: "const ", color: CYAN },
        { text: "bridge ", color: BRIGHT },
        { text: "= ", color: "#88b4ca" },
        { text: "await ", color: LAVENDER },
        { text: "budai.bilingual({", color: BRIGHT },
      ],
      [
        { text: "  locales: [", color: "#96bfd4" },
        { text: '"sv-SE"', color: EMERALD },
        { text: ", ", color: "#96bfd4" },
        { text: '"en-US"', color: EMERALD },
        { text: "],", color: "#96bfd4" },
      ],
      [
        { text: "  preserveTone: ", color: "#96bfd4" },
        { text: "true", color: CYAN },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  register: ", color: "#96bfd4" },
        { text: '"nordic_workday"', color: EMERALD },
      ],
      [{ text: "}); // -> Syncs Dual Language Views", color: "#7cc8dc" }],
    ],
  },
  {
    file: "src/engine/05-memory.ts",
    badge: "05 · MEMORY",
    blueprintTitle: "CONTEXT VAULT INTERFACE",
    blueprintSub: "USER-OWNED · RLS ISOLATED",
    highlightRow: 3,
    wallSide: -1,
    corridorZ: -2.35,
    corridorY: -0.7,
    lines: [
      [{ text: "// 05 · User-Controlled Durable Memory", color: "#6898b2" }],
      [
        { text: "const ", color: CYAN },
        { text: "vault ", color: BRIGHT },
        { text: "= ", color: "#88b4ca" },
        { text: "await ", color: LAVENDER },
        { text: "budai.memory.recall({", color: BRIGHT },
      ],
      [
        { text: "  owner: ", color: "#96bfd4" },
        { text: "auth.uid(),", color: CYAN },
      ],
      [
        { text: "  policy: ", color: "#96bfd4" },
        { text: '"explicit_user_control"', color: EMERALD },
        { text: ",", color: "#96bfd4" },
      ],
      [
        { text: "  rls: ", color: "#96bfd4" },
        { text: '"strict_row_isolation"', color: EMERALD },
      ],
      [{ text: "}); // -> Mounts 4-Strata Memory Vault", color: "#7cc8dc" }],
    ],
  },
  {
    file: "src/engine/06-multimodal.ts",
    badge: "06 · VISION & VOICE",
    blueprintTitle: "OPTICAL & VOICE STUDIO",
    blueprintSub: "CLAUDE VISION · WEB SPEECH",
    highlightRow: 1,
    wallSide: 1,
    corridorZ: -3.05,
    corridorY: -1.15,
    lines: [
      [{ text: "// 06 · Vision Inspection & Spoken Prompting", color: "#6898b2" }],
      [
        { text: "const ", color: CYAN },
        { text: "studio ", color: BRIGHT },
        { text: "= ", color: "#88b4ca" },
        { text: "await ", color: LAVENDER },
        { text: "budai.perceive({", color: BRIGHT },
      ],
      [
        { text: "  vision: ", color: "#96bfd4" },
        { text: "imageAttachment.frame,", color: CYAN },
      ],
      [
        { text: "  voice: ", color: "#96bfd4" },
        { text: 'speech.stream("sv-SE"),', color: EMERALD },
      ],
      [
        { text: "  target: ", color: "#96bfd4" },
        { text: '"playground_thread"', color: EMERALD },
      ],
      [{ text: "}); // -> Opens Vision + Voice HUD", color: "#7cc8dc" }],
    ],
  },
];

const SYNTAX_TOKENS = [
  "budai.write({ sv, en })",
  "-> DocumentCard.render()",
  "budai.automate(steps)",
  "-> PlaybookPipeline[4]",
  "budai.decide(scenarios)",
  "-> RiskImpactMatrix",
  "sv-SE <-> en-US",
  "-> BilingualSyncPane",
  "memory.recall(uid)",
  "-> ContextVaultStrata",
  "budai.perceive(img, mic)",
  "-> MultimodalStudioHUD",
];

function createCodeSlateTexture(spec: CodeSlateSpec): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 440;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Rich architectural dark-glass background
    const bgGrad = ctx.createLinearGradient(0, 0, 768, 440);
    bgGrad.addColorStop(0, "rgba(7, 19, 32, 0.96)");
    bgGrad.addColorStop(1, "rgba(4, 11, 20, 0.94)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 768, 440);

    // Subtle technical blueprint grid
    ctx.strokeStyle = "rgba(120, 213, 234, 0.065)";
    ctx.lineWidth = 1;
    for (let x = 36; x < 768; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 54);
      ctx.lineTo(x, 388);
      ctx.stroke();
    }
    for (let y = 84; y < 388; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(768, y);
      ctx.stroke();
    }

    // Top window chrome bar
    ctx.fillStyle = "rgba(12, 33, 52, 0.98)";
    ctx.fillRect(0, 0, 768, 54);
    ctx.strokeStyle = "rgba(128, 224, 246, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 54);
    ctx.lineTo(768, 54);
    ctx.stroke();

    // Window status indicators
    ctx.fillStyle = "#78d5ea";
    ctx.beginPath();
    ctx.arc(24, 27, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ca8e2";
    ctx.beginPath();
    ctx.arc(42, 27, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(60, 27, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 15px monospace";
    ctx.fillStyle = "#dcf8ff";
    ctx.fillText(spec.file, 82, 32);

    ctx.fillStyle = "rgba(120, 213, 234, 0.16)";
    ctx.fillRect(510, 13, 238, 28);
    ctx.strokeStyle = "rgba(120, 213, 234, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(510, 13, 238, 28);
    ctx.font = "600 12px monospace";
    ctx.fillStyle = "#9cf2ff";
    ctx.fillText(spec.badge, 524, 31);

    // Highlighted code line band (shows selected line illuminating & transforming)
    const hlY = 74 + spec.highlightRow * 46;
    const hlGrad = ctx.createLinearGradient(0, hlY, 768, hlY);
    hlGrad.addColorStop(0, "rgba(110, 231, 183, 0.24)");
    hlGrad.addColorStop(0.55, "rgba(120, 213, 234, 0.20)");
    hlGrad.addColorStop(1, "rgba(156, 168, 226, 0.06)");
    ctx.fillStyle = hlGrad;
    ctx.fillRect(0, hlY, 768, 40);
    ctx.fillStyle = "#6ee7b7";
    ctx.fillRect(0, hlY, 5, 40);

    // Code lines
    spec.lines.forEach((tokens, rowIdx) => {
      const y = 100 + rowIdx * 46;
      ctx.font = "14px monospace";
      ctx.fillStyle = rowIdx === spec.highlightRow ? "#9cf4ff" : "rgba(130, 174, 198, 0.55)";
      ctx.fillText(`0${rowIdx + 1}`, 20, y);

      let x = 62;
      tokens.forEach(tk => {
        ctx.font = "600 17px monospace";
        ctx.fillStyle = tk.color;
        ctx.fillText(tk.text, x, y);
        x += ctx.measureText(tk.text).width;
      });
    });

    // Bottom blueprint compilation footer
    ctx.fillStyle = "rgba(9, 27, 44, 0.96)";
    ctx.fillRect(0, 388, 768, 52);
    ctx.strokeStyle = "rgba(120, 213, 234, 0.3)";
    ctx.beginPath();
    ctx.moveTo(0, 388);
    ctx.lineTo(768, 388);
    ctx.stroke();

    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(26, 414, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "600 13px monospace";
    ctx.fillStyle = "#b8f3ff";
    ctx.fillText(`BLUEPRINT -> ${spec.blueprintTitle}`, 42, 419);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#88bfd4";
    ctx.fillText(spec.blueprintSub, 470, 419);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBlueprintCardTexture(spec: CodeSlateSpec, index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 380;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(8, 22, 36, 0.94)";
    ctx.fillRect(0, 0, 560, 380);

    // Blueprint grid
    ctx.strokeStyle = "rgba(120, 213, 234, 0.09)";
    ctx.lineWidth = 1;
    for (let x = 28; x < 560; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 380);
      ctx.stroke();
    }
    for (let y = 28; y < 380; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(560, y);
      ctx.stroke();
    }

    // Header
    ctx.fillStyle = "rgba(15, 40, 62, 0.98)";
    ctx.fillRect(0, 0, 560, 50);
    ctx.strokeStyle = "#78d5ea";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 558, 378);

    ctx.font = "600 13px monospace";
    ctx.fillStyle = "#9cf2ff";
    ctx.fillText(`ASSEMBLED COMPONENT · ${spec.blueprintTitle}`, 20, 30);

    // Draw distinct interface schematic per module
    if (index === 0) {
      // Document UI
      ctx.fillStyle = "rgba(18, 48, 72, 0.85)";
      ctx.fillRect(28, 74, 504, 56);
      ctx.fillStyle = "#dffaff";
      ctx.font = "600 16px sans-serif";
      ctx.fillText("Q2 Executive Proposal · SV / EN", 46, 108);
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = r === 0 ? "rgba(120, 213, 234, 0.35)" : "rgba(120, 213, 234, 0.16)";
        ctx.fillRect(28, 150 + r * 36, 420 - r * 45, 22);
      }
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(392, 304, 140, 42);
      ctx.fillStyle = "#04141e";
      ctx.font = "700 13px monospace";
      ctx.fillText("STREAM READY", 412, 330);
    } else if (index === 1) {
      // 4-Stage Playbook Board
      const stages = ["01 COLLECT", "02 PARSE", "03 VERIFY", "04 SEND"];
      stages.forEach((st, sIdx) => {
        const x = 24 + sIdx * 130;
        ctx.fillStyle = "rgba(16, 44, 68, 0.92)";
        ctx.fillRect(x, 86, 114, 210);
        ctx.strokeStyle = sIdx === 2 ? "#6ee7b7" : "#78d5ea";
        ctx.strokeRect(x, 86, 114, 210);
        ctx.fillStyle = "#d4f8ff";
        ctx.font = "600 12px monospace";
        ctx.fillText(st, x + 12, 118);
        ctx.fillStyle = "rgba(120, 213, 234, 0.25)";
        ctx.fillRect(x + 12, 142, 90, 28);
        ctx.fillRect(x + 12, 184, 76, 28);
        ctx.fillStyle = "#6ee7b7";
        ctx.fillRect(x + 12, 248, 90, 24);
      });
    } else if (index === 2) {
      // Decision Matrix Dashboard
      const bars = [
        { label: "IMPACT", h: 170, col: "#78d5ea" },
        { label: "CLARITY", h: 200, col: "#6ee7b7" },
        { label: "RISK LOW", h: 145, col: "#9ca8e2" },
        { label: "SPEED", h: 185, col: "#78d5ea" },
      ];
      bars.forEach((b, bIdx) => {
        const bx = 48 + bIdx * 122;
        ctx.fillStyle = b.col;
        ctx.fillRect(bx, 290 - b.h, 76, b.h);
        ctx.fillStyle = "#d8f8ff";
        ctx.font = "600 11px monospace";
        ctx.fillText(b.label, bx + 6, 318);
      });
    } else if (index === 3) {
      // Dual-Pane Bilingual UI
      ctx.fillStyle = "rgba(16, 45, 68, 0.92)";
      ctx.fillRect(26, 82, 236, 236);
      ctx.strokeStyle = "#78d5ea";
      ctx.strokeRect(26, 82, 236, 236);
      ctx.fillStyle = "#9cf2ff";
      ctx.font = "600 14px monospace";
      ctx.fillText("SV · SVENSKA", 44, 114);

      ctx.fillStyle = "rgba(24, 38, 72, 0.92)";
      ctx.fillRect(298, 82, 236, 236);
      ctx.strokeStyle = "#9ca8e2";
      ctx.strokeRect(298, 82, 236, 236);
      ctx.fillStyle = "#d0d8ff";
      ctx.fillText("EN · ENGLISH", 316, 114);

      for (let l = 0; l < 4; l++) {
        ctx.fillStyle = "rgba(120, 213, 234, 0.3)";
        ctx.fillRect(44, 142 + l * 36, 190 - l * 18, 18);
        ctx.fillStyle = "rgba(156, 168, 226, 0.32)";
        ctx.fillRect(316, 142 + l * 36, 190 - l * 18, 18);
      }
    } else if (index === 4) {
      // Context Vault UI
      const strata = ["01 · PREFERRED VOICE & TONE", "02 · ACTIVE WORKSPACE FACTS", "03 · BILINGUAL TERMINOLOGY", "04 · RLS OWNER ISOLATION"];
      strata.forEach((label, sIdx) => {
        const y = 76 + sIdx * 66;
        ctx.fillStyle = "rgba(16, 44, 66, 0.9)";
        ctx.fillRect(34, y, 492, 50);
        ctx.strokeStyle = sIdx === 3 ? "#6ee7b7" : "#78d5ea";
        ctx.strokeRect(34, y, 492, 50);
        ctx.fillStyle = "#dcf8ff";
        ctx.font = "600 13px monospace";
        ctx.fillText(label, 56, y + 30);
      });
    } else {
      // Vision & Voice Studio
      ctx.strokeStyle = "#78d5ea";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 78, 240, 180);
      ctx.fillStyle = "rgba(120, 213, 234, 0.18)";
      ctx.fillRect(48, 94, 208, 148);
      ctx.fillStyle = "#dcf8ff";
      ctx.font = "600 12px monospace";
      ctx.fillText("VISION · CLAUDE ANALYZER", 58, 172);

      for (let w = 0; w < 9; w++) {
        const bh = 40 + ((w * 37) % 120);
        ctx.fillStyle = w % 2 === 0 ? "#6ee7b7" : "#78d5ea";
        ctx.fillRect(306 + w * 24, 210 - bh / 2, 14, bh);
      }
      ctx.fillStyle = "#9cf2ff";
      ctx.fillText("VOICE · WEB SPEECH STREAM", 308, 310);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTokenTexture(text: string, idx: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 280;
  canvas.height = 60;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(8, 24, 40, 0.88)";
    ctx.fillRect(0, 0, 280, 60);
    ctx.strokeStyle = idx % 2 === 0 ? "rgba(120, 213, 234, 0.58)" : "rgba(110, 231, 183, 0.58)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 278, 58);
    ctx.font = "600 15px monospace";
    ctx.fillStyle = idx % 2 === 0 ? "#c8f6ff" : "#b8fce0";
    ctx.fillText(text, 16, 36);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAssemblyOutputTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 768, 480);
    grad.addColorStop(0, "rgba(9, 26, 42, 0.98)");
    grad.addColorStop(1, "rgba(5, 15, 28, 0.96)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 768, 480);

    // Top application bar
    ctx.fillStyle = "rgba(15, 42, 66, 0.98)";
    ctx.fillRect(0, 0, 768, 56);
    ctx.strokeStyle = "#78d5ea";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, 766, 478);

    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(28, 28, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "700 15px monospace";
    ctx.fillStyle = "#e6fcff";
    ctx.fillText("BUDAI · ASSEMBLED PRODUCT OUTPUT (SV / EN)", 48, 33);

    // Left panel: Structured Document & Code Output
    ctx.fillStyle = "rgba(14, 38, 58, 0.92)";
    ctx.fillRect(24, 78, 430, 250);
    ctx.strokeStyle = "rgba(120, 213, 234, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(24, 78, 430, 250);
    ctx.fillStyle = "#9cf2ff";
    ctx.font = "600 13px monospace";
    ctx.fillText("01 · GENERATED INTERFACE & COPY", 44, 108);
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = r === 0 ? "rgba(110, 231, 183, 0.34)" : "rgba(120, 213, 234, 0.2)";
      ctx.fillRect(44, 128 + r * 34, 370 - (r % 3) * 45, 20);
    }

    // Right panel: Live Metrics & Model Synthesis
    ctx.fillStyle = "rgba(20, 36, 68, 0.92)";
    ctx.fillRect(474, 78, 270, 250);
    ctx.strokeStyle = "rgba(156, 168, 226, 0.55)";
    ctx.strokeRect(474, 78, 270, 250);
    ctx.fillStyle = "#d4dcff";
    ctx.fillText("02 · WORKFLOW METRICS", 494, 108);
    const heights = [95, 135, 115, 155, 140];
    heights.forEach((h, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#78d5ea" : "#6ee7b7";
      ctx.fillRect(498 + idx * 44, 304 - h, 28, h);
    });

    // Bottom status deck: Completed Workflow Steps
    ctx.fillStyle = "rgba(12, 34, 52, 0.95)";
    ctx.fillRect(24, 348, 720, 104);
    ctx.strokeStyle = "rgba(110, 231, 183, 0.55)";
    ctx.strokeRect(24, 348, 720, 104);
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "700 14px monospace";
    ctx.fillText("✓ CHAT STREAMED   ✓ VISION ANALYZED   ✓ MEMORY LINKED   ✓ UI BUILT", 48, 392);
    ctx.fillStyle = "#a8dced";
    ctx.font = "13px monospace";
    ctx.fillText("READY FOR TEAM & PRODUCTION WORKFLOWS · DEVELOPED BY STILLEDEV", 48, 426);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Chapter 03 — TWO GENUINELY NEW 3D SCROLL EXPERIENCES:
 *
 * 1. EXPERIENCE ONE (`engineGroup` / `[data-infinite-code-chamber]`):
 *    THE INFINITE CODE CHAMBER (Idea A + Idea C Living Code Wall + Idea D Intelligence Blueprint)
 *    - Replaces the old wireframe sphere + 6 icons diagram completely.
 *    - Builds a deep Z-axis 3D architectural code tunnel of 7 receding rectangular portal frames,
 *      floor/ceiling blueprint grid rails, and a central illuminated runway.
 *    - 6 large, high-contrast 3D Code Wall monoliths (`2.15 x 1.18`) are arrayed along the left and right
 *      corridor walls. Scrolling physically dollies the chamber along the Z-axis so each active Code Monolith
 *      glides into the foreground focal zone while its highlighted code lines project 3D compiler beams that
 *      assemble a large, recognizable 3D Blueprint Interface Component right beside it.
 *
 * 2. EXPERIENCE TWO (`accessGroup` / `[data-ai-assembly-line]`):
 *    THE AI ASSEMBLY LINE (Idea B: Raw Information -> Structured Matrix -> Connected Conduits -> Completed Output)
 *    - Replaces the old 3 wireframe spheres on hexagonal pedestals completely.
 *    - Stage 01 (Left): 6 labeled 3D multimodal input tiles (`CHAT`, `VISION`, `VOICE`, `2 ANGLES`, `MEMORY`, `PLAYBOOK`)
 *      pass through a rectangular 3D Intake Scanner Gate.
 *    - Stage 02 (Center-Left): A 3-deck rectangular 3D Glass Context & Routing Rack where 9 3D data blocks
 *      organize into a structured 3x3 architectural grid.
 *    - Stage 03 (Center-Right): 4 illuminated 3D synthesis conduits carry dimensional UI building blocks rightward.
 *    - Stage 04 (Right): A large 3D Completed Application Interface, Mobile Companion Frame, and Exploded-to-Assembled
 *      UI layers physically lock together as the visitor scrolls.
 */
export function createCapabilityEngine(parent?: THREE.Object3D) {
  const root = new THREE.Group();
  root.position.set(0, 1.4, 0);
  parent?.add(root);

  const engineGroup = new THREE.Group();
  root.add(engineGroup);

  const accessGroup = new THREE.Group();
  root.add(accessGroup);

  // Dynamic point light that travels through the Code Chamber and Assembly Line
  const chamberLight = new THREE.PointLight("#78e4ff", 4.2, 12);
  chamberLight.position.set(0, 0.6, 1.2);
  root.add(chamberLight);

  // ============================================================================
  // EXPERIENCE 1: THE INFINITE CODE CHAMBER (`engineGroup`)
  // ============================================================================
  const chamberWorld = new THREE.Group();
  engineGroup.add(chamberWorld);

  // 1A. 7 Concentric 3D Architectural Portal Arches + Floor/Ceiling Blueprint Grid
  const chamberPortalMat = new THREE.LineBasicMaterial({
    color: "#7ee4fa",
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chamberCornerMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chamberPortals: THREE.Group[] = [];
  const cornerGeo = new THREE.BoxGeometry(0.18, 0.04, 0.04);

  for (let pIdx = 0; pIdx < 7; pIdx++) {
    const pGroup = new THREE.Group();
    const w = 4.5 - pIdx * 0.26;
    const h = 3.6 - pIdx * 0.2;
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.05)),
      chamberPortalMat
    );
    pGroup.add(frame);

    // Glowing architectural corner brackets
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const cBar = new THREE.Mesh(cornerGeo, chamberCornerMat);
        cBar.position.set(sx * (w / 2 - 0.09), sy * (h / 2), 0.02);
        pGroup.add(cBar);
      }
    }
    pGroup.position.set(0, 0, 0.85 - pIdx * 0.72);
    chamberWorld.add(pGroup);
    chamberPortals.push(pGroup);
  }

  // Perspective Floor & Ceiling Blueprint Rails
  const railPts: THREE.Vector3[] = [];
  for (let lane = -2; lane <= 2; lane++) {
    const x = lane * 0.95;
    railPts.push(new THREE.Vector3(x, -1.75, 1.1), new THREE.Vector3(x * 0.65, -1.25, -4.2));
    railPts.push(new THREE.Vector3(x, 1.75, 1.1), new THREE.Vector3(x * 0.65, 1.25, -4.2));
  }
  const railMat = new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chamberRails = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(railPts), railMat);
  chamberWorld.add(chamberRails);

  // Central Z-Axis Runway Light Spine
  const runwayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.45, 1.1),
    new THREE.Vector3(0, -1.15, -1.5),
    new THREE.Vector3(0, -0.95, -4.0),
  ]);
  const runwayMat = new THREE.MeshBasicMaterial({
    color: EMERALD,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  chamberWorld.add(new THREE.Mesh(new THREE.TubeGeometry(runwayCurve, 32, 0.016, 8, false), runwayMat));

  // 1B. 6 Large Dimensional 3D Code Wall Monoliths (`codeSlates`)
  const slateGeo = new THREE.PlaneGeometry(2.18, 1.24);
  const slateSlabGeo = new RoundedBoxGeometry(2.24, 1.3, 0.05, 2, 0.02);
  const slateEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.24, 1.3, 0.055));
  const scanBarGeo = new THREE.PlaneGeometry(2.14, 0.045);

  const codeSlates: Array<{
    group: THREE.Group;
    mat: THREE.MeshBasicMaterial;
    slabMat: THREE.MeshStandardMaterial;
    edgeMat: THREE.LineBasicMaterial;
    scanBar: THREE.Mesh;
    scanBarMat: THREE.MeshBasicMaterial;
    spec: CodeSlateSpec;
  }> = [];

  CODE_SLATES.forEach(spec => {
    const group = new THREE.Group();
    group.position.set(spec.wallSide * 1.15, spec.corridorY, spec.corridorZ);
    group.rotation.set(0.02, -spec.wallSide * 0.28, 0);
    chamberWorld.add(group);

    const slabMat = new THREE.MeshStandardMaterial({
      color: "#091b2a",
      emissive: "#154862",
      emissiveIntensity: 0.65,
      metalness: 0.78,
      roughness: 0.22,
      transparent: true,
      opacity: 0.85,
    });
    const slab = new THREE.Mesh(slateSlabGeo, slabMat);
    slab.position.z = -0.03;
    group.add(slab);

    const tex = createCodeSlateTexture(spec);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(slateGeo, mat);
    mesh.position.z = 0.005;
    group.add(mesh);

    const edgeMat = new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.LineSegments(slateEdgeGeo, edgeMat));

    const scanBarMat = new THREE.MeshBasicMaterial({
      color: EMERALD,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanBar = new THREE.Mesh(scanBarGeo, scanBarMat);
    scanBar.position.set(0, 0.2, 0.02);
    group.add(scanBar);

    codeSlates.push({ group, mat, slabMat, edgeMat, scanBar, scanBarMat, spec });
  });

  // 1C. 6 Assembled 3D Blueprint Interface Components (Living Code Wall -> Tangible Component)
  const blueprintStage = new THREE.Group();
  blueprintStage.position.set(0.88, -0.08, 0.38);
  engineGroup.add(blueprintStage);

  // Compiler projection beams connecting the active Code Monolith (left) to the Assembled Blueprint UI (right)
  const compilerBeamCurves: THREE.CatmullRomCurve3[] = [];
  const compilerPulses: THREE.Mesh[] = [];
  const compilerBeamMat = new THREE.MeshBasicMaterial({
    color: EMERALD,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const compilerPulseGeo = new THREE.SphereGeometry(0.052, 12, 12);
  const compilerPulseMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (let b = 0; b < 4; b++) {
    const by = 0.48 - b * 0.32;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.85, by + 0.12, 0.35),
      new THREE.Vector3(0.0, by * 0.85, 0.52),
      new THREE.Vector3(0.82, by * 0.75, 0.38),
    ]);
    compilerBeamCurves.push(curve);
    engineGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.012, 8, false), compilerBeamMat));
    const pMesh = new THREE.Mesh(compilerPulseGeo, compilerPulseMat);
    engineGroup.add(pMesh);
    compilerPulses.push(pMesh);
  }

  const blueprintCardGeo = new THREE.PlaneGeometry(1.78, 1.22);
  const blueprintFrameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.84, 1.28, 0.08));

  const blueprintAssemblies: Array<{
    group: THREE.Group;
    cardMat: THREE.MeshBasicMaterial;
    wireMat: THREE.LineBasicMaterial;
    solidMat: THREE.MeshStandardMaterial;
    accentMat: THREE.MeshBasicMaterial;
    subParts: THREE.Object3D[];
  }> = [];

  CODE_SLATES.forEach((spec, i) => {
    const bGroup = new THREE.Group();
    bGroup.rotation.set(0.03, -0.22, 0);
    blueprintStage.add(bGroup);

    const cardMat = new THREE.MeshBasicMaterial({
      map: createBlueprintCardTexture(spec, i),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const cardMesh = new THREE.Mesh(blueprintCardGeo, cardMat);
    bGroup.add(cardMesh);

    const wireMat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? "#9cf4ff" : "#80f4ca",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    bGroup.add(new THREE.LineSegments(blueprintFrameGeo, wireMat));

    const solidMat = new THREE.MeshStandardMaterial({
      color: SLATE,
      emissive: i % 2 === 0 ? "#1f6c88" : "#1d6b5c",
      emissiveIntensity: 0.85,
      metalness: 0.78,
      roughness: 0.22,
      transparent: true,
      opacity: 0,
    });
    const accentMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? CYAN : EMERALD,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 3D Extruded UI Component Sub-blocks floating in front of the blueprint panel
    const subParts: THREE.Object3D[] = [];
    for (let s = 0; s < 3; s++) {
      const partGroup = new THREE.Group();
      const pw = i === 1 ? 0.36 : 0.72 - s * 0.1;
      const ph = i === 2 ? 0.28 + s * 0.12 : 0.18;
      const pGeo = new RoundedBoxGeometry(pw, ph, 0.045, 2, 0.015);
      partGroup.add(new THREE.Mesh(pGeo, solidMat));
      partGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(pGeo), wireMat));

      const bar = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.76, 0.025, 0.015), accentMat);
      bar.position.z = 0.028;
      partGroup.add(bar);

      partGroup.position.set(
        (s - 1) * 0.42,
        0.26 - s * 0.28,
        0.14 + s * 0.06
      );
      bGroup.add(partGroup);
      subParts.push(partGroup);
    }

    blueprintAssemblies.push({ group: bGroup, cardMat, wireMat, solidMat, accentMat, subParts });
  });

  // 1D. Foreground Layer: 12 Floating 3D Syntax Token Plates (1.5x parallax speed)
  const syntaxStreamGroup = new THREE.Group();
  engineGroup.add(syntaxStreamGroup);

  const tokenGeo = new THREE.PlaneGeometry(0.76, 0.165);
  const tokenMeshes: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    lane: number;
    phase: number;
  }> = [];

  SYNTAX_TOKENS.forEach((text, idx) => {
    const lane = idx % 6;
    const tex = createTokenTexture(text, idx);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(tokenGeo, mat);
    syntaxStreamGroup.add(mesh);
    tokenMeshes.push({ mesh, mat, lane, phase: (idx / SYNTAX_TOKENS.length) % 1 });
  });

  // ============================================================================
  // EXPERIENCE 2: THE AI ASSEMBLY LINE (`accessGroup`)
  // (No spheres on pedestals! 4-Stage Architectural Workflow -> Tangible Output)
  // ============================================================================

  // Stage 01 (x = -3.65 to -2.25): 6 Labeled 3D Input Data Tiles + Rectangular Intake Scanner Gate
  const INTAKE_LABELS = [
    "01 · CHAT PROMPT",
    "02 · VISION IMAGE",
    "03 · VOICE STREAM",
    "04 · 2 ANGLES",
    "05 · AUTO MEMORY",
    "06 · PLAYBOOK",
  ];
  const intakeTileGeo = new THREE.PlaneGeometry(0.88, 0.24);
  const intakeTileEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.26, 0.03));
  const intakeTiles: Array<{
    group: THREE.Group;
    mat: THREE.MeshBasicMaterial;
    edgeMat: THREE.LineBasicMaterial;
    startPos: [number, number, number];
  }> = [];

  const intakeStartCoords: Array<[number, number, number]> = [
    [-4.25, 0.92, 0.35],
    [-3.95, 0.56, -0.25],
    [-4.35, 0.18, 0.22],
    [-4.0, -0.18, -0.22],
    [-4.3, -0.54, 0.28],
    [-3.92, -0.88, -0.18],
  ];

  INTAKE_LABELS.forEach((label, idx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(...intakeStartCoords[idx]);
    accessGroup.add(tGroup);

    const tex = createTokenTexture(label, idx);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    tGroup.add(new THREE.Mesh(intakeTileGeo, mat));

    const edgeMat = new THREE.LineBasicMaterial({
      color: idx % 2 === 0 ? CYAN : EMERALD,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tGroup.add(new THREE.LineSegments(intakeTileEdgeGeo, edgeMat));
    intakeTiles.push({ group: tGroup, mat, edgeMat, startPos: intakeStartCoords[idx] });
  });

  // Rectangular 3D Intake Scanner Gate at x = -2.35
  const intakeGateGroup = new THREE.Group();
  intakeGateGroup.position.set(-2.35, 0.05, 0);
  intakeGateGroup.rotation.y = 0.22;
  accessGroup.add(intakeGateGroup);

  const intakeGateWireMat = new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const intakeGateScanMat = new THREE.MeshBasicMaterial({
    color: EMERALD,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  intakeGateGroup.add(
    new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.42, 2.05, 1.18)), intakeGateWireMat)
  );
  const intakeLaserPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.06), intakeGateScanMat);
  intakeLaserPlane.rotation.y = Math.PI / 2;
  intakeGateGroup.add(intakeLaserPlane);

  // Stage 02 (x = -0.55): Architectural 3-Deck Glass Context & Model Routing Rack
  const matrixRackGroup = new THREE.Group();
  matrixRackGroup.position.set(-0.45, 0.08, 0);
  matrixRackGroup.rotation.set(0.08, -0.18, 0);
  accessGroup.add(matrixRackGroup);

  const rackWireMat = new THREE.LineBasicMaterial({
    color: "#9cf2ff",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rackSolidMat = new THREE.MeshStandardMaterial({
    color: "#0d2438",
    emissive: "#1c5d78",
    emissiveIntensity: 0.78,
    metalness: 0.82,
    roughness: 0.22,
    transparent: true,
    opacity: 0,
  });
  const rackAccentMat = new THREE.MeshBasicMaterial({
    color: EMERALD,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Outer rectangular architectural blueprint cage of the routing rack
  matrixRackGroup.add(
    new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.92, 1.68, 0.92)), rackWireMat)
  );

  // 3 Horizontal Glass Routing Decks (Basic, Consumer, Business)
  for (let d = -1; d <= 1; d++) {
    const deckGeo = new RoundedBoxGeometry(1.78, 0.06, 0.82, 2, 0.015);
    const deck = new THREE.Mesh(deckGeo, rackSolidMat);
    deck.position.y = d * 0.48;
    matrixRackGroup.add(deck);
    const deckEdges = new THREE.LineSegments(new THREE.EdgesGeometry(deckGeo), rackWireMat);
    deckEdges.position.copy(deck.position);
    matrixRackGroup.add(deckEdges);
  }

  // 9 Organizing 3D Data Blocks inside the Routing Matrix
  const matrixCells: THREE.Mesh[] = [];
  const cellGeo = new RoundedBoxGeometry(0.36, 0.16, 0.26, 2, 0.02);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = new THREE.Mesh(cellGeo, row === 1 ? rackAccentMat : rackSolidMat);
      cell.position.set((col - 1) * 0.52, (row - 1) * 0.48 + 0.14, 0);
      matrixRackGroup.add(cell);
      matrixCells.push(cell);
    }
  }

  // Stage 03: 4 Parallel Illuminated 3D Synthesis Conduits + Traveling UI Building Blocks
  const conduitCurves: THREE.CatmullRomCurve3[] = [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, 0.52, 0.12),
      new THREE.Vector3(-1.8, 0.58, -0.1),
      new THREE.Vector3(-0.45, 0.48, 0.08),
      new THREE.Vector3(1.15, 0.56, 0.15),
      new THREE.Vector3(2.55, 0.42, 0),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, 0.16, -0.1),
      new THREE.Vector3(-1.8, 0.22, 0.14),
      new THREE.Vector3(-0.45, 0.14, -0.06),
      new THREE.Vector3(1.15, 0.2, -0.12),
      new THREE.Vector3(2.55, 0.12, 0),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, -0.2, 0.1),
      new THREE.Vector3(-1.8, -0.14, -0.12),
      new THREE.Vector3(-0.45, -0.18, 0.08),
      new THREE.Vector3(1.15, -0.12, 0.12),
      new THREE.Vector3(2.55, -0.16, 0),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, -0.54, -0.12),
      new THREE.Vector3(-1.8, -0.48, 0.1),
      new THREE.Vector3(-0.45, -0.48, -0.08),
      new THREE.Vector3(1.15, -0.42, -0.1),
      new THREE.Vector3(2.55, -0.44, 0),
    ]),
  ];

  const conduitMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const conduitBlockMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const conduitBlockGeo = new RoundedBoxGeometry(0.16, 0.08, 0.08, 1, 0.015);
  const conduitPulses: Array<{ mesh: THREE.Mesh; curveIdx: number; phase: number }> = [];

  conduitCurves.forEach((curve, cIdx) => {
    accessGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012, 8, false), conduitMat));
    for (let p = 0; p < 3; p++) {
      const block = new THREE.Mesh(conduitBlockGeo, conduitBlockMat);
      accessGroup.add(block);
      conduitPulses.push({ mesh: block, curveIdx: cIdx, phase: (p / 3 + cIdx * 0.17) % 1 });
    }
  });

  // Stage 04 (x = +2.55): Monumental 3D Assembled Product Output Showcase
  const outputShowcaseGroup = new THREE.Group();
  outputShowcaseGroup.position.set(2.55, 0.1, 0);
  outputShowcaseGroup.rotation.set(0.04, -0.26, 0);
  accessGroup.add(outputShowcaseGroup);

  const outputScreenMat = new THREE.MeshBasicMaterial({
    map: createAssemblyOutputTexture(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const outputFrameWireMat = new THREE.LineBasicMaterial({
    color: EMERALD,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const outputBackingMat = new THREE.MeshStandardMaterial({
    color: "#091e30",
    emissive: "#1b6b63",
    emissiveIntensity: 0.9,
    metalness: 0.84,
    roughness: 0.2,
    transparent: true,
    opacity: 0,
  });

  // Main 3D Product Window
  const mainOutBacking = new THREE.Mesh(new RoundedBoxGeometry(2.34, 1.48, 0.06, 2, 0.025), outputBackingMat);
  mainOutBacking.position.z = -0.035;
  outputShowcaseGroup.add(mainOutBacking);

  const mainOutScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.26, 1.4), outputScreenMat);
  mainOutScreen.position.z = 0.005;
  outputShowcaseGroup.add(mainOutScreen);

  outputShowcaseGroup.add(
    new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.38, 1.52, 0.08)), outputFrameWireMat)
  );

  // 4 Exploded-to-Assembled 3D UI Component Layers that lock onto the finished output screen
  const assembledLayers: Array<{
    group: THREE.Group;
    explodedPos: [number, number, number];
    lockedPos: [number, number, number];
  }> = [];

  const layerSpecs: Array<{
    w: number;
    h: number;
    explodedPos: [number, number, number];
    lockedPos: [number, number, number];
  }> = [
    { w: 2.16, h: 0.2, explodedPos: [-0.45, 0.85, 0.55], lockedPos: [0, 0.54, 0.05] },
    { w: 1.18, h: 0.68, explodedPos: [-0.75, 0.12, 0.68], lockedPos: [-0.46, 0.04, 0.06] },
    { w: 0.82, h: 0.68, explodedPos: [0.65, 0.24, 0.62], lockedPos: [0.62, 0.04, 0.06] },
    { w: 0.62, h: 1.12, explodedPos: [1.55, -0.25, 0.72], lockedPos: [1.36, -0.08, 0.18] }, // 3D Mobile Companion App
  ];

  layerSpecs.forEach(ls => {
    const lGroup = new THREE.Group();
    const lGeo = new RoundedBoxGeometry(ls.w, ls.h, 0.035, 2, 0.015);
    lGroup.add(new THREE.Mesh(lGeo, outputBackingMat));
    lGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(lGeo), outputFrameWireMat));
    outputShowcaseGroup.add(lGroup);
    assembledLayers.push({ group: lGroup, explodedPos: ls.explodedPos, lockedPos: ls.lockedPos });
  });

  return {
    root,
    update(progress: number, focus: number, morph = 0, time = 0, assemblyProgress = 0.5) {
      const p = clamp(progress);
      const ap = clamp(assemblyProgress);
      const m = smooth(clamp(morph));
      const engineVis = smooth(1 - m * 1.15);
      const accessVis = smooth((m - 0.08) / 0.82);

      engineGroup.visible = engineVis > 0.005;
      accessGroup.visible = accessVis > 0.005;

      const active = focus >= 0 ? focus : Math.min(5, Math.floor(p * 6));

      if (engineGroup.visible) {
        // Scroll-driven Z-dolly through the 3D Code Chamber (reversible with scroll)
        const dollyZ = lerp(0.15, 2.65, p);
        chamberLight.position.set(
          lerp(-0.8, 0.9, (active % 2)),
          0.6 + Math.sin(time * 0.9) * 0.25,
          1.4
        );
        chamberLight.color.set(active % 2 === 0 ? "#78e4ff" : "#6ee7b7");
        chamberLight.intensity = 4.4 * engineVis;

        // 1A. Background Portal Arches & Blueprint Rails (0.5x parallax speed)
        chamberPortalMat.opacity = 0.36 * engineVis;
        chamberCornerMat.opacity = 0.68 * engineVis;
        railMat.opacity = 0.24 * engineVis;
        runwayMat.opacity = 0.52 * engineVis;

        chamberPortals.forEach((portal, pIdx) => {
          portal.position.z = 0.85 - pIdx * 0.72 + dollyZ * 0.52;
          portal.rotation.z = Math.sin(time * 0.28 + pIdx * 0.35) * 0.014;
        });
        chamberRails.position.z = dollyZ * 0.45;

        // 1B. 6 Large 3D Code Wall Monoliths (1.0x parallax + active focal pull)
        codeSlates.forEach((slate, idx) => {
          const isFocused = idx === active;
          const baseZ = slate.spec.corridorZ + dollyZ * 0.88;
          const targetX = isFocused ? -1.08 : slate.spec.wallSide * 1.42;
          const targetY = isFocused ? 0.08 : slate.spec.corridorY + (p - 0.5) * 0.85;
          const targetZ = isFocused ? 0.36 : Math.min(0.15, baseZ - Math.abs(idx - active) * 0.24);
          const targetRotY = isFocused ? 0.22 : -slate.spec.wallSide * 0.32;

          slate.group.position.x = lerp(slate.group.position.x, targetX, 0.16);
          slate.group.position.y = lerp(slate.group.position.y, targetY, 0.16);
          slate.group.position.z = lerp(slate.group.position.z, targetZ, 0.16);
          slate.group.rotation.y = lerp(slate.group.rotation.y, targetRotY, 0.16);
          slate.group.scale.setScalar(isFocused ? 1.04 : 0.72);

          slate.mat.opacity = (isFocused ? 0.98 : 0.32) * engineVis;
          slate.slabMat.opacity = (isFocused ? 0.94 : 0.35) * engineVis;
          slate.edgeMat.opacity = (isFocused ? 0.96 : 0.3) * engineVis;
          slate.scanBarMat.opacity = (isFocused ? 0.88 : 0.15) * engineVis;
          slate.scanBar.position.y = Math.sin(time * 2.1 + idx) * 0.46;
        });

        // 1C. Compiler Beams & 3D Blueprint Interface Assembly (Living Code -> Component)
        compilerBeamMat.opacity = 0.72 * engineVis;
        compilerPulseMat.opacity = 0.96 * engineVis;
        compilerPulses.forEach((pulse, bIdx) => {
          const u = (time * 0.48 + bIdx * 0.25) % 1;
          compilerBeamCurves[bIdx].getPointAt(u, pulse.position);
        });

        blueprintAssemblies.forEach((bp, idx) => {
          const isFocused = idx === active;
          bp.group.visible = isFocused || Math.abs(idx - active) === 1;
          const vis = isFocused ? 1.0 : 0.14;
          bp.cardMat.opacity = 0.95 * vis * engineVis;
          bp.wireMat.opacity = 0.96 * vis * engineVis;
          bp.solidMat.opacity = 0.88 * vis * engineVis;
          bp.accentMat.opacity = 0.92 * vis * engineVis;

          const targetScale = isFocused ? 1.05 : 0.78;
          bp.group.scale.setScalar(lerp(bp.group.scale.x, targetScale, 0.18));
          bp.group.position.z = isFocused ? 0.12 : -0.45;
          bp.group.rotation.y = -0.22 + Math.sin(time * 0.7 + idx) * 0.05;

          bp.subParts.forEach((part, sIdx) => {
            part.position.z = 0.14 + sIdx * 0.06 + Math.sin(time * 1.6 + sIdx) * 0.025;
          });
        });

        // 1D. Foreground Syntax Token Plates (1.5x parallax speed)
        tokenMeshes.forEach((tk, idx) => {
          const u = (time * 0.24 + tk.phase) % 1;
          const isLaneActive = tk.lane === active;
          const x = lerp(-1.15, 0.88, u);
          const y = 0.85 - (idx % 4) * 0.52 + Math.sin(u * Math.PI * 2 + idx) * 0.08;
          const z = 0.52 + Math.sin(u * Math.PI) * 0.28;
          tk.mesh.position.set(x, y, z);
          tk.mat.opacity = (isLaneActive ? 0.82 : 0.26) * Math.sin(u * Math.PI) * engineVis;
        });
      }

      if (accessGroup.visible) {
        // Scroll-driven transformation across the 4 stages of the AI Assembly Line
        const intakeFactor = smooth(clamp(ap * 1.4));
        const matrixFactor = smooth(clamp((ap - 0.1) * 1.4));
        const outputLock = smooth(clamp((ap - 0.22) * 1.45));

        chamberLight.position.set(lerp(-2.2, 2.4, ap), 0.7, 1.8);
        chamberLight.color.set("#80f4ca");
        chamberLight.intensity = 4.6 * accessVis;

        // Stage 01: Raw Multimodal Input Tiles -> Intake Gate
        intakeGateWireMat.opacity = 0.86 * accessVis;
        intakeGateScanMat.opacity = 0.74 * accessVis;
        intakeLaserPlane.position.y = Math.sin(time * 2.2) * 0.82;

        intakeTiles.forEach((tile, idx) => {
          const destY = (2.5 - idx) * 0.31;
          tile.group.position.set(
            lerp(tile.startPos[0], -2.95, intakeFactor),
            lerp(tile.startPos[1], destY, intakeFactor) + Math.sin(time * 1.3 + idx) * 0.025,
            lerp(tile.startPos[2], (idx % 2 === 0 ? 1 : -1) * 0.12, intakeFactor)
          );
          tile.group.rotation.y = lerp(0.28, 0.12, intakeFactor);
          tile.mat.opacity = 0.92 * accessVis;
          tile.edgeMat.opacity = 0.88 * accessVis;
        });

        // Stage 02: 3-Deck Context & Routing Matrix Rack
        rackWireMat.opacity = (0.68 + matrixFactor * 0.28) * accessVis;
        rackSolidMat.opacity = (0.72 + matrixFactor * 0.22) * accessVis;
        rackAccentMat.opacity = (0.75 + matrixFactor * 0.25) * accessVis;
        matrixRackGroup.rotation.y = -0.18 + (ap - 0.5) * 0.16;

        matrixCells.forEach((cell, cIdx) => {
          const row = Math.floor(cIdx / 3);
          const col = cIdx % 3;
          const scatter = (1 - matrixFactor) * 0.28;
          cell.position.set(
            (col - 1) * 0.52 + Math.sin(cIdx * 1.7) * scatter,
            (row - 1) * 0.48 + 0.14 + Math.cos(cIdx * 2.1) * scatter,
            Math.sin(time * 1.8 + cIdx) * 0.04
          );
        });

        // Stage 03: Synthesis Conduits & Traveling 3D UI Blocks
        conduitMat.opacity = (0.48 + matrixFactor * 0.38) * accessVis;
        conduitBlockMat.opacity = 0.94 * accessVis;
        conduitPulses.forEach(cp => {
          const u = (time * 0.32 + cp.phase) % 1;
          conduitCurves[cp.curveIdx].getPointAt(u, cp.mesh.position);
          cp.mesh.rotation.y = time * 1.2;
        });

        // Stage 04: Completed Tangible Output Showcase (Exploded -> Assembled Lock)
        outputScreenMat.opacity = (0.78 + outputLock * 0.22) * accessVis;
        outputFrameWireMat.opacity = (0.75 + outputLock * 0.25) * accessVis;
        outputBackingMat.opacity = (0.76 + outputLock * 0.2) * accessVis;
        outputShowcaseGroup.rotation.y = lerp(-0.36, -0.18, outputLock);
        outputShowcaseGroup.scale.setScalar(lerp(0.92, 1.06, outputLock));

        assembledLayers.forEach((layer, lIdx) => {
          layer.group.position.set(
            lerp(layer.explodedPos[0], layer.lockedPos[0], outputLock),
            lerp(layer.explodedPos[1], layer.lockedPos[1], outputLock) + Math.sin(time * 1.2 + lIdx) * 0.02 * (1 - outputLock),
            lerp(layer.explodedPos[2], layer.lockedPos[2], outputLock)
          );
          layer.group.rotation.y = (1 - outputLock) * (lIdx % 2 === 0 ? 0.22 : -0.22);
        });
      }
    },
  };
}
