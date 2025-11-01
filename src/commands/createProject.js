import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execCommand } from "../utils/execCommand.js";
import { ensureFolders, writeFile } from "../utils/fileOps.js";
import { installDependencies } from "../utils/installDeps.js";

// =============================================================================
// FUNÇÃO PRINCIPAL DE CRIAÇÃO DO PROJETO
// =============================================================================
export async function createProject(config) {
  // --- Bloco 1: Preparação de Variáveis e Configurações ---
  // Desestrutura as opções do usuário e define variáveis de controle para o script.
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

  console.log(chalk.blue(`🚀 Iniciando a criação do projeto '${appName}'...`));

  // --- Bloco 2: Criação da Estrutura Base do Next.js ---
  // Executa o comando 'create-next-app' com as flags apropriadas.
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath);
  }

  let createCommand = `npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*"`;
  createCommand += useTailwind ? " --tailwind" : " --no-tailwind";
  if (useEmpty) createCommand += " --empty";

  execCommand(createCommand, appPath);

  // Verificação de segurança para garantir que o diretório foi criado antes de prosseguir.
  if (!fs.existsSync(appPath)) {
    console.error(
      chalk.red(
        `❌ Erro Crítico: O diretório do projeto ${appPath} não foi criado. Abortando.`
      )
    );
    process.exit(1);
  }

  // --- Bloco 3: Instalação de Dependências ---
  // Monta dinamicamente as listas de dependências de produção e desenvolvimento.
  console.log(chalk.blue("📦 Instalando dependências..."));

  let prodDependencies = [
    "react-redux",
    "@reduxjs/toolkit",
    "immer",
    "redux",
    "clsx",
    "class-variance-authority",
    "lucide-react",
  ];

  let devDependencies = [
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
      "jose",
      "bcryptjs",
      "cookie",
      "next-cloudinary",
      "resend",
      "react-email",
      "@react-email/components",
      "@react-email/render",
      "@stripe/react-stripe-js",
      "@stripe/stripe-js",
      "stripe"
    );
    devDependencies.push(
      "@types/jsonwebtoken",
      "@types/bcryptjs",
      "@types/cookie",
      "@types/react-icons"
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

  installDependencies(prodDependencies, devDependencies, appPath);

  // --- Bloco 4: Criação da Estrutura de Pastas ---
  // Garante que a arquitetura de diretórios customizada exista.
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
      "src/components/ui",
      "src/components/ui/Button",
      "src/components/ui/CartWrapper",
      "src/components/ui/ModalWrapper",
      "src/components/ui/ErrorMessage",
      "src/components/ui/MaskedInput",
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
      "src/app/api/auth/logout",
      "src/app/api/auth/verify",
      "src/app/api/auth/register",
      "src/app/api/users"
    );
  }

  await ensureFolders(appPath, folders);

  // --- Bloco 5: Geração de Arquivos de Configuração ---
  // Cria arquivos de configuração para Next.js, Jest, VSCode, Prettier, etc.
  console.log(chalk.blue("⚙️ Gerando arquivos de configuração..."));

  // Next.js config
  let nextConfig = `/** @type {import('next').NextConfig} */\nconst nextConfig = {`;
  if (finalChoice === "styled-components") {
    nextConfig += `\n  compiler: {\n    styledComponents: true,\n  },`;
  }
  nextConfig += `\n  images: {\n    formats: ['image/avif', 'image/webp'],\n    domains: ['placehold.co', 'res.cloudinary.com', 'api.cloudinary.com'],\n  },\n}\n\nexport default nextConfig;\n`; // CORRIGIDO para 'export default'
  await writeFile(path.join(appPath, "next.config.mjs"), nextConfig); // Renomeado para .mjs para consistência com ES Modules

  // Jest config
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
      `import '@testing-library/jest-dom'`
    );
  }

  // VSCode, Prettier, EditorConfig
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
  await writeFile(
    path.join(appPath, ".editorconfig"),
    `
root = true
  
  [*]
  indent_style = space
  indent_size = 2
  end_of_line = lf
  charset = utf-8
  trim_trailing_whitespace = true
  insert_final_newline = true
    `
  );

  // --- Bloco 6: Geração de Arquivos de Código Base ---
  // Cria arquivos de tipagem, hooks, utils, temas, etc.
  console.log(chalk.blue("📝 Gerando arquivos de código base..."));

  await writeFile(
    path.join(appPath, "types.d.ts"),
    `
import 'styled-components'
import { store } from './src/redux/store'

// Tipagem do Redux
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Tipagem global pro React-Redux + RTK
declare module 'react-redux' {
  type DefaultRootState = RootState
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      baseBlack: ColorVariants
      baseBlue: ColorVariants
      baseGreen: ColorVariants
      baseRed: ColorVariants
      baseCyan: ColorVariants
      baseYellow: ColorVariants

      // cores estáticas
      primaryColor: string
      secondaryColor: string
      thirdColor: string
      forthColor: string
      fifthColor: string
      sixthColor: string
      pinkColor: string
      pinkColor2: string
      pinkColor3: string
      textColor: string
      textColor2: string
      textColor3: string
      bgColor: string

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

declare global {
  declare interface ColorVariants {
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
  }

  type TagType = keyof typeof TAG_CONFIG

  // -------------------------------------
  // Enums (Status e Roles)
  // -------------------------------------
  enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
  }

  enum MessageStatus {
    NEW = 'NEW',
    READ = 'READ',
    ANSWERED = 'ANSWERED'
  }

  enum OrderStatus {
    PAID = 'PAID',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
  }

  enum PaymentMethod {
    BOLETO = 'BOLETO',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    PENDING = 'PENDING'
  }

  // -------------------------------------
  // Entidades do Banco de Dados (Models)
  // -------------------------------------
  interface Category {
    id: string
    name: string
    slug: string
    createdAt: Date
    updatedAt: Date
  }

  interface Product {
    id: string
    name: string
    categoryId: string
    category: Category
    description: string
    originalPrice: number
    salePrice: number
    discount: number
    thumbnail: string
    gallery: string[]
    stock: number
    highlight: boolean
    sold: number
    active: boolean
    weight: number
    height: number
    width: number
    length: number
    createdAt: Date
    updatedAt: Date
  }

  interface Address {
    id: string
    label: string
    tel: string
    zipCode: string
    street: string
    complement?: string
    number: string
    city: string
    state: string
  }

  interface User {
    id: string
    name: string
    email: string
    password: string
    avatar?: string
    role: UserRole
    address?: Address[]
    createdAt: Date
    updatedAt: Date
  }

  interface CartItem {
    id: number
    product: Product
    quantity: number
    cartId: number
  }

  interface Cart {
    id: number
    userId: string
    items: CartItem[]
  }

  interface OrderProduct {
    id: string
    product: Product
    productId: string
    orderId: string
    quantity: number
    price: number
  }

  interface Order {
    id: string
    user: User
    userId: string
    products: OrderProduct[]
    totalAmount: number
    paymentMethod: PaymentMethod
    status: OrderStatus
    shippingAddress: Address
    shippingCost: number
    trackingCode?: string
    stripePaymentId?: string
    createdAt: Date
    updatedAt: Date
    statusHistory?: {
      status: OrderStatus
      changedAt: Date
    }[]
  }

  interface Message {
    id: string
    name: string
    email: string
    tel: string
    type: string
    message: string
    status: MessageStatus
    response?: string
    user?: User
    createdAt: Date
    updatedAt: Date
  }

  // -------------------------------------
  // Payloads e Respostas de API
  // -------------------------------------

  // Auth
  interface RegisterPayload {
    name: string
    email: string
    password: string
  }
  interface RegisterResponse {
    user: User
    token: string
    message: string
    success: boolean
  }
  interface LoginPayload {
    email: string
    password: string
  }
  interface LoginResponse {
    user: User
    token: string
    message: string
    success: boolean
  }
  interface VerifyResponse {
    id: string
    name: string
    email: string
    role: UserRole
    avatar: string
    createdAt: Date
    updatedAt: Date
    defaultAddressId: string
  }

  // Product
  interface NewProductPayload {
    id?: string
    name: string
    categoryId: string
    description: string
    originalPrice?: number
    thumbnail: string
    gallery: string[]
    discount: number
    stock: number
    highlight: boolean
    sold: number
    active: boolean
  }

  // Cart
  interface SimplifiedCartItem {
    productId: string
    quantity: number
    salePrice: number
  }
  interface NewCartItemPayload {
    productId: string
    quantity: number
  }
  interface UpdateCartItemPayload {
    quantity: number
  }

  // Address
  interface NewAddressPayload {
    label: string
    tel: string
    zipCode: string
    street: string
    complement?: string
    number: string
    city: string
    state: string
  }

  // Order
  interface NewOrderRequestBody {
    cartId: number
    addressId: string
    totalAmount: number
    shippingCost: number
  }
  interface PendingOrder {
    order: Order
    clientSecret: string
  }

  // Message
  interface MessagePayload {
    name: string
    email: string
    tel: string
    type: string
    message: string
    response?: string
  }

  // Shipping
  interface ShippingRequest {
    cepDestino: string
    peso: number
    largura: number
    altura: number
    comprimento: number
  }
  interface ShippingResponse {
    price: number
    prazo: number
  }

  // Genérico
  interface ApiErrorResponse {
    data?: {
      message?: string
    }
    status?: number
  }
}

    `
  );
  await writeFile(
    path.join(appPath, "src/hooks/useFilteredProducts.ts"),
    `
'use client'

import { RootState } from '@/redux/store'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const filterMap: Record<string, (item: Product) => boolean> = {
  Todos: () => true,
  Destaque: item => item.highlight === true,
  Promoção: item => item.discount > 0,
  Populares: item => item.sold > 50,
  Inativos: item => item.active === false
}

export function useFilteredProducts(products: Product[]) {
  const activeFilter = useSelector((state: RootState) => state.filter.active)
  const query = useSelector((state: RootState) => state.search.query)

  const filteredProducts = useMemo(() => {
    let result = products

    if (query.trim() !== '') {
      result = result.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
    } else {
      if (filterMap[activeFilter]) {
        result = result.filter(filterMap[activeFilter])
      } else {
        result = result.filter(item => item.category?.name === activeFilter)
      }
    }

    return result
  }, [products, activeFilter, query])

  return { filteredProducts, activeFilter }
}

    `
  );
  await writeFile(
    path.join(appPath, "src/hooks/useFilteredOrders.ts"),
    `
'use client'

import { RootState } from '@/redux/store'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const orderFilterMap: Record<string, (order: Order) => boolean> = {
  Todos: () => true,
  Pago: order => order.status === 'PAID',
  Processando: order => order.status === 'PROCESSING',
  Enviado: order => order.status === 'SHIPPED',
  Entregue: order => order.status === 'DELIVERED',
  Cancelado: order => order.status === 'CANCELED',
  Falhou: order => order.status === 'FAILED',
  Reembolsado: order => order.status === 'REFUNDED'
}

export function useFilteredOrders(orders: Order[]) {
  const activeFilter = useSelector((state: RootState) => state.filter.active)
  const query = useSelector((state: RootState) => state.search.query)

  const filteredOrders = useMemo(() => {
    let result = orders

    if (query.trim() !== '') {
      result = result.filter(
        order => order.id.toLowerCase().includes(query.toLowerCase()) || order.user.name.toLowerCase().includes(query.toLowerCase())
      )
    } else {
      const filterFn = orderFilterMap[activeFilter] || orderFilterMap['Todos']
      result = result.filter(filterFn)
    }

    return result
  }, [orders, activeFilter, query])

  return { filteredOrders, activeFilter }
}

    `
  );
  await writeFile(
    path.join(appPath, "src/hooks/useAppDispatch.ts"),
    `
      import { AppDispatch, RootState } from '@/redux/store'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    `
  );
  await writeFile(
    path.join(appPath, "src/utils/colorUtils.ts"),
    `
// 🎨 COLOR UTILS - Utilitários para geração de variantes de cores HSL

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
  }

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
  await writeFile(
    path.join(appPath, "src/styles/theme.ts"),
    `
// 🎨 ARQUIVO DE TEMA - Configurações de cores e breakpoints do projeto

import { colorHSLVariants } from '@/utils/colorUtils'
import { DefaultTheme } from 'styled-components'

export const media = {
  pc: '@media (max-width: 1024px)',
  tablet: '@media (max-width: 768px)',
  mobile: '@media (max-width: 480px)'
}

export const baseBlack = colorHSLVariants(0, 0, 10)
export const baseBlue = colorHSLVariants(220, 80, 50)
export const baseGreen = colorHSLVariants(100, 100, 50)
export const baseRed = colorHSLVariants(0, 100, 50)
export const baseCyan = colorHSLVariants(180, 150, 50)
export const baseYellow = colorHSLVariants(60, 100, 50)

export const theme: DefaultTheme = {
  colors: {
    baseBlack,
    baseBlue,
    baseGreen,
    baseRed,
    baseCyan,
    baseYellow,
    primaryColor: '#6f87f1',
    secondaryColor: '#7370b5',
    thirdColor: '#b2afe2',
    forthColor: '#fbddf3',
    fifthColor: '#3f3c6eff',
    sixthColor: '#ffe2a6',
    pinkColor: '#f7a6c9',
    pinkColor2: '#ebc6d3ff',
    pinkColor3: '#ff007f',
    textColor: '#f59099f6',
    textColor2: '#e66570f6',
    textColor3: '#f8edfc',
    bgColor: '#737065',
    yellow: '#ffff00',
    yellow2: '#E1A32A',
    blue: '#0000FF',
    blue2: '#1E90FF',
    gray: '#f584b3e5',
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

  // --- Bloco 7: Geração de Componentes de UI ---
  // Cria componentes reutilizáveis como Button, Modals, Inputs, etc.
  if (!useEmpty) {
    console.log(chalk.blue("🎨 Gerando componentes de UI..."));
    await writeFile(
      path.join(appPath, "src/components/ui/Button/Button.tsx"),
      `
'use client'

import Link from 'next/link'
import React, { forwardRef } from 'react'
import { ButtonContent, IconWrapper, StyledButton } from './ButtonStyles'

type ButtonVariants = 'primary' | 'secondary' | 'toggle' | 'outline' | 'ghost' | 'link' | 'danger' | 'cian' | 'pink'
type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg'

export interface CommonButtonProps {
  variant?: ButtonVariants
  size?: ButtonSizes
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  $isActive?: boolean
}

export type ButtonProps = CommonButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      href,
      target,
      rel,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const innerContent = (
      <ButtonContent $loading={loading}>
        {leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
        {children}
        {rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
      </ButtonContent>
    )

    if (href) {
      return (
        <Link href={href} target={target} rel={rel}>
          <StyledButton
            ref={ref as React.Ref<HTMLButtonElement>}
            $variant={variant}
            data-variantt={variant}
            $size={size}
            $loading={loading}
            $fullWidth={fullWidth}
            $isActive={!!props.$isActive}
            aria-disabled={isDisabled}
            {...props}
          >
            {innerContent}
          </StyledButton>
        </Link>
      )
    }

    // Caso botão normal
    return (
      <StyledButton
        ref={ref as React.Ref<HTMLButtonElement>}
        $variant={variant}
        data-variant={variant}
        $size={size}
        $loading={loading}
        $fullWidth={fullWidth}
        $isActive={!!props.$isActive}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        type={type}
        {...props}
      >
        {innerContent}
      </StyledButton>
    )
  }
)

Button.displayName = 'Button'
export default Button

        `
    );
    await writeFile(
      path.join(appPath, "src/components/ui/Button/ButtonStyles.tsx"),
      `

import { media, theme } from '@/styles/theme'
import styled, { css } from 'styled-components'

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'toggle' | 'outline' | 'ghost' | 'link' | 'danger' | 'cian' | 'pink'
  $size: 'xs' | 'sm' | 'md' | 'lg'
  $loading: boolean
  $fullWidth: boolean
  $isActive: boolean | string
}

const buttonVariants = {
  primary: css\`
    background-color: \${({ theme }) => theme.colors.baseBlue.base};
    color: \${({ theme }) => theme.colors.textColor};
    border: 2px solid \${({ theme }) => theme.colors.baseBlue.base};

    &:hover:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseBlue.dark};
      border-color: \${({ theme }) => theme.colors.baseBlue.dark};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseBlue.dark20};
      transform: translateY(0);
    }
  \`,

  secondary: css<StyledButtonProps>\`
    background-color: \${({ theme }) => theme.colors.baseGreen.base};
    color: \${({ theme }) => theme.colors.baseBlack.base};
    border: 2px solid \${({ theme }) => theme.colors.baseGreen.base};

    &:hover:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseGreen.dark};
      border-color: \${({ theme }) => theme.colors.baseGreen.dark};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseGreen.dark20};
      transform: translateY(0);
    }
  \`,

  toggle: css<StyledButtonProps>\`
  background-color: \${({ theme, $isActive }) =>
      $isActive ? theme.colors.baseBlue.base : theme.colors.baseBlack.light20};
  border: 2px solid
    \${({ theme, $isActive }) =>
      $isActive ? theme.colors.baseBlue.base : theme.colors.baseBlack.base};
  width: 44px;
  height: 24px;
  border-radius: 999px;
  position: relative;
  padding: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 2px;
    transform: \${({ $isActive }) =>
      $isActive ? "translate(20px, -50%)" : "translate(0, -50%)"};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: \${({ theme }) => theme.colors.textColor};
    transition: transform 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
\`,

  outline: css\`
    background-color: transparent;
    color: \${({ theme }) => theme.colors.baseBlue.base};
    border: 2px solid \${({ theme }) => theme.colors.baseBlue.base};

    &:hover:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseBlue.base};
      color: \${({ theme }) => theme.colors.textColor};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseBlue.dark};
      transform: translateY(0);
    }
  \`,

  ghost: css\`
    background-color: transparent;
    color: \${({ theme }) => theme.colors.fifthColor};
    border: 2px solid transparent;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  \`,

  link: css\`
    background-color: transparent;
    color: \${({ theme }) => theme.colors.baseBlue.base};
    border: 2px solid transparent;
    text-decoration: none;
    flex-wrap: wrap;
    flex: 1;

    &:hover:not(:disabled) {
      text-decoration: underline;
      color: \${({ theme }) => theme.colors.baseBlue.dark};
      transform: translateY(-1px);
      scale: 1.01;
    }
  \`,

  danger: css\`
    background-color: \${({ theme }) => theme.colors.baseRed.base};
    color: \${({ theme }) => theme.colors.textColor};
    border: 2px solid \${({ theme }) => theme.colors.baseRed.base};
    box-shadow:  4px 4px 4px\${({ theme }) => theme.colors.baseRed.base};

    &:hover:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseRed.dark};
      border-color: \${({ theme }) => theme.colors.baseRed.dark};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseRed.dark20};
      transform: translateY(0);
    }
  \`,

  cian: css\`
    background-color: \${({ theme }) => theme.colors.baseCyan.base};
    color: \${({ theme }) => theme.colors.baseCyan.dark40};
    border: 2px solid \${({ theme }) => theme.colors.baseCyan.base};

    &:hover:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseCyan.dark30};
      border-color: \${({ theme }) => theme.colors.baseCyan.light30};
      color: \${({ theme }) => theme.colors.baseCyan.light30};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.baseCyan.dark20};
      transform: translateY(0);
    }
    \`,

  pink: css\`
    background: linear-gradient(180deg, \${theme.colors.pinkColor}, \${theme.colors.pinkColor2});
    color: \${theme.colors.fifthColor};
    border: 2px solid \${theme.colors.pinkColor2};
    box-shadow: 3px 3px 0px \${theme.colors.fifthColor};

    &:hover:not(:disabled) {
      background: linear-gradient(360deg, \${theme.colors.pinkColor}, \${theme.colors.pinkColor2});
      border: 2px solid \${theme.colors.pinkColor};
      color: \${({ theme }) => theme.colors.fifthColor};
      transform: translateY(-1px);
      scale: 1.01;
    }

    &:active:not(:disabled) {
      background-color: \${({ theme }) => theme.colors.pinkColor};
      transform: translateY(0);
    }
    \`
}

const activeStyles = {
  primary: css\`
    background-color: \${({ theme }) => theme.colors.baseBlue.dark20};
    border-color: \${({ theme }) => theme.colors.baseBlue.base};
    color: \${({ theme }) => theme.colors.baseBlue.light30};
  \`,

  secondary: css\`
    background-color: \${({ theme }) => theme.colors.baseGreen.dark20};
    border-color: \${({ theme }) => theme.colors.baseGreen.base};
    color: \${({ theme }) => theme.colors.baseGreen.light30};
  \`,

  toggle: css\`
    background-color: \${({ theme }) => theme.colors.baseGreen.dark20};
    border-color: \${({ theme }) => theme.colors.baseGreen.base};
    color: \${({ theme }) => theme.colors.baseGreen.light30};
  \`,

  outline: css\`
    background-color: \${({ theme }) => theme.colors.baseBlue.dark};
    border-color: \${({ theme }) => theme.colors.baseBlue.base};
    color: \${({ theme }) => theme.colors.textColor};
  \`,

  ghost: css\`
    background-color: \${({ theme }) => theme.colors.pinkColor};
    border-color: transparent;
    color: \${({ theme }) => theme.colors.fifthColor};
  \`,

  link: css\`
    background-color: transparent;
    color: \${({ theme }) => theme.colors.baseBlue.base};
    border: 2px solid transparent;
  \`,

  danger: css\`
    background-color: \${({ theme }) => theme.colors.baseRed.dark20};
    border-color: \${({ theme }) => theme.colors.baseRed.base};
    color: \${({ theme }) => theme.colors.textColor};
  \`,

  cian: css\`
    background-color: \${({ theme }) => theme.colors.baseCyan.dark20};
    border-color: \${({ theme }) => theme.colors.baseCyan.base};
    color: \${({ theme }) => theme.colors.baseCyan.light30};
  \`,

  pink: css\`
    background: \${({ theme }) => theme.colors.pinkColor};
    border-color: \${({ theme }) => theme.colors.pinkColor2};
    color: \${({ theme }) => theme.colors.fifthColor};
    box-shadow: 2px 2px 0px \${({ theme }) => theme.colors.fifthColor};
  \`,
}


const buttonSizes = {
  xs: css\`
    padding: 2px 8px;
    font-size: 14px;
    min-height: 22px;
  \`,
  sm: css\`
    padding: 4px 12px;
    font-size: 18px;
    min-height: 26px;
  \`,

  md: css\`
    padding: 6px 18px;
    font-size: 22px;
    min-height: 34px;
  \`,

  lg: css\`
    padding: 8px 24px;
    font-size: 26px;
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
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  \${({ $size }) => buttonSizes[$size]}
  \${({ $variant }) => buttonVariants[$variant]}

  \${({ $variant }) =>
    $variant === 'link' &&
    css\`
      white-space: normal;
      text-align: left;
      justify-content: flex-start;
    \`}

  \${({ $fullWidth }) =>
    $fullWidth &&
    css\`
      width: 100%;
    \`}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  \${({ $isActive, $variant }) =>
    $isActive &&
    css\`
    \${activeStyles[$variant]}
  \`}


  \${({ $loading }) =>
    $loading &&
    css\`
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
    \`}

  &:focus-visible {
    outline: 2px solid \${({ theme }) => theme.colors.baseBlue.base};
    outline-offset: 2px;
  }

  \${media.mobile} {
    \${({ $size }) => $size === "lg" && buttonSizes.md}
    \${({ $size }) => $size === "md" && buttonSizes.sm}
  }
\`

export const ButtonContent = styled.span<{ $loading: boolean }>\`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: \${({ $loading }) => ($loading ? 0 : 1)};
  transition: opacity 0.2s ease-in-out;
  }
\`

export const IconWrapper = styled.span\`
  display: flex;
  align-items: center;
  justify-content: center;
  }

  svg {
    width: 1em;
    height: 1em;
  }

  span {
    background-color: \${({ theme }) => theme.colors.red};
    color: \${({ theme }) => theme.colors.fifthColor};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    border-radius: 50%;
  }
\`
        `
    );
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
    await writeFile(
      path.join(
        appPath,
        "src/components/ui/ErrorMessage/ErrorMessageStyles.ts"
      ),
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
    await writeFile(
      path.join(appPath, "src/components/ui/MaskedInput/MaskedInput.tsx"),
      `
import { useField } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IMaskInput } from "react-imask";
import { MaskedInputContainer, PasswordToggle } from "./MaskedInputStyles";

type MaskedInputProps = {
  name: string;
  mask?: string;
  placeholder?: string;
  className?: string;
  showError?: boolean;
  type?: string;
  id?: string;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
  password?: boolean;
  fileUpload?: boolean;
  multiple?: boolean;
  uploadPreset?: string;
  cloudName?: string;
};

export const MaskedInput = ({
  name,
  mask,
  placeholder,
  className,
  showError = true,
  type = "text",
  id,
  as = "input",
  children,
  password = false,
  fileUpload = false,
  multiple = false,
  uploadPreset,
  cloudName,
}: MaskedInputProps) => {
  const [field, meta, helpers] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const hasError = meta.touched && !!meta.error;

  // Separa a prop 'value' do resto das props do Formik.
  // Isso é crucial para não passar 'value' para o input de arquivo.
  const { value, ...restOfField } = field;

  const inputType = fileUpload
    ? "file"
    : password
      ? showPassword
        ? "text"
        : "password"
      : type;

  // ========================
  // Função de upload Cloudinary
  // ========================
  const handleFileUpload = async (files: FileList) => {
    if (!files || !uploadPreset || !cloudName) return;

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", uploadPreset);

      try {
        const res = await fetch(
          \`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        uploadedUrls.push(data.secure_url);
      } catch (err) {
        console.error(err);
        toast.error(\`Erro ao enviar imagem \${files[i].name}\`);
      }
    }

    if (multiple) {
      // Garante que o valor inicial seja um array antes de espalhar as novas URLs
      const existingValue = Array.isArray(value) ? value : [];
      helpers.setValue([...existingValue, ...uploadedUrls]);
    } else {
      helpers.setValue(uploadedUrls[0]);
    }

    toast.success("Upload concluído!");
  };

  // Props comuns para a maioria dos inputs, mas sem a prop 'value'.
  const commonProps = {
    ...restOfField,
    placeholder,
    className: \`\${className ?? ""} \${hasError ? "error" : ""}\`,
    id,
    onBlur: () => helpers.setTouched(true),
  };

  let InputElement;

  // ========================
  // Input de arquivo (Thumbnail ou Galeria) - Componente NÃO CONTROLADO
  // ========================
  if (fileUpload) {
    InputElement = (
      <input
        name={name}
        placeholder={placeholder}
        className={\`\${className ?? ""} \${hasError ? "error" : ""}\`}
        type="file"
        accept="image/*"
        multiple={multiple}
        id={id}
        onBlur={() => helpers.setTouched(true)}
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          handleFileUpload(files);
        }}
      />
    );
  }
  // ========================
  // Input com máscara - Componente CONTROLADO
  // ========================
  else if (mask && as === "input") {
    InputElement = (
      <IMaskInput
        {...commonProps}
        type={inputType}
        mask={mask}
        value={value !== undefined && value !== null ? String(value) : ""}
        onAccept={(val: string) => helpers.setValue(val)}
      />
    );
  }
  // ========================
  // Textarea - Componente CONTROLADO
  // ========================
  else if (as === "textarea") {
    InputElement = (
      <textarea
        {...commonProps}
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) => helpers.setValue(e.target.value)}
      />
    );
  }
  // ========================
  // Select - Componente CONTROLADO
  // ========================
  else if (as === "select") {
    InputElement = (
      <select
        {...commonProps}
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) => helpers.setValue(e.target.value)}
      >
        {children}
      </select>
    );
  }
  // ========================
  // Input padrão - Componente CONTROLADO
  // ========================
  else {
    InputElement = (
      <input
        {...commonProps}
        type={inputType}
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) => helpers.setValue(e.target.value)}
      />
    );
  }

  return (
    <MaskedInputContainer $hasToggle={password}>
      {InputElement}
      {password && (
        <PasswordToggle onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </PasswordToggle>
      )}
      {showError && hasError && (
        <div className="error-message">{meta.error}</div>
      )}
    </MaskedInputContainer>
  );
};

        `
    );
    await writeFile(
      path.join(appPath, "src/components/ui/MaskedInput/MaskedInputStyles.ts"),
      `
import { theme } from '@/styles/theme'
import { styled } from 'styled-components'

export const MaskedInputContainer = styled.div<{ $hasToggle?: boolean }>\`
  width: 100%;
  position: relative;

  input,
  textarea,
  select,
  .imask-input {
    padding: 8px;
    width: 100%;
    border-radius: 8px;
    border: 2px solid \${theme.colors.baseBlue.light20};
    font-size: 1rem;
    color: \${theme.colors.baseBlack.base};
    background-color: \${theme.colors.baseBlue.light50};
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:focus {
      outline: none;
      border: 2px solid \${theme.colors.baseBlue.dark};
    }

    &.error {
      border: 2px solid \${theme.colors.baseRed.base};
      background-color: \${theme.colors.baseRed.light02};
    }

    &.error::placeholder {
      color: \${theme.colors.baseRed.light50};
    }

    \${({ $hasToggle }) => $hasToggle && \`padding-right: 40px;\`}
  }

  input,
  .imask-input {
    height: 40px;
  }

  textarea {
    min-height: 80px;
    resize: none;
    scrollbar-width: thin;
    scrollbar-color: \${theme.colors.baseBlue.base} \${theme.colors.baseBlue.light20};
  }

  select {
    height: 40px;
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg fill='%23000' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 32px;
    cursor: pointer;
  }
\`

export const PasswordToggle = styled.div\`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: \${theme.colors.baseBlack.base};

  &:hover {
    color: \${theme.colors.baseBlue.dark};
  }
\`

    `
    );
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
    await writeFile(
      path.join(appPath, "src/components/ui/TypeWriter/TypeWriter.tsx"),
      `
'use client'

import { useEffect, useState } from "react"
import styled, { css, keyframes } from "styled-components"

// Animação do cursor piscando
const blink = keyframes\`
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
\`

// Props para estilização
interface StyleProps {
  fontSize?: string
  fontFamily?: string
  fontWeight?: number | string
  color?: string
  letterSpacing?: string
  $cursorColor?: string
}

// Container do texto + cursor
const Wrapper = styled.div<StyleProps>\`
  display: inline-block;
  align-items: center;
  white-space: pre-wrap;

  \${({ fontSize }) => fontSize && css\`font-size: \${fontSize};\`}
  \${({ fontFamily }) => fontFamily && css\`font-family: \${fontFamily};\`}
  \${({ fontWeight }) => fontWeight && css\`font-weight: \${fontWeight};\`}
  \${({ color }) => color && css\`color: \${color};\`}
  \${({ letterSpacing }) => letterSpacing && css\`letter-spacing: \${letterSpacing};\`}
\`

const Cursor = styled.span<StyleProps>\`
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: \${blink} 1s infinite;

  \${({ $cursorColor, color }) => css\`
    background: \${$cursorColor || color || "#000"};
  \`}
\`

// Props do componente principal
interface TypewriterProps extends StyleProps {
  texts: string[] // lista de textos que vão aparecer
  typingSpeed?: number // velocidade de digitar
  erasingSpeed?: number // velocidade de apagar
  delayBetween?: number // tempo antes de apagar/escrever próximo
}

export default function Typewriter({
  texts,
  typingSpeed = 100,
  erasingSpeed = 50,
  delayBetween = 2000,
  fontSize = "1.5rem",
  fontFamily = "inherit", // herda a fonte do site por padrão
  fontWeight = "normal",
  color = "#000",
  letterSpacing = "normal",
  $cursorColor
}: TypewriterProps) {
  const [text, setText] = useState("")
  const [index, setIndex] = useState(0) // índice do texto atual
  const [subIndex, setSubIndex] = useState(0) // índice da letra
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (index >= texts.length) return

    if (!deleting && subIndex === texts[index].length) {
      // espera um tempo antes de começar apagar
      const timeout = setTimeout(() => setDeleting(true), delayBetween)
      return () => clearTimeout(timeout)
    }

    if (deleting && subIndex === 0) {
      // terminou de apagar -> vai pro próximo texto
      setDeleting(false)
      setIndex((prev) => (prev + 1) % texts.length)
      return
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1))
    }, deleting ? erasingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [subIndex, index, deleting, texts, typingSpeed, erasingSpeed, delayBetween])

  useEffect(() => {
    setText(texts[index].substring(0, subIndex))
  }, [subIndex, index, texts])

  return (
    <Wrapper
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      color={color}
      letterSpacing={letterSpacing}
    >
      {text}
      <Cursor $cursorColor={$cursorColor} color={color} />
    </Wrapper>
  )
}
    `
    );
  }

  // --- Bloco 8: Configuração do Redux e Providers ---
  // Configura a store do Redux e os providers globais da aplicação.
  console.log(chalk.blue("🏪 Configurando Redux e Providers..."));

  // Providers (com ThemeProvider para Styled Components)
  await writeFile(
    path.join(appPath, "src/components/providers.tsx"),
    `
'use client'

import { store } from '@/redux/store'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/styles/theme'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </Provider>
  )
}
    `
  );

  // Redux Store
  if (installBackend) {
    // Store completa com apiSlice para o backend
    await writeFile(
      path.join(appPath, "src/redux/store.ts"),
      `
      import { configureStore } from '@reduxjs/toolkit'
      import { apiSlice } from './slices/apiSlice'
      import filterSlice from './slices/filterSlice'
      import searchSlice from './slices/searchSlice'

      export const store = configureStore({
        reducer: {
          search: searchSlice,
          filter: filterSlice,
          [apiSlice.reducerPath]: apiSlice.reducer
        },
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
      })

      export type RootState = ReturnType<typeof store.getState>
      export type AppDispatch = typeof store.dispatch
    `
    );
  } else if (installTests) {
    // Store com slice de autenticação para testes
    await writeFile(
      path.join(appPath, "src/redux/store.ts"),
      `
// 🏪 REDUX STORE - Configuração do gerenciamento de estado com preloaded state para testes

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
      `
// 🔐 AUTH SLICE - Gerenciamento de estado de autenticação

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
    // Store simples, sem middleware de API
    await writeFile(
      path.join(appPath, "src/redux/store.ts"),
      `
      import { configureStore } from '@reduxjs/toolkit'

      export const store = configureStore({
        reducer: {
          // Adicione seus reducers aqui
        },
      })

      export type RootState = ReturnType<typeof store.getState>
      export type AppDispatch = typeof store.dispatch
    `
    );
  }

  // --- Bloco 9: Configuração do Backend (Prisma e API) ---
  // Executa apenas se a opção de backend for selecionada.
  if (installBackend) {
    console.log(chalk.blue("🗄️ Configurando Backend com Prisma..."));
    execCommand("npx prisma init", appPath);

    // Gera todos os arquivos de schema, rotas da API, middleware, etc.
    await writeFile(
      path.join(appPath, "prisma/schema.prisma"),
      `
// 🗄️ PRISMA SCHEMA - Configuração do banco de dados
// Este arquivo define a estrutura do seu banco de dados

// Configuração do gerador do Prisma Client
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  USER
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  avatar    String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart       Cart?
  orders     Order[]
  products   Product[]
  messages   Messages[]
  address    Address[]

  @@map("users")
}

model Address {
  id        String   @id @default(uuid())
  label     String
  street    String
  number    String
  complement String?
  city      String
  state     String
  zipCode   String
  tel       String
  isDefault  Boolean  @default(false)

  ordersAsShipping Order[] @relation("ShippingAddress")

  user      User     @relation(fields: [userId], references: [id])
  userId    String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("addresses")
}

model Category {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  products  Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String    @id @default(uuid())
  name        String
  description String
  originalPrice Decimal   @map("original_price")
  salePrice     Decimal   @map("sale_price")
  discount    Int       @default(0)
  thumbnail   String
  gallery     String[]
  stock       Int       @default(0)
  highlight   Boolean   @default(false)
  sold        Int       @default(0)
  active      Boolean

  weight        Float     @default(0.3)  // Peso em kg
  height        Int       @default(11)   // Altura em cm
  width         Int       @default(16)   // Largura em cm
  length        Int       @default(16)   // Comprimento em cm

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  cartItems   CartItem[]

  // 🔹 relação com categoria
  category    Category  @relation(fields: [categoryId], references: [id])
  categoryId  String

  orderProducts OrderProduct[]
  creator       User?     @relation(fields: [creatorId], references: [id])
  creatorId     String?
}

model Cart {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id])
  userId    String   @unique
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id        Int      @id @default(autoincrement())
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  cart      Cart     @relation(fields: [cartId], references: [id])
  cartId    Int
  @@unique([productId, cartId])
}

enum MessagesStatus {
  NEW
  READ
  ANSWERED
}

model Messages {
  id        String    @id @default(uuid())
  name      String
  email     String
  tel       String
  type      String
  message   String
  status    MessagesStatus @default(NEW)
  response  String?
  user      User?     @relation(fields: [userId], references: [id])
  userId    String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum PaymentMethod {
  BOLETO
  CREDIT_CARD
  DEBIT_CARD
  PIX
  PENDING
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELED
  FAILED
  REFUNDED
}

model Order {
  id            String          @id @default(uuid())
  user          User            @relation(fields: [userId], references: [id])
  userId        String
  products      OrderProduct[]
  totalAmount   Float
  paymentMethod PaymentMethod
  status        OrderStatus     @default(PENDING)
  shippingCost      Float
  stripePaymentId String?
  shippingAddress   Address   @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  shippingAddressId String
  statusHistory OrderStatusHistory[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OrderStatusHistory {
  id        String      @id @default(uuid())
  order     Order       @relation(fields: [orderId], references: [id])
  orderId   String
  status    OrderStatus
  changedAt DateTime    @default(now())
}

model OrderProduct {
  id        String   @id @default(uuid())
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  quantity  Int      @default(1)
  price     Decimal
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
    await writeFile(
      path.join(appPath, "src/middleware.ts"),
      `
import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

// --- CONFIGURAÇÕES ---
const PUBLIC_ROUTES = ['/', '/products']
const AUTH_ROUTES = ['/login', '/register']
const ADMIN_ROUTES = ['/admin']
const LOGIN_URL = '/login'
const HOME_URL = '/'

// --- TIPOS ---
interface DecodedToken {
  id: string
  role: 'ADMIN' | 'USER'
}

// --- O MIDDLEWARE (ASSÍNCRONO) ---

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('token')?.value

  console.log('🛡️ Middleware (Edge Runtime) executando para ->', pathname)

  // 1. Lógica para rotas de autenticação (/login, /register)
  if (AUTH_ROUTES.includes(pathname)) {
    if (authToken) {
      return NextResponse.redirect(new URL(HOME_URL, request.url))
    }
    return NextResponse.next()
  }

  // 2. Lógica para rotas públicas
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/products')) {
    return NextResponse.next()
  }

  // A partir daqui, todas as rotas são consideradas PRIVADAS

  // 3. Se não há token em uma rota privada, redireciona para o login
  if (!authToken) {
    const redirectUrl = new URL(LOGIN_URL, request.url)
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 4. Se há token, verifica sua validade e autorização com 'jose'
  try {
    // Codifica o segredo para o formato que 'jose' espera
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

    // Verifica o token usando jwtVerify (assíncrono)
    const { payload } = await jwtVerify<DecodedToken>(authToken, secret)

    // Lógica para rotas de Admin
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL(HOME_URL, request.url))
      }
    }

    // Usuário autenticado e autorizado, passa os dados via headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.id)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  } catch (error) {
    // O erro pode ser por token expirado, assinatura inválida, etc.
    console.error("❌ Erro na verificação do token com 'jose':", error)
    const redirectUrl = new URL(LOGIN_URL, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('token')
    return response
  }
}

// --- MATCHER ---
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images).*)']
}

        `
    );
    await writeFile(
      path.join(appPath, ".env.example"),
      `
# Chaves do Stripe (Modo Teste)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Chave do Resend para e-mails
RESEND_API_KEY=

# Chave do Melhor Envio (Modo Sandbox)
MELHOR_ENVIO_API_KEY=
CEP_ORIGEM=

# Conexão com o Banco de Dados (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=sua-api-key"

# Segredo para JWT
JWT_SECRET=

        `
    );
    // cria o arquivo src/app/api/auth/login/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/login/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import bcrypt from 'bcryptjs'
    import { serialize } from 'cookie'
    import { SignJWT } from 'jose'
    import { NextRequest, NextResponse } from 'next/server'
    
    export async function POST(req: NextRequest) {
      try {
        // Recebe email e senha do body da requisição
        const { email, password } = await req.json()
        const normalizedEmail = email.toLowerCase().trim()
    
        // Busca usuário no banco
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })
    
        // Caso usuário não exista
        if (!user) {
          return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 401 })
        }
    
        // Compara senha com hash
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          return NextResponse.json({ success: false, message: 'Senha incorreta' }, { status: 401 })
        }
    
        // --- CRIAÇÃO DO TOKEN COM 'jose' ---
    
        // 1. Codifica a chave secreta (mesmo processo do middleware)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    
        // 2. Cria o token usando a classe SignJWT
        const token = await new SignJWT({
          // Adicione aqui os dados (payload) que você quer no token
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        })
          .setProtectedHeader({ alg: 'HS256' }) // Define o algoritmo de assinatura
          .setIssuedAt() // Define o timestamp de quando o token foi criado (iat)
          .setExpirationTime('7d') // Define o tempo de expiração (exp)
          .sign(secret) // Assina o token com a chave secreta
    
        // --- FIM DA CRIAÇÃO DO TOKEN ---
    
        // Serializa cookie
        const isProd = process.env.NODE_ENV === 'production'
        const serialized = serialize('token', token, {
          secure: isProd,
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 dias
        })
    
        // Retorna resposta padronizada
        const response = NextResponse.json({ success: true, message: 'Login realizado com sucesso' }, { status: 200 })
    
        // Adiciona cookie no header
        response.headers.set('Set-Cookie', serialized)
    
        return response
      } catch (error) {
        console.error('Erro no login:', error)
        return NextResponse.json({ success: false, message: 'Erro interno no servidor' }, { status: 500 })
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
          maxAge: 0
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
    import bcrypt from 'bcryptjs'
    import { NextRequest, NextResponse } from 'next/server'
    
    export async function POST(req: NextRequest) {
      try {
        // Recebe dados do body
        const { name, email, password } = await req.json()
        const normalizedEmail = email.toLowerCase().trim()
    
        // Valida campos obrigatórios
        if (!name || !email || !password) {
          return NextResponse.json({ success: false, message: 'Preencha todos os campos' }, { status: 400 })
        }
    
        // Verifica se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })
        if (existingUser) {
          return NextResponse.json({ success: false, message: 'Usuário já existe' }, { status: 400 })
        }
    
        // Define role (ADMIN ou USER)
        const adminEmails = ['adminteste@teste.com']
        const role = adminEmails.includes(normalizedEmail) ? 'ADMIN' : 'USER'
    
        // Criptografa senha
        const hashedPassword = await bcrypt.hash(password, 10)
    
        // Cria novo usuário
        const newUser = await prisma.user.create({
          data: {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role
          }
        })
    
        // Retorna resposta padronizada
        return NextResponse.json(
          {
            success: true,
            message: 'Usuário criado com sucesso',
            data: { id: newUser.id, name: newUser.name, email: newUser.email }
          },
          { status: 201 }
        )
      } catch (error) {
        console.error('Erro no registro:', error)
        return NextResponse.json({ success: false, message: 'Erro interno no servidor' }, { status: 500 })
      }
    }
    
          `
    );

    // cria o arquivo src/app/api/auth/verify/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/auth/verify/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { NextRequest, NextResponse } from 'next/server'
    
    export async function GET(req: NextRequest) {
      try {
        const user = await getUserFromRequest(req)
    
        if (!user) {
          return NextResponse.json({ success: false, message: 'Usuário não autenticado ou token inválido.' }, { status: 401 })
        }
    
        return NextResponse.json(user, { status: 200 })
      } catch (error) {
        console.error('Erro inesperado na rota de verificação:', error)
        return NextResponse.json({ success: false, message: 'Ocorreu um erro interno no servidor.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/cart/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/cart/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { jwtVerify } from 'jose'
    import { cookies } from 'next/headers'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET /api/cart
    export async function GET() {
      try {
        const token = (await cookies()).get('token')?.value
        if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = (await jwtVerify(token, secret)) as { payload: { id: string } }
        const userId = payload.id
    
        const cart = await prisma.cart.findUnique({
          where: { userId },
          include: { items: { include: { product: true } } }
        })
    
        return NextResponse.json(cart || { items: [] })
      } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro ao buscar carrinho' }, { status: 500 })
      }
    }
    
    // POST /api/cart
    export async function POST(req: NextRequest) {
      try {
        const token = (await cookies()).get('token')?.value
        if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = (await jwtVerify(token, secret)) as { payload: { id: string } }
        const userId = payload.id
    
        const body = await req.json()
        const { productId, quantity } = body as { productId: string; quantity: number }
    
        // Buscar ou criar carrinho
        let cart = await prisma.cart.findUnique({ where: { userId } })
        if (!cart) {
          cart = await prisma.cart.create({
            data: { userId }
          })
        }
    
        // Verificar se item já existe
        const existingItem = await prisma.cartItem.findUnique({
          where: { productId_cartId: { productId, cartId: cart.id } }
        })
    
        if (existingItem) {
          const updatedItem = await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
          })
          return NextResponse.json(updatedItem)
        }
    
        const newItem = await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
          include: { product: true }
        })
    
        return NextResponse.json(newItem)
      } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro ao adicionar item' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/ api/cart/[itemId]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/cart/[itemId]/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    export async function PUT(req: NextRequest, context: { params: Promise<{ itemId: string }> }) {
      try {
        const { itemId } = await context.params
        const body = (await req.json()) as { quantity: number }
    
        const updatedItem = await prisma.cartItem.update({
          where: { id: parseInt(itemId, 10) },
          data: { quantity: body.quantity },
          include: { product: true }
        })
    
        return NextResponse.json(updatedItem)
      } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 })
      }
    }
    
    export async function PATCH(req: NextRequest, context: { params: Promise<{ itemId: string }> }) {
      return PUT(req, context)
    }
    
    export async function DELETE(req: NextRequest, context: { params: Promise<{ itemId: string }> }) {
      try {
        const { itemId } = await context.params
        const idAsInt = parseInt(itemId, 10)
    
        if (isNaN(idAsInt)) {
          return NextResponse.json({ message: 'ID do item inválido' }, { status: 400 })
        }
    
        const deleteResult = await prisma.cartItem.deleteMany({
          where: { id: idAsInt }
        })
    
        if (deleteResult.count === 0) {
          console.log(\`Tentativa de deletar o CartItem com ID \${idAsInt}, mas não encontrado (provavelmente já foi deletado).\`)
        }
    
        return NextResponse.json({ success: true })
      } catch (error) {
        console.error('Erro ao deletar item do carrinho:', error)
        return NextResponse.json({ message: 'Erro interno ao deletar o item' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/cart/clear/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/cart/clear/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    export async function POST(req: NextRequest) {
      try {
        const user = await getUserFromRequest(req)
        if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    
        const userCart = await prisma.cart.findUnique({ where: { userId: user.id } })
        if (userCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } })
        }
    
        return NextResponse.json({ success: true })
      } catch (err) {
        console.error(err)
        return NextResponse.json({ success: false }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/categories/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/categories/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET /api/categories → lista todas
    export async function GET() {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(categories)
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
      }
    }
    
    // POST /api/categories → cria nova
    export async function POST(req: NextRequest) {
      try {
        const body = await req.json()
    
        if (!body.name || body.name.trim() === '') {
          return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
        }
    
        // slug básico: transforma em minúsculo e troca espaços por "-"
        const slug = body.name.toLowerCase().replace(/\s+/g, '-')
    
        const category = await prisma.category.create({
          data: {
            name: body.name,
            slug
          }
        })
    
        return NextResponse.json(category, { status: 201 })
      } catch (error) {
        console.error('Erro ao criar categoria:', error)
        return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/categories/[id]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/categories/[id]/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET /api/categories/[id] → retorna uma categoria específica
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await context.params
    
        const category = await prisma.category.findUnique({
          where: { id }
        })
    
        if (!category) {
          return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
        }
    
        return NextResponse.json(category)
      } catch (error) {
        console.error('Erro ao buscar categoria:', error)
        return NextResponse.json({ error: 'Erro ao buscar categoria' }, { status: 500 })
      }
    }
    
    // PUT /api/categories/[id] → atualiza categoria
    export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await context.params
        const body = await req.json()
    
        if (!body.name || body.name.trim() === '') {
          return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
        }
    
        const category = await prisma.category.update({
          where: { id },
          data: { name: body.name }
        })
    
        return NextResponse.json(category)
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error)
        return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
      }
    }
    
    // DELETE /api/categories/[id] → remove categoria
    export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await context.params
    
        await prisma.category.delete({
          where: { id }
        })
    
        return NextResponse.json({ message: 'Categoria removida com sucesso' })
      } catch (error) {
        console.error('Erro ao deletar categoria:', error)
        return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/paymentintent/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/paymentintent/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { NextRequest, NextResponse } from 'next/server'
    import Stripe from 'stripe'
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    interface SimplifiedCartItem {
      productId: string
      quantity: number
      salePrice: number
    }
    
    export async function POST(req: NextRequest) {
      try {
        const user = await getUserFromRequest(req)
        if (!user) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
        }
    
        const body = await req.json()
    
        const {
          amount,
          items,
          addressId,
          shippingCost
        }: {
          amount: number
          items: SimplifiedCartItem[]
          addressId: string
          shippingCost: number
        } = body
    
        // Validação dos dados recebidos
        if (typeof amount !== 'number' || amount <= 0 || !items || items.length === 0 || !addressId) {
          return NextResponse.json(
            { message: 'Dados insuficientes para criar o pagamento (amount, items, addressId são obrigatórios).' },
            { status: 400 }
          )
        }
    
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'brl',
          metadata: {
            userId: user.id,
            addressId: addressId,
            shippingCost: String(shippingCost),
            cartItems: JSON.stringify(items)
          }
        })
    
        return NextResponse.json({ clientSecret: paymentIntent.client_secret })
      } catch (error) {
        console.error('Erro ao criar Payment Intent:', error)
        return NextResponse.json({ message: 'Erro interno do servidor ao processar o pagamento.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/shipping/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/shipping/route.ts"),
      `
    import { NextRequest, NextResponse } from 'next/server'
    
    // Interface para o corpo da requisição que nossa API recebe
    interface ShippingRequest {
      cepDestino: string
      peso: number
      largura: number
      altura: number
      comprimento: number
    }
    
    // Interface para a resposta que nossa API envia de volta
    interface ShippingResponse {
      price: number
      prazo: number
    }
    
    // --- Tipos para a resposta da API externa (Melhor Envio) ---
    
    // Tipagem para uma única opção de frete retornada pela API do Melhor Envio
    interface MelhorEnvioOption {
      id: number
      name: string
      price: string
      delivery_range: {
        min: number
        max: number
      }
      error?: string
    }
    
    // A resposta completa da API do Melhor Envio é um array dessas opções
    type MelhorEnvioResponse = MelhorEnvioOption[]
    
    // =============================================
    // ROTA DA API
    // =============================================
    
    export async function POST(req: NextRequest) {
      try {
        // 1. Validação da chave de API
        if (!process.env.MELHOR_ENVIO_API_KEY) {
          console.error('ERRO DE CONFIGURAÇÃO: A variável de ambiente MELHOR_ENVIO_API_KEY não foi encontrada.')
          return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 })
        }
    
        const { cepDestino, peso, largura, altura, comprimento }: ShippingRequest = await req.json()
    
        // 2. Construção do corpo da requisição para a API externa
        const requestBody = {
          from: { postal_code: process.env.CEP_ORIGEM?.replace('-', '') || '01001000' },
          to: { postal_code: cepDestino.replace('-', '') },
          package: {
            weight: peso,
            width: largura,
            height: altura,
            length: comprimento
          }
        }
    
        console.log('Enviando para Melhor Envio:', JSON.stringify(requestBody, null, 2))
    
        // 3. Chamada para a API do Melhor Envio
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: \`Bearer \${process.env.MELHOR_ENVIO_API_KEY}\`
          },
          body: JSON.stringify(requestBody)
        })
    
        // 4. Tratamento de respostas de erro da API externa
        if (!response.ok) {
          const errorBodyAsText = await response.text()
          console.error('----------------- ERRO DA API MELHOR ENVIO -----------------')
          console.error('Status da Resposta:', response.status, response.statusText)
          console.error('Corpo da Resposta (HTML/Erro):', errorBodyAsText)
          console.error('----------------------------------------------------------')
    
          let errorMessage = 'Erro ao se comunicar com a API de frete.'
          if (response.status === 401) errorMessage = 'Erro de autenticação. Verifique a chave da API.'
          else if (response.status === 400) errorMessage = 'Requisição inválida. Verifique os dados enviados.'
    
          return NextResponse.json({ error: errorMessage, details: errorBodyAsText }, { status: response.status })
        }
    
        // 5. Processamento da resposta de sucesso
        // Tipamos 'data' com o tipo que definimos, eliminando a necessidade de 'any'.
        const data: MelhorEnvioResponse = await response.json()
    
        if (!data || data.length === 0) {
          console.warn('A API do Melhor Envio retornou uma resposta vazia:', data)
          return NextResponse.json({ error: 'Nenhuma opção de frete encontrada para este CEP ou os dados do produto estão incorretos.' }, { status: 404 })
        }
    
        const melhorOpcao = data.find(opcao => !opcao.error)
    
        if (!melhorOpcao) {
          console.warn('Todas as transportadoras retornaram erro:', data)
          return NextResponse.json({ error: 'Não foi possível encontrar uma transportadora disponível para o CEP informado.' }, { status: 400 })
        }
    
        const result: ShippingResponse = {
          price: parseFloat(melhorOpcao.price),
          prazo: melhorOpcao.delivery_range.min
        }
    
        return NextResponse.json(result)
      } catch (err) {
        console.error('ERRO INESPERADO NO SERVIDOR:', err)
        return NextResponse.json({ error: 'Erro interno ao processar a solicitação de frete.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextResponse } from 'next/server'
    
    // GET /api/users
    export async function GET() {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        })
        return NextResponse.json(users)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/[id]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/[id]/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET /api/users/[id]
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
    
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            address: true
          }
        })
    
        if (!user) {
          return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }
    
        return NextResponse.json(user)
      } catch (error) {
        console.error(\`Erro ao buscar usuário \${id}:\`, error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
      }
    }
    
    // DELETE /api/users/[id]
    export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
    
      try {
        await prisma.user.delete({ where: { id } })
        return NextResponse.json({ message: 'Usuário deletado com sucesso' }, { status: 200 })
      } catch (error) {
        console.error(\`Erro ao deletar usuário \${id}:\`, error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/[id]/address/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/[id]/address/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET todos os endereços do usuário
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
      if (!id) {
        return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
      }
      const addresses = await prisma.address.findMany({ where: { userId: id } })
      return NextResponse.json(addresses)
    }
    
    // POST criar novo endereço
    export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id: userId } = await context.params
      if (!userId) {
        return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
      }
    
      try {
        const body = await req.json()
    
        // 1. Verifique quantos endereços o usuário já possui
        const addressCount = await prisma.address.count({
          where: { userId: userId }
        })
    
        // 2. Determine se este novo endereço deve ser o padrão
        const isFirstAddress = addressCount === 0
    
        // 3. Crie o novo endereço com a lógica aplicada
        const newAddress = await prisma.address.create({
          data: {
            ...body,
            userId: userId,
            isDefault: isFirstAddress
          }
        })
    
        return NextResponse.json(newAddress, { status: 201 })
      } catch (error) {
        console.error('Erro ao criar endereço:', error)
        return NextResponse.json({ message: 'Erro interno ao criar endereço.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/[id]/address/[addressId]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/[id]/address/[addressId]/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET endereço específico
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string; addressId: string }> }) {
      const { id, addressId } = await context.params
      const address = await prisma.address.findUnique({ where: { id: addressId } })
    
      // Validação de segurança: o endereço pertence mesmo a este usuário?
      if (!address || address.userId !== id) {
        return NextResponse.json({ error: 'Endereço não encontrado ou não pertence ao usuário' }, { status: 404 })
      }
      return NextResponse.json(address)
    }
    
    // PUT/PATCH atualizar endereço
    async function handleUpdate(req: NextRequest, context: { params: Promise<{ id: string; addressId: string }> }) {
      const { addressId } = await context.params
      const body = await req.json()
    
      const updated = await prisma.address.update({
        where: { id: addressId },
        data: body
      })
      return NextResponse.json(updated)
    }
    
    export { handleUpdate as PATCH, handleUpdate as PUT }
    
    // DELETE endereço
    export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; addressId: string }> }) {
      try {
        const requestingUser = await getUserFromRequest(req)
        if (!requestingUser) {
          return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
        }
    
        const { id: userId, addressId } = await context.params
    
        const addressToDelete = await prisma.address.findUnique({
          where: { id: addressId }
        })
    
        if (!addressToDelete) {
          return NextResponse.json({ message: 'Endereço não encontrado.' }, { status: 404 })
        }
    
        // Validação de segurança: O usuário só pode deletar o próprio endereço (a menos que seja ADMIN)
        if (requestingUser.role !== 'ADMIN' && addressToDelete.userId !== requestingUser.id) {
          return NextResponse.json({ message: 'Acesso negado. Você não tem permissão para deletar este endereço.' }, { status: 403 })
        }
    
        // Validação de segurança adicional: O userId da URL deve corresponder ao do token
        if (requestingUser.role !== 'ADMIN' && userId !== requestingUser.id) {
          return NextResponse.json({ message: 'Acesso negado. Conflito de ID de usuário.' }, { status: 403 })
        }
    
        const ordersUsingAddress = await prisma.order.findFirst({
          where: { shippingAddressId: addressId }
        })
    
        if (ordersUsingAddress) {
          return NextResponse.json({ message: 'Este endereço não pode ser excluído pois está vinculado a um ou mais pedidos.' }, { status: 409 })
        }
    
        await prisma.address.delete({
          where: { id: addressId }
        })
    
        return NextResponse.json({ message: 'Endereço deletado com sucesso' })
      } catch (error) {
        console.error('Erro inesperado ao deletar endereço:', error)
        if (error instanceof Error && error.message.includes('sync-dynamic-apis')) {
          return NextResponse.json({ message: 'Erro de configuração da rota no servidor.' }, { status: 500 })
        }
        return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/[id]/address/[addressId]/default/route.ts
    await writeFile(
      path.join(
        appPath,
        "src/app/api/users/[id]/address/[addressId]/default/route.ts"
      ),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // PATCH definir endereço padrão
    export async function PATCH(req: NextRequest, params: { params: Promise<{ id: string; addressId: string }> }) {
      const { id, addressId } = await params.params
    
      try {
        const [, updated] = await prisma.$transaction([
          prisma.address.updateMany({
            where: { userId: id, isDefault: true },
            data: { isDefault: false }
          }),
          // 2. Define o novo endereço como padrão
          prisma.address.update({
            where: { id: addressId, userId: id }, // Garante que o endereço pertence ao usuário
            data: { isDefault: true }
          })
        ])
        return NextResponse.json(updated)
      } catch (error) {
        console.error('Erro ao definir endereço padrão:', error)
        return NextResponse.json({ error: 'Operação falhou. Endereço não encontrado ou não pertence ao usuário.' }, { status: 404 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/[id]/address/default/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/[id]/address/default/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET endereço padrão
    export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
      const { id } = await params.params
      if (!id) {
        return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
      }
      const address = await prisma.address.findFirst({
        where: { userId: id, isDefault: true }
      })
      if (!address) {
        return NextResponse.json({ error: 'Nenhum endereço padrão encontrado' }, { status: 404 })
      }
      return NextResponse.json(address)
    }
    
          `
    );

    // cria o arquivo src/app/api/users/message/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/message/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // --- POST: Criar mensagem ---
    export async function POST(request: NextRequest) {
      const user = await getUserFromRequest(request)
      const data = await request.json()
      const { name, email, tel, type, message } = data
    
      if (!name || !email || !tel || !type || !message) {
        return NextResponse.json({ message: 'Preencha todos os campos.' }, { status: 400 })
      }
    
      try {
        const newMessage = await prisma.messages.create({
          data: {
            name,
            email,
            tel,
            type,
            message,
            ...(user && { userId: user.id }) // conecta ao user se logado
          }
        })
    
        return NextResponse.json(newMessage, { status: 201 })
      } catch (error) {
        console.error('Erro ao criar mensagem no Prisma:', error)
        return NextResponse.json({ message: 'Erro interno ao salvar a mensagem.' }, { status: 500 })
      }
    }
    
    // --- GET: Listar mensagens ---
    // - Admin → vê todas
    // - User → vê apenas as dele
    // - Guest → não tem acesso
    export async function GET(request: NextRequest) {
      const user = await getUserFromRequest(request)
      if (!user) {
        return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 })
      }
    
      try {
        const messages =
          user.role === 'ADMIN'
            ? await prisma.messages.findMany({ orderBy: { createdAt: 'desc' } })
            : await prisma.messages.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
              })
    
        return NextResponse.json(messages)
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error)
        return NextResponse.json({ message: 'Erro interno ao buscar mensagens.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/message/[id]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/message/[id]/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // --- GET: Buscar mensagem por ID ---
    export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
      const user = await getUserFromRequest(request)
      if (!user) return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 })
    
      try {
        const message = await prisma.messages.findUnique({ where: { id } })
        if (!message) return NextResponse.json({ message: 'Mensagem não encontrada' }, { status: 404 })
    
        if (user.role !== 'ADMIN' && message.userId !== user.id) {
          return NextResponse.json({ message: 'Sem permissão para acessar esta mensagem' }, { status: 403 })
        }
    
        return NextResponse.json(message)
      } catch (error) {
        console.error('Erro ao buscar mensagem:', error)
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
      }
    }
    
    // --- PATCH: Editar mensagem ---
    export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
      const user = await getUserFromRequest(request)
      if (!user) return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 })
    
      try {
        const data = await request.json()
        if (!data.status) return NextResponse.json({ message: 'Status obrigatório' }, { status: 400 })
    
        const existing = await prisma.messages.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ message: 'Mensagem não encontrada' }, { status: 404 })
    
        if (user.role !== 'ADMIN' && existing.userId !== user.id) {
          return NextResponse.json({ message: 'Sem permissão para editar esta mensagem' }, { status: 403 })
        }
    
        const updated = await prisma.messages.update({
          where: { id },
          data: { status: data.status }
        })
    
        return NextResponse.json(updated)
      } catch (error) {
        console.error('Erro ao atualizar mensagem:', error)
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
      }
    }
    
    // --- DELETE: Deletar mensagem ---
    export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
      const { id } = await context.params
      const user = await getUserFromRequest(request)
      if (!user) return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 })
    
      try {
        const existing = await prisma.messages.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ message: 'Mensagem não encontrada' }, { status: 404 })
    
        if (user.role !== 'ADMIN' && existing.userId !== user.id) {
          return NextResponse.json({ message: 'Sem permissão para excluir esta mensagem' }, { status: 403 })
        }
    
        await prisma.messages.delete({ where: { id } })
        return NextResponse.json({ message: 'Mensagem deletada com sucesso' })
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error)
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/message/[id]/reply/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/message/[id]/reply/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    import { Resend } from 'resend'
    import MessageReplyEmail from '../../../../../../../emails/MessageReplyEmail'
    
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      const { id: messageId } = await params
      const admin = await getUserFromRequest(request)
    
      if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 })
      }
    
      try {
        const body = await request.json()
        const { responseText } = body
    
        if (!responseText || typeof responseText !== 'string') {
          return NextResponse.json({ message: 'O texto da resposta é obrigatório.' }, { status: 400 })
        }
    
        // 1. ATUALIZA a mensagem no banco
        const answeredMessage = await prisma.messages.update({
          where: { id: messageId },
          data: {
            response: responseText,
            status: 'ANSWERED'
          },
          select: {
            id: true,
            name: true,
            email: true,
            message: true,
            response: true,
            status: true
          }
        })
    
        // 2. ENVIA O E-MAIL DE NOTIFICAÇÃO
        try {
          await resend.emails.send({
            from: 'Baltazarte <onboarding@resend.dev>', // trocar em produção
            to: [answeredMessage.email],
            subject: 'Sua mensagem foi respondida!',
            react: MessageReplyEmail({
              userName: answeredMessage.name,
              originalMessage: answeredMessage.message,
              responseText
            })
          })
        } catch (emailError) {
          console.error('Falha ao enviar e-mail de notificação:', emailError)
        }
    
        return NextResponse.json(answeredMessage)
      } catch (error) {
        if (error instanceof Error && error.message.includes('Record to update not found.')) {
          return NextResponse.json({ message: 'Mensagem não encontrada.' }, { status: 404 })
        }
        console.error('Erro ao responder mensagem:', error)
        return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/users/message/unread/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/users/message/unread/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextResponse } from 'next/server'
    
    export async function GET() {
      try {
        const unreadCount = await prisma.messages.count({
          where: {
            status: 'NEW'
          }
        })
    
        return NextResponse.json({ count: unreadCount })
      } catch (error) {
        console.error('Erro ao contar mensagens não lidas:', error)
        return NextResponse.json({ message: 'Erro interno ao buscar a contagem.' }, { status: 500 })
      }
    }
    
          `
    );

    // cria o arquivo src/app/api/products/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/products/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    
    // POST /api/products - CRIAR UM NOVO PRODUTO
    export async function POST(req: NextRequest) {
      const user = await getUserFromRequest(req)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
      }
    
      try {
        const data = await req.json()
    
        if (!data.name || typeof data.originalPrice !== 'number' || !data.categoryId) {
          return NextResponse.json({ message: 'Dados incompletos para criar o produto.' }, { status: 400 })
        }
    
        const originalPrice = Number(data.originalPrice)
        const discount = Number(data.discount) || 0
        const salePrice = originalPrice * (1 - discount / 100)
    
        const newProduct = await prisma.product.create({
          data: {
            name: data.name,
            description: data.description,
    
            originalPrice: originalPrice,
            salePrice: salePrice,
    
            thumbnail: data.thumbnail,
            gallery: data.gallery,
            discount: discount,
            stock: Number(data.stock),
            highlight: Boolean(data.highlight),
            sold: Number(data.sold),
            active: Boolean(data.active),
            category: {
              connect: { id: data.categoryId }
            },
            creator: {
              connect: { id: user.id }
            }
          },
          include: { category: true }
        })
    
        return NextResponse.json(newProduct, { status: 201 })
      } catch (error) {
        console.error('Erro ao criar produto:', error)
        return NextResponse.json({ message: 'Erro interno ao criar o produto' }, { status: 500 })
      }
    }
    
    // GET /api/products - LISTAR TODOS OS PRODUTOS
    export async function GET(req: NextRequest) {
      try {
        const highlight = req.nextUrl.searchParams.get('highlight')
    
        const products = await prisma.product.findMany({
          where: highlight === 'true' ? { highlight: true } : undefined,
          include: { category: true }
        })
    
        return NextResponse.json(products)
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return NextResponse.json({ message: 'Erro ao buscar produtos' }, { status: 500 })
      }
    }
    
          `
    );

    // cria o arquivo src/app/api/products/[id]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/products/[id]/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { Prisma } from '@prisma/client'
    import { NextRequest, NextResponse } from 'next/server'
    
    // GET /api/products/:id
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await context.params
        const product = await prisma.product.findUnique({
          where: { id },
          include: { category: true }
        })
        if (!product) {
          return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
        }
        return NextResponse.json(product)
      } catch {
        return NextResponse.json({ message: 'Erro ao buscar produto' }, { status: 500 })
      }
    }
    
    // PUT /api/products/:id
    export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const user = await getUserFromRequest(req)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
      }
    
      try {
        const { id } = await context.params
        const body: unknown = await req.json()
    
        const existingProduct = await prisma.product.findUnique({ where: { id } })
        if (!existingProduct) {
          return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
        }
    
        const updateData: Prisma.ProductUpdateInput = {}
        const requestData = body as { [key: string]: unknown }
    
        if (typeof requestData.name === 'string') updateData.name = requestData.name
        if (typeof requestData.description === 'string') updateData.description = requestData.description
        if (typeof requestData.thumbnail === 'string') updateData.thumbnail = requestData.thumbnail
    
        if (Array.isArray(requestData.gallery)) updateData.gallery = requestData.gallery
    
        if (requestData.originalPrice !== undefined) updateData.originalPrice = Number(requestData.originalPrice)
        if (requestData.discount !== undefined) updateData.discount = Number(requestData.discount)
        if (requestData.stock !== undefined) updateData.stock = Number(requestData.stock)
        if (requestData.sold !== undefined) updateData.sold = Number(requestData.sold)
    
        if (typeof requestData.highlight === 'boolean') updateData.highlight = requestData.highlight
        if (typeof requestData.active === 'boolean') updateData.active = requestData.active
    
        if (typeof requestData.categoryId === 'string') {
          updateData.category = { connect: { id: requestData.categoryId } }
        }
    
        const originalPrice = (updateData.originalPrice as number) ?? existingProduct.originalPrice
        const discount = (updateData.discount as number) ?? existingProduct.discount
        updateData.salePrice = originalPrice * (1 - discount / 100)
    
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: updateData
        })
    
        return NextResponse.json(updatedProduct)
      } catch (error) {
        console.error('Erro ao atualizar produto:', error)
        return NextResponse.json({ message: 'Erro ao atualizar produto' }, { status: 500 })
      }
    }
    
    // PATCH /api/products/:id
    export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const user = await getUserFromRequest(req)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
      }
    
      try {
        const { id } = await context.params
        const data = await req.json()
        const { name, category, description, originalPrice, thumbnail, gallery, discount, stock, highlight, sold, active } = data
    
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { name, category, description, originalPrice, thumbnail, gallery, discount, stock, highlight, sold, active }
        })
        return NextResponse.json(updatedProduct)
      } catch {
        return NextResponse.json({ message: 'Erro ao atualizar produto' }, { status: 500 })
      }
    }
    
    // DELETE /api/products/:id
    export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      const user = await getUserFromRequest(req)
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
      }
    
      try {
        const { id } = await context.params
        const deletedProduct = await prisma.product.delete({
          where: { id }
        })
        return NextResponse.json(deletedProduct)
      } catch {
        return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
      }
    }
    
          `
    );

    // crie o arquivo src/app/api/orders/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/orders/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { type NextRequest, NextResponse } from 'next/server'
    
    export async function GET(req: NextRequest) {
      try {
        const user = await getUserFromRequest(req)
        if (!user) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
        }
    
        // Se for ADMIN, busca todos os pedidos. Se não, busca apenas os do usuário.
        const orders = await prisma.order.findMany({
          where: user.role === 'ADMIN' ? {} : { userId: user.id },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            products: { include: { product: true } },
            shippingAddress: true
          }
        })
    
        return NextResponse.json(orders)
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
        return NextResponse.json({ message: 'Erro interno ao buscar pedidos' }, { status: 500 })
      }
    }
    
    export async function POST(req: NextRequest) {
      try {
        const user = await getUserFromRequest(req)
        if (!user) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
        }
    
        const { cartId, addressId, totalAmount, shippingCost }: NewOrderRequestBody = await req.json()
    
        const cart = await prisma.cart.findFirst({
          where: { id: cartId, userId: user.id },
          include: { items: { include: { product: true } } }
        })
    
        if (!cart || cart.items.length === 0) {
          return NextResponse.json({ message: 'Carrinho inválido ou vazio' }, { status: 400 })
        }
    
        const newOrder = await prisma.$transaction(async tx => {
          const order = await tx.order.create({
            data: {
              userId: user.id,
              shippingAddressId: addressId,
              totalAmount,
              shippingCost,
              status: 'PENDING',
              paymentMethod: 'PENDING'
            }
          })
    
          await tx.orderProduct.createMany({
            data: cart.items.map(item => ({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.salePrice
            }))
          })
    
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    
          return order
        })
    
        return NextResponse.json(newOrder, { status: 201 })
      } catch (error) {
        console.error('Erro ao criar a ordem:', error)
        return NextResponse.json({ message: 'Erro interno ao criar o pedido' }, { status: 500 })
      }
    }
    
          `
    );

    // cria o arquivo src/app/api/orders/[id]/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/orders/[id]/route.ts"),
      `
    import { getUserFromRequest } from '@/utils/auth'
    import { prisma } from '@/utils/prisma'
    import { OrderStatus as PrismaOrderStatus } from '@prisma/client'
    import { type NextRequest, NextResponse } from 'next/server'
    
    interface PrismaClientError {
      code: string
    }
    
    function isValidOrderStatus(status: unknown): status is PrismaOrderStatus {
      return typeof status === 'string' && (Object.values(PrismaOrderStatus) as string[]).includes(status)
    }
    
    function isPrismaError(error: unknown): error is PrismaClientError {
      return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string'
    }
    
    // GET /api/orders/{id}
    export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const user = await getUserFromRequest(req)
        if (!user) {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
        }
    
        const { id } = await context.params
    
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            user: { select: { id: true, name: true, email: true } },
            products: { include: { product: true } },
            shippingAddress: true
          }
        })
    
        if (!order) {
          return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
        }
    
        if (user.role !== 'ADMIN' && order.userId !== user.id) {
          return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
        }
    
        return NextResponse.json(order)
      } catch (error) {
        console.error(\`Erro ao buscar pedido:\`, error)
        return NextResponse.json({ message: 'Erro interno ao buscar o pedido' }, { status: 500 })
      }
    }
    
    // PATCH /api/orders/{id}
    export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const user = await getUserFromRequest(req)
        if (!user || user.role !== 'ADMIN') {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
        }
    
        const { id } = await context.params
        const body = await req.json()
        const newStatusString = body.status
    
        if (!isValidOrderStatus(newStatusString)) {
          return NextResponse.json({ message: \`Status inválido: "\${newStatusString}".\` }, { status: 400 })
        }
    
        const updatedOrder = await prisma.order.update({
          where: { id },
          data: { status: newStatusString }
        })
    
        return NextResponse.json(updatedOrder)
      } catch (error) {
        if (isPrismaError(error) && error.code === 'P2025') {
          return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
        }
        console.error(\`Erro ao atualizar pedido:\`, error)
        return NextResponse.json({ message: 'Erro interno ao atualizar o pedido' }, { status: 500 })
      }
    }
    
    // DELETE /api/orders/{id}
    export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        const user = await getUserFromRequest(req)
        if (!user || user.role !== 'ADMIN') {
          return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
        }
    
        const { id } = await context.params
    
        await prisma.order.delete({ where: { id } })
    
        return NextResponse.json({ message: 'Pedido deletado com sucesso' }, { status: 200 })
      } catch (error) {
        if (isPrismaError(error) && error.code === 'P2025') {
          return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
        }
        console.error(\`Erro ao deletar pedido:\`, error)
        return NextResponse.json({ message: 'Erro interno ao deletar o pedido' }, { status: 500 })
      }
    }
    
          `
    );

    //cria o arquivo src/app/api/webhooks/route.ts
    await writeFile(
      path.join(appPath, "src/app/api/webhooks/route.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { NextRequest, NextResponse } from 'next/server'
    import { Resend } from 'resend'
    import Stripe from 'stripe'
    import { OrderConfirmationEmail } from '../../../../emails/OrderConfirmationEmail'
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const resend = new Resend(process.env.RESEND_API_KEY!)
    
    interface SimplifiedCartItem {
      productId: string
      quantity: number
      salePrice: number
    }
    
    export async function POST(req: NextRequest) {
      try {
        const body = await req.text()
        const sig = req.headers.get('stripe-signature')!
        let event: Stripe.Event
    
        try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        } catch (err: unknown) {
          const error = err as Error
          console.error(\`❌ Erro na verificação da assinatura do Webhook: \${error.message}\`)
          return NextResponse.json({ error: \`Webhook Error: \${error.message}\` }, { status: 400 })
        }
    
        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          const { userId, cartItems, addressId, shippingCost } = paymentIntent.metadata
    
          if (!userId || !cartItems || !addressId) {
            console.error('❌ Metadados ausentes ou incompletos no PaymentIntent:', paymentIntent.id)
            return NextResponse.json({ received: true })
          }
    
          const parsedCartItems = JSON.parse(cartItems) as SimplifiedCartItem[]
    
          const updateProductPromises = parsedCartItems.map(item =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
                sold: { increment: item.quantity }
              }
            })
          )
    
          const createOrderPromise = prisma.order.create({
            data: {
              userId: userId,
              shippingAddressId: addressId,
              totalAmount: paymentIntent.amount / 100,
              shippingCost: Number(shippingCost),
              stripePaymentId: paymentIntent.id,
              status: 'PAID',
              paymentMethod: 'CREDIT_CARD',
              products: {
                create: parsedCartItems.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.salePrice
                }))
              }
            },
            include: {
              user: {
                select: { name: true, email: true }
              },
              shippingAddress: true
            }
          })
    
          const [newOrder] = await prisma.$transaction([createOrderPromise, ...updateProductPromises])
          console.log(\`📦 Pedido \${newOrder.id} criado e estoque debitado com sucesso!\`)
    
          try {
            await resend.emails.send({
              from: 'Baltazarte <onboarding@resend.dev>',
              to: [newOrder.user.email],
              subject: \`Confirmação do seu pedido #\${newOrder.id}\`,
              react: OrderConfirmationEmail({
                userName: newOrder.user.name,
                orderId: newOrder.id,
                orderDate: newOrder.createdAt.toLocaleDateString('pt-BR'),
                totalAmount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newOrder.totalAmount),
                shippingAddress: {
                  street: newOrder.shippingAddress.street,
                  number: newOrder.shippingAddress.number,
                  city: newOrder.shippingAddress.city,
                  state: newOrder.shippingAddress.state,
                  zipCode: newOrder.shippingAddress.zipCode
                }
              })
            })
            console.log(\`✉️ E-mail de confirmação enviado para \${newOrder.user.email}\`)
          } catch (emailError) {
            console.error(\`❌ Falha ao enviar e-mail de confirmação para o pedido \${newOrder.id}:\`, emailError)
          }
    
          const productIdsInOrder = parsedCartItems.map(item => item.productId)
          const updatedProducts = await prisma.product.findMany({
            where: { id: { in: productIdsInOrder } },
            select: { id: true, stock: true }
          })
    
          const outOfStockProductIds = updatedProducts.filter(p => p.stock === 0).map(p => p.id)
    
          if (outOfStockProductIds.length > 0) {
            await prisma.product.updateMany({
              where: {
                id: { in: outOfStockProductIds }
              },
              data: {
                active: false
              }
            })
            console.log(\`🔌 Produtos desativados por falta de estoque: \${outOfStockProductIds.join(', ')}\`)
          }
    
          const userCart = await prisma.cart.findUnique({ where: { userId } })
          if (userCart) {
            await prisma.cartItem.deleteMany({
              where: { cartId: userCart.id }
            })
            console.log(\`🛒 Carrinho do usuário \${userId} foi limpo.\`)
          }
        }
    
        return NextResponse.json({ received: true })
      } catch (error) {
        console.error('Erro inesperado no webhook:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
      }
    }
    
          `
    );

    //cria arquivo auth.ts dentro da pasta utils
    await writeFile(
      path.join(appPath, "src/utils/auth.ts"),
      `
    import { prisma } from '@/utils/prisma'
    import { jwtVerify } from 'jose'
    import { NextRequest } from 'next/server'
    
    export async function getUserFromRequest(req: NextRequest) {
      const token = req.cookies.get('token')?.value
      if (!token) return null
    
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = (await jwtVerify(token, secret)) as { payload: { id: string } }
    
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: { id: true, name: true, email: true, role: true, avatar: true }
        })
    
        return user
      } catch {
        return null
      }
    }
    
        `
    );

    //cria o arquivo src/redux/slices/apiSlice.ts
    await writeFile(
      path.join(appPath, "src/redux/slices/apiSlice.ts"),
      `
    import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
    
    // =========================
    // API Slice
    // =========================
    export const apiSlice = createApi({
      reducerPath: 'api',
      baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        credentials: 'include' // envia cookies automaticamente
      }),
      // 1. Definir os tipos de tags para gerenciamento de cache
      tagTypes: ['Products', 'Orders', 'Users', 'Messages', 'Categories', 'unreadMessages', 'Shipping', 'Address', 'Cart'],
      endpoints: builder => ({
        // =========================
        // Produtos
        // =========================
        getProducts: builder.query<Product[], void>({
          query: () => 'products',
          providesTags: result =>
            result
              ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products', id: 'LIST' }]
              : [{ type: 'Products', id: 'LIST' }]
        }),
        getProductById: builder.query<Product, string>({
          query: id => \`products/\${id}\`,
          providesTags: (result, error, id) => [{ type: 'Products', id }]
        }),
        getHighlightedProducts: builder.query<Product[], void>({
          query: () => ({
            url: 'products',
            params: { highlight: true }
          }),
          providesTags: result =>
            result
              ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products', id: 'LIST' }]
              : [{ type: 'Products', id: 'LIST' }]
        }),
        createProduct: builder.mutation<Product, NewProductPayload>({
          query: body => ({
            url: 'products',
            method: 'POST',
            body
          }),
          invalidatesTags: [{ type: 'Products', id: 'LIST' }]
        }),
        updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
          query: ({ id, data }) => ({
            url: \`/products/\${id}\`,
            method: 'PUT',
            body: data
          }),
          // Invalida a tag do item específico e a da lista.
          invalidatesTags: (result, error, { id }) => [
            { type: 'Products', id },
            { type: 'Products', id: 'LIST' }
          ]
        }),
        deleteProduct: builder.mutation<Product, string>({
          query: id => ({
            url: \`products/\${id}\`,
            method: 'DELETE'
          }),
          invalidatesTags: [{ type: 'Products', id: 'LIST' }]
        }),
        partialUpdateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
          query: ({ id, data }) => ({
            url: \`/products/\${id}\`,
            method: 'PATCH',
            body: data
          }),
          invalidatesTags: (result, error, { id }) => [
            { type: 'Products', id },
            { type: 'Products', id: 'LIST' }
          ]
        }),
    
        // =========================
        // Categorias
        // =========================
        getCategories: builder.query<Category[], void>({
          query: () => 'categories',
          providesTags: result =>
            result
              ? [...result.map(({ id }) => ({ type: 'Categories' as const, id })), { type: 'Categories', id: 'LIST' }]
              : [{ type: 'Categories', id: 'LIST' }]
        }),
        getCategoryById: builder.query<Category, string>({
          query: id => \`categories/\${id}\`,
          providesTags: (result, error, id) => [{ type: 'Categories', id }]
        }),
        createCategory: builder.mutation<Category, { name: string }>({
          query: body => ({
            url: 'categories',
            method: 'POST',
            body
          }),
          // 3. Invalidar a lista de categorias para refetch
          invalidatesTags: [{ type: 'Categories', id: 'LIST' }]
        }),
        updateCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
          query: ({ id, data }) => ({
            url: \`categories/\${id}\`,
            method: 'PUT',
            body: data
          }),
          invalidatesTags: (result, error, { id }) => [
            { type: 'Categories', id },
            { type: 'Categories', id: 'LIST' }
          ]
        }),
        deleteCategory: builder.mutation<Category, string>({
          query: id => ({
            url: \`categories/\${id}\`,
            method: 'DELETE'
          }),
          invalidatesTags: [{ type: 'Categories', id: 'LIST' }]
        }),
    
        // =========================
        // Pedidos
        // =========================
        createOrder: builder.mutation<Order, { userId: string; addressId: string; totalAmount: number; shippingCost: number }>({
          query: body => ({
            url: 'orders',
            method: 'POST',
            body
          }),
          invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
        }),
    
        getOrders: builder.query<Order[], void>({
          query: () => 'orders',
          providesTags: result =>
            result ? [...result.map(({ id }) => ({ type: 'Orders' as const, id })), { type: 'Orders', id: 'LIST' }] : [{ type: 'Orders', id: 'LIST' }]
        }),
    
        getOrderById: builder.query<Order, string>({
          query: id => \`orders/\${id}\`,
          providesTags: (result, error, id) => [{ type: 'Orders', id }]
        }),
    
        updateOrder: builder.mutation<Order, { id: string; data: Partial<{ status: OrderStatus }> }>({
          query: ({ id, data }) => ({
            url: \`/orders/\${id}\`,
            method: 'PATCH',
            body: data
          }),
          async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
            const patchResult = dispatch(
              apiSlice.util.updateQueryData('getOrders', undefined, draft => {
                const order = draft.find(o => o.id === id)
                if (order && data.status) {
                  order.status = data.status
                }
              })
            )
            try {
              await queryFulfilled
            } catch {
              patchResult.undo()
            }
          },
          invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }]
        }),
    
        deleteOrder: builder.mutation<{ message: string }, string>({
          query: id => ({
            url: \`orders/\${id}\`,
            method: 'DELETE'
          }),
          invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
        }),
    
        // =========================
        // Pagamento (Stripe)
        // =========================
        createPaymentIntent: builder.mutation<
          { clientSecret: string },
          { amount: number; items: SimplifiedCartItem[]; addressId: string; shippingCost: number }
        >({
          query: body => ({
            url: 'paymentIntent',
            method: 'POST',
            body: body
          }),
          invalidatesTags: [{ type: 'Orders', id: 'LIST' }]
        }),
    
        // =========================
        // Usuários
        // =========================
        getUsers: builder.query<User[], void>({
          query: () => 'users',
          providesTags: result =>
            result ? [...result.map(({ id }) => ({ type: 'Users' as const, id })), { type: 'Users', id: 'LIST' }] : [{ type: 'Users', id: 'LIST' }]
        }),
        getUserById: builder.query<User, string>({
          query: id => \`users/\${id}\`,
          providesTags: (result, error, id) => [{ type: 'Users', id }]
        }),
        deleteUser: builder.mutation<{ message: string }, string>({
          query: id => ({ url: \`users/\${id}\`, method: 'DELETE' }),
          invalidatesTags: [{ type: 'Users', id: 'LIST' }]
        }),
        registerUser: builder.mutation<RegisterResponse, RegisterPayload>({
          query: body => ({
            url: 'auth/register',
            method: 'POST',
            body
          }),
          invalidatesTags: [{ type: 'Users', id: 'LIST' }]
        }),
        loginUser: builder.mutation<LoginResponse, LoginPayload>({
          query: body => ({
            url: 'auth/login',
            method: 'POST',
            body
          })
        }),
        logoutUser: builder.mutation<{ success: boolean }, void>({
          query: () => ({
            url: 'auth/logout',
            method: 'POST'
          })
        }),
        verifyUser: builder.query<VerifyResponse, void>({
          query: () => 'auth/verify'
        }),
    
        // =========================
        // Mensagens / Contato
        // =========================
        postUserMessage: builder.mutation<Message, MessagePayload>({
          query: body => ({
            url: 'users/message',
            method: 'POST',
            body
          }),
          invalidatesTags: [{ type: 'Messages', id: 'LIST' }]
        }),
        getUserMessages: builder.query<Message[], MessagePayload | void>({
          query: arg => {
            if (arg) return { url: 'users/message', params: arg }
            return 'users/message'
          },
          providesTags: result =>
            result
              ? [...result.map(({ id }) => ({ type: 'Messages' as const, id })), { type: 'Messages', id: 'LIST' }]
              : [{ type: 'Messages', id: 'LIST' }]
        }),
        deleteMessage: builder.mutation<Message, string>({
          query: id => ({
            url: \`users/message/\${id}\`,
            method: 'DELETE',
            body: { status: 'READ' }
          }),
          invalidatesTags: [{ type: 'Messages', id: 'LIST' }]
        }),
        updateMessageStatus: builder.mutation<Message, { id: string }>({
          query: ({ id }) => ({
            url: \`users/message/\${id}\`,
            method: 'PATCH',
            body: { status: 'READ' }
          }),
          invalidatesTags: (result, error, { id }) => [{ type: 'Messages', id }, { type: 'Messages', id: 'LIST' }, 'unreadMessages']
        }),
        getUnreadMessages: builder.query<{ count: number }, void>({
          query: () => 'users/message/unread',
          providesTags: ['unreadMessages']
        }),
        answerMessage: builder.mutation<Message, { messageId: string; responseText: string }>({
          query: ({ messageId, responseText }) => ({
            // A URL corresponde à nova rota que criamos
            url: \`users/message/\${messageId}/reply\`,
            method: 'POST',
            body: { responseText }
          }),
          // Invalida o cache para forçar o refetch da lista e do item específico
          invalidatesTags: (result, error, { messageId }) => [{ type: 'Messages', id: messageId }, { type: 'Messages', id: 'LIST' }, 'unreadMessages']
        }),
    
        // =========================
        // Upload de imagens (não precisa de tags, pois é um serviço externo)
        // =========================
        uploadImage: builder.mutation<{ url: string }, FormData>({
          query: formData => ({
            url: 'https://api.cloudinary.com/v1_1/dvonqxpbc/image/upload',
            method: 'POST',
            body: formData
          })
        }),
    
        // =========================
        // Frete
        // =========================
        calculateShipping: builder.mutation<ShippingResponse, ShippingRequest>({
          query: body => ({
            url: 'shipping',
            method: 'POST',
            body
          }),
          invalidatesTags: ['Shipping']
        }),
    
        // =========================
        // Address
        // =========================
        getUserAddressById: builder.query<Address, { userId: string; id: string }>({
          query: ({ userId, id }) => \`users/\${userId}/address/\${id}\`,
          providesTags: (result, error, { id }) => [{ type: 'Address', id }]
        }),
    
        getUserAddresses: builder.query<Address[], string>({
          query: userId => \`users/\${userId}/address\`,
          providesTags: result =>
            result ? [...result.map(a => ({ type: 'Address' as const, id: a.id })), { type: 'Address', id: 'LIST' }] : [{ type: 'Address', id: 'LIST' }]
        }),
    
        createAddress: builder.mutation<Address, { userId: string; data: NewAddressPayload }>({
          query: ({ userId, data }) => ({ url: \`users/\${userId}/address\`, method: 'POST', body: data }),
          invalidatesTags: [{ type: 'Address', id: 'LIST' }]
        }),
    
        updateAddress: builder.mutation<Address, { userId: string; id: string; data: Partial<Address> }>({
          query: ({ userId, id, data }) => ({ url: \`users/\${userId}/address/\${id}\`, method: 'PUT', body: data }),
          invalidatesTags: (result, error, { id }) => [
            { type: 'Address', id },
            { type: 'Address', id: 'LIST' }
          ]
        }),
        deleteAddress: builder.mutation<{ message: string }, { userId: string; id: string }>({
          query: ({ userId, id }) => ({ url: \`users/\${userId}/address/\${id}\`, method: 'DELETE' }),
          invalidatesTags: [{ type: 'Address', id: 'LIST' }]
        }),
    
        getDefaultAddress: builder.query<Address, string>({
          query: userId => \`users/\${userId}/address/default\`,
          providesTags: ['Address']
        }),
    
        setDefaultAddress: builder.mutation<Address, { userId: string; addressId: string }>({
          query: ({ userId, addressId }) => ({
            url: \`/users/\${userId}/address/\${addressId}/default\`,
            method: 'PATCH'
          }),
          invalidatesTags: ['Address']
        }),
    
        // =========================
        // Cart
        // =========================
        getCart: builder.query<Cart, void>({
          query: () => 'cart',
          providesTags: result =>
            result ? [...result.items.map(({ id }) => ({ type: 'Cart' as const, id })), { type: 'Cart', id: 'LIST' }] : [{ type: 'Cart', id: 'LIST' }]
        }),
    
        clearCart: builder.mutation<{ success: boolean }, void>({
          query: () => ({ url: 'cart/clear', method: 'POST' }),
          invalidatesTags: [{ type: 'Cart', id: 'LIST' }]
        }),
    
        addCartItem: builder.mutation<CartItem, NewCartItemPayload>({
          query: body => ({ url: 'cart', method: 'POST', body }),
          invalidatesTags: [{ type: 'Cart', id: 'LIST' }]
        }),
    
        updateCartItem: builder.mutation<CartItem, { id: number; data: UpdateCartItemPayload }>({
          query: ({ id, data }) => ({ url: \`cart/\${id}\`, method: 'PUT', body: data }),
          invalidatesTags: (result, error, { id }) => [
            { type: 'Cart', id },
            { type: 'Cart', id: 'LIST' }
          ]
        }),
    
        deleteCartItem: builder.mutation<{ success: boolean }, number>({
          query: id => ({ url: \`cart/\${id}\`, method: 'DELETE' }),
          invalidatesTags: [{ type: 'Cart', id: 'LIST' }]
        })
      })
    })
    
    // =========================
    // Hooks RTK Query
    // =========================
    export const {
      // Produtos
      useGetProductsQuery,
      useGetProductByIdQuery,
      useGetHighlightedProductsQuery,
      useCreateProductMutation,
      useUpdateProductMutation,
      useDeleteProductMutation,
      usePartialUpdateProductMutation,
    
      // Categorias
      useGetCategoriesQuery,
      useGetCategoryByIdQuery,
      useCreateCategoryMutation,
      useUpdateCategoryMutation,
      useDeleteCategoryMutation,
    
      // Pedidos
      useCreateOrderMutation,
      useGetOrdersQuery,
      useUpdateOrderMutation,
      useGetOrderByIdQuery,
      useDeleteOrderMutation,
    
      //pagamento
      useCreatePaymentIntentMutation,
    
      // Usuários
      useGetUsersQuery,
      useRegisterUserMutation,
      useLoginUserMutation,
      useLogoutUserMutation,
      useVerifyUserQuery,
      useGetUserByIdQuery,
      useDeleteUserMutation,
    
      // Mensagens
      usePostUserMessageMutation,
      useGetUserMessagesQuery,
      useDeleteMessageMutation,
      useUpdateMessageStatusMutation,
      useGetUnreadMessagesQuery,
      useAnswerMessageMutation,
    
      // Upload de imagens
      useUploadImageMutation,
    
      // Frete
      useCalculateShippingMutation,
    
      // Address
      useGetUserAddressByIdQuery,
      useGetUserAddressesQuery,
      useCreateAddressMutation,
      useUpdateAddressMutation,
      useDeleteAddressMutation,
      useSetDefaultAddressMutation,
      useGetDefaultAddressQuery,
    
      // Cart
      useGetCartQuery,
      useAddCartItemMutation,
      useUpdateCartItemMutation,
      useDeleteCartItemMutation,
      useClearCartMutation
    } = apiSlice
    
          `
    );
  }

  // --- Bloco 10: Criação de Layouts e Páginas de Exemplo ---
  // Gera o layout principal e arquivos de exemplo para dar um ponto de partida.
  console.log(chalk.blue("🏗️ Criando layouts e páginas de exemplo..."));
  await createLayout(appPath, finalChoice, useEmpty);
  if (!useEmpty) {
    await createExampleFiles(appPath, finalChoice, installTests, appName);
  }

  // --- Bloco 11: Geração de Arquivos Específicos de Estilo ---
  if (finalChoice === "styled-components") {
    await createStyledComponentsFiles(appPath);
  } else {
    await createTailwindFiles(appPath);
  }

  // --- Bloco 12: Mensagem Final ---
  // Exibe um resumo claro e útil no console com os próximos passos.
  console.log("\n" + chalk.green("=".repeat(50)));
  console.log(chalk.green.bold("✅ PROJETO CRIADO COM SUCESSO!"));
  console.log(chalk.green("=".repeat(50)));
  console.log(`\n📁 Para começar, navegue até o diretório do projeto:`);
  console.log(chalk.cyan(`   cd ${appName}`));
  console.log(`\n🚀 Para iniciar o servidor de desenvolvimento, execute:`);
  console.log(chalk.cyan(`   npm run dev`));
  console.log(`\n✨ Configurações do seu projeto:`);
  console.log(
    `   - 🎨 Estilo: ${
      finalChoice === "styled-components" ? "Styled Components" : "Tailwind CSS"
    }`
  );
  console.log(`   - 📦 Tipo: ${useEmpty ? "Projeto limpo" : "Com exemplos"}`);
  if (installTests) {
    console.log(
      "   - 🧪 Testes (Jest & RTL): Execute com " + chalk.cyan("npm test")
    );
  }
  if (installExtraDeps) {
    console.log(
      "   - 📚 Dependências adicionais instaladas (Formik, Yup, etc.)."
    );
  }
  if (installBackend) {
    console.log(chalk.yellow("\n⚠️ Ação necessária para o Backend:"));
    console.log(
      "   - Renomeie '.env.example' para '.env' e preencha a 'DATABASE_URL'."
    );
    console.log(
      "   - Execute " +
        chalk.cyan("npx prisma db push") +
        " para sincronizar o schema com o banco."
    );
    console.log(
      "   - Execute " +
        chalk.cyan("npx prisma generate") +
        " para gerar o Prisma Client."
    );
  }
  console.log(chalk.magenta("\n💙 Criado por RNT"));
  console.log("=".repeat(50));
}

// =============================================================================
// FUNÇÕES AUXILIARES MODULARIZADAS
// =============================================================================

async function createStyledComponentsFiles(appPath) {
  await writeFile(
    path.join(appPath, "src/styles/globalStyles.tsx"),
    `
  'use client'
  
  // 🎨 GLOBAL STYLES - Estilos globais com Styled Components
  
  import styled, { createGlobalStyle } from 'styled-components';
  import { media, theme, themeConfig } from './theme'
  
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
      width: 100%;
  
      \${media.pc}{
        width: 95%;
      }
  
      \${media.tablet}{
        width: 95%;
      }
  
      \${media.mobile}{
        width: 95%;
      }
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
  
  export const GradientTextH2 = styled.h2\`
    font-size: 38px;
    font-weight: 600;
    color: \${theme.colors.textColor};
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, \${themeConfig.dark.colors.neon.pink1}, \${themeConfig.dark.colors.neon.blue2});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  \`
  
  export const GradientSpan = styled.span\`
    font-size: 38px;
    font-weight: 600;
    color: \${theme.colors.textColor};
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, \${themeConfig.dark.colors.neon.pink1}, \${themeConfig.dark.colors.neon.blue2});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  
    &:hover {
      background: linear-gradient(360deg, \${themeConfig.light.colors.neon.blue2}, \${themeConfig.light.colors.neon.pink1});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  \`
  
  export const Line = styled.span.attrs({ 'aria-hidden': true })\`
    width: 80px;
    height: 2px;
    background: \${({ theme }) => theme.colors.baseBlack.light50};
    margin: 0 2px;
  \`
  
  export const Dot = styled.span.attrs({ 'aria-hidden': true })\`
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: \${({ theme }) => theme.colors.baseBlue.base};
    margin: 0 2px;
  \`
  
  type BoxProps = {
    direction: 'row' | 'column'
    justify?: 'center' | 'space-between' | 'space-around' | 'start' | 'end'
    align?: 'center' | 'space-between' | 'space-around' | 'start' | 'end'
    $bgColor?: 'primary' | 'secondary'
    width?: 'xm' | 'sm' | 'md' | 'lg'
    height?: 'xm' | 'sm' | 'md' | 'lg'
  }
  
  export const Box = styled.div<BoxProps>\`
    width: \${props => {
      switch (props.width) {
        case 'xm':
          return '10%'
        case 'sm':
          return '30%'
        case 'md':
          return '50%'
        case 'lg':
          return '100%'
        case undefined:
          return '100%'
      }
    }};
    height: \${props => {
      switch (props.height) {
        case 'xm':
          return '10%'
        case 'sm':
          return '30%'
        case 'md':
          return '50%'
        case 'lg':
          return '100%'
      }
    }};
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
  
    flex-direction: \${props => props.direction};
    justify-content: \${props => props.justify};
    align-items: \${props => props.align};
    background-color: \${props => (props.$bgColor === 'primary' ? theme.colors.secondaryColor : theme.colors.pinkColor)};
  \`
        `
  );

  // cria o arquivo de animações
  await writeFile(
    path.join(appPath, "src/styles/animations.tsx"),
    `
  import { css, keyframes } from 'styled-components'
  
  // ==================================
  // TRANSITIONS (DURAÇÃO E EFEITO)
  // ==================================
  
  export const transitions = {
    default: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-in-out',
    fast: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease-in-out',
    slow: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease-in-out',
    visibility: 'visibility 0.35s ease-in-out' // Transição para visibility
  }
  
  // ==================================
  // ANIMAÇÕES DE ENTRADA/SAÍDA (CSS HELPERS)
  // Baseadas em uma prop $isOpen
  // ==================================
  
  /**
   * Fade In / Fade Out.
   * Controla a opacidade e a visibilidade.
   */
  export const fadeInOut = css<{ $isOpen?: boolean }>\`
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    visibility: \${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition:
      opacity \${transitions.fast},
      \${transitions.visibility};
  \`
  
  /**
   * Usa scaleX para expandir/recolher horizontalmente.
   */
  export const slideFromLeft = css<{ $isOpen?: boolean }>\`
    transform-origin: left;
    transform: \${({ $isOpen }) => ($isOpen ? 'scaleX(1)' : 'scaleX(0)')};
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition: \${transitions.default};
  \`
  
  /**
   * Desliza de cima para baixo.
   * Usa scaleY para expandir/recolher verticalmente.
   */
  export const slideFromTop = css<{ $isOpen?: boolean }>\`
    transform-origin: top;
    transform: \${({ $isOpen }) => ($isOpen ? 'scaleY(1)' : 'scaleY(0)')};
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition: \${transitions.fast};
  \`
  
  /**
   * Usa scaleX com origem na direita.
   */
  export const slideFromRight = css<{ $isOpen?: boolean }>\`
    transform-origin: right;
    transform: \${({ $isOpen }) => ($isOpen ? 'scaleX(1)' : 'scaleX(0)')};
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition: \${transitions.default};
  \`
  
  /**
   * Aumenta e diminui o tamanho do elemento a partir do centro.
   */
  export const zoomInOut = css<{ $isOpen?: boolean }>\`
    transform-origin: center;
    transform: \${({ $isOpen }) => ($isOpen ? 'scale(1)' : 'scale(0.5)')};
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition: \${transitions.fast};
  \`
  
  /**
   * Usa translateX para mover o elemento para cima e para baixo.
   */
  export const slideAndFadeFromBottom = css<{ $isOpen?: boolean }>\`
    transform: \${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(20px)')};
    opacity: \${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transition: \${transitions.default};
  \`
  
  // ==================================
  // ANIMAÇÕES CONTÍNUAS (KEYFRAMES)
  // Para serem usadas com a propriedade 'animation'
  // ==================================
  
  /**
   * Efeito de "pulo" suave para cima e para baixo.
   * Ótimo para ícones de "scroll down".
   */
  export const bounce = keyframes\`
    0%, 100% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(25%);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  \`
  
  /**
   * Efeito de rotação para chamar atenção.
   * Ótimo para ícones de notificação.
   */
  export const jumpRotate = keyframes\`
    0%   { transform: rotate(0deg); }
    30%  { transform: rotate(15deg); }
    50%  { transform: rotate(15deg); }
    80%  { transform: rotate(-15deg); }
    100% { transform: rotate(0deg); }
  \`
  
  /**
   * Aumenta e diminui o tamanho para criar um foco sutil.
   */
  export const pulse = keyframes\`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  \`
  
  /**
   * Um gradiente que se move para indicar que o conteúdo está carregando.
   */
  export const skeletonLoading = keyframes\`
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  \`
  
  /**
   * Perfeito para ícones de loading (spinners).
   */
  export const spin = keyframes\`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  \`
  
        `
  );

  // Styled Components Registry
  await writeFile(
    path.join(appPath, "src/lib/styled-components-registry.tsx"),
    `
  'use client'
  
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
  }
        `
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
      `
import Footer from '@/components/layout/footer/Footer'
import Header from '@/components/layout/header/Header'
import { Providers } from '@/components/providers'
import StyledComponentsRegistry from '@/lib/styled-components-registry'
import { GlobalStyles } from '@/styles/globalStyles'
import type { Metadata } from 'next'
import { Jersey_10, Pixelify_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

// Fonts
const jersey_10 = Jersey_10({
  weight: '400',
  subsets: ['latin'],
  variable: '--secondary-font',
})

// Fonts
const pixelify_sans = Pixelify_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--primary-font',
})

// Metadata
export const metadata: Metadata = {
  title: 'Baltazarte',
  description: 'Aplicação Next.js criada com RNT CLI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={\`\${jersey_10.variable} \${pixelify_sans.variable}\`} data-scroll-behavior="smooth">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Providers>
            <Header />
            {children}
            <Footer />
            <Toaster
              position="top-center"
              containerStyle={{
                top: 85,
              }}
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#ebc6d3ff',
                  color: '#3f3c6eff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                },
                iconTheme: {
                  primary: '#3f3c6eff',
                  secondary: '#fbddf3',
                },
                error: {
                  style: {
                    background: '#fcd5d5',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                  },
                  iconTheme: {
                    primary: '#b91c1c',
                    secondary: '#fcd5d5',
                  },
                },
              }}
            />
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
      `
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import Header from '@/components/layout/header/Header'
import Footer from '@/components/layout/footer/Footer'

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
        <Providers>
          <Header />
          {children}
          <Footer />
          {children}
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
  // Página inicial de exemplo
  if (cssChoice === "styled-components") {
    await writeFile(
      path.join(appPath, "src/app/page.tsx"),
      `
'use client'

// 🏠 PÁGINA INICIAL - Exemplo com Styled Components
// ⚠️ ARQUIVO DELETÁVEL - Pode ser removido ao criar sua própria página

import { FaReact, FaCode, FaRocket } from 'react-icons/fa'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const MainContainer = styled.div\`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(to bottom, \${theme.colors.baseBlack.light20}, \${theme.colors.baseBlack.dark30});
  padding: 60px 20px;
\`

const HeroSection = styled.section\`
  text-align: center;
  margin-bottom: 80px;

  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color: \${theme.colors.textColor};
    margin-bottom: 20px;
    background: linear-gradient(360deg, \${theme.colors.baseBlue.base}, \${theme.colors.baseBlue.light20});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.25rem;
    color: \${theme.colors.baseBlue.light30};
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
      `
'use client'

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
      `
// 🌐 LAYOUT PÚBLICO - Layout para páginas públicas
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
      `
'use client'

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
      `
'use client'

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
      `
// 🌐 LAYOUT PÚBLICO - Layout para páginas públicas
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
      `
// ⏳ LOADING PÚBLICO - Componente de loading para páginas públicas
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
      `
// 🚫 NOT FOUND PÚBLICO - Página 404 para rotas públicas
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
    `
// 🔒 LAYOUT PRIVADO - Layout para páginas privadas
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
      `
'use client'

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
  background-image: linear-gradient(90deg, \${theme.colors.baseBlack.base}, \${theme.colors.baseBlack.light});
  border-bottom: 2px solid \${theme.colors.baseBlue.base};
  position: sticky;
  top: 0;
  z-index: 100;
\`

const Logo = styled.div\`
  h1 {
    color: \${theme.colors.textColor};
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(360deg, \${theme.colors.baseBlue.base}, \${theme.colors.baseBlue.light20});
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

export default Header
      `
    );
  } else {
    await writeFile(
      path.join(appPath, "src/components/layout/header/Header.tsx"),
      `
'use client'

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

export default Header
        `
    );
  }

  // Criar Footer
  if (cssChoice === "styled-components") {
    await writeFile(
      path.join(appPath, "src/components/layout/footer/Footer.tsx"),
      `
'use client'

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

export default Footer
        `
    );
  } else {
    await writeFile(
      path.join(appPath, "src/components/layout/footer/Footer.tsx"),
      `
'use client'

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

export default Footer
        `
    );
  }

  // Criar testes de exemplo se solicitado
  if (installTests) {
    await writeFile(
      path.join(appPath, "__tests__/page.test.tsx"),
      `
// 🧪 TESTE DA PÁGINA INICIAL
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
