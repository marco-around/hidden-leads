# Contexto do projeto

## 1. Stack Tecnológica

- **Linguagem & Runtime:** TypeScript (~6.0) e Node.js
- **Gerenciador de Pacotes:** `pnpm`
- **Frontend & Bundler:** React 19 + Vite
- **UI & Estilização:** Tailwind CSS v4, Base UI, Shadcn UI, Phosphor Icons
- **Armazenamento Local:** Dexie.js (IndexedDB) + `dexie-react-hooks`
- **Testes:** Vitest (unitários/componentes), Testing Library e Playwright (E2E)
- **Linter & Code Style:** ESLint (`eslint.config.js`) + Prettier

## 2. Comandos de Verificação

Execute as validações pertinentes antes de finalizar qualquer alteração:

- **Lint:** `pnpm lint`
- **Formatação:** `pnpm format`
- **Build & Typecheck:** `pnpm build`
- **Testes Unitários:** `pnpm test:run`
- **Testes E2E:** `pnpm test:e2e`
- **Testes (Suite Completa):** `pnpm test:all`

## 3. Regras de Código e Conduta

1. **Tipagem Estrita:**
   - **Nunca** use o tipo `any`. Utilize tipos específicos ou `unknown` com validação/narrowing via type guards.
   - **Nunca** faça asserções de tipo inseguras (`as unknown as T`, `as any` ou casts arbitrários que contornem a checagem do compilador).

2. **Validação de Tipos de Dependências (`.d.ts`):**
   - Para evitar convenções incorretas ou suposições baseadas em versões antigas de bibliotecas, inspecione diretamente os arquivos `.d.ts` dentro de `node_modules/` antes de começar a codificar com as bibliotecas do projeto.

3. **Tratamento de Erros:**
   - Priorize um tratamento de erros de qualidade e contextualizado.
   - **Nunca** deixe blocos `catch` vazios ou engolindo erros silenciosamente; trate, reporte ou propague adequadamente.

4. **Escopo Mínimo e Cirúrgico:**
   - Altere **apenas** os arquivos estritamente necessários para a conclusão da tarefa solicitada.
   - Não realize refatorações amplas ou alterações fora do escopo. Se for inevitável modificar outros arquivos, **questione o usuário antes de prosseguir** (pode interromper a execução para aguardar o usuário responder).

5. **Gestão de Dependências:**
   - **Nunca** instale pacotes ou dependências (produção ou desenvolvimento) sem consulta e autorização prévia do usuário.

6. **Convenções**
   - Escrever componentes react sempre em kebab-case.

## 4. Documentação

Não leia esses arquivos a não ser que a tarefa que estiver realizando dependa disso.

- **A proposta do projeto com regras**: Leia `docs/ia/domain.md` ANTES de planejar qualquer feature que envolva logica de négocio.

## 5. Comunicação

- Sempre responda, planeje e explique em **Português Brasileiro (PT-BR)**.
- Mantenha todo código, variaveis, comentarios, commits e documentação em **Inglês**
