#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer"); // 👈 novo

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

async function main() {
  console.log("🎨 RNT Next CLI - Criado por RNT");
  console.log("=====================================");
  console.log("📝 Configuração do Projeto\n");

  const {
    appName,
    packageManager,
    finalChoice,
    includeExamples,
    installExtraDeps,
    installTests,
    installBackend,
  } = await askQuestions();

  const projectPath = path.resolve(process.cwd(), appName);

  // 🚀 Criando projeto Next.js
  await createNextApp(appName, packageManager);

  // 📁 Navegando até o projeto
  process.chdir(projectPath);

  // 🧹 Limpando projeto padrão
  if (!includeExamples) {
    await clearDefaultProject();
  }

  // 🏗️ Criando estrutura de pastas
  await createFolderStructure();

  // 🎨 Styled Components ou Tailwind
  if (finalChoice === "styled-components") {
    await createStyledComponentsFiles();
  } else {
    await createTailwindFiles();
  }

  // 📄 Adicionando arquivos extras se o usuário quiser exemplos
  if (includeExamples) {
    await copyExampleFiles(finalChoice);
  }

  // ✅ Criando arquivos padrão (index.ts, layout.tsx, globals, etc.)
  await createBaseFiles({ finalChoice });

  // ✍️ Atualizando arquivos padrões como page.tsx e layout
  await updatePagesFiles({ appName, finalChoice });

  // 🌐 Criando arquivos de configuração
  await createConfigFiles({ appName });

  // 🔠 Criando types.d.ts
  await createTypesFile();

  // 📦 Instalando dependências de produção
  console.log("📦 Instalando dependências de produção...");

  let prodDependencies = [
    "react-redux",
    "@reduxjs/toolkit",
    "immer",
    "redux@latest",
    "clsx",
    "class-variance-authority",
    "lucide-react",
  ];

  if (finalChoice === "styled-components") {
    prodDependencies.unshift("styled-components");
  }

  if (installExtraDeps) {
    prodDependencies.push(
      "formik",
      "yup",
      "imask",
      "react-imask",
      "react-hot-toast",
      "react-loading-skeleton",
      "framer-motion",
      "react-icons"
    );
  }

  if (installBackend) {
    prodDependencies.push("prisma", "@prisma/client");
  }

  execCommand(`npm install ${prodDependencies.join(" ")} --save`);

  // 📦 Instalando dependências de desenvolvimento
  console.log("📦 Instalando dependências de desenvolvimento...");

  let devDependencies = [
    "eslint-plugin-prettier",
    "prettier",
    "eslint-config-prettier",
  ];

  if (finalChoice === "styled-components") {
    devDependencies.push("@types/styled-components");
  }

  if (installTests) {
    devDependencies.push(
      "jest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "@testing-library/user-event",
      "jest-environment-jsdom"
    );
  }

  execCommand(`npm install ${devDependencies.join(" ")} --save-dev`);

  console.log("\n✅ Projeto criado com sucesso!");
  console.log(`\n👉 Acesse o projeto com: \n\n  cd ${appName}`);
  console.log(`\n🚀 Inicie o projeto com: \n\n  ${packageManager} run dev\n`);

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
    ".vscode",
  ];

  if (!useEmpty) {
    folders.push(
      "src/app/(private)",
      "src/app/(public)",
      "src/components/layout",
      "src/components/layout/header",
      "src/components/layout/footer"
    );
  }

  if (installTests) {
    folders.push("__tests__", "src/__tests__");
  }

  if (installBackend) {
    folders.push("prisma");
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

  // Next.js config (sem experimental turbo)
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {`;

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

  // Criar colorUtils
  fs.writeFileSync(
    "src/utils/colorUtils.ts",
    `// 🎨 COLOR UTILS - Utilitários para geração de variantes de cores HSL

export function colorHSLVariants(h: number, s: number, l: number) {
  const clamp = (val: number) => Math.min(100, Math.max(0, val))
  return {
    base: \`hsl(\${h}, \${s}%, \${clamp(l)}%)\`,
    light: \`hsl(\${h}, \${s}%, \${clamp(l + 10)}%)\`,
    light02: \`hsla(\${h}, \${s}%, \${clamp(l + 2)}%, 0.2)\`,
    light04: \`hsla(\${h}, \${s}%, \${clamp(l + 4)}%, 0.4)\`,
    light08: \`hsla(\${h}, \${s}%, \${clamp(l + 6)}%, 0.8)\`,
    light20: \`hsl(\${h}, \${s}%, \${clamp(l + 20)}%)\`,
    light30: \`hsl(\${h}, \${s}%, \${clamp(l + 30)}%)\`,
    light40: \`hsl(\${h}, \${s}%, \${clamp(l + 40)}%)\`,
    light50: \`hsl(\${h}, \${s}%, \${clamp(l + 50)}%)\`,
    dark: \`hsl(\${h}, \${s}%, \${clamp(l - 10)}%)\`,
    dark02: \`hsla(\${h}, \${s}%, \${clamp(l - 2)}%, 0.2)\`,
    dark04: \`hsla(\${h}, \${s}%, \${clamp(l - 4)}%, 0.4)\`,
    dark08: \`hsla(\${h}, \${s}%, \${clamp(l - 6)}%, 0.8)\`,
    dark20: \`hsl(\${h}, \${s}%, \${clamp(l - 20)}%)\`,
    dark30: \`hsl(\${h}, \${s}%, \${clamp(l - 30)}%)\`,
    dark40: \`hsl(\${h}, \${s}%, \${clamp(l - 40)}%)\`,
    dark50: \`hsl(\${h}, \${s}%, \${clamp(l - 50)}%)\`
  }
}
`
  );

  // Theme configuration atualizado
  fs.writeFileSync(
    "src/styles/theme.ts",
    `// 🎨 ARQUIVO DE TEMA - Configurações de cores e breakpoints do projeto

import { colorHSLVariants } from '@/utils/colorUtils'

export const media = {
  pc: '@media (max-width: 1024px)',
  tablet: '@media (max-width: 768px)',
  mobile: '@media (max-width: 480px)',
}

export const transitions = {
  default: 'all 0.2s ease'
}

export const baseBlue = colorHSLVariants(220, 80, 50)
export const baseGreen = colorHSLVariants(100, 100, 50)
export const baseRed = colorHSLVariants(0, 100, 50)
export const baseCyan = colorHSLVariants(180, 150, 50)

export const theme = {
  colors: {
    baseBlue: baseBlue,
    baseGreen: baseGreen,
    baseRed: baseRed,
    baseCyan: baseCyan,
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
    green2: '#44BD32',
    neonBlue: '#00FFD5 ',
    neonGree: '#00FF6A '
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

  // Middleware
  fs.writeFileSync(
    "src/middleware.ts",
    `// 🔒 MIDDLEWARE - Controle de autenticação e rotas

import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  { path: '/', whenAuthenticated: 'next' },
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/register', whenAuthenticated: 'redirect' },
  { path: '/pricing', whenAuthenticated: 'next' }
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const matchedPublicRoute = publicRoutes.find(route => route.path === path)
  const authToken = request.cookies.get('token')

  //1 - Se o usuário não estiver autenticado e o caminho da rota não for público, redireciona para a página de login
  if (!authToken && matchedPublicRoute) {
    return NextResponse.next()
  }

  //2 - se o usuario não estiver autenticado e o caminho da rota não for público, redireciona para a página de login
  if (!authToken && !matchedPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
    return NextResponse.redirect(redirectUrl)
  }

  //3 - Se o usuário estiver autenticado e o caminho da rota não for público, redireciona para a página inicial
  if (authToken && matchedPublicRoute?.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config: MiddlewareConfig = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico, sitemap.xml, robots.txt (metadata files)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)']
}
`
  );

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

  // .env file
  fs.writeFileSync(
    ".env",
    `# 🔐 VARIÁVEIS DE AMBIENTE - Configurações do projeto

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database (se backend foi escolhido)
${
  installBackend
    ? `DATABASE_URL="mysql://username:password@localhost:3306/database_name"`
    : `# DATABASE_URL="mysql://username:password@localhost:3306/database_name"`
}

# API Keys
# API_KEY=your-api-key-here
`
  );

  // Redux Store baseado na escolha de testes
  if (installTests) {
    fs.writeFileSync(
      "src/redux/store.ts",
      `// 🏪 REDUX STORE - Configuração do gerenciamento de estado com preloaded state para testes

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
`
    );

    // AuthSlice para testes
    fs.writeFileSync(
      "src/redux/slices/authSlice.ts",
      `// 🔐 AUTH SLICE - Gerenciamento de estado de autenticação

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string
    name: string
    email: string
  } | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    loginFailure: (state) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
`
    );
  } else {
    fs.writeFileSync(
      "src/redux/store.ts",
      `// 🏪 REDUX STORE - Configuração simples do gerenciamento de estado

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
`
    );

    // AuthSlice simples
    fs.writeFileSync(
      "src/redux/slices/authSlice.ts",
      `// 🔐 AUTH SLICE - Gerenciamento de estado de autenticação

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string
    name: string
    email: string
  } | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    }
  }
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
`
    );
  }

  // Configuração do Prisma se backend foi escolhido
  if (installBackend) {
    console.log("🗄️ Configurando Prisma...");

    // Executar prisma init
    execCommand("npx prisma init");

    // Schema do Prisma com comentários
    fs.writeFileSync(
      "prisma/schema.prisma",
      `// 🗄️ PRISMA SCHEMA - Configuração do banco de dados
// Este arquivo define a estrutura do seu banco de dados

// Configuração do gerador do Prisma Client
generator client {
  provider = "prisma-client-js"
}

// Configuração da conexão com o banco de dados
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 👤 MODEL USER - Modelo básico de usuário
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// 📝 COMO USAR ESTE ARQUIVO:
// 
// 1. Configure sua DATABASE_URL no arquivo .env
//    Exemplo: DATABASE_URL="mysql://username:password@localhost:3306/database_name"
//
// 2. Para criar o banco de dados e tabelas:
//    npx prisma db push
//
// 3. Para gerar o Prisma Client:
//    npx prisma generate
//
// 4. Para visualizar o banco no Prisma Studio:
//    npx prisma studio
//
// 5. Para usar um banco existente:
//    npx prisma db pull (puxa a estrutura do banco existente)
//    npx prisma generate (gera o client baseado na estrutura)
//
// 6. Para criar e aplicar migrations:
//    npx prisma migrate dev --name init
//
// 📚 DOCUMENTAÇÃO: https://www.prisma.io/docs
`
    );

    // Arquivo de configuração do Prisma Client
    fs.writeFileSync(
      "src/lib/prisma.ts",
      `// 🗄️ PRISMA CLIENT - Configuração da conexão com o banco de dados

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`
    );
  }

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
  console.log(`📦 Tipo: ${useEmpty ? "Projeto limpo" : "Com exemplos"}`);
  if (installTests) {
    console.log("🧪 Testes: npm test");
  }
  if (installExtraDeps) {
    console.log("📚 Dependências adicionais instaladas");
  }
  if (installBackend) {
    console.log("🗄️ Backend: Prisma + MySQL configurado");
    console.log("   - Configure DATABASE_URL no .env");
    console.log("   - Execute: npx prisma db push");
    console.log("   - Execute: npx prisma generate");
  }
  console.log("💙 Criado por RNT");
  console.log("=".repeat(50));
}

async function createStyledComponentsFiles() {
  // Global Styles para Styled Components atualizado
  fs.writeFileSync(
    "src/styles/globalStyles.tsx",
    `'use client'

// 🎨 GLOBAL STYLES - Estilos globais com Styled Components

import styled, { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle\`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: \${theme.colors.baseBlue.dark20};
    color: \${theme.colors.baseBlue.dark50};
  }

  .container {
    max-width: 1024px;
    margin: 0 auto;
  }
\`;

export const OverlayBlur = styled.div\`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  z-index: 100;
\`

export const OverlayDarck = styled.div\`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 10;
\`

export const CloseButton = styled.button\`
  border-radius: 50%;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: transparent;
  border: transparent;
  cursor: pointer;

  svg {
    font-size: 24px;
    color: \${theme.colors.baseBlue.dark20};
  }

  &:hover {
    svg {
      color: \${theme.colors.baseBlue.light};
    }
  }
\`

export const TitleH2 = styled.h2\`
  font-size: 24px;
  font-weight: 600;
  color: \${theme.colors.baseBlue.light30};
\`

export const TitleH3 = styled.h3\`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: \${theme.colors.baseBlue.dark30};
\`

export const MinorTextH4 = styled.h3\`
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 8px;
  color: \${theme.colors.baseBlue.dark30};
\`
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

.container {
  max-width: 1024px;
  margin: 0 auto;
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
  // Criar estrutura de rotas com exemplos
  if (!fs.existsSync("src/app/(public)")) {
    fs.mkdirSync("src/app/(public)", { recursive: true });
  }
  if (!fs.existsSync("src/app/(private)")) {
    fs.mkdirSync("src/app/(private)", { recursive: true });
  }

  // Página inicial de exemplo
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

  // Criar páginas de exemplo nas rotas
  // Página pública de exemplo
  if (cssChoice === "styled-components") {
    fs.writeFileSync(
      "src/app/(public)/layout.tsx",
      `// 🌐 LAYOUT PÚBLICO - Layout para páginas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio layout

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
`
    );

    fs.writeFileSync(
      "src/app/(public)/loading.tsx",
      `'use client'

// ⏳ LOADING PÚBLICO - Componente de loading para páginas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio loading

import styled, { keyframes } from 'styled-components'
import { theme } from '@/styles/theme'

const spin = keyframes\`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
\`

const LoadingContainer = styled.div\`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
\`

const Spinner = styled.div\`
  border: 4px solid \${theme.colors.gray2};
  border-top: 4px solid \${theme.colors.blue2};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: \${spin} 2s linear infinite;
\`

export default function Loading() {
  return (
    <LoadingContainer>
      <Spinner />
    </LoadingContainer>
  )
}
`
    );

    fs.writeFileSync(
      "src/app/(public)/not-found.tsx",
      `'use client'

// 🚫 NOT FOUND PÚBLICO - Página 404 para rotas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página 404

import Link from 'next/link'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const NotFoundContainer = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 20px;

  h1 {
    font-size: 4rem;
    color: \${theme.colors.blue2};
    margin-bottom: 20px;
  }

  h2 {
    font-size: 2rem;
    color: \${theme.colors.textColor};
    margin-bottom: 20px;
  }

  p {
    color: \${theme.colors.gray2};
    margin-bottom: 30px;
    max-width: 500px;
  }
\`

const BackButton = styled(Link)\`
  background-color: \${theme.colors.blue2};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: \${theme.colors.blue};
  }
\`

export default function NotFound() {
  return (
    <NotFoundContainer>
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>A página que você está procurando não existe ou foi movida.</p>
      <BackButton href="/">Voltar ao início</BackButton>
    </NotFoundContainer>
  )
}
`
    );
  } else {
    fs.writeFileSync(
      "src/app/(public)/layout.tsx",
      `// 🌐 LAYOUT PÚBLICO - Layout para páginas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio layout

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
`
    );

    fs.writeFileSync(
      "src/app/(public)/loading.tsx",
      `// ⏳ LOADING PÚBLICO - Componente de loading para páginas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio loading

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="border-4 border-gray-400 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
    </div>
  )
}
`
    );

    fs.writeFileSync(
      "src/app/(public)/not-found.tsx",
      `// 🚫 NOT FOUND PÚBLICO - Página 404 para rotas públicas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página 404

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-5">
      <h1 className="text-6xl text-blue-500 mb-5">404</h1>
      <h2 className="text-3xl text-white mb-5">Página não encontrada</h2>
      <p className="text-gray-400 mb-8 max-w-lg">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link 
        href="/" 
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
`
    );
  }

  // Layout privado
  fs.writeFileSync(
    "src/app/(private)/layout.tsx",
    `// 🔒 LAYOUT PRIVADO - Layout para páginas privadas
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar seu próprio layout

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
`
  );

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
