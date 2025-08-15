# RNT Next CLI

CLI **interativo** para criar aplicações Next.js com configurações personalizadas. Criado por RNT.

## 🚀 Características

- ✅ **Interface interativa** com 5 prompts de configuração
- ✅ Next.js 15+ com App Router
- ✅ TypeScript configurado
- ✅ Escolha entre **Styled Components** ou **Tailwind CSS**
- ✅ **Projeto limpo** (--empty) ou **com exemplos**
- ✅ **Dependências de teste opcionais** (Jest + Testing Library)
- ✅ **Pacote de dependências adicionais opcional**
- ✅ **Backend com Prisma e MySQL opcional**
- ✅ Redux Toolkit para gerenciamento de estado
- ✅ ESLint + Prettier configurados
- ✅ Estrutura de componentes organizada
- ✅ **ColorUtils** para geração de variantes de cores HSL
- ✅ **Middleware** para controle de autenticação
- ✅ **Providers** configurados
- ✅ Arquivo **.env** com variáveis de ambiente

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
2. **📦 Projeto**: Limpo (--empty) ou com exemplos
3. **🧪 Testes**: Instalar Jest + Testing Library ou não
4. **📚 Deps. Adicionais**: Instalar pacote extra ou não
5. **🗄️ Backend**: Instalar Prisma + MySQL ou não

Após confirmar as configurações, o projeto será criado automaticamente.

## 📋 Configurações Disponíveis

### 1️⃣ Biblioteca de CSS

- **Styled Components**: CSS-in-JS com temas personalizáveis e ColorUtils
- **Tailwind CSS**: Framework CSS utilitário

### 2️⃣ Tipo de Projeto

- **Limpo (--empty)**: Projeto vazio, apenas estrutura básica
- **Com exemplos**: Inclui header, footer, páginas de exemplo e estrutura de rotas

### 3️⃣ Dependências de Teste

- **Sim**: Jest, Testing Library, configurações e testes de exemplo + Store com preloaded state
- **Não**: Projeto sem dependências de teste + Store simples

### 4️⃣ Dependências Adicionais

- **Sim**: formik, yup, iMask, React Hot Toast, Framer Motion, React Icons
- **Não**: Apenas dependências essenciais

### 5️⃣ Backend com Prisma

- **Sim**: Prisma, @prisma/client, schema configurado, model User básico
- **Não**: Apenas frontend

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
│   │   ├── store.ts (simples ou com preloaded state)
│   │   └── slices/
│   │       └── authSlice.ts
│   ├── styles/
│   │   ├── globalStyles.tsx (se Styled Components)
│   │   └── theme.ts (com ColorUtils)
│   ├── utils/
│   │   └── colorUtils.ts
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
├── prisma/ (se backend escolhido)
│   └── schema.prisma (com model User e comentários)
├── __tests__/ (se testes habilitados)
├── .env (com variáveis configuradas)
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
│   │   ├── (private)/
│   │   │   └── layout.tsx
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx (⚠️ deletável)
│   │   │   └── not-found.tsx (⚠️ deletável)
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
│   │   ├── styled-components-registry.tsx
│   │   └── prisma.ts (se backend escolhido)
│   ├── redux/
│   │   ├── store.ts (simples ou com preloaded state)
│   │   └── slices/
│   │       └── authSlice.ts
│   ├── styles/
│   │   ├── globalStyles.tsx (se Styled Components - atualizado)
│   │   └── theme.ts (com ColorUtils)
│   ├── utils/
│   │   └── colorUtils.ts
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
├── prisma/ (se backend escolhido)
│   └── schema.prisma (com model User e comentários)
├── __tests__/ (se testes habilitados)
│   └── page.test.tsx (⚠️ deletável)
├── .env (com variáveis configuradas)
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
- **Lucide React** - Ícones
- **ColorUtils** - Utilitários para geração de variantes de cores HSL

### Styling (Escolha durante instalação)

- **Styled Components** - CSS-in-JS com temas, SSR e ColorUtils integrado
- **Tailwind CSS** - Framework CSS utilitário

### Testes (Opcional)

- **Jest** - Framework de testes
- **Testing Library** - Utilitários para testes React
- **Jest Environment JSDOM** - Ambiente de testes DOM

### Dependências Adicionais (Opcional)

- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de esquemas TypeScript
- **iMask** - Máscaras de input
- **React Hot Toast** - Notificações
- **Framer Motion** - Animações
- **React Icons** - Biblioteca de ícones

### Backend (Opcional)

- **Prisma** - ORM para banco de dados
- **@prisma/client** - Cliente do Prisma
- **MySQL** - Banco de dados configurado

### Desenvolvimento

- **Prettier** - Formatação de código
- **VS Code Settings** - Configurações do editor
- **Middleware** - Controle de autenticação e rotas
- **Providers** - Contextos globais configurados

## ⚙️ Configurações incluídas

### Next.js

- App Router habilitado
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
- GlobalStyles.tsx atualizado com ColorUtils
- Temas claro/escuro
- Componentes styled pré-configurados

### Tailwind CSS (se escolhido)

- Configuração completa
- Classes utilitárias personalizadas
- Suporte a dark mode

### Redux

- Store configurada condicionalmente
- AuthSlice incluído
- Middleware padrão
- Tipagem TypeScript

### Jest (se escolhido)

- Configuração para Next.js
- Setup para Testing Library
- Testes de exemplo incluídos

### Prisma (se escolhido)

- Schema configurado com model User
- Comentários explicativos
- Configuração do cliente
- Suporte a MySQL

## 🚀 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Executar ESLint
npm run lint:fix # Corrigir problemas do ESLint
npm test         # Executar testes (se instalados)
npm run test:watch # Executar testes em modo watch (se instalados)
```

## 🗄️ Comandos do Prisma (se backend escolhido)

```bash
# Configurar DATABASE_URL no .env primeiro
npx prisma db push      # Criar banco e tabelas
npx prisma generate     # Gerar Prisma Client
npx prisma studio       # Visualizar banco no navegador
npx prisma db pull      # Importar estrutura de banco existente
npx prisma migrate dev  # Criar e aplicar migrations
```

## 📝 Personalização

### Arquivos Deletáveis (apenas em projetos com exemplos)

Os arquivos marcados com `⚠️ ARQUIVO DELETÁVEL` podem ser removidos:

- `src/app/page.tsx` - Página inicial de exemplo
- `src/components/layout/header/Header.tsx` - Header de exemplo
- `src/components/layout/footer/Footer.tsx` - Footer de exemplo
- `src/app/(public)/loading.tsx` - Loading de exemplo
- `src/app/(public)/not-found.tsx` - 404 de exemplo
- `__tests__/page.test.tsx` - Testes de exemplo

### ColorUtils

Use o arquivo `src/utils/colorUtils.ts` para gerar variantes de cores:

```typescript
import { colorHSLVariants } from "@/utils/colorUtils";

const myColor = colorHSLVariants(220, 80, 50);
// Retorna: base, light, light02, light04, light08, light20, light30, light40, light50
//          dark, dark02, dark04, dark08, dark20, dark30, dark40, dark50
```

### Temas

Edite `src/styles/theme.ts` para personalizar cores e breakpoints. O arquivo já inclui ColorUtils integrado.

### Middleware

Configure rotas públicas e privadas em `src/middleware.ts`.

### Styled Components

Se você escolheu Styled Components:

- Edite `src/styles/globalStyles.tsx` para estilos globais (atualizado)
- Use os temas em `src/styles/theme.ts` (com ColorUtils)
- O arquivo `styled-components-registry.tsx` é **obrigatório** para SSR

### Tailwind CSS

Se você escolheu Tailwind CSS:

- Edite `src/app/globals.css` para estilos globais
- Use `tailwind.config.js` para personalizar o tema

### Redux

- Store configurado condicionalmente baseado na escolha de testes
- AuthSlice incluído por padrão
- Adicione seus slices em `src/redux/slices/`

### Prisma (se escolhido)

- Configure `DATABASE_URL` no arquivo `.env`
- Edite `prisma/schema.prisma` para adicionar models
- Use `src/lib/prisma.ts` para conexões

## 🆕 Novidades da versão 4.0

- ✅ **Remoção da pergunta sobre Turbopack** (comando Next.js já pergunta)
- ✅ **Remoção do experimental turbo** (não mais suportado)
- ✅ **ColorUtils integrado** para geração de variantes de cores HSL
- ✅ **GlobalStyles.tsx atualizado** com novos componentes styled
- ✅ **Theme.ts atualizado** com ColorUtils integrado
- ✅ **Store condicional** baseado na escolha de ambiente de teste
- ✅ **Estrutura de rotas** com (private) e (public)
- ✅ **Middleware** para controle de autenticação
- ✅ **Providers** configurados
- ✅ **Arquivo .env** com variáveis de ambiente
- ✅ **Backend opcional** com Prisma e MySQL
- ✅ **Arquivos .styles condicionais** apenas se Styled Components

## 🎯 Casos de Uso

### Projeto Full-Stack com Backend

```
CSS: Styled Components
Projeto: Com exemplos
Testes: Sim
Deps. Adicionais: Sim
Backend: Sim (Prisma + MySQL)
```

### Projeto Frontend Limpo

```
CSS: Tailwind CSS
Projeto: Limpo (--empty)
Testes: Não
Deps. Adicionais: Sim
Backend: Não
```

### Projeto de Aprendizado

```
CSS: Styled Components
Projeto: Com exemplos
Testes: Sim
Deps. Adicionais: Não
Backend: Não
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
5. Se backend está habilitado, configure `DATABASE_URL` no `.env`

## 👤 Autor

Criado com 💙 por **RNT**

- GitHub: [RNT13](https://github.com/RNT13)
- LinkedIn: [Renato Minoita](https://www.linkedin.com/in/renato-minoita/)

---

**RNT Next CLI v4.0** - Configure seu projeto Next.js do seu jeito, agora com backend!
