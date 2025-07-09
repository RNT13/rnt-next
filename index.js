#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const appName = process.argv[2] || "novo-app";
const appPath = path.join(process.cwd(), appName);

const execCommand = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Erro ao executar: ${cmd}`);
    process.exit(1);
  }
};

// Função utilitária para perguntar no terminal
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  console.log("🎨 RNT Next CLI - Criado por RNT");
  console.log("=====================================");
  console.log("📝 Configuração do Projeto");
  console.log("");

  // 1. Pergunta sobre a escolha do CSS
  const cssChoice = await askQuestion(
    "1️⃣ Qual biblioteca de CSS você deseja usar?\n   1. Styled Components\n   2. Tailwind CSS\n   Escolha (1 ou 2): "
  );

  // 2. Pergunta sobre Turbopack
  const turboChoice = await askQuestion(
    "\n2️⃣ Deseja habilitar o Turbopack?\n   1. Sim\n   2. Não\n   Escolha (1 ou 2): "
  );

  // 3. Pergunta sobre projeto limpo
  const emptyChoice = await askQuestion(
    "\n3️⃣ Deseja criar um projeto limpo (--empty)?\n   1. Sim (projeto vazio)\n   2. Não (com exemplos)\n   Escolha (1 ou 2): "
  );

  // 4. Pergunta sobre dependências de teste
  const testChoice = await askQuestion(
    "\n4️⃣ Deseja instalar dependências de teste?\n   1. Sim (Jest + Testing Library)\n   2. Não\n   Escolha (1 ou 2): "
  );

  // 5. Pergunta sobre dependências adicionais
  const extraDepsChoice = await askQuestion(
    "\n5️⃣ Deseja instalar pacote de dependências adicionais?\n   1. Sim (React Hook Form, Zod, iMask, etc.)\n   2. Não (apenas essenciais)\n   Escolha (1 ou 2): "
  );

  // Processando escolhas
  const useStyledComponents = cssChoice === "1";
  const useTailwind = cssChoice === "2" || !useStyledComponents;
  const useTurbo = turboChoice === "1";
  const useEmpty = emptyChoice === "1";
  const installTests = testChoice === "1";
  const installExtraDeps = extraDepsChoice === "1";

  const finalChoice = useStyledComponents ? "styled-components" : "tailwind";

  console.log("\n" + "=".repeat(50));
  console.log("📋 RESUMO DAS CONFIGURAÇÕES");
  console.log("=".repeat(50));
  console.log(
    `🎨 CSS: ${
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    }`
  );
  console.log(`⚡ Turbopack: ${useTurbo ? "Sim" : "Não"}`);
  console.log(`📦 Projeto: ${useEmpty ? "Limpo (--empty)" : "Com exemplos"}`);
  console.log(`🧪 Testes: ${installTests ? "Sim" : "Não"}`);
  console.log(`📚 Deps. Adicionais: ${installExtraDeps ? "Sim" : "Não"}`);
  console.log("=".repeat(50));

  const confirmChoice = await askQuestion(
    "\n✅ Confirma as configurações acima? (1=Sim, 2=Não): "
  );

  if (confirmChoice !== "1") {
    console.log("❌ Operação cancelada pelo usuário.");
    process.exit(0);
  }

  console.log("\n🚀 Iniciando criação do projeto...");

  // 🚀 Criando um novo projeto com Next.js e TypeScript
  console.log("📦 Criando projeto com Next.js...");

  let createCommand = `npx --yes create-next-app@latest ${appName} --typescript --eslint --app --src-dir --import-alias "@/*"`;

  // Adicionar flags baseadas nas escolhas
  if (useTailwind) {
    createCommand += " --tailwind";
  } else {
    createCommand += " --no-tailwind";
  }

  if (useTurbo) {
    createCommand += " --turbo";
  }

  if (useEmpty) {
    createCommand += " --empty";
  }

  execCommand(createCommand);

  // Verificar se o diretório foi criado antes de mudar para ele
  if (!fs.existsSync(appPath)) {
    console.error(`❌ Erro: Diretório ${appPath} não foi criado`);
    process.exit(1);
  }

  process.chdir(appPath);

  // 🎯 Instalando dependências baseadas na escolha
  console.log("📦 Instalando dependências de produção...");

  let prodDependencies =
    "react-redux @reduxjs/toolkit immer redux@latest clsx class-variance-authority lucide-react";

  if (finalChoice === "styled-components") {
    prodDependencies =
      "styled-components @types/styled-components " + prodDependencies;
  }

  if (installExtraDeps) {
    prodDependencies +=
      " imask zod react-hook-form react-hot-toast framer-motion react-icons";
  }

  execCommand(`npm install ${prodDependencies} --save`);

  console.log("📦 Instalando dependências de desenvolvimento...");

  let devDependencies =
    "eslint-plugin-prettier prettier eslint-config-prettier";

  if (finalChoice === "styled-components") {
    devDependencies += " @types/styled-components";
  }

  if (installTests) {
    devDependencies +=
      " jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom";
  }

  execCommand(`npm install ${devDependencies} --save-dev`);

  // 🏗 Criando estrutura de pastas
  console.log("📂 Criando estrutura de pastas...");
  const folders = [
    "src/styles",
    "src/components/ui",
    "src/lib",
    "src/hooks",
    "src/utils",
    "src/redux",
    "src/redux/slices",
    "src/types",
    ".vscode",
  ];

  if (!useEmpty) {
    folders.push(
      "src/components/layout",
      "src/components/layout/header",
      "src/components/layout/footer"
    );
  }

  if (installTests) {
    folders.push("__tests__", "src/__tests__");
  }

  folders.forEach((folder) =>
    fs.mkdirSync(path.join(appPath, folder), { recursive: true })
  );

  // 📝 Criando arquivos de configuração...
  console.log("📄 Criando arquivos de configuração...");

  // VSCode settings
  fs.writeFileSync(
    ".vscode/settings.json",
    JSON.stringify(
      {
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true,
          "source.fixAll": true,
        },
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "[typescriptreact]": {
          "editor.defaultFormatter": "vscode.typescript-language-features",
        },
        "typescript.tsdk": "node_modules/typescript/lib",
      },
      null,
      2
    )
  );

  // Prettierrc settings
  fs.writeFileSync(
    ".prettierrc",
    JSON.stringify(
      {
        trailingComma: "none",
        semi: false,
        singleQuote: true,
        printWidth: 150,
        arrowParens: "avoid",
      },
      null,
      2
    )
  );

  // Editorconfig settings
  fs.writeFileSync(
    ".editorconfig",
    `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
  );

  // Next.js config
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {`;

  if (useTurbo) {
    nextConfig += `
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },`;
  }

  if (finalChoice === "styled-components") {
    nextConfig += `
  compiler: {
    styledComponents: true,
  },`;
  }

  nextConfig += `
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['placehold.co'],
  },
}

module.exports = nextConfig
`;

  fs.writeFileSync("next.config.js", nextConfig);

  // Jest config se testes foram escolhidos
  if (installTests) {
    fs.writeFileSync(
      "jest.config.js",
      `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
`
    );

    fs.writeFileSync(
      "jest.setup.js",
      `import '@testing-library/jest-dom'
`
    );
  }

  // Theme configuration
  fs.writeFileSync(
    "src/styles/theme.ts",
    `// 🎨 ARQUIVO DE TEMA - Configurações de cores e breakpoints do projeto

export const media = {
  sm: '@media (max-width: 480px)',
  md: '@media (max-width: 768px)',
  lg: '@media (max-width: 1024px)'
}

export const transitions = {
  default: 'all 0.3s ease'
}

export const theme = {
  colors: {
    primaryColor: '#011627',
    secondaryColor: '#023864',
    thirdColor: '#0d6efd',
    forthColor: '#E25010',
    textColor: '#fff',
    yellow: '#ffff00',
    yellow2: '#E1A32A',
    blue: '#0000FF',
    blue2: '#1E90FF',
    gray: '#666666',
    gray2: '#a1a1a1',
    orange: '#ff4500',
    orange2: '#ff7f50',
    black: '#000',
    red: '#FF0000',
    redHover: '#FF4837',
    error: '#AB2E46',
    green: '#008000',
    green2: '#44BD32'
  }
}

export const darkTheme = {
  colors: {
    primaryColor: '#13161b',
    secondaryColor: '#1c1f25',
    background: '#2F2F2F',
    inputColor: '#0d0e12',
    white: '#121212',
    blue: '#0d6efd',
    blue2: '#0000FF',
    red: '#FF3347',
    green: '#28a745',
    orange: '#ff4500',
    yellow: '#fffF00',
    shadow: '#000',
    grey: '#a1a1a1',
    textColor: '#f1f1f1',
    neon: {
      pink1: '#FF1493',
      pink2: '#FF00FF',
      green1: '#39FF14',
      green2: '#00FF7F',
      blue1: '#00BFFF',
      blue2: '#00FFFF'
    }
  }
}

export const lightTheme = {
  colors: {
    primaryColor: '#666666',
    secondaryColor: '#a1a1a1',
    background: '#808080',
    inputColor: '#f1f1f1',
    white: '#ffffff',
    blue: '#3a86ff',
    blue2: '#0000FF',
    red: '#FF0000',
    green: '#34d399',
    orange: '#ff4500',
    yellow: '#ffff00',
    shadow: '#000',
    grey: '#a1a1a1',
    textColor: '#13161b',
    neon: {
      pink1: '#FF1493',
      pink2: '#FF00FF',
      green1: '#39FF14',
      green2: '#00FF7F',
      blue1: '#00FFFF',
      blue2: '#00BFFF'
    }
  }
}

export const themeConfig = {
  light: lightTheme,
  dark: darkTheme
}
`
  );

  // Criar arquivos específicos baseados na escolha
  if (finalChoice === "styled-components") {
    await createStyledComponentsFiles();
  } else {
    await createTailwindFiles();
  }

  // Providers
  fs.writeFileSync(
    "src/components/providers.tsx",
    `'use client'

// 🔧 PROVIDERS - Configuração de contextos globais

import { Provider } from 'react-redux'
import { store } from '@/redux/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}`
  );

  // Redux Store
  fs.writeFileSync(
    "src/redux/store.ts",
    `// 🏪 REDUX STORE - Configuração do gerenciamento de estado
// Adicione seus slices na pasta 'slices' e importe aqui

import { combineReducers, configureStore as toolkitConfigureStore } from '@reduxjs/toolkit'

// Import your slices here
// import counterSlice from './slices/counterSlice'

const rootReducer = combineReducers({
  // Add your reducers here
  // counter: counterSlice,
})

export type RootState = ReturnType<typeof rootReducer>

export function configureStore(preloadedState?: Partial<RootState>) {
  return toolkitConfigureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  })
}

export const store = configureStore()

export type AppStore = ReturnType<typeof configureStore>
export type AppDispatch = AppStore['dispatch']
export type RootReducer = typeof rootReducer`
  );

  // Criar layout baseado na escolha
  await createLayout(finalChoice, useEmpty);

  // Criar arquivos de exemplo se não for projeto vazio
  if (!useEmpty) {
    await createExampleFiles(finalChoice, installTests);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ PROJETO CRIADO COM SUCESSO!");
  console.log("=".repeat(50));
  console.log(`📁 Navegue para: cd ${appName}`);
  console.log("🚀 Execute: npm run dev");
  console.log(
    `🎨 CSS: ${
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    }`
  );
  console.log(`⚡ Turbopack: ${useTurbo ? "Habilitado" : "Desabilitado"}`);
  console.log(`📦 Tipo: ${useEmpty ? "Projeto limpo" : "Com exemplos"}`);
  if (installTests) {
    console.log("🧪 Testes: npm test");
  }
  if (installExtraDeps) {
    console.log("📚 Dependências adicionais instaladas");
  }
  console.log("💙 Criado por RNT");
  console.log("=".repeat(50));
}

async function createStyledComponentsFiles() {
  // Global Styles para Styled Components
  fs.writeFileSync(
    "src/styles/globalStyles.tsx",
    `'use client'

// 🎨 GLOBAL STYLES - Estilos globais com Styled Components

import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle\`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: \${theme.colors.primaryColor};
    color: \${theme.colors.textColor};
    font-family: 'Inter', sans-serif;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  html {
    scroll-behavior: smooth;
  }

  ul, ol {
    list-style: none;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
  }

  input, textarea {
    outline: none;
  }
\`;
`
  );

  // Styled Components Registry
  fs.writeFileSync(
    "src/lib/styled-components-registry.tsx",
    `'use client'

// 🔧 STYLED COMPONENTS REGISTRY - Necessário para SSR

import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  )
}`
  );
}

async function createTailwindFiles() {
  // Verificar se o globals.css já existe e atualizar
  const globalsPath = "src/app/globals.css";

  if (fs.existsSync(globalsPath)) {
    // Ler o conteúdo existente e adicionar customizações
    let existingContent = fs.readFileSync(globalsPath, "utf8");

    // Adicionar customizações se não existirem
    if (!existingContent.includes("/* RNT Custom Styles */")) {
      const customStyles = `

/* RNT Custom Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  list-style: none;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #011627;
  color: #fff;
  transition: background-color 0.3s, color 0.3s;
}

html {
  scroll-behavior: smooth;
}
`;

      fs.writeFileSync(globalsPath, existingContent + customStyles);
    }
  }
}

async function createLayout(cssChoice, useEmpty) {
  if (cssChoice === "styled-components") {
    // Layout com Styled Components
    fs.writeFileSync(
      "src/app/layout.tsx",
      `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import StyledComponentsRegistry from '@/lib/styled-components-registry'
import { GlobalStyles } from '@/styles/globalStyles'
import { Providers } from '@/components/providers'${
        !useEmpty
          ? `
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'`
          : ""
      }

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RNT Next App',
  description: 'Aplicação Next.js criada com RNT CLI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Providers>${
            !useEmpty
              ? `
            <Header />
            {children}
            <Footer />`
              : `
            {children}`
          }
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
`
    );
  } else {
    // Layout com Tailwind
    fs.writeFileSync(
      "src/app/layout.tsx",
      `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'${
        !useEmpty
          ? `
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'`
          : ""
      }

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RNT Next App',
  description: 'Aplicação Next.js criada com RNT CLI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>${
          !useEmpty
            ? `
          <Header />
          {children}
          <Footer />`
            : `
          {children}`
        }
        </Providers>
      </body>
    </html>
  )
}
`
    );
  }
}

async function createExampleFiles(cssChoice, installTests) {
  // Criar página inicial de exemplo
  if (cssChoice === "styled-components") {
    fs.writeFileSync(
      "src/app/page.tsx",
      `'use client'

// 🏠 PÁGINA INICIAL - Exemplo com Styled Components
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página

import { FaReact, FaCode, FaRocket } from 'react-icons/fa'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const MainContainer = styled.div\`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: \${theme.colors.primaryColor};
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
\`

const HeroSection = styled.section\`
  text-align: center;
  margin-bottom: 80px;

  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color: \${theme.colors.textColor};
    margin-bottom: 20px;
    background: linear-gradient(135deg, \${theme.colors.blue2}, \${theme.colors.yellow2});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.25rem;
    color: \${theme.colors.gray2};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
\`

export default function Home() {
  return (
    <MainContainer>
      <HeroSection>
        <h1>RNT Next CLI</h1>
        <p>
          Projeto criado com RNT Next CLI. Configurado com Styled Components e pronto para desenvolvimento.
        </p>
      </HeroSection>
    </MainContainer>
  )
}
`
    );
  } else {
    fs.writeFileSync(
      "src/app/page.tsx",
      `'use client'

// 🏠 PÁGINA INICIAL - Exemplo com Tailwind CSS
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página

import { FaReact, FaCode, FaRocket } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#011627] px-5 py-15 max-w-6xl mx-auto w-full">
      <section className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
          RNT Next CLI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Projeto criado com RNT Next CLI. Configurado com Tailwind CSS e pronto para desenvolvimento.
        </p>
      </section>
    </div>
  )
}
`
    );
  }

  // Criar Header
  if (cssChoice === "styled-components") {
    fs.writeFileSync(
      "src/components/layout/header/Header.tsx",
      `'use client'

// 🧭 HEADER COMPONENT - Cabeçalho da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio header

import Link from 'next/link'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const HeaderContainer = styled.header\`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: \${theme.colors.primaryColor};
  border-bottom: 1px solid \${theme.colors.secondaryColor};
  position: sticky;
  top: 0;
  z-index: 100;
\`

const Logo = styled.div\`
  h1 {
    color: \${theme.colors.textColor};
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, \${theme.colors.blue2}, \${theme.colors.yellow2});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
\`

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <h1>RNT</h1>
      </Logo>
    </HeaderContainer>
  )
}

export default Header`
    );
  } else {
    fs.writeFileSync(
      "src/components/layout/header/Header.tsx",
      `'use client'

// 🧭 HEADER COMPONENT - Cabeçalho da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio header

import Link from 'next/link'

const Header = () => {
  return (
    <header className="flex items-center justify-between p-5 bg-[#011627] border-b border-[#023864] sticky top-0 z-50">
      <div className="flex items-center">
        <h1 className="text-white text-3xl font-bold bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">RNT</h1>
      </div>
    </header>
  )
}

export default Header`
    );
  }

  // Criar Footer
  if (cssChoice === "styled-components") {
    fs.writeFileSync(
      "src/components/layout/footer/Footer.tsx",
      `'use client'

// 🦶 FOOTER COMPONENT - Rodapé da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio footer

import styled from 'styled-components'
import { theme } from '@/styles/theme'

const FooterContainer = styled.footer\`
  background-color: \${theme.colors.primaryColor};
  border-top: 1px solid \${theme.colors.secondaryColor};
  padding: 40px 20px 20px;
  margin-top: auto;
  text-align: center;

  p {
    color: \${theme.colors.textColor};
    font-size: 14px;
    opacity: 0.8;
  }
\`

const getCurrentYear = () => {
  const date = new Date()
  return date.getFullYear()
}

const Footer = () => {
  return (
    <FooterContainer>
      <p>&copy; {getCurrentYear()} RNT Projects. Todos os direitos reservados.</p>
    </FooterContainer>
  )
}

export default Footer`
    );
  } else {
    fs.writeFileSync(
      "src/components/layout/footer/Footer.tsx",
      `'use client'

// 🦶 FOOTER COMPONENT - Rodapé da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio footer

const getCurrentYear = () => {
  const date = new Date()
  return date.getFullYear()
}

const Footer = () => {
  return (
    <footer className="bg-[#011627] border-t border-[#023864] py-10 px-5 mt-auto text-center">
      <p className="text-white text-sm opacity-80">
        &copy; {getCurrentYear()} RNT Projects. Todos os direitos reservados.
      </p>
    </footer>
  )
}

export default Footer`
    );
  }

  // Criar testes de exemplo se solicitado
  if (installTests) {
    fs.writeFileSync(
      "__tests__/page.test.tsx",
      `// 🧪 TESTE DA PÁGINA INICIAL
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seus próprios testes

import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock do Redux Provider
jest.mock('@/components/providers', () => {
  return {
    Providers: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByText('RNT Next CLI')
    expect(heading).toBeInTheDocument()
  })
})
`
    );
  }
}

main().catch(console.error);
