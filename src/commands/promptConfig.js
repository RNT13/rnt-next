import inquirer from "inquirer";

export async function promptConfig(cliArgs = []) {
  let appName = cliArgs[0];
  if (!appName) {
    const { appName: name } = await inquirer.prompt([
      {
        type: "input",
        name: "appName",
        message: "Digite o nome do projeto:",
        validate: (input) =>
          input ? true : "Nome do projeto não pode ser vazio",
      },
    ]);
    appName = name;
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "cssChoice",
      message: "1️⃣ Qual biblioteca de CSS você deseja usar?",
      choices: ["Styled Components", "Tailwind CSS"],
    },
    {
      type: "confirm",
      name: "useEmpty",
      message: "2️⃣ Deseja criar um projeto limpo (--empty)?",
      default: false,
    },
    {
      type: "confirm",
      name: "installTests",
      message: "3️⃣ Deseja instalar dependências de teste?",
      default: true,
    },
    {
      type: "confirm",
      name: "installExtraDeps",
      message:
        "4️⃣ Deseja instalar pacote de dependências adicionais (Formik, iMask, etc)?",
      default: true,
    },
    {
      type: "confirm",
      name: "installBackend",
      message: "5️⃣ Deseja instalar ambiente backend com Prisma + MySQL?",
      default: false,
    },
    {
      type: "confirm",
      name: "confirmConfig",
      message: "✅ Confirma as configurações acima?",
      default: true,
    },
  ]);

  if (!answers.confirmConfig) {
    console.log("❌ Operação cancelada pelo usuário.");
    process.exit(0);
  }

  return { ...answers, appName };
}
