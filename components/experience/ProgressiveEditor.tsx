"use client";

import { useEffect, useRef, useState } from "react";
import { CODE_LENGTH, CODE_LINES, codeCharactersAt } from "@/lib/experience/code";
import { subscribeJourney } from "@/lib/experience/scroll";

export default function ProgressiveEditor({ staticFrame = false }: { staticFrame?: boolean }) {
  const source = useRef<HTMLDivElement>(null);
  const [characters, setCharacters] = useState(staticFrame ? CODE_LENGTH : 0);
  useEffect(() => {
    if (staticFrame) return;
    return subscribeJourney((frame) => setCharacters(frame.reduced ? CODE_LENGTH : codeCharactersAt(frame.sections.about ?? 0)));
  }, [staticFrame]);
  useEffect(() => {
    const element = source.current;
    if (!element) return;
    // On a narrow monitor, the IDE viewport follows its cursor, not the page.
    // Absolute positioning keeps this exactly reversible with native scroll.
    const line = element.querySelector<HTMLElement>(".editor-current-line") ?? element.lastElementChild as HTMLElement | null;
    element.scrollTop = line ? Math.max(0, line.offsetTop - element.clientHeight + line.offsetHeight * 2) : 0;
  }, [characters]);
  let consumed = 0;
  return (
    <div className="builder-editor" data-code-characters={characters}>
      <div className="editor-titlebar"><span className="editor-traffic"><i /><i /><i /></span><span>BUDAI — DEVELOPMENT ENVIRONMENT</span><span>⌘ K</span></div>
      <div className="editor-tabs"><span className="editor-file">TS <b>create.ts</b><i>×</i></span><span>src / intelligence / create.ts</span></div>
      <div ref={source} className="editor-source">
        {CODE_LINES.map((tokens, index) => {
          const length = tokens.reduce((sum, token) => sum + token.text.length, 0);
          const visible = Math.max(0, Math.min(length, characters - consumed));
          const cursor = characters >= consumed && characters <= consumed + length && characters < CODE_LENGTH;
          consumed += length + 1;
          let used = 0;
          return (
            <div className={`editor-line ${cursor ? "editor-current-line" : ""}`} key={index}>
              <span className="editor-line-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{tokens.map((token, i) => { const take = Math.max(0, visible - used); used += token.text.length; return <span className={`syntax-${token.tone}`} key={i}>{token.text.slice(0, take)}</span>; })}{cursor && <span className="editor-cursor" />}</span>
            </div>
          );
        })}
      </div>
      <div className="editor-statusbar"><span>⑂ main <i /> TypeScript</span><span>{characters >= CODE_LENGTH ? "EXAMPLE COMPLETE" : "SCROLL TO COMPOSE"}</span><span>ILLUSTRATIVE CODE · NOT A LIVE RESPONSE</span></div>
    </div>
  );
}
