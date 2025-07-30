import fs from "fs-extra";
import path from "path";

export async function ensureFolders(basePath, folders) {
  for (const folder of folders) {
    await fs.ensureDir(path.join(basePath, folder));
  }
}

export async function writeFile(filePath, content) {
  await fs.outputFile(filePath, content);
}
