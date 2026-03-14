import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());
const portalIndexPath = path.join(repoRoot, "index.html");
const toolsIndexPath = path.join(repoRoot, "asterlab-tools", "index.html");
const appJsPath = path.join(repoRoot, "asterlab-tools", "app.js");

const portalIndex = fs.readFileSync(portalIndexPath, "utf8");
const toolsIndex = fs.readFileSync(toolsIndexPath, "utf8");
const appJs = fs.readFileSync(appJsPath, "utf8");

function ok(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  console.log(`✓ ${message}`);
}

const toolIds = [...appJs.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]);
const uniqueToolIds = [...new Set(toolIds)];

ok(toolIds.length === 18, `expected 18 tool IDs, found ${toolIds.length}`);
ok(uniqueToolIds.length === toolIds.length, "tool IDs are unique");
ok(appJs.includes('params.get("tool")'), "deep-link reader parses ?tool=");
ok(appJs.includes('url.searchParams.set("tool", state.activeTool)'), "deep-link writer persists active tool to URL");
ok(appJs.includes('window.addEventListener("popstate", handlePopState)'), "history navigation handler is wired");
ok(appJs.includes('copyCurrentToolDeepLink'), "copy deep-link action exists");
ok(toolsIndex.includes('id="copy-deep-link-btn"'), "deep-link button is present in tools UI");
ok(portalIndex.includes('href="/asterlab-tools/"'), "portal home links to /asterlab-tools/");
ok(portalIndex.includes('href="/dictation/"'), "portal home links to internal dictation app");

console.log("\nSummary");
console.log(JSON.stringify({ toolCount: toolIds.length, toolIds: uniqueToolIds }, null, 2));
