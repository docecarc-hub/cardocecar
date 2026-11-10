# Car Doce Car - Agendamentos

App de agendamentos da Car Doce Car em React (Vite) com **Firebase** (Firestore + Authentication).
Cada agendamento tem **cliente, carro, serviço, observações (opcional), data, horário e valor**; só é salvo com tudo preenchido (exceto observações).
Permite **adicionar**, **editar**, **excluir**, **favoritar**, **filtrar favoritos** e **marcar o serviço como realizado**, com os dados
**sincronizados em tempo real** entre celulares e computadores.

## 1. Configurar o Firebase (uma vez só)

1. Em https://console.firebase.google.com, crie um projeto.
2. Na página inicial do projeto, clique em **Web `</>`**, registre o app e copie o `firebaseConfig`.
3. **Criação > Firestore Database > Criar banco de dados** (região `southamerica-east1`, modo de produção).
4. **Criação > Authentication > Primeiros passos > E-mail/senha**: ativar.
5. Em Authentication > **Usuários > Adicionar usuário**: crie seu e-mail e senha (é o login do app).
6. Em Firestore > **Regras**: cole o conteúdo de `firestore.rules` e publique.

## 2. Configurar o projeto

Requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
```

Abra o `.env` e preencha com os valores do `firebaseConfig`. Depois:

```bash
npm run dev
```

Abra http://localhost:5000 e entre com o e-mail e a senha criados no passo 1.5.

## 3. Publicar para usar no celular (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # escolha o seu projeto
npm run build
firebase deploy
```

O Firebase mostra o link final (`https://SEU-PROJETO.web.app`). No iPhone, abra no Safari e use
**Compartilhar > Adicionar à Tela de Início**. Entre com o mesmo e-mail e senha em todos os aparelhos.

Se publicar em outro serviço (Netlify, Vercel...), cadastre as variáveis `VITE_FIREBASE_*` no painel dele
e adicione o domínio em Authentication > Configurações > **Domínios autorizados**.

## 4. Cargos e logins (Administrativo, Vendedor, Operacional)

| Ação | Administrativo | Vendedor | Operacional |
|---|:--:|:--:|:--:|
| Ver agendamentos/orçamentos | ✅ | ✅ | ✅ |
| Lançar novo | ✅ | ✅ | ❌ |
| Editar cliente, carro, serviço, obs., data e horário | ✅ | ✅ | ❌ |
| Informar o valor ao lançar | ✅ | ✅ | ❌ |
| Alterar o valor depois | ✅ | ❌ | ❌ |
| Excluir, marcar como realizado, favoritar | ✅ | ❌ | ❌ |
| Administrar os logins da unidade | ✅ | ❌ | ❌ |

As permissões ficam em `src/utils/permissions.js` (o que aparece na tela) e em `firestore.rules`
(o que o banco realmente aceita). Se mudar uma, mude a outra.

### Ativar (uma vez só)

1. Publique as regras: `firebase deploy --only firestore:rules` (ou cole `firestore.rules` em Firestore > Regras).
2. **Primeiro administrador** (você, que já tem login): entre no app. Vai aparecer "Acesso não configurado" com um código (UID).
   No Firebase: Firestore Database > **Iniciar coleção** `users` (ou abra a coleção `users`) > **Adicionar documento**,
   com **ID do documento = esse código** e os campos:
   - `name` (string): seu nome
   - `email` (string): seu e-mail
   - `role` (string): `admin`
   - `unitId` (string): **o mesmo código (UID)**
   - `active` (boolean): `true`

   Seus agendamentos atuais continuam onde estão e aparecem normalmente.
3. Recarregue o app: aparece o botão **Usuários**. Por ali o Administrativo cria logins (nome, e-mail, senha e cargo),
   troca o cargo, envia e-mail de redefinição de senha e desativa/reativa logins da própria unidade.

Observações:
- Desativar bloqueia o acesso na hora, mas a conta continua existindo no Authentication (o navegador não consegue apagar contas de outras pessoas).
- Para criar uma **nova unidade**, crie o login do administrador dela em Authentication e repita o passo 2 com o UID dele.

## Estrutura

- `src/firebase.js` – inicialização do Firebase (Auth + Firestore com cache offline).
- `src/utils/appointment.js` – validação dos campos obrigatórios e formatação de valor (R$).
- `src/services/appointments.js` – salvar, listar em tempo real, editar e excluir.
- `src/components/Login` – tela de login.
- `src/components/Appointments` – formulário, filtro e lista.
- `src/utils/permissions.js` – tabela de cargos e permissões.
- `src/services/users.js` – perfis e logins da unidade (criar, cargo, ativar/desativar).
- `src/components/UsersAdmin` – tela do Administrativo para gerenciar logins.
- `src/components/AccessScreen` – avisos de acesso não configurado/desativado.
- `src/components/AppointmentItem` – cartão de cada agendamento, com edição inline e exportação para agenda.
- `firestore.rules` / `firebase.json` – regras de segurança e configuração de deploy.

## Se o `npm install` falhar

1. Confira `node -v` (precisa ser 18+).
2. Apague `node_modules` e `package-lock.json` e rode `npm install` de novo.
3. Limpe o cache: `npm cache clean --force`.
4. Em rede com proxy, configure o proxy do npm ou tente outra rede.
