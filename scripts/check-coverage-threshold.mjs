import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const MIN_LINES = 90;

const packages = ["backend", "frontend"];
let failed = false;

for (const pkg of packages) {
  const summaryPath = path.join(root, pkg, "coverage", "coverage-summary.json");
  if (!fs.existsSync(summaryPath)) {
    console.error(`Fichier manquant: ${summaryPath} (lancer npm run test:coverage d'abord)`);
    failed = true;
    continue;
  }
  const data = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  const pct = data.total?.lines?.pct;
  if (typeof pct !== "number") {
    console.error(`${pkg}: impossible de lire total.lines.pct`);
    failed = true;
    continue;
  }
  if (pct < MIN_LINES) {
    console.error(`${pkg}: couverture lignes ${pct}% < ${MIN_LINES}%`);
    failed = true;
  } else {
    console.log(`${pkg}: couverture lignes ${pct}% (seuil ${MIN_LINES}%)`);
  }
}

process.exit(failed ? 1 : 0);
