// Usuário autenticado
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const token = localStorage.getItem("token");

if (!usuario || !token) {
  alert(MyNotePrefs.t("Você precisa fazer login primeiro."));
  window.location.href = "login.html";
  throw new Error("Usuário não autenticado.");
}

function headersAuth() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Elementos da tela
const temaEscuro = document.getElementById("temaEscuro");
const corDestaque = document.getElementById("corDestaque");
const btnSalvarConfiguracoes = document.getElementById(
  "btnSalvarConfiguracoes",
);
const btnVoltarDashboard = document.getElementById("btnVoltarDashboard");
const idioma = document.getElementById("idioma");
const fusoHorario = document.getElementById("fusoHorario");
const formatoHora = document.getElementById("formatoHora");
const inicioSemana = document.getElementById("inicioSemana");
const notificacoesGerais = document.getElementById("notificacoesGerais");
const notificacoesNavegador = document.getElementById("notificacoesNavegador");
const notificacoesPorRotina = document.getElementById("notificacoesPorRotina");
const antecedenciaLembrete = document.getElementById("antecedenciaLembrete");
const somNotificacao = document.getElementById("somNotificacao");
const resumoDiario = document.getElementById("resumoDiario");
const tamanhoFonte = document.getElementById("tamanhoFonte");
const ordenacaoTarefas = document.getElementById("ordenacaoTarefas");
const mostrarColunas = document.getElementById("mostrarColunas");
const backupAutomatico = document.getElementById("backupAutomatico");
const modoFoco = document.getElementById("modoFoco");
const somNotificacaoArquivo = document.getElementById("somNotificacaoArquivo");
const nomeSomNotificacao = document.getElementById("nomeSomNotificacao");
const testarSomNotificacao = document.getElementById("testarSomNotificacao");
const limparSomNotificacao = document.getElementById("limparSomNotificacao");
const btnLogoutConta = document.getElementById("btnLogoutConta");
const btnAlterarSenha = document.getElementById("btnAlterarSenha");
const btnExcluirConta = document.getElementById("btnExcluirConta");
const btnExportarPDF = document.getElementById("btnExportarPDF");
const btnExportarExcel = document.getElementById("btnExportarExcel");
const btnSincronizarBackup = document.getElementById("btnSincronizarBackup");
const btnRestaurarBackup = document.getElementById("btnRestaurarBackup");
const inputRestaurarBackup = document.getElementById("inputRestaurarBackup");

//tema de fundo (bolinhas)
const opcoesFundo = document.querySelectorAll(".cor-opcao");

let temaFundoSelecionado = "creme";
let preferenciasGerais = MyNotePrefs.loadLocal();

function chaveSomNotificacaoUsuario() {
  return `somNotificacaoPersonalizado_${usuario.id}`;
}

function chaveNomeSomNotificacaoUsuario() {
  return `nomeSomNotificacaoPersonalizado_${usuario.id}`;
}

function chavePadroesNotificacaoUsuario() {
  return `padroesNotificacaoHora24Aplicados_${usuario.id}`;
}

function aplicarPadroesIniciais(config = {}) {
  if (localStorage.getItem(chavePadroesNotificacaoUsuario()) === "true") {
    return { config, alterado: false };
  }

  const configComPadroes = {
    ...config,
    formato_hora: "24",
    notificacoes_gerais: true,
    notificacoes_navegador: true,
    notificacoes_por_rotina: true,
    som_notificacao: true,
    resumo_diario: true,
  };

  localStorage.setItem(chavePadroesNotificacaoUsuario(), "true");
  return { config: configComPadroes, alterado: true };
}

function obterSomNotificacaoConfigurado() {
  return (
    localStorage.getItem(chaveSomNotificacaoUsuario()) || "notificacao.mp3"
  );
}

function atualizarNomeSomNotificacao() {
  if (!nomeSomNotificacao) return;
  nomeSomNotificacao.textContent =
    localStorage.getItem(chaveNomeSomNotificacaoUsuario()) ||
    MyNotePrefs.t("Som padrão");
}

function valorConfigAtivo(valor, padrao = true) {
  if (valor === undefined || valor === null || valor === "") return padrao;
  return valor !== false && valor !== 0 && valor !== "0";
}

function tocarSomNotificacaoConfigurado() {
  if (!somNotificacao.checked) return;
  const audio = new Audio(obterSomNotificacaoConfigurado());
  audio
    .play()
    .catch((erro) => console.warn("Não foi possível tocar o som:", erro));
}

function aplicarTema(tema) {
  const escuro = tema === "escuro";
  document.body.classList.toggle("tema-escuro", escuro);
  document.body.classList.toggle("tema-claro", !escuro);

  if (escuro) {
    document.body.removeAttribute("data-fundo");
  } else {
    aplicarFundo(temaFundoSelecionado || "creme");
  }
}

function aplicarFundo(fundo) {
  if (temaEscuro?.checked) return;
  document.body.setAttribute("data-fundo", fundo);
}

function aplicarCorDestaque(cor) {
  let valor = "#a855f7";

  switch ((cor || "").toLowerCase()) {
    case "azul":
      valor = "#3b82f6";
      break;
    case "verde":
      valor = "#22c55e";
      break;
    case "vermelho":
      valor = "#ef4444";
      break;
    case "laranja":
      valor = "#f97316";
      break;
    case "rosa":
      valor = "#ec4899";
      break;
    case "ciano":
      valor = "#06b6d4";
      break;
    case "amarelo":
      valor = "#eab308";
      break;
    case "roxo":
    default:
      valor = "#a855f7";
  }

  document.documentElement.style.setProperty("--accent", valor);
}

function aplicarCamposGerais(config) {
  preferenciasGerais = MyNotePrefs.saveLocal(config);
  MyNotePrefs.applySelectLabels(document);

  idioma.value = preferenciasGerais.idioma;
  fusoHorario.value = preferenciasGerais.fuso_horario;
  formatoHora.value = preferenciasGerais.formato_hora;
  inicioSemana.value = preferenciasGerais.inicio_semana || "monday";

  MyNotePrefs.translateDOM(document);
}

function montarPayloadConfiguracoes() {
  const preferenciasParaSalvar = MyNotePrefs.saveLocal({
    ...preferenciasGerais,
    idioma: idioma.value,
    fuso_horario: fusoHorario.value,
    formato_hora: formatoHora.value,
    inicio_semana: inicioSemana.value || "monday",
  });

  return {
    tema: temaEscuro.checked ? "escuro" : "claro",
    tema_fundo: temaFundoSelecionado,
    idioma: preferenciasParaSalvar.idioma,
    fuso_horario: preferenciasParaSalvar.fuso_horario,
    formato_hora: preferenciasParaSalvar.formato_hora,
    inicio_semana: preferenciasParaSalvar.inicio_semana,
    notificacoes_gerais: notificacoesGerais.checked,
    notificacoes_navegador: notificacoesNavegador.checked,
    notificacoes_por_rotina: notificacoesPorRotina.checked,
    antecedencia_lembrete: antecedenciaLembrete.value,
    som_notificacao: somNotificacao.checked,
    resumo_diario: resumoDiario.checked,
    cor_destaque: corDestaque.value,
    tamanho_fonte: tamanhoFonte.value,
    ordenacao_tarefas: ordenacaoTarefas.value,
    mostrar_colunas: mostrarColunas.checked,
    backup_automatico: backupAutomatico.checked,
    modo_foco: modoFoco.checked,
  };
}

opcoesFundo.forEach((btn) => {
  btn.addEventListener("click", () => {
    opcoesFundo.forEach((opcao) => opcao.classList.remove("ativa"));
    btn.classList.add("ativa");

    temaFundoSelecionado = btn.dataset.fundo;
    aplicarFundo(temaFundoSelecionado);
  });
});

async function carregarConfiguracoes() {
  try {
    const res = await fetch("http://localhost:3000/configuracoes", {
  headers: headersAuth(),
});
    const respostaConfig = await res.json();
    const migracaoPadroes = aplicarPadroesIniciais(respostaConfig);
    const config = MyNotePrefs.normalize(migracaoPadroes.config);

    aplicarCamposGerais(config);

    temaEscuro.checked = config.tema === "escuro";
    corDestaque.value = config.cor_destaque || "roxo";
    temaFundoSelecionado = config.tema_fundo || "creme";

    aplicarTema(config.tema);
    if (config.tema !== "escuro") aplicarFundo(temaFundoSelecionado);
    aplicarCorDestaque(config.cor_destaque);

    notificacoesGerais.checked = valorConfigAtivo(config.notificacoes_gerais);
    notificacoesNavegador.checked = valorConfigAtivo(
      config.notificacoes_navegador,
    );
    notificacoesPorRotina.checked = valorConfigAtivo(
      config.notificacoes_por_rotina,
    );
    antecedenciaLembrete.value =
      config.antecedencia_lembrete || "15 minutos antes";
    somNotificacao.checked = valorConfigAtivo(config.som_notificacao);
    resumoDiario.checked = valorConfigAtivo(config.resumo_diario);
    tamanhoFonte.value = config.tamanho_fonte || "Médio";
    ordenacaoTarefas.value = config.ordenacao_tarefas || "Por horário";
    mostrarColunas.checked = config.mostrar_colunas !== false;
    backupAutomatico.checked = !!config.backup_automatico;
    modoFoco.checked = !!config.modo_foco;
    atualizarNomeSomNotificacao();

    opcoesFundo.forEach((btn) => {
      btn.classList.toggle("ativa", btn.dataset.fundo === temaFundoSelecionado);
    });

    if (migracaoPadroes.alterado) {
      await fetch("http://localhost:3000/configuracoes", {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify(montarPayloadConfiguracoes()),
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar configurações:", erro);
    aplicarCamposGerais(preferenciasGerais);
  }
}

async function salvarConfiguracoes() {
  try {
    const payload = montarPayloadConfiguracoes();
    MyNotePrefs.translateDOM(document);

    const resposta = await fetch("http://localhost:3000/configuracoes", {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify(payload),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || MyNotePrefs.t("Erro ao salvar configurações."));
      return;
    }

    alert(MyNotePrefs.t("Configurações salvas com sucesso!"));
  } catch (erro) {
    console.error("Erro ao salvar configurações:", erro);
    alert(MyNotePrefs.t("Erro ao salvar configurações."));
  }
}

btnSalvarConfiguracoes.addEventListener("click", salvarConfiguracoes);

temaEscuro.addEventListener("change", () => {
  aplicarTema(temaEscuro.checked ? "escuro" : "claro");
});

corDestaque.addEventListener("change", () => {
  aplicarCorDestaque(corDestaque.value);
});

somNotificacaoArquivo?.addEventListener("change", () => {
  const arquivo = somNotificacaoArquivo.files?.[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = () => {
    localStorage.setItem(chaveSomNotificacaoUsuario(), leitor.result);
    localStorage.setItem(chaveNomeSomNotificacaoUsuario(), arquivo.name);
    atualizarNomeSomNotificacao();
  };
  leitor.readAsDataURL(arquivo);
});

testarSomNotificacao?.addEventListener("click", tocarSomNotificacaoConfigurado);

limparSomNotificacao?.addEventListener("click", () => {
  localStorage.removeItem(chaveSomNotificacaoUsuario());
  localStorage.removeItem(chaveNomeSomNotificacaoUsuario());
  if (somNotificacaoArquivo) somNotificacaoArquivo.value = "";
  atualizarNomeSomNotificacao();
});

[idioma, fusoHorario, formatoHora, inicioSemana].forEach((select) => {
  select.addEventListener("change", () => {
    aplicarCamposGerais({
      ...preferenciasGerais,
      idioma: idioma.value,
      fuso_horario: fusoHorario.value,
      formato_hora: formatoHora.value,
      inicio_semana: inicioSemana.value || "monday",
    });
  });
});

btnVoltarDashboard.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

btnLogoutConta?.addEventListener("click", () => {
  localStorage.clear();
window.location.href = "login.html";
});

btnAlterarSenha?.addEventListener("click", async () => {
  const senhaAtual = prompt("Digite sua senha atual:");
  if (!senhaAtual) return;

  const novaSenha = prompt("Digite a nova senha:");
  if (!novaSenha) return;

  if (novaSenha.length < 6) {
    alert("A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/auth/alterar-senha", {
  method: "PUT",
  headers: headersAuth(),
  body: JSON.stringify({
    senhaAtual,
    novaSenha,
  }),
});

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || "Erro ao alterar senha.");
      return;
    }

    alert("Senha alterada com sucesso!");
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);
    alert("Não foi possível alterar a senha.");
  }
});

btnExcluirConta?.addEventListener("click", async () => {
  const confirmar = confirm(
    "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
  );

  if (!confirmar) return;

  try {
    const resposta = await fetch("http://localhost:3000/auth/excluir-conta", {
      method: "DELETE",
      headers: headersAuth(),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || "Erro ao excluir conta.");
      return;
    }

    // Limpar tudo do usuário
    localStorage.clear();

    alert("Conta excluída com sucesso!");

    window.location.href = "login.html";
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    alert("Não foi possível excluir a conta.");
  }
});

btnExportarPDF?.addEventListener("click", async () => {
  try {
    const respostaRotinas = await fetch(
      `http://localhost:3000/rotinas`,
      {
        headers: headersAuth(),
      },
    );
    const rotinas = await respostaRotinas.json();

    let html = `
      <html>
      <head>
        <title>Rotinas - MyNote</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #111827;
          }

          h1 {
            text-align: center;
            margin-bottom: 8px;
          }

          .subtitulo {
            text-align: center;
            color: #6b7280;
            margin-bottom: 32px;
          }

          .rotina {
            margin-bottom: 32px;
            page-break-inside: avoid;
          }

          h2 {
            border-bottom: 2px solid #111827;
            padding-bottom: 6px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 13px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }
        </style>
      </head>
      <body>
        <h1>Minhas Rotinas</h1>
        <p class="subtitulo">Exportado pelo MyNote</p>
    `;

    for (const rotina of rotinas) {
      const respostaTarefas = await fetch(
        `http://localhost:3000/tarefas?rotina_id=${rotina.id}`,
        {
          headers: headersAuth(),
        },
      );
      const tarefas = await respostaTarefas.json();

      html += `
        <div class="rotina">
          <h2>${rotina.nome}</h2>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Prioridade</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (!tarefas.length) {
        html += `
          <tr>
            <td colspan="5">Nenhuma tarefa cadastrada.</td>
          </tr>
        `;
      } else {
        tarefas.forEach((tarefa) => {
          html += `
            <tr>
              <td>${tarefa.titulo || "-"}</td>
              <td>${tarefa.tipo || "-"}</td>
              <td>${tarefa.horario || "-"}</td>
              <td>${tarefa.status || "Pendente"}</td>
              <td>${tarefa.prioridade || "-"}</td>
            </tr>
          `;
        });
      }

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.print();
  } catch (erro) {
    console.error("Erro ao exportar PDF:", erro);
    alert("Não foi possível exportar o PDF.");
  }
});

btnExportarExcel?.addEventListener("click", async () => {
  try {
    const respostaRotinas = await fetch(
      `http://localhost:3000/rotinas`,
      {
        headers: headersAuth(),
      },
    );
    const rotinas = await respostaRotinas.json();

    let csv =
      "Rotina,Tarefa,Tipo,Status,Horário,Prioridade,Prazo,Data de criação\n";

    for (const rotina of rotinas) {
      const respostaTarefas = await fetch(
        `http://localhost:3000/tarefas?rotina_id=${rotina.id}`,
        {
          headers: headersAuth(),
        },
      );
      const tarefas = await respostaTarefas.json();

      tarefas.forEach((tarefa) => {
        csv +=
          [
            rotina.nome,
            tarefa.titulo || "",
            tarefa.tipo || "",
            tarefa.status || "",
            tarefa.horario || "",
            tarefa.prioridade || "",
            tarefa.prazo || "",
            tarefa.data_criacao || "",
          ]
            .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
            .join(",") + "\n";
      });
    }

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mynote_tarefas.csv";
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (erro) {
    console.error("Erro ao exportar Excel:", erro);
    alert("Não foi possível exportar o Excel.");
  }
});

btnSincronizarBackup?.addEventListener("click", async () => {
  try {
    const respostaRotinas = await fetch(
      `http://localhost:3000/rotinas`,
      {
        headers: headersAuth(),
      },
    );
    const rotinas = await respostaRotinas.json();

    const respostaLembretes = await fetch("http://localhost:3000/lembretes", {
  headers: headersAuth(),
});
    const lembretes = await respostaLembretes.json();

    const respostaConfig = await fetch("http://localhost:3000/configuracoes", {
  headers: headersAuth(),
});
    const configuracoes = await respostaConfig.json();

    const rotinasComTarefas = [];

    for (const rotina of rotinas) {
      const respostaTarefas = await fetch(
        `http://localhost:3000/tarefas?rotina_id=${rotina.id}`,
        {
          headers: headersAuth(),
        },
      );
      const tarefas = await respostaTarefas.json();

      rotinasComTarefas.push({
  ...rotina,
  tarefas,
});
    }

    const backup = {
      app: "MyNote",
      versao: "2.5.1",
      exportado_em: new Date().toISOString(),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      configuracoes,
      rotinas: rotinasComTarefas,
      lembretes,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mynote_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(link.href);

    alert("Backup gerado com sucesso!");
  } catch (erro) {
    console.error("Erro ao gerar backup:", erro);
    alert("Não foi possível gerar o backup.");
  }
});

btnRestaurarBackup?.addEventListener("click", () => {
  inputRestaurarBackup?.click();
});

inputRestaurarBackup?.addEventListener("change", () => {
  const arquivo = inputRestaurarBackup.files?.[0];
  if (!arquivo) return;

  const confirmar = confirm(
    "Restaurar backup vai substituir seus dados atuais. Deseja continuar?",
  );
  if (!confirmar) {
    inputRestaurarBackup.value = "";
    return;
  }

  const leitor = new FileReader();

  leitor.onload = async () => {
    try {
      const backup = JSON.parse(leitor.result);

      if (backup.app !== "MyNote" || !Array.isArray(backup.rotinas)) {
        alert("Arquivo de backup inválido.");
        return;
      }

      const resposta = await fetch(
        "http://localhost:3000/auth/restaurar-backup",
        {
          method: "POST",
          headers: headersAuth(),
body: JSON.stringify({
  backup,
}),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.msg || "Erro ao restaurar backup.");
        return;
      }

      alert("Backup restaurado com sucesso!");
      window.location.href = "dashboard.html";
    } catch (erro) {
      console.error("Erro ao restaurar backup:", erro);
      alert("Não foi possível restaurar o backup.");
    } finally {
      inputRestaurarBackup.value = "";
    }
  };

  leitor.readAsText(arquivo);
});

carregarConfiguracoes();
