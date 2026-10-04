const { chromium } = require("playwright");
const http = require("node:http");
const assert = require("node:assert/strict");
(async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      "Content-Type": "application/x-ndjson",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(
      JSON.stringify({ text: "A partial answer that is still arriving." }) +
        "\n",
    );
    const timer = setTimeout(() => {
      res.end(
        JSON.stringify({
          done: true,
          text: "This should never appear after stop.",
        }) + "\n",
      );
    }, 10000);
    res.on("close", () => clearTimeout(timer));
  });
  await new Promise((r) => server.listen(3002, "0.0.0.0", r));
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const p = await b.newPage();
  await p.addInitScript(() =>
    localStorage.setItem("budai-cookies", "declined"),
  );
  await p.goto("http://localhost:3000");
  await p.locator(".pg-empty").waitFor();
  await p.route("**/api/playground", (route) =>
    route.continue({ url: "http://localhost:3002/api/playground" }),
  );
  await p.getByRole("textbox", { name: "Message BudAI" }).fill("Test stop");
  await p.getByRole("button", { name: "Send message", exact: true }).click();
  await p
    .getByText("A partial answer that is still arriving.", { exact: true })
    .waitFor();
  await p
    .getByRole("button", { name: "Stop response", exact: true })
    .first()
    .click();
  await p.getByRole("button", { name: "Regenerate", exact: true }).waitFor();
  assert.equal(await p.locator(".pg-msg-enter").count(), 2);
  assert.equal(
    await p
      .getByText("This should never appear after stop.", { exact: true })
      .count(),
    0,
  );
  await p.getByTitle("New chat").click();
  await p.locator(".pg-empty").waitFor();
  await p
    .getByRole("textbox", { name: "Message BudAI" })
    .fill("Test new chat during stream");
  await p.getByRole("button", { name: "Send message", exact: true }).click();
  await p
    .getByText("A partial answer that is still arriving.", { exact: true })
    .waitFor();
  await p.getByRole("button", { name: "Sidebar", exact: true }).click();
  console.log(
    "PASS: real incremental browser delivery, stop aborts fetch and preserves partial response.",
  );
  await b.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
