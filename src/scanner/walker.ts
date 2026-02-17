import { glob } from "glob";
import path from "node:path";

const IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.nuxt/**",
  "**/.next/**",
  "**/coverage/**",
  "**/*.min.js",
  "**/*.min.css",
];

export async function walkFiles(
  projectPath: string,
  fileGlob: string,
): Promise<string[]> {
  const pattern = path.join(projectPath, fileGlob);
  const files = await glob(pattern, {
    ignore: IGNORE_PATTERNS.map((p) => path.join(projectPath, p)),
    nodir: true,
    absolute: true,
  });
  return files.sort();
}
