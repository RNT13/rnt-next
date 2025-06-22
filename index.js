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

// 🚀 Criando um novo projeto com Next.js e TypeScript
console.log("📦 Criando novo projeto com Next.js...");
execCommand(`npx --yes create-next-app@latest ${appName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`);

process.chdir(appPath);

// 🎯 Instalando dependências
console.log("📦 Instalando Dependências de produção...");
execCommand(
  "npm install styled-components @types/styled-components react-redux @reduxjs/toolkit framer-motion react-icons immer redux@latest clsx class-variance-authority lucide-react --save"
);

console.log("📦 Instalando Dependências de desenvolvimento...");
execCommand(
  "npm install @types/styled-components eslint-plugin-prettier prettier eslint-config-prettier --save-dev"
);

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
fs.writeFileSync(
  "next.config.js",
  `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
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

// Theme configuration
fs.writeFileSync(
  "src/styles/theme.ts",
  `export const theme = {
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1200px'
  },
  colors: {
    primaryColor: '#011627',
    secondaryColor: '#023864',
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
    green: '#008000',
    green2: '#44BD32',
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

// Global styles for Next.js
fs.writeFileSync(
  "src/styles/globals.css",
  `@tailwind base;
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
`
);

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

// 🎨 Criando componentes e templates
console.log("🎨 Criando componentes de layout...");

// Header component
fs.mkdirSync("src/components/layout/header", { recursive: true });
fs.writeFileSync(
  "src/components/layout/header/Header.tsx",
  `'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HeaderContainer, Logo, NavMenu, NavItem } from './HeaderStyles'

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <Image 
          src="https://placehold.co/150x50?text=Logo" 
          alt="Logo" 
          width={150}
          height={50}
        />
      </Logo>
      <NavMenu>
        <NavItem>
          <Link href="/features">Features</Link>
        </NavItem>
        <NavItem>
          <Link href="/pricing">Pricing</Link>
        </NavItem>
        <NavItem>
          <Link href="/blog">Blog</Link>
        </NavItem>
        <NavItem>
          <Link href="/support">Support</Link>
        </NavItem>
      </NavMenu>
    </HeaderContainer>
  )
}

export default Header`
);

fs.writeFileSync(
  "src/components/layout/header/HeaderStyles.ts",
  `'use client'

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
  
  img {
    width: auto;
    height: 40px;
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
\``
);

// Footer component
fs.mkdirSync("src/components/layout/footer", { recursive: true });
fs.writeFileSync(
  "src/components/layout/footer/Footer.tsx",
  `'use client'

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
        <p>&copy; {getCurrentYear()} RNT Projects. All rights reserved.</p>
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

fs.writeFileSync(
  "src/components/layout/footer/FooterStyles.ts",
  `'use client'

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
\``
);

// Styled Components Registry
fs.writeFileSync(
  "src/lib/styled-components-registry.tsx",
  `'use client'

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

// Providers
fs.writeFileSync(
  "src/components/providers.tsx",
  `'use client'

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
  `import { combineReducers, configureStore as toolkitConfigureStore } from '@reduxjs/toolkit'

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

// Home Styles
fs.writeFileSync(
  "src/styles/HomeStyles.ts",
  `'use client'

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

  h3 {
    font-size: 1.5rem;
    color: \${theme.colors.textColor};
    margin-bottom: 15px;
    font-weight: 600;
  }

  p {
    color: \${theme.colors.gray2};
    line-height: 1.6;
    font-size: 1rem;
  }

  @media (max-width: \${theme.breakpoints.sm}) {
    padding: 30px 20px;
    
    h3 {
      font-size: 1.3rem;
    }
  }
\``
);

// Layout and Page files
fs.writeFileSync(
  "src/app/layout.tsx",
  `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import StyledComponentsRegistry from '@/lib/styled-components-registry'
import { Providers } from '@/components/providers'

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
          <Providers>
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}`
);

fs.writeFileSync(
  "src/app/page.tsx",
  `'use client'

import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'
import { MainContainer, ContentSection, HeroSection, FeatureGrid, FeatureCard } from '@/styles/HomeStyles'

export default function Home() {
  return (
    <MainContainer>
      <Header />
      
      <ContentSection>
        <HeroSection>
          <h1>Bem-vindo ao RNT Next</h1>
          <p>Uma aplicação Next.js moderna com configurações pré-definidas</p>
        </HeroSection>

        <FeatureGrid>
          <FeatureCard>
            <h3>⚡ Performance</h3>
            <p>Otimizado para velocidade e eficiência</p>
          </FeatureCard>
          <FeatureCard>
            <h3>🎨 Design Moderno</h3>
            <p>Interface limpa e responsiva</p>
          </FeatureCard>
          <FeatureCard>
            <h3>🔧 Configurado</h3>
            <p>Tudo pronto para desenvolvimento</p>
          </FeatureCard>
        </FeatureGrid>
      </ContentSection>

      <Footer />
    </MainContainer>
  )
}`
);

// Função principal
async function runOptions() {
  const installI18n = await askQuestion("Deseja instalar i18n? (y/n): ");
  if (installI18n.toLowerCase() === "y") {
    console.log("📦 Instalando i18n...");
    execCommand("npm install next-i18next react-i18next i18next");

    console.log("📂 Criando configuração i18n...");
    fs.writeFileSync(
      "next-i18next.config.js",
      `module.exports = {
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
  },
}
`
    );

    fs.mkdirSync("public/locales/pt", { recursive: true });
    fs.mkdirSync("public/locales/en", { recursive: true });

    fs.writeFileSync(
      "public/locales/pt/common.json",
      JSON.stringify(
        {
          home: "Início",
          about: "Sobre",
          contact: "Contato",
          welcome: "Bem-vindo",
        },
        null,
        2
      )
    );

    fs.writeFileSync(
      "public/locales/en/common.json",
      JSON.stringify(
        {
          home: "Home",
          about: "About",
          contact: "Contact",
          welcome: "Welcome",
        },
        null,
        2
      )
    );
  }

  const installAuth = await askQuestion("Deseja instalar NextAuth.js? (y/n): ");
  if (installAuth.toLowerCase() === "y") {
    console.log("📦 Instalando NextAuth.js...");
    execCommand("npm install next-auth");

    console.log("📂 Criando configuração de autenticação...");
    fs.mkdirSync("src/app/api/auth/[...nextauth]", { recursive: true });

    fs.writeFileSync(
      "src/app/api/auth/[...nextauth]/route.ts",
      `import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
})

export { handler as GET, handler as POST }
`
    );

    fs.writeFileSync(
      ".env.local",
      `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
`
    );
  }

  const installDatabase = await askQuestion("Deseja instalar Prisma? (y/n): ");
  if (installDatabase.toLowerCase() === "y") {
    console.log("📦 Instalando Prisma...");
    execCommand("npm install prisma @prisma/client");
    execCommand("npx prisma init");

    console.log("📂 Criando configuração do banco de dados...");
    fs.writeFileSync(
      "prisma/schema.prisma",
      `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
`
    );

    fs.writeFileSync(
      "src/lib/prisma.ts",
      `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`
    );
  }
}

console.log("✅ Projeto Next.js criado com sucesso!");
console.log("📁 Estrutura de pastas configurada!");
console.log("⚙️ Configurações aplicadas!");

// Executar opções adicionais
runOptions().then(() => {
  console.log("🎉 Configuração concluída!");
  console.log(`📂 Navegue para o diretório: cd ${appName}`);
  console.log("🚀 Execute: npm run dev");
  console.log("🌐 Acesse: http://localhost:3000");
});

