# Liga Replay FUT7 — Especificação do site

Data: 2026-10-23 · Status: em revisão

## 1. Objetivo

Site oficial da Liga Replay FUT7 (@ligareplay) com tabela, jogos, súmula digital, estatísticas, perfis de jogadores, gestão de temporadas e pagamento de convidados. Substitui o site atual (Lovable). Público principal acessa pelo celular. Idioma: português.

**Sucesso:** o mesário lança a súmula pelo celular durante o jogo e, ao encerrar, classificação e estatísticas já estão atualizadas para o público, sem trabalho manual extra.

## 2. Decisões tomadas

| Tema | Decisão |
|---|---|
| Tecnologia | React + Vite + TypeScript + Tailwind, Firebase (Auth, Firestore, Storage, Functions, Hosting) |
| Login | Somente conta Google |
| Domínio | `ligareplay.web.app` (grátis); domínio próprio pode ser adicionado depois |
| Pagamento | Mercado Pago (Pix + cartão via Checkout Pro). Construído em modo teste; ativado quando existir o CNPJ da liga |
| Súmula | Um mesário por campo (perfil próprio) |
| Convidados — quem paga | O capitão, numa única cobrança por rodada com todos os convidados do time |
| Convidados — limite e prazo | Configuráveis por temporada (padrão: 2 por jogo; sexta 23h59) |
| Convidados — vínculo | Joga por um único time na temporada; jogador inscrito num time não pode ser convidado em outro |
| Taxa do convidado | Configurável por temporada (padrão R$ 35) |
| Formato do mata-mata | Configurável por temporada (padrão abaixo) |
| Menores de idade | Permitidos, com consentimento do responsável |
| Migração | Fase 4, a partir de planilha |
| Código | GitHub `theoamorim/liga-replay` |

## 3. Regras esportivas (padrão da temporada)

- 12 times, 3 grupos de 4, turno único dentro do grupo. Sábados 9h–11h, Campo 1 e Campo 2.
- Vitória 3, empate 1, derrota 0.
- Desempate: pontos → confronto direto → saldo de gols → gols pró → menos gols sofridos → sorteio.
  - Confronto direto com 3+ times empatados: mini-tabela só com os jogos entre eles (pontos).
  - Ranking de 3º e de 4º (times de grupos diferentes): sem confronto direto; usa os demais critérios na ordem.
- **Classificação para as quartas (8 vagas):**
  - 1º e 2º de cada grupo: direto (6).
  - Melhor 3º colocado (ranking dos 3º): direto (7).
  - Repescagem: os outros dois 3º + os dois melhores 4º (ranking dos 4º). Semifinal e final; o vencedor é a 8ª vaga.
  - Pior 4º: eliminado.
- Quartas por sorteio, depois semifinal e final.
- Mata-mata empatado: pênaltis (registrados na súmula, não contam como gols nas estatísticas).
- Formatos são "modelos" escolhidos na criação da temporada; o admin pode ajustar vagas e chaveamento manualmente.

## 4. Perfis de acesso

| Perfil | Pode |
|---|---|
| Público (sem login) | Ver tudo que é público |
| Jogador | Editar o próprio perfil, ver os próprios dados privados |
| Capitão | Tudo do jogador + escalar convidados do seu time até o prazo, pagar, ver pagamentos do time |
| Mesário | Lançar súmula apenas nos jogos atribuídos a ele, enquanto o jogo está aberto |
| Admin | Tudo |

Papéis ficam em *custom claims* do Firebase Auth (definidos pelo admin via Function), não editáveis pelo navegador.

## 5. Arquitetura

- **Front-end:** SPA React instalável (PWA). Tema escuro, destaque cobre/bronze, títulos em serifada (Playfair Display), texto em sans (Inter).
- **Firestore** (`southamerica-east1`): dados.
- **Storage:** escudos e fotos (redimensionadas no navegador antes do envio).
- **Cloud Functions** (Node 20, TypeScript):
  - `onMatchEventWrite` / `onMatchClose`: recalcula placar, classificação e estatísticas agregadas.
  - `generateSchedule`: gera tabela da fase de grupos.
  - `drawKnockout`: sorteio/chaveamento do mata-mata.
  - `setUserRole`: admin atribui papéis.
  - `createGuestPayment` / `mercadoPagoWebhook`: cria cobrança e confirma pagamento.
  - `closeGuestWindow` (agendada): no prazo, cancela convidados não pagos.
- **Hosting:** publica o site. Deploy automático pelo GitHub Actions a cada atualização da branch principal.
- **Desenvolvimento:** Firebase Emulator Suite (Firebase simulado), sem depender do projeto real.

## 6. Modelo de dados (Firestore)

```
users/{uid}
  nome, email, fotoUrl, playerId?, criadoEm
  (papéis em custom claims: admin, mesario, capitaoDe[])

players/{playerId}                      # público
  nome, apelido, fotoUrl, posicao, instagram?, menor:boolean, criadoEm

players/{playerId}/private/dados        # só admin e o próprio jogador
  telefone, documento, dataNascimento,
  consentimento: {versaoTermos, aceitoEm},
  responsavel?: {nome, telefone, documento, consentimentoEm}

teams/{teamId}                          # permanente
  nome, slug, escudoUrl, cores: {primaria, secundaria}

seasons/{seasonId}
  nome, ano, status: rascunho|grupos|mata-mata|encerrada,
  config: {
    pontos: {vitoria, empate, derrota}, desempate: [...],
    formatoMataMata: "padrao-12-times", 
    convidados: {limitePorJogo, prazo: {diaSemana, hora}, taxa}
  }

seasons/{s}/entries/{teamId}            # time na temporada
  grupo, capitaoUid, contato

seasons/{s}/rosters/{playerId}          # vínculo jogador↔time na temporada
  teamId, numero, tipo: inscrito|convidado

matches/{matchId}
  seasonId, fase: grupos|repescagem-semi|repescagem-final|quartas|semi|final,
  rodada, grupo?, data, campo, mandanteId, visitanteId,
  placar: {mandante, visitante}, penaltis?,
  status: agendado|ao-vivo|encerrado, mesarioUid, mvpPlayerId?

matches/{id}/events/{eventId}
  tipo: gol|gol-contra|amarelo|vermelho, playerId, teamId,
  assistPlayerId?, minuto?, criadoPor, criadoEm

matches/{id}/lineups/{teamId}
  playerIds[], convidados[]

guestRequests/{id}
  seasonId, matchId, teamId, playerId, capitaoUid,
  status: pendente|pago|cancelado, paymentId?, criadoEm

payments/{id}
  seasonId, rodada, teamId, capitaoUid, itens: [guestRequestId],
  valor, gateway: mercadopago, gatewayId, metodo?: pix|cartao,
  status: pendente|pago|expirado|estornado, criadoEm, pagoEm?

# calculados pelas Functions (somente leitura no site)
seasons/{s}/standings/{teamId}          # J V E D GP GC SG Pts, grupo, posição
seasons/{s}/playerStats/{playerId}      # J G A G+A AM VM MVP, gols sofridos (goleiro)
playerCareer/{playerId}                 # totais e por temporada, times, médias, títulos
records/global                          # recordes da liga
awards/{id}                             # seasonId, tipo, playerId|teamId
```

Estatísticas são pré-calculadas para o site ler poucos documentos por visita (custo baixo).

## 7. Fluxos principais

**Súmula (mesário, celular):** abre o jogo atribuído → confirma escalações (convidados só aparecem se pagos) → botões grandes "Gol / Cartão / Gol contra" → escolhe jogador (e assistente) → ao final, escolhe MVP e encerra. Function recalcula tudo. Admin pode reabrir e corrigir.

**Convidados (capitão):** escolhe a rodada → busca jogador existente ou cadastra novo (marcado convidado) → sistema valida limite, prazo e vínculo de time → gera uma cobrança com todos os convidados → paga por Pix (QR code) ou cartão → webhook confirma → convidados liberados. Após o prazo, pendentes são cancelados.

**Temporada (admin):** cria temporada e config → inscreve times nos grupos → gera tabela → acompanha → ao fim dos grupos, sistema calcula classificados e repescagem → sorteio das quartas → encerra temporada e registra prêmios.

## 8. Páginas

Públicas: Início, Jogos (por rodada; súmula ao clicar), Classificação, Mata-mata, Estatísticas, Times, Time (elenco), Jogador (perfil e carreira), Recordes, Temporadas anteriores, Política de privacidade.
Logado: Meu perfil; Capitão: Convidados e Pagamentos; Mesário: Meus jogos / Súmula; Admin: Temporadas, Times, Jogadores, Jogos, Usuários e papéis, Financeiro.

## 9. Segurança e LGPD

- Regras do Firestore/Storage negam por padrão; cada coleção libera só o perfil descrito na seção 4.
- Dados calculados, placares, pagamentos e papéis: escrita apenas pelas Functions.
- Mesário: escreve em `events` só se `mesarioUid == uid` e `status == ao-vivo`.
- Capitão: cria `guestRequests` só do seu time e antes do prazo (validado também na Function).
- Webhook do Mercado Pago: validação de assinatura; status sempre consultado na API do MP antes de marcar pago.
- LGPD: coleta mínima; aceite de termos e política no 1º acesso; dados sensíveis em subcoleção privada; documento mascarado nas telas; menores sem data de nascimento pública e com consentimento do responsável; pedido de exclusão anonimiza o perfil ("Jogador removido") mantendo estatísticas agregadas.
- Chaves do Mercado Pago ficam em segredos das Functions, nunca no site.

## 10. Testes

- Funções puras (classificação, desempate, ranking de 3º/4º, chaveamento, estatísticas) com testes unitários (Vitest).
- Regras de segurança testadas no emulador.
- Fluxo de pagamento testado com contas de teste do Mercado Pago.

## 11. Fases

| Fase | Entrega |
|---|---|
| 0 | Projeto, repositório, emuladores, visual base |
| 1 (MVP) | Login, perfis, temporadas, times, jogadores, tabela, súmula do mesário, classificação e estatísticas automáticas, mata-mata (montagem pelo admin), painel admin, publicação no Firebase |
| 2 | Capitães e convidados, pagamento Mercado Pago (teste → produção com CNPJ), painel financeiro |
| 3 | Carreira completa, rankings de todos os tempos, prêmios, goleiro menos vazado, confronto direto, sequências, recordes, sorteio automático |
| 4 | Importação da planilha, arquivo de temporadas, ajustes |

## 12. Custos estimados

- Firebase (plano Blaze, exigido pelas Functions): R$ 0–10/mês neste volume; alerta de orçamento em R$ 20.
- Mercado Pago: só taxa por transação (~0,99% Pix; cartão conforme prazo — confirmar tabela vigente).
- Domínio: R$ 0.

## 13. Fora do escopo (por ora)

App nativo nas lojas, transmissão ao vivo, notificações push, login por SMS, emissão de nota fiscal.
