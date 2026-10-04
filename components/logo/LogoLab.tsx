"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Eye,
  Pin,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { LOGO_CANDIDATES, downloadSvg, logoSvg, type LogoTone } from "@/components/logo/candidates";
import { LIVE_LOGO_KEY } from "@/components/logo/LiveMark";
import { useLang } from "@/components/ui/LanguageContext";

const BACKDROPS: { id: string; label: Record<"sv" | "en", string>; css: string }[] = [
  { id: "ink", label: { sv: "Bläck", en: "Ink" }, css: "#05070c" },
  { id: "mesh", label: { sv: "Mesh", en: "Mesh" }, css: "radial-gradient(120% 90% at 20% 10%, rgba(62,224,205,0.22), transparent 55%), radial-gradient(100% 90% at 85% 85%, rgba(154,134,255,0.25), transparent 55%), #05070c" },
  {
    id: "grid",
    label: { sv: "Rutnät", en: "Grid" },
    css: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px) 0 0 / 22px 22px, #05070c",
  },
  { id: "paper", label: { sv: "Papper", en: "Paper" }, css: "#f4f6fb" },
];

const SIZES = [64, 96, 140, 200, 300];

export default function LogoLab() {
  const { lang } = useLang();
  const isSv = lang === "sv";
  const [selected, setSelected] = useState(LOGO_CANDIDATES[0].id);
  const [tone, setTone] = useState<LogoTone>("dark");
  const [backdrop, setBackdrop] = useState("mesh");
  const [px, setPx] = useState(200);
  const [motionOn, setMotionOn] = useState(true);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [vote, setVote] = useState<string | null>(null);
  const [live, setLive] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    try {
      setVote(window.localStorage.getItem("budai.logo.vote"));
      const stored = window.localStorage.getItem(LIVE_LOGO_KEY);
      setLive(stored && LOGO_CANDIDATES.some((c) => c.id === stored) ? stored : null);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const candidate = useMemo(
    () => LOGO_CANDIDATES.find((c) => c.id === selected) || LOGO_CANDIDATES[0],
    [selected]
  );

  const source = useMemo(() => logoSvg(candidate, 512, tone), [candidate, tone]);

  const stageHtml = useMemo(
    () => candidate.build(px, tone),
    [candidate, px, tone]
  );

  const pinned = useMemo(
    () => shortlist.map((id) => LOGO_CANDIDATES.find((c) => c.id === id)!).filter(Boolean),
    [shortlist]
  );

  const toggleShortlist = (id: string) => {
    setShortlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-4)));
  };

  const recordVote = (id: string) => {
    setVote(id);
    try {
      window.localStorage.setItem("budai.logo.vote", id);
    } catch {
      /* ignore */
    }
    flash(
      isSv
        ? "Rösten sparad — säg till i chatten så gör vi den permanent."
        : "Vote saved — tell me in the chat and I'll make it permanent."
    );
  };

  const applyLive = (id: string | null) => {
    setLive(id);
    try {
      if (id) window.localStorage.setItem(LIVE_LOGO_KEY, id);
      else window.localStorage.removeItem(LIVE_LOGO_KEY);
      window.dispatchEvent(new Event("budai:logo"));
    } catch {
      /* ignore */
    }
    flash(
      id
        ? isSv
          ? "Logotypen i navigeringen är nu den här (bara i din webbläsare)."
          : "The navigation mark now uses this one (in your browser only)."
        : isSv
        ? "Tillbaka till ordinarie logotyp."
        : "Back to the shipped mark."
    );
  };

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(source);
      flash(isSv ? "SVG-koden är kopierad." : "SVG source copied.");
    } catch {
      flash(isSv ? "Kunde inte kopiera." : "Copy failed.");
    }
  };

  const downloadPng = () => {
    const img = new Image();
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 1024, 1024);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `budai-${candidate.id}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    };
    img.src = svgUrl;
  };

  const currentBackdrop = BACKDROPS.find((b) => b.id === backdrop) || BACKDROPS[0];

  return (
    <main className="lab-page">
      <div className="lab-orb lab-orb--a" aria-hidden />
      <div className="lab-orb lab-orb--b" aria-hidden />

      <div className="lab-wrap">
        <header className="lab-head">
          <Link href="/" className="lab-back">
            <ArrowLeft className="h-4 w-4" />
            {isSv ? "Tillbaka till BudAI" : "Back to BudAI"}
          </Link>
          <span className="lab-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            {isSv ? "Logo Lab" : "Logo Lab"}
          </span>
          <h1 className="lab-title">
            {isSv ? "Ett nytt märke — bara om det är " : "A new mark — only if it is "}
            <span className="lab-title-em">{isSv ? "bättre" : "better"}</span>
            {isSv ? "." : " than the one we ship."}
          </h1>
          <p className="lab-lede">
            {isSv
              ? "Sex kandidater sida vid sida mot nuvarande Prism Core. Testa dem i rätt storlek, på rätt bakgrund, med rörelse på och av. Rösta på den du vill ha i headern — då byter vi överallt."
              : "Six candidates side by side against the shipped Prism Core. Test them at real sizes, on real backgrounds, with motion on and off. Vote for the one you want in the header — then we change it everywhere."}
          </p>
          <p className="lab-note">
            {isSv
              ? "Inget byts permanent förrän du säger till. Din röst och ditt live-val sparas bara i din webbläsare."
              : "Nothing changes permanently until you say so. Your vote and live pick are stored in your browser only."}
          </p>
        </header>

        {/* ── baseline vs selected ── */}
        <section className="lab-compare">
          <div className="lab-compare-card">
            <div className="lab-compare-tag">{isSv ? "I bruk idag" : "In use today"}</div>
            <div className="lab-compare-stage is-baseline" style={{ background: currentBackdrop.css }}>
              <BudAILogo size="xl" animated />
            </div>
            <div className="lab-compare-meta">
              <strong>Prism Core v2</strong>
              <span>{isSv ? "Header, footer, favicon, OG-bild" : "Header, footer, favicon, OG card"}</span>
            </div>
          </div>

          <div className="lab-compare-card">
            <div className="lab-compare-tag">
              {isSv ? "Utmanare" : "Challenger"} · {candidate.name}
            </div>
            <div
              ref={stageRef}
              className={`lab-compare-stage ${motionOn ? "" : "is-frozen"}`}
              style={{ background: currentBackdrop.css }}
              dangerouslySetInnerHTML={{ __html: stageHtml }}
            />
            <div className="lab-compare-meta">
              <strong>{candidate.name}</strong>
              <span>{candidate.tag[lang]}</span>
            </div>
          </div>
        </section>

        {/* ── controls ── */}
        <section className="lab-controls">
          <div className="lab-control">
            <span className="lab-control-label">{isSv ? "Storlek" : "Size"}</span>
            <div className="lab-chips">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPx(s)}
                  className={`lab-chip ${px === s ? "is-active" : ""}`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>
          <div className="lab-control">
            <span className="lab-control-label">{isSv ? "Bakgrund" : "Backdrop"}</span>
            <div className="lab-chips">
              {BACKDROPS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBackdrop(b.id);
                    if (b.id === "paper") setTone("light");
                    else if (tone === "light") setTone("dark");
                  }}
                  className={`lab-chip ${backdrop === b.id ? "is-active" : ""}`}
                >
                  {b.label[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="lab-control">
            <span className="lab-control-label">{isSv ? "Platta" : "Plate"}</span>
            <div className="lab-chips">
              <button type="button" onClick={() => setTone("dark")} className={`lab-chip ${tone === "dark" ? "is-active" : ""}`}>
                {isSv ? "Mörk" : "Dark"}
              </button>
              <button type="button" onClick={() => setTone("light")} className={`lab-chip ${tone === "light" ? "is-active" : ""}`}>
                {isSv ? "Ljus" : "Light"}
              </button>
            </div>
          </div>
          <div className="lab-control">
            <span className="lab-control-label">{isSv ? "Rörelse" : "Motion"}</span>
            <button
              type="button"
              onClick={() => setMotionOn((v) => !v)}
              className={`lab-chip ${motionOn ? "is-active" : ""}`}
            >
              {motionOn ? (isSv ? "På" : "On") : isSv ? "Av" : "Off"}
            </button>
          </div>
        </section>

        {/* ── actions ── */}
        <section className="lab-actions">
          <button type="button" onClick={() => downloadSvg(source, `budai-${candidate.id}.svg`)} className="lab-btn is-primary">
            <Download className="h-4 w-4" />
            {isSv ? "Ladda ner SVG" : "Download SVG"}
          </button>
          <button type="button" onClick={downloadPng} className="lab-btn">
            <Download className="h-4 w-4" />
            PNG 1024
          </button>
          <button type="button" onClick={copySource} className="lab-btn">
            <Copy className="h-4 w-4" />
            {isSv ? "Kopiera SVG-kod" : "Copy SVG source"}
          </button>
          <button
            type="button"
            onClick={() => applyLive(live === candidate.id ? null : candidate.id)}
            className={`lab-btn ${live === candidate.id ? "is-live" : ""}`}
          >
            <Eye className="h-4 w-4" />
            {live === candidate.id
              ? isSv
                ? "Används i navigeringen nu"
                : "Live in the navigation"
              : isSv
              ? "Testa i navigeringen"
              : "Try it in the navigation"}
          </button>
          <button type="button" onClick={() => toggleShortlist(candidate.id)} className="lab-btn">
            <Pin className="h-4 w-4" />
            {isSv ? "Lägg till i final" : "Add to finalists"}
          </button>
          <button
            type="button"
            onClick={() => recordVote(candidate.id)}
            className={`lab-btn ${vote === candidate.id ? "is-voted" : ""}`}
          >
            <Wand2 className="h-4 w-4" />
            {vote === candidate.id
              ? isSv
                ? "Din favorit"
                : "Your favourite"
              : isSv
              ? "Rösta som bäst"
              : "Vote as best"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(LOGO_CANDIDATES[0].id);
              setTone("dark");
              setBackdrop("mesh");
              setPx(200);
              setMotionOn(true);
            }}
            className="lab-btn is-ghost"
          >
            <RotateCcw className="h-4 w-4" />
            {isSv ? "Nollställ" : "Reset"}
          </button>
        </section>

        {/* ── the six ── */}
        <section className="lab-grid">
          {LOGO_CANDIDATES.map((item) => {
            const active = item.id === selected;
            return (
              <motion.div
                key={item.id}
                layout
                className={`lab-card ${active ? "is-active" : ""} ${live === item.id ? "is-live" : ""}`}
                onClick={() => setSelected(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelected(item.id);
                }}
                whileHover={{ y: -4 }}
              >
                <div className="lab-card-art" style={{ background: currentBackdrop.css }}>
                  <div
                    className={motionOn ? "" : "is-frozen"}
                    dangerouslySetInnerHTML={{ __html: item.build(96, tone) }}
                  />
                </div>
                <div className="lab-card-body">
                  <strong>
                    {item.name}
                    {vote === item.id && <Check className="ml-1 inline h-3.5 w-3.5 text-emerald-300" />}
                  </strong>
                  <small>{item.tag[lang]}</small>
                  <p>{item.note[lang]}</p>
                </div>
                <div className="lab-card-tools">
                  <button
                    type="button"
                    className="lab-mini"
                    onClick={(event) => {
                      event.stopPropagation();
                      downloadSvg(logoSvg(item, 512, tone), `budai-${item.id}.svg`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    SVG
                  </button>
                  <button
                    type="button"
                    className={`lab-mini ${shortlist.includes(item.id) ? "is-on" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleShortlist(item.id);
                    }}
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {isSv ? "Final" : "Final"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ── finalists ── */}
        {pinned.length > 0 && (
          <section className="lab-finalists">
            <h2>
              {isSv ? "Finalister" : "Finalists"} <span>({pinned.length}/4)</span>
            </h2>
            <div className="lab-finalist-row">
              {pinned.map((item) => (
                <div key={item.id} className="lab-finalist">
                  <div className={motionOn ? "" : "is-frozen"} dangerouslySetInnerHTML={{ __html: item.build(120, tone) }} />
                  <strong>{item.name}</strong>
                  <button type="button" className="lab-mini" onClick={() => recordVote(item.id)}>
                    <Wand2 className="h-3.5 w-3.5" />
                    {isSv ? "Bäst" : "Best"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="lab-footnote">
          {isSv
            ? "Prism Core v2 ligger kvar överallt tills en kandidat vinner — då byts favicon, header, footer, OG-bild och alla laddningsskärmar i samma veva."
            : "Prism Core v2 stays everywhere until a candidate wins — then favicon, header, footer, OG card and every loading screen change together."}
        </p>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="lab-toast"
            role="status"
          >
            <Check className="h-3.5 w-3.5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
