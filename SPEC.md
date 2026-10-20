# Especificação Técnica — Conversão de Arquivos, Tabela e Detalhes de Leads

Este documento descreve o plano arquitetural e o checklist de execução para a importação e conversão determinística de arquivos (CSV) em listas estruturadas de leads em memória (JSON), visualização dos dados via componente de tabela (`Table`) e exibição de informações detalhadas em modal (`Dialog`), em total conformidade com o design system (shadcn/ui + Base UI) e as diretrizes do produto descritas em `docs/ai/domain.md`.

---

## 1. Visão Geral e Escopo

### 1.1. Contexto do Fluxo

Atualmente, o usuário possui a área de upload (`FileUpload`) na tela inicial (`HomeMain`), porém o envio dos arquivos ainda não desencadeia a conversão e exibição dos registros.

Nesta etapa:

- **Sem Dexie (por enquanto):** O estado dos leads convertidos será mantido em memória do React (`useState` / hook de contexto local).
- **Sem IA (por enquanto):** A conversão será 100% determinística através de regras bem definidas e inspeção de cabeçalhos/colunas do arquivo CSV. A interface para o parser de IA será desacoplada para posterior inclusão.
- **Sem testes no plano da IA:** Conforme solicitado, os testes automatizados serão criados diretamente pelo usuário.
- **Foco em UX/UI:** Transição limpa e fluida do estado "Vazio / Dropzone" para o estado "Lista carregada", exibindo métricas de qualidade, tabela de leads e modal de detalhes.

---

## 2. Modelo de Dados e Interfaces (`src/types/lead.ts`)

A tipagem seguirá o padrão estrito definido no `AGENTS.md` (sem uso de `any`, com validações via type guards e nomes completos de parâmetros).

```typescript
export type LeadFunnelStatus =
	'new' | 'contacted' | 'replied' | 'proposal' | 'closed' | 'discarded'

export interface LeadContactInfo {
	phone: string | null
	formattedPhone: string | null
	isMobile: boolean
	hasWhatsapp: boolean
	whatsappUrl: string | null
	website: string | null
	hasWebsite: boolean
}

export interface LeadLocation {
	address: string | null
	city: string | null
	state: string | null
	neighborhood: string | null
	postalCode: string | null
}

export interface LeadMetadata {
	category: string | null
	document: string | null
	isPossibleIndividual: boolean // Alerta LGPD para pessoa física
	rawData: Record<string, string>
}

export interface Lead {
	id: string
	name: string
	status: LeadFunnelStatus
	contact: LeadContactInfo
	location: LeadLocation
	metadata: LeadMetadata
	importedAt: string
}

export interface ListQualityMetrics {
	totalLeads: number
	withPhoneCount: number
	withPhonePercentage: number
	withWhatsappCount: number
	withWhatsappPercentage: number
	withWebsiteCount: number
	withWebsitePercentage: number
	withoutWebsiteCount: number
	withoutWebsitePercentage: number
}
```

---

## 3. Arquitetura da Conversão Determinística (`src/utils/csv-parser.ts`)

A conversão determinística combina a robustez de baixo nível do **Papa Parse** com regras heurísticas de negócio e normalização locais:

1. **Leitura e Parser RFC 4180 via Papa Parse (`papaparse`):**
   - Suporte nativo a quebras de linha dentro de aspas e aspas duplas escapadas (`""`).
   - Detecção automática de delimitadores usuais (`,`, `;`, `\t`, `|`).
   - Remoção automática de BOM (`\uFEFF`) e limpeza de linhas vazias com `skipEmptyLines: 'greedy'`.
   - Suporte a decodificação com fallback para Windows-1252 (comum em arquivos exportados pelo Excel no Brasil).

2. **Mapeador Heurístico de Cabeçalhos (Deterministic Column Mapping):**
   - Normalização dos nomes das colunas (remoção de acentos/diacríticos via NFD, minúsculas e pontuação).
   - Dicionário de sinônimos conhecidos:
     - `name`: `['nome', 'empresa', 'razao social', 'nome fantasia', 'title', 'company', 'business name', 'name', 'razao', 'fantasia', 'cliente', 'estabelecimento']`
     - `phone`: `['telefone', 'celular', 'whatsapp', 'fone', 'tel', 'phone', 'mobile', 'contato', 'whatsapp 1', 'telefone 1', 'celular 1', 'telephone']`
     - `website`: `['site', 'website', 'url', 'pagina', 'web', 'homepage', 'link']`
     - `category`: `['categoria', 'segmento', 'ramo', 'atividade', 'category', 'type', 'niche', 'setor', 'ocupacao']`
     - `document`: `['cnpj', 'cpf', 'documento', 'doc', 'document', 'cnpjcpf', 'cpfcnpj', 'tax id']`
     - `city`: `['cidade', 'municipio', 'city', 'town']`
     - `state`: `['estado', 'uf', 'state', 'province']`
     - `address`: `['endereco', 'logradouro', 'rua', 'address', 'street', 'localizacao']`
     - `neighborhood`: `['bairro', 'neighborhood', 'district', 'distrito']`
     - `postalCode`: `['cep', 'postalcode', 'zip', 'zipcode', 'postal code', 'zip code']`

3. **Higienização e Normalização dos Dados:**
   - **Telefones BR:** Extração de dígitos via `phone-normalizer.ts`. Se possuir DDD + 9 dígitos iniciado em 9, classifica como celular (`isMobile = true`), ativa `hasWhatsapp = true` e monta o link `https://wa.me/55${ddd}${numero}`.
   - **Websites:** Remove espaços, valida formato básico e assegura prefixo `http://` ou `https://` via `url-normalizer.ts`.
   - **Deduplicação de Registros:** Identifica registros duplicados no mesmo lote através de telefone limpo, documento ou combinação de nome + cidade.
   - **Identificação LGPD:** Avalia se o registro parece ser pessoa física (ex: nome próprio sem termos societários como LTDA/ME/EPP ou presença de CPF com 11 dígitos em vez de CNPJ) para ativar a flag `isPossibleIndividual`.
   - **Preservação de Dados Brutos (`rawData`):** Todas as colunas presentes no CSV original são preservadas integralmente em `rawData` para conferência detalhada no modal.

---

## 4. Design de Interface e Componentes (shadcn/ui + Base UI)

### 4.1. Fluxo na Tela Inicial (`src/components/home-main.tsx`)

- **Estado 1 (Sem leads carregados):** Exibe o card de `FileUpload` atual com orientação simples.
- **Estado 2 (Leads carregados):**
  - Barra superior de métricas (`lead-metrics.tsx`): contadores de leads, percentual com WhatsApp e percentual sem site (relevante para prospecção).
  - Barra de ações rápidas: botão "Limpar lista" e botão "Carregar outro arquivo".
  - Componente de Tabela de Leads (`lead-table.tsx`): listagem paginada/rolável com ações por linha.

### 4.2. Tabela de Leads (`src/components/lead-table.tsx`)

Utilizará diretamente os componentes de `src/components/ui/table.tsx`:

- **Colunas:**
  1. **Empresa / Nome:** Nome em destaque, com selo/aviso discreto caso seja possível pessoa física (LGPD).
  2. **Categoria:** Badge discreto ou texto secundário com o segmento comercial.
  3. **Telefone & WhatsApp:** Exibe o número formatado; se for WhatsApp, inclui ícone do WhatsApp com link rápido ou indicador visual.
  4. **Presença Web:** Link direto para o site ou indicador "Sem site" (com destaque visual sutil para oportunidades de prospecção).
  5. **Ações:** Botão secundário "Detalhes" que dispara a abertura da `Dialog`.

### 4.3. Modal de Detalhes do Lead (`src/components/lead-details-dialog.tsx`)

Utilizará diretamente os componentes de `src/components/ui/dialog.tsx`:

- **Cabeçalho:** Nome do lead, categoria e indicador de status.
- **Botões de Ação Direta:**
  - "Conversar no WhatsApp" (com ícone, abrindo em nova aba com link `https://wa.me/...`).
  - "Ligar" (link `tel:...`).
  - "Visitar Site" (se houver).
- **Blocos Informativos:**
  - Contato e Localização (Endereço, Cidade, UF).
  - Identificação (CNPJ/Documento e selo de atenção LGPD).
  - Informações originais do arquivo (`Raw Data`): lista ou tabela expansível exibindo todos os pares chave/valor brutos lidos do CSV original.

---

## 5. Checklist de Implementação

- [x] - **Etapa 1: Definição de Tipos e Modelo de Domínio**
  - [x] Criar arquivo `src/types/lead.ts` contendo as interfaces `Lead`, `LeadContactInfo`, `LeadLocation`, `LeadMetadata`, `ListQualityMetrics` e `LeadFunnelStatus`.
  - [x] Garantir estrita conformidade de tipos sem o uso de `any` ou type casts inseguros.

- [x] - **Etapa 2: Utilitários de Normalização e Sanitização**
  - [x] Criar `src/utils/phone-normalizer.ts` para higienizar números brasileiros, detectar DDD, celular e gerar link de WhatsApp.
  - [x] Criar `src/utils/url-normalizer.ts` para higienizar URLs e adicionar protocolo padrão.
  - [x] Criar `src/utils/metrics-calculator.ts` para calcular métricas de qualidade da lista (taxa com WhatsApp, taxa sem site, etc.).

- [x] - **Etapa 3: Parser Determinístico de Arquivos CSV**
  - [x] Integrar `papaparse` para leitura RFC 4180 de baixo nível (aspas, auto-detecção de delimitadores, remoção de BOM e quebras de linha).
  - [x] Criar `src/utils/csv-parser.ts` com mapeador determinístico de colunas identificando aliases em português e inglês para os campos do lead.
  - [x] Implementar detecção heurística de possível pessoa física (LGPD) e deduplicação de registros em memória.
  - [x] Estruturar `parseCsvFileToLeads(file: File): Promise<Lead[]>` com fallback de encoding (UTF-8 e Windows-1252) e tratamento contextualizado de erros.

- [x] - **Etapa 4: Gerenciamento de Estado dos Leads em Memória**
  - [x] Criar hook `src/hooks/use-leads.ts` ou estado compartilhado para gerenciar:
    - [x] Lista de leads atual (`Lead[]`).
    - [x] Métricas calculadas (`ListQualityMetrics`).
    - [x] Lead selecionado para exibição no Dialog (`selectedLead: Lead | null`).
    - [x] Estados de carregamento e erros de importação.
    - [x] Ações: `importFiles`, `clearLeads`, `selectLead`.

- [x] - **Etapa 5: Componente de Métricas e Resumo da Lista**
  - [x] Criar `src/components/lead-metrics.tsx` no padrão shadcn (cards compactos ou badges informativos com total de leads, % WhatsApp e % sem site).
  - [x] Seguir as convenções (função nomeada, kebab-case, parâmetros sem abreviação).

- [x] - **Etapa 6: Componente de Tabela de Leads**
  - [x] Criar `src/components/lead-table.tsx` integrando `src/components/ui/table.tsx`.
  - [x] Exibir cabeçalhos e linhas formatadas (Nome, Categoria, Telefone/WhatsApp, Site, Ações).
  - [x] Adicionar botão de ação por linha para selecionar o lead e abrir o modal de detalhes.

- [x] - **Etapa 7: Modal de Detalhes do Lead**
  - [x] Criar `src/components/lead-details-dialog.tsx` integrando `src/components/ui/dialog.tsx`.
  - [x] Exibir detalhes cadastrais, botões de ação (WhatsApp, Telefone, Site) e visualizador de colunas brutas do CSV (`rawData`).

- [x] - **Etapa 8: Integração no Fluxo Principal da Aplicação**
  - [x] Atualizar `src/components/home-main.tsx` para alternar entre o `FileUpload` e a visão de leads (métricas + tabela + diálogo).
  - [x] Adicionar ações de retorno para carregar mais arquivos ou limpar a lista atual.
  - [x] Fornecer feedback visual em caso de erro na importação do arquivo.

- [ ] - **Etapa 9: Preparação para Etapas Futuras (Filtros, Dexie e IA)**
  - [ ] Documentar a interface para os filtros de busca (texto, sem site, com WhatsApp) que serão acoplados à tabela.
  - [ ] Manter os tipos do `Lead` compatíveis com o futuro esquema de armazenamento do Dexie (`IndexedDB`).
  - [ ] Deixar contrato de entrada/saída preparado para o futuro conversor/diagnóstico de IA.
