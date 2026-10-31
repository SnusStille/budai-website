/** Limits shared with the Playground API. Lengths are JavaScript UTF-16 code units. */
export const MAX_PLAYGROUND_MESSAGE_CHARS = 4000;
export const MAX_PLAYGROUND_HISTORY_MESSAGES = 12;

export type ApiChatMessage = { role: "user" | "assistant"; content: string };

/** Keep the most recent turns; label any earlier message shortened for the API. */
export function prepareHistory(messages: ApiChatMessage[], lang: "sv" | "en") {
  const recent = messages.slice(-MAX_PLAYGROUND_HISTORY_MESSAGES);
  const suffix = lang === "sv" ? "\n\n[Historiskt meddelande förkortat för detta anrop.]" : "\n\n[Earlier message shortened for this request.]";
  let shortened = false;
  const prepared = recent.map((message, index) => {
    if (index === recent.length - 1 || message.content.length <= MAX_PLAYGROUND_MESSAGE_CHARS) return message;
    shortened = true;
    return { ...message, content: message.content.slice(0, MAX_PLAYGROUND_MESSAGE_CHARS - suffix.length) + suffix };
  });
  return { messages: prepared, shortened };
}
