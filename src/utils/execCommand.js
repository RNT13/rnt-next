import { execSync } from "child_process";

export function execCommand(command, cwd = process.cwd()) {
  execSync(command, { stdio: "inherit", cwd });
}
