"use client";

import { useLang } from "@/components/ui/LanguageContext";
import { createStatusScenes } from "@/components/status/status-scenes";

export default function StatusStaticStory() {
  const { lang } = useLang();
  const scenes = createStatusScenes(lang);
  const sv = lang === "sv";

  return (
    <div className="status-static-story" role="region" aria-label={sv ? "Resans kapitel" : "Journey chapters"}>
      <div className="status-static-orbit" aria-hidden="true">
        <div className="status-static-ring status-static-ring-a" />
        <div className="status-static-ring status-static-ring-b" />
        <span className="status-static-core" />
      </div>
      <ol className="status-static-list">
        {scenes.map((scene, index) => (
          <li key={scene.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{scene.title}</h3>
              <p>{scene.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
