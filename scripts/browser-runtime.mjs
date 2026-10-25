import path from "node:path";
import { tmpdir } from "node:os";
import chromium, { inflate } from "@sparticuz/chromium";

/** Shared, browser-only sandbox setup. Production code never receives these flags. */
export async function browserRuntime() {
  const executablePath = process.env.BROWSER_EXECUTABLE_PATH || await chromium.executablePath();
  if (process.platform === "linux") await inflate(path.resolve("node_modules/@sparticuz/chromium/bin/al2023.tar.br"));
  const args = chromium.args.filter(arg => !["--single-process", "--in-process-gpu", "--disable-web-security", "--allow-running-insecure-content", "--disable-site-isolation-trials"].includes(arg));
  args.push("--disable-gpu-compositing");
  return { executablePath, args, env: { ...process.env, LD_LIBRARY_PATH: [path.join(tmpdir(), "al2023/lib"), process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") } };
}
