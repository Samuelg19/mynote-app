# MyNote

MyNote e uma aplicacao web, PWA e app Android via Capacitor para organizar rotinas, tarefas, lembretes, eventos de calendario, anotacoes e notificacoes. O projeto foi desenvolvido como um app de produtividade pessoal simples, visual e rapido de usar, com foco em criar compromissos, registrar informacoes importantes e receber avisos sem precisar passar muito tempo dentro da aplicacao.

O sistema possui frontend em HTML, CSS e JavaScript puro, backend em Node.js com Express, banco MySQL, autenticacao por JWT, login com Google, suporte a notificacoes push para desktop/mobile e empacotamento Android com APK release assinado.

## Visao geral

- Gerenciamento de rotinas personalizadas.
- Modelos prontos para diferentes tipos de rotina.
- Tarefas com horario, status, notificacao, alarme e conclusao.
- Lembretes independentes com prioridade, data, horario, notificacao e alarme.
- Calendario mensal e anual com eventos, feriados e datas comemorativas.
- Anotacoes com categorias, editor rico, anexos e links.
- Interface adaptada para computador e celular.
- Instalacao como app mobile via PWA.
- App Android via Capacitor com splash screen personalizada e alarmes nativos.
- Tutorial inicial e personalizacao no primeiro acesso.
- Configuracoes de tema, notificacoes, privacidade, backup e produtividade.

## Funcionalidades

### Autenticacao e conta

- Login com Google.
- Login Google no site e no app Android, com suporte ao fluxo nativo do Google no Capacitor.
- Login com e-mail e senha.
- Cadastro de novos usuarios.
- Recuperacao de senha por e-mail.
- Autenticacao com JWT.
- Dados separados por usuario.
- Protecao de rotas no backend.
- Validacao de token Google no backend com client IDs permitidos para web/app.

### Dashboard

- Tela principal com lista de rotinas.
- Layout responsivo para desktop e mobile.
- No mobile, as abas abrem em tela cheia conforme o usuario toca em cada item.
- Botao de voltar nas abas mobile para retornar a lista de rotinas.
- Botao flutuante para acessar rapidamente o calendario e criar novos itens.
- Animacoes leves em botoes, cards, transicoes e conclusao de tarefas.
- Cache de rotinas/tarefas e controle de carregamento para reduzir atraso ao trocar de rotina.
- Bloqueio de duplo envio ao criar tarefas e lembretes, evitando registros duplicados em redes lentas.

### Rotinas

- Criacao de rotinas personalizadas.
- Edicao e exclusao de rotinas.
- Reordenacao de rotinas por arrastar e soltar.
- Notas individuais por rotina, salvas mesmo apos sair do site.
- Menu de tres pontos para acoes rapidas.
- Personalizacao dos campos das tabelas de rotina.
- Carregamento otimizado das tarefas da rotina selecionada.

### Anotacoes

- Area de anotacoes separada das tarefas e lembretes.
- Criacao, edicao e exclusao de categorias de anotacao.
- Modal de categoria com visual atualizado, emojis predefinidos e campo de emoji personalizado.
- Contagem de anotacoes exibida abaixo do titulo da categoria.
- Editor rico com negrito, italico, sublinhado, listas, checklist, alinhamento, tamanhos e links.
- Suporte a imagens inseridas no conteudo da anotacao.
- Anexos em anotacoes, incluindo imagens, links e arquivos permitidos.
- Limites de quantidade e tamanho para anexos, evitando crescimento descontrolado do banco.
- Sanitizacao de HTML no backend para bloquear scripts, executaveis, SVG e atributos perigosos.
- Conteudo antigo continua abrindo normalmente e passa a ser tratado como HTML limpo quando editado.

### Modelos de rotina

O MyNote possui modelos prontos para acelerar a criacao:

- Diaria: tarefas simples por horario.
- Estudos: provas, atividades, disciplina, horario e material.
- Trabalho: projetos, prioridade, prazo e status.
- Alimentacao: refeicoes, horario, calorias e notificacao.
- Semanal: quadro por dias da semana.
- Treino: cards por dia com grupo muscular, series, repeticoes e carga.
- Personalizada: tabela livre com os campos escolhidos pelo usuario.

### Tarefas

- Criacao, edicao e exclusao de tarefas.
- Status de tarefa: pendente e concluida.
- Marcacao de tarefa concluida com animacao visual.
- Ao desmarcar uma tarefa concluida, ela volta para pendente.
- Notificacoes por tarefa.
- Alarme por tarefa, configuravel no modal de criacao e no menu de frequencia.
- Controle de antecedencia do aviso.
- Repeticao ou prazo, dependendo do tipo de tarefa.
- Tarefas concluidas antes do horario nao disparam aviso nem alarme.
- Organizacao por rotina, horario, status, prioridade e campos especificos.

### Rotina semanal

- Visualizacao em colunas por dia da semana.
- Contador de tarefas concluidas por dia.
- Cards compactos para nao prejudicar o espaco no mobile.
- Edicao rapida pelo botao de lapis.
- Conclusao com animacao leve.
- Notas da rotina abaixo do quadro semanal.

### Rotina de treino

- Cards de exercicio por dia da semana.
- Informacoes de grupo muscular, series, repeticoes, carga e status.
- Botao visual de conclusao do treino.
- Marcacao concluida com animacao.
- Botao de descanso por dia.
- Layout ajustado para mobile para evitar sobreposicao entre cards e botoes.

### Lembretes

- Criacao de lembretes com titulo, horario, dia/mes e prioridade.
- Edicao e exclusao de lembretes.
- Notificacao por lembrete.
- Alarme por lembrete, configuravel no modal.
- Suporte a lembretes com data especifica ou recorrentes.
- Menu de acoes adaptado para desktop e mobile.

### Calendario

- Calendario mensal com eventos, tarefas e lembretes.
- Visualizacao anual com todos os meses.
- Navegacao entre meses e anos.
- Eventos com titulo, horario, data, prioridade e tipo.
- Eventos de aniversario configurados como permanentes.
- Feriados e datas comemorativas exibidos no calendario.
- Ajustes de layout mobile para ocupar melhor a largura da tela.
- Eventos com antecedencia de aviso.
- Para eventos com horario, o aviso antecipado e uma notificacao e o horario exato pode disparar alarme.

### Notificacoes e alarmes

- Notificacoes no navegador.
- Push notifications via Service Worker.
- Cadastro de inscricao push no backend.
- Scheduler no backend para verificar tarefas, lembretes e eventos.
- Opcao global para comportamento de notificacao/alarme.
- Opcao individual de alarme em tarefas e lembretes.
- Controle de antecedencia do aviso.
- Acoes na notificacao para tarefas, como "Vou fazer" e "Ja fiz".
- A acao "Ja fiz" conclui a tarefa automaticamente.
- Notificacoes duplicadas sao reduzidas por identificadores de tarefa/lembrete.
- Som de alarme personalizado em arquivo local.
- No site/PWA, os avisos aparecem como notificacoes e pop-ups na tela, com acoes para concluir ou manter pendente.
- No Android, o app usa alarme nativo para tarefas/lembretes configurados com alarme.
- Quando o celular esta bloqueado ou inativo, o alarme pode abrir uma tela propria do app.
- Quando o celular esta em uso, o alarme aparece como notificacao de alta prioridade com som e acoes.
- O som/vibracao do alarme foi ajustado para durar cerca de 30 segundos.
- Acoes nativas do alarme permitem concluir ou manter a tarefa/lembrete sem abrir o app.

Observacao: por limitacao dos navegadores/PWA, a tela de alarme completa fica restrita ao app Android. No site, o comportamento esperado e notificacao, som e pop-up dentro da propria pagina.

### App mobile e PWA

- Manifest configurado para instalacao como app.
- Icones 192x192 e 512x512.
- Service Worker com cache dos arquivos principais.
- Tela inicial em modo standalone.
- Interface mobile com navegacao por abas.
- Calendario, lembretes, configuracoes e rotinas adaptados para celular.
- App Android gerado com Capacitor.
- APK release assinado para instalacao direta fora da Play Store.
- Splash screen Android com fundo creme alinhado ao visual da marca.
- Login Google nativo no Android via plugin SocialLogin.
- Sincronizacao dos assets web para o app Android com `npx cap sync android`.

### Tutorial inicial

- Modal de boas-vindas para novos usuarios.
- Primeiros passos do dashboard.
- Etapa extra explicando:
  - menu de tres pontos;
  - notas das rotinas;
  - area de anotacoes, categorias, editor rico e anexos;
  - configuracoes do site;
  - notificacoes e alarmes;
  - arrastar e segurar rotinas no celular para trocar a ordem.
- Fluxo para pular tutorial ou seguir para personalizacao.

### Personalizacao e configuracoes

- Personalizacao inicial do dashboard.
- Tema claro e escuro.
- Paletas de fundo.
- Cor de destaque.
- Tamanho da fonte.
- Configuracoes de notificacoes.
- Troca do som das notificacoes/alarmes.
- Preferencias de produtividade.
- Privacidade.
- Backup e restauracao de dados.
- Backup e restauracao incluindo rotinas, tarefas, lembretes, eventos, categorias e anotacoes.
- Exportacao de estatisticas em PDF ou Excel.

### Sincronizacao de dados

- Rotinas, tarefas, lembretes, eventos, anotacoes, categorias e configuracoes sao salvos no backend.
- O mesmo usuario pode acessar pelo computador ou celular.
- As alteracoes feitas em um dispositivo sao persistidas no banco e podem aparecer no outro ao atualizar/recarregar os dados.
- O app evita recarregamentos pesados desnecessarios ao alternar entre rotinas, mantendo cache local controlado por invalidacao.

## Tecnologias

### Frontend

- HTML5
- CSS3
- JavaScript
- PWA
- Service Worker
- Web Notifications API
- Push API
- Quill 2.0.3 para editor rico de anotacoes
- DOMPurify 3.4.10 para sanitizacao de HTML

### Backend

- Node.js
- Express
- MySQL
- JWT
- Google Auth
- Nodemailer
- node-cron
- web-push
- Sanitizacao e normalizacao de anexos de anotacoes

### Banco e infraestrutura

- MySQL
- Variaveis de ambiente com dotenv
- Deploy frontend em hospedagem estatica
- Deploy backend como API Node.js
- Capacitor 8 para empacotar o frontend como app Android
- @capgo/capacitor-social-login para login Google nativo no Android

## Screenshots

### Login

![Login](frontend/assets/screenshots/login.png)

### Customizacao inicial

![Customizacao inicial](frontend/assets/screenshots/customizacao.png)

### Dashboard

![Dashboard](frontend/assets/screenshots/dashboard.png)

### Criar rotina

![Criar rotina](frontend/assets/screenshots/criar-rotina.png)

### Rotina diaria

![Rotina diaria](frontend/assets/screenshots/rotina-diaria.png)

### Rotina treino

![Rotina treino](frontend/assets/screenshots/rotina-treino.png)

### Rotina semanal

![Rotina semanal](frontend/assets/screenshots/rotina-semanal.png)

### Configuracoes

![Configuracoes](frontend/assets/screenshots/configuracoes.png)

### App mobile

O MyNote tambem pode ser usado como app instalado no celular. No mobile, a tela inicial mostra as rotinas e cada aba abre em tela cheia, com botao de voltar para retornar ao inicio.

| Rotinas | Calendario | Lembretes |
|---|---|---|
| <img src="frontend/assets/screenshots/mobile-rotinas.png" width="220" alt="Tela inicial mobile com rotinas"> | <img src="frontend/assets/screenshots/mobile-calendario.png" width="220" alt="Calendario mobile"> | <img src="frontend/assets/screenshots/mobile-lembretes.png" width="220" alt="Lembretes mobile"> |

| Nova tarefa | Criar rotina | Frequencia |
|---|---|---|
| <img src="frontend/assets/screenshots/mobile-nova-tarefa.png" width="220" alt="Modal mobile de nova tarefa"> | <img src="frontend/assets/screenshots/mobile-criar-rotina.png" width="220" alt="Modal mobile de criar rotina"> | <img src="frontend/assets/screenshots/mobile-frequencia.png" width="220" alt="Modal mobile de frequencia"> |

## Estrutura do projeto

```txt
MyNote-app/
|-- android/
|   |-- app/
|   |   |-- build.gradle
|   |   |-- src/main/
|   |   |   |-- assets/public/
|   |   |   |-- java/com/mynotes/app/
|   |   |   |   |-- MainActivity.java
|   |   |   |   |-- AlarmActivity.java
|   |   |   |   |-- TaskAlarmPlugin.java
|   |   |   |   |-- TaskAlarmReceiver.java
|   |   |   |   |-- TaskAlarmSoundService.java
|   |   |   |   |-- TaskAlarmScheduler.java
|   |   |   |   |-- TaskAlarmStore.java
|   |   |   |   |-- TaskAlarmActionReceiver.java
|   |   |   |   |-- TaskAlarmBootReceiver.java
|   |   |   |   |-- TaskCompletionService.java
|   |   |   |   `-- DeviceSoundPlugin.java
|   |   |   `-- res/
|   |-- build.gradle
|   |-- gradlew
|   `-- gradlew.bat
|
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- anotacaoController.js
|   |   |-- authController.js
|   |   |-- configuracaoController.js
|   |   |-- eventoCalendarioController.js
|   |   |-- lembreteController.js
|   |   |-- pushController.js
|   |   |-- rotinaController.js
|   |   `-- tarefaController.js
|   |-- middlewares/
|   |   `-- authMiddleware.js
|   |-- routes/
|   |   |-- anotacaoRoutes.js
|   |   |-- authRoutes.js
|   |   |-- configuracaoRoutes.js
|   |   |-- eventoCalendarioRoutes.js
|   |   |-- lembreteRoutes.js
|   |   |-- pushRoutes.js
|   |   |-- rotinaRoutes.js
|   |   `-- tarefaRoutes.js
|   |-- services/
|   |   |-- notificacaoScheduler.js
|   |   `-- pushService.js
|   |-- utils/
|   |-- package.json
|   |-- testPush.js
|   `-- server.js
|
|-- frontend/
|   |-- assets/
|   |   |-- screenshots/
|   |   |-- alarme-calmo.wav
|   |   |-- alarme-digital.wav
|   |   |-- alarme-suave.wav
|   |   |-- notificacao.wav
|   |   |-- icon-192.png
|   |   |-- icon-512.png
|   |   |-- favicon.png
|   |   `-- logo.png
|   |-- css/
|   |   |-- base/
|   |   |-- components/
|   |   |-- features/
|   |   |   `-- anotacoes.css
|   |   |-- pages/
|   |   |-- responsive/
|   |   `-- style.css
|   |-- js/
|   |   |-- api.js
|   |   |-- anotacoes.js
|   |   |-- app-preferences.js
|   |   |-- cadastro.js
|   |   |-- configuracoes.js
|   |   |-- dashboard.js
|   |   |-- esqueci.js
|   |   |-- login.js
|   |   |-- reset.js
|   |   `-- script.js
|   |-- cadastro.html
|   |-- configuracoes.html
|   |-- dashboard.html
|   |-- esqueci.html
|   |-- index.html
|   |-- manifest.json
|   |-- reset.html
|   |-- vendor/
|   |   |-- dompurify/
|   |   `-- quill/
|   `-- service-worker.js
|
|-- package.json
|-- package-lock.json
|-- .gitignore
`-- README.md
```

## Arquitetura

### Frontend

O frontend e responsavel por:

- renderizar o dashboard;
- controlar modais de rotina, tarefa, lembrete, calendario e anotacoes;
- aplicar preferencias visuais do usuario;
- registrar o Service Worker;
- solicitar permissao de notificacao;
- cadastrar a inscricao push no backend;
- consumir a API protegida com JWT.

### Backend

O backend e responsavel por:

- autenticar usuarios;
- proteger rotas;
- salvar dados por usuario;
- gerenciar rotinas, tarefas, lembretes, eventos, anotacoes, categorias e configuracoes;
- armazenar inscricoes push;
- executar o scheduler de notificacoes;
- enviar notificacoes push usando VAPID.

## Rotas principais da API

```txt
/auth
/anotacoes
/rotinas
/tarefas
/lembretes
/configuracoes
/eventos-calendario
/push
```

## Variaveis de ambiente

O backend usa variaveis sensiveis em `.env`.

```env
PORT=3000

DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=

EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=

VAPID_EMAIL=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
cd backend
npm install
```

### 2. Configurar o backend

Crie o arquivo `backend/.env` com as variaveis necessarias para banco, JWT, Google Auth, e-mail e VAPID.

### 3. Iniciar o backend

```bash
cd backend
npm run dev
```

ou:

```bash
cd backend
npm start
```

### 4. Abrir o frontend

Abra o `frontend/index.html` ou sirva a pasta `frontend` com um servidor estatico local.

Exemplo:

```bash
npx serve frontend
```

## Como gerar o APK Android

O app Android e gerado com Capacitor a partir da pasta `frontend`.

### APK debug

```powershell
cd MyNote-app
npx cap sync android
cd android
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\gradlew.bat :app:assembleDebug
```

Arquivo gerado:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

### APK release assinado

Para gerar APK release assinado, o projeto usa `android/keystore.properties` localmente. Esse arquivo contem senha/chave e nao deve ser enviado para o GitHub.

```powershell
cd MyNote-app
npx cap sync android
cd android
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\gradlew.bat :app:assembleRelease
```

Arquivo gerado:

```txt
android/app/build/outputs/apk/release/app-release.apk
```

Para atualizar um app ja instalado por APK, gere um novo release com o mesmo `applicationId` e a mesma chave de assinatura. A cada nova versao, aumente o `versionCode` em `android/app/build.gradle`.

Para instalar via ADB:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "android\app\build\outputs\apk\release\app-release.apk"
```

Para compartilhar fora da Play Store, envie o `app-release.apk` por Drive, OneDrive, WhatsApp, Telegram ou outro servico de arquivos. No Android, pode ser necessario permitir "instalar apps desconhecidos" para o navegador ou app usado no download.

## Publicacao das atualizacoes

- Alteracoes do site/frontend precisam ser enviadas para a hospedagem estatica usada pelo projeto.
- Alteracoes do backend precisam ser publicadas no Railway ou servico equivalente.
- Quando o deploy estiver ligado ao GitHub, depois do commit e necessario executar `git push` para disparar a publicacao.
- Alteracoes dentro do app Android so chegam ao celular depois de gerar e instalar um novo APK.

## O que ainda pode ser adicionado

- Sincronizacao em tempo real com WebSocket ou Server-Sent Events.
- Modo offline mais completo com fila de sincronizacao.
- Historico de conclusoes por tarefa.
- Estatisticas avancadas por rotina, semana e mes.
- Filtros e busca global.
- Tags ou categorias extras.
- Subtarefas.
- Importacao e exportacao de calendario no formato `.ics`.
- Compartilhamento de rotinas entre usuarios.
- Anexos tambem em tarefas e lembretes.
- Widgets para tela inicial do celular.
- Pomodoro ou temporizador de foco.
- Testes automatizados no frontend e backend.
- Documentacao da API com OpenAPI/Swagger.
- Pipeline de CI/CD.
- Logs e monitoramento de erros em producao.

## Status do projeto

Projeto em evolucao ativa. As principais bases do app ja estao implementadas: autenticacao, login Google, rotinas, tarefas, calendario, lembretes, anotacoes com editor rico, configuracoes, PWA, app Android via Capacitor, notificacoes push, alarmes nativos e responsividade mobile.
