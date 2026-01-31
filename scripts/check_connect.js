const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const absoluteDir = path.resolve(dir);
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    const resolvedFile = path.resolve(dir, file);

    // Security: Ensure resolved path stays within the intended directory
    if (!resolvedFile.startsWith(absoluteDir)) {
      console.warn(`[Security] Skipping suspicious path: ${resolvedFile}`);
      return;
    }

    file = resolvedFile;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const apiDir = path.resolve(__dirname, "../src/app/api");
const files = walk(apiDir).filter(
  (f) => f.endsWith("route.ts") || f.endsWith("route.js")
);

const missing = [];
files.forEach((f) => {
  const content = fs.readFileSync(f, "utf8");
  if (!content.includes("await connect()")) {
    missing.push(f.replace(process.cwd() + path.sep, ""));
  }
});

console.log("Checked", files.length, "route files");
if (missing.length === 0) {
  console.log("All route files contain await connect()");
} else {
  console.log("Files missing await connect():");
  missing.forEach((m) => console.log(" -", m));
}
