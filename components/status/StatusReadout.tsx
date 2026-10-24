"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Check, Clock3, RefreshCw, Server, Settings2, TriangleAlert, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

type Health = { state: "checking" | "online" | "offline"; latency?: number; checkedAt?: number };
type Features = {
  state: "checking" | "available" | "unknown";
  imageGeneration?: boolean;
  qualityModel?: boolean;
  fastModel?: boolean;
  deepModel?: boolean;
};

function formatTime(timestamp: number | undefined, sv: boolean) {
  if (!timestamp) return "—";
  try {
    return new Intl.DateTimeFormat(sv ? "sv-SE" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Europe/Stockholm",
      timeZoneName: "short",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleTimeString();
  }
}

function CheckRow({
  label,
  value,
  detail,
  state,
}: {
  label: string;
  value: string;
  detail?: string;
  state: "on" | "off" | "unknown";
}) {
  const Icon = state === "on" ? Check : state === "off" ? X : TriangleAlert;
  const tone = state === "on" ? "text-emerald-300" : state === "off" ? "text-white/45" : "text-amber-200";
  return (
    <li className="flex items-start justify-between gap-4 border-t border-white/[0.07] py-3.5 first:border-0 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-white/85">{label}</p>
        {detail && <p className="mt-1 text-xs leading-relaxed text-white/45">{detail}</p>}
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />{value}
      </span>
    </li>
  );
}

export default function StatusReadout() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [health, setHealth] = useState<Health>({ state: "checking" });
  const [features, setFeatures] = useState<Features>({ state: "checking" });
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener("budai:status-refresh", onRefresh);
    return () => window.removeEventListener("budai:status-refresh", onRefresh);
  }, [refresh]);

  useEffect(() => {
    const controller = new AbortController();
    let pending = 2;
    let active = true;
    const done = () => {
      pending -= 1;
      if (active && pending <= 0) setRefreshing(false);
    };
    setRefreshing(true);

    const started = performance.now();
    fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as { ok?: boolean; t?: number } | null;
        const reachable = response.ok && body?.ok === true;
        setHealth({
          state: reachable ? "online" : "offline",
          latency: Math.round(performance.now() - started),
          checkedAt: typeof body?.t === "number" ? body.t : Date.now(),
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setHealth({ state: "offline", checkedAt: Date.now() });
      })
      .finally(done);

    fetch("/api/features", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Feature configuration unavailable");
        const body = await response.json() as {
          imageGeneration?: boolean;
          models?: { available?: { quality?: boolean; fast?: boolean; deep?: boolean } };
        };
        setFeatures({
          state: "available",
          imageGeneration: body.imageGeneration === true,
          qualityModel: body.models?.available?.quality === true,
          fastModel: body.models?.available?.fast === true,
          deepModel: body.models?.available?.deep === true,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFeatures({ state: "unknown" });
      })
      .finally(done);

    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [refreshCount, refresh]);

  const timeLabel = formatTime(health.checkedAt, sv);
  const healthLabel = health.state === "checking"
    ? sv ? "Kontrollerar" : "Checking"
    : health.state === "online"
      ? sv ? "Svarar" : "Responding"
      : sv ? "Kan inte nås" : "Unreachable";
  const featureValue = (value: boolean | undefined) => {
    if (features.state !== "available" || value === undefined) return sv ? "Okänt" : "Unknown";
    return value ? sv ? "Konfigurerad" : "Configured" : sv ? "Av" : "Off";
  };
  const featureState = (value: boolean | undefined): "on" | "off" | "unknown" =>
    features.state !== "available" || value === undefined ? "unknown" : value ? "on" : "off";

  return (
    <section id="live-checks" className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cyan/70">
            {sv ? "Kontroller · uppdateras live" : "Live checks · updated on request"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {sv ? "Det som faktiskt går att kontrollera." : "What can actually be checked."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
            {sv
              ? "Webbkontrollen verifierar att BudAI:s hälsorutt svarar. Funktionsraderna visar serverkonfiguration — inga av kontrollerna testar externa AI-leverantörers drifttid."
              : "The web check verifies that BudAI's health route responds. Feature rows report server configuration; none of these checks test external AI-provider uptime."}
          </p>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.025] px-4 text-sm text-white/80 transition hover:border-accent-cyan/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            {sv ? "Kontrollera igen" : "Run checks again"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="status-readout-card sm:col-span-2" aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${health.state === "online" ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200" : health.state === "offline" ? "border-red-300/20 bg-red-300/[0.08] text-red-200" : "border-white/10 bg-white/[0.04] text-white/50"}`}>
                  {health.state === "offline" ? <TriangleAlert className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{sv ? "BudAI:s webbserver" : "BudAI web service"}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {health.state === "online"
                      ? sv ? "Hälsorutten svarade på begäran" : "Health route responded to the request"
                      : health.state === "offline"
                        ? sv ? "Hälsorutten kunde inte nås" : "Health route could not be reached"
                        : sv ? "Skickar kontroll" : "Sending check"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${health.state === "online" ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200" : health.state === "offline" ? "border-red-300/20 bg-red-300/[0.06] text-red-200" : "border-white/10 bg-white/[0.04] text-white/50"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${health.state === "online" ? "bg-emerald-300" : health.state === "offline" ? "bg-red-300" : "bg-white/35"}`} />
                {healthLabel}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              {health.latency !== undefined && <span>{health.latency} ms {sv ? "tur och retur" : "round trip"}</span>}
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3" />{sv ? "Senast kontrollerad" : "Last checked"} {timeLabel}</span>
            </div>
          </article>

          <article className="status-readout-card">
            <div className="mb-4 flex items-center gap-2 text-accent-cyan/80">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">{sv ? "Serverkonfiguration" : "Server configuration"}</h3>
            </div>
            <ul>
              <CheckRow
                label={sv ? "Standardmodell · Anthropic" : "Default model · Anthropic"}
                value={featureValue(features.qualityModel)}
                state={featureState(features.qualityModel)}
                detail={sv ? "Nyckel konfigurerad — leverantörens drifttid kontrolleras inte" : "Key configured; provider uptime is not probed"}
              />
              <CheckRow
                label={sv ? "Bildgenerering" : "Image generation"}
                value={featureValue(features.imageGeneration)}
                state={featureState(features.imageGeneration)}
                detail={sv ? "Baserat på serverns OpenAI-konfiguration" : "Based on server-side OpenAI configuration"}
              />
            </ul>
          </article>

          <article className="status-readout-card">
            <div className="mb-4 flex items-center gap-2 text-accent-purple/90">
              <Activity className="h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">{sv ? "Valfria modellnivåer" : "Optional model tiers"}</h3>
            </div>
            <ul>
              <CheckRow
                label={sv ? "Snabb" : "Fast"}
                value={featureValue(features.fastModel)}
                state={featureState(features.fastModel)}
                detail={sv ? "Separat modellkonfiguration" : "Separately configured model"}
              />
              <CheckRow
                label={sv ? "Djup" : "Deep"}
                value={featureValue(features.deepModel)}
                state={featureState(features.deepModel)}
                detail={sv ? "Separat modellkonfiguration" : "Separately configured model"}
              />
            </ul>
          </article>
        </div>
      </div>
      <p className="mt-6 text-right font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
        {sv ? "Öppen insyn · endast konfigurationsstatus" : "Transparent by design · configuration only"}
      </p>
    </section>
  );
}
