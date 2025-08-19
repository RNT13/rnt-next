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

  const useStyledComponents = cssChoice === "Styled Components";
  const useTailwind = !useStyledComponents;
  const finalChoice = useStyledComponents ? "styled-components" : "tailwind";
  const appPath = path.join(process.cwd(), appName);

  // 1. Criação do projeto Next.js
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath);
  }

  let createCommand = `npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*"`;
  createCommand += useTailwind ? " --tailwind" : " --no-tailwind";
  if (useEmpty) createCommand += " --empty";

  execCommand(createCommand, appPath);

  if (!fs.existsSync(appPath)) {
    console.error(`❌ Erro: Diretório ${appPath} não foi criado`);
    process.exit(1);
  }

  // 2. Instalação de dependências
  let prodDependencies = [
    "react-redux",
    "@reduxjs/toolkit",
    "immer",
    "redux@latest",
    "clsx",
    "class-variance-authority",
    "lucide-react",
  ];

  let devDependencies = [
    "eslint-plugin-prettier",
    "prettier",
    "eslint-config-prettier",
  ];

  if (finalChoice === "styled-components")
    prodDependencies.unshift("styled-components");
  if (installExtraDeps)
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
      "@types/cookie",
      "@types/react-icons"
    );
  }

  if (finalChoice === "styled-components")
    devDependencies.push("@types/styled-components");
  if (installTests)
    devDependencies.push(
      "jest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "@testing-library/user-event",
      "jest-environment-jsdom"
    );

  installDependencies(prodDependencies, devDependencies, appPath);

  // 3. Estrutura de pastas
  const folders = [
    "src/styles",
    "src/lib",
    "src/hooks",
    "src/utils",
    "src/redux",
    "src/redux/slices",
    ".vscode",
  ];
  if (!useEmpty)
    folders.push(
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
  if (installTests) folders.push("__tests__", "src/__tests__");

  if (installBackend)
    folders.push(
      "src/app/api",
      "src/app/api/auth/login",
      "src/app/api/auth/signup",
      "src/app/api/auth/logout",
      "src/app/api/auth/verify",
      "src/app/api/users"
    );

  await ensureFolders(appPath, folders);

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

  await writeFile(path.join(appPath, "next.config.ts"), nextConfig);

  // Jest config se testes foram escolhidos
  if (installTests) {
    await writeFile(
      path.join(appPath, "jest.config.js"),
      `
const nextJest = require('next/jest')

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

    await writeFile(
      path.join(appPath, "jest.setup.js"),
      `import '@testing-library/jest-dom'\n`
    );
  }

  // 4. Criação de arquivos de configuração (exemplo)
  await writeFile(
    path.join(appPath, ".vscode/settings.json"),
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

  // Prettier
  await writeFile(
    path.join(appPath, ".prettierrc.json"),
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

  // Editor config
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

  //Cria arquivo types.d.ts na raiz do projeto
  await writeFile(
    path.join(appPath, "types.d.ts"),
    `
      /**
 * Arquivo de tipos globais do projeto
 * 
 * Adicione aqui todos os tipos TypeScript que serão utilizados
 * em múltiplos arquivos do projeto, incluindo:
 * 
 * - Interfaces de API
 * - Tipos de dados do banco
 * - Tipos de componentes compartilhados
 * - Tipos de estado global (Redux)
 * - Tipos de formulários
 * - Enums e constantes tipadas
 */

import { ColorVariants } from '@/utils/colorUtils'
import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      baseBlue: ColorVariants
      baseGreen: ColorVariants
      baseRed: ColorVariants
      baseCyan: ColorVariants

      // cores estáticas
      primaryColor: string
      secondaryColor: string
      thirdColor: string
      forthColor: string
      textColor: string

      yellow: string
      yellow2: string
      blue: string
      blue2: string
      gray: string
      gray2: string
      orange: string
      orange2: string
      black: string
      red: string
      redHover: string
      error: string
      green: string
      green2: string
      neonBlue: string
      neonGree: string

      // suporte a nested objects (como neon no darkTheme)
      neon?: {
        [key: string]: string
      }
    }
  }
}

// Exemplo: Tipos de usuário
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// Exemplo: Tipos de API Response
export interface ApiResponse {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Exemplo: Tipos de formulário
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Exemplo: Tipos de componentes
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Exemplo: Tipos de estado
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Exemplo: Tipos de produtos (e-commerce)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}
    `
  );

  //Cria arquivo useAppDispatch.ts dentro de src/hooks
  await writeFile(
    path.join(appPath, "src/hooks/useAppDispatch.ts"),
    `
      import { AppDispatch, RootState } from '@/redux/store'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    `
  );

  // Criar colorUtils
  await writeFile(
    path.join(appPath, "src/utils/colorUtils.ts"),
    `// 🎨 COLOR UTILS - Utilitários para geração de variantes de cores HSL

export type ColorVariants = {
  base: string
  light: string
  light02: string
  light04: string
  light08: string
  light20: string
  light30: string
  light40: string
  light50: string
  dark: string
  dark02: string
  dark04: string
  dark08: string
  dark20: string
  dark30: string
  dark40: string
  dark50: string


export function colorHSLVariants(h: number, s: number, l: number): ColorVariants {
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
  await writeFile(
    path.join(appPath, "src/styles/theme.ts"),
    `// 🎨 ARQUIVO DE TEMA - Configurações de cores e breakpoints do projeto

import { colorHSLVariants } from '@/utils/colorUtils'
import { DefaultTheme } from 'styled-components'

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

export const theme: DefaultTheme = {
  colors: {
    baseBlue,
    baseGreen,
    baseRed,
    baseCyan,
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

  // Cria componente de Botão estilizado
  await writeFile(
    path.join(appPath, "src/components/ui/Button/Button.tsx"),
    `
      "use client";

import Link from "next/link";
import React, { forwardRef } from "react";
import { ButtonContent, IconWrapper, StyledButton } from "./ButtonStyles";

type ButtonVariants = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSizes = "sm" | "md" | "lg";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
};

export interface CommonButtonProps {
  variant?: ButtonVariants;
  size?: ButtonSizes;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export type ButtonProps = CommonButtonProps & (AnchorProps | NativeButtonProps);

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const content = (
      <StyledButton
        ref={ref as any}
        $variant={variant}
        $size={size}
        $loading={loading}
        $fullWidth={fullWidth}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...(props as any)}
      >
        <ButtonContent $loading={loading}>
          {leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
          {children}
          {rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
        </ButtonContent>
      </StyledButton>
    );

    if ((props as AnchorProps).href) {
      return (
        <Link href={(props as AnchorProps).href} passHref>
          {content}
        </Link>
      );
    }

    return content;
  }
);

Button.displayName = "Button";
export default Button;

    `
  );

  // Cria estilos do Botão
  await writeFile(
    path.join(appPath, "src/components/ui/Button/ButtonStyles.tsx"),
    `
import { media, theme } from '@/styles/theme'
import styled, { css } from 'styled-components'

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  $size: 'sm' | 'md' | 'lg'
  $loading: boolean
  $fullWidth: boolean
}

const buttonVariants = {
  primary: css\`
    background-color: ${({ theme }) => theme.colors.baseBlue.base};
    color: ${({ theme }) => theme.colors.textColor};
    border: 2px solid ${theme.colors.baseBlue.base};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseBlue.dark};
      border-color: ${({ theme }) => theme.colors.baseBlue.dark};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseBlue.dark20};
      transform: translateY(0);
    }
  \`,

  secondary: css\`
    background-color: ${({ theme }) => theme.colors.baseGreen.base};
    color: ${({ theme }) => theme.colors.textColor};
    border: 2px solid ${({ theme }) => theme.colors.baseGreen.base};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseGreen.dark};
      border-color: ${({ theme }) => theme.colors.baseGreen.dark};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseGreen.dark20};
      transform: translateY(0);
    }
  \`,

  outline: css\`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.baseBlue.base};
    border: 2px solid ${({ theme }) => theme.colors.baseBlue.base};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseBlue.base};
      color: ${({ theme }) => theme.colors.textColor};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseBlue.dark};
      transform: translateY(0);
    }
  \`,

  ghost: css\`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.textColor};
    border: 2px solid transparent;

    &:hover:not(:disabled) {
      background-color: transparent;
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.gray};
      transform: translateY(0);
    }
  \`,

  danger: css\`
    background-color: ${({ theme }) => theme.colors.baseRed.base};
    color: ${({ theme }) => theme.colors.textColor};
    border: 2px solid ${({ theme }) => theme.colors.baseRed.base};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseRed.dark};
      border-color: ${({ theme }) => theme.colors.baseRed.dark};
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.baseRed.dark20};
      transform: translateY(0);
    }
  \`
}

const buttonSizes = {
  sm: css\`
    padding: 8px 16px;
    font-size: 12px;
    min-height: 26px;
  \`,

  md: css\`
    padding: 10px 20px;
    font-size: 14px;
    min-height: 34px;
  \`,

  lg: css\`
    padding: 14px 28px;
    font-size: 16px;
    min-height: 42px;
  \`
}

export const StyledButton = styled.button<StyledButtonProps>\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;

  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  position: relative;
  overflow: hidden;

  ${({ $size }) => buttonSizes[$size]}
  ${({ $variant }) => buttonVariants[$variant]}

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      cursor: not-allowed;

      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.3s,
      height 0.3s;
  }

  &:active:not(:disabled)::after {
    width: 300px;
    height: 300px;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.baseBlue.base};
    outline-offset: 2px;
  }

  ${({ $size }) => css`
    ${media.pc} {
      ${$size === "lg" && buttonSizes.md}
      ${$size === "md" && buttonSizes.sm}
    }

    ${media.tablet} {
      ${$size === "lg" && buttonSizes.md}
      ${$size === "md" && buttonSizes.sm}
    }

    ${media.mobile} {
      ${$size === "lg" && buttonSizes.md}
      ${$size === "md" && buttonSizes.sm}
    }
  `}
\`

export const ButtonContent = styled.span<{ $loading: boolean }>\`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ $loading }) => ($loading ? 0 : 1)};
  transition: opacity 0.2s ease-in-out;
\`

export const IconWrapper = styled.span\`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1em;
    height: 1em;
  }
\`
    `
  );

  // Cria componente de CartWrapper
  await writeFile(
    path.join(appPath, "src/components/ui/CartWrapper/CartWrapper.tsx"),
    `
    import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type CartWrapperProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const CartWrapper = ({ isOpen, onClose, children }: CartWrapperProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              opacity: {
                duration: 0.3,
              },
              when: "beforeChildren",
            }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backdropFilter: "blur(5px)",
              zIndex: 99,
            }}
          />

          <motion.aside
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "end",
              zIndex: 100,
            }}
            onClick={onClose}
          >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

  `
  );

  //cria componente de ErrorMessage
  await writeFile(
    path.join(appPath, "src/components/ui/ErrorMessage/ErrorMessage.tsx"),
    `
    import { BiSolidError } from "react-icons/bi";
import { ErrorMessageContainer, ErrorMessageContent } from "./ErrorMessageStyles";


type Props = {
  message: string
}

export const ErrorMessage = ({ message }: Props) => (
  <ErrorMessageContainer role="alert" aria-label="Mensagem de erro" className="container">
    <ErrorMessageContent>
      <BiSolidError />
      {message}
    </ErrorMessageContent>
  </ErrorMessageContainer>
)

  `
  );

  // cria estilo do ErrorMessage
  await writeFile(
    path.join(appPath, "src/components/ui/ErrorMessage/ErrorMessageStyles.ts"),
    `
import { theme } from '@/styles/theme';
import { styled } from 'styled-components';

export const ErrorMessageContainer = styled.div\`\`;

export const ErrorMessageContent = styled.div\`
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 1rem;
  text-align: center;
  color: \${theme.colors.baseBlue.light40};
  background-color: \${theme.colors.baseRed.dark08};

  svg {
    font-size: 2rem;
    margin-right: 0.5rem;
  }
\`;
`
  );

  // Cria componente de MaskedInput
  await writeFile(
    path.join(appPath, "src/components/ui/MaskedInput/MaskedInput.tsx"),
    `
import { useField } from 'formik'
import { IMaskInput } from 'react-imask'
import { MaskedInputContainer } from './MaskedInputStyles'

type MaskedInputProps = {
  name: string
  mask?: string
  placeholder?: string
  className?: string
  showError?: boolean
  type?: string
  id?: string
}

export const MaskedInput = ({ name, mask, placeholder, className, showError = false, type = 'text', id }: MaskedInputProps) => {
  const [field, meta, helpers] = useField(name)

  const commonProps = {
    ...field,
    placeholder,
    className,
    type,
    id,
    onBlur: () => helpers.setTouched(true),
  }

  return (
    <MaskedInputContainer>
      {mask ? (
        <IMaskInput
          {...commonProps}
          mask={mask}
          value={String(field.value ?? '')}
          onAccept={(value: string) => helpers.setValue(value)}
        />
      ) : (
        <input
          {...commonProps}
          value={String(field.value ?? '')}
          onChange={(e) => helpers.setValue(e.target.value)}
        />
      )}
      {showError && meta.touched && meta.error && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {meta.error}
        </div>
      )}
    </MaskedInputContainer>
  )
}

    `
  );

  // criar estilo do MaskedInput
  await writeFile(
    path.join(appPath, "src/components/ui/MaskedInput/MaskedInputStyles.ts"),
    `
import { theme } from '@/styles/theme'
import { styled } from 'styled-components'

export const MaskedInputContainer = styled.div\`
  width: 100%;
  input {
    padding: 8px;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 2px solid \${theme.colors.baseBlue.light20};

    &:focus {
      outline: none;
      border: 2px solid \${theme.colors.baseBlue.dark};
    }

    &.error {
      border: 2px solid \${theme.colors.baseRed.base};
      background-color: \${theme.colors.baseRed.light02};
    }
  }
\`

    `
  );

  // cria componente ModalWrapper
  await writeFile(
    path.join(appPath, "src/components/ui/ModalWrapper/ModalWrapper.tsx"),
    `
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type ModalWrapperProps = {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
};

export const ModalWrapper = ({ isOpen, children, onClose }: ModalWrapperProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(5px)",
          }}
          onClick={onClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

    `
  );

  //cria utils de checagem de input
  await writeFile(
    path.join(appPath, "src/utils/maskedInputCheckUtils.ts"),
    `
import { FormikProps } from 'formik'

export const checkInputHasError = <T>(fieldName: keyof T, form: FormikProps<T>): boolean => {
  const isTouched = fieldName in form.touched
  const hasError = fieldName in form.errors
  return isTouched && hasError
}
    `
  );

  //cria o componente AuthProvider
  await writeFile(
    path.join(appPath, "src/components/ui/AuthProvider/AuthProvider.tsx"),
    `
'use client'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login, logout } from '@/redux/slices/authSlice'
import { useEffect } from 'react'

export function AuthProvider() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          dispatch(login(data))
        } else {
          dispatch(logout())
        }
      } catch {
        dispatch(logout())
      }
    }

    fetchUser()
  }, [dispatch])

  return null
}
    `
  );

  //cria o arquivo inicial do eslint.config.mjs
  await writeFile(
    path.join(appPath, ".eslintrc.mjs"),
    `
import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

//manter este arquivo e remover o arquivo eslint.config criado pelo create-next-app

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const config = [
  {
    ignores: ['src/generated/**']
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript')
]

export default config

    `
  );

  // Criar arquivos específicos baseados na escolha
  if (finalChoice === "styled-components") {
    await createStyledComponentsFiles(appPath);
  } else {
    await createTailwindFiles(appPath);
  }

  // Providers
  await writeFile(
    path.join(appPath, "src/components/providers.tsx"),
    `
'use client'

import { store } from '@/redux/store'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { AuthProvider } from './ui/AuthProvider/AuthProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthProvider />
        {children}
      </ThemeProvider>
    </Provider>
  )
}
  `
  );

  // Redux Store baseado na escolha de testes
  if (installTests) {
    await writeFile(
      path.join(appPath, "src/redux/store.ts"),
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
    await writeFile(
      path.join(appPath, "src/redux/slices/authSlice.ts"),
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
    login: (state) => {
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

export const { login, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
`
    );
  } else {
    await writeFile(
      path.join(appPath, "src/redux/store.ts"),
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
    await writeFile(
      path.join(appPath, "src/redux/slices/authSlice.ts"),
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
    login: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    }
  }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
`
    );
  }

  // Configuração do Prisma se backend foi escolhido
  if (installBackend) {
    console.log("🗄️ Configurando Prisma...");

    // Executar prisma init
    execCommand("npx prisma init", appPath);

    // Schema do Prisma com comentários
    await writeFile(
      path.join(appPath, "prisma/schema.prisma"),
      `// 🗄️ PRISMA SCHEMA - Configuração do banco de dados
// Este arquivo define a estrutura do seu banco de dados

// Configuração do gerador do Prisma Client
generator client {
  provider = "prisma-client-js"
}

// Configuração da conexão com o banco de dados
datasource db {
  provider = "postgresql"
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
//    Exemplo: DATABASE_URL="postgresql://username:password@localhost:3306/database_name"
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
    await writeFile(
      path.join(appPath, "src/utils/prisma.ts"),
      `
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

      `
    );

    //Cria arquivo middleware.ts na raiz do projeto
    await writeFile(
      path.join(appPath, "middleware.ts"),
      `
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/sign-in', '/register', '/pricing', '/allGames', '/gameDetails', '/checkout']

const JWT_SECRET = process.env.JWT_SECRET!
const REDIRECT_WHEN_NOT_AUTHENTICATED = '/sign-in'

function redirectTo(path: string, request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = path
  return NextResponse.redirect(url)
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = publicRoutes.includes(path)
  const token = request.cookies.get('token')?.value

  let isAuthenticated = false

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET)
      isAuthenticated = true
    } catch (err) {
      console.error('Token inválido:', err)
    }
  }

  if (!isAuthenticated && !isPublic) {
    return redirectTo(REDIRECT_WHEN_NOT_AUTHENTICATED, request)
  }

  if (isAuthenticated && (path === '/sign-in' || path === '/register')) {
    return redirectTo('/', request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)']
}
    `
    );

    // .env file
    await writeFile(
      path.join(appPath, ".env"),
      `
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ybXBkcEV4N0R6MG9RYllRNDlCdUMiLCJhcGlfa2V5IjoiMDFLMVJIUzk0NEozMTFaQVNUSFdETldTSjkiLCJ0ZW5hbnRfaWQiOiJjNTQ5MTU4ZmQ3NGJkNTFmNjc5OGUwOTZjOWIxOThkNjIwZmMwYTU1NjU1MTEyMWFkMTUzYzc0NmQ1OGQyZGYzIiwiaW50ZXJuYWxfc2VjcmV0IjoiM2UyNWZiMzAtZDZkNS00ZWE0LTg5NjEtZjkwNDQ0NjZjZjUxIn0.EYn7alhEwVNOUCH5nAq4NiUKNOi0CUIyT0iBHORaHEc"

JWT_SECRET=alguma-coisa-bem-secreta


    `
    );

    // cria o arquivo src/app/api/auth/login/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/login/route.ts"),
      `
import { prisma } from '@/utils/prisma'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    const serialized = serialize('token', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    const response = new NextResponse(JSON.stringify({ message: 'Login bem-sucedido', user }), {
      status: 200
    })

    response.headers.set('Set-Cookie', serialized)

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 })
  }
}

    `
    );

    // cria o arquivo src/app/api/auth/logout/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/logout/route.ts"),
      `
import { serialize } from 'cookie'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.headers.set(
    'Set-Cookie',
    serialize('token', '', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })
  )
  return response
}

    `
    );

    // cria o arquivo src/app/api/auth/register/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/register/route.ts"),
      `
import { prisma } from '@/utils/prisma'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as { id: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}
    `
    );

    // cria o arquivo src/app/api/auth/verify/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/verify/route.ts"),
      `
import { prisma } from '@/utils/prisma'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as { id: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}

    `
    );
  }

  // Criar layout baseado na escolha
  await createLayout(appPath, finalChoice, useEmpty);

  // Criar arquivos de exemplo se não for projeto vazio
  if (!useEmpty) {
    await createExampleFiles(appPath, finalChoice, installTests, appName);
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
    console.log("🗄️ Backend: Prisma + PostgreSQL configurado");
    console.log("   - Configure DATABASE_URL no .env");
    console.log("   - Execute: npx prisma db push");
    console.log("   - Execute: npx prisma generate");
  }
  console.log("💙 Criado por RNT");
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
