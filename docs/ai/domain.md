# Hidden Leads — Proposta e Regras do Produto

## 1. Visão Geral

**Hidden Leads** é uma ferramenta gratuita, open source e _local-first_ para organizar, higienizar, qualificar e gerenciar leads de negócios locais. O usuário importa suas próprias listas de dados (via CSV, XML, etc.), o sistema converte e padroniza tudo para JSON salvando diretamente no banco de dados do navegador (IndexedDB) e permite filtrar, gerenciar o funil de contato e, opcionalmente, usar Inteligência Artificial (Gemini, OpenAI ou Anthropic) para diagnosticar cada negócio.

- **Problema:** Prospectar clientes locais (para freelancers, agências e representantes) costuma envolver planilhas despadronizadas, dados duplicados, telefones mal formatados e um trabalho manual lento para descobrir se cada empresa ainda está ativa, como ela vende e se possui presença digital.
- **Solução:** Um fluxo direto no navegador, sem necessidade de conta, servidor ou custo fixo. O usuário sobe o arquivo bruto, a ferramenta padroniza os contatos automaticamente, organiza em uma lista inteligente com filtros e aplica diagnósticos via IA sob demanda.

### Proposta de Valor

- **Gratuito de verdade no modo base:** Sem cadastro, sem cartão e sem mensalidade.
- **Privacidade por padrão (_Local-first_):** Todos os arquivos importados, leads e anotações ficam salvos exclusivamente no dispositivo do usuário (IndexedDB).
- **Inteligência Artificial opcional (BYOK — _Bring Your Own Key_):** O usuário conecta sua própria chave de API (Gemini, OpenAI ou Anthropic) apenas se quiser enriquecer e diagnosticar os leads, pagando somente o que consumir direto no provedor.

---

## 2. Público-Alvo

- **Freelancers e agências de marketing/web:** Vendem sites, gestão de tráfego e redes sociais para negócios locais e precisam filtrar rapidamente empresas sem site ou com presença digital fraca dentro de listas brutas.
- **Vendedores e representantes B2B:** Precisam de listas limpas com telefones e links rápidos de WhatsApp para prospecção diária.
- **Prestadores de serviço autônomos (contadores, consultores, designers):** Buscam organizar e qualificar potenciais clientes da sua região.

---

## 3. Objetivos, Não-Objetivos e Princípios

### Objetivos

- Permitir que o usuário transforme um arquivo bruto (CSV, XML, etc.) em uma lista de prospecção limpa e acionável em poucos cliques.
- Manter custo operacional zero (sem servidor intermediário).
- Permitir qualificar, anotar, mudar status e exportar os leads escolhidos sem sair da ferramenta.
- Garantir que o uso de IA seja sempre opcional (_opt-in_), exibindo estimativa de custo antes de qualquer execução.

### Não-Objetivos

- Não ter contas de usuário, sincronização em nuvem ou cobrança de assinatura.
- Não consumir APIs externas de mapas ou buscadores de locais.
- Não realizar disparos de mensagens em massa (WhatsApp ou e-mail).
- Não ser um CRM complexo — o foco é ser um qualificador e funil simples de prospecção.

### Princípios

1. **Custo zero primeiro:** O núcleo do app funciona 100% sem chaves pagas.
2. **Local-first:** Os dados pertencem ao usuário e não saem do navegador dele.
3. **Transparência sobre os dados:** Deixar claro o motivo da pontuação de cada lead e tratar as respostas da IA como indícios, nunca como verdades absolutas.
4. **Opcional é opcional:** Nenhuma função essencial de organização ou filtro depende de chave de IA.

---

## 4. Jornada do Usuário

1. **Importação:** O usuário abre o aplicativo (sem login) e envia um ou mais arquivos de dados (CSV, XML, etc.).
2. **Conversão e Padronização:** O sistema lê o arquivo, converte a estrutura para JSON, limpa duplicatas, padroniza os telefones e salva no IndexedDB.
3. **Exploração e Filtro:** O usuário visualiza os leads, aplica filtros rápidos (ex.: "Sem site", "Com WhatsApp") e ordena pelos mais relevantes.
4. **Qualificação e Abordagem:** O usuário abre os detalhes de um lead, adiciona notas, altera o status no funil e aciona o contato direto (WhatsApp, ligação ou site).
5. **Diagnóstico com IA (Opcional):** Caso tenha configurado uma chave do Gemini, OpenAI ou Anthropic, solicita um diagnóstico do lead (individualmente ou em lote) para entender o cenário do negócio antes de abordar.
6. **Exportação:** Exporta sua lista qualificada e anotada em CSV ou JSON quando quiser.

---

## 5. Regras de Negócio e Funcionamento

### 5.1. Entrada, Conversão e Armazenamento (IndexedDB)

- **Recebimento de arquivos:** O sistema aceita arquivos estruturados (CSV, XML, JSON) enviados pelo usuário.
- **Conversão para JSON:** Todo arquivo importado é convertido internamente para um formato JSON único e padronizado antes de ser salvo no IndexedDB.
- **Deduplicação:** Na importação, registros repetidos são identificados (por combinação de nome, telefone ou documento/identificador) para evitar leads duplicados na base.
- **Padronização de telefones:** Os números de telefone são normalizados para o padrão brasileiro por padrão, identificando automaticamente números de celular para gerar o link direto de WhatsApp.
- **Indicador de qualidade da lista:** Após importar, o sistema exibe o total de leads carregados e o percentual de registros que possuem telefone, WhatsApp e site preenchidos.

### 5.2. Listagem, Filtros e Pontuação (Score)

- **Filtros rápidos:** O usuário pode filtrar a lista por: tem telefone, tem WhatsApp (celular), tem site, **não tem site** e busca por texto (nome ou categoria).
- **Pontuação transparente (Score):** Cada lead recebe uma pontuação de relevância baseada nos dados que possui (ex.: pontos extras por ter celular/WhatsApp e pontos extras por _não_ ter site, caso o usuário venda presença digital).
- **Explicação do Score:** O sistema sempre informa de forma clara por que o lead recebeu aquela nota, permitindo trocar o perfil de pontuação conforme o objetivo da prospecção.
- **Seleção em lote:** O usuário pode selecionar múltiplos leads de uma vez para salvar nos favoritos, alterar status, excluir ou enviar para análise da IA.

### 5.3. Gestão de Leads e Funil Local

- **Status do funil:** Cada lead pode ser classificado em uma etapa simples: _Novo, Contatado, Respondeu, Proposta, Fechado_ ou _Descartado_.
- **Organização pessoal:** É possível adicionar notas de texto livre, tags personalizadas e marcar leads como favoritos.
- **Ações rápidas de contato:** Dentro do lead, o usuário pode abrir conversa no WhatsApp (usando um modelo de mensagem editável), iniciar ligação, abrir o site ou copiar os dados com um clique.
- **Exportação e Backup:** O usuário pode exportar seus leads filtrados ou salvos em CSV e JSON, além de poder importar um backup JSON anterior.

### 5.4. Integração com IA (Gemini, OpenAI e Anthropic)

- **Uso de chave própria (BYOK):** O usuário cadastra sua chave de API do Google Gemini, OpenAI ou Anthropic nas configurações, escolhe o modelo desejado e testa a conexão.
- **Escopo do diagnóstico:** Ao acionar a IA em um lead, ela responde a três perguntas centrais:

1. O negócio parece estar em funcionamento (ativo, possivelmente inativo, inativo ou indeterminado)?
2. Por quais canais ele vende ou atende?
3. Existem reclamações públicas ou pontos de atenção?

- **Resumo e oportunidades:** Além das três respostas, a IA gera um resumo executivo curto e aponta oportunidades comerciais com base nos dados do lead.
- **Busca na web:** Quando o provedor suportar busca nativa na web, a IA consulta dados públicos atuais; quando não suportar, o sistema avisa que a análise será restrita apenas aos dados importados no arquivo.
- **Indícios e confiabilidade:** O resultado da IA nunca é exibido como veredito definitivo, mas sim como **indícios**, acompanhado do nível de confiança (_baixa, média ou alta_) e dos links das fontes consultadas.
- **Controle de custos em lote:** Antes de analisar vários leads de uma vez, o sistema apresenta uma estimativa de tokens e custo para confirmação do usuário, permitindo cancelar a fila a qualquer momento.
- **Histórico de diagnóstico:** As análises feitas pela IA ficam salvas no IndexedDB vinculadas ao lead (com a data e o modelo utilizado), podendo ser refeitas ou apagadas.

### 5.5. Privacidade, Segurança e Conformidade (LGPD)

- **Zero coleta externa:** Nenhum dado importado pelo usuário é enviado para servidores próprios do projeto; tudo permanece no navegador. As informações de um lead só são enviadas para o provedor de IA (Gemini, OpenAI ou Anthropic) no momento exato em que o usuário solicita um diagnóstico.
- **Proteção das chaves de API:** As chaves dos provedores de IA ficam guardadas apenas no armazenamento local do usuário, com opção de proteção por senha, e podem ser removidas a qualquer instante.
- **Identificação de Pessoa Física:** Caso um registro importado pareça ser de uma pessoa física (ex.: nome próprio sem relação comercial aparente), o sistema exibe um selo de aviso ("Possível pessoa física") para atenção à LGPD, sem ocultar o item da lista.
- **Exclusão total:** O usuário tem um botão de "Apagar todos os meus dados" que limpa completamente o IndexedDB e as configurações locais mediante confirmação.
- **Aviso de uso responsável:** Na primeira vez que abre o app, o usuário vê um aviso claro sobre boas práticas de prospecção, respeito ao _opt-out_ e responsabilidade sobre os dados importados.
