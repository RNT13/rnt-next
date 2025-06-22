# RNT Next CLI

CLI para criar aplicações Next.js com configurações pré-definidas e estrutura otimizada.

## 🚀 Características

- ✅ Next.js 14+ com App Router
- ✅ TypeScript configurado
- ✅ Tailwind CSS
- ✅ Styled Components
- ✅ Redux Toolkit
- ✅ ESLint + Prettier
- ✅ Estrutura de componentes organizada
- ✅ Configurações de desenvolvimento otimizadas
- ✅ Opções para i18n, NextAuth.js e Prisma

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

1. **i18n (Internacionalização)**

   - Instala next-i18next
   - Configura português e inglês
   - Cria estrutura de traduções

2. **NextAuth.js (Autenticação)**

   - Instala NextAuth.js
   - Configura provider do Google
   - Cria arquivo de configuração

3. **Prisma (Banco de dados)**
   - Instala Prisma ORM
   - Configura SQLite por padrão
   - Cria schema básico

## 📁 Estrutura do projeto

```
meu-projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   └── footer/
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/
│   │   └── styled-components-registry.tsx
│   ├── redux/
│   │   ├── store.ts
│   │   └── slices/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── theme.ts
│   │   └── HomeStyles.ts
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

- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário

### Styling

- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animações
- **React Icons** - Ícones

### Estado

- **Redux Toolkit** - Gerenciamento de estado
- **React Redux** - Conectores React

### Desenvolvimento

- **ESLint** - Linting
- **Prettier** - Formatação de código
- **VS Code Settings** - Configurações do editor

### Opcionais

- **next-i18next** - Internacionalização
- **NextAuth.js** - Autenticação
- **Prisma** - ORM para banco de dados

## ⚙️ Configurações incluídas

### ESLint + Prettier

- Configuração otimizada para Next.js
- Regras para TypeScript e React
- Formatação automática no save

### VS Code

- Configurações de workspace
- Formatação automática
- Extensões recomendadas

### Styled Components

- Configuração para SSR
- Registry para Next.js 13+
- Temas claro/escuro

### Redux

- Store configurada
- Middleware padrão
- Tipagem TypeScript

## 🚀 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar ESLint
npm run lint:fix # Corrigir problemas do ESLint
```

## 📝 Personalização

### Temas

Edite `src/styles/theme.ts` para personalizar cores e breakpoints.

### Componentes

A estrutura de componentes está organizada em:

- `components/layout/` - Componentes de layout (Header, Footer)
- `components/ui/` - Componentes de interface reutilizáveis

### Redux

Adicione seus slices em `src/redux/slices/` e importe no store.

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

## 👤 Author

Made with 💙 by [Renato Minoita](https://www.linkedin.com/in/renato-luiz-0b072b247/)
Check out more on [GitHub](https://github.com/RNT13)
