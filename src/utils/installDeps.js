import { execCommand } from "./execCommand.js";

export function installDependencies(prodDeps, devDeps, cwd) {
  if (prodDeps.length > 0) {
    execCommand(`npm install ${prodDeps.join(" ")}`, cwd);
  }
  if (devDeps.length > 0) {
    execCommand(`npm install --save-dev ${devDeps.join(" ")}`, cwd);
  }
}
