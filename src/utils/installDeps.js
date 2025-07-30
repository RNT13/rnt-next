import { execCommand } from "./execCommand.js";

export function installDependencies(prodDeps, devDeps) {
  if (prodDeps.length) {
    execCommand(`npm install ${prodDeps.join(" ")} --save`);
  }
  if (devDeps.length) {
    execCommand(`npm install ${devDeps.join(" ")} --save-dev`);
  }
}
