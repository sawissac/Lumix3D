import { build } from "esbuild";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

await build({
  entryPoints: [resolve(root, "src/embed/lumix-scene.tsx")],
  outfile: resolve(root, "public/lumix-embed.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  minify: true,
  sourcemap: false,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  loader: { ".js": "jsx" },
  alias: {
    "@": resolve(root, "src"),
  },
  logLevel: "info",
});
