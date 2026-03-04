import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const appRoot = path.join(process.cwd(), "src", "app");
const archiveFolderName = "_archive";
const brandingMatch = "ShadcnStore";
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);

const collectAppFiles = (dirPath: string): string[] => {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === archiveFolderName) {
        continue;
      }
      files.push(...collectAppFiles(fullPath));
      continue;
    }

    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

test("branding uses site config across app routes", () => {
  const appFiles = collectAppFiles(appRoot);

  for (const filePath of appFiles) {
    const file = readFileSync(filePath, "utf8");
    expect(file).not.toContain(brandingMatch);
  }
});
