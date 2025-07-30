import { createProject } from "./commands/createProject.js";
import { promptConfig } from "./commands/promptConfig.js";

async function main() {
  const cliArgs = process.argv.slice(2);
  const config = await promptConfig(cliArgs);
  await createProject(config);
}

main().catch((error) => {
  console.error("❌ Erro ao criar o projeto:", error);
  process.exit(1);
});
