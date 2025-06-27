# RNT Next CLI

CLI para criar aplicações Next.js com configurações pré-definidas e estrutura otimizada. Criado por RNT.

## 🚀 Características

- ✅ Next.js 15+ com App Router

- ✅ TypeScript configurado

- ✅ Escolha entre Styled Components ou Tailwind CSS

- ✅ Turbopack habilitado condicionalmente (apenas para Tailwind CSS)

- ✅ Redux Toolkit para gerenciamento de estado

- ✅ ESLint + Prettier configurados

- ✅ Dependências de teste opcionais (Jest + Testing Library)

- ✅ Estrutura de componentes organizada

- ✅ Comentários indicando arquivos deletáveis

- ✅ Configurações de desenvolvimento otimizadas

- ✅ Página inicial personalizada mencionando RNT

## 📦 Instalação

### Uso direto com NPX (Recomendado)

```bash
npx rnt-next meu-projeto
```

### Instalação global

```bash
npm install -g rnt-next
rnt-next meu-projeto
```

## 🛠️ Uso

### Criação básica

```bash
npx rnt-next meu-projeto
cd meu-projeto
npm run dev
```

### Opções disponíveis durante a criação

Durante a execução, você será perguntado sobre:

1. **Biblioteca de CSS**
  - **Styled Components**: CSS-in-JS com temas personalizáveis (sem Turbopack)
  - **Tailwind CSS**: Framework CSS utilitário para desenvolvimento rápido (com Turbopack)

1. **Dependências de Teste**
  - **Sim**: Instala Jest, Testing Library e configurações de teste
  - **Não**: Projeto sem dependências de teste

## 📁 Estrutura do projeto

### Com Styled Components

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx (⚠️ deletável)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   │   ├── Header.tsx (⚠️ deletável)
│   │   │   │   └── HeaderStyles.ts (⚠️ deletável)
│   │   │   └── footer/
│   │   │       ├── Footer.tsx (⚠️ deletável)
│   │   │       └── FooterStyles.ts (⚠️ deletável)
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/
│   │   └── styled-components-registry.tsx (obrigatório)
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   ├── globalStyles.tsx
│   │   ├── theme.ts
│   │   └── HomeStyles.ts (⚠️ deletável)
│   ├── hooks/
│   ├── utils/
│   └── types/
├── __tests__/ (se testes habilitados)
├── public/
├── next.config.js
├── jest.config.js (se testes habilitados)
├── jest.setup.js (se testes habilitados)
├── tsconfig.json
└── package.json
```

### Com Tailwind CSS

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (⚠️ deletável)
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   │   └── Header.tsx (⚠️ deletável)
│   │   │   └── footer/
│   │   │       └── Footer.tsx (⚠️ deletável)
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   └── theme.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
├── __tests__/ (se testes habilitados)
├── public/
├── next.config.js
├── tailwind.config.js
├── jest.config.js (se testes habilitados)
├── jest.setup.js (se testes habilitados)
├── tsconfig.json
└ package.json
```

## 🎨 Tecnologias incluídas

### Core

- **Next.js 15+** - Framework React com App Router

- **TypeScript** - Tipagem estática

- **ESLint** - Linting configurado por padrão

### Styling (Escolha durante instalação)

- **Styled Components** - CSS-in-JS com temas e SSR (sem Turbopack)

- **Tailwind CSS** - Framework CSS utilitário (com Turbopack)

### Outras bibliotecas

- **Framer Motion** - Animações

- **React Icons** - Ícones

- **Redux Toolkit** - Gerenciamento de estado

- **React Redux** - Conectores React

### Desenvolvimento

- **Prettier** - Formatação de código

- **VS Code Settings** - Configurações do editor

### Testes (Opcional)

- **Jest** - Framework de testes

- **Testing Library** - Utilitários para testes de componentes React

- **Jest Environment JSDOM** - Ambiente de testes para DOM

## ⚙️ Configurações incluídas

### Next.js

- App Router habilitado

- Turbopack configurado condicionalmente (apenas para Tailwind CSS)

- Suporte a Styled Components (se escolhido)

- Configurações de imagem otimizadas

### ESLint + Prettier

- Configuração otimizada para Next.js

- Regras para TypeScript e React

- Formatação automática no save

### VS Code

- Configurações de workspace

- Formatação automática

- Extensões recomendadas

### Styled Components (se escolhido)

- Configuração para SSR

- Registry para Next.js 15+

- GlobalStyles.tsx configurado

- Temas claro/escuro

- Componentes com arquivos de estilos separados

### Tailwind CSS (se escolhido)

- Configuração completa com Turbopack

- Classes utilitárias personalizadas

- Suporte a dark mode

- Componentes pré-estilizados

### Redux

- Store configurada

- Middleware padrão

- Tipagem TypeScript

### Jest (se escolhido)

- Configuração para Next.js

- Setup para Testing Library

- Testes de exemplo incluídos

- Suporte a módulos TypeScript

## 🚀 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (com Turbopack se Tailwind)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar ESLint
npm run lint:fix # Corrigir problemas do ESLint
npm test         # Executar testes (se instalados)
npm run test:watch # Executar testes em modo watch (se instalados)
```

## 📝 Personalização

### Arquivos Deletáveis

Os arquivos marcados com comentários `⚠️ ARQUIVO DELETÁVEL` podem ser removidos ao criar sua própria página:

- `src/app/page.tsx` - Página inicial de exemplo

- `src/components/layout/header/Header.tsx` - Header de exemplo

- `src/components/layout/footer/Footer.tsx` - Footer de exemplo

- `src/styles/HomeStyles.ts` - Estilos da página inicial (Styled Components)

- `__tests__/page.test.tsx` - Testes de exemplo

- Seções marcadas no `globals.css` (Tailwind CSS)

### Temas

Edite `src/styles/theme.ts` para personalizar cores e breakpoints.

### Styled Components

Se você escolheu Styled Components:

- Edite `src/styles/globalStyles.tsx` para estilos globais

- Use os temas em `src/styles/theme.ts`

- Componentes estilizados estão em arquivos separados (ex: `HeaderStyles.ts`)

- O arquivo `styled-components-registry.tsx` é **obrigatório** para SSR

### Tailwind CSS

Se você escolheu Tailwind CSS:

- Edite `src/app/globals.css` para estilos globais

- Use `tailwind.config.js` para personalizar o tema

- Classes utilitárias personalizadas estão disponíveis

- Turbopack está habilitado para desenvolvimento mais rápido

### Componentes

A estrutura de componentes está organizada em:

- `components/layout/` - Componentes de layout (Header, Footer)

- `components/ui/` - Componentes de interface reutilizáveis

### Redux

Adicione seus slices em `src/redux/slices/` e importe no store.

### Testes

Se você escolheu instalar dependências de teste:

- Adicione seus testes em `__tests__/` ou `src/__tests__/`

- Use os exemplos fornecidos como base

- Configure novos testes seguindo o padrão do Jest + Testing Library

## 🆕 Novidades da versão 2.1

- ✅ Instalação condicional do Turbopack (apenas para Tailwind CSS)

- ✅ Comentários indicando arquivos deletáveis para facilitar customização

- ✅ Prompt para instalação opcional de dependências de teste

- ✅ Configuração completa do Jest + Testing Library

- ✅ Testes de exemplo incluídos

- ✅ Estrutura otimizada para ambas as opções de CSS

- ✅ Melhor documentação e organização de código

## 🤝 Contribuição

1. Fork o projeto

1. Crie uma branch para sua feature

1. Commit suas mudanças

1. Push para a branch

1. Abra um Pull Request

## 📄 Licença

ISC License

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique se todas as dependências estão instaladas

1. Certifique-se de estar usando Node.js 18+

1. Execute `npm run lint` para verificar problemas de código

1. Se testes estão habilitados, execute `npm test` para verificar funcionamento

## 👤 Autor

Criado com 💙 por **RNT**

- GitHub: [RNT13](https://github.com/RNT13)

- LinkedIn: [Renato Luiz](https://www.linkedin.com/in/renato-luiz-0b072b247/)

---

**RNT Next CLI** - Acelere seu desenvolvimento com Next.js!

