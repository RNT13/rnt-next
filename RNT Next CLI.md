# RNT Next CLI

CLI **interativo** para criar aplicações Next.js com configurações personalizadas. Criado por RNT.

## 🚀 Características

- ✅ **Interface interativa** com 5 prompts de configuração
- ✅ Next.js 15+ com App Router
- ✅ TypeScript configurado
- ✅ Escolha entre **Styled Components** ou **Tailwind CSS**
- ✅ **Turbopack opcional** (independente da escolha de CSS)
- ✅ **Projeto limpo** (--empty) ou **com exemplos**
- ✅ **Dependências de teste opcionais** (Jest + Testing Library)
- ✅ **Pacote de dependências adicionais opcional**
- ✅ Redux Toolkit para gerenciamento de estado
- ✅ ESLint + Prettier configurados
- ✅ Estrutura de componentes organizada

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

### Criação interativa

```bash
npx rnt-next meu-projeto
```

O CLI fará **5 perguntas** antes de criar o projeto:

1. **🎨 CSS**: Styled Components ou Tailwind CSS
2. **⚡ Turbopack**: Habilitar ou não
3. **📦 Projeto**: Limpo (--empty) ou com exemplos
4. **🧪 Testes**: Instalar Jest + Testing Library ou não
5. **📚 Deps. Adicionais**: Instalar pacote extra ou não

Após confirmar as configurações, o projeto será criado automaticamente.

## 📋 Configurações Disponíveis

### 1️⃣ Biblioteca de CSS

- **Styled Components**: CSS-in-JS com temas personalizáveis
- **Tailwind CSS**: Framework CSS utilitário

### 2️⃣ Turbopack

- **Sim**: Habilita Turbopack para desenvolvimento mais rápido
- **Não**: Usa o bundler padrão do Next.js

### 3️⃣ Tipo de Projeto

- **Limpo (--empty)**: Projeto vazio, apenas estrutura básica
- **Com exemplos**: Inclui header, footer e página inicial de exemplo

### 4️⃣ Dependências de Teste

- **Sim**: Jest, Testing Library, configurações e testes de exemplo
- **Não**: Projeto sem dependências de teste

### 5️⃣ Dependências Adicionais

- **Sim**: React Hook Form, Zod, iMask, Next Safe Layouts, @svgr/webpack
- **Não**: Apenas dependências essenciais

## 📁 Estrutura do projeto

### Projeto Limpo (--empty)

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx (básico)
│   │   ├── page.tsx (página vazia do Next.js)
│   │   └── globals.css (apenas se Tailwind)
│   ├── components/
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/ (se Styled Components)
│   │   └── styled-components-registry.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   ├── globalStyles.tsx (se Styled Components)
│   │   └── theme.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
├── __tests__/ (se testes habilitados)
├── public/
├── next.config.js
├── jest.config.js (se testes habilitados)
├── tailwind.config.js (se Tailwind)
├── tsconfig.json
└── package.json
```

### Projeto com Exemplos

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx (com header/footer)
│   │   ├── page.tsx (página de exemplo)
│   │   └── globals.css (apenas se Tailwind)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   │   └── Header.tsx (⚠️ deletável)
│   │   │   └── footer/
│   │   │       └── Footer.tsx (⚠️ deletável)
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/ (se Styled Components)
│   │   └── styled-components-registry.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   ├── globalStyles.tsx (se Styled Components)
│   │   └── theme.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
├── __tests__/ (se testes habilitados)
│   └── page.test.tsx (⚠️ deletável)
├── public/
├── next.config.js
├── jest.config.js (se testes habilitados)
├── tailwind.config.js (se Tailwind)
├── tsconfig.json
└── package.json
```

## 🎨 Tecnologias incluídas

### Core (Sempre incluído)

- **Next.js 15+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **ESLint** - Linting configurado
- **Redux Toolkit** - Gerenciamento de estado
- **Framer Motion** - Animações
- **React Icons** - Ícones

### Styling (Escolha durante instalação)

- **Styled Components** - CSS-in-JS com temas e SSR
- **Tailwind CSS** - Framework CSS utilitário

### Performance (Opcional)

- **Turbopack** - Bundler mais rápido (opcional)

### Testes (Opcional)

- **Jest** - Framework de testes
- **Testing Library** - Utilitários para testes React
- **Jest Environment JSDOM** - Ambiente de testes DOM

### Dependências Adicionais (Opcional)

- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de esquemas TypeScript
- **iMask** - Máscaras de input
- **Next Safe Layouts** - Layouts seguros
- **@svgr/webpack** - Importação de SVGs como componentes

### Desenvolvimento

- **Prettier** - Formatação de código
- **VS Code Settings** - Configurações do editor

## ⚙️ Configurações incluídas

### Next.js

- App Router habilitado
- Turbopack configurado condicionalmente
- Suporte a Styled Components (se escolhido)
- Configurações de imagem otimizadas
- Flag `--empty` (se projeto limpo escolhido)

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

### Tailwind CSS (se escolhido)

- Configuração completa
- Classes utilitárias personalizadas
- Suporte a dark mode

### Redux

- Store configurada
- Middleware padrão
- Tipagem TypeScript

### Jest (se escolhido)

- Configuração para Next.js
- Setup para Testing Library
- Testes de exemplo incluídos

## 🚀 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (com Turbopack se habilitado)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar ESLint
npm run lint:fix # Corrigir problemas do ESLint
npm test         # Executar testes (se instalados)
npm run test:watch # Executar testes em modo watch (se instalados)
```

## 📝 Personalização

### Arquivos Deletáveis (apenas em projetos com exemplos)

Os arquivos marcados com `⚠️ ARQUIVO DELETÁVEL` podem ser removidos:

- `src/app/page.tsx` - Página inicial de exemplo
- `src/components/layout/header/Header.tsx` - Header de exemplo
- `src/components/layout/footer/Footer.tsx` - Footer de exemplo
- `__tests__/page.test.tsx` - Testes de exemplo

### Temas

Edite `src/styles/theme.ts` para personalizar cores e breakpoints.

### Styled Components

Se você escolheu Styled Components:

- Edite `src/styles/globalStyles.tsx` para estilos globais
- Use os temas em `src/styles/theme.ts`
- O arquivo `styled-components-registry.tsx` é **obrigatório** para SSR

### Tailwind CSS

Se você escolheu Tailwind CSS:

- Edite `src/app/globals.css` para estilos globais
- Use `tailwind.config.js` para personalizar o tema

### Componentes

A estrutura de componentes está organizada em:

- `components/ui/` - Componentes de interface reutilizáveis
- `components/layout/` - Componentes de layout (se projeto com exemplos)

### Redux

Adicione seus slices em `src/redux/slices/` e importe no store.

### Testes

Se você escolheu instalar dependências de teste:

- Adicione seus testes em `__tests__/` ou `src/__tests__/`
- Use os exemplos fornecidos como base

## 🆕 Novidades da versão 4.0

- ✅ **Interface totalmente interativa** com 5 prompts
- ✅ **Turbopack opcional** (independente da escolha de CSS)
- ✅ **Confirmação das configurações** antes da criação
- ✅ **Resumo visual** das escolhas feitas
- ✅ **Dependências adicionais opcionais**
- ✅ **Projeto limpo ou com exemplos** (escolha do usuário)
- ✅ **Configuração flexível** para diferentes necessidades
- ✅ **Melhor experiência do usuário** com feedback visual

## 🎯 Casos de Uso

### Projeto de Produção Limpo

```
CSS: Tailwind CSS
Turbopack: Sim
Projeto: Limpo (--empty)
Testes: Não
Deps. Adicionais: Sim
```

### Projeto de Aprendizado com Exemplos

```
CSS: Styled Components
Turbopack: Não
Projeto: Com exemplos
Testes: Sim
Deps. Adicionais: Não
```

### Projeto Rápido para Prototipagem

```
CSS: Tailwind CSS
Turbopack: Sim
Projeto: Com exemplos
Testes: Não
Deps. Adicionais: Sim
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

ISC License

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Certifique-se de estar usando Node.js 18+
3. Execute `npm run lint` para verificar problemas de código
4. Se testes estão habilitados, execute `npm test` para verificar funcionamento

## 👤 Autor

Criado com 💙 por **RNT**

- GitHub: [RNT13](https://github.com/RNT13)
- LinkedIn: [Renato Luiz](https://www.linkedin.com/in/renato-luiz-0b072b247/)

---

**RNT Next CLI v3.0** - Configure seu projeto Next.js do seu jeito!
