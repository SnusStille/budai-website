const ts = require("typescript");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const moduleUnderTest = { exports: {} };
new Function(
  "exports",
  ts.transpileModule(fs.readFileSync("lib/playground/stream.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
)(moduleUnderTest.exports);
const { visibleStreamText } = moduleUnderTest.exports;
const reply = "Hello, Åsa.\n\n[[MEMORY: user is Åsa]]";
for (let i = 1; i <= reply.length; i++) {
  assert.ok(
    !visibleStreamText(reply.slice(0, i)).includes("[[MEMORY"),
    `Leaked marker at chunk ${i}`,
  );
}
assert.equal(visibleStreamText(reply), "Hello, Åsa.");
assert.equal(visibleStreamText("const a = [1, 2];"), "const a = [1, 2];");
assert.equal(visibleStreamText("A [[mem"), "A ");
assert.equal(visibleStreamText("Ordinary reply."), "Ordinary reply.");
console.log("PASS: split memory marker, Unicode, code arrays, ordinary text");
