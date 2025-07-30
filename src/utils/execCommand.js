import { execSync } from "child_process";

export function execCommand(cmd) {
  execSync(cmd, { stdio: "inherit" });
}
