# Como publicar o site da Liga Replay

Guia para o dono da liga. Siga na ordem e faça tudo logado com **laligareplay@gmail.com**.

## 1. Firebase: ativar os serviços

No [console do Firebase](https://console.firebase.google.com), abra o projeto `liga-replay`. Use **Todos os produtos** (ou a lupa) para achar cada serviço.

1. **Authentication** → **Vamos começar** → aba **Método de login** → **Google** → ative → e-mail de suporte `laligareplay@gmail.com` → **Salvar**.
2. **Firestore Database** → **Criar banco de dados** → edição **Standard** → local **southamerica-east1 (São Paulo)** → **Iniciar no modo de produção** → **Criar**.
3. **Plano Blaze** (necessário para as funções automáticas): no canto inferior esquerdo, **Fazer upgrade** → **Blaze** → cadastre o cartão.
   - Em seguida crie um alerta: **Configurar alerta de orçamento** → valor **R$ 20**.
   - Com o volume da liga, a conta esperada é de R$ 0 a R$ 10/mês.
4. **Storage** → **Vamos começar** → **Iniciar no modo de produção** → local padrão → **Concluído**.

## 2. Registrar o site e copiar as chaves públicas

1. Engrenagem ⚙️ → **Configurações do projeto** → **Seus apps** → ícone **`</>`**.
2. Apelido `site`, marque **Também configurar o Firebase Hosting** → **Registrar app**.
3. Copie os valores de `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

## 3. Conta de serviço (permite o GitHub publicar sozinho)

1. Engrenagem ⚙️ → **Configurações do projeto** → aba **Contas de serviço** → **Gerar nova chave privada** → **Gerar chave**. Um arquivo `.json` será baixado.
2. **Guarde esse arquivo com cuidado e não mande para ninguém.** Ele funciona como uma senha.
3. Abra o [IAM do Google Cloud](https://console.cloud.google.com/iam-admin/iam) com o projeto `liga-replay` selecionado. Na linha da conta que termina em `firebase-adminsdk-...`, clique no lápis e adicione estes papéis:
   - **Administrador do Cloud Functions**
   - **Usuário da conta de serviço**
   - **Administrador do Firebase**
   - **Administrador do Artifact Registry**
   - **Administrador do Cloud Scheduler**

   Depois clique em **Salvar**.

## 4. GitHub: cadastrar as chaves

No repositório `theoamorim/liga-replay`: **Settings** → **Secrets and variables** → **Actions**.

**Aba Secrets** → **New repository secret**:

| Name | Valor |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | o conteúdo inteiro do arquivo `.json` do passo 3 |

**Aba Variables** → **New repository variable**, uma para cada linha:

| Name | Valor (do passo 2) |
|---|---|
| `FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_API_KEY` | apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `VITE_FIREBASE_APP_ID` | appId |

## 5. Publicar

Toda alteração aprovada na branch `main` publica o site sozinha.

- **Primeira vez:** abra a aba **Actions** → **Publicar site** → **Run workflow**. Leva cerca de 5 minutos.
- **Endereço:** `https://<projectId>.web.app`.

## 6. Primeiro acesso

1. Abra o site → **Entrar** → entre com `laligareplay@gmail.com`. Essa conta vira admin automaticamente. Se o painel não aparecer, saia e entre de novo.
2. Em **Minha conta** → **Administração**, siga esta ordem:
   1. Times
   2. Temporada: grupos, regras e **Tornar temporada atual**
   3. Jogadores (com vínculo ao time)
   4. **Gerar tabela**
3. Os mesários entram uma vez com a conta Google deles. Depois disso, em **Usuários e papéis**, marque **Mesário** e atribua os jogos em **Jogos**.

## Para testar sem mexer no site oficial

```bash
npm install
npm run dev:demo   # sobe o Firebase simulado com dados de exemplo em http://127.0.0.1:5000
```

Logins de teste:
- `admin@teste.com` / `senha123`
- `mesario@teste.com` / `senha123`
