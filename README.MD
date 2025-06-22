# RNT Next CLI

CLI para criar aplicações Next.js com configurações pré-definidas e estrutura otimizada. Criado por RNT.

## 🚀 Características

- ✅ Next.js 15+ com App Router e Turbopack
- ✅ TypeScript configurado
- ✅ Escolha entre Styled Components ou Tailwind CSS
- ✅ Redux Toolkit para gerenciamento de estado
- ✅ ESLint + Prettier configurados
- ✅ Estrutura de componentes organizada
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
   - **Styled Components**: CSS-in-JS com temas personalizáveis
   - **Tailwind CSS**: Framework CSS utilitário para desenvolvimento rápido

## 📁 Estrutura do projeto

### Com Styled Components

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css (apenas se Tailwind)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── HeaderStyles.ts
│   │   │   └── footer/
│   │   │       ├── Footer.tsx
│   │   │       └── FooterStyles.ts
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/
│   │   └── styled-components-registry.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   ├── globalStyles.tsx
│   │   ├── theme.ts
│   │   └── HomeStyles.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
├── next.config.js
├── tsconfig.json
└── package.json
```

### Com Tailwind CSS

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   │   └── Header.tsx
│   │   │   └── footer/
│   │   │       └── Footer.tsx
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
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎨 Tecnologias incluídas

### Core

- **Next.js 15+** - Framework React com App Router e Turbopack
- **TypeScript** - Tipagem estática
- **ESLint** - Linting configurado por padrão

### Styling (Escolha durante instalação)

- **Styled Components** - CSS-in-JS com temas e SSR
- **Tailwind CSS** - Framework CSS utilitário

### Outras bibliotecas

- **Framer Motion** - Animações
- **React Icons** - Ícones
- **Redux Toolkit** - Gerenciamento de estado
- **React Redux** - Conectores React

### Desenvolvimento

- **Prettier** - Formatação de código
- **VS Code Settings** - Configurações do editor

## ⚙️ Configurações incluídas

### Next.js

- App Router habilitado
- Turbopack configurado
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

### Tailwind CSS (se escolhido)

- Configuração completa
- Classes utilitárias personalizadas
- Suporte a dark mode
- Componentes pré-estilizados

### Redux

- Store configurada
- Middleware padrão
- Tipagem TypeScript

## 🚀 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com Turbopack
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar ESLint
npm run lint:fix # Corrigir problemas do ESLint
```

## 📝 Personalização

### Temas

Edite `src/styles/theme.ts` para personalizar cores e breakpoints.

### Styled Components

Se você escolheu Styled Components:

- Edite `src/styles/globalStyles.tsx` para estilos globais
- Use os temas em `src/styles/theme.ts`
- Componentes estilizados estão em arquivos separados (ex: `HeaderStyles.ts`)

### Tailwind CSS

Se você escolheu Tailwind CSS:

- Edite `src/app/globals.css` para estilos globais
- Use `tailwind.config.js` para personalizar o tema
- Classes utilitárias personalizadas estão disponíveis

### Componentes

A estrutura de componentes está organizada em:

- `components/layout/` - Componentes de layout (Header, Footer)
- `components/ui/` - Componentes de interface reutilizáveis

### Redux

Adicione seus slices em `src/redux/slices/` e importe no store.

## 🆕 Novidades da versão 2.0

- ✅ Escolha entre Styled Components e Tailwind CSS
- ✅ Next.js 15+ com Turbopack habilitado por padrão
- ✅ App Router configurado automaticamente
- ✅ ESLint habilitado por padrão
- ✅ Página inicial personalizada mencionando RNT
- ✅ Estrutura otimizada para ambas as opções de CSS
- ✅ Configurações aprimoradas para desenvolvimento

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

## 👤 Autor

Criado com 💙 por **RNT**

- GitHub: [RNT13](https://github.com/RNT13)
- LinkedIn: [Renato Luiz](https://www.linkedin.com/in/renato-luiz-0b072b247/)

---

**RNT Next CLI** - Acelere seu desenvolvimento com Next.js!
