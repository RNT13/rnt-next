import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execCommand } from "../utils/execCommand.js";
import { ensureFolders, writeFile } from "../utils/fileOps.js";
import { installDependencies } from "../utils/installDeps.js";

export async function createProject(config) {
  const {
    appName,
    cssChoice,
    useEmpty,
    installTests,
    installExtraDeps,
    installBackend,
  } = config;

  const finalChoice =
    cssChoice === "Styled Components" ? "styled-components" : "tailwind";
  const appPath = path.join(process.cwd(), appName);

  // 1. Criação do projeto Next.js
  console.log(chalk.blue(`🚀 Criando projeto Next.js '${appName}'...`));
  let createCommand = `npx create-next-app@latest ${appName} --typescript --eslint --app --src-dir --import-alias "@/*"`;
  createCommand +=
    finalChoice === "tailwind" ? " --tailwind" : " --no-tailwind";
  if (useEmpty) createCommand += " --empty";
  execCommand(createCommand);

  if (!fs.existsSync(appPath)) {
    console.error(
      chalk.red(`❌ Erro: Diretório ${appPath} não foi criado. Abortando.`)
    );
    process.exit(1);
  }
  // É mais seguro construir caminhos a partir de appPath do que usar process.chdir.
  // process.chdir(appPath);

  // 2. Instalação de dependências
  console.log(chalk.blue("📦 Instalando dependências..."));
  const prodDependencies = [
    "react-redux",
    "@reduxjs/toolkit",
    "immer",
    "redux@latest",
    "clsx",
    "class-variance-authority",
    "lucide-react",
  ];

  const devDependencies = [
    "eslint-plugin-prettier",
    "prettier",
    "eslint-config-prettier",
  ];

  if (finalChoice === "styled-components") {
    prodDependencies.push("styled-components");
    devDependencies.push("@types/styled-components");
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
    prodDependencies.push(
      "prisma",
      "@prisma/client",
      "jsonwebtoken",
      "bcryptjs"
    );
    devDependencies.push(
      "@types/jsonwebtoken",
      "@types/bcryptjs",
      "@types/cookie"
    );
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

  // Passando o appPath para o comando de instalação
  installDependencies(prodDependencies, devDependencies, appPath);

  // 3. Estrutura de pastas
  console.log(chalk.blue("📁 Criando estrutura de pastas..."));
  const folders = [
    "src/styles",
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
      "src/components/ui",
      "src/components/ui/Button",
      "src/components/ui/CartWrapper",
      "src/components/ui/ModalWrapper",
      "src/components/ui/ErrorMessage",
      "src/components/ui/MaskedInput",
      "src/components/ui/AuthProvider",
      "src/components/layout",
      "src/components/layout/header",
      "src/components/layout/footer"
    );
  }

  if (installTests) {
    folders.push("__tests__", "src/__tests__");
  }

  if (installBackend) {
    folders.push(
      "src/app/api",
      "src/app/api/auth/login",
      "src/app/api/auth/register", // Renomeado de signup para register
      "src/app/api/auth/logout",
      "src/app/api/auth/verify",
      "src/app/api/users"
    );
  }

  await ensureFolders(appPath, folders);

  // 4. Criação de arquivos de configuração
  console.log(chalk.blue("⚙️  Configurando arquivos..."));

  // Next.js config (usando template literals)
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  ${
    finalChoice === "styled-components"
      ? `compiler: {
    styledComponents: true,
  },`
      : ""
  }
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['placehold.co'],
  },
}

module.exports = nextConfig
`;
  await writeFile(path.join(appPath, "next.config.js"), nextConfigContent);

  // Jest config se testes foram escolhidos
  if (installTests) {
    await writeFile(
      path.join(appPath, "jest.config.js"),
      `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
`
    );

    await writeFile(
      path.join(appPath, "jest.setup.js"),
      `import '@testing-library/jest-dom'`
    );
  }

  // Arquivos de configuração do editor
  await writeFile(
    path.join(appPath, ".vscode/settings.json"),
    JSON.stringify(
      {
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true,
        },
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "[typescriptreact]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode",
        },
        "typescript.tsdk": "node_modules/typescript/lib",
      },
      null,
      2
    )
  );

  await writeFile(
    path.join(appPath, ".prettierrc.json"),
    JSON.stringify(
      {
        trailingComma: "es5",
        semi: false,
        singleQuote: true,
        printWidth: 80,
        arrowParens: "avoid",
      },
      null,
      2
    )
  );

  await writeFile(
    path.join(appPath, ".editorconfig"),
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

  // ... (O restante do código para criar os outros arquivos permanece o mesmo)
  // Por brevidade, vou omitir a repetição de todos os `writeFile`,
  // mas vou incluir as correções importantes abaixo.

  // Redux Store e Slice (Unificado)
  await writeFile(
    path.join(appPath, "src/redux/store.ts"),
    `// 🏪 REDUX STORE - Configuração do gerenciamento de estado
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

  await writeFile(
    path.join(appPath, "src/redux/slices/authSlice.ts"),
    `// 🔐 AUTH SLICE - Gerenciamento de estado de autenticação
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // Mantido para casos de uso com e sem testes
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Inicia como true para a verificação inicial
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setLoading, login, logout } = authSlice.actions;
export default authSlice.reducer;
`
  );

  // Corrigindo o nome da cor no theme.ts
  await writeFile(
    path.join(appPath, "src/styles/theme.ts"),
    `// ... (conteúdo anterior do theme.ts)
    green2: '#44BD32',
    neonBlue: '#00FFD5 ',
    neonGreen: '#00FF6A ' // CORRIGIDO de neonGree para neonGreen
  }
}
// ... (restante do conteúdo do theme.ts)
`
  );

  // Configuração do Prisma se backend foi escolhido
  if (installBackend) {
    console.log(chalk.blue("🗄️  Configurando Prisma..."));
    execCommand("npx prisma init", appPath);

    // Schema do Prisma (sem alterações, já estava bom)
    await writeFile(
      path.join(appPath, "prisma/schema.prisma"),
      `// ... (conteúdo do schema.prisma)`
    );

    // Arquivo .env (sem alterações)
    await writeFile(
      path.join(appPath, ".env"),
      `DATABASE_URL="mysql://user:password@host:port/db"
JWT_SECRET=your-super-secret-key
`
    );

    // Rota de Login (sem alterações)
    await writeFile(
      path.join(appPath, "src/app/api/auth/login/route.ts"),
      `// ... (conteúdo da rota de login)`
    );

    // Rota de Logout (sem alterações)
    await writeFile(
      path.join(appPath, "src/app/api/auth/logout/route.ts"),
      `// ... (conteúdo da rota de logout)`
    );

    // Rota de Registro (CORRIGIDA)
    await writeFile(
      path.join(appPath, "src/app/api/auth/register/route.ts"),
      `
import { prisma } from '@/lib/prisma'; // Ajuste o caminho se necessário
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 });
  }
}
`
    );

    // Rota de Verificação (CORRIGIDA)
    await writeFile(
      path.join(appPath, "src/app/api/auth/verify/route.ts"),
      `
import { prisma } from '@/lib/prisma'; // Ajuste o caminho se necessário
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    // CORREÇÃO: O ID do token é uma string (cuid)
    const decoded = jwt.verify(token, secret) as { id: string; name: string; email: string };

    // Não é necessário buscar no banco novamente se os dados já estão no token,
    // mas é uma boa prática para garantir que o usuário ainda existe.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    // Limpa o cookie inválido
    const response = NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    response.cookies.set('token', '', { maxAge: -1, path: '/' });
    return response;
  }
}
`
    );
  }

  // ... (O restante do código para criar layout, exemplos, etc., permanece o mesmo)

  console.log("\n" + chalk.green("=".repeat(50)));
  console.log(chalk.green.bold("✅ PROJETO CRIADO COM SUCESSO!"));
  console.log(chalk.green("=".repeat(50)));
  console.log(`📁 Navegue para o diretório: ${chalk.cyan(`cd ${appName}`)}`);
  console.log(`🚀 Para iniciar o servidor: ${chalk.cyan("npm run dev")}`);
  console.log(
    `🎨 Estilo de CSS: ${chalk.yellow(
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    )}`
  );
  if (installTests) {
    console.log(`🧪 Para rodar os testes: ${chalk.cyan("npm test")}`);
  }
  if (installBackend) {
    console.log(chalk.magenta.bold("\n🗄️  Ações do Backend:"));
    console.log(
      `   - Configure sua ${chalk.yellow(
        "DATABASE_URL"
      )} no arquivo ${chalk.cyan(".env")}`
    );
    console.log(`   - Execute: ${chalk.cyan("npx prisma db push")}`);
  }
  console.log(chalk.blue.bold("\n💙 Criado por RNT"));
  console.log("=".repeat(50));
}

async function createStyledComponentsFiles(appPath) {
  // Global Styles para Styled Components atualizado
  await writeFile(
    path.join(appPath, "src/styles/globalStyles.tsx"),
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
  await writeFile(
    path.join(appPath, "src/lib/styled-components-registry.tsx"),
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

async function createTailwindFiles(appPath) {
  // Verificar se o globals.css já existe e atualizar
  const globalsPath = "src/app/globals.css";

  if (fs.existsSync(globalsPath)) {
    // Ler o conteúdo existente e adicionar customizações
    let existingContent = await fs.readFile(globalsPath, "utf8");

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

      await writeFile(globalsPath, existingContent + customStyles);
    }
  }
}

async function createLayout(appPath, cssChoice, useEmpty) {
  if (cssChoice === "styled-components") {
    // Layout com Styled Components
    await writeFile(
      path.join(appPath, "src/app/layout.tsx"),
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
    await writeFile(
      path.join(appPath, "src/app/layout.tsx"),
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

async function createExampleFiles(appPath, cssChoice, installTests, appName) {
  // Criar estrutura de rotas com exemplos
  if (!fs.existsSync("src/app/(public)")) {
    fs.mkdirSync("src/app/(public)", { recursive: true });
  }
  if (!fs.existsSync("src/app/(private)")) {
    fs.mkdirSync("src/app/(private)", { recursive: true });
  }

  // Página inicial de exemplo
  if (cssChoice === "styled-components") {
    await writeFile(
      path.join(appPath, "src/app/page.tsx"),
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
    await writeFile(
      path.join(appPath, "src/app/page.tsx"),
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
    await writeFile(
      path.join(appPath, "src/app/(public)/layout.tsx"),
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

    await writeFile(
      path.join(appPath, "src/app/(public)/loading.tsx"),
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

    await writeFile(
      path.join(appPath, "src/app/(public)/not-found.tsx"),
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
    await writeFile(
      path.join(appPath, "src/app/(public)/layout.tsx"),
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

    await writeFile(
      path.join(appPath, "src/app/(public)/loading.tsx"),
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

    await writeFile(
      path.join(appPath, "src/app/(public)/not-found.tsx"),
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
  await writeFile(
    path.join(appPath, "src/app/(private)/layout.tsx"),
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
    await writeFile(
      path.join(appPath, "src/components/layout/header/Header.tsx"),
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
    await writeFile(
      path.join(appPath, "src/components/layout/header/Header.tsx"),
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
    await writeFile(
      path.join(appPath, "src/components/layout/footer/Footer.tsx"),
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
    await writeFile(
      path.join(appPath, "src/components/layout/footer/Footer.tsx"),
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
    await writeFile(
      path.join(appPath, "__tests__/page.test.tsx"),
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

  // 5. Mensagem final
  console.log(chalk.green(`✅ Projeto '${appName}' criado com sucesso!`));
}
