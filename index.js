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

  // Pergunta sobre a escolha do CSS
  const cssChoice = await askQuestion(
    "Qual biblioteca de CSS você deseja usar?\n1. Styled Components (sem Turbopack)\n2. Tailwind CSS (com Turbopack)\nEscolha (1 ou 2): "
  );

  const useStyledComponents = cssChoice === "1";
  const useTailwind = cssChoice === "2";

  if (!useStyledComponents && !useTailwind) {
    console.log("❌ Escolha inválida. Usando Tailwind CSS por padrão.");
  }

  const finalChoice = useStyledComponents ? "styled-components" : "tailwind";

  // Pergunta sobre dependências de teste
  const testChoice = await askQuestion(
    "Deseja instalar dependências de teste (Jest, Testing Library)?\n1. Sim\n2. Não\nEscolha (1 ou 2): "
  );

  const installTests = testChoice === "1";

  console.log(
    `✅ Configurando projeto com ${
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    }`
  );
  console.log(`📦 Dependências de teste: ${installTests ? "Sim" : "Não"}`);

  // 🚀 Criando um novo projeto com Next.js e TypeScript
  console.log("📦 Criando novo projeto com Next.js...");

  if (finalChoice === "styled-components") {
    // Criar projeto sem Tailwind e sem Turbopack para Styled Components
    execCommand(
      `npx --yes create-next-app@latest ${appName} --typescript --no-tailwind --eslint --app --src-dir --import-alias "@/*"`
    );
  } else {
    // Criar projeto com Tailwind e Turbopack
    execCommand(
      `npx --yes create-next-app@latest ${appName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbo`
    );
  }

  // Verificar se o diretório foi criado antes de mudar para ele
  if (!fs.existsSync(appPath)) {
    console.error(`❌ Erro: Diretório ${appPath} não foi criado`);
    process.exit(1);
  }

  process.chdir(appPath);

  // 🎯 Instalando dependências baseadas na escolha
  console.log("📦 Instalando Dependências de produção...");

  if (finalChoice === "styled-components") {
    execCommand(
      "npm install styled-components @types/styled-components react-redux @reduxjs/toolkit framer-motion react-icons immer imask zod react-hook-form next-safe-layouts @svgr/webpack redux@latest clsx class-variance-authority lucide-react --save"
    );
  } else {
    execCommand(
      "npm install react-redux @reduxjs/toolkit framer-motion react-icons immer imask zod react-hook-form next-safe-layouts @svgr/webpack redux@latest clsx class-variance-authority lucide-react --save"
    );
  }

  console.log("📦 Instalando Dependências de desenvolvimento...");

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
    "src/components/layout",
    "src/components/layout/header",
    "src/components/layout/footer",
    "src/lib",
    "src/hooks",
    "src/utils",
    "src/redux",
    "src/redux/slices",
    "src/types",
    ".vscode",
  ];

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
  if (finalChoice === "styled-components") {
    fs.writeFileSync(
      "next.config.js",
      `/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    formats: ['image/avif', 'image/webp']
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['placehold.co'],
  },
}

module.exports = nextConfig
`
    );
  } else {
    fs.writeFileSync(
      "next.config.js",
      `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['placehold.co'],
  },
}

module.exports = nextConfig
`
    );
  }

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
    `// 🎨 ARQUIVO DE TEMA - Pode ser personalizado conforme necessário
// Este arquivo contém as configurações de cores e breakpoints do projeto

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
    await createStyledComponentsFiles(installTests);
  } else {
    await createTailwindFiles(installTests);
  }

  // Providers
  fs.writeFileSync(
    "src/components/providers.tsx",
    `'use client'

// 🔧 PROVIDERS - Configuração de contextos globais
// Este arquivo pode ser expandido com novos providers conforme necessário

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

  // Criar página inicial personalizada
  await createCustomHomePage(finalChoice, installTests);

  // Criar layout personalizado
  await createCustomLayout(finalChoice);

  // Criar testes de exemplo se solicitado
  if (installTests) {
    await createExampleTests(finalChoice);
  }

  console.log("✅ Projeto criado com sucesso!");
  console.log(`📁 Navegue para: cd ${appName}`);
  console.log("🚀 Execute: npm run dev");
  console.log(
    `🎨 Configurado com: ${
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    }`
  );
  if (finalChoice === "tailwind") {
    console.log("⚡ Turbopack habilitado para desenvolvimento mais rápido");
  }
  if (installTests) {
    console.log("🧪 Dependências de teste instaladas - Execute: npm test");
  }
  console.log("💙 Criado por RNT");
}

async function createStyledComponentsFiles(installTests) {
  // Global Styles para Styled Components
  fs.writeFileSync(
    "src/styles/globalStyles.tsx",
    `'use client'

// 🎨 GLOBAL STYLES - Estilos globais com Styled Components
// Este arquivo pode ser personalizado conforme suas necessidades de design

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
// Este arquivo é obrigatório para o funcionamento correto do Styled Components com Next.js

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

  // Home Styles para Styled Components
  fs.writeFileSync(
    "src/styles/HomeStyles.ts",
    `'use client'

// 🏠 HOME STYLES - Estilos da página inicial
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página

import styled from 'styled-components'
import { theme } from './theme'

export const MainContainer = styled.div\`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: \${theme.colors.primaryColor};
\`

export const ContentSection = styled.main\`
  flex: 1;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
\`

export const HeroSection = styled.section\`
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

  @media (max-width: \${theme.breakpoints.md}) {
    margin-bottom: 60px;
    
    h1 {
      font-size: 2.5rem;
    }
    
    p {
      font-size: 1.1rem;
    }
  }

  @media (max-width: \${theme.breakpoints.sm}) {
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
\`

export const FeatureGrid = styled.div\`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;

  @media (max-width: \${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
\`

export const FeatureCard = styled.div\`
  background: rgba(255, 255, 255, 0.05);
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: \${theme.colors.blue2};
  }

  .icon {
    font-size: 3rem;
    color: \${theme.colors.blue2};
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.5rem;
    color: \${theme.colors.textColor};
    margin-bottom: 15px;
  }

  p {
    color: \${theme.colors.gray2};
    line-height: 1.6;
  }

  @media (max-width: \${theme.breakpoints.md}) {
    padding: 30px 20px;
    
    .icon {
      font-size: 2.5rem;
    }
    
    h3 {
      font-size: 1.3rem;
    }
  }
\`

export const CTASection = styled.section\`
  text-align: center;
  margin-top: 80px;
  padding: 60px 20px;
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.1), rgba(225, 163, 42, 0.1));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 2.5rem;
    color: \${theme.colors.textColor};
    margin-bottom: 20px;
  }

  p {
    font-size: 1.1rem;
    color: \${theme.colors.gray2};
    margin-bottom: 30px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: \${theme.breakpoints.md}) {
    margin-top: 60px;
    padding: 40px 20px;
    
    h2 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
\`

export const Button = styled.button\`
  background: linear-gradient(135deg, \${theme.colors.blue2}, \${theme.colors.yellow2});
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(30, 144, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: \${theme.breakpoints.md}) {
    padding: 12px 25px;
    font-size: 1rem;
  }
\`
`
  );

  // Header Styles para Styled Components
  fs.writeFileSync(
    "src/components/layout/header/HeaderStyles.ts",
    `'use client'

// 🧭 HEADER STYLES - Estilos do cabeçalho
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio header

import styled from 'styled-components'
import { theme } from '@/styles/theme'

export const HeaderContainer = styled.header\`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: \${theme.colors.primaryColor};
  border-bottom: 1px solid \${theme.colors.secondaryColor};
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: \${theme.breakpoints.md}) {
    flex-direction: column;
    gap: 15px;
  }
\`

export const Logo = styled.div\`
  display: flex;
  align-items: center;
  
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

export const NavMenu = styled.nav\`
  display: flex;
  gap: 30px;
  
  @media (max-width: \${theme.breakpoints.md}) {
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
\`

export const NavItem = styled.div\`
  a {
    text-decoration: none;
    color: \${theme.colors.textColor};
    font-weight: 500;
    font-size: 16px;
    transition: color 0.3s ease;
    position: relative;

    &:hover {
      color: \${theme.colors.blue2};
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 0;
      background-color: \${theme.colors.blue2};
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }
\`
`
  );

  // Footer Styles para Styled Components
  fs.writeFileSync(
    "src/components/layout/footer/FooterStyles.ts",
    `'use client'

// 🦶 FOOTER STYLES - Estilos do rodapé
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio footer

import styled from 'styled-components'
import { theme } from '@/styles/theme'

export const FooterContainer = styled.footer\`
  background-color: \${theme.colors.primaryColor};
  border-top: 1px solid \${theme.colors.secondaryColor};
  padding: 40px 20px 20px;
  margin-top: auto;
\`

export const FooterContent = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;

  p {
    color: \${theme.colors.textColor};
    font-size: 14px;
    opacity: 0.8;
  }

  @media (max-width: \${theme.breakpoints.md}) {
    gap: 15px;
    
    p {
      font-size: 12px;
    }
  }
\`

export const SocialLinks = styled.div\`
  display: flex;
  gap: 20px;
  align-items: center;

  a {
    color: \${theme.colors.textColor};
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: \${theme.colors.blue2};
      background-color: rgba(30, 144, 255, 0.1);
      transform: translateY(-2px);
    }
  }

  @media (max-width: \${theme.breakpoints.md}) {
    gap: 15px;
    
    a {
      padding: 6px;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
\`
`
  );
}

async function createTailwindFiles(installTests) {
  // Global styles para Tailwind
  fs.writeFileSync(
    "src/app/globals.css",
    `/* 🎨 GLOBAL STYLES - Estilos globais com Tailwind CSS */
/* Este arquivo pode ser personalizado conforme suas necessidades de design */

@tailwind base;
@tailwind components;
@tailwind utilities;

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

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* 🎨 CLASSES UTILITÁRIAS PERSONALIZADAS */
/* ⚠️ SEÇÃO DELETÁVEL - Pode ser removida ao criar seus próprios estilos */

@layer components {
  .gradient-text {
    @apply bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent;
  }
  
  .feature-card {
    @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center transition-all duration-300 hover:bg-white/8 hover:border-blue-500 hover:-translate-y-1;
  }
  
  .cta-button {
    @apply bg-gradient-to-r from-blue-500 to-yellow-400 text-white px-8 py-4 rounded-lg font-semibold text-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30;
  }
  
  .nav-link {
    @apply text-white font-medium text-base transition-colors duration-300 hover:text-blue-500 relative group;
  }
  
  .nav-link::after {
    @apply absolute bottom-[-5px] left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full;
    content: '';
  }
}
`
  );
}

async function createCustomHomePage(cssChoice, installTests) {
  if (cssChoice === "styled-components") {
    fs.writeFileSync(
      "src/app/page.tsx",
      `'use client'

// 🏠 PÁGINA INICIAL - Exemplo com Styled Components
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página

import { FaReact, FaCode, FaRocket } from 'react-icons/fa'
import { 
  MainContainer, 
  ContentSection, 
  HeroSection, 
  FeatureGrid, 
  FeatureCard, 
  CTASection, 
  Button 
} from '@/styles/HomeStyles'

export default function Home() {
  return (
    <MainContainer>
      <ContentSection>
        <HeroSection>
          <h1>RNT Next CLI</h1>
          <p>
            Um CLI poderoso para criar aplicações Next.js com configurações pré-definidas e estrutura otimizada.
            Criado por RNT para acelerar o desenvolvimento de projetos modernos.
          </p>
        </HeroSection>

        <FeatureGrid>
          <FeatureCard>
            <div className="icon">
              <FaReact />
            </div>
            <h3>Next.js 15+</h3>
            <p>
              Versão mais recente do Next.js com App Router e todas as funcionalidades modernas.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">
              <FaCode />
            </div>
            <h3>Styled Components</h3>
            <p>
              CSS-in-JS com Styled Components, temas personalizáveis e componentes reutilizáveis.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">
              <FaRocket />
            </div>
            <h3>Pronto para Produção</h3>
            <p>
              ESLint, Prettier, TypeScript e Redux Toolkit configurados para máxima produtividade.
            </p>
          </FeatureCard>
        </FeatureGrid>

        <CTASection>
          <h2>Comece Agora</h2>
          <p>
            Execute o comando abaixo e tenha um projeto Next.js completo em segundos.
          </p>
          <Button onClick={() => navigator.clipboard.writeText('npx rnt-next meu-projeto')}>
            Copiar Comando
          </Button>
        </CTASection>
      </ContentSection>
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
  const copyCommand = () => {
    navigator.clipboard.writeText('npx rnt-next meu-projeto')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#011627]">
      <main className="flex-1 px-5 py-15 max-w-6xl mx-auto w-full">
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 gradient-text">
            RNT Next CLI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Um CLI poderoso para criar aplicações Next.js com configurações pré-definidas e estrutura otimizada.
            Criado por RNT para acelerar o desenvolvimento de projetos modernos.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="feature-card">
            <div className="text-5xl text-blue-500 mb-5">
              <FaReact />
            </div>
            <h3 className="text-2xl text-white mb-4">Next.js 15+</h3>
            <p className="text-gray-400 leading-relaxed">
              Versão mais recente do Next.js com App Router, Turbopack e todas as funcionalidades modernas.
            </p>
          </div>

          <div className="feature-card">
            <div className="text-5xl text-blue-500 mb-5">
              <FaCode />
            </div>
            <h3 className="text-2xl text-white mb-4">Tailwind CSS</h3>
            <p className="text-gray-400 leading-relaxed">
              Framework CSS utilitário para desenvolvimento rápido e responsivo com design moderno.
            </p>
          </div>

          <div className="feature-card">
            <div className="text-5xl text-blue-500 mb-5">
              <FaRocket />
            </div>
            <h3 className="text-2xl text-white mb-4">Pronto para Produção</h3>
            <p className="text-gray-400 leading-relaxed">
              ESLint, Prettier, TypeScript e Redux Toolkit configurados para máxima produtividade.
            </p>
          </div>
        </div>

        <section className="text-center mt-20 p-15 bg-gradient-to-r from-blue-500/10 to-yellow-400/10 rounded-2xl border border-white/10">
          <h2 className="text-4xl text-white mb-5">Comece Agora</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto">
            Execute o comando abaixo e tenha um projeto Next.js completo em segundos.
          </p>
          <button onClick={copyCommand} className="cta-button">
            Copiar Comando
          </button>
        </section>
      </main>
    </div>
  )
}
`
    );
  }
}

async function createCustomLayout(cssChoice) {
  if (cssChoice === "styled-components") {
    // Layout com Styled Components
    fs.writeFileSync(
      "src/app/layout.tsx",
      `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import StyledComponentsRegistry from '@/lib/styled-components-registry'
import { GlobalStyles } from '@/styles/globalStyles'
import { Providers } from '@/components/providers'
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RNT Next CLI - Criado por RNT',
  description: 'CLI para criar aplicações Next.js com configurações pré-definidas',
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
          <Providers>
            <Header />
            {children}
            <Footer />
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
`
    );

    // Header com Styled Components
    fs.writeFileSync(
      "src/components/layout/header/Header.tsx",
      `'use client'

// 🧭 HEADER COMPONENT - Cabeçalho da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio header

import Link from 'next/link'
import { HeaderContainer, Logo, NavMenu, NavItem } from './HeaderStyles'

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <h1>RNT</h1>
      </Logo>
      <NavMenu>
        <NavItem>
          <Link href="/">Home</Link>
        </NavItem>
        <NavItem>
          <Link href="/docs">Docs</Link>
        </NavItem>
        <NavItem>
          <Link href="/examples">Examples</Link>
        </NavItem>
        <NavItem>
          <Link href="/about">About</Link>
        </NavItem>
      </NavMenu>
    </HeaderContainer>
  )
}

export default Header`
    );

    // Footer com Styled Components
    fs.writeFileSync(
      "src/components/layout/footer/Footer.tsx",
      `'use client'

// 🦶 FOOTER COMPONENT - Rodapé da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio footer

import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { FooterContainer, SocialLinks, FooterContent } from './FooterStyles'

const getCurrentYear = () => {
  const date = new Date()
  return date.getFullYear()
}

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <p>&copy; {getCurrentYear()} RNT Projects. Todos os direitos reservados.</p>
        <SocialLinks className="social-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram size={24} />
          </a>
        </SocialLinks>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer`
    );
  } else {
    // Layout com Tailwind
    fs.writeFileSync(
      "src/app/layout.tsx",
      `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RNT Next CLI - Criado por RNT',
  description: 'CLI para criar aplicações Next.js com configurações pré-definidas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
`
    );

    // Header com Tailwind
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
        <h1 className="text-white text-3xl font-bold gradient-text">RNT</h1>
      </div>
      <nav className="flex gap-8">
        <Link href="/" className="nav-link">
          Home
        </Link>
        <Link href="/docs" className="nav-link">
          Docs
        </Link>
        <Link href="/examples" className="nav-link">
          Examples
        </Link>
        <Link href="/about" className="nav-link">
          About
        </Link>
      </nav>
    </header>
  )
}

export default Header`
    );

    // Footer com Tailwind
    fs.writeFileSync(
      "src/components/layout/footer/Footer.tsx",
      `'use client'

// 🦶 FOOTER COMPONENT - Rodapé da aplicação
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio footer

import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'

const getCurrentYear = () => {
  const date = new Date()
  return date.getFullYear()
}

const Footer = () => {
  return (
    <footer className="bg-[#011627] border-t border-[#023864] py-10 px-5 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
        <p className="text-white text-sm opacity-80">
          &copy; {getCurrentYear()} RNT Projects. Todos os direitos reservados.
        </p>
        <div className="flex gap-5 items-center">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="GitHub"
            className="text-white transition-all duration-300 p-2 rounded-full flex items-center justify-center hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-1"
          >
            <FaGithub size={24} />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="LinkedIn"
            className="text-white transition-all duration-300 p-2 rounded-full flex items-center justify-center hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-1"
          >
            <FaLinkedin size={24} />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram"
            className="text-white transition-all duration-300 p-2 rounded-full flex items-center justify-center hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-1"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer`
    );
  }
}

async function createExampleTests(cssChoice) {
  // Teste de exemplo para a página inicial
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

  it('renders the description', () => {
    render(<Home />)
    
    const description = screen.getByText(/Um CLI poderoso para criar aplicações Next.js/i)
    expect(description).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)
    
    expect(screen.getByText('Next.js 15+')).toBeInTheDocument()
    expect(screen.getByText('Pronto para Produção')).toBeInTheDocument()
  })
})
`
  );

  // Teste de exemplo para componentes
  fs.writeFileSync(
    "src/__tests__/components.test.tsx",
    `// 🧪 TESTES DE COMPONENTES
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seus próprios testes

import { render, screen } from '@testing-library/react'
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />)
    
    const logo = screen.getByText('RNT')
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})

describe('Footer Component', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    
    const copyright = screen.getByText(/RNT Projects. Todos os direitos reservados/i)
    expect(copyright).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<Footer />)
    
    const githubLink = screen.getByLabelText('GitHub')
    const linkedinLink = screen.getByLabelText('LinkedIn')
    const instagramLink = screen.getByLabelText('Instagram')
    
    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
    expect(instagramLink).toBeInTheDocument()
  })
})
`
  );
}

main().catch(console.error);
