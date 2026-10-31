/** Four stages recovered from BudAI 43f44c9; memory copy reflects the current product. */
export const ORIGINAL_BRAIN_STAGES = [
  {
    sv: { title: "Skriv", body: "Mejl, rapporter och förslag på några sekunder." },
    en: { title: "Write", body: "Emails, reports and proposals in seconds." },
  },
  {
    sv: { title: "Minne", body: "Minnen kan sparas automatiskt. Du kan styra dem." },
    en: { title: "Memory", body: "Memories may be saved automatically. You control them." },
  },
  {
    sv: { title: "Beslut", body: "Sammanfattningar, risker och nästa steg." },
    en: { title: "Decide", body: "Summaries, risks and next steps." },
  },
  {
    sv: { title: "Röst & syn", body: "Ladda upp bilder och prata i stället för att skriva." },
    en: { title: "Voice & vision", body: "Upload images and speak instead of typing." },
  },
];

/** Original region-facing poses, reconstructed absolutely rather than damped deltas. */
export const ORIGINAL_REGION_POSES = [[0,.12],[-Math.PI/2,.12],[0,.9],[Math.PI,.12]] as const;
