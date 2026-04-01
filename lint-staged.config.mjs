import path from "node:path";

function toBackendRel(files) {
  return files.map((f) =>
    path.relative(path.join(process.cwd(), "backend"), path.resolve(f)).replace(/\\/g, "/")
  );
}

function toFrontendRel(files) {
  return files.map((f) =>
    path.relative(path.join(process.cwd(), "frontend"), path.resolve(f)).replace(/\\/g, "/")
  );
}

export default {
  "backend/**/*.{ts,mts}": (files) => {
    const rel = toBackendRel(files);
    if (rel.length === 0) return [];
    const quoted = rel.map((r) => `"${r}"`).join(" ");
    return [
      `npm run lint:fix --prefix backend -- ${quoted}`,
      `npx prettier --write ${files.map((f) => `"${path.resolve(f)}"`).join(" ")}`,
      `npm run test:related --prefix backend -- ${quoted}`,
    ];
  },
  "frontend/**/*.{ts,tsx}": (files) => {
    const rel = toFrontendRel(files);
    if (rel.length === 0) return [];
    const quoted = rel.map((r) => `"${r}"`).join(" ");
    return [
      `npm run lint:fix --prefix frontend -- ${quoted}`,
      `npx prettier --write ${files.map((f) => `"${path.resolve(f)}"`).join(" ")}`,
      `npm run test:related --prefix frontend -- ${quoted}`,
    ];
  },
  "*.{json,md,yml,yaml}": (files) => [`npx prettier --write ${files.map((f) => `"${path.resolve(f)}"`).join(" ")}`],
};
