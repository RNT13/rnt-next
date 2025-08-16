import chalk from "chalk";
import inquirer from "inquirer";

export async function promptConfig(cliArgs = []) {
  let appName = cliArgs[0];

  // 1. Pergunta o nome do projeto se não for passado como argumento
  if (!appName) {
    const { appName: name } = await inquirer.prompt([
      {
        type: "input",
        name: "appName",
        message: "Qual o nome do seu projeto?",
        validate: (input) => {
          if (
            /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
              input
            )
          ) {
            return true;
          }
          return "Por favor, insira um nome de projeto válido (letras minúsculas, hífens).";
        },
      },
    ]);
    appName = name;
  }

  console.log(`\nOk, vamos configurar seu projeto ${chalk.green(appName)}!\n`);

  // 2. Agrupa as perguntas por categoria (Frontend, Backend, etc.)
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "cssChoice",
      message: "Qual biblioteca de estilização você prefere?",
      choices: [
        { name: "Styled Components", value: "Styled Components" },
        { name: "Tailwind CSS", value: "Tailwind CSS" },
      ],
    },
    {
      type: "list",
      name: "projectType",
      message: "Qual tipo de projeto você quer criar?",
      choices: [
        {
          name: "Completo (com páginas e componentes de exemplo)",
          value: "complete",
        },
        { name: "Limpo (estrutura mínima, sem exemplos)", value: "empty" },
      ],
    },
    {
      type: "checkbox",
      name: "features",
      message: "Selecione os recursos adicionais:",
      choices: [
        new inquirer.Separator("--- Ferramentas e Qualidade ---"),
        {
          name: "Instalar Jest para testes",
          value: "installTests",
          checked: true,
        },
        new inquirer.Separator("--- Frontend ---"),
        {
          name: "Adicionar bibliotecas úteis (Formik, Yup, Framer Motion, etc.)",
          value: "installExtraDeps",
          checked: true,
        },
        new inquirer.Separator("--- Backend ---"),
        {
          name: "Configurar ambiente de backend (Prisma + JWT)",
          value: "installBackend",
          checked: false,
        },
      ],
    },
  ]);

  // 3. Processa as respostas para o formato esperado pelo resto do script
  const useEmpty = answers.projectType === "empty";
  const installTests = answers.features.includes("installTests");
  const installExtraDeps = answers.features.includes("installExtraDeps");
  const installBackend = answers.features.includes("installBackend");

  // 4. Mostra um resumo claro e pede a confirmação final
  console.log(chalk.cyan("\n--- Resumo da Configuração ---"));
  console.log(`Nome do Projeto: ${chalk.green(appName)}`);
  console.log(`Estilização:     ${chalk.yellow(answers.cssChoice)}`);
  console.log(
    `Tipo de Projeto: ${chalk.yellow(useEmpty ? "Limpo" : "Completo")}`
  );
  console.log(
    `Testes (Jest):   ${installTests ? chalk.green("Sim") : chalk.red("Não")}`
  );
  console.log(
    `Libs Extras:     ${
      installExtraDeps ? chalk.green("Sim") : chalk.red("Não")
    }`
  );
  console.log(
    `Backend (Prisma):${installBackend ? chalk.green("Sim") : chalk.red("Não")}`
  );
  console.log(chalk.cyan("-----------------------------\n"));

  const { confirmConfig } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmConfig",
      message: "Tudo certo? Podemos criar o projeto com essas configurações?",
      default: true,
    },
  ]);

  if (!confirmConfig) {
    console.log(chalk.yellow("❌ Operação cancelada pelo usuário."));
    process.exit(0);
  }

  // Retorna um objeto limpo e estruturado
  return {
    appName,
    cssChoice: answers.cssChoice,
    useEmpty,
    installTests,
    installExtraDeps,
    installBackend,
  };
}
