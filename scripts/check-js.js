// Syntax-checks every .js file in the repo with `node --check`.
// No dependencies required - keeps /ship able to catch broken JS before it ships.
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set([".git", ".wrangler", "node_modules"]);

function findJsFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

const files = findJsFiles(ROOT);
let failed = false;

for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    console.log(`OK   ${path.relative(ROOT, file)}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${path.relative(ROOT, file)}`);
    console.error(err.stderr.toString());
  }
}

console.log(`\n${files.length} JS file(s) checked.`);
if (failed) process.exit(1);
