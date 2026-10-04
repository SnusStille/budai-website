"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Copy, Download, Link2, Lock, Sparkles } from "lucide-react";
import Markdown from "@/components/playground/Markdown";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { decodeShare, type SharedThread } from "@/lib/playground/share";

export default function ShareView() {
  const { lang } = useLang();
  const isSv = lang === "sv";
  const [thread, setThread] = useState<SharedThread | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "empty">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    const decoded = decodeShare(raw);
    setThread(decoded);
    setState(decoded ? "ok" : "empty");
  }, []);

  const stamp = useMemo(() => {
    if (!thread?.created) return "";
    return new Date(thread.created).toLocaleString(isSv ? "sv-SE" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [thread?.created, isSv]);

  const exportMarkdown = () => {
    if (!thread) return;
    const body = thread.turns
      .map((turn) => `## ${turn.r === "u" ? (isSv ? "Du" : "You") : "BudAI"}\n\n${turn.c}\n`)
      .join("\n");
    const blob = new Blob([`# BudAI · ${thread.title || "chat"}\n\n${body}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budai-shared-chat.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <main className="share-page">
      <div className="share-glow" aria-hidden />

      <header className="share-head">
        <Link href="/" className="share-back">
          <BudAILogo size="xs" animated />
          BudAI
        </Link>
        <span className="share-readonly">
          <Lock className="h-3.5 w-3.5" />
          {isSv ? "Delad, skrivskyddad konversation" : "Shared, read-only conversation"}
        </span>
      </header>

      <div className="share-wrap">
        {state === "empty" && (
          <div className="share-empty">
            <span className="share-empty-icon">
              <Link2 className="h-5 w-5" />
            </span>
            <h1>{isSv ? "Länken innehåller ingen konversation" : "This link carries no conversation"}</h1>
            <p>
              {isSv
                ? "Dela en chatt från Playground så dyker hela samtalet upp här — utan konto, utan server."
                : "Share a chat from the Playground and the whole conversation shows up here — no account, no server."}
            </p>
            <Link href="/#playground" className="share-cta">
              {isSv ? "Öppna Playground" : "Open the Playground"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {state === "ok" && thread && (
          <>
            <div className="share-title-block">
              <span className="share-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                {isSv ? "Delat från BudAI Playground" : "Shared from the BudAI Playground"}
              </span>
              <h1>{thread.title || (isSv ? "En BudAI-konversation" : "A BudAI conversation")}</h1>
              <div className="share-meta">
                <span>
                  {thread.turns.filter((t) => t.r === "u").length} {isSv ? "frågor" : "questions"} ·{" "}
                  {thread.turns.length} {isSv ? "meddelanden" : "messages"}
                </span>
                {stamp && (
                  <span className="share-meta-date">
                    <Calendar className="h-3.5 w-3.5" />
                    {stamp}
                  </span>
                )}
              </div>
              <div className="share-actions">
                <button type="button" onClick={copyLink} className="share-btn is-primary">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? (isSv ? "Kopierad" : "Copied") : isSv ? "Kopiera länk" : "Copy link"}
                </button>
                <button type="button" onClick={exportMarkdown} className="share-btn">
                  <Download className="h-3.5 w-3.5" />
                  Markdown
                </button>
                <Link href="/#playground" className="share-btn">
                  {isSv ? "Starta din egen" : "Start your own"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="share-thread">
              {thread.turns.map((turn, index) => (
                <motion.div
                  key={`${turn.t}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.5) }}
                  className={`share-turn ${turn.r === "u" ? "is-user" : "is-ai"}`}
                >
                  <div className="share-avatar">
                    {turn.r === "u" ? <span>{isSv ? "Du" : "You"}</span> : <BudAILogo size="xs" animated={false} />}
                  </div>
                  <div className="share-bubble">
                    {turn.r === "u" ? <p>{turn.c}</p> : <Markdown text={turn.c} />}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="share-foot">
              <p>
                {isSv
                  ? "Det här är en ögonblicksbild. Konversationen ligger i länken — inte hos oss."
                  : "This is a snapshot. The conversation lives in the link — not on our servers."}
              </p>
              <Link href="/#waitlist" className="share-cta is-soft">
                {isSv ? "Få 10 % early access" : "Get 10% early access"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
