//Usuário e proteção de login
const LOGIN_PAGE = "index.html";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const token = localStorage.getItem("token");
const CALORIAS_MAXIMAS = 5000;
const API_BASE_URL = "https://mynote-app-production-cb61.up.railway.app";
const VAPID_PUBLIC_KEY =
  "BMK8iAQvIYfGlMnVnz10kC7CjDCt-r8zHFIfAFgesUmjAfbRKd0PkEARkbwAy2-sFsT42xCedVkoVGsjGGENbGg";

if (!usuario || !token) {
  window.location.href = LOGIN_PAGE;
  throw new Error("Usuário não logado.");
}

//Elementos principais
const usuarioNome = document.getElementById("usuarioNome");
const tituloRotina = document.getElementById("tituloRotina");
const campoNotas = document.getElementById("campoNotas");

//Elementos da sidebar
const listaRotinas = document.getElementById("listaRotinas");
const btnConfiguracoes = document.getElementById("btnConfiguracoes");
const btnLembretes = document.getElementById("btnLembretes");
const btnLogout = document.getElementById("btnLogout");

//Seções principais
const secaoRotinas = document.getElementById("secaoRotinas");
const secaoLembretes = document.getElementById("secaoLembretes");
const btnVoltarMobile = document.getElementById("btnVoltarMobile");
const cardNotasRotina = document.getElementById("cardNotasRotina");
const consultaMobileDashboard = window.matchMedia("(max-width: 900px)");

//Elementos das rotinas
const modalRotina = document.getElementById("modalRotina");
const fecharModalRotina = document.getElementById("fecharModalRotina");
const cancelarRotina = document.getElementById("cancelarRotina");
const salvarRotina = document.getElementById("salvarRotina");
const nomeRotinaInput = document.getElementById("nomeRotinaInput");
const camposRotinaCheck = document.querySelectorAll(".campoRotinaCheck");
const btnNovaRotina = document.getElementById("btnNovaRotina");
const tipoEventoInput = document.getElementById("tipoEventoInput");
const btnHojeCalendario = document.getElementById("btnHojeCalendario");

function fixarAcoesDoCalendarioNaTela() {
  [btnHojeCalendario, btnAdicionarEventoCalendario].forEach((botao) => {
    if (!botao || botao.parentElement === document.body) return;
    document.body.appendChild(botao);
  });
}

const btnMenuRotina = document.getElementById("btnMenuRotina");
const btnMenuRotinaTreino = document.getElementById("btnMenuRotinaTreino");
const opcoesRotina = document.getElementById("opcoesRotina");
const btnExcluirRotina = document.getElementById("btnExcluirRotina");
const textoNotificacaoTarefa = document.getElementById(
  "textoNotificacaoTarefa",
);
const btnEditarTabela = document.getElementById("btnEditarTabela");
const modalEditarAlimentacao = document.getElementById(
  "modalEditarAlimentacao",
);
const fecharModalEditarAlimentacao = document.getElementById(
  "fecharModalEditarAlimentacao",
);
const cancelarEditarAlimentacao = document.getElementById(
  "cancelarEditarAlimentacao",
);
const salvarEditarAlimentacao = document.getElementById(
  "salvarEditarAlimentacao",
);

const editarAlimentoInput = document.getElementById("editarAlimentoInput");
const editarHorarioAlimentacaoInput = document.getElementById(
  "editarHorarioAlimentacaoInput",
);
const editarCaloriasInput = document.getElementById("editarCaloriasInput");

let alimentacaoEmEdicao = null;

let btnFrequenciaRotina = document.getElementById("btnFrequenciaRotina");

if (!btnFrequenciaRotina && opcoesRotina) {
  btnFrequenciaRotina = document.createElement("button");
  btnFrequenciaRotina.id = "btnFrequenciaRotina";
  btnFrequenciaRotina.className = "btn-frequencia-rotina";
  btnFrequenciaRotina.type = "button";
  btnFrequenciaRotina.textContent = "🔄 Frequência";

  if (btnExcluirRotina) {
    btnExcluirRotina.before(btnFrequenciaRotina);
  } else {
    opcoesRotina.appendChild(btnFrequenciaRotina);
  }
}

//Elementos das tarefas
const btnNovaTarefa = document.getElementById("btnNovaTarefa");
const modalTarefa = document.getElementById("modalTarefa");
const fecharModalTarefa = document.getElementById("fecharModalTarefa");
const cancelarTarefa = document.getElementById("cancelarTarefa");
const salvarTarefa = document.getElementById("salvarTarefa");
const tipoTarefaSelect = document.getElementById("tipoTarefaSelect");
const btnSilenciarRotina = document.getElementById("btnSilenciarRotina");

const tituloTarefaInput = document.getElementById("tituloTarefaInput");
const tipoTarefaInput = document.getElementById("tipoTarefaInput");
const disciplinaTarefaInput = document.getElementById("disciplinaTarefaInput");
const horarioTarefaInput = document.getElementById("horarioTarefaInput");
const notificacaoTarefaInput = document.getElementById(
  "notificacaoTarefaInput",
);
const alarmeTarefaInput = document.getElementById("alarmeTarefaInput");
const textoAlarmeTarefa = document.getElementById("textoAlarmeTarefa");
const linhaNotificacaoTarefa = document.getElementById(
  "linhaNotificacaoTarefa",
);
const linhaAlarmeTarefa = document.getElementById("linhaAlarmeTarefa");
let statusTarefaSelect = null;

const labelTipoTarefa = document.getElementById("labelTipoTarefa");
const labelDisciplinaTarefa = document.getElementById("labelDisciplinaTarefa");
const labelHorarioTarefa = document.getElementById("labelHorarioTarefa");

const corpoTabelaTarefas = document.getElementById("corpoTabelaTarefas");
const tabelaTarefas = corpoTabelaTarefas.closest("table");
const tabelaCard = document.getElementById("cardTabelaTarefas");
const camposEstudos = document.getElementById("camposEstudos");
const camposTrabalho = document.getElementById("camposTrabalho");
const camposAlimentacao = document.getElementById("camposAlimentacao");

const linkMaterialInput = document.getElementById("linkMaterialInput");
const projetoInput = document.getElementById("projetoInput");
const prioridadeInput = document.getElementById("prioridadeInput");
const prazoInput = document.getElementById("prazoInput");
const caloriasInput = document.getElementById("caloriasInput");

const modalEditarCampo = document.getElementById("modalEditarCampo");
const tituloModalEditarCampo = document.getElementById(
  "tituloModalEditarCampo",
);
const labelEditarCampo = document.getElementById("labelEditarCampo");
const inputEditarCampo = document.getElementById("inputEditarCampo");
const fecharModalEditarCampo = document.getElementById(
  "fecharModalEditarCampo",
);
const cancelarEditarCampo = document.getElementById("cancelarEditarCampo");
const salvarEditarCampo = document.getElementById("salvarEditarCampo");

let edicaoCampoAtual = null;

let rotinaTemplateAtual = "diaria";
let emojiRotinaPersonalizadaInput = null;

//Elementos do treino
const areaTreino = document.getElementById("areaTreino");
const camposTreino = document.getElementById("camposTreino");
const diaSemanaInput = document.getElementById("diaSemanaInput");
const grupoMuscularInput = document.getElementById("grupoMuscularInput");
const seriesInput = document.getElementById("seriesInput");
const repeticoesInput = document.getElementById("repeticoesInput");
const cargaInput = document.getElementById("cargaInput");
const modalEditarTreino = document.getElementById("modalEditarTreino");
const fecharModalEditarTreino = document.getElementById(
  "fecharModalEditarTreino",
);
const cancelarEditarTreino = document.getElementById("cancelarEditarTreino");
const salvarEditarTreino = document.getElementById("salvarEditarTreino");

const editarSeriesInput = document.getElementById("editarSeriesInput");
const editarRepeticoesInput = document.getElementById("editarRepeticoesInput");
const editarCargaInput = document.getElementById("editarCargaInput");
const modalAviso = document.getElementById("modalAviso");
const tituloModalAviso = document.getElementById("tituloModalAviso");
const textoModalAviso = document.getElementById("textoModalAviso");
const fecharModalAviso = document.getElementById("fecharModalAviso");
const okModalAviso = document.getElementById("okModalAviso");
const campoRepeticaoSemanal = document.getElementById("campoRepeticaoSemanal");
const repeticaoSemanalInput = document.getElementById("repeticaoSemanalInput");

let treinoEmEdicao = null;

//Elementos dos lembretes
const btnNovoLembrete = document.getElementById("btnNovoLembrete");
const modalLembrete = document.getElementById("modalLembrete");
const fecharModalLembrete = document.getElementById("fecharModalLembrete");
const cancelarLembrete = document.getElementById("cancelarLembrete");
const salvarLembrete = document.getElementById("salvarLembrete");
const textoNotificacaoLembrete = document.getElementById(
  "textoNotificacaoLembrete",
);

const tituloLembreteInput = document.getElementById("tituloLembreteInput");
const horarioLembreteInput = document.getElementById("horarioLembreteInput");
const diaMesLembreteInput = document.getElementById("diaMesLembreteInput");
const prioridadeLembreteInput = document.getElementById(
  "prioridadeLembreteInput",
);
const notificacaoLembreteInput = document.getElementById(
  "notificacaoLembreteInput",
);
const alarmeLembreteInput = document.getElementById("alarmeLembreteInput");
const textoAlarmeLembrete = document.getElementById("textoAlarmeLembrete");
const corpoTabelaLembretes = document.getElementById("corpoTabelaLembretes");
const btnMenuLembretes = document.getElementById("btnMenuLembretes");
const opcoesLembretes = document.getElementById("opcoesLembretes");
const btnLimparLembretesConcluidos = document.getElementById(
  "btnLimparLembretesConcluidos",
);
const btnExcluirTodosLembretes = document.getElementById(
  "btnExcluirTodosLembretes",
);
const toastMensagem = document.getElementById("toastMensagem");
const aniversarioEventoInput = document.getElementById(
  "aniversarioEventoInput",
);
const btnModoAno = document.getElementById("btnModoAno");
const visaoAnualCalendario = document.getElementById("visaoAnualCalendario");
const mesesAnoCalendario = document.getElementById("mesesAnoCalendario");

if (!token) {
  window.location.href = LOGIN_PAGE;
}

let modoCalendario = "mes";

aniversarioEventoInput.addEventListener("change", () => {
  if (aniversarioEventoInput.checked) {
    tipoEventoInput.value = "permanente";
    tipoEventoInput.disabled = true;
    horarioEventoInput.value = "";
    horarioEventoInput.disabled = true;
  } else {
    tipoEventoInput.disabled = false;
    horarioEventoInput.disabled = false;
  }
});

function headersAuth() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function comTimeout(promessa, ms, rotulo = "operacao") {
  let timer = null;

  try {
    return await Promise.race([
      promessa,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Tempo esgotado em ${rotulo}.`)),
          ms,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchComRetry(url, opcoes = {}, tentativas = 2) {
  let ultimoErro = null;

  for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
    try {
      const resposta = await fetch(url, opcoes);

      if (resposta.ok || resposta.status < 500 || tentativa === tentativas - 1) {
        return resposta;
      }

      ultimoErro = new Error(`Resposta ${resposta.status}`);
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa === tentativas - 1) throw erro;
    }

    await aguardar(500 * (tentativa + 1));
  }

  throw ultimoErro || new Error("Falha ao buscar dados.");
}

async function lerListaJson(resposta, { exigirOk = false } = {}) {
  if (exigirOk && !resposta?.ok) {
    const dados = resposta ? await lerRespostaJsonSegura(resposta) : {};
    throw new Error(
      dados.detalhe ||
        dados.msg ||
        `Erro ${resposta?.status || ""} ao carregar dados.`,
    );
  }

  try {
    const dados = await lerRespostaJsonSegura(resposta);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

async function lerRespostaJsonSegura(resposta) {
  try {
    return await resposta.json();
  } catch {
    return {};
  }
}

async function atualizarTarefa(id, dados) {
  return fetch(`${API_BASE_URL}/tarefas/${id}`, {
    method: "PUT",
    headers: headersAuth(),
    body: JSON.stringify(dados),
  });
}

async function processarAcaoInicialNotificacao() {
  const params = new URLSearchParams(window.location.search);
  const acao = params.get("acao");

  if (acao !== "concluir-tarefa") return;

  const tarefaId = params.get("tarefaId");
  const rotinaId = params.get("rotinaId");

  window.history.replaceState({}, document.title, window.location.pathname);

  if (!tarefaId) return;

  try {
    const resposta = await atualizarTarefa(tarefaId, {
      concluida: true,
      status: "Concluida",
    });

    if (!resposta.ok) {
      mostrarAviso("erro", "Nao foi possivel concluir a tarefa pelo alarme.");
      return;
    }

    if (rotinaId) {
      invalidarCacheTarefas(rotinaId);
      if (String(rotinaSelecionadaId) === String(rotinaId)) {
        carregarTarefas(rotinaId, tituloRotina.textContent);
      }
    }

    mostrarAviso("sucesso", "Tarefa marcada como concluida!");
  } catch (erro) {
    console.error("Erro ao concluir tarefa pela notificacao:", erro);
    mostrarAviso("erro", "Nao foi possivel concluir a tarefa pelo alarme.");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = LOGIN_PAGE;
}

function checkConclusao(tarefa) {
  const concluida = !!tarefa.concluida;

  return `
    <button 
      class="check-tarefa" 
      type="button" 
      data-id="${tarefa.id}" 
      data-concluida="${concluida}"
      title="${concluida ? "Marcar como pendente" : "Concluir tarefa"}"
      aria-label="${concluida ? "Marcar tarefa como pendente" : "Concluir tarefa"}"
    >
      ${concluida ? "&#10003;" : ""}
    </button>
  `;
}

function dataHojeISO() {
  return MyNotePrefs.todayISO();
}

function obterDiaSemanaAtualConfigurado() {
  return new Date(`${dataHojeISO()}T12:00:00`).getDay();
}

function formatarHorarioSite(horario) {
  return MyNotePrefs.formatTime(horario);
}

function normalizarCalorias(valor) {
  if (valor === undefined || valor === null || valor === "") return "";

  const calorias = Number(valor);

  if (!Number.isFinite(calorias)) return null;
  if (calorias < 0 || calorias > CALORIAS_MAXIMAS) return null;

  return String(Math.round(calorias));
}

function validarCaloriasFormulario(valor) {
  const calorias = normalizarCalorias(valor);

  if (calorias === null) {
    mostrarAviso(
      "aviso",
      `Use um valor de calorias entre 0 e ${CALORIAS_MAXIMAS}.`,
    );
    return null;
  }

  return calorias;
}

function formatarCalorias(valor) {
  if (valor === undefined || valor === null || valor === "") return "-";

  const calorias = Number(valor);

  if (!Number.isFinite(calorias) || calorias < 0) return "-";
  if (calorias > CALORIAS_MAXIMAS) return `${CALORIAS_MAXIMAS}+ kcal`;

  return `${Math.round(calorias)} kcal`;
}

function obterDiasSemanaRotina(longo = false) {
  const nomes = longo
    ? MyNotePrefs.labels().weekdaysLong
    : MyNotePrefs.labels().weekdaysFull;
  const valores = [
    "Domingo",
    "Segunda",
    "Terca",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sabado",
  ];

  return MyNotePrefs.orderWeekValues([0, 1, 2, 3, 4, 5, 6]).map((indice) => ({
    valor: valores[indice],
    nome: nomes[indice],
  }));
}

function renderizarCabecalhoSemanaCalendario() {
  const cabecalho = document.querySelector(".calendario-semana");
  if (!cabecalho) return;

  cabecalho.innerHTML = MyNotePrefs.weekDays("weekdaysShort")
    .map((dia) => `<span>${dia.label}</span>`)
    .join("");
}

function obterInicioSemanaISO(data = new Date()) {
  const d = new Date(data);
  const diaSemana = d.getDay();
  const inicio = MyNotePrefs.weekStartIndex();
  const diferenca = (diaSemana - inicio + 7) % 7;

  d.setDate(d.getDate() - diferenca);
  d.setHours(0, 0, 0, 0);

  return MyNotePrefs.formatDateISO(d);
}

function deveResetarSemanal(tarefa) {
  const repeticao = (tarefa.repeticao || "").toLowerCase();

  if (!repeticao.includes("semanal")) return false;
  if (!tarefa.concluida && tarefa.status !== "Concluída") return false;

  const inicioSemanaAtual = obterInicioSemanaISO();
  const ultimaSemanaReset =
    tarefa.ultima_semana_reset || tarefa.data_criacao || "";

  return ultimaSemanaReset < inicioSemanaAtual;
}

function deveResetarDiaria(tarefa, tipoRotina, camposRotina) {
  const temStatus =
    !camposRotina.length ||
    camposRotina.includes("status") ||
    camposRotina.includes("titulo");

  if (!temStatus) return false;

  if (!tarefa.concluida && tarefa.status !== "Concluída") return false;

  if (tipoRotina === "semanal") return false;

  return true;
}

async function verificarResetTarefas() {
  const hoje = dataHojeISO();
  const chaveResetDiario = `resetDiarioTarefas_${usuario.id}`;
  const jaResetouHoje = localStorage.getItem(chaveResetDiario) === hoje;

  try {
    const rotinas = await buscarRotinas();
    const tarefasPorRotina = await Promise.all(
      rotinas.map(async (rotina) => ({
        rotina,
        tarefas: await buscarTarefasDaRotina(rotina.id),
      })),
    );
    const atualizacoes = [];

    for (const { rotina, tarefas } of tarefasPorRotina) {
      let camposRotina = [];

      try {
        camposRotina = JSON.parse(rotina.campos_config || "[]");
      } catch {
        camposRotina = [];
      }

      const tipoRotina = obterTipoRotina(rotina.nome, rotina);

      for (const tarefa of tarefas) {
        if (deveResetarSemanal(tarefa)) {
          atualizacoes.push(
            atualizarTarefa(tarefa.id, {
              concluida: false,
              status: "Pendente",
              ultima_semana_reset: obterInicioSemanaISO(),
            }),
          );
          continue;
        }

        if (
          !jaResetouHoje &&
          deveResetarDiaria(tarefa, tipoRotina, camposRotina)
        ) {
          atualizacoes.push(
            atualizarTarefa(tarefa.id, {
              concluida: false,
              status: "Pendente",
            }),
          );
        }
      }
    }

    if (atualizacoes.length) {
      await Promise.all(atualizacoes);
      tarefasPorRotina.forEach(({ rotina }) => invalidarCacheTarefas(rotina.id));
    }

    localStorage.setItem(chaveResetDiario, hoje);
  } catch (erro) {
    console.error("Erro ao verificar reset das tarefas:", erro);
  }
}

function ehAnoBissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

function diasNoMes(mes, ano) {
  if (mes === 1) {
    // fevereiro (0 = jan, 1 = fev...)
    return ehAnoBissexto(ano) ? 29 : 28;
  }

  return new Date(ano, mes + 1, 0).getDate();
}

function mostrarMensagem(texto) {
  toastMensagem.textContent = MyNotePrefs.t(texto);
  toastMensagem.classList.remove("hidden");

  setTimeout(() => {
    toastMensagem.classList.add("hidden");
  }, 2500);
}

//Variáveis globais
let rotinaSelecionadaId = null;
let rotinaSelecionadaNome = "";
let modoEdicaoTabela = false;
let eventoManualEmEdicao = null;
let lembreteCalendarioEmEdicao = null;

let antecedenciaNotificacao = 15;
let notificacoesPermitidas = false;
let preferenciasSite = MyNotePrefs.loadLocal();
let configuracoesNotificacao = {
  notificacoesGerais: true,
  notificacoesNavegador: true,
  notificacoesPorRotina: true,
  somNotificacao: true,
  apenasNotificarTarefas: false,
  resumoDiario: true,
  modoFoco: false,
};

let cacheTarefasPorRotina = {};
let cacheRotinas = null;
let cacheLembretes = null;
let eventosPorDataCalendario = new Map();
let verificacoesNotificacaoEmExecucao = false;
let sincronizacaoCompartilhadaEmExecucao = false;
let ultimaSincronizacaoCompartilhada = 0;
let recarregamentoRotinasPendente = null;
let tentativasRecarregarRotinas = 0;

function limparAgrupamentoEventosCalendario() {
  eventosPorDataCalendario = new Map();
}

function invalidarCacheTarefas(rotinaId = rotinaSelecionadaId) {
  if (rotinaId) {
    delete cacheTarefasPorRotina[rotinaId];
  }
  limparAgrupamentoEventosCalendario();
}

function invalidarCacheRotinas() {
  cacheRotinas = null;
  limparAgrupamentoEventosCalendario();
}

function invalidarCacheLembretes() {
  cacheLembretes = null;
  limparAgrupamentoEventosCalendario();
}

async function sincronizarDadosCompartilhados({ force = false } = {}) {
  if (document.hidden || sincronizacaoCompartilhadaEmExecucao) return;

  const agora = Date.now();
  if (!force && agora - ultimaSincronizacaoCompartilhada < 45000) return;

  sincronizacaoCompartilhadaEmExecucao = true;
  ultimaSincronizacaoCompartilhada = agora;

  try {
    await Promise.allSettled([
      comTimeout(carregarRotinas(), 8000, "sincronizar rotinas"),
      comTimeout(buscarLembretes({ force: true }), 8000, "sincronizar lembretes"),
      comTimeout(
        sincronizarEventosManuais({ force: true }),
        5000,
        "sincronizar calendario",
      ),
    ]);

    if (rotinaSelecionadaId) {
      const rotinasAtualizadas = await buscarRotinas();
      rotinaAtual =
        rotinasAtualizadas.find(
          (rotina) => String(rotina.id) === String(rotinaSelecionadaId),
        ) || rotinaAtual;
      const itemAtual = listaRotinas?.querySelector(
        `[data-id="${rotinaSelecionadaId}"]`,
      );
      if (itemAtual) ativarItemSidebar(itemAtual);

      invalidarCacheTarefas(rotinaSelecionadaId);
      await carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
    }

    if (modoCalendario === "ano") {
      renderizarVisaoAnual();
    } else if (!areaCalendario?.classList.contains("hidden")) {
      await renderizarCalendario();
      if (dataSelecionadaCalendario) mostrarEventosDoDia(dataSelecionadaCalendario);
    }
  } catch (erro) {
    console.warn("Nao foi possivel sincronizar dados compartilhados:", erro);
  } finally {
    sincronizacaoCompartilhadaEmExecucao = false;
  }
}

async function buscarRotinas({ force = false } = {}) {
  if (!force && Array.isArray(cacheRotinas)) {
    return cacheRotinas;
  }

  const resposta = await fetchComRetry(
    `${API_BASE_URL}/rotinas`,
    {
      headers: headersAuth(),
    },
    3,
  );
  cacheRotinas = await lerListaJson(resposta, { exigirOk: true });
  limparAgrupamentoEventosCalendario();
  return cacheRotinas;
}

async function buscarTarefasDaRotina(rotinaId, { force = false } = {}) {
  if (!force && cacheTarefasPorRotina[rotinaId]) {
    return cacheTarefasPorRotina[rotinaId];
  }

  const resposta = await fetch(`${API_BASE_URL}/tarefas?rotina_id=${rotinaId}`, {
    headers: headersAuth(),
  });
  const tarefas = ordenarTarefasPorPreferencia(
    await lerListaJson(resposta),
    preferenciasSite?.ordenacao_tarefas,
  );

  cacheTarefasPorRotina[rotinaId] = tarefas;
  return tarefas;
}

async function buscarLembretes({ force = false } = {}) {
  if (!force && Array.isArray(cacheLembretes)) {
    return cacheLembretes;
  }

  const resposta = await fetch(`${API_BASE_URL}/lembretes`, {
    headers: headersAuth(),
  });
  cacheLembretes = await apagarLembretesVencidos(await lerListaJson(resposta));
  limparAgrupamentoEventosCalendario();
  return cacheLembretes;
}


function valorConfigAtivo(valor, padrao = true) {
  if (valor === undefined || valor === null || valor === "") return padrao;
  return valor !== false && valor !== 0 && valor !== "0";
}
let rotinaAtual = null;

const resumoHoje = dataHojeISO();
const notificacoesJaEnviadas = new Set();

//Usuário na tela
usuarioNome.textContent = `Olá, ${usuario.nome}`;

//Notificação
function atualizarTextoNotificacaoModal() {
  if (!textoNotificacaoTarefa) return;

  if (notificacaoTarefaInput.checked) {
    textoNotificacaoTarefa.textContent = "🔔 Notificação ativada";
    textoNotificacaoTarefa.classList.add("ativa");
  } else {
    textoNotificacaoTarefa.textContent = "🔕 Notificação desativada";
    textoNotificacaoTarefa.classList.remove("ativa");
  }

  atualizarTextoAlarmeTarefaModal();
}

//Utilitários gerais
function atualizarTextoAlarmeTarefaModal() {
  if (!alarmeTarefaInput || !textoAlarmeTarefa) return;

  const notificacaoAtiva = notificacaoTarefaInput?.checked !== false;
  const alarmeAtivo = notificacaoAtiva && alarmeTarefaInput.checked;

  alarmeTarefaInput.disabled = !notificacaoAtiva;
  linhaAlarmeTarefa?.classList.toggle("desativada", !notificacaoAtiva);
  textoAlarmeTarefa.classList.toggle("ativa", alarmeAtivo);
  textoAlarmeTarefa.textContent = alarmeAtivo
    ? "Alarme da tarefa ligado"
    : notificacaoAtiva
      ? "Apenas notificar esta tarefa"
      : "Ative a notificacao para usar alarme";
}

function obterTipoRotina(nome, rotina = rotinaAtual) {
  const modelo = rotina?.tipo_modelo;

  if (modelo === "treino_card") return "treino";
  if (modelo === "tabela_por_dia") return "semanal";

  if (!nome) return "padrao";

  const n = nome.toLowerCase();

  if (n.includes("diaria") || n.includes("diária") || n.includes("matut"))
    return "matinal";
  if (n.includes("estud")) return "estudos";
  if (n.includes("treino")) return "treino";
  if (n.includes("trabalho")) return "trabalho";
  if (n.includes("semanal")) return "semanal";
  if (n.includes("alimenta")) return "alimentacao";

  return "padrao";
}

function renderizarSemanal(tarefas) {
  areaTreino.innerHTML = "";

  const diasSemana = obterDiasSemanaRotina(false);

  const container = document.createElement("div");
  container.classList.add("semanal-container");

  diasSemana.forEach((dia) => {
    const tarefasDoDia = tarefas
      .filter((tarefa) => tarefa.dia_semana === dia.valor)
      .sort((a, b) => {
        const ordemA = a.ordem ?? 999999;
        const ordemB = b.ordem ?? 999999;
        return ordemA - ordemB || a.id - b.id;
      });

    const coluna = document.createElement("div");
    coluna.classList.add("semanal-coluna");

    coluna.innerHTML = `
      <div class="semanal-header">
        <h3>${dia.nome}</h3>
        <span class="semanal-contador">${tarefasDoDia.filter((t) => t.concluida).length}/${tarefasDoDia.length} concluídas</span>
      </div>

      <div class="semanal-lista" data-dia="${dia.valor}"></div>
    `;

    const lista = coluna.querySelector(".semanal-lista");

    lista.addEventListener("dragover", (event) => {
      if (!modoEdicaoTabela) return;

      event.preventDefault();

      const itemArrastando = document.querySelector(".semanal-item.arrastando");
      const itemDepois = pegarItemSemanalDepoisDoMouse(lista, event.clientY);

      if (!itemArrastando) return;

      if (itemDepois == null) {
        lista.appendChild(itemArrastando);
      } else {
        lista.insertBefore(itemArrastando, itemDepois);
      }
    });

    lista.addEventListener("drop", async (event) => {
      if (!modoEdicaoTabela) return;

      event.preventDefault();

      const itemArrastando = document.querySelector(".semanal-item.arrastando");
      if (!itemArrastando) return;

      const novaDiaSemana = lista.dataset.dia;
      const tarefaId = itemArrastando.dataset.id;

      try {
        await atualizarTarefa(tarefaId, {
          dia_semana: novaDiaSemana,
        });

        await salvarOrdemSemanal();

        invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
      } catch (erro) {
        console.error("Erro ao mover tarefa semanal:", erro);
        mostrarAviso("erro", "Não foi possível mover a tarefa.");
      }
    });

    if (!tarefasDoDia.length) {
      lista.innerHTML = `<p class="semanal-vazio">Nenhuma tarefa</p>`;
    }

    tarefasDoDia.forEach((tarefa) => {
      const item = document.createElement("div");
      item.classList.add("semanal-item");

      if (modoEdicaoTabela) {
        item.classList.add("com-acoes-edicao");
      }

      if (tarefa.concluida) {
        item.classList.add("concluido");
      }

      item.dataset.id = tarefa.id;
      item.setAttribute("draggable", modoEdicaoTabela ? "true" : "false");

      item.innerHTML = `
  <button class="check-semanal" type="button" title="Concluir tarefa">
    ${simboloCheck(tarefa.concluida)}
  </button>

  <span class="titulo-semanal">${tarefa.titulo}</span>

  <div class="acoes-semanal">
  ${
    modoEdicaoTabela
      ? `
        <button class="btn-editar-semanal">✏️</button>
        <button class="btn-excluir">🗑️</button>
      `
      : ""
  }

  <button class="btn-notificacao ${tarefa.notificacao ? "ativa" : "desativada"}" type="button">
    ${tarefa.notificacao ? "🔔" : "🔕"}
  </button>
</div>
`;

      item.addEventListener("dragstart", (event) => {
        if (!modoEdicaoTabela) {
          event.preventDefault();
          return;
        }

        item.classList.add("arrastando");
        event.dataTransfer.setData("text/plain", tarefa.id);
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("arrastando");
      });

      const btnCheck = item.querySelector(".check-semanal");
      const btnNotificacao = item.querySelector(".btn-notificacao");
      const btnEditar = item.querySelector(".btn-editar-semanal");
      const btnExcluir = item.querySelector(".btn-excluir");

      btnCheck?.addEventListener("click", async () => {
  if (tarefa.repeticao === "Único") {
    await fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
      method: "DELETE",
      headers: headersAuth(),
    });

    invalidarCacheTarefas(rotinaSelecionadaId);
    carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
    return;
  }

  const novaConclusao = !tarefa.concluida;

  await atualizarTarefa(tarefa.id, {
    concluida: novaConclusao,
    status: novaConclusao ? "Concluída" : "Pendente",
  });

  tarefa.concluida = novaConclusao;
  tarefa.status = novaConclusao ? "Concluída" : "Pendente";

  aplicarConclusaoSemanal(item, btnCheck, novaConclusao);

  invalidarCacheTarefas(rotinaSelecionadaId);
});

      btnEditar?.addEventListener("click", (event) => {
        event.stopPropagation();
        abrirModalEditarCampo(
          tarefa.id,
          "titulo",
          tarefa.titulo || "",
          "Editar tarefa",
        );
      });

      btnExcluir?.addEventListener("click", async (event) => {
        event.stopPropagation();
        mostrarConfirmacao(
          `Deseja excluir a tarefa "${tarefa.titulo}"?`,
          async () => {
            await fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
              method: "DELETE",
              headers: headersAuth(),
            });

            invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
          },
        );
      });

      lista.appendChild(item);
    });

    container.appendChild(coluna);
  });

  areaTreino.appendChild(container);
}

function pegarItemSemanalDepoisDoMouse(container, y) {
  const itens = [
    ...container.querySelectorAll(".semanal-item:not(.arrastando)"),
  ];

  return itens.reduce(
    (maisProximo, item) => {
      const box = item.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > maisProximo.offset) {
        return {
          offset,
          element: item,
        };
      }

      return maisProximo;
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

async function salvarOrdemSemanal() {
  const listas = document.querySelectorAll(".semanal-lista");

  const promessas = [];

  listas.forEach((lista) => {
    const dia = lista.dataset.dia;
    const itens = lista.querySelectorAll(".semanal-item");

    itens.forEach((item, index) => {
      promessas.push(
        atualizarTarefa(item.dataset.id, {
          dia_semana: dia,
          ordem: index + 1,
        }),
      );
    });
  });

  await Promise.all(promessas);
}

function abrirModalEditarEventoManual(evento) {
  eventoManualEmEdicao = evento;

  modalEventoCalendario.classList.remove("hidden");

  tituloEventoInput.value = evento.titulo || "";
  dataEventoInput.value = evento.data || "";
  horarioEventoInput.value = evento.horario || "";
  tipoEventoInput.value = evento.aniversario
    ? "permanente"
    : evento.tipoEvento || "unico";
  aniversarioEventoInput.checked = !!evento.aniversario;

  horarioEventoInput.disabled = !!evento.aniversario;
  tipoEventoInput.disabled = !!evento.aniversario;
  salvarEventoCalendario.textContent = "Salvar alterações";

  tituloEventoInput.focus();
}

function abrirModalEditarLembreteDoCalendario(evento) {
  lembreteCalendarioEmEdicao = evento;

  modalLembrete.classList.remove("hidden");

  tituloLembreteInput.value = evento.titulo || "";
  horarioLembreteInput.value = evento.horario || "";
  diaMesLembreteInput.value = formatarDataBR(evento.data).slice(0, 5);
  prioridadeLembreteInput.value = evento.prioridade || "Média";
  notificacaoLembreteInput.checked = true;
  if (alarmeLembreteInput) {
    alarmeLembreteInput.checked = obterPreferenciaLembrete(evento).alarme !== false;
  }
  atualizarTextoNotificacaoLembrete();

  salvarLembrete.textContent = "Salvar alterações";
  tituloLembreteInput.focus();
}

function renderizarTreino(tarefas) {
  areaTreino.innerHTML = "";

  const diasSemana = obterDiasSemanaRotina(true);

  diasSemana.forEach((dia) => {
    const exerciciosDoDia = tarefas.filter((ex) => ex.dia_semana === dia.valor);

    const blocoDia = document.createElement("div");
    blocoDia.classList.add("bloco-dia-treino");

    blocoDia.innerHTML = `
  <div class="header-dia-treino">
    <h3>${dia.nome}</h3>

    <button class="btn-descanso" type="button" title="Marcar descanso">
      😴
    </button>
  </div>

  <div class="lista-exercicios-dia"></div>
`;

    const lista = blocoDia.querySelector(".lista-exercicios-dia");

    const btnDescanso = blocoDia.querySelector(".btn-descanso");

    btnDescanso?.addEventListener("click", () => {
      blocoDia.classList.toggle("descanso");

      if (blocoDia.classList.contains("descanso")) {
        lista.dataset.htmlOriginal = lista.innerHTML;
        lista.innerHTML = `<p>Descanso</p>`;
      } else {
        lista.innerHTML =
          lista.dataset.htmlOriginal || `<p>Nenhum exercício nesse dia.</p>`;
      }
    });

    lista.dataset.dia = dia.valor;

    lista.addEventListener("dragover", (event) => {
      event.preventDefault();
      lista.classList.add("drag-over");
    });

    lista.addEventListener("dragleave", () => {
      lista.classList.remove("drag-over");
    });

    lista.addEventListener("drop", async (event) => {
      event.preventDefault();
      lista.classList.remove("drag-over");

      const exercicioId = event.dataTransfer.getData("text/plain");
      if (!exercicioId) return;

      try {
        await atualizarTarefa(exercicioId, {
          dia_semana: dia.valor,
        });

        invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
      } catch (erro) {
        console.error("Erro ao mover exercício:", erro);
        mostrarAviso("erro", "Não foi possível mover o exercício.");
      }
    });

    if (!exerciciosDoDia.length) {
      lista.innerHTML = `<p>Nenhum exercício nesse dia.</p>`;
    }

    exerciciosDoDia.forEach((ex) => {
      const card = document.createElement("div");

      card.classList.add("card-exercicio");
      card.setAttribute("draggable", modoEdicaoTabela ? "true" : "false");
      card.dataset.id = ex.id;

      if (ex.concluida) {
        card.classList.add("concluido");
      }

      card.innerHTML = `
        <div class="card-exercicio-header">
          <strong>${ex.titulo}</strong>

          <div class="acoes-card-treino">
            <button class="btn-concluir-exercicio" title="Concluir exercício">
              ${ex.concluida ? "×" : ""}
            </button>

            ${
              modoEdicaoTabela
                ? `<button class="btn-editar-card" title="Editar exercício">✏️</button>`
                : ""
            }

            <button class="btn-excluir" title="Excluir exercício">
              🗑️
            </button>
          </div>
        </div>

        <p><span>Grupo:</span> ${ex.grupo_muscular || "-"}</p>
        <p><span>Séries:</span> ${ex.series || "-"}</p>
        <p><span>Repetições:</span> ${ex.repeticoes || "-"}</p>
        <p><span>Carga:</span> ${ex.carga || "-"} kg</p>
        <p><span>Status:</span> <strong data-status-exercicio>${ex.concluida ? "Concluída" : ex.status || "Pendente"}</strong></p>
      `;

      card.addEventListener("dragstart", (event) => {
        if (!modoEdicaoTabela) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.setData("text/plain", ex.id);
        card.classList.add("arrastando");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("arrastando");
      });

      const btnConcluir = card.querySelector(".btn-concluir-exercicio");
      const btnEditar = card.querySelector(".btn-editar-card");
      const btnExcluir = card.querySelector(".btn-excluir");

      btnConcluir?.addEventListener("click", async (event) => {
        event.stopPropagation();

        const novoConcluida = !ex.concluida;
        const novoStatus = novoConcluida ? "Concluída" : "Pendente";

        try {
         await atualizarTarefa(ex.id, {
  concluida: novoConcluida,
  status: novoStatus,
});

ex.concluida = novoConcluida;
ex.status = novoStatus;

aplicarConclusaoCardTreino(card, btnConcluir, novoConcluida);

invalidarCacheTarefas(rotinaSelecionadaId);
        } catch (erro) {
          console.error("Erro ao concluir exercício:", erro);
          mostrarAviso("erro", "Não foi possível atualizar o exercício.");
        }
      });

      btnEditar?.addEventListener("click", (event) => {
        if (!modoEdicaoTabela) return;

        event.stopPropagation();
        abrirModalEditarTreino(ex);
      });

      btnExcluir?.addEventListener("click", (event) => {
        event.stopPropagation();

        mostrarConfirmacao(
          `Deseja excluir o exercício "${ex.titulo}"?`,
          async () => {
            const resposta = await fetch(
              `${API_BASE_URL}/tarefas/${ex.id}`,
              {
                method: "DELETE",
                headers: headersAuth(),
              },
            );

            if (!resposta.ok) {
              mostrarAviso("erro", "Erro ao excluir tarefa.");
              return;
            }

            invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
            mostrarMensagem("Tarefa excluída com sucesso!");
          },
        );
      });

      lista.appendChild(card);
    });

    areaTreino.appendChild(blocoDia);
  });
}

function salvarNovoEventoCalendario() {
  const data = dataEventoInput.value;
  const titulo = tituloEventoInput.value.trim();
  const horario = horarioEventoInput.value;
  const aniversario = aniversarioEventoInput.checked;
  const tipoEvento = aniversario ? "permanente" : tipoEventoInput.value;

  if (!data || !titulo) {
    mostrarAviso("Aviso", "Preencha a data e o título do evento.");
    return;
  }

  let eventos = carregarEventosManuais();
  if (eventoManualEmEdicao) {
    eventos = eventos.map((evento) => {
      if (evento.id !== eventoManualEmEdicao.id) return evento;

      const frequencia = {
        ...(evento.frequencia || {}),
      };

      if (aniversario) {
        delete frequencia.repeticao;
      }

      return {
        ...evento,
        data,
        titulo,
        horario,
        tipoEvento,
        aniversario,
        frequencia: Object.keys(frequencia).length ? frequencia : undefined,
        excecoes: aniversario ? [] : evento.excecoes,
      };
    });

    eventoManualEmEdicao = null;
    salvarEventoCalendario.textContent = "Adicionar Evento";
  } else {
    eventos.push({
      id: Date.now(),
      data,
      titulo,
      horario,
      tipoEvento,
      aniversario,
    });
  }

  salvarEventosManuais(eventos);

  dataSelecionadaCalendario = data;

  fecharModalEventoCalendario();
  renderizarCalendario();
  mostrarEventosDoDia(data);
}

function abrirModalEditarAlimentacao(tarefa) {
  alimentacaoEmEdicao = tarefa;

  editarAlimentoInput.value = tarefa.tipo || "";
  editarHorarioAlimentacaoInput.value = tarefa.horario || "";
  editarCaloriasInput.value = tarefa.calorias || "";

  modalEditarAlimentacao.classList.remove("hidden");
  editarAlimentoInput.focus();
}

function fecharModalEditarAlimentacaoFunc() {
  modalEditarAlimentacao.classList.add("hidden");

  alimentacaoEmEdicao = null;
  editarAlimentoInput.value = "";
  editarHorarioAlimentacaoInput.value = "";
  editarCaloriasInput.value = "";
}

function fecharModalAvisoFunc() {
  modalAviso.classList.add("hidden");
  restaurarAcoesModalAviso();
}

async function salvarEdicaoAlimentacao() {
  if (!alimentacaoEmEdicao) return;

  if (
    !editarAlimentoInput.value.trim() ||
    !editarHorarioAlimentacaoInput.value ||
    !editarCaloriasInput.value
  ) {
    mostrarAviso("Aviso", "Preencha alimento, horário e calorias.");
    return;
  }

  const calorias = validarCaloriasFormulario(editarCaloriasInput.value);
  if (calorias === null) return;

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/tarefas/${alimentacaoEmEdicao.id}`,
      {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({
          tipo: editarAlimentoInput.value.trim(),
          horario: editarHorarioAlimentacaoInput.value,
          calorias,
        }),
      },
    );

    if (!resposta.ok) {
      mostrarAviso("erro", "Erro ao editar refeição.");
      return;
    }

    fecharModalEditarAlimentacaoFunc();
    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
    mostrarMensagem("Refeição atualizada com sucesso!");
  } catch (erro) {
    console.error("Erro ao editar refeição:", erro);
    mostrarAviso("erro", "Não foi possível editar essa refeição.");
  }
}

function chaveEmojisRotinasPersonalizadas() {
  return `emojisRotinasPersonalizadas_${usuario.id}`;
}

function carregarEmojisRotinasPersonalizadas() {
  return lerJSONLocal(chaveEmojisRotinasPersonalizadas(), {});
}

function salvarEmojiRotinaPersonalizada(chave, emoji) {
  if (!chave || !emoji) return;

  const emojis = carregarEmojisRotinasPersonalizadas();
  emojis[String(chave)] = emoji;
  salvarJSONLocal(chaveEmojisRotinasPersonalizadas(), emojis);
}

function obterEmojiRotinaPersonalizada(rotina) {
  const emojis = carregarEmojisRotinasPersonalizadas();
  return emojis[String(rotina?.id)] || "";
}

function normalizarEmojiRotina(valor) {
  const limpo = String(valor || "").trim();
  return limpo || "🗂️";
}

function atualizarIconeCardEmojiPersonalizado() {
  const icone = document.querySelector(
    "[data-modelo-rotina='personalizada'] .modelo-rotina-icone",
  );
  if (!icone) return;
  icone.textContent = normalizarEmojiRotina(
    emojiRotinaPersonalizadaInput?.value || "🗂️",
  );
}

function obterIconeRotina(rotinaOuNome) {
  const nome =
    typeof rotinaOuNome === "string" ? rotinaOuNome : rotinaOuNome?.nome || "";
  const templateSalvo =
    typeof rotinaOuNome === "string"
      ? ""
      : obterTemplateModalRotinaPorRotina(rotinaOuNome);
  if (
    templateSalvo &&
    templateSalvo !== "personalizada" &&
    modelosRotinaProntos[templateSalvo]
  ) {
    return modelosRotinaProntos[templateSalvo].icone;
  }

  const nomeLower = nome.toLowerCase();
  const pareceRotinaPronta =
    nomeLower.includes("matut") ||
    nomeLower.includes("diaria") ||
    nomeLower.includes("diária") ||
    nomeLower.includes("estud") ||
    nomeLower.includes("treino") ||
    nomeLower.includes("trabalho") ||
    nomeLower.includes("semanal") ||
    nomeLower.includes("alimenta");

  const emojiPersonalizado =
    typeof rotinaOuNome === "string"
      ? ""
      : obterEmojiRotinaPersonalizada(rotinaOuNome);
  if (
    emojiPersonalizado &&
    (templateSalvo === "personalizada" ||
      (!templateSalvo && !pareceRotinaPronta))
  ) {
    return emojiPersonalizado;
  }

  if (
    nomeLower.includes("matut") ||
    nomeLower.includes("diaria") ||
    nomeLower.includes("diária")
  )
    return "☀️";
  if (nomeLower.includes("estud")) return "📚";
  if (nomeLower.includes("treino")) return "💪";
  if (nomeLower.includes("trabalho")) return "💼";
  if (nomeLower.includes("semanal")) return "📊";
  if (nomeLower.includes("alimenta")) return "🍽️";

  return "🗂️";
}

function abrirModalEditarTreino(exercicio) {
  treinoEmEdicao = exercicio;

  editarSeriesInput.value = exercicio.series || "";
  editarRepeticoesInput.value = exercicio.repeticoes || "";
  editarCargaInput.value = exercicio.carga || "";

  modalEditarTreino.classList.remove("hidden");
  editarSeriesInput.focus();
}

function fecharModalEditarTreinoFunc() {
  modalEditarTreino.classList.add("hidden");

  treinoEmEdicao = null;
  editarSeriesInput.value = "";
  editarRepeticoesInput.value = "";
  editarCargaInput.value = "";
}

function voltarParaHojeCalendario() {
  const hoje = new Date();

  dataCalendarioAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  dataSelecionadaCalendario = formatarDataISO(hoje);

  modoCalendario = "mes";

  visaoAnualCalendario?.classList.add("hidden");
  document.querySelector(".calendario-semana")?.classList.remove("hidden");
  diasCalendario?.classList.remove("hidden");

  renderizarCalendario();
  mostrarEventosDoDia(dataSelecionadaCalendario);
}

async function salvarEdicaoTreino() {
  if (!treinoEmEdicao) return;

  if (
    !editarSeriesInput.value ||
    !editarRepeticoesInput.value ||
    !editarCargaInput.value.trim()
  ) {
    mostrarAviso("Aviso", "Preencha séries, repetições e carga.");
    return;
  }

  const s = Number(editarSeriesInput.value);
  const r = Number(editarRepeticoesInput.value);
  const c = Number(editarCargaInput.value);

  if (s <= 0 || r <= 0 || c < 0) {
    mostrarAviso("aviso", "Valores inválidos.");
    return;
  }

  if (s > 5) {
    mostrarAviso("aviso", "Máximo de 5 séries.");
    return;
  }

  if (r > 25) {
    mostrarAviso("aviso", "Máximo de 25 repetições.");
    return;
  }

  if (c > 600) {
    mostrarAviso("aviso", "Carga máxima é 600.");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/tarefas/${treinoEmEdicao.id}`,
      {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({
          series: editarSeriesInput.value,
          repeticoes: editarRepeticoesInput.value,
          carga: editarCargaInput.value,
        }),
      },
    );

    if (!res.ok) {
      mostrarAviso("erro", "Erro ao editar exercício.");
      return;
    }

    fecharModalEditarTreinoFunc();
    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
    mostrarMensagem("Exercício atualizado 💪");
  } catch (erro) {
    console.error(erro);
    mostrarAviso("erro", "Erro ao salvar.");
  }
}

function chaveSilencioRotina(rotinaId) {
  return `rotinaSilenciada_${rotinaId}`;
}

function chaveBackupNotificacoes(rotinaId) {
  return `backupNotificacoes_${rotinaId}`;
}

function rotinaEstaSilenciada(rotinaId) {
  return localStorage.getItem(chaveSilencioRotina(rotinaId)) === "true";
}

function atualizarBotaoSilenciarRotina() {
  if (!rotinaSelecionadaId) {
    btnSilenciarRotina.classList.add("hidden");
    return;
  }

  const tipoRotina = obterTipoRotina(tituloRotina.textContent);

  if (tipoRotina === "treino") {
    linhaNotificacaoTarefa?.classList.add("hidden");
    linhaAlarmeTarefa?.classList.add("hidden");
    notificacaoTarefaInput.checked = false;
  } else {
    linhaNotificacaoTarefa?.classList.remove("hidden");
    linhaAlarmeTarefa?.classList.remove("hidden");
  }

  if (tipoRotina === "treino") {
    btnSilenciarRotina.classList.add("hidden");
    return;
  }

  btnSilenciarRotina.classList.remove("hidden");

  if (rotinaEstaSilenciada(rotinaSelecionadaId)) {
    btnSilenciarRotina.classList.add("ativo");
    btnSilenciarRotina.title = "Reativar notificações da rotina";
  } else {
    btnSilenciarRotina.classList.remove("ativo");
    btnSilenciarRotina.title = "Silenciar notificações da rotina";
  }
}

async function alternarSilencioRotina() {
  if (!rotinaSelecionadaId) return;

  const silenciada = rotinaEstaSilenciada(rotinaSelecionadaId);

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/tarefas?rotina_id=${rotinaSelecionadaId}`,
      {
        headers: headersAuth(),
      },
    );
    const tarefas = await lerListaJson(resposta);

    if (!silenciada) {
      const backup = tarefas.map((tarefa) => ({
        id: tarefa.id,
        notificacao: !!tarefa.notificacao,
      }));

      localStorage.setItem(
        chaveBackupNotificacoes(rotinaSelecionadaId),
        JSON.stringify(backup),
      );

      await Promise.all(
        tarefas.map((tarefa) =>
          fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
            method: "PUT",
            headers: headersAuth(),
            body: JSON.stringify({
              notificacao: false,
            }),
          }),
        ),
      );

      localStorage.setItem(chaveSilencioRotina(rotinaSelecionadaId), "true");
      mostrarMensagem("Notificações da rotina silenciadas.");
    } else {
      const backup =
        JSON.parse(
          localStorage.getItem(chaveBackupNotificacoes(rotinaSelecionadaId)),
        ) || [];

      await Promise.all(
        backup.map((item) =>
          fetch(`${API_BASE_URL}/tarefas/${item.id}`, {
            method: "PUT",
            headers: headersAuth(),
            body: JSON.stringify({
              notificacao: item.notificacao,
            }),
          }),
        ),
      );

      localStorage.removeItem(chaveSilencioRotina(rotinaSelecionadaId));
      localStorage.removeItem(chaveBackupNotificacoes(rotinaSelecionadaId));
      mostrarMensagem("Notificações da rotina reativadas.");
    }

    atualizarBotaoSilenciarRotina();
    carregarRotinas();
    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
  } catch (erro) {
    console.error("Erro ao silenciar rotina:", erro);
    mostrarAviso("Erro", "Não foi possível alterar as notificações da rotina.");
  }
}

function atualizarCamposModeloRotina() {
  const personalizada = rotinaTemplateAtual === "personalizada";
  const modeloSelecionado = obterModeloTemplateRotinaAtual();
  const template = modelosRotinaProntos[rotinaTemplateAtual];

  camposRotinaCheck.forEach((campo) => {
    campo.disabled = !personalizada;

    const label = campo.closest("label");

    if (!personalizada) {
      campo.checked = template?.campos.includes(campo.value) || false;
      label?.classList.add("campo-bloqueado");
    } else {
      label?.classList.remove("campo-bloqueado");
    }
  });

  document
    .querySelectorAll("input[name='tipoModeloRotina']")
    .forEach((radio) => {
      radio.checked = radio.value === modeloSelecionado;
    });

  atualizarPreviewTemplateRotina(rotinaTemplateAtual);
  atualizarIconeCardEmojiPersonalizado();
}

function limparAtivosSidebar() {
  document.querySelectorAll(".item-menu, .item-rotina").forEach((item) => {
    item.classList.remove("ativo");
  });
}

function ativarItemSidebar(elemento) {
  limparAtivosSidebar();

  if (elemento) {
    elemento.classList.add("ativo");
  }
}

function mostrarSecaoRotinas() {
  if (secaoRotinas) secaoRotinas.style.display = "block";
  if (secaoLembretes) secaoLembretes.style.display = "none";
}

function mostrarSecaoLembretes() {
  if (secaoRotinas) secaoRotinas.style.display = "none";
  if (secaoLembretes) secaoLembretes.style.display = "block";
  definirTelaMobileDashboard("lembretes");
}

function estaEmMobileDashboard() {
  return consultaMobileDashboard.matches;
}

function esconderAcoesCalendarioMobile() {
  if (!estaEmMobileDashboard()) return;
  btnHojeCalendario?.classList.add("hidden");
  btnAdicionarEventoCalendario?.classList.add("hidden");
}

function definirTelaMobileDashboard(tela = "home") {
  if (!estaEmMobileDashboard()) {
    document.body.removeAttribute("data-mobile-tela");
    btnVoltarMobile?.classList.add("hidden");
    return;
  }

  const telaAtual = tela || "home";
  document.body.dataset.mobileTela = telaAtual;
  btnVoltarMobile?.classList.toggle("hidden", telaAtual === "home");

  if (telaAtual !== "calendario") {
    esconderAcoesCalendarioMobile();
  }

  window.scrollTo(0, 0);
}

function voltarParaTelaInicialMobile() {
  definirTelaMobileDashboard("home");
  limparAtivosSidebar();
}

btnVoltarMobile?.addEventListener("click", voltarParaTelaInicialMobile);

function sincronizarTelaMobileDashboard() {
  definirTelaMobileDashboard(consultaMobileDashboard.matches ? "home" : "");
}

if (consultaMobileDashboard.addEventListener) {
  consultaMobileDashboard.addEventListener(
    "change",
    sincronizarTelaMobileDashboard,
  );
} else {
  consultaMobileDashboard.addListener?.(sincronizarTelaMobileDashboard);
}

//Classes visuais
function obterClasseStatus(status) {
  const valor = (status || "").toLowerCase();

  if (valor.includes("conclu")) return "badge badge-sucesso";
  if (valor.includes("pend")) return "badge badge-aviso";
  if (valor.includes("progresso")) return "badge badge-info";

  return "badge badge-neutro";
}

function obterClasseTipo(tipo) {
  const valor = (tipo || "").toLowerCase();

  if (valor.includes("prova")) return "badge badge-perigo";
  if (valor.includes("atividade")) return "badge badge-info";
  if (valor.includes("trabalho")) return "badge badge-roxo";
  if (valor.includes("para fazer")) return "badge badge-neutro";

  return "badge badge-neutro";
}

function lembreteVenceu(diaMes) {
  if (!diaMes || !diaMes.includes("/")) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataLembrete = converterPrazoParaISO(diaMes, hoje.getFullYear());
  if (!dataLembrete) return false;

  const data = new Date(dataLembrete + "T00:00:00");

  return data < hoje;
}

async function apagarLembretesVencidos(lembretes) {
  lembretes = Array.isArray(lembretes) ? lembretes : [];

  const vencidos = lembretes.filter((lembrete) =>
    lembreteVenceu(lembrete.dia_mes),
  );

  await Promise.all(
    vencidos.map((lembrete) =>
      fetch(`${API_BASE_URL}/lembretes/${lembrete.id}`, {
        method: "DELETE",
        headers: headersAuth(),
      }),
    ),
  );

  return lembretes.filter((lembrete) => !lembreteVenceu(lembrete.dia_mes));
}

function obterClassePrioridade(prioridade) {
  const valor = (prioridade || "").toLowerCase();

  if (valor.includes("alta")) return "badge badge-perigo";
  if (valor.includes("média") || valor.includes("media"))
    return "badge badge-aviso";
  if (valor.includes("baixa")) return "badge badge-sucesso";

  return "badge badge-neutro";
}

//Tema e aparência
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

function aplicarFonteDashboard(tamanho) {
  const texto = String(tamanho || "Médio").toLowerCase();
  document.body.classList.remove(
    "fonte-pequena",
    "fonte-media",
    "fonte-grande",
  );

  if (texto.includes("pequen")) {
    document.body.classList.add("fonte-pequena");
  } else if (texto.includes("grand")) {
    document.body.classList.add("fonte-grande");
  } else {
    document.body.classList.add("fonte-media");
  }
}

function aplicarMostrarColunasDashboard(valor) {
  document.body.classList.toggle("colunas-ocultas", !valorConfigAtivo(valor));
  marcarColunasOpcionaisTabela();
}

function aplicarCalendarioPorFundo(fundo) {
  const fundosEscuros = new Set([
    "escuro",
    "grafite",
  ]);
  const escuro = fundosEscuros.has(String(fundo || "").toLowerCase());

  document.body.classList.toggle("calendario-escuro", escuro);
  document.body.classList.toggle("calendario-claro", !escuro);
}

function monitorarAplicacaoCoresDashboard() {
  const seletores = [
    ["body", "base"],
    [".sidebar", "barra lateral"],
    [".dashboard-main", "conteúdo principal"],
    [".rotina-card", "cards de rotina"],
    [".tabela-card", "tabela de tarefas"],
    [".card-calendario", "calendário"],
    [".calendario-topo", "topo do calendário"],
    [".btn-evento-flutuante", "botão do calendário"],
  ];

  const areas = seletores.map(([seletor, nome]) => {
    const elemento = document.querySelector(seletor);
    if (!elemento) return { nome, seletor, renderizada: false };

    const estiloArea = getComputedStyle(elemento);
    return {
      nome,
      seletor,
      renderizada: true,
      fundo: estiloArea.backgroundColor,
      texto: estiloArea.color,
      borda: estiloArea.borderColor,
    };
  });

  const estiloRaiz = getComputedStyle(document.documentElement);
  console.info("[Preferências] Cores do dashboard monitoradas", {
    fundo: document.body.dataset.fundo,
    calendario: document.body.classList.contains("calendario-claro")
      ? "claro"
      : "escuro",
    destaque: estiloRaiz.getPropertyValue("--accent").trim(),
    areas,
  });
}

function aplicarPreferenciasVisuaisDashboard(config) {
  const fundoDashboard = config.tema_fundo || "creme";
  const temaEscuroAtivo = config.tema === "escuro";

  if (temaEscuroAtivo) {
    document.body.removeAttribute("data-fundo");
    aplicarCalendarioPorFundo("escuro");
  } else {
    document.body.setAttribute("data-fundo", fundoDashboard);
    aplicarCalendarioPorFundo(fundoDashboard);
  }

  aplicarFonteDashboard(config.tamanho_fonte);
  aplicarMostrarColunasDashboard(config.mostrar_colunas);
  aplicarCorDestaque(config.cor_destaque);

  requestAnimationFrame(monitorarAplicacaoCoresDashboard);
}

const onboardingFundos = {
  padrao: {
    label: "Padrao",
    bg: "#ffffff",
    main: "#ffffff",
    sidebar: "#f9fafb",
    card: "#ffffff",
    card2: "#f8fafc",
    text: "#111827",
    muted: "#4b5563",
    border: "#d1d5db",
  },
  creme: {
    label: "Creme",
    bg: "#ffebbf",
    main: "#f7eedd",
    sidebar: "#f5cfae",
    card: "#fffaf0",
    card2: "#f8ead5",
    text: "#261c14",
    muted: "#6b5842",
    border: "#e5c89a",
  },
  peach: {
    label: "Peach",
    bg: "#ffe3dc",
    main: "#fff1ed",
    sidebar: "#f2c7c3",
    card: "#fff7f4",
    card2: "#ffe8e1",
    text: "#2f1712",
    muted: "#7f5148",
    border: "#efb5a8",
  },
  lilas: {
    label: "Lilas",
    bg: "#e6ddf5",
    main: "#f6f0ff",
    sidebar: "#d7c8ee",
    card: "#fbf8ff",
    card2: "#ebe0fb",
    text: "#26183d",
    muted: "#675181",
    border: "#c6b2e4",
  },
  salvia: {
    label: "Salvia",
    bg: "#dbe5cf",
    main: "#f0f7e9",
    sidebar: "#c8d5bb",
    card: "#f8fff1",
    card2: "#e2ecd7",
    text: "#1d2a18",
    muted: "#526348",
    border: "#b7c8a8",
  },
  "amarelo-suave": {
    label: "Amarelo suave",
    bg: "#fff3b8",
    main: "#fff8d9",
    sidebar: "#faeebb",
    card: "#fffdf0",
    card2: "#fff2b8",
    text: "#2d230c",
    muted: "#7a641a",
    border: "#ead476",
  },
  marrom: {
    label: "Marrom",
    bg: "#7c6670",
    main: "#f7efe8",
    sidebar: "#8a737b",
    card: "#fffaf5",
    card2: "#efe0d7",
    text: "#16233d",
    muted: "#5c667a",
    border: "#dbc4b8",
  },
  "azul-claro": {
    label: "Azul claro",
    bg: "#dbeafe",
    main: "#eff6ff",
    sidebar: "#bfdbfe",
    card: "#ffffff",
    card2: "#dbeafe",
    text: "#0f172a",
    muted: "#475569",
    border: "#bfdbfe",
  },
  menta: {
    label: "Menta",
    bg: "#5eead4",
    main: "#ccfbf1",
    sidebar: "#2dd4bf",
    card: "#ecfeff",
    card2: "#99f6e4",
    text: "#0f172a",
    muted: "#475569",
    border: "#2dd4bf",
  },
  "rosa-claro": {
    label: "Rosa claro",
    bg: "#fce7f3",
    main: "#fff1f2",
    sidebar: "#fbcfe8",
    card: "#ffffff",
    card2: "#fce7f3",
    text: "#0f172a",
    muted: "#64748b",
    border: "#fbcfe8",
  },
  "cinza-claro": {
    label: "Cinza claro",
    bg: "#e5e7eb",
    main: "#f8fafc",
    sidebar: "#d1d5db",
    card: "#ffffff",
    card2: "#e5e7eb",
    text: "#111827",
    muted: "#4b5563",
    border: "#cbd5e1",
  },
  oceano: {
    label: "Oceano",
    bg: "#4f9db1",
    main: "#e9f8fb",
    sidebar: "#95cbd5",
    card: "#ffffff",
    card2: "#d5eef4",
    text: "#10243a",
    muted: "#52677a",
    border: "#afd9e4",
  },
  "verde-escuro": {
    label: "Verde escuro",
    bg: "#6fa987",
    main: "#eef8f0",
    sidebar: "#80b793",
    card: "#ffffff",
    card2: "#dceede",
    text: "#112d21",
    muted: "#526a5d",
    border: "#b7d7bf",
  },
  vinho: {
    label: "Vinho",
    bg: "#9d6470",
    main: "#fff1f3",
    sidebar: "#ad707b",
    card: "#ffffff",
    card2: "#f5d9df",
    text: "#351522",
    muted: "#72515b",
    border: "#e3b8c2",
  },
  "roxo-profundo": {
    label: "Roxo profundo",
    bg: "#8b6bbe",
    main: "#f4effc",
    sidebar: "#9675c9",
    card: "#ffffff",
    card2: "#e7dcf7",
    text: "#24143f",
    muted: "#655479",
    border: "#cfbdea",
  },
  uva: {
    label: "Uva",
    bg: "#b373ad",
    main: "#fff0fb",
    sidebar: "#bf80b9",
    card: "#ffffff",
    card2: "#f4d8ef",
    text: "#361331",
    muted: "#74516f",
    border: "#e5badd",
  },
  coral: {
    label: "Coral",
    bg: "#fb8a45",
    main: "#fff3ea",
    sidebar: "#fb9a5e",
    card: "#ffffff",
    card2: "#fed7aa",
    text: "#301608",
    muted: "#7c4a31",
    border: "#f4c29d",
  },
};

const onboardingTemaEscuro = {
  label: "Escuro",
  bg: "#0f172a",
  main: "#111827",
  sidebar: "#0b1020",
  card: "#1f2937",
  card2: "#273449",
  text: "#f8fafc",
  muted: "#cbd5e1",
  border: "rgba(255,255,255,0.14)",
};

const onboardingAccentMap = {
  roxo: { label: "Roxo", value: "#a855f7" },
  azul: { label: "Azul", value: "#3b82f6" },
  verde: { label: "Verde", value: "#22c55e" },
  vermelho: { label: "Vermelho", value: "#ef4444" },
  laranja: { label: "Laranja", value: "#f97316" },
  rosa: { label: "Rosa", value: "#ec4899" },
  ciano: { label: "Ciano", value: "#06b6d4" },
  amarelo: { label: "Amarelo", value: "#eab308" },
};

const modalOnboardingTutorial = document.getElementById(
  "modalOnboardingTutorial",
);
const modalOnboardingRecursos = document.getElementById(
  "modalOnboardingRecursos",
);
const modalOnboardingCustomizacao = document.getElementById(
  "modalOnboardingCustomizacao",
);
const onboardingPreview = document.getElementById("onboardingDashboardPreview");
const onboardingFundoLabel = document.getElementById("onboardingFundoLabel");
const onboardingDestaqueLabel = document.getElementById(
  "onboardingDestaqueLabel",
);
const btnSalvarOnboardingCustomizacao = document.getElementById(
  "salvarOnboardingCustomizacao",
);

let onboardingConfigOriginal = null;
let onboardingConfigAtual = null;

function chaveOnboardingPendente() {
  return `mynote_onboarding_pendente_${usuario.id}`;
}

function chaveOnboardingConcluido() {
  return `mynote_onboarding_concluido_${usuario.id}`;
}

function deveMostrarOnboarding() {
  return (
    localStorage.getItem(chaveOnboardingPendente()) === "true" &&
    localStorage.getItem(chaveOnboardingConcluido()) !== "true"
  );
}

function normalizarFonteOnboarding(valor) {
  const texto = String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (texto.includes("pequen")) return "Pequeno";
  if (texto.includes("grand")) return "Grande";
  return "M\u00e9dio";
}

function classeFontePreview(valor) {
  const texto = normalizarFonteOnboarding(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (texto.includes("pequen")) return "preview-font-small";
  if (texto.includes("grand")) return "preview-font-large";
  return "preview-font-medium";
}

function normalizarAccentOnboarding(valor) {
  const chave = String(valor || "roxo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return onboardingAccentMap[chave] ? chave : "roxo";
}

function obterConfigOnboardingBase() {
  const config = {
    ...MyNotePrefs.defaults,
    ...preferenciasSite,
  };

  return {
    ...config,
    tema: config.tema === "escuro" ? "escuro" : "claro",
    tema_fundo: onboardingFundos[config.tema_fundo]
      ? config.tema_fundo
      : "creme",
    cor_destaque: onboardingAccentMap[normalizarAccentOnboarding(
      config.cor_destaque,
    )].label,
    tamanho_fonte: normalizarFonteOnboarding(config.tamanho_fonte),
  };
}

function atualizarPreviewOnboarding() {
  if (!onboardingPreview || !onboardingConfigAtual) return;

  const accent =
    onboardingAccentMap[
      normalizarAccentOnboarding(onboardingConfigAtual.cor_destaque)
    ];
  const tema =
    onboardingConfigAtual.tema === "escuro"
      ? onboardingTemaEscuro
      : onboardingFundos[onboardingConfigAtual.tema_fundo] ||
        onboardingFundos.creme;

  const variaveis = {
    "--preview-bg": tema.bg,
    "--preview-main": tema.main,
    "--preview-sidebar": tema.sidebar,
    "--preview-card": tema.card,
    "--preview-card-2": tema.card2,
    "--preview-text": tema.text,
    "--preview-muted": tema.muted,
    "--preview-border": tema.border,
    "--preview-accent": accent.value,
  };

  Object.entries(variaveis).forEach(([nome, valor]) => {
    onboardingPreview.style.setProperty(nome, valor);
  });

  onboardingPreview.classList.remove(
    "preview-font-small",
    "preview-font-medium",
    "preview-font-large",
  );
  onboardingPreview.classList.add(
    classeFontePreview(onboardingConfigAtual.tamanho_fonte),
  );
}

function atualizarControlesOnboarding() {
  if (!onboardingConfigAtual) return;

  document.querySelectorAll("[data-onboarding-theme]").forEach((botao) => {
    botao.classList.toggle(
      "active",
      botao.dataset.onboardingTheme === onboardingConfigAtual.tema,
    );
  });

  document
    .querySelectorAll("#onboardingFundoChoices [data-fundo]")
    .forEach((botao) => {
      botao.classList.toggle(
        "active",
        botao.dataset.fundo === onboardingConfigAtual.tema_fundo,
      );
    });

  document.querySelectorAll("[data-accent]").forEach((botao) => {
    botao.classList.toggle(
      "active",
      normalizarAccentOnboarding(botao.dataset.accent) ===
        normalizarAccentOnboarding(onboardingConfigAtual.cor_destaque),
    );
  });

  document.querySelectorAll("[data-font]").forEach((botao) => {
    botao.classList.toggle(
      "active",
      normalizarFonteOnboarding(botao.dataset.font) ===
        normalizarFonteOnboarding(onboardingConfigAtual.tamanho_fonte),
    );
  });

  if (onboardingFundoLabel) {
    const fundo =
      onboardingFundos[onboardingConfigAtual.tema_fundo] ||
      onboardingFundos.creme;
    onboardingFundoLabel.textContent =
      onboardingConfigAtual.tema === "escuro" ? "Escuro" : fundo.label;
  }

  if (onboardingDestaqueLabel) {
    const accent =
      onboardingAccentMap[
        normalizarAccentOnboarding(onboardingConfigAtual.cor_destaque)
      ];
    onboardingDestaqueLabel.textContent = accent.label;
  }
}

function aplicarEstadoOnboardingNoDashboard() {
  if (!onboardingConfigAtual) return;

  const config = {
    ...preferenciasSite,
    ...onboardingConfigAtual,
  };

  document.body.classList.remove("tema-claro", "tema-escuro");
  document.body.classList.add(
    config.tema === "escuro" ? "tema-escuro" : "tema-claro",
  );
  aplicarPreferenciasVisuaisDashboard(config);
}

function atualizarOnboarding() {
  atualizarControlesOnboarding();
  atualizarPreviewOnboarding();
  aplicarEstadoOnboardingNoDashboard();
}

function abrirModalTutorialOnboarding() {
  modalOnboardingRecursos?.classList.add("hidden");
  modalOnboardingTutorial?.classList.remove("hidden");
}

function fecharModalTutorialOnboarding() {
  modalOnboardingTutorial?.classList.add("hidden");
}

function abrirModalRecursosOnboarding() {
  fecharModalTutorialOnboarding();
  modalOnboardingCustomizacao?.classList.add("hidden");
  modalOnboardingRecursos?.classList.remove("hidden");
}

function fecharModalRecursosOnboarding() {
  modalOnboardingRecursos?.classList.add("hidden");
}

function abrirModalCustomizacaoOnboarding() {
  onboardingConfigOriginal = obterConfigOnboardingBase();
  onboardingConfigAtual = { ...onboardingConfigOriginal };
  fecharModalTutorialOnboarding();
  fecharModalRecursosOnboarding();
  modalOnboardingCustomizacao?.classList.remove("hidden");
  atualizarOnboarding();
}

function finalizarOnboarding() {
  modalOnboardingTutorial?.classList.add("hidden");
  modalOnboardingRecursos?.classList.add("hidden");
  modalOnboardingCustomizacao?.classList.add("hidden");
  localStorage.setItem(chaveOnboardingConcluido(), "true");
  localStorage.removeItem(chaveOnboardingPendente());
}

function cancelarCustomizacaoOnboarding() {
  if (onboardingConfigOriginal) {
    onboardingConfigAtual = { ...onboardingConfigOriginal };
    aplicarEstadoOnboardingNoDashboard();
  }

  finalizarOnboarding();
}

async function salvarCustomizacaoOnboarding() {
  if (!onboardingConfigAtual) return;

  const textoOriginal = btnSalvarOnboardingCustomizacao?.textContent;
  if (btnSalvarOnboardingCustomizacao) {
    btnSalvarOnboardingCustomizacao.disabled = true;
    btnSalvarOnboardingCustomizacao.textContent = "Salvando...";
  }

  const payload = {
    ...preferenciasSite,
    ...onboardingConfigAtual,
    preferencias_salvas_em: Date.now(),
  };

  preferenciasSite = MyNotePrefs.saveLocal(payload);
  aplicarEstadoOnboardingNoDashboard();

  try {
    const resposta = await fetch(`${API_BASE_URL}/configuracoes`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao salvar preferencias: ${resposta.status}`);
    }

    mostrarMensagem("Estilo aplicado ao dashboard.");
  } catch (erro) {
    console.warn("Preferencias do onboarding salvas apenas localmente:", erro);
    mostrarMensagem("Estilo aplicado neste navegador.");
  } finally {
    if (btnSalvarOnboardingCustomizacao) {
      btnSalvarOnboardingCustomizacao.disabled = false;
      btnSalvarOnboardingCustomizacao.textContent =
        textoOriginal || "Usar este estilo";
    }

    finalizarOnboarding();
  }
}

function configurarEventosOnboarding() {
  if (
    !modalOnboardingTutorial ||
    !modalOnboardingRecursos ||
    !modalOnboardingCustomizacao
  )
    return;

  document
    .getElementById("continuarOnboardingTutorial")
    ?.addEventListener("click", abrirModalRecursosOnboarding);

  document
    .getElementById("pularOnboardingTutorial")
    ?.addEventListener("click", abrirModalCustomizacaoOnboarding);

  document
    .getElementById("fecharOnboardingTutorial")
    ?.addEventListener("click", finalizarOnboarding);

  document
    .getElementById("voltarOnboardingRecursos")
    ?.addEventListener("click", abrirModalTutorialOnboarding);

  document
    .getElementById("continuarOnboardingRecursos")
    ?.addEventListener("click", abrirModalCustomizacaoOnboarding);

  document
    .getElementById("fecharOnboardingRecursos")
    ?.addEventListener("click", finalizarOnboarding);

  document
    .getElementById("fecharOnboardingCustomizacao")
    ?.addEventListener("click", cancelarCustomizacaoOnboarding);

  document
    .getElementById("pularOnboardingCustomizacao")
    ?.addEventListener("click", cancelarCustomizacaoOnboarding);

  btnSalvarOnboardingCustomizacao?.addEventListener(
    "click",
    salvarCustomizacaoOnboarding,
  );

  document.querySelectorAll("[data-onboarding-theme]").forEach((botao) => {
    botao.addEventListener("click", () => {
      onboardingConfigAtual.tema = botao.dataset.onboardingTheme;
      atualizarOnboarding();
    });
  });

  document
    .querySelectorAll("#onboardingFundoChoices [data-fundo]")
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        onboardingConfigAtual.tema_fundo = botao.dataset.fundo;
        atualizarOnboarding();
      });
    });

  document.querySelectorAll("[data-accent]").forEach((botao) => {
    botao.addEventListener("click", () => {
      onboardingConfigAtual.cor_destaque =
        onboardingAccentMap[normalizarAccentOnboarding(botao.dataset.accent)]
          .label;
      atualizarOnboarding();
    });
  });

  document.querySelectorAll("[data-font]").forEach((botao) => {
    botao.addEventListener("click", () => {
      onboardingConfigAtual.tamanho_fonte = normalizarFonteOnboarding(
        botao.dataset.font,
      );
      atualizarOnboarding();
    });
  });
}

function iniciarOnboardingPrimeiroAcesso() {
  configurarEventosOnboarding();

  if (!deveMostrarOnboarding()) return;

  abrirModalTutorialOnboarding();
}

function normalizarTextoOrdenacao(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function minutosParaOrdenacao(horario) {
  const match = String(horario || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]) * 60 + Number(match[2]);
}

function prioridadeParaOrdenacao(prioridade) {
  const texto = normalizarTextoOrdenacao(prioridade);
  if (texto.includes("alta")) return 0;
  if (texto.includes("media")) return 1;
  if (texto.includes("baixa")) return 2;
  return 3;
}

function statusParaOrdenacao(tarefa) {
  if (tarefa.concluida) return 2;
  const status = normalizarTextoOrdenacao(tarefa.status);
  if (status.includes("pend")) return 0;
  if (status.includes("andamento") || status.includes("progres")) return 1;
  if (status.includes("conclu")) return 2;
  return 3;
}

function compararFallback(a, b) {
  const ordemA = Number.isFinite(Number(a.ordem))
    ? Number(a.ordem)
    : Number.POSITIVE_INFINITY;
  const ordemB = Number.isFinite(Number(b.ordem))
    ? Number(b.ordem)
    : Number.POSITIVE_INFINITY;
  if (ordemA !== ordemB) return ordemA - ordemB;
  return String(a.titulo || "").localeCompare(
    String(b.titulo || ""),
    MyNotePrefs.locale?.() || "pt-BR",
  );
}

function ordenarTarefasPorPreferencia(tarefas, preferencia) {
  const ordem = normalizarTextoOrdenacao(preferencia || "Por horário");
  const lista = [...tarefas];

  if (ordem.includes("prioridade")) {
    return lista.sort(
      (a, b) =>
        prioridadeParaOrdenacao(a.prioridade) -
          prioridadeParaOrdenacao(b.prioridade) || compararFallback(a, b),
    );
  }

  if (ordem.includes("status")) {
    return lista.sort(
      (a, b) =>
        statusParaOrdenacao(a) - statusParaOrdenacao(b) ||
        compararFallback(a, b),
    );
  }

  if (ordem.includes("tipo")) {
    return lista.sort(
      (a, b) =>
        String(a.tipo || "").localeCompare(
          String(b.tipo || ""),
          MyNotePrefs.locale?.() || "pt-BR",
        ) || compararFallback(a, b),
    );
  }

  return lista.sort(
    (a, b) =>
      minutosParaOrdenacao(a.horario) - minutosParaOrdenacao(b.horario) ||
      compararFallback(a, b),
  );
}

async function carregarTemaDashboard() {
  const configLocal = MyNotePrefs.loadLocal();
  let config = configLocal;

  try {
    const res = await fetch(`${API_BASE_URL}/configuracoes`, {
      headers: headersAuth(),
    });
    if (!res.ok) throw new Error(`Erro ao buscar configuracoes: ${res.status}`);

    config = MyNotePrefs.normalize(await res.json());
  } catch (erro) {
    console.warn("Usando preferencias locais do dashboard:", erro);
  }

  preferenciasSite = MyNotePrefs.saveLocal(config);
  MyNotePrefs.translateDOM(document);

  document.body.classList.remove("tema-claro", "tema-escuro");

  document.body.classList.add(
    config.tema === "escuro" ? "tema-escuro" : "tema-claro",
  );

  aplicarPreferenciasVisuaisDashboard(config);
  antecedenciaNotificacao = converterAntecedenciaEmMinutos(
    config.antecedencia_lembrete,
  );
  configuracoesNotificacao = {
    notificacoesGerais: valorConfigAtivo(config.notificacoes_gerais),
    notificacoesNavegador: valorConfigAtivo(config.notificacoes_navegador),
    notificacoesPorRotina: valorConfigAtivo(config.notificacoes_por_rotina),
    somNotificacao: valorConfigAtivo(config.som_notificacao),
    apenasNotificarTarefas:
      localStorage.getItem(chaveApenasNotificarTarefasUsuario()) === "true",
    resumoDiario: valorConfigAtivo(config.resumo_diario),
    modoFoco: valorConfigAtivo(config.modo_foco, false),
  };
}

function abrirModalEditarCampo(tarefaId, campo, valorAtual, titulo) {
  edicaoCampoAtual = {
    tarefaId,
    campo,
  };

  tituloModalEditarCampo.textContent = titulo || "Editar informação";
  labelEditarCampo.textContent = "Novo valor";
  inputEditarCampo.value = valorAtual || "";

  inputEditarCampo.type = "text";

  if (campo === "horario") {
    inputEditarCampo.type = "time";
  }

  if (campo === "prazo") {
    inputEditarCampo.type = "text";
    inputEditarCampo.placeholder = "DD/MM";
    inputEditarCampo.maxLength = 5;
  }

  modalEditarCampo.classList.remove("hidden");
  inputEditarCampo.focus();
}

function fecharModalEditarCampoFunc() {
  modalEditarCampo.classList.add("hidden");
  edicaoCampoAtual = null;
  inputEditarCampo.value = "";
}

async function salvarCampoEditado() {
  if (!edicaoCampoAtual) return;

  if (edicaoCampoAtual.campo === "prazo") {
    if (!validarPrazo(inputEditarCampo.value)) {
      mostrarAviso(
        "aviso",
        "Digite uma data válida no formato DD/MM. Exemplo: 20/04",
      );
      return;
    }
  }

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/tarefas/${edicaoCampoAtual.tarefaId}`,
      {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({
          [edicaoCampoAtual.campo]: inputEditarCampo.value,
        }),
      },
    );

    if (!resposta.ok) {
      mostrarAviso("erro", "Erro ao editar informação.");
      return;
    }

    fecharModalEditarCampoFunc();
    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
    mostrarMensagem("Informação salva com sucesso!");
  } catch (erro) {
    console.error("Erro ao editar campo:", erro);
    mostrarAviso("erro", "Não foi possível editar.");
  }
}

//Notificações
let pedidoPermissaoNotificacaoPreparado = false;
let somNotificacaoPreparado = false;
let ultimoAlarmeTarefa = 0;

function converterAntecedenciaEmMinutos(texto) {
  const valor = String(texto || "").toLowerCase();

  if (valor.includes("5")) return 5;
  if (valor.includes("10")) return 10;
  if (valor.includes("15")) return 15;
  if (valor.includes("30")) return 30;

  return 15;
}

function diferencaEmMinutos(horarioAlvo) {
  return MyNotePrefs.minutesUntilTime(horarioAlvo);
}

async function inicializarPermissaoNotificacao({ solicitar = false } = {}) {
  if (!("Notification" in window)) return;
  if (
    !configuracoesNotificacao.notificacoesGerais ||
    !configuracoesNotificacao.notificacoesNavegador
  )
    return;

  if (Notification.permission === "granted") {
    notificacoesPermitidas = true;
    registrarPushNotifications().catch((erro) =>
      console.warn("Nao foi possivel registrar push:", erro),
    );
    return;
  }

  if (solicitar && Notification.permission !== "denied") {
    const permissao = await Notification.requestPermission();
    notificacoesPermitidas = permissao === "granted";

    if (notificacoesPermitidas) {
      registrarPushNotifications().catch((erro) =>
        console.warn("Nao foi possivel registrar push:", erro),
      );
    }
  }
}

function converterChaveVapidParaUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registrarServiceWorkerDashboard() {
  if (!("serviceWorker" in navigator)) return null;

  const registro = await navigator.serviceWorker.register("/service-worker.js");

  return (
    (await Promise.race([
      navigator.serviceWorker.ready,
      aguardar(1500).then(() => null),
    ])) || registro
  );
}

async function registrarPushNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!("PushManager" in window)) return;

  const registro = await registrarServiceWorkerDashboard();
  if (!registro?.pushManager) return;

  let inscricao = await registro.pushManager.getSubscription();

  if (!inscricao) {
    inscricao = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: converterChaveVapidParaUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await fetch(`${API_BASE_URL}/push/subscribe`, {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify(inscricao),
  });
}

function prepararSomNotificacaoPorInteracao() {
  if (somNotificacaoPreparado || !configuracoesNotificacao.somNotificacao)
    return;

  somNotificacaoPreparado = true;
  const audio = new Audio(obterSomNotificacaoConfigurado());
  audio.volume = 0;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    })
    .catch(() => {
      somNotificacaoPreparado = false;
    });
}

function prepararPedidoPermissaoNotificacaoPorInteracao() {
  if (pedidoPermissaoNotificacaoPreparado) return;

  pedidoPermissaoNotificacaoPreparado = true;

  const solicitarComGesto = () => {
    if ("Notification" in window && Notification.permission === "default") {
      inicializarPermissaoNotificacao({ solicitar: true }).catch((erro) =>
        console.warn("Nao foi possivel pedir permissao de notificacao:", erro),
      );
    }
    prepararSomNotificacaoPorInteracao();
  };

  document.addEventListener("pointerdown", solicitarComGesto, { once: true });
  document.addEventListener("keydown", solicitarComGesto, { once: true });
}

function chaveSomNotificacaoUsuario() {
  return `somNotificacaoPersonalizado_${usuario.id}`;
}

function chaveApenasNotificarTarefasUsuario() {
  return `apenasNotificarTarefas_${usuario.id}`;
}

function obterSomNotificacaoConfigurado() {
  return (
    localStorage.getItem(chaveSomNotificacaoUsuario()) ||
    "assets/notificacao.wav"
  );
}

function vibrarNotificacao({ alarme = false } = {}) {
  if (configuracoesNotificacao.modoFoco) return;
  if (!("vibrate" in navigator)) return;

  navigator.vibrate(
    alarme ? [420, 140, 420, 140, 420, 220, 650] : [180, 80, 180],
  );
}

function tocarSomNotificacao({ alarme = false } = {}) {
  if (configuracoesNotificacao.modoFoco) return;
  if (!configuracoesNotificacao.somNotificacao) return;

  const repeticoes = alarme ? 4 : 1;
  const intervalo = alarme ? 1500 : 0;

  const tocar = (tentativa = 1) => {
    const som = new Audio(obterSomNotificacaoConfigurado());
    som.volume = alarme ? 1 : 0.82;
    som
      .play()
      .catch((erro) =>
        console.warn("Nao foi possivel tocar o som da notificacao:", erro),
      );

    if (tentativa < repeticoes) {
      setTimeout(() => tocar(tentativa + 1), intervalo);
    }
  };

  tocar();
}

function deveAlarmarNotificacao(opcoes = {}) {
  if (opcoes.alarme === false) return false;
  if (opcoes.tarefa && configuracoesNotificacao.apenasNotificarTarefas)
    return false;

  return (
    !!opcoes.tarefa ||
    !!opcoes.lembrete ||
    !!opcoes.evento ||
    opcoes.alarme === true
  );
}

function montarOpcoesNotificacao(corpo, { alarme = false, tarefaId = "", rotinaId = "", horario = "", tarefa = false } = {}) {
  const ehTarefa = tarefa && tarefaId;

  return {
    body: corpo,
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    actions: ehTarefa
      ? [
          { action: "vou-fazer", title: "Vou fazer ↑↑" },
          { action: "ja-fiz", title: "Ja fiz" },
        ]
      : undefined,
    requireInteraction: alarme,
    renotify: alarme,
    tag: alarme ? "mynote-alarme-tarefa" : undefined,
    vibrate: alarme ? [420, 140, 420, 140, 420] : [180, 80, 180],
    data: {
      url: "/dashboard.html",
      tipo: ehTarefa ? "tarefa" : "",
      tarefaId,
      rotinaId,
      horario,
    },
  };
}

async function exibirNotificacaoNavegador(titulo, corpo, opcoes = {}) {
  if (
    !configuracoesNotificacao.notificacoesNavegador ||
    !notificacoesPermitidas ||
    !("Notification" in window)
  ) {
    return false;
  }

  const alarme = deveAlarmarNotificacao(opcoes);
  const opcoesNotificacao = montarOpcoesNotificacao(corpo, {
    ...opcoes,
    alarme,
  });

  if ("serviceWorker" in navigator) {
    try {
      const registro = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 900)),
      ]);

      if (registro?.showNotification) {
        await registro.showNotification(titulo, opcoesNotificacao);
        return true;
      }
    } catch (erro) {
      console.warn("Nao foi possivel notificar pelo service worker:", erro);
    }
  }

  const notif = new Notification(titulo, opcoesNotificacao);
  notif.onclick = () => {
    window.focus();
  };

  return true;
}

function mostrarNotificacao(titulo, corpo, opcoes = {}) {
  if (!configuracoesNotificacao.notificacoesGerais) return false;
  if (opcoes.rotina && !configuracoesNotificacao.notificacoesPorRotina)
    return false;

  const tituloTraduzido = MyNotePrefs.t(titulo);
  const corpoTraduzido = MyNotePrefs.t(corpo);
  const alarme = deveAlarmarNotificacao(opcoes);

  if (alarme) {
    const agora = Date.now();
    if (agora - ultimoAlarmeTarefa > 4000) {
      ultimoAlarmeTarefa = agora;
      vibrarNotificacao({ alarme: true });
      tocarSomNotificacao({ alarme: true });
    }
  } else {
    vibrarNotificacao();
    tocarSomNotificacao();
  }

  exibirNotificacaoNavegador(tituloTraduzido, corpoTraduzido, opcoes).catch(
    (erro) => console.warn("Erro ao exibir notificacao:", erro),
  );

  return true;
}

// ===============================
// FREQUENCIA DE ROTINAS E CALENDARIO
// ===============================

let frequenciaTarefaAtual = null;
let frequenciaEventoAtual = null;
let frequenciaGradeAtual = null;
let frequenciaNumeroAtual = null;

const diasFrequenciaSemana = [
  { valor: 0, label: "Dom." },
  { valor: 1, label: "Seg." },
  { valor: 2, label: "Ter." },
  { valor: 3, label: "Qua." },
  { valor: 4, label: "Qui" },
  { valor: 5, label: "Sex." },
  { valor: 6, label: "Sab." },
];

const mesesFrequenciaAno = [
  { valor: 0, label: "Jan" },
  { valor: 1, label: "Fev" },
  { valor: 2, label: "Mar" },
  { valor: 3, label: "Abr" },
  { valor: 4, label: "Mai" },
  { valor: 5, label: "Jun" },
  { valor: 6, label: "Jul" },
  { valor: 7, label: "Ago" },
  { valor: 8, label: "Set" },
  { valor: 9, label: "Out" },
  { valor: 10, label: "Nov" },
  { valor: 11, label: "Dez" },
];

function escaparHTML(valor) {
  const div = document.createElement("div");
  div.textContent = valor ?? "";
  return div.innerHTML;
}

function lerJSONLocal(chave, fallback) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || fallback;
  } catch {
    return fallback;
  }
}

function salvarJSONLocal(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function chavePreferenciasFrequenciaTarefas() {
  return `frequenciaTarefas_${usuario.id}`;
}

function chavePreferenciasFrequenciaCalendario() {
  return `frequenciaCalendario_${usuario.id}`;
}

function carregarPreferenciasFrequenciaTarefas() {
  return lerJSONLocal(chavePreferenciasFrequenciaTarefas(), {});
}

function salvarPreferenciasFrequenciaTarefas(preferencias) {
  salvarJSONLocal(chavePreferenciasFrequenciaTarefas(), preferencias);
}

function obterPreferenciaTarefa(tarefaId) {
  return carregarPreferenciasFrequenciaTarefas()[tarefaId] || null;
}

function salvarPreferenciaTarefa(tarefaId, dados) {
  const preferencias = carregarPreferenciasFrequenciaTarefas();
  preferencias[tarefaId] = {
    ...(preferencias[tarefaId] || {}),
    ...dados,
    atualizado_em: new Date().toISOString(),
  };
  salvarPreferenciasFrequenciaTarefas(preferencias);
}

function carregarPreferenciasFrequenciaCalendario() {
  return lerJSONLocal(chavePreferenciasFrequenciaCalendario(), {});
}

function salvarPreferenciasFrequenciaCalendario(preferencias) {
  salvarJSONLocal(chavePreferenciasFrequenciaCalendario(), preferencias);
}

function obterPreferenciaCalendario(chave) {
  return carregarPreferenciasFrequenciaCalendario()[chave] || null;
}

function salvarPreferenciaCalendario(chave, dados) {
  const preferencias = carregarPreferenciasFrequenciaCalendario();
  preferencias[chave] = {
    ...(preferencias[chave] || {}),
    ...dados,
    atualizado_em: new Date().toISOString(),
  };
  salvarPreferenciasFrequenciaCalendario(preferencias);
}

function tarefaTemPrazo(tarefa) {
  return !!(tarefa?.prazo && String(tarefa.prazo).trim());
}

function antecedenciaPadraoMinutos() {
  return Number(antecedenciaNotificacao) || 15;
}

function criarAntecedencia(unidade, valor, padrao = false) {
  return {
    unidade,
    valor: Number(valor),
    padrao,
  };
}

function obterPreferenciaPadraoTarefa(tarefa) {
  if (tarefaTemPrazo(tarefa)) {
    return {
      modo: "prazo",
      repeticao: null,
      alarme: true,
      antecedencia: criarAntecedencia(
        "minuto",
        antecedenciaPadraoMinutos(),
        true,
      ),
    };
  }

  return {
    modo: "horario",
    repeticao: {
      tipo: "diaria",
      dias: diasFrequenciaSemana.map((dia) => dia.valor),
    },
    alarme: true,
    antecedencia: criarAntecedencia(
      "minuto",
      antecedenciaPadraoMinutos(),
      true,
    ),
  };
}

function obterPreferenciaEfetivaTarefa(tarefa) {
  const padrao = {
    ...obterPreferenciaPadraoTarefa(tarefa),
    alarme:
      tarefa?.alarme === undefined || tarefa?.alarme === null
        ? true
        : Boolean(Number(tarefa.alarme)),
  };
  const salva = obterPreferenciaTarefa(tarefa.id);

  if (!salva) return padrao;

  return {
    ...padrao,
    ...salva,
    repeticao: tarefaTemPrazo(tarefa)
      ? null
      : salva.repeticao || padrao.repeticao,
    alarme: salva.alarme !== false,
    antecedencia: salva.antecedencia || padrao.antecedencia,
  };
}

function obterPreferenciaPrazoExterna(chave) {
  const salva = obterPreferenciaCalendario(chave);

  return {
    modo: "prazo",
    repeticao: null,
    alarme: salva?.alarme !== false,
    antecedencia:
      salva?.antecedencia ||
      criarAntecedencia("minuto", antecedenciaPadraoMinutos(), true),
  };
}

function pluralizarUnidade(unidade, valor) {
  const nomes = {
    minuto: ["minuto", "minutos"],
    hora: ["hora", "horas"],
    dia: ["dia", "dias"],
    semana: ["semana", "semanas"],
    mes: ["mes", "meses"],
  };

  const [singular, plural] = nomes[unidade] || [unidade, `${unidade}s`];
  return Number(valor) === 1 ? singular : plural;
}

function rotuloAntecedencia(antecedencia) {
  if (!antecedencia) return "Padrão";

  const valor = Number(antecedencia.valor) || antecedenciaPadraoMinutos();
  const unidade = antecedencia.unidade || "minuto";
  const texto = `${valor} ${pluralizarUnidade(unidade, valor)} antes`;

  return antecedencia.padrao ? `Padrão (${texto})` : texto;
}

function rotuloRepeticaoTarefa(repeticao) {
  if (!repeticao || repeticao.tipo === "diaria") return "Diariamente";
  if (repeticao.tipo === "semana_util") return "Seg. a Sex.";

  if (repeticao.tipo === "personalizado") {
    const dias = (repeticao.dias || [])
      .map(
        (valor) =>
          diasFrequenciaSemana.find((dia) => dia.valor === Number(valor))
            ?.label,
      )
      .filter(Boolean);

    return dias.length ? dias.join(", ") : "Personalizado";
  }

  return "Diariamente";
}

function rotuloAlarmeTarefa(pref) {
  return pref?.alarme === false ? "Apenas notificar" : "Alarmar";
}

function converterAntecedenciaParaMinutos(antecedencia) {
  if (!antecedencia) return antecedenciaPadraoMinutos();

  const valor = Number(antecedencia.valor) || antecedenciaPadraoMinutos();

  switch (antecedencia.unidade) {
    case "hora":
      return valor * 60;
    case "dia":
      return valor * 1440;
    case "semana":
      return valor * 10080;
    case "mes":
      return valor * 43200;
    case "minuto":
    default:
      return valor;
  }
}

function deveNotificarHojePelaRepeticao(repeticao) {
  if (!repeticao || !Array.isArray(repeticao.dias)) return true;
  return repeticao.dias.map(Number).includes(obterDiaSemanaAtualConfigurado());
}

function criarDataLocalPorISO(dataISO) {
  if (!dataISO) return null;
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
}

function montarDataHoraLocal(dataISO, horario, horarioPadrao = "09:00") {
  return MyNotePrefs.zonedDateFromISOTime(dataISO, horario || horarioPadrao);
}

function obterDataPrazoComHorario(prazo, horario) {
  const dataISO = converterPrazoParaISO(prazo, new Date().getFullYear());
  if (!dataISO) return null;
  return montarDataHoraLocal(dataISO, horario, "09:00");
}

function diferencaEmMinutosAteData(dataAlvo) {
  if (!dataAlvo) return null;
  return (dataAlvo.getTime() - Date.now()) / 60000;
}

function estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) {
  return (
    minutosRestantes !== null &&
    minutosRestantes <= antecedenciaMinutos &&
    minutosRestantes > antecedenciaMinutos - 1
  );
}

function atualizarVisibilidadeBotaoFrequenciaRotina(tipoRotina) {
  if (!btnFrequenciaRotina) return;
  btnFrequenciaRotina.classList.toggle("hidden", tipoRotina === "treino");
}

function garantirModaisFrequencia() {
  if (document.getElementById("modalFrequenciaRotina")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="modalFrequenciaRotina" class="modal hidden">
      <div class="modal-content modal-frequencia">
        <div class="modal-header">
          <h2>🔄 Frequência</h2>
          <button class="btn-fechar" type="button" data-fechar-frequencia="modalFrequenciaRotina">&times;</button>
        </div>

        <div class="modal-body">
          <p class="frequencia-ajuda">Personalize tarefas desta rotina. Tarefas sem alteração continuam usando o padrão das configurações.</p>
          <div id="listaFrequenciaTarefas" class="lista-frequencia-tarefas"></div>
        </div>
      </div>
    </div>

    <div id="modalOpcoesFrequencia" class="modal hidden">
      <div class="modal-content modal-frequencia modal-frequencia-menor">
        <div class="modal-header modal-header-voltar">
          <button id="voltarOpcoesFrequencia" class="btn-voltar-frequencia" type="button">←</button>
          <button class="btn-fechar" type="button" data-fechar-frequencia="modalOpcoesFrequencia">&times;</button>
        </div>
        <h2 id="tituloOpcoesFrequencia" class="titulo-frequencia-opcoes">Frequência</h2>
        <p id="subtituloOpcoesFrequencia" class="frequencia-ajuda"></p>
        <div id="listaOpcoesFrequencia" class="lista-opcoes-frequencia"></div>
      </div>
    </div>

    <div id="modalGradeFrequencia" class="modal hidden">
      <div class="modal-content modal-frequencia modal-frequencia-menor">
        <div class="modal-header">
          <h2 id="tituloGradeFrequencia">Personalizado</h2>
          <button class="btn-fechar" type="button" data-fechar-frequencia="modalGradeFrequencia">&times;</button>
        </div>
        <p id="subtituloGradeFrequencia" class="frequencia-ajuda"></p>
        <div id="gradeFrequencia" class="grade-frequencia"></div>
        <div class="modal-footer">
          <button id="cancelarGradeFrequencia" class="btn-secundario" type="button">Cancelar</button>
          <button id="salvarGradeFrequencia" class="btn-primario" type="button">OK</button>
        </div>
      </div>
    </div>

    <div id="modalNumeroFrequencia" class="modal hidden">
      <div class="modal-content modal-frequencia modal-numero-frequencia">
        <h2 id="tituloNumeroFrequencia">Hora do lembrete</h2>
        <p id="resumoNumeroFrequencia" class="resumo-numero-frequencia"></p>
        <div class="numero-frequencia-picker">
          <div id="valoresNumeroFrequencia" class="coluna-numero-frequencia"></div>
          <div id="unidadesNumeroFrequencia" class="coluna-numero-frequencia coluna-unidade-frequencia"></div>
        </div>
        <div class="modal-footer">
          <button id="cancelarNumeroFrequencia" class="btn-secundario" type="button">Cancelar</button>
          <button id="salvarNumeroFrequencia" class="btn-primario" type="button">OK</button>
        </div>
      </div>
    </div>
  `,
  );

  document.querySelectorAll("[data-fechar-frequencia]").forEach((botao) => {
    botao.addEventListener("click", () => {
      document
        .getElementById(botao.dataset.fecharFrequencia)
        ?.classList.add("hidden");
    });
  });

  document
    .getElementById("voltarOpcoesFrequencia")
    ?.addEventListener("click", () => {
      document.getElementById("modalOpcoesFrequencia")?.classList.add("hidden");
    });

  document
    .getElementById("cancelarGradeFrequencia")
    ?.addEventListener("click", () => {
      document.getElementById("modalGradeFrequencia")?.classList.add("hidden");
    });

  document
    .getElementById("cancelarNumeroFrequencia")
    ?.addEventListener("click", () => {
      document.getElementById("modalNumeroFrequencia")?.classList.add("hidden");
    });

  document
    .getElementById("salvarGradeFrequencia")
    ?.addEventListener("click", () => {
      if (frequenciaGradeAtual?.onSave) {
        frequenciaGradeAtual.onSave([...frequenciaGradeAtual.selecionados]);
      }
    });

  document
    .getElementById("salvarNumeroFrequencia")
    ?.addEventListener("click", () => {
      if (frequenciaNumeroAtual?.onSave) {
        frequenciaNumeroAtual.onSave({
          unidade: frequenciaNumeroAtual.unidade,
          valor: frequenciaNumeroAtual.valor,
        });
      }
    });
}

function fecharModalOpcoesFrequencia() {
  document.getElementById("modalOpcoesFrequencia")?.classList.add("hidden");
}

function fecharModalGradeFrequencia() {
  document.getElementById("modalGradeFrequencia")?.classList.add("hidden");
}

function fecharModalNumeroFrequencia() {
  document.getElementById("modalNumeroFrequencia")?.classList.add("hidden");
}

function abrirModalOpcoesFrequencia(titulo, subtitulo, opcoes) {
  garantirModaisFrequencia();

  const modal = document.getElementById("modalOpcoesFrequencia");
  const tituloEl = document.getElementById("tituloOpcoesFrequencia");
  const subtituloEl = document.getElementById("subtituloOpcoesFrequencia");
  const lista = document.getElementById("listaOpcoesFrequencia");

  tituloEl.textContent = titulo;
  subtituloEl.textContent = subtitulo || "";
  lista.innerHTML = "";

  opcoes.forEach((opcao, index) => {
    const botao = document.createElement("button");
    botao.className = `opcao-frequencia ${opcao.ativo ? "ativa" : ""}`;
    botao.type = "button";
    botao.disabled = !!opcao.desabilitada;
    botao.innerHTML = `
      <span>
        <strong>${escaparHTML(opcao.titulo)}</strong>
        ${opcao.descricao ? `<small>${escaparHTML(opcao.descricao)}</small>` : ""}
      </span>
      ${opcao.seta ? `<span class="seta-opcao-frequencia">›</span>` : ""}
    `;

    botao.addEventListener("click", () => {
      if (opcao.desabilitada) return;
      opcoes[index].acao?.();
    });

    lista.appendChild(botao);
  });

  modal.classList.remove("hidden");
}

function abrirModalGradeFrequencia({
  titulo,
  subtitulo,
  itens,
  selecionados,
  multiselecionavel = true,
  classe = "",
  onSave,
}) {
  garantirModaisFrequencia();

  frequenciaGradeAtual = {
    selecionados: new Set((selecionados || []).map(Number)),
    multiselecionavel,
    onSave,
  };

  const modal = document.getElementById("modalGradeFrequencia");
  const tituloEl = document.getElementById("tituloGradeFrequencia");
  const subtituloEl = document.getElementById("subtituloGradeFrequencia");
  const grade = document.getElementById("gradeFrequencia");

  tituloEl.textContent = titulo;
  subtituloEl.textContent = subtitulo || "";
  grade.className = `grade-frequencia ${classe}`;
  grade.innerHTML = "";

  itens.forEach((item) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.dataset.valor = item.valor;
    botao.textContent = item.label;
    botao.classList.toggle(
      "ativo",
      frequenciaGradeAtual.selecionados.has(Number(item.valor)),
    );

    botao.addEventListener("click", () => {
      const valor = Number(item.valor);

      if (frequenciaGradeAtual.multiselecionavel) {
        if (frequenciaGradeAtual.selecionados.has(valor)) {
          frequenciaGradeAtual.selecionados.delete(valor);
        } else {
          frequenciaGradeAtual.selecionados.add(valor);
        }
      } else {
        frequenciaGradeAtual.selecionados = new Set([valor]);
      }

      grade.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle(
          "ativo",
          frequenciaGradeAtual.selecionados.has(Number(btn.dataset.valor)),
        );
      });
    });

    grade.appendChild(botao);
  });

  modal.classList.remove("hidden");
}

function abrirModalNumeroFrequencia({
  titulo,
  unidades,
  unidadeInicial,
  valorInicial,
  onSave,
}) {
  garantirModaisFrequencia();

  frequenciaNumeroAtual = {
    unidades,
    unidade: unidadeInicial || unidades[0].unidade,
    valor: Number(valorInicial) || unidades[0].min,
    onSave,
  };

  document.getElementById("tituloNumeroFrequencia").textContent = titulo;
  atualizarModalNumeroFrequencia();
  document.getElementById("modalNumeroFrequencia").classList.remove("hidden");
}

function atualizarModalNumeroFrequencia() {
  if (!frequenciaNumeroAtual) return;

  const unidadeAtual = frequenciaNumeroAtual.unidades.find(
    (item) => item.unidade === frequenciaNumeroAtual.unidade,
  );
  const valores = document.getElementById("valoresNumeroFrequencia");
  const unidades = document.getElementById("unidadesNumeroFrequencia");
  const resumo = document.getElementById("resumoNumeroFrequencia");

  if (!unidadeAtual) return;

  if (
    frequenciaNumeroAtual.valor < unidadeAtual.min ||
    frequenciaNumeroAtual.valor > unidadeAtual.max
  ) {
    frequenciaNumeroAtual.valor = unidadeAtual.min;
  }

  resumo.textContent = `${frequenciaNumeroAtual.valor} ${pluralizarUnidade(frequenciaNumeroAtual.unidade, frequenciaNumeroAtual.valor)} antes do evento`;

  valores.innerHTML = "";
  for (let valor = unidadeAtual.min; valor <= unidadeAtual.max; valor++) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = valor;
    botao.classList.toggle("ativo", valor === frequenciaNumeroAtual.valor);
    botao.addEventListener("click", () => {
      frequenciaNumeroAtual.valor = valor;
      atualizarModalNumeroFrequencia();
    });
    valores.appendChild(botao);
  }

  unidades.innerHTML = "";
  frequenciaNumeroAtual.unidades.forEach((item) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = item.label;
    botao.classList.toggle(
      "ativo",
      item.unidade === frequenciaNumeroAtual.unidade,
    );
    botao.addEventListener("click", () => {
      frequenciaNumeroAtual.unidade = item.unidade;
      atualizarModalNumeroFrequencia();
    });
    unidades.appendChild(botao);
  });
}

async function atualizarModalFrequenciaRotinaAberto() {
  const modal = document.getElementById("modalFrequenciaRotina");
  if (!modal || modal.classList.contains("hidden") || !rotinaSelecionadaId)
    return;
  await abrirModalFrequenciaRotina(true);
}

async function abrirModalFrequenciaRotina(manterAberto = false) {
  if (!rotinaSelecionadaId) {
    mostrarAviso("aviso", "Selecione uma rotina primeiro.");
    return;
  }

  const tipoRotina = obterTipoRotina(tituloRotina.textContent);
  if (tipoRotina === "treino") {
    mostrarAviso("aviso", "A rotina de treino não usa frequência individual.");
    return;
  }

  garantirModaisFrequencia();
  opcoesRotina?.classList.add("hidden");

  const modal = document.getElementById("modalFrequenciaRotina");
  const lista = document.getElementById("listaFrequenciaTarefas");

  lista.innerHTML = `<p class="frequencia-vazio">Carregando tarefas...</p>`;
  modal.classList.remove("hidden");

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/tarefas?rotina_id=${rotinaSelecionadaId}`,
      {
        headers: headersAuth(),
      },
    );
    const tarefas = await lerListaJson(resposta);
    renderizarListaFrequenciaTarefas(tarefas);
  } catch (erro) {
    console.error("Erro ao carregar frequência da rotina:", erro);
    lista.innerHTML = `<p class="frequencia-vazio">Não foi possível carregar as tarefas.</p>`;
  }

  if (!manterAberto) {
    modal.classList.remove("hidden");
  }
}

function renderizarListaFrequenciaTarefas(tarefas) {
  const lista = document.getElementById("listaFrequenciaTarefas");

  if (!tarefas.length) {
    lista.innerHTML = `<p class="frequencia-vazio">Nenhuma tarefa cadastrada nessa rotina.</p>`;
    return;
  }

  lista.innerHTML = "";

  tarefas.forEach((tarefa) => {
    const temPrazo = tarefaTemPrazo(tarefa);
    const pref = obterPreferenciaEfetivaTarefa(tarefa);
    const meta = temPrazo
      ? `Prazo ${tarefa.prazo}${tarefa.horario ? ` às ${tarefa.horario}` : ""}`
      : tarefa.horario
        ? `Horário ${tarefa.horario}`
        : "Sem horário definido";

    const item = document.createElement("div");
    item.className = "frequencia-tarefa-item";
    item.innerHTML = `
      <div class="frequencia-tarefa-info">
        <strong>${escaparHTML(tarefa.titulo || "Tarefa sem titulo")}</strong>
        <small>${escaparHTML(meta)}</small>
      </div>
      <div class="frequencia-controles">
        ${
          temPrazo
            ? `<span class="frequencia-pill">Sem repetição</span>`
            : `<button class="frequencia-control-btn" type="button" data-freq-repeticao="${tarefa.id}">
                <span>Repetição</span>
                <strong>${escaparHTML(rotuloRepeticaoTarefa(pref.repeticao))}</strong>
              </button>`
        }
        <button class="frequencia-control-btn" type="button" data-freq-antecedencia="${tarefa.id}">
          <span>Antecedência do aviso</span>
          <strong>${escaparHTML(rotuloAntecedencia(pref.antecedencia))}</strong>
        </button>
        <button class="frequencia-control-btn" type="button" data-freq-alarme="${tarefa.id}">
          <span>Alarme da tarefa</span>
          <strong>${escaparHTML(rotuloAlarmeTarefa(pref))}</strong>
        </button>
      </div>
    `;

    lista.appendChild(item);
  });

  lista.querySelectorAll("[data-freq-repeticao]").forEach((botao) => {
    const tarefa = tarefas.find(
      (item) => String(item.id) === botao.dataset.freqRepeticao,
    );
    botao.addEventListener("click", () => abrirOpcoesRepeticaoTarefa(tarefa));
  });

  lista.querySelectorAll("[data-freq-antecedencia]").forEach((botao) => {
    const tarefa = tarefas.find(
      (item) => String(item.id) === botao.dataset.freqAntecedencia,
    );
    botao.addEventListener("click", () =>
      abrirOpcoesAntecedenciaTarefa(tarefa),
    );
  });

  lista.querySelectorAll("[data-freq-alarme]").forEach((botao) => {
    const tarefa = tarefas.find(
      (item) => String(item.id) === botao.dataset.freqAlarme,
    );
    botao.addEventListener("click", () => abrirOpcoesAlarmeTarefa(tarefa));
  });
}

function salvarEAtualizarTarefaFrequencia(tarefa, dados, mensagem) {
  salvarPreferenciaTarefa(tarefa.id, dados);

  if (Object.prototype.hasOwnProperty.call(dados, "alarme")) {
    atualizarTarefa(tarefa.id, { alarme: dados.alarme }).catch((erro) =>
      console.warn("Nao foi possivel salvar o alarme da tarefa no servidor:", erro),
    );
  }

  fecharModalOpcoesFrequencia();
  fecharModalGradeFrequencia();
  fecharModalNumeroFrequencia();
  atualizarModalFrequenciaRotinaAberto();
  mostrarMensagem(mensagem || "Frequência atualizada!");
}

function abrirOpcoesAlarmeTarefa(tarefa) {
  if (!tarefa) return;

  const pref = obterPreferenciaEfetivaTarefa(tarefa);

  abrirModalOpcoesFrequencia(
    "Alarme da tarefa",
    tarefa.titulo || "Tarefa",
    [
      {
        titulo: "Alarmar",
        descricao: "Toca o som e vibra quando a tarefa avisar.",
        ativo: pref.alarme !== false,
        acao: () =>
          salvarEAtualizarTarefaFrequencia(
            tarefa,
            { alarme: true },
            "Alarme da tarefa ativado!",
          ),
      },
      {
        titulo: "Apenas notificar",
        descricao: "Mostra o aviso sem tocar o alarme desta tarefa.",
        ativo: pref.alarme === false,
        acao: () =>
          salvarEAtualizarTarefaFrequencia(
            tarefa,
            { alarme: false },
            "Esta tarefa agora apenas notifica.",
          ),
      },
    ],
  );
}

function abrirOpcoesAlarmeGenerico({
  titulo,
  subtitulo,
  alarmeAtivo,
  descricaoLigado,
  descricaoDesligado,
  onSave,
}) {
  abrirModalOpcoesFrequencia(titulo, subtitulo, [
    {
      titulo: "Alarmar",
      descricao: descricaoLigado || "Toca o som e vibra junto do aviso.",
      ativo: alarmeAtivo !== false,
      acao: () => onSave(true),
    },
    {
      titulo: "Apenas notificar",
      descricao: descricaoDesligado || "Mostra o aviso sem tocar alarme.",
      ativo: alarmeAtivo === false,
      acao: () => onSave(false),
    },
  ]);
}

function abrirOpcoesRepeticaoTarefa(tarefa) {
  if (!tarefa) return;

  frequenciaTarefaAtual = tarefa;
  const pref = obterPreferenciaEfetivaTarefa(tarefa);
  const diasPersonalizados = pref.repeticao?.dias || [1, 2, 3, 4, 5];

  abrirModalOpcoesFrequencia("Repetição", tarefa.titulo || "Tarefa", [
    {
      titulo: "Diariamente",
      ativo: pref.repeticao?.tipo === "diaria",
      acao: () =>
        salvarEAtualizarTarefaFrequencia(tarefa, {
          modo: "horario",
          repeticao: {
            tipo: "diaria",
            dias: diasFrequenciaSemana.map((dia) => dia.valor),
          },
        }),
    },
    {
      titulo: "Seg. a Sex.",
      ativo: pref.repeticao?.tipo === "semana_util",
      acao: () =>
        salvarEAtualizarTarefaFrequencia(tarefa, {
          modo: "horario",
          repeticao: { tipo: "semana_util", dias: [1, 2, 3, 4, 5] },
        }),
    },
    {
      titulo: "Personalizado",
      descricao: rotuloRepeticaoTarefa({
        tipo: "personalizado",
        dias: diasPersonalizados,
      }),
      ativo: pref.repeticao?.tipo === "personalizado",
      seta: true,
      acao: () => abrirGradeDiasSemanaTarefa(tarefa),
    },
  ]);
}

function abrirGradeDiasSemanaTarefa(tarefa) {
  const pref = obterPreferenciaEfetivaTarefa(tarefa);

  abrirModalGradeFrequencia({
    titulo: "Personalizado",
    subtitulo: "Escolha os dias em que a tarefa pode notificar.",
    itens: diasFrequenciaSemana,
    selecionados: pref.repeticao?.dias || [1, 2, 3, 4, 5],
    classe: "grade-semana-frequencia",
    onSave: (dias) => {
      if (!dias.length) {
        mostrarAviso("aviso", "Escolha pelo menos um dia.");
        return;
      }

      salvarEAtualizarTarefaFrequencia(tarefa, {
        modo: "horario",
        repeticao: { tipo: "personalizado", dias },
      });
    },
  });
}

function abrirOpcoesAntecedenciaTarefa(tarefa) {
  if (!tarefa) return;

  frequenciaTarefaAtual = tarefa;
  const pref = obterPreferenciaEfetivaTarefa(tarefa);

  if (tarefaTemPrazo(tarefa)) {
    abrirModalOpcoesFrequencia(
      "Antecedência do aviso",
      tarefa.titulo || "Tarefa com prazo",
      [
        {
          titulo: "1 hora antes",
          ativo:
            pref.antecedencia?.unidade === "hora" &&
            Number(pref.antecedencia.valor) === 1,
          acao: () =>
            salvarEAtualizarTarefaFrequencia(tarefa, {
              modo: "prazo",
              antecedencia: criarAntecedencia("hora", 1),
            }),
        },
        {
          titulo: "1 dia antes",
          ativo:
            pref.antecedencia?.unidade === "dia" &&
            Number(pref.antecedencia.valor) === 1,
          acao: () =>
            salvarEAtualizarTarefaFrequencia(tarefa, {
              modo: "prazo",
              antecedencia: criarAntecedencia("dia", 1),
            }),
        },
        {
          titulo: "1 semana antes",
          ativo:
            pref.antecedencia?.unidade === "semana" &&
            Number(pref.antecedencia.valor) === 1,
          acao: () =>
            salvarEAtualizarTarefaFrequencia(tarefa, {
              modo: "prazo",
              antecedencia: criarAntecedencia("semana", 1),
            }),
        },
        {
          titulo: "Personalizado",
          descricao: rotuloAntecedencia(pref.antecedencia),
          seta: true,
          acao: () =>
            abrirNumeroAntecedenciaPrazo({
              valorAtual: pref.antecedencia,
              onSave: (antecedencia) =>
                salvarEAtualizarTarefaFrequencia(tarefa, {
                  modo: "prazo",
                  antecedencia: criarAntecedencia(
                    antecedencia.unidade,
                    antecedencia.valor,
                  ),
                }),
            }),
        },
      ],
    );
    return;
  }

  abrirModalOpcoesFrequencia(
    "Antecedência do aviso",
    tarefa.titulo || "Tarefa",
    [5, 10, 15, 30].map((minutos) => ({
      titulo: `${minutos} minutos antes`,
      ativo:
        pref.antecedencia?.unidade === "minuto" &&
        Number(pref.antecedencia.valor) === minutos,
      acao: () =>
        salvarEAtualizarTarefaFrequencia(tarefa, {
          modo: "horario",
          antecedencia: criarAntecedencia("minuto", minutos),
        }),
    })),
  );
}

function abrirNumeroAntecedenciaPrazo({ valorAtual, onSave }) {
  abrirModalNumeroFrequencia({
    titulo: "Hora do lembrete",
    unidadeInicial: valorAtual?.unidade || "hora",
    valorInicial: valorAtual?.valor || 1,
    unidades: [
      { unidade: "minuto", label: "minuto", min: 1, max: 60 },
      { unidade: "hora", label: "hora", min: 1, max: 24 },
      { unidade: "dia", label: "dia", min: 1, max: 30 },
    ],
    onSave,
  });
}

function abrirNumeroAntecedenciaCalendario({ valorAtual, onSave }) {
  abrirModalNumeroFrequencia({
    titulo: "Hora do lembrete",
    unidadeInicial: valorAtual?.unidade || "dia",
    valorInicial: valorAtual?.valor || 1,
    unidades: [
      { unidade: "dia", label: "dia", min: 1, max: 6 },
      { unidade: "semana", label: "semana", min: 1, max: 3 },
      { unidade: "mes", label: "mes", min: 1, max: 12 },
    ],
    onSave,
  });
}

function obterFrequenciaEventoManual(evento) {
  const eventoBase = obterEventoManualBase(evento);

  return {
    repeticao: eventoBase?.frequencia?.repeticao || null,
    alarme: eventoBase?.frequencia?.alarme !== false,
    antecedencia:
      eventoBase?.frequencia?.antecedencia || criarAntecedencia("dia", 1, true),
  };
}

function obterEventoManualBase(evento) {
  if (!evento || evento.tipo !== "manual") return evento;

  const eventoSalvo = carregarEventosManuais().find(
    (item) => String(item.id) === String(evento.id),
  );

  if (!eventoSalvo) return evento;

  return {
    ...evento,
    ...eventoSalvo,
    tipo: "manual",
    dataOriginal:
      eventoSalvo.dataOriginal || evento.dataOriginal || eventoSalvo.data,
  };
}

function obterDiasRepeticaoEvento(evento) {
  const repeticao = obterFrequenciaEventoManual(evento).repeticao;
  const dataOriginal = criarDataLocalPorISO(evento.dataOriginal || evento.data);
  const dias = Array.isArray(repeticao?.dias)
    ? repeticao.dias.map(Number).filter((dia) => dia >= 1 && dia <= 31)
    : [];

  return dias.length ? [...new Set(dias)].sort((a, b) => a - b) : [dataOriginal?.getDate() || 1];
}

function obterMesesRepeticaoEvento(evento) {
  const repeticao = obterFrequenciaEventoManual(evento).repeticao;
  const meses = Array.isArray(repeticao?.meses)
    ? repeticao.meses.map(Number).filter((mes) => mes >= 0 && mes <= 11)
    : [];

  return [...new Set(meses)].sort((a, b) => a - b);
}

function rotuloRepeticaoEventoManual(evento) {
  const repeticao = obterFrequenciaEventoManual(evento).repeticao;

  if (!repeticao) {
    return evento?.tipoEvento === "permanente" ? "Anual" : "Evento único";
  }

  if (repeticao.modo === "dias") {
    const dias = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).sort((a, b) => a - b)
      : [];

    return dias.length ? `Dias ${dias.join(", ")} deste mes` : "Dias deste mes";
  }

  if (repeticao.modo === "meses") {
    const dias = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).sort((a, b) => a - b)
      : [];
    const meses = (repeticao.meses || [])
      .map(
        (valor) =>
          mesesFrequenciaAno.find((mes) => mes.valor === Number(valor))?.label,
      )
      .filter(Boolean);

    if (dias.length && meses.length) {
      return `Dias ${dias.join(", ")} em ${meses.join(", ")}`;
    }

    return meses.length ? meses.join(", ") : "Meses";
  }

  return "Evento único";
}

async function salvarFrequenciaEventoManual(eventoId, dados, mensagem) {
  const eventos = carregarEventosManuais().map((evento) => {
    if (String(evento.id) !== String(eventoId)) return evento;

    return {
      ...evento,
      tipoEvento: dados.repeticao ? "permanente" : evento.tipoEvento,
      frequencia: {
        ...(evento.frequencia || {}),
        ...dados,
      },
    };
  });

  salvarEventosManuais(eventos);
  fecharModalOpcoesFrequencia();
  fecharModalGradeFrequencia();
  fecharModalNumeroFrequencia();
  await renderizarCalendario();
  if (dataSelecionadaCalendario) mostrarEventosDoDia(dataSelecionadaCalendario);
  mostrarMensagem(mensagem || "Frequência do evento atualizada!");
}

function abrirModalFrequenciaEvento(evento) {
  garantirModaisFrequencia();

  if (evento.tipo === "feriado") {
    abrirPainelFrequenciaFeriado(evento);
    return;
  }

  if (evento.tipo === "manual") {
    abrirPainelFrequenciaEventoManual(evento);
    return;
  }

  abrirPainelFrequenciaEventoPrazo(evento);
}

function abrirPainelFrequenciaEventoManual(evento) {
  evento = obterEventoManualBase(evento);
  frequenciaEventoAtual = evento;
  const freq = obterFrequenciaEventoManual(evento);
  const opcoes = [
    {
      titulo: "Antecedencia do aviso",
      descricao: rotuloAntecedencia(freq.antecedencia),
      seta: true,
      acao: () => abrirOpcoesAntecedenciaEventoManual(evento),
    },
    {
      titulo: "Alarme do evento",
      descricao: rotuloAlarmeTarefa(freq),
      seta: true,
      acao: () => abrirOpcoesAlarmeEventoManual(evento),
    },
  ];

  if (!evento.aniversario) {
    opcoes.unshift({
      titulo: "Repeticao",
      descricao: rotuloRepeticaoEventoManual(evento),
      seta: true,
      acao: () => abrirOpcoesRepeticaoEventoManual(evento),
    });
  }

  abrirModalOpcoesFrequencia("Frequencia do evento", evento.titulo || "Evento", opcoes);
}

function abrirOpcoesAlarmeEventoManual(evento) {
  evento = obterEventoManualBase(evento);
  const freq = obterFrequenciaEventoManual(evento);

  abrirOpcoesAlarmeGenerico({
    titulo: "Alarme do evento",
    subtitulo: evento.titulo || "Evento",
    alarmeAtivo: freq.alarme,
    descricaoLigado: "Toca o som e vibra quando o evento avisar.",
    descricaoDesligado: "Mostra o aviso sem tocar alarme neste evento.",
    onSave: (alarme) =>
      salvarFrequenciaEventoManual(
        evento.id,
        { alarme },
        alarme
          ? "Alarme do evento ativado!"
          : "Este evento agora apenas notifica.",
      ),
  });
}

function abrirOpcoesRepeticaoEventoManual(evento) {
  evento = obterEventoManualBase(evento);
  const diasSelecionados = obterDiasRepeticaoEvento(evento);
  const mesesSelecionados = obterMesesRepeticaoEvento(evento);

  abrirModalOpcoesFrequencia("Repeticao", evento.titulo || "Evento", [
    {
      titulo: "Dias",
      descricao: diasSelecionados.length
        ? rotuloRepeticaoEventoManual(evento)
        : "Escolher dias do mes",
      ativo: diasSelecionados.length > 0,
      seta: true,
      acao: () => abrirGradeIntervaloDiasEvento(evento),
    },
    {
      titulo: "Meses",
      descricao: mesesSelecionados.length
        ? rotuloRepeticaoEventoManual(evento)
        : "Escolher meses do ano",
      ativo: mesesSelecionados.length > 0,
      seta: true,
      acao: () => abrirGradeMesesEvento(evento),
    },
  ]);
}

function abrirGradeIntervaloDiasEvento(evento) {
  evento = obterEventoManualBase(evento);
  const diasSelecionados = obterDiasRepeticaoEvento(evento);

  abrirModalGradeFrequencia({
    titulo: "Escolher dias",
    subtitulo: "Selecione os dias do mes em que o evento aparecera.",
    itens: Array.from({ length: 31 }, (_, index) => ({
      valor: index + 1,
      label: String(index + 1),
    })),
    selecionados: diasSelecionados,
    multiselecionavel: true,
    classe: "grade-dia-mes-frequencia",
    onSave: (dias) => {
      if (!dias.length) {
        mostrarAviso("aviso", "Selecione pelo menos um dia.");
        return;
      }

      const diasAtualizados = [...new Set(dias.map(Number))].sort((a, b) => a - b);
      const mesesExistentes = obterMesesRepeticaoEvento(evento);
      const repeticao = {
        modo: mesesExistentes.length ? "meses" : "dias",
        dias: diasAtualizados,
      };

      if (mesesExistentes.length) {
        repeticao.meses = mesesExistentes;
      }

      salvarFrequenciaEventoManual(evento.id, { repeticao });
    },
  });
}

function abrirGradeMesesEvento(evento) {
  evento = obterEventoManualBase(evento);
  const mesOriginal = criarDataLocalPorISO(evento.dataOriginal || evento.data)?.getMonth() ?? 0;
  const mesesSelecionados = obterMesesRepeticaoEvento(evento);

  abrirModalGradeFrequencia({
    titulo: "Escolher mes",
    subtitulo: "Selecione em quais meses o evento aparecera.",
    itens: mesesFrequenciaAno,
    selecionados: mesesSelecionados.length ? mesesSelecionados : [mesOriginal],
    classe: "grade-meses-frequencia",
    onSave: (meses) => {
      if (!meses.length) {
        mostrarAviso("aviso", "Escolha pelo menos um mes.");
        return;
      }

      const mesesAtualizados = [...new Set(meses.map(Number))].sort((a, b) => a - b);
      const diasExistentes = obterDiasRepeticaoEvento(evento);

      salvarFrequenciaEventoManual(evento.id, {
        repeticao: {
          modo: "meses",
          meses: mesesAtualizados,
          dias: diasExistentes,
        },
      });
    },
  });
}

function abrirOpcoesAntecedenciaEventoManual(evento) {
  evento = obterEventoManualBase(evento);
  const freq = obterFrequenciaEventoManual(evento);

  abrirModalOpcoesFrequencia(
    "Antecedencia do aviso",
    evento.titulo || "Evento",
    [
      {
        titulo: "1 Dia",
        ativo:
          freq.antecedencia?.unidade === "dia" &&
          Number(freq.antecedencia.valor) === 1,
        acao: () =>
          salvarFrequenciaEventoManual(evento.id, {
            antecedencia: criarAntecedencia("dia", 1),
          }),
      },
      {
        titulo: "1 Semana",
        ativo:
          freq.antecedencia?.unidade === "semana" &&
          Number(freq.antecedencia.valor) === 1,
        acao: () =>
          salvarFrequenciaEventoManual(evento.id, {
            antecedencia: criarAntecedencia("semana", 1),
          }),
      },
      {
        titulo: "1 Mes",
        ativo:
          freq.antecedencia?.unidade === "mes" &&
          Number(freq.antecedencia.valor) === 1,
        acao: () =>
          salvarFrequenciaEventoManual(evento.id, {
            antecedencia: criarAntecedencia("mes", 1),
          }),
      },
      {
        titulo: "Personalizado",
        descricao: rotuloAntecedencia(freq.antecedencia),
        seta: true,
        acao: () =>
          abrirNumeroAntecedenciaCalendario({
            valorAtual: freq.antecedencia,
            onSave: (antecedencia) =>
              salvarFrequenciaEventoManual(evento.id, {
                antecedencia: criarAntecedencia(
                  antecedencia.unidade,
                  antecedencia.valor,
                ),
              }),
          }),
      },
    ],
  );
}

function abrirPainelFrequenciaEventoPrazo(evento) {
  frequenciaEventoAtual = evento;
  const pref = obterPreferenciaPrazoEvento(evento);

  abrirModalOpcoesFrequencia(
    "Frequência do evento",
    evento.titulo || "Evento",
    [
      {
        titulo: "Repetição",
        descricao: "Não disponível em eventos com prazo",
        desabilitada: true,
      },
      {
        titulo: "Antecedência do aviso",
        descricao: rotuloAntecedencia(pref.antecedencia),
        seta: true,
        acao: () => abrirOpcoesAntecedenciaEventoPrazo(evento),
      },
      {
        titulo: "Alarme do aviso",
        descricao: rotuloAlarmeTarefa(pref),
        seta: true,
        acao: () => abrirOpcoesAlarmeEventoPrazo(evento),
      },
    ],
  );
}

function obterPreferenciaPrazoEvento(evento) {
  if (evento.tipo === "tarefa") {
    return obterPreferenciaEfetivaTarefa({
      id: evento.tarefaId,
      prazo: evento.prazo || formatarDataBR(evento.data).slice(0, 5),
      horario: evento.horario,
    });
  }

  return obterPreferenciaPrazoExterna(
    `lembrete-${evento.lembreteId || evento.id}`,
  );
}

function salvarAntecedenciaEventoPrazo(evento, antecedencia) {
  if (evento.tipo === "tarefa") {
    salvarPreferenciaTarefa(evento.tarefaId, {
      modo: "prazo",
      antecedencia,
    });
  } else {
    salvarPreferenciaCalendario(`lembrete-${evento.lembreteId || evento.id}`, {
      modo: "prazo",
      antecedencia,
    });
  }

  fecharModalOpcoesFrequencia();
  fecharModalNumeroFrequencia();
  mostrarMensagem("Antecedência atualizada!");
}

function salvarAlarmeEventoPrazo(evento, alarme) {
  if (evento.tipo === "tarefa") {
    salvarPreferenciaTarefa(evento.tarefaId, {
      modo: "prazo",
      alarme,
    });
  } else {
    salvarPreferenciaCalendario(`lembrete-${evento.lembreteId || evento.id}`, {
      modo: "prazo",
      alarme,
    });
  }

  fecharModalOpcoesFrequencia();
  fecharModalNumeroFrequencia();
  mostrarMensagem(
    alarme ? "Alarme do aviso ativado!" : "Este aviso agora apenas notifica.",
  );
}

function abrirOpcoesAlarmeEventoPrazo(evento) {
  const pref = obterPreferenciaPrazoEvento(evento);

  abrirOpcoesAlarmeGenerico({
    titulo: "Alarme do aviso",
    subtitulo: evento.titulo || "Evento com prazo",
    alarmeAtivo: pref.alarme,
    descricaoLigado: "Toca o som e vibra quando este aviso disparar.",
    descricaoDesligado: "Mostra o aviso sem tocar alarme.",
    onSave: (alarme) => salvarAlarmeEventoPrazo(evento, alarme),
  });
}

function abrirOpcoesAntecedenciaEventoPrazo(evento) {
  const pref = obterPreferenciaPrazoEvento(evento);

  abrirModalOpcoesFrequencia(
    "Antecedência do aviso",
    evento.titulo || "Evento com prazo",
    [
      {
        titulo: "1 hora antes",
        ativo:
          pref.antecedencia?.unidade === "hora" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaEventoPrazo(evento, criarAntecedencia("hora", 1)),
      },
      {
        titulo: "1 dia antes",
        ativo:
          pref.antecedencia?.unidade === "dia" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaEventoPrazo(evento, criarAntecedencia("dia", 1)),
      },
      {
        titulo: "1 semana antes",
        ativo:
          pref.antecedencia?.unidade === "semana" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaEventoPrazo(evento, criarAntecedencia("semana", 1)),
      },
      {
        titulo: "Personalizado",
        descricao: rotuloAntecedencia(pref.antecedencia),
        seta: true,
        acao: () =>
          abrirNumeroAntecedenciaPrazo({
            valorAtual: pref.antecedencia,
            onSave: (antecedencia) =>
              salvarAntecedenciaEventoPrazo(
                evento,
                criarAntecedencia(antecedencia.unidade, antecedencia.valor),
              ),
          }),
      },
    ],
  );
}

function diaExisteNoMes(dia, mes, ano) {
  return dia >= 1 && dia <= new Date(ano, mes + 1, 0).getDate();
}

function ocorrenciaEventoExcluida(evento, dataISO) {
  return Array.isArray(evento.excecoes) && evento.excecoes.includes(dataISO);
}

function gerarOcorrenciasEventoManual(evento, ano, mes) {
  const dataOriginal = criarDataLocalPorISO(evento.dataOriginal || evento.data);
  if (!dataOriginal) return [];

  if (evento.tipoEvento !== "permanente") {
    return evento.data ===
      formatarDataISO(new Date(ano, mes, dataOriginal.getDate())) ||
      (dataOriginal.getFullYear() === ano && dataOriginal.getMonth() === mes)
      ? [
          {
            ...evento,
            tipo: "manual",
            data: formatarDataISO(dataOriginal),
            dataOriginal: evento.dataOriginal || evento.data,
          },
        ]
      : [];
  }

  const repeticao = evento.frequencia?.repeticao;
  const ocorrencias = [];

  if (repeticao?.modo === "dias") {
    if (
      ano !== dataOriginal.getFullYear() ||
      mes !== dataOriginal.getMonth()
    ) {
      return [];
    }

    const dias = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).filter((d) => d >= 1 && d <= 31)
      : [];

    dias.forEach((dia) => {
      if (!diaExisteNoMes(dia, mes, ano)) return;

      const data = new Date(ano, mes, dia);

      if (data >= dataOriginal) {
        const dataISO = formatarDataISO(data);
        if (ocorrenciaEventoExcluida(evento, dataISO)) return;

        ocorrencias.push({
          ...evento,
          tipo: "manual",
          data: dataISO,
          dataOriginal: evento.dataOriginal || evento.data,
        });
      }
    });

    return ocorrencias;
  }

  if (repeticao?.modo === "meses") {
    const meses = (repeticao.meses || []).map(Number);
    const dias = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).filter((dia) => dia >= 1 && dia <= 31)
      : [dataOriginal.getDate()];

    if (!meses.includes(mes)) return [];

    dias.forEach((dia) => {
      if (!diaExisteNoMes(dia, mes, ano)) return;

      const ocorrencia = new Date(ano, mes, dia);
      const dataISO = formatarDataISO(ocorrencia);
      if (ocorrenciaEventoExcluida(evento, dataISO)) return;

      ocorrencias.push({
        ...evento,
        tipo: "manual",
        data: dataISO,
        dataOriginal: evento.dataOriginal || evento.data,
      });
    });

    return ocorrencias;
  }

  const dia = dataOriginal.getDate();
  const mesOriginal = dataOriginal.getMonth();

  if (mes === mesOriginal && diaExisteNoMes(dia, mes, ano)) {
    const ocorrencia = new Date(ano, mes, dia);
    if (ocorrencia < dataOriginal) return [];
    const dataISO = formatarDataISO(ocorrencia);
    if (ocorrenciaEventoExcluida(evento, dataISO)) return [];

    return [
      {
        ...evento,
        tipo: "manual",
        data: dataISO,
        dataOriginal: evento.dataOriginal || evento.data,
      },
    ];
  }

  return [];
}

function montarOcorrenciaEventoManual(evento, data) {
  const dataISO = formatarDataISO(data);
  if (ocorrenciaEventoExcluida(evento, dataISO)) return null;

  return {
    ...evento,
    tipo: "manual",
    data: dataISO,
    dataOriginal: evento.dataOriginal || evento.data,
  };
}

function gerarOcorrenciasEventoManualEmPeriodo(evento, inicio, fim) {
  const ocorrencias = [];
  const dataOriginal = criarDataLocalPorISO(evento.dataOriginal || evento.data);

  if (!dataOriginal) return ocorrencias;

  if (evento.tipoEvento !== "permanente") {
    if (dataOriginal >= inicio && dataOriginal <= fim) {
      const item = montarOcorrenciaEventoManual(evento, dataOriginal);
      if (item) ocorrencias.push(item);
    }

    return ocorrencias;
  }

  const repeticao = evento.frequencia?.repeticao;

  if (repeticao?.modo === "dias") {
    const diasSelecionados = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).filter((dia) => dia >= 1 && dia <= 31)
      : [];

    if (!diasSelecionados.length) return ocorrencias;

    const cursor = new Date(
      dataOriginal.getFullYear(),
      dataOriginal.getMonth(),
      1,
    );
    const ultimoDiaMesOriginal = new Date(
      dataOriginal.getFullYear(),
      dataOriginal.getMonth() + 1,
      0,
    );

    while (cursor <= fim && cursor <= ultimoDiaMesOriginal) {
      const ano = cursor.getFullYear();
      const mes = cursor.getMonth();

      diasSelecionados.forEach((dia) => {
        if (!diaExisteNoMes(dia, mes, ano)) return;

        const dataOcorrencia = new Date(ano, mes, dia);

        if (dataOcorrencia < dataOriginal) return;
        if (dataOcorrencia < inicio || dataOcorrencia > fim) return;

        const item = montarOcorrenciaEventoManual(evento, dataOcorrencia);
        if (item) ocorrencias.push(item);
      });

      cursor.setMonth(cursor.getMonth() + 1, 1);
    }

    return ocorrencias;
  }

  if (repeticao?.modo === "meses") {
    const meses = (repeticao.meses || []).map(Number);
    const diasSelecionados = Array.isArray(repeticao.dias)
      ? repeticao.dias.map(Number).filter((dia) => dia >= 1 && dia <= 31)
      : [dataOriginal.getDate()];

    if (!meses.length || !diasSelecionados.length) return ocorrencias;

    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);

    while (cursor <= fim) {
      const ano = cursor.getFullYear();
      const mes = cursor.getMonth();

      if (meses.includes(mes)) {
        diasSelecionados.forEach((dia) => {
          if (!diaExisteNoMes(dia, mes, ano)) return;

          const dataOcorrencia = new Date(ano, mes, dia);

          if (dataOcorrencia < inicio || dataOcorrencia > fim) return;

          const item = montarOcorrenciaEventoManual(evento, dataOcorrencia);
          if (item) ocorrencias.push(item);
        });
      }

      cursor.setMonth(cursor.getMonth() + 1, 1);
    }

    return ocorrencias;
  }

  return ocorrencias;
}

function mostrarConfirmacaoExclusaoEventoRelacionado(evento, dataISO) {
  mostrarConfirmacaoComOpcoes(
    `Excluir "${evento.titulo}"?`,
    "Esse evento possui repetições. O que deseja excluir?",
    [
      {
        texto: "Só este evento",
        classe: "btn-secundario",
        acao: async () => {
          excluirApenasOcorrenciaEventoManual(evento.id, dataISO);

          await renderizarCalendario();
          mostrarEventosDoDia(dataISO);
          carregarLembretes();
          mostrarMensagem("Ocorrência excluída.");
        },
      },
      {
        texto: "Todos relacionados",
        classe: "btn-primario",
        acao: async () => {
          excluirEventoManualCompleto(evento.id);

          await renderizarCalendario();
          mostrarEventosDoDia(dataISO);
          carregarLembretes();
          mostrarMensagem("Eventos relacionados excluídos.");
        },
      },
    ],
  );
}

function excluirApenasOcorrenciaEventoManual(eventoId, dataISO) {
  const eventos = carregarEventosManuais().map((evento) => {
    if (String(evento.id) !== String(eventoId)) return evento;

    const excecoes = new Set([...(evento.excecoes || []), dataISO]);

    return {
      ...evento,
      excecoes: [...excecoes],
    };
  });

  salvarEventosManuais(eventos);
}

function excluirEventoManualCompleto(eventoId) {
  const eventos = carregarEventosManuais().filter(
    (evento) => String(evento.id) !== String(eventoId),
  );

  salvarEventosManuais(eventos);
}

function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
}

function deslocarData(data, dias) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

function obterDiaSemanaDoMes(ano, mes, diaSemana, ocorrencia) {
  const data = new Date(ano, mes, 1);

  while (data.getDay() !== diaSemana) {
    data.setDate(data.getDate() + 1);
  }

  data.setDate(data.getDate() + 7 * (ocorrencia - 1));
  return data;
}

function criarEventoFeriado(id, titulo, data) {
  const dataISO = formatarDataISO(data);

  return {
    id: `feriado-${id}-${data.getFullYear()}`,
    chaveFeriado: id,
    tipo: "feriado",
    data: dataISO,
    titulo,
    horario: "09:00",
    classeEvento: "evento-feriado",
  };
}

function obterFeriadosBrasileiros(ano) {
  const pascoa = calcularPascoa(ano);
  const segundoDomingoDeMaio = obterDiaSemanaDoMes(ano, 4, 0, 2);
  const segundoDomingoDeAgosto = obterDiaSemanaDoMes(ano, 7, 0, 2);

  const feriados = [
    criarEventoFeriado(
      "confraternizacao",
      "Confraternização Universal",
      new Date(ano, 0, 1),
    ),
    criarEventoFeriado(
      "dia-mulher",
      "Dia Internacional da Mulher",
      new Date(ano, 2, 8),
    ),
    criarEventoFeriado(
      "segunda-carnaval",
      "Segunda de Carnaval",
      deslocarData(pascoa, -48),
    ),
    criarEventoFeriado("carnaval", "Carnaval", deslocarData(pascoa, -47)),
    criarEventoFeriado(
      "sexta-santa",
      "Sexta-feira Santa",
      deslocarData(pascoa, -2),
    ),
    criarEventoFeriado("pascoa", "Páscoa", pascoa),
    criarEventoFeriado("tiradentes", "Tiradentes", new Date(ano, 3, 21)),
    criarEventoFeriado(
      "descobrimento-brasil",
      "Descobrimento do Brasil",
      new Date(ano, 3, 22),
    ),
    criarEventoFeriado("trabalho", "Dia do Trabalho", new Date(ano, 4, 1)),
    criarEventoFeriado(
      "dia-maes",
      "Dia das Mães",
      segundoDomingoDeMaio,
    ),
    criarEventoFeriado(
      "corpus-christi",
      "Corpus Christi",
      deslocarData(pascoa, 60),
    ),
    criarEventoFeriado(
      "dia-namorados",
      "Dia dos Namorados",
      new Date(ano, 5, 12),
    ),
    criarEventoFeriado("sao-joao", "São João", new Date(ano, 5, 24)),
    criarEventoFeriado(
      "dia-pais",
      "Dia dos Pais",
      segundoDomingoDeAgosto,
    ),
    criarEventoFeriado(
      "independencia",
      "Independência do Brasil",
      new Date(ano, 8, 7),
    ),
    criarEventoFeriado(
      "nossa-senhora",
      "Nossa Senhora Aparecida",
      new Date(ano, 9, 12),
    ),
    criarEventoFeriado(
      "dia-criancas",
      "Dia das Crianças",
      new Date(ano, 9, 12),
    ),
    criarEventoFeriado(
      "dia-professores",
      "Dia dos Professores",
      new Date(ano, 9, 15),
    ),
    criarEventoFeriado("finados", "Finados", new Date(ano, 10, 2)),
    criarEventoFeriado(
      "proclamacao",
      "Proclamação da República",
      new Date(ano, 10, 15),
    ),
    criarEventoFeriado(
      "consciencia-negra",
      "Consciência Negra",
      new Date(ano, 10, 20),
    ),
    criarEventoFeriado("natal", "Natal", new Date(ano, 11, 25)),
  ];

  return feriados.sort((a, b) => a.data.localeCompare(b.data));
}

function carregarEventosFeriados(ano) {
  return obterFeriadosBrasileiros(ano);
}

function obterPreferenciaFeriado(evento) {
  const chave = `feriado-${evento.chaveFeriado}`;
  const salva = obterPreferenciaCalendario(chave);

  return {
    modo: "feriado",
    antecedencia: salva?.antecedencia || criarAntecedencia("dia", 1, true),
  };
}

function salvarAntecedenciaFeriado(evento, antecedencia) {
  salvarPreferenciaCalendario(`feriado-${evento.chaveFeriado}`, {
    modo: "feriado",
    antecedencia,
  });

  fecharModalOpcoesFrequencia();
  fecharModalNumeroFrequencia();
  renderizarCalendario();
  if (dataSelecionadaCalendario) mostrarEventosDoDia(dataSelecionadaCalendario);
  mostrarMensagem("Antecedência do feriado atualizada!");
}

function abrirPainelFrequenciaFeriado(evento) {
  frequenciaEventoAtual = evento;
  const pref = obterPreferenciaFeriado(evento);

  abrirModalOpcoesFrequencia("Feriado brasileiro", evento.titulo || "Feriado", [
    {
      titulo: "Antecedência do aviso",
      descricao: rotuloAntecedencia(pref.antecedencia),
      seta: true,
      acao: () => abrirOpcoesAntecedenciaFeriado(evento),
    },
  ]);
}

function abrirOpcoesAntecedenciaFeriado(evento) {
  const pref = obterPreferenciaFeriado(evento);

  abrirModalOpcoesFrequencia(
    "Antecedência do aviso",
    evento.titulo || "Feriado",
    [
      {
        titulo: "1 Dia",
        ativo:
          pref.antecedencia?.unidade === "dia" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaFeriado(evento, criarAntecedencia("dia", 1)),
      },
      {
        titulo: "1 Semana",
        ativo:
          pref.antecedencia?.unidade === "semana" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaFeriado(evento, criarAntecedencia("semana", 1)),
      },
      {
        titulo: "1 Mês",
        ativo:
          pref.antecedencia?.unidade === "mes" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaFeriado(evento, criarAntecedencia("mes", 1)),
      },
      {
        titulo: "Personalizado",
        descricao: rotuloAntecedencia(pref.antecedencia),
        seta: true,
        acao: () =>
          abrirNumeroAntecedenciaCalendario({
            valorAtual: pref.antecedencia,
            onSave: (antecedencia) =>
              salvarAntecedenciaFeriado(
                evento,
                criarAntecedencia(antecedencia.unidade, antecedencia.valor),
              ),
          }),
      },
    ],
  );
}

function verificarFeriadosComAntecedencia() {
  if (!configuracoesNotificacao.notificacoesGerais) return;

  try {
    const agora = new Date();
    const anos = [agora.getFullYear(), agora.getFullYear() + 1];

    anos.flatMap(obterFeriadosBrasileiros).forEach((feriado) => {
      const pref = obterPreferenciaFeriado(feriado);
      const antecedenciaMinutos = converterAntecedenciaParaMinutos(
        pref.antecedencia,
      );
      const alvo = montarDataHoraLocal(feriado.data, feriado.horario, "09:00");
      const minutosRestantes = diferencaEmMinutosAteData(alvo);
      const chave = `feriado-${feriado.chaveFeriado}-${feriado.data}-${antecedenciaMinutos}`;

      if (
        estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
        !notificacoesJaEnviadas.has(chave)
      ) {
        mostrarNotificacao(
          "Feriado próximo",
          `${feriado.titulo} começa em ${rotuloAntecedencia(pref.antecedencia).replace(" antes", "").toLowerCase()}.`,
        );
        notificacoesJaEnviadas.add(chave);
      }
    });
  } catch (erro) {
    console.error("Erro ao verificar feriados:", erro);
  }
}

async function carregarTarefasUsuarioParaNotificacoes() {
  const rotinas = await buscarRotinas();
  const tarefasPorRotina = await Promise.all(
    rotinas.map(async (rotina) => ({
      rotina,
      tarefas: await buscarTarefasDaRotina(rotina.id),
    })),
  );

  return tarefasPorRotina.flatMap(({ rotina, tarefas }) =>
    tarefas.map((tarefa) => ({
      ...tarefa,
      rotinaNome: rotina.nome,
    })),
  );
}

async function verificarTarefasComAntecedencia() {
  if (
    !configuracoesNotificacao.notificacoesGerais ||
    !configuracoesNotificacao.notificacoesPorRotina
  )
    return;

  try {
    const tarefas = await carregarTarefasUsuarioParaNotificacoes();
    const hoje = dataHojeISO();

    tarefas.forEach((tarefa) => {
      if (String(tarefa.status).toLowerCase().includes("conclu")) return;
      if (!tarefa.notificacao) return;

      const pref = obterPreferenciaEfetivaTarefa(tarefa);
      const antecedenciaMinutos = converterAntecedenciaParaMinutos(
        pref.antecedencia,
      );

      if (tarefaTemPrazo(tarefa)) {
        const alvo = obterDataPrazoComHorario(tarefa.prazo, tarefa.horario);
        const minutosRestantes = diferencaEmMinutosAteData(alvo);
        if (minutosRestantes === null || minutosRestantes < 0) return;

        const dataAlvo = alvo.toISOString();
        const chave = `tarefa-prazo-${tarefa.id}-${dataAlvo}-${antecedenciaMinutos}`;

        if (
          estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
          !notificacoesJaEnviadas.has(chave)
        ) {
          mostrarNotificacao(
            "Prazo proximo",
            `${tarefa.titulo} vence em ${rotuloAntecedencia(pref.antecedencia).replace(" antes", "").toLowerCase()}.`,
            { rotina: true, tarefa: true, alarme: false },
          );
          notificacoesJaEnviadas.add(chave);
        }

        if (
          tarefa.horario &&
          minutosRestantes <= 0 &&
          minutosRestantes > -1 &&
          !notificacoesJaEnviadas.has(`${chave}-hora`)
        ) {
          mostrarNotificacao(
            "Agora!",
            `${tarefa.titulo} esta acontecendo agora.`,
            {
              rotina: true,
              tarefa: true,
              tarefaId: tarefa.id,
              rotinaId: tarefa.rotina_id || tarefa.rotinaId,
              horario: tarefa.horario,
              alarme: pref.alarme !== false,
            },
          );
          notificacoesJaEnviadas.add(`${chave}-hora`);
        }

        return;
      }

      if (!tarefa.horario) return;
      if (!deveNotificarHojePelaRepeticao(pref.repeticao)) return;

      const minutosRestantes = diferencaEmMinutos(tarefa.horario);
      if (minutosRestantes === null) return;

      const chave = `tarefa-${tarefa.id}-${hoje}-${tarefa.horario}-${antecedenciaMinutos}`;

      if (
        estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
        !notificacoesJaEnviadas.has(chave)
      ) {
        mostrarNotificacao(
          "Tarefa proxima",
          `${tarefa.titulo} comeca em ${rotuloAntecedencia(pref.antecedencia).replace(" antes", "").toLowerCase()}.`,
          { rotina: true, tarefa: true, alarme: false },
        );
        notificacoesJaEnviadas.add(chave);
      }

      if (
        minutosRestantes <= 0 &&
        minutosRestantes > -1 &&
        !notificacoesJaEnviadas.has(`${chave}-hora`)
      ) {
        mostrarNotificacao(
          "Agora!",
          `${tarefa.titulo} esta acontecendo agora.`,
          {
            rotina: true,
            tarefa: true,
            tarefaId: tarefa.id,
            rotinaId: tarefa.rotina_id || tarefa.rotinaId,
            horario: tarefa.horario,
            alarme: pref.alarme !== false,
          },
        );
        notificacoesJaEnviadas.add(`${chave}-hora`);
      }
    });
  } catch (erro) {
    console.error("Erro ao verificar tarefas com antecedência:", erro);
  }
}

async function verificarLembretesComAntecedencia() {
  if (!configuracoesNotificacao.notificacoesGerais) return;

  try {
    const lembretes = await buscarLembretes();
    const hoje = dataHojeISO();

    lembretes.forEach((lembrete) => {
      if (String(lembrete.status).toLowerCase().includes("conclu")) return;
      if (!lembrete.notificacao) return;

      if (lembrete.dia_mes && lembrete.dia_mes.includes("/")) {
        const pref = obterPreferenciaLembrete(lembrete);
        const antecedenciaMinutos = converterAntecedenciaParaMinutos(
          pref.antecedencia,
        );
        const alvo = obterDataPrazoComHorario(
          lembrete.dia_mes,
          lembrete.horario,
        );
        const minutosRestantes = diferencaEmMinutosAteData(alvo);

        if (minutosRestantes === null || minutosRestantes < 0) return;

        const chave = `lembrete-prazo-${lembrete.id}-${alvo.toISOString()}-${antecedenciaMinutos}`;

        if (
          estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
          !notificacoesJaEnviadas.has(chave)
        ) {
          mostrarNotificacao(
            "Lembrete próximo",
            `${lembrete.titulo} vence em ${rotuloAntecedencia(pref.antecedencia).replace(" antes", "").toLowerCase()}.`,
            { lembrete: true, alarme: false },
          );
          notificacoesJaEnviadas.add(chave);
        }

        if (
          lembrete.horario &&
          minutosRestantes <= 0 &&
          minutosRestantes > -1 &&
          !notificacoesJaEnviadas.has(`${chave}-hora`)
        ) {
          mostrarNotificacao(
            "Agora!",
            `${lembrete.titulo} está acontecendo agora.`,
            { lembrete: true, alarme: pref.alarme !== false },
          );
          notificacoesJaEnviadas.add(`${chave}-hora`);
        }

        return;
      }

      if (!lembrete.horario) return;

      const pref = obterPreferenciaLembrete(lembrete);
      const antecedenciaMinutos = converterAntecedenciaParaMinutos(
        pref.antecedencia,
      );
      const minutosRestantes = diferencaEmMinutos(lembrete.horario);
      if (minutosRestantes === null) return;

      const chave = `${lembrete.id}-${hoje}-${lembrete.horario}-${antecedenciaMinutos}`;

      if (
        estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
        !notificacoesJaEnviadas.has(chave)
      ) {
        mostrarNotificacao(
          "Lembrete próximo",
          `${lembrete.titulo} começa em ${rotuloAntecedencia(pref.antecedencia).replace(" antes", "").toLowerCase()}.`,
          { lembrete: true, alarme: false },
        );
        notificacoesJaEnviadas.add(chave);
      }

      if (
        minutosRestantes <= 0 &&
        minutosRestantes > -1 &&
        !notificacoesJaEnviadas.has(`${chave}-hora`)
      ) {
        mostrarNotificacao(
          "Agora!",
          `${lembrete.titulo} está acontecendo agora.`,
          { lembrete: true, alarme: pref.alarme !== false },
        );
        notificacoesJaEnviadas.add(`${chave}-hora`);
      }
    });
  } catch (erro) {
    console.error("Erro ao verificar lembretes com antecedência:", erro);
  }
}

function verificarEventosCalendarioComAntecedencia() {
  if (!configuracoesNotificacao.notificacoesGerais) return;

  try {
    const agora = new Date();
    carregarEventosManuais().forEach((evento) => {
      const freq = obterFrequenciaEventoManual(evento);
      const antecedenciaMinutos = converterAntecedenciaParaMinutos(
        freq.antecedencia,
      );
      const fimBusca = new Date(agora);
      const diasBusca = Math.min(
        370,
        Math.max(2, Math.ceil(antecedenciaMinutos / 1440) + 2),
      );
      fimBusca.setDate(fimBusca.getDate() + diasBusca);
      const ocorrencias = gerarOcorrenciasEventoManualEmPeriodo(
        evento,
        agora,
        fimBusca,
      );

      ocorrencias.forEach((ocorrencia) => {
        const alvo = montarDataHoraLocal(
          ocorrencia.data,
          ocorrencia.horario,
          "09:00",
        );
        const minutosRestantes = diferencaEmMinutosAteData(alvo);
        if (minutosRestantes === null || minutosRestantes < 0) return;

        const chave = `evento-manual-${evento.id}-${ocorrencia.data}-${ocorrencia.horario || "09:00"}-${antecedenciaMinutos}`;

        if (
          estaNaJanelaDeAviso(minutosRestantes, antecedenciaMinutos) &&
          !notificacoesJaEnviadas.has(chave)
        ) {
          mostrarNotificacao(
            "Evento próximo",
            `${evento.titulo} começa em ${rotuloAntecedencia(freq.antecedencia).replace(" antes", "").toLowerCase()}.`,
            { evento: true, alarme: false },
          );
          notificacoesJaEnviadas.add(chave);
        }

        if (
          ocorrencia.horario &&
          minutosRestantes <= 0 &&
          minutosRestantes > -1 &&
          !notificacoesJaEnviadas.has(`${chave}-hora`)
        ) {
          mostrarNotificacao(
            "Agora!",
            `${evento.titulo} está acontecendo agora.`,
            { evento: true, alarme: freq.alarme !== false },
          );
          notificacoesJaEnviadas.add(`${chave}-hora`);
        }
      });
    });
  } catch (erro) {
    console.error("Erro ao verificar eventos do calendário:", erro);
  }
}

function normalizarTextoColuna(coluna) {
  return String(coluna || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function colunaSempreVisivel(texto, indice, total) {
  const coluna = normalizarTextoColuna(texto);
  if (
    indice === 0 &&
    (coluna === "" || coluna === "tarefa" || coluna === "refeicao")
  )
    return true;
  if (indice === total - 1 || coluna.includes("acoes")) return true;
  return coluna === "tarefa" || coluna === "refeicao";
}

function marcarColunasOpcionaisTabela() {
  const tabela = document.querySelector(".tabela-tarefas");
  if (!tabela) return;

  const cabecalhos = [...tabela.querySelectorAll("thead th")];
  if (!cabecalhos.length) return;

  cabecalhos.forEach((th, indice) => {
    const opcional = !colunaSempreVisivel(
      th.textContent,
      indice,
      cabecalhos.length,
    );
    th.classList.toggle("coluna-opcional", opcional);
  });

  tabela.querySelectorAll("tbody tr").forEach((linha) => {
    [...linha.children].forEach((celula, indice) => {
      const cabecalho = cabecalhos[indice];
      celula.classList.toggle(
        "coluna-opcional",
        !!cabecalho?.classList.contains("coluna-opcional"),
      );
    });
  });
}

function renderizarCabecalhoPersonalizado(campos) {
  const thead = document.querySelector(".tabela-tarefas thead tr");
  thead.innerHTML = "";

  const mapa = obterRotulosCamposDaRotina();

  if (modoEdicaoTabela) {
    const thArrastar = document.createElement("th");
    thArrastar.textContent = "";
    thead.appendChild(thArrastar);
  }

  const camposPrincipais = campos.filter((campo) => campo !== "notificacao");

  camposPrincipais.forEach((campo) => {
    const th = document.createElement("th");
    th.textContent = mapa[campo] || campo;
    thead.appendChild(th);
  });

  // ações sempre no final
  const thNotificacao = document.createElement("th");
  thNotificacao.textContent = "Notificação";
  thead.appendChild(thNotificacao);

  const thAcoes = document.createElement("th");
  thAcoes.textContent = "Ações";
  thead.appendChild(thAcoes);
  marcarColunasOpcionaisTabela();
}

async function mostrarResumoDiario() {
  try {
    if (
      !configuracoesNotificacao.notificacoesGerais ||
      !configuracoesNotificacao.resumoDiario
    )
      return;
    if (localStorage.getItem("resumoMostrado") === resumoHoje) return;

    const rotinas = await buscarRotinas();
    const [tarefasPorRotina, lembretes] = await Promise.all([
      Promise.all(rotinas.map((rotina) => buscarTarefasDaRotina(rotina.id))),
      buscarLembretes(),
    ]);

    const totalTarefas = tarefasPorRotina
      .flat()
      .filter((t) => !String(t.status).toLowerCase().includes("conclu"))
      .length;

    const totalLembretes = lembretes.filter(
      (l) => !String(l.status).toLowerCase().includes("conclu"),
    ).length;

    if (totalTarefas === 0 && totalLembretes === 0) return;

    mostrarNotificacao(
      "Resumo do dia",
      `Você tem ${totalTarefas} tarefas e ${totalLembretes} lembretes pendentes.`,
    );

    localStorage.setItem("resumoMostrado", resumoHoje);
  } catch (erro) {
    console.error("Erro no resumo diário:", erro);
  }
}

const modelosRotinaProntos = {
  diaria: {
    nome: "Diária",
    titulo: "Diária",
    icone: "☀️",
    descricao:
      "Tabela simples para hábitos, manhã, noite e tarefas com horário.",
    modelo: "tabela",
    campos: ["titulo", "status", "horario", "notificacao"],
    preview: ["Tarefa", "Status", "Horário", "Notificação"],
  },
  estudos: {
    nome: "Estudos",
    titulo: "Estudos",
    icone: "📚",
    descricao: "Organiza provas, atividades, disciplina, horário e material.",
    modelo: "tabela",
    campos: [
      "titulo",
      "tipo",
      "status",
      "disciplina",
      "horario",
      "link_material",
      "notificacao",
    ],
    preview: ["Tarefa", "Tipo", "Disciplina", "Horário", "Material"],
  },
  trabalho: {
    nome: "Trabalho",
    titulo: "Trabalho",
    icone: "💼",
    descricao: "Projetos com prioridade, prazo e acompanhamento de status.",
    modelo: "tabela",
    campos: [
      "titulo",
      "projeto",
      "prioridade",
      "prazo",
      "status",
      "horario",
      "notificacao",
    ],
    preview: ["Tarefa", "Projeto", "Prioridade", "Prazo", "Horário"],
  },
  alimentacao: {
    nome: "Alimentação",
    titulo: "Alimentação",
    icone: "🍽️",
    descricao: "Refeições com alimento, horário, calorias e notificação.",
    modelo: "tabela",
    campos: ["titulo", "tipo", "horario", "calorias", "status", "notificacao"],
    preview: ["Refeição", "Alimento", "Horário", "Calorias"],
  },
  semanal: {
    nome: "Semanal",
    titulo: "Semanal",
    icone: "🗓️",
    descricao:
      "Quadro pronto por dias da semana, ideal para planejamento fixo.",
    modelo: "tabela_por_dia",
    campos: ["titulo", "dia_semana", "status", "notificacao"],
    preview: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  },
  treino: {
    nome: "Treino",
    titulo: "Treino",
    icone: "💪",
    descricao: "Cards por dia com grupo muscular, séries, repetições e carga.",
    modelo: "treino_card",
    campos: [
      "titulo",
      "dia_semana",
      "grupo_muscular",
      "series",
      "repeticoes",
      "carga",
      "status",
    ],
    preview: ["Dia", "Grupo", "Séries", "Repetições", "Carga"],
  },
  personalizada: {
    nome: "",
    titulo: "Personalizada",
    icone: "⚙️",
    descricao: "Monte uma tabela geral escolhendo exatamente os tópicos.",
    modelo: "tabela",
    campos: ["titulo", "status", "horario"],
    preview: ["Campos livres"],
  },
};

const rotulosCamposRotina = {
  titulo: "Título/Tarefa",
  tipo: "Tipo",
  status: "Status",
  disciplina: "Disciplina",
  horario: "Horário",
  notificacao: "Notificação",
  link_material: "Link/Material",
  projeto: "Projeto",
  prioridade: "Prioridade",
  prazo: "Prazo",
  calorias: "Calorias",
  dia_semana: "Dia da semana",
  grupo_muscular: "Grupo muscular",
  series: "Séries",
  repeticoes: "Repetições",
  carga: "Carga",
};

const ordemCamposRotina = Object.keys(rotulosCamposRotina);

function normalizarCamposRotina(
  campos,
  fallback = ["titulo", "status", "horario"],
) {
  let lista = campos;

  if (typeof lista === "string") {
    try {
      lista = JSON.parse(lista);
    } catch {
      lista = lista.split(",").map((campo) => campo.trim());
    }
  }

  if (!Array.isArray(lista)) lista = fallback;

  const unicos = [];
  lista.forEach((campo) => {
    if (!campo || !ordemCamposRotina.includes(campo) || unicos.includes(campo))
      return;
    unicos.push(campo);
  });

  if (!unicos.length) return [];
  if (!unicos.includes("titulo")) unicos.unshift("titulo");
  return ordemCamposRotina.filter((campo) => unicos.includes(campo));
}

function ordenarCamposPorPreferencia(campos, ordemPreferida) {
  const lista = Array.isArray(campos) ? campos : [];
  const usados = new Set();
  const ordenados = [];

  ordemPreferida.forEach((campo) => {
    if (lista.includes(campo)) {
      ordenados.push(campo);
      usados.add(campo);
    }
  });

  lista.forEach((campo) => {
    if (!usados.has(campo)) ordenados.push(campo);
  });

  return ordenados;
}

function obterTemplateRotina(rotina = rotinaAtual) {
  return obterTemplateModalRotinaPorRotina(rotina);
}

function ajustarCamposParaRotina(campos, tipoRotina, rotina = rotinaAtual) {
  const template = obterTemplateRotina(rotina);

  if (tipoRotina === "alimentacao" || template === "alimentacao") {
    return ordenarCamposPorPreferencia(campos, [
      "titulo",
      "tipo",
      "status",
      "horario",
      "calorias",
      "notificacao",
    ]);
  }

  return campos;
}

function obterRotulosCamposDaRotina(
  tipoRotina = obterTipoRotina(tituloRotina.textContent),
) {
  const template = obterTemplateRotina();
  const rotulosPadrao = {
    ...rotulosCamposRotina,
    titulo: "Tarefa",
  };

  if (tipoRotina === "alimentacao" || template === "alimentacao") {
    return {
      ...rotulosPadrao,
      titulo: "Refeição",
      tipo: "Alimento",
    };
  }

  return rotulosPadrao;
}

function obterCamposMarcadosRotina() {
  return normalizarCamposRotina(
    [...document.querySelectorAll(".campoRotinaCheck:checked")].map(
      (campo) => campo.value,
    ),
  );
}

function garantirLayoutModalRotina() {
  if (modalRotina?.classList.contains("modal-rotina-melhorado")) return;

  modalRotina?.classList.add("modal-rotina-melhorado");

  const titulo = modalRotina.querySelector(".modal-header h2");
  if (titulo) titulo.textContent = "Criar rotina";

  const modalBody = modalRotina.querySelector(".modal-body");
  const config = modalRotina.querySelector(".config-rotina-personalizada");
  const nomeLabel = modalBody?.querySelector("label[for='nomeRotinaInput']");

  nomeLabel?.classList.add("label-nome-rotina");
  nomeRotinaInput?.classList.add("input-nome-rotina");

  if (!modalBody || !config || document.getElementById("modelosRotinaProntos"))
    return;

  nomeRotinaInput.insertAdjacentHTML(
    "afterend",
    `
    <div class="modelos-rotina-box">
      <div class="modelos-rotina-topo">
        <span>Modelos prontos</span>
        <small>Escolha uma base e ajuste o nome se quiser.</small>
      </div>
      <div id="modelosRotinaProntos" class="modelos-rotina-grid"></div>
    </div>

    <div id="emojiRotinaPersonalizadaBox" class="emoji-rotina-personalizada hidden">
      <div>
        <label for="emojiRotinaPersonalizadaInput">Emoji da rotina</label>
        <small>Vai aparecer na barra lateral.</small>
      </div>
      <input id="emojiRotinaPersonalizadaInput" type="text" maxlength="4" value="🗂️" aria-label="Emoji da rotina personalizada" />
      <div id="emojiRotinaSugestoes" class="emoji-rotina-sugestoes">
        <button type="button">☀️</button>
        <button type="button">📚</button>
        <button type="button">💪</button>
        <button type="button">💼</button>
        <button type="button">📊</button>
        <button type="button">🍽️</button>
        <button type="button">🗂️</button>
        <button type="button">⭐</button>
        <button type="button">🎯</button>
        <button type="button">🧠</button>
        <button type="button">📌</button>
        <button type="button">✨</button>
        <button type="button">✅</button>
        <button type="button">📝</button>
        <button type="button">📅</button>
        <button type="button">⏰</button>
        <button type="button">💡</button>
        <button type="button">🚀</button>
        <button type="button">🏆</button>
        <button type="button">❤️</button>
        <button type="button">🎨</button>
        <button type="button">🎵</button>
        <button type="button">💻</button>
        <button type="button">📈</button>
        <button type="button">🌱</button>
        <button type="button">🏠</button>
        <button type="button">🛒</button>
        <button type="button">💰</button>
      </div>
    </div>

    <div id="previewRotinaSelecionada" class="preview-rotina-selecionada"></div>
  `,
  );

  emojiRotinaPersonalizadaInput = document.getElementById(
    "emojiRotinaPersonalizadaInput",
  );
  document.querySelectorAll("#emojiRotinaSugestoes button").forEach((botao) => {
    botao.addEventListener("click", () => {
      emojiRotinaPersonalizadaInput.value = botao.textContent.trim();
      atualizarPreviewTemplateRotina(rotinaTemplateAtual);
      atualizarIconeCardEmojiPersonalizado();
    });
  });

  emojiRotinaPersonalizadaInput?.addEventListener("input", () => {
    emojiRotinaPersonalizadaInput.value = normalizarEmojiRotina(
      emojiRotinaPersonalizadaInput.value,
    );
    atualizarPreviewTemplateRotina(rotinaTemplateAtual);
    atualizarIconeCardEmojiPersonalizado();
  });

  config.querySelectorAll("input[name='tipoModeloRotina']").forEach((radio) => {
    radio.closest("label")?.classList.add("modelo-radio-antigo");
  });

  config.querySelectorAll("h3").forEach((tituloSecao) => {
    if (tituloSecao.textContent.toLowerCase().includes("modelo")) {
      tituloSecao.classList.add("modelo-radio-antigo");
    }
  });

  config.classList.add("painel-campos-personalizados");
  config.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="painel-campos-topo">
      <strong>Modal geral personalizado</strong>
      <small>Use esses tópicos para criar rotinas parecidas com Diária, Estudos, Trabalho e outras variações.</small>
    </div>
  `,
  );

  const tituloCampos = [...config.querySelectorAll("h3")].find((titulo) =>
    titulo.textContent.toLowerCase().includes("campos"),
  );
  if (
    tituloCampos &&
    !document.getElementById("camposEscolhidosPersonalizados")
  ) {
    tituloCampos.insertAdjacentHTML(
      "afterend",
      `
      <div id="camposEscolhidosPersonalizados" class="campos-escolhidos-personalizados"></div>
    `,
    );
  }

  const modelosGrid = document.getElementById("modelosRotinaProntos");

  Object.entries(modelosRotinaProntos).forEach(([chave, modelo]) => {
    const botao = document.createElement("button");
    botao.className = "modelo-rotina-card";
    botao.type = "button";
    botao.dataset.modeloRotina = chave;
    botao.innerHTML = `
      <span class="modelo-rotina-icone">${chave === "personalizada" ? normalizarEmojiRotina(emojiRotinaPersonalizadaInput?.value || modelo.icone) : modelo.icone}</span>
      <span class="modelo-rotina-texto">
        <strong>${modelo.titulo}</strong>
        <small>${modelo.descricao}</small>
      </span>
    `;

    botao.addEventListener("click", () => selecionarTemplateRotina(chave));
    modelosGrid.appendChild(botao);
  });
}

function selecionarTemplateRotina(chave) {
  rotinaTemplateAtual = chave;

  const modelo =
    modelosRotinaProntos[chave] || modelosRotinaProntos.personalizada;
  const radio = document.querySelector(
    `input[name='tipoModeloRotina'][value='${modelo.modelo}']`,
  );
  if (radio) radio.checked = true;

  if (
    nomeRotinaInput &&
    chave !== "personalizada" &&
    !nomeRotinaInput.dataset.editadoManual
  ) {
    nomeRotinaInput.value = modelo.nome;
  }

  document.querySelectorAll(".modelo-rotina-card").forEach((card) => {
    card.classList.toggle("ativo", card.dataset.modeloRotina === chave);
  });

  const personalizada = chave === "personalizada";
  const config = modalRotina.querySelector(".config-rotina-personalizada");
  config?.classList.toggle("modo-personalizado-ativo", personalizada);
  document
    .getElementById("emojiRotinaPersonalizadaBox")
    ?.classList.toggle("hidden", !personalizada);

  if (
    personalizada &&
    emojiRotinaPersonalizadaInput &&
    !emojiRotinaPersonalizadaInput.value.trim()
  ) {
    emojiRotinaPersonalizadaInput.value = "🗂️";
  }

  camposRotinaCheck.forEach((campo) => {
    const deveMarcar = modelo.campos.includes(campo.value);
    campo.checked = deveMarcar;
    campo.disabled = !personalizada;
    campo.closest("label")?.classList.toggle("campo-bloqueado", !personalizada);
  });

  atualizarPreviewTemplateRotina(chave);
  atualizarCamposModeloRotina();
}

function atualizarPreviewTemplateRotina(chave) {
  const preview = document.getElementById("previewRotinaSelecionada");
  const modelo =
    modelosRotinaProntos[chave] || modelosRotinaProntos.personalizada;
  if (!preview) return;

  const camposBaseBrutos =
    chave === "personalizada"
      ? obterCamposMarcadosRotina()
      : normalizarCamposRotina(modelo.campos);
  const camposBase = ajustarCamposParaRotina(
    camposBaseBrutos,
    chave === "alimentacao" ? "alimentacao" : "",
  );
  const campos = camposBase
    .filter((campo) => campo !== "dia_semana")
    .map((campo) => rotulosCamposRotina[campo] || campo);

  const chipsCampos = document.getElementById("camposEscolhidosPersonalizados");
  if (chipsCampos) {
    chipsCampos.innerHTML = campos
      .map((campo) => `<span>${campo}</span>`)
      .join("");
  }

  const previewSemanal =
    chave === "semanal"
      ? `<div class="preview-semanal-mini">
        ${modelo.preview.map((dia) => `<span>${dia}</span>`).join("")}
      </div>`
      : "";

  preview.innerHTML = `
    <div class="preview-rotina-header">
      <span class="modelo-rotina-icone">${chave === "personalizada" ? normalizarEmojiRotina(emojiRotinaPersonalizadaInput?.value || modelo.icone) : modelo.icone}</span>
      <div>
        <strong>${modelo.titulo}</strong>
        <small>${chave === "personalizada" ? "Campos escolhidos por você" : "Tabela pré-estabelecida"}</small>
      </div>
    </div>
    ${previewSemanal}
    <div class="preview-campos-rotina">
      ${campos.map((campo) => `<span>${campo}</span>`).join("")}
    </div>
  `;
}

function obterCamposTemplateRotinaAtual() {
  const template = modelosRotinaProntos[rotinaTemplateAtual];

  if (!template || rotinaTemplateAtual === "personalizada") {
    return obterCamposMarcadosRotina();
  }

  return normalizarCamposRotina(template.campos);
}

function obterModeloTemplateRotinaAtual() {
  return modelosRotinaProntos[rotinaTemplateAtual]?.modelo || "tabela";
}

//Rotinas
function abrirModalRotina() {
  garantirLayoutModalRotina();
  modalRotina.classList.remove("hidden");
  nomeRotinaInput.value = "";
  nomeRotinaInput.dataset.editadoManual = "";

  selecionarTemplateRotina("diaria");

  nomeRotinaInput.focus();
}

function fecharModalNovaRotina() {
  modalRotina.classList.add("hidden");
}

async function carregarRotinas() {
  try {
    const rotinas = await buscarRotinas({ force: true });
    tentativasRecarregarRotinas = 0;
    if (recarregamentoRotinasPendente) {
      clearTimeout(recarregamentoRotinasPendente);
      recarregamentoRotinasPendente = null;
    }

    listaRotinas.innerHTML = "";

    if (!rotinas.length) {
      listaRotinas.innerHTML = "<li>Nenhuma rotina cadastrada.</li>";
      return;
    }

    const ordemRotinas = [
      "Diaria",
      "Estudos",
      "Treino",
      "Trabalho",
      "Semanal",
      "Alimentação",
    ];

    rotinas.sort((a, b) => {
      const indexA = ordemRotinas.findIndex((nome) =>
        a.nome.toLowerCase().includes(nome.toLowerCase()),
      );

      const indexB = ordemRotinas.findIndex((nome) =>
        b.nome.toLowerCase().includes(nome.toLowerCase()),
      );

      if (indexA === -1 && indexB === -1) {
        return a.nome.localeCompare(b.nome);
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    rotinas.forEach((rotina) => {
      const li = document.createElement("li");
      li.classList.add("item-rotina");
      li.setAttribute("draggable", "true");
      li.dataset.id = rotina.id;

      li.innerHTML = `
        <span class="icone-menu">${obterIconeRotina(rotina)}</span>
        <span class="nome-rotina-sidebar">${rotina.nome}</span>
        ${
          rotinaEstaSilenciada(rotina.id)
            ? `<span class="icone-rotina-silenciada">🔕</span>`
            : ""
        }
      `;

      li.addEventListener("click", () => {
        btnNovaTarefa?.classList.remove("hidden");
        btnNovaRotina?.classList.remove("hidden");
        btnMenuRotina?.classList.remove("hidden");
        btnHojeCalendario?.classList.add("hidden");
        btnAdicionarEventoCalendario?.classList.add("hidden");

        rotinaSelecionadaId = rotina.id;
        rotinaSelecionadaNome = rotina.nome;
        rotinaAtual = rotina;
        tituloRotina.textContent = rotina.nome.replace(/matutina/i, "Diaria");

        fecharModalNovoLembrete();
        mostrarSecaoRotinas();
        ativarItemSidebar(li);

        areaCalendario?.classList.add("hidden");
        tabelaCard?.classList.remove("hidden");
        cardNotasRotina?.classList.remove("hidden");
        definirTelaMobileDashboard("rotina");

        carregarTarefas(rotina.id, rotina.nome);
      });

      listaRotinas.appendChild(li);
    });

    ativarDragRotinas();
  } catch (erro) {
    console.error("Erro ao carregar rotinas:", erro);
    if (!listaRotinas.children.length) {
      listaRotinas.innerHTML =
        '<li class="item-lista-vazio">Carregando rotinas...</li>';
    }

    if (!recarregamentoRotinasPendente && tentativasRecarregarRotinas < 3) {
      tentativasRecarregarRotinas += 1;
      recarregamentoRotinasPendente = setTimeout(() => {
        recarregamentoRotinasPendente = null;
        carregarRotinas();
      }, 900 * tentativasRecarregarRotinas);
      return;
    }

    mostrarAviso("erro", "Erro ao carregar rotinas.");
  }
}

function excluirRotinaSelecionada() {
  if (!rotinaSelecionadaId) {
    mostrarAviso("Aviso", "Selecione uma rotina primeiro.");
    return;
  }

  mostrarConfirmacao(
    `Deseja excluir a rotina "${rotinaSelecionadaNome}"? Todas as tarefas dela também serão removidas.`,
    async () => {
      await excluirRotinaConfirmada();
    },
  );
}

async function excluirRotinaConfirmada() {
  try {
    const resposta = await fetch(
      `${API_BASE_URL}/rotinas/${rotinaSelecionadaId}`,
      {
        method: "DELETE",
        headers: headersAuth(),
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarAviso("Erro", dados.msg || "Erro ao excluir rotina.");
      return;
    }

    mostrarAviso("Aviso", "Rotina excluída com sucesso!");
    invalidarCacheTarefas(rotinaSelecionadaId);
    invalidarCacheRotinas();

    rotinaSelecionadaId = null;
    rotinaSelecionadaNome = "";
    tituloRotina.textContent = "Selecione uma rotina";
    campoNotas.value = "";

    corpoTabelaTarefas.innerHTML = `
      <tr>
        <td colspan="7">Nenhuma rotina selecionada.</td>
      </tr>
    `;

    opcoesRotina.classList.add("hidden");
    carregarRotinas();
  } catch (erro) {
    console.error("Erro ao excluir rotina:", erro);
    mostrarAviso("Erro", "Não foi possível excluir a rotina.");
  }
}

//Arrastar rotinas
function ativarDragRotinas() {
  const itens = document.querySelectorAll(".item-rotina");

  itens.forEach((item) => {
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      listaRotinas.classList.remove("drag-over");
      salvarOrdemRotinas();
    });
  });

  if (listaRotinas.dataset.dragListenersAtivos === "true") return;
  listaRotinas.dataset.dragListenersAtivos = "true";

  listaRotinas.addEventListener("dragover", (event) => {
    event.preventDefault();
    listaRotinas.classList.add("drag-over");

    const itemArrastando = document.querySelector(".dragging");
    const itemDepois = pegarItemDepoisDoMouse(listaRotinas, event.clientY);

    if (!itemArrastando) return;

    if (itemDepois == null) {
      listaRotinas.appendChild(itemArrastando);
    } else {
      listaRotinas.insertBefore(itemArrastando, itemDepois);
    }
  });

  listaRotinas.addEventListener("dragleave", () => {
    listaRotinas.classList.remove("drag-over");
  });

  listaRotinas.addEventListener("drop", () => {
    listaRotinas.classList.remove("drag-over");
    salvarOrdemRotinas();
  });
}

function pegarItemDepoisDoMouse(container, y) {
  const itens = [...container.querySelectorAll(".item-rotina:not(.dragging)")];

  return itens.reduce(
    (maisProximo, item) => {
      const box = item.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > maisProximo.offset) {
        return { offset, element: item };
      }

      return maisProximo;
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

async function salvarOrdemRotinas() {
  const rotinasOrdenadas = [
    ...listaRotinas.querySelectorAll(".item-rotina"),
  ].map((item) => ({
    id: Number(item.dataset.id),
  }));

  try {
    await fetch(`${API_BASE_URL}/rotinas/ordem/atualizar`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({
        rotinas: rotinasOrdenadas,
      }),
    });
    invalidarCacheRotinas();
    invalidarCacheRotinas();
  } catch (erro) {
    console.error("Erro ao salvar ordem das rotinas:", erro);
  }
}

//Tabela de tarefas
function ordenarColunasComNotificacaoEAcoes(colunas) {
  const colunasPrincipais = colunas.filter(
    (coluna) => coluna !== "Notificação" && coluna !== "Ações",
  );

  return [...colunasPrincipais, "Notificação", "Ações"];
}

function renderizarCabecalhoTarefas(tipoRotina) {
  let colunas = [];

  if (tipoRotina === "matinal") {
    colunas = ["Tarefa", "Status", "Horário", "Notificação", "Ações"];
  } else if (tipoRotina === "estudos") {
    colunas = [
      "Tarefa",
      "Tipo",
      "Status",
      "Disciplina",
      "Horário",
      "Link/Material",
      "Notificação",
      "Ações",
    ];
  } else if (tipoRotina === "trabalho") {
    colunas = [
      "Tarefa",
      "Projeto",
      "Prioridade",
      "Prazo",
      "Status",
      "Horário",
    ];
  } else if (tipoRotina === "alimentacao") {
    colunas = [
      "Refeição",
      "Alimento",
      "Horário",
      "Calorias",
      "Status",
    ];
  } else {
    colunas = [
      "Tarefa",
      "Tipo",
      "Status",
      "Disciplina",
      "Horário",
    ];
  }

  colunas = ordenarColunasComNotificacaoEAcoes(colunas);

  if (modoEdicaoTabela) {
    colunas.unshift("");
  }

  tabelaTarefas.querySelector("thead").innerHTML = `
    <tr>
      ${colunas.map((coluna) => `<th>${coluna}</th>`).join("")}
    </tr>
  `;
  marcarColunasOpcionaisTabela();
}

function botaoNotificacao(tarefa) {
  return `
    <button 
      class="btn-notificacao ${tarefa.notificacao ? "ativa" : "desativada"}"
      data-id="${tarefa.id}"
      title="Ativar/desativar notificação"
    >
      ${tarefa.notificacao ? "🔔" : "🔕"}
    </button>
  `;
}

function botaoArrastar() {
  return modoEdicaoTabela ? `<td><span class="drag-handle">☰</span></td>` : "";
}

function campoHorarioEditavel(tarefa) {
  if (!modoEdicaoTabela)
    return tarefa.horario ? formatarHorarioSite(tarefa.horario) : "-";

  return `
    <button class="campo-editavel" data-campo="horario" data-valor="${tarefa.horario || ""}">
      🕒 ${tarefa.horario ? formatarHorarioSite(tarefa.horario) : "Definir"}
    </button>
  `;
}

function campoEditavel(tarefa, campo, texto, icone = "✏️") {
  if (!modoEdicaoTabela) return texto || "-";

  return `
    <button class="campo-editavel" data-campo="${campo}" data-valor="${texto || ""}">
      ${icone} ${texto || "Editar"}
    </button>
  `;
}

function tituloTarefaComCheck(tarefa, acoesExtras = "") {
  return `${checkConclusao(tarefa)}${acoesExtras}<span class="titulo-tarefa-text">${tarefa.titulo || "-"}</span>`;
}

function statusTarefaVisual(tarefa) {
  const statusSalvo = String(tarefa.status || "");
  const statusConcluido =
    statusSalvo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("conclu");
  const status = tarefa.concluida
    ? "Concluída"
    : statusConcluido
      ? "Pendente"
      : tarefa.status || "Pendente";

  return `<span class="${obterClasseStatus(status)}" data-status-tarefa>${status}</span>`;
}

function aplicarEstadoConclusaoLinha(linha, botao, concluida) {
  const novoStatus = concluida ? "Concluída" : "Pendente";

  linha?.classList.toggle("tarefa-concluida", concluida);
  linha?.classList.remove("tarefa-concluindo");

  if (concluida) {
    void linha?.offsetWidth;
    linha?.classList.add("tarefa-concluindo");
    window.setTimeout(() => linha?.classList.remove("tarefa-concluindo"), 520);
  }

  if (botao) {
    botao.dataset.concluida = String(concluida);
    botao.innerHTML = concluida ? "&#10003;" : "";
    botao.title = concluida ? "Marcar como pendente" : "Concluir tarefa";
    botao.setAttribute(
      "aria-label",
      concluida ? "Marcar tarefa como pendente" : "Concluir tarefa",
    );
  }

  const statusBadge = linha?.querySelector("[data-status-tarefa]");
  if (statusBadge) {
    statusBadge.textContent = novoStatus;
    statusBadge.className = obterClasseStatus(novoStatus);
    statusBadge.dataset.statusTarefa = "";
  }
}

function simboloCheck(concluida) {
  return concluida ? "&#10003;" : "";
}

function aplicarConclusaoSemanal(item, botao, concluida) {
  item?.classList.toggle("concluido", concluida);
  item?.classList.remove("concluindo");

  if (concluida) {
    void item?.offsetWidth;
    item?.classList.add("concluindo");
    window.setTimeout(() => item?.classList.remove("concluindo"), 500);
  }

  if (botao) {
    botao.dataset.concluida = String(concluida);
    botao.innerHTML = simboloCheck(concluida);
    botao.title = concluida ? "Marcar como pendente" : "Concluir tarefa";
  }

  const coluna = item?.closest(".semanal-coluna");
  const contador = coluna?.querySelector(".semanal-contador");
  const total = coluna?.querySelectorAll(".semanal-item").length || 0;
  const concluidas =
    coluna?.querySelectorAll(".semanal-item.concluido").length || 0;

  if (contador) {
    contador.textContent = `${concluidas}/${total} concluídas`;
  }
}

function aplicarConclusaoCardTreino(card, botao, concluida) {
  const novoStatus = concluida ? "Concluída" : "Pendente";

  card?.classList.toggle("concluido", concluida);
  card?.classList.remove("concluindo");

  if (concluida) {
    void card?.offsetWidth;
    card?.classList.add("concluindo");
    window.setTimeout(() => card?.classList.remove("concluindo"), 560);
  }

  if (botao) {
    botao.dataset.concluida = String(concluida);
    botao.innerHTML = concluida ? "×" : "";
    botao.title = concluida ? "Marcar como pendente" : "Concluir exercício";
  }

  const statusValor = card?.querySelector("[data-status-exercicio]");
  if (statusValor) {
    statusValor.textContent = novoStatus;
  }
}

function montarLinhaTarefa(tarefa, tipoRotina) {
  if (tipoRotina === "matinal") {
    return `
      ${botaoArrastar()}
      <td>${tituloTarefaComCheck(tarefa)}</td>
      <td>${statusTarefaVisual(tarefa)}</td>
      <td>${campoHorarioEditavel(tarefa)}</td>
      <td>${botaoNotificacao(tarefa)}</td>
      <td><button class="btn-excluir" data-id="${tarefa.id}">🗑️</button></td>
    `;
  }

  if (tipoRotina === "estudos") {
    return `
      ${botaoArrastar()}
      <td>${tituloTarefaComCheck(tarefa)}</td>
      <td><span class="${obterClasseTipo(tarefa.tipo)}">${tarefa.tipo || "-"}</span></td>
      <td>${statusTarefaVisual(tarefa)}</td>
      <td>${tarefa.disciplina || "-"}</td>
      <td>${campoHorarioEditavel(tarefa)}</td>
      <td>
        ${
          modoEdicaoTabela
            ? campoEditavel(tarefa, "link_material", tarefa.link_material, "🔗")
            : tarefa.link_material
              ? `<a href="${tarefa.link_material}" target="_blank">🔗 Material</a>`
              : "-"
        }
      </td>
      <td>${botaoNotificacao(tarefa)}</td>
      <td><button class="btn-excluir" data-id="${tarefa.id}">🗑️</button></td>
    `;
  }

  if (tipoRotina === "trabalho") {
    return `
      ${botaoArrastar()}
      <td>${tituloTarefaComCheck(tarefa)}</td>
      <td>${tarefa.projeto || "-"}</td>
      <td><span class="${obterClassePrioridade(tarefa.prioridade)}">${tarefa.prioridade || "-"}</span></td>
      <td>${campoEditavel(tarefa, "prazo", tarefa.prazo, "📅")}</td>
      <td>${statusTarefaVisual(tarefa)}</td>
      <td>${campoHorarioEditavel(tarefa)}</td>
      <td>${botaoNotificacao(tarefa)}</td>
      <td><button class="btn-excluir" data-id="${tarefa.id}">🗑️</button></td>
    `;
  }

  if (tipoRotina === "alimentacao") {
    return `
      ${botaoArrastar()}
      <td>
  ${tituloTarefaComCheck(tarefa, modoEdicaoTabela ? `<button class="btn-editar-card" data-tipo="alimentacao">✏️</button>` : "")}
</td>
      <td>${tarefa.tipo || "-"}</td>
      <td>${campoHorarioEditavel(tarefa)}</td>
      <td class="calorias-cell">${formatarCalorias(tarefa.calorias)}</td>
      <td>${statusTarefaVisual(tarefa)}</td>
      <td>${botaoNotificacao(tarefa)}</td>
      <td><button class="btn-excluir" data-id="${tarefa.id}">🗑️</button></td>
    `;
  }

  return `
    ${botaoArrastar()}
    <td>${tituloTarefaComCheck(tarefa)}</td>
    <td><span class="${obterClasseTipo(tarefa.tipo)}">${tarefa.tipo || "-"}</span></td>
    <td>${statusTarefaVisual(tarefa)}</td>
    <td>${tarefa.disciplina || "-"}</td>
    <td>${campoHorarioEditavel(tarefa)}</td>
    <td>${botaoNotificacao(tarefa)}</td>
    <td><button class="btn-excluir" data-id="${tarefa.id}">🗑️</button></td>
  `;
}

function checkConclusaoLembrete(lembrete) {
  return `
    <button 
      class="check-lembrete" 
      type="button" 
      data-id="${lembrete.id}" 
      data-concluida="${String(lembrete.status || "")
        .toLowerCase()
        .includes("conclu")}"
      title="Concluir lembrete"
    >
      ${
        String(lembrete.status || "")
          .toLowerCase()
          .includes("conclu")
          ? "✅"
          : "⬜"
      }
    </button>
  `;
}

function ativarDragTarefasTabela() {
  const linhas = corpoTabelaTarefas.querySelectorAll("tr[draggable='true']");

  linhas.forEach((linha) => {
    if (linha.dataset.dragListenersAtivos === "true") return;
    linha.dataset.dragListenersAtivos = "true";

    linha.addEventListener("dragstart", () => {
      linha.classList.add("linha-arrastando");
    });

    linha.addEventListener("dragend", () => {
      linha.classList.remove("linha-arrastando");
      salvarOrdemTarefasTabela();
    });
  });

  if (corpoTabelaTarefas.dataset.dragListenersAtivos === "true") return;
  corpoTabelaTarefas.dataset.dragListenersAtivos = "true";

  corpoTabelaTarefas.addEventListener("dragover", (event) => {
    event.preventDefault();

    const linhaArrastando =
      corpoTabelaTarefas.querySelector(".linha-arrastando");
    const linhaDepois = pegarLinhaDepoisDoMouse(
      corpoTabelaTarefas,
      event.clientY,
    );

    if (!linhaArrastando) return;

    if (linhaDepois == null) {
      corpoTabelaTarefas.appendChild(linhaArrastando);
    } else {
      corpoTabelaTarefas.insertBefore(linhaArrastando, linhaDepois);
    }
  });
}

function pegarLinhaDepoisDoMouse(container, y) {
  const linhas = [
    ...container.querySelectorAll(
      "tr[draggable='true']:not(.linha-arrastando)",
    ),
  ];

  return linhas.reduce(
    (maisProximo, linha) => {
      const box = linha.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > maisProximo.offset) {
        return { offset, element: linha };
      }

      return maisProximo;
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

async function salvarOrdemTarefasTabela() {
  const linhas = [
    ...corpoTabelaTarefas.querySelectorAll("tr[draggable='true']"),
  ];

  try {
    await Promise.all(
      linhas.map((linha, index) => {
        return fetch(`${API_BASE_URL}/tarefas/${linha.dataset.id}`, {
          method: "PUT",
          headers: headersAuth(),
          body: JSON.stringify({
            ordem: index + 1,
          }),
        });
      }),
    );
  } catch (erro) {
    console.error("Erro ao salvar ordem das tarefas:", erro);
    mostrarAviso("erro", "Não foi possível salvar a nova ordem.");
  }
}

function obterModeloRotinaAtual() {
  return rotinaAtual?.tipo_modelo || "tabela";
}

function chaveTemplateModalRotina(identificador) {
  if (!identificador) return "";
  return `template_modal_rotina_${usuario?.id || "local"}_${String(identificador).toLowerCase()}`;
}

function salvarTemplateModalRotina(idRotina, nomeRotina, template) {
  if (!template) return;

  try {
    if (idRotina) {
      localStorage.setItem(chaveTemplateModalRotina(idRotina), template);
    }

    if (nomeRotina) {
      localStorage.removeItem(chaveTemplateModalRotina(nomeRotina));
    }
  } catch (erro) {
    console.warn("NÃ£o foi possÃ­vel salvar o template da rotina:", erro);
  }
}

function obterTemplateModalRotinaAtual() {
  if (!rotinaAtual) return "";

  try {
    return localStorage.getItem(chaveTemplateModalRotina(rotinaAtual.id)) || "";
  } catch {
    return "";
  }
}

function obterTemplateModalRotinaPorRotina(rotina) {
  if (!rotina) return "";

  try {
    return localStorage.getItem(chaveTemplateModalRotina(rotina.id)) || "";
  } catch {
    return "";
  }
}

function obterCamposDaRotinaAtual() {
  if (!rotinaAtual || !rotinaAtual.campos_config) return [];
  return normalizarCamposRotina(rotinaAtual.campos_config, []);
}

function removerCampoStatusTarefa() {
  document.getElementById("labelStatusTarefa")?.remove();
  document.getElementById("statusTarefaSelect")?.remove();
  statusTarefaSelect = null;
}

function mostrarCampoModal(idLabel, idCampo, mostrar) {
  const label = document.getElementById(idLabel);
  const campo = document.getElementById(idCampo);

  if (label) label.classList.toggle("hidden", !mostrar);
  if (campo) campo.classList.toggle("hidden", !mostrar);
}

function adaptarModalTarefaPelosCampos() {
  const campos = obterCamposDaRotinaAtual();

  if (!campos.length) return;

  const temTitulo = campos.includes("titulo");
  const temTipo = campos.includes("tipo");
  const temDisciplina = campos.includes("disciplina");
  const temHorario = campos.includes("horario");
  const temNotificacao = campos.includes("notificacao");
  const temLinkMaterial = campos.includes("link_material");
  const temProjeto = campos.includes("projeto");
  const temPrioridade = campos.includes("prioridade");
  const temPrazo = campos.includes("prazo");
  const temCalorias = campos.includes("calorias");

  removerCampoStatusTarefa();
  mostrarCampoModal("labelTipoTarefa", "tipoTarefaSelect", temTipo);
  mostrarCampoModal(
    "labelDisciplinaTarefa",
    "disciplinaTarefaInput",
    temDisciplina,
  );
  mostrarCampoModal("labelHorarioTarefa", "horarioTarefaInput", temHorario);

  camposEstudos.classList.toggle("hidden", !temLinkMaterial);
  camposTrabalho.classList.toggle(
    "hidden",
    !(temProjeto || temPrioridade || temPrazo),
  );
  camposAlimentacao.classList.toggle("hidden", !temCalorias);

  document
    .querySelector('label[for="linkMaterialInput"]')
    ?.classList.toggle("hidden", !temLinkMaterial);
  linkMaterialInput?.classList.toggle("hidden", !temLinkMaterial);

  document
    .querySelector('label[for="projetoInput"]')
    ?.classList.toggle("hidden", !temProjeto);
  projetoInput?.classList.toggle("hidden", !temProjeto);

  document
    .querySelector('label[for="prioridadeInput"]')
    ?.classList.toggle("hidden", !temPrioridade);
  prioridadeInput?.classList.toggle("hidden", !temPrioridade);

  document
    .querySelector('label[for="prazoInput"]')
    ?.classList.toggle("hidden", !temPrazo);
  prazoInput?.classList.toggle("hidden", !temPrazo);

  document
    .querySelector('label[for="caloriasInput"]')
    ?.classList.toggle("hidden", !temCalorias);
  caloriasInput?.classList.toggle("hidden", !temCalorias);

  linhaNotificacaoTarefa?.classList.toggle("hidden", !temNotificacao);
  linhaAlarmeTarefa?.classList.toggle("hidden", !temNotificacao);
  if (!temNotificacao) {
    notificacaoTarefaInput.checked = false;
  }
  atualizarTextoNotificacaoModal();

  if (!temTipo) {
    tipoTarefaInput.classList.add("hidden");
    tipoTarefaSelect.classList.add("hidden");
  }

  if (!temTitulo) {
    tituloTarefaInput.placeholder = "Item da rotina";
  }

  statusTarefaSelect = null;
}

const layoutsModalTarefa = {
  matinal: {
    chave: "diaria",
    icone: "☀️",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes da rotina",
    descricao: "Organize uma tarefa com horário e aviso para o seu dia.",
    etiquetaTitulo: "Tarefa",
    placeholderTitulo: "Ex: Beber água",
  },
  estudos: {
    chave: "estudos",
    icone: "📚",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes de estudo",
    descricao: "Monte a atividade com disciplina, horário e material de apoio.",
    etiquetaTitulo: "Atividade",
    placeholderTitulo: "Ex: Revisar Biologia",
  },
  trabalho: {
    chave: "trabalho",
    icone: "💼",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes do trabalho",
    descricao: "Defina projeto, prioridade, prazo e acompanhamento da entrega.",
    etiquetaTitulo: "Entrega",
    placeholderTitulo: "Ex: Finalizar relatório",
  },
  alimentacao: {
    chave: "alimentacao",
    icone: "🍽️",
    tituloModal: "Nova Refeição",
    tituloBanner: "Detalhes da refeição",
    descricao: "Registre alimento, horário e calorias da rotina alimentar.",
    etiquetaTitulo: "Refeição",
    placeholderTitulo: "Ex: Almoço",
  },
  semanal: {
    chave: "semanal",
    icone: "🗓️",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes semanais",
    descricao: "Escolha o dia e se essa tarefa aparece uma vez ou toda semana.",
    etiquetaTitulo: "Tarefa",
    placeholderTitulo: "Ex: Fazer projeto",
  },
  treino: {
    chave: "treino",
    icone: "💪",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes do treino",
    descricao: "Monte o exercício com dia, grupo muscular e intensidade.",
    etiquetaTitulo: "Exercício",
    placeholderTitulo: "Ex: Supino reto",
  },
  personalizada: {
    chave: "personalizada",
    icone: "✨",
    tituloModal: "Nova Tarefa",
    tituloBanner: "Detalhes da tarefa",
    descricao: "Preencha os tópicos escolhidos para esta rotina personalizada.",
    etiquetaTitulo: "Título",
    placeholderTitulo: "Item da rotina",
  },
};

function obterLayoutModalTarefa(tipoRotina, modeloRotina) {
  const templateSalvo = obterTemplateModalRotinaAtual();
  const layoutPorTemplate = {
    diaria: layoutsModalTarefa.matinal,
    estudos: layoutsModalTarefa.estudos,
    trabalho: layoutsModalTarefa.trabalho,
    alimentacao: layoutsModalTarefa.alimentacao,
    semanal: layoutsModalTarefa.semanal,
    treino: layoutsModalTarefa.treino,
  };

  if (
    templateSalvo &&
    templateSalvo !== "personalizada" &&
    layoutPorTemplate[templateSalvo]
  ) {
    return layoutPorTemplate[templateSalvo];
  }

  if (tipoRotina === "treino" || modeloRotina === "treino_card")
    return layoutsModalTarefa.treino;
  if (tipoRotina === "semanal" || modeloRotina === "tabela_por_dia")
    return layoutsModalTarefa.semanal;
  return layoutsModalTarefa[tipoRotina] || layoutsModalTarefa.personalizada;
}

function limparClassesLayoutModalTarefa() {
  modalTarefa.classList.remove(
    "modal-tarefa-treino",
    "modal-tarefa-semanal",
    "modal-tarefa-diaria",
    "modal-tarefa-estudos",
    "modal-tarefa-trabalho",
    "modal-tarefa-alimentacao",
    "modal-tarefa-personalizada",
    "modal-tarefa-principal",
    "modal-tarefa-generica",
  );
}

function configurarLayoutModalTarefa(tipoRotina, modeloRotina) {
  const layout = obterLayoutModalTarefa(tipoRotina, modeloRotina);
  const ehGenerico = layout.chave === "personalizada";
  const tituloModal = modalTarefa.querySelector(".modal-header h2");
  const corpoModal = modalTarefa.querySelector(".modal-body");

  limparClassesLayoutModalTarefa();
  modalTarefa.classList.add(
    "modal-tarefa-" + layout.chave,
    ehGenerico ? "modal-tarefa-generica" : "modal-tarefa-principal",
  );

  if (tituloModal) tituloModal.textContent = layout.tituloModal;

  let banner = document.getElementById("bannerModalTarefa");
  if (!banner && corpoModal) {
    banner = document.createElement("div");
    banner.id = "bannerModalTarefa";
    banner.className = "banner-modal-tarefa";
    corpoModal.prepend(banner);
  }

  if (banner) {
    banner.innerHTML = [
      '<span class="banner-modal-tarefa-icone">' + layout.icone + "</span>",
      '<span class="banner-modal-tarefa-texto">',
      "<strong>" + layout.tituloBanner + "</strong>",
      "<small>" + layout.descricao + "</small>",
      "</span>",
    ].join("");
  }

  return layout;
}

//Tarefas
function abrirModalTarefa() {
  modalTarefa.classList.remove("hidden");

  const tipoRotina = obterTipoRotina(tituloRotina.textContent);
  const modeloRotina = obterModeloRotinaAtual();
  const labelTitulo = document.querySelector('label[for="tituloTarefaInput"]');

  limparClassesLayoutModalTarefa();

  // Limpar valores
  tituloTarefaInput.value = "";
  tipoTarefaInput.value = "";
  disciplinaTarefaInput.value = "";
  horarioTarefaInput.value = "";
  notificacaoTarefaInput.checked = false;
  if (alarmeTarefaInput) alarmeTarefaInput.checked = true;
  removerCampoStatusTarefa();

  if (tipoTarefaSelect) tipoTarefaSelect.value = "";
  if (linkMaterialInput) linkMaterialInput.value = "";
  if (projetoInput) projetoInput.value = "";
  if (prioridadeInput) prioridadeInput.value = "Média";
  if (prazoInput) prazoInput.value = "";
  if (caloriasInput) caloriasInput.value = "";
  if (diaSemanaInput) diaSemanaInput.value = "Segunda";
  if (grupoMuscularInput) grupoMuscularInput.value = "";
  if (seriesInput) seriesInput.value = "";
  if (repeticoesInput) repeticoesInput.value = "";
  if (cargaInput) cargaInput.value = "";
  if (repeticaoSemanalInput) repeticaoSemanalInput.value = "Único";

  atualizarTextoNotificacaoModal();
  linhaNotificacaoTarefa?.classList.remove("hidden");
  linhaAlarmeTarefa?.classList.remove("hidden");

  // Reset visual
  [
    labelTitulo,
    labelTipoTarefa,
    labelDisciplinaTarefa,
    labelHorarioTarefa,
    tituloTarefaInput,
    tipoTarefaSelect,
    disciplinaTarefaInput,
    horarioTarefaInput,
  ].forEach((el) => el?.classList.remove("hidden"));

  [
    camposEstudos,
    camposTrabalho,
    camposAlimentacao,
    campoRepeticaoSemanal,
  ].forEach((grupo) => {
    grupo
      ?.querySelectorAll("label, input, select")
      .forEach((el) => el.classList.remove("hidden"));
  });

  // Por padrão, o campo de alimento fica escondido
  tipoTarefaInput.classList.add("hidden");
  tipoTarefaSelect?.classList.remove("hidden");

  [
    diaSemanaInput,
    grupoMuscularInput,
    seriesInput,
    repeticoesInput,
    cargaInput,
  ].forEach((input) => {
    input?.classList.remove("hidden");
    input?.closest("label")?.classList.remove("hidden");
  });

  labelTitulo.textContent = "Título";
  labelTipoTarefa.textContent = "Tipo";
  labelDisciplinaTarefa.textContent = "Disciplina";
  labelHorarioTarefa.textContent = "Horário";
  tituloTarefaInput.placeholder = "Ex: Revisar Matemática";

  const layoutModalTarefa = configurarLayoutModalTarefa(
    tipoRotina,
    modeloRotina,
  );
  labelTitulo.textContent = layoutModalTarefa.etiquetaTitulo;
  tituloTarefaInput.placeholder = layoutModalTarefa.placeholderTitulo;

  camposTreino.classList.add("hidden");
  camposEstudos.classList.add("hidden");
  camposTrabalho.classList.add("hidden");
  camposAlimentacao.classList.add("hidden");
  campoRepeticaoSemanal?.classList.add("hidden");
  camposTreino
    .querySelector(".treino-modal-banner")
    ?.classList.remove("hidden");
  camposTreino.classList.add("campos-treino-fitness");

  // Treino
  if (tipoRotina === "treino") {
    modalTarefa.classList.add("modal-tarefa-treino");

    labelTitulo.textContent = "Exercício";
    tituloTarefaInput.placeholder = "Ex: Supino reto";

    labelTipoTarefa.classList.add("hidden");
    tipoTarefaInput.classList.add("hidden");
    tipoTarefaSelect?.classList.add("hidden");

    labelDisciplinaTarefa.classList.add("hidden");
    disciplinaTarefaInput.classList.add("hidden");

    labelHorarioTarefa.classList.add("hidden");
    horarioTarefaInput.classList.add("hidden");

    linhaNotificacaoTarefa?.classList.add("hidden");
    linhaAlarmeTarefa?.classList.add("hidden");
    notificacaoTarefaInput.checked = false;
    if (alarmeTarefaInput) alarmeTarefaInput.checked = false;

    camposTreino.classList.remove("hidden");

    return;
  }

  // Semanal
  if (tipoRotina === "semanal" || modeloRotina === "tabela_por_dia") {
    modalTarefa.classList.add("modal-tarefa-semanal");

    labelTitulo.textContent = "Título";
    tituloTarefaInput.placeholder = "Ex: Fazer projeto";

    labelTipoTarefa.classList.add("hidden");
    tipoTarefaInput.classList.add("hidden");
    tipoTarefaSelect?.classList.add("hidden");

    labelDisciplinaTarefa.classList.add("hidden");
    disciplinaTarefaInput.classList.add("hidden");

    labelHorarioTarefa.classList.add("hidden");
    horarioTarefaInput.classList.add("hidden");

    camposTreino.classList.remove("hidden");

    // Semanal não deve mostrar visual de treino
    camposTreino.querySelector(".treino-modal-banner")?.classList.add("hidden");
    camposTreino.classList.remove("campos-treino-fitness");

    grupoMuscularInput.closest("label")?.classList.add("hidden");
    grupoMuscularInput.classList.add("hidden");

    seriesInput.closest("label")?.classList.add("hidden");
    seriesInput.classList.add("hidden");

    repeticoesInput.closest("label")?.classList.add("hidden");
    repeticoesInput.classList.add("hidden");

    cargaInput.closest("label")?.classList.add("hidden");
    cargaInput.classList.add("hidden");

    campoRepeticaoSemanal?.classList.remove("hidden");

    return;
  }

  // Alimentação
  if (tipoRotina === "alimentacao") {
    labelTitulo.textContent = "Refeição";
    tituloTarefaInput.placeholder = "Ex: Almoço";

    labelTipoTarefa.textContent = "Alimento";

    // Esconde o select de tipo normal
    tipoTarefaSelect?.classList.add("hidden");

    // Mostra o input de alimento
    tipoTarefaInput.classList.remove("hidden");
    tipoTarefaInput.placeholder = "Digite o alimento";

    labelDisciplinaTarefa.classList.add("hidden");
    disciplinaTarefaInput.classList.add("hidden");

    camposAlimentacao.classList.remove("hidden");

    return;
  }

  // Outras rotinas
  if (tipoRotina === "estudos") {
    labelTitulo.textContent = layoutModalTarefa.etiquetaTitulo;
    tituloTarefaInput.placeholder = layoutModalTarefa.placeholderTitulo;
    labelTipoTarefa.textContent = "Categoria";
    labelDisciplinaTarefa.textContent = "Disciplina";
    labelHorarioTarefa.textContent = "Horário de estudo";
    camposEstudos.classList.remove("hidden");
  }

  if (tipoRotina === "trabalho") {
    labelTitulo.textContent = layoutModalTarefa.etiquetaTitulo;
    tituloTarefaInput.placeholder = layoutModalTarefa.placeholderTitulo;
    labelHorarioTarefa.textContent = "Horário";
    camposTrabalho.classList.remove("hidden");
  }

  adaptarModalTarefaPelosCampos();
}

function fecharModalNovaTarefa() {
  modalTarefa.classList.add("hidden");
}

function montarLinhaPersonalizada(tarefa, campos) {
  let linha = "";

  if (modoEdicaoTabela) {
    linha += botaoArrastar();
  }

  const camposPrincipais = campos.filter((campo) => campo !== "notificacao");

  camposPrincipais.forEach((campo) => {
    switch (campo) {
      case "titulo":
        linha += `<td>${tituloTarefaComCheck(tarefa)}</td>`;
        break;

      case "titulo":
        jaTemCheck = true;
        linha += `<td>${tituloTarefaComCheck(tarefa)}</td>`;
        break;

      case "tipo":
        linha += `<td>${tarefa.tipo || "-"}</td>`;
        break;

      case "status":
        linha += `<td>${statusTarefaVisual(tarefa)}</td>`;
        break;

      case "disciplina":
        linha += `<td>${tarefa.disciplina || "-"}</td>`;
        break;

      case "horario":
        linha += `<td>${campoHorarioEditavel(tarefa)}</td>`;
        break;

      case "notificacao":
        linha += `<td>${botaoNotificacao(tarefa)}</td>`;
        break;

      case "link_material":
        linha += `
          <td>
            ${
              tarefa.link_material
                ? `<a href="${tarefa.link_material}" target="_blank">🔗 Material</a>`
                : "-"
            }
          </td>
        `;
        break;

      case "projeto":
        linha += `<td>${tarefa.projeto || "-"}</td>`;
        break;

      case "prioridade":
        linha += `<td><span class="${obterClassePrioridade(tarefa.prioridade)}">${tarefa.prioridade || "-"}</span></td>`;
        break;

      case "prazo":
        linha += `<td>${campoEditavel(tarefa, "prazo", tarefa.prazo, "📅")}</td>`;
        break;

      case "calorias":
        linha += `<td class="calorias-cell">${formatarCalorias(tarefa.calorias)}</td>`;
        break;

      default:
        linha += `<td>-</td>`;

        let jaTemCheck = false;

        if (!jaTemCheck) {
          linha =
            `
    <td>${checkConclusao(tarefa)}</td>
  ` + linha;
        }
    }
  });

  linha += `
    <td>${botaoNotificacao(tarefa)}</td>
  `;

  linha += `
    <td>
      <button class="btn-excluir" data-id="${tarefa.id}">🗑️</button>
    </td>
  `;

  return linha;
}

function mostrarAviso(tipo, mensagem, aoFechar) {
  const modal = document.getElementById("modalAviso");
  const titulo = document.getElementById("tituloModalAviso");
  const texto = document.getElementById("textoModalAviso");
  const btn = document.getElementById("okModalAviso");

  restaurarAcoesModalAviso();
  modal.classList.remove("modal-sucesso", "modal-erro", "modal-aviso");

  if (!mensagem) {
    mensagem = tipo;
    tipo = "aviso";
  }

  tipo = String(tipo).toLowerCase();

  if (tipo === "sucesso") {
    modal.classList.add("modal-sucesso");
    titulo.textContent = MyNotePrefs.t("Sucesso");
  } else if (tipo === "erro") {
    modal.classList.add("modal-erro");
    titulo.textContent = MyNotePrefs.t("Erro");
  } else {
    modal.classList.add("modal-aviso");
    titulo.textContent = MyNotePrefs.t("Aviso");
  }

  texto.textContent = MyNotePrefs.t(mensagem);
  modal.classList.remove("hidden");

  btn.onclick = () => {
    modal.classList.add("hidden");

    if (typeof aoFechar === "function") {
      aoFechar();
    }
  };
}

function mostrarConfirmacao(mensagem, aoConfirmar) {
  restaurarAcoesModalAviso();
  tituloModalAviso.textContent = "Confirmar exclusão";
  textoModalAviso.textContent = mensagem;

  modalAviso.classList.remove("hidden");

  okModalAviso.textContent = MyNotePrefs.t("Excluir");
  okModalAviso.onclick = async () => {
    modalAviso.classList.add("hidden");
    okModalAviso.textContent = "OK";
    okModalAviso.onclick = fecharModalAvisoFunc;

    if (typeof aoConfirmar === "function") {
      await aoConfirmar();
    }
  };

  fecharModalAviso.onclick = () => {
    modalAviso.classList.add("hidden");
    okModalAviso.textContent = "OK";
    okModalAviso.onclick = fecharModalAvisoFunc;
  };
}

function restaurarAcoesModalAviso() {
  okModalAviso.style.display = "";
  okModalAviso.textContent = "OK";
  okModalAviso.onclick = fecharModalAvisoFunc;
  okModalAviso.parentElement
    ?.querySelectorAll(".btn-opcao-confirmacao")
    .forEach((botao) => botao.remove());
}

function mostrarConfirmacaoComOpcoes(titulo, mensagem, opcoes) {
  restaurarAcoesModalAviso();

  tituloModalAviso.textContent = titulo;
  textoModalAviso.textContent = mensagem;
  okModalAviso.style.display = "none";

  const footer = okModalAviso.parentElement;

  opcoes.forEach((opcao) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `${opcao.classe || "btn-primario"} btn-opcao-confirmacao`;
    botao.textContent = opcao.texto;
    botao.addEventListener("click", async () => {
      modalAviso.classList.add("hidden");
      restaurarAcoesModalAviso();
      if (typeof opcao.acao === "function") await opcao.acao();
    });
    footer?.appendChild(botao);
  });

  modalAviso.classList.remove("hidden");

  fecharModalAviso.onclick = () => {
    modalAviso.classList.add("hidden");
    restaurarAcoesModalAviso();
  };
}

function montarCardPersonalizado(tarefa, campos) {
  const titulo = tarefa.titulo || "Sem título";

  let detalhes = "";

  campos.forEach((campo) => {
    if (campo === "titulo") return;

    let label = campo;
    let valor = tarefa[campo] || "-";

    if (campo === "status") {
      valor = `<span class="${obterClasseStatus(tarefa.status)}">${tarefa.status || "-"}</span>`;
      label = "Status";
    }

    if (campo === "prioridade") {
      valor = `<span class="${obterClassePrioridade(tarefa.prioridade)}">${tarefa.prioridade || "-"}</span>`;
      label = "Prioridade";
    }

    if (campo === "link_material") {
      valor = tarefa.link_material
        ? `<a href="${tarefa.link_material}" target="_blank">🔗 Material</a>`
        : "-";
      label = "Material";
    }

    if (campo === "notificacao") {
      valor = tarefa.notificacao ? "🔔 Ativa" : "🔕 Desativada";
      label = "Notificação";
    }

    const nomes = {
      tipo: "Tipo",
      disciplina: "Disciplina",
      horario: "Horário",
      projeto: "Projeto",
      prazo: "Prazo",
      calorias: "Calorias",
    };

    detalhes += `
      <p>
        <span>${nomes[campo] || label}:</span>
        ${valor}
      </p>
    `;
  });

  return `
    <div class="card-exercicio ${tarefa.concluida ? "concluido" : ""}" data-id="${tarefa.id}">
      <div class="card-exercicio-header">
        <strong>${titulo}</strong>

        <div class="acoes-card-treino">
          <button class="btn-concluir-exercicio" data-id="${tarefa.id}" title="Concluir tarefa">
            ${simboloCheck(tarefa.concluida)}
          </button>

          <button class="btn-excluir" data-id="${tarefa.id}">
            🗑️
          </button>
        </div>
      </div>

      ${detalhes}
    </div>
  `;
}

function ativarEventosCardsPersonalizados(tarefas) {
  document.querySelectorAll(".card-exercicio").forEach((card) => {
    const id = Number(card.dataset.id);
    const tarefa = tarefas.find((item) => Number(item.id) === id);

    if (!tarefa) return;

    const btnConcluir = card.querySelector(".btn-concluir-exercicio");
    const btnExcluir = card.querySelector(".btn-excluir");

    btnConcluir?.addEventListener("click", async (event) => {
      event.stopPropagation();

      const novoConcluida = !tarefa.concluida;
      const novoStatus = novoConcluida ? "Concluída" : "Pendente";

      await fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({
          concluida: novoConcluida,
          status: novoStatus,
        }),
      });

      tarefa.concluida = novoConcluida;
      tarefa.status = novoStatus;
      aplicarConclusaoCardTreino(card, btnConcluir, novoConcluida);
      invalidarCacheTarefas(rotinaSelecionadaId);
    });

    btnExcluir?.addEventListener("click", async (event) => {
      event.stopPropagation();

      mostrarConfirmacao(
        `Deseja excluir a tarefa "${tarefa.titulo}"?`,
        async () => {
          await fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
            method: "DELETE",
            headers: headersAuth(),
          });

          invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
        },
      );
    });
  });
}

function renderizarCardsPersonalizados(tarefas, campos) {
  tabelaCard.classList.add("hidden");
  areaTreino.classList.remove("hidden");
  areaTreino.innerHTML = "";

  if (!tarefas.length) {
    areaTreino.innerHTML = `<p>Nenhuma tarefa cadastrada nessa rotina.</p>`;
    return;
  }

  areaTreino.innerHTML = tarefas
    .map((tarefa) => montarCardPersonalizado(tarefa, campos))
    .join("");

  ativarEventosCardsPersonalizados(tarefas);
}

function renderizarTabelaPorDia(tarefas, campos) {
  tabelaCard.classList.add("hidden");
  areaTreino.classList.remove("hidden");
  areaTreino.innerHTML = "";

  const dias = obterDiasSemanaRotina(false);

  dias.forEach((diaObj) => {
    const dia = diaObj.valor;
    const nomeDia = diaObj.nome;

    const tarefasDoDia = tarefas.filter((tarefa) => tarefa.dia_semana === dia);

    const bloco = document.createElement("div");
    bloco.classList.add("bloco-dia-treino");

    bloco.innerHTML = `
      <h3>${nomeDia}</h3>

      <div class="lista-exercicios-dia" data-dia="${dia}">
        ${
          tarefasDoDia.length
            ? tarefasDoDia
                .map((tarefa) => montarCardPersonalizado(tarefa, campos))
                .join("")
            : `<p>${MyNotePrefs.t("Nenhuma tarefa")}</p>`
        }
      </div>
    `;

    areaTreino.appendChild(bloco);
  });

  ativarEventosCardsPersonalizados(tarefas);
}

function animarTransicaoRotina() {
  if (!secaoRotinas) return;

  secaoRotinas.classList.remove("rotina-transicao-suave");
  void secaoRotinas.offsetWidth;
  secaoRotinas.classList.add("rotina-transicao-suave");
}

async function carregarTarefas(rotinaId, nomeRotina) {
  try {
    rotinaSelecionadaId = rotinaId;
    rotinaSelecionadaNome = nomeRotina;
    tituloRotina.textContent = nomeRotina;
    const tipoRotina = obterTipoRotina(nomeRotina);
    atualizarVisibilidadeBotaoFrequenciaRotina(tipoRotina);

    if (btnMenuRotina) {
      btnMenuRotina.classList.remove("hidden");
    }

    const rotinaResposta = await fetch(
      `${API_BASE_URL}/rotinas/${rotinaId}`,
      {
        headers: headersAuth(),
      },
    );
    rotinaAtual = await rotinaResposta.json();

    const modeloRotina = rotinaAtual?.tipo_modelo || "tabela";

    campoNotas.value = rotinaAtual.notas || "";

    let camposPersonalizados = [];

    try {
      camposPersonalizados = normalizarCamposRotina(
        rotinaAtual.campos_config,
        [],
      );
    } catch {
      camposPersonalizados = [];
    }

    camposPersonalizados = ajustarCamposParaRotina(
      camposPersonalizados,
      tipoRotina,
      rotinaAtual,
    );

    if (camposPersonalizados.length > 0) {
      renderizarCabecalhoPersonalizado(camposPersonalizados);
    } else {
      renderizarCabecalhoTarefas(tipoRotina);
    }

    atualizarBotaoSilenciarRotina();

    const tarefas = await buscarTarefasDaRotina(rotinaId);

    if (tipoRotina === "treino") {
      tabelaCard.classList.add("hidden");
      areaTreino.classList.remove("hidden");
      renderizarTreino(tarefas);
      atualizarBotaoSilenciarRotina();
      animarTransicaoRotina();
      return;
    }

    if (tipoRotina === "semanal") {
      tabelaCard.classList.add("hidden");
      areaTreino.classList.remove("hidden");
      renderizarSemanal(tarefas);
      atualizarBotaoSilenciarRotina();
      animarTransicaoRotina();
      return;
    }

    corpoTabelaTarefas.innerHTML = "";

    if (tipoRotina === "semanal") {
      tabelaCard.classList.add("hidden");
      areaTreino.classList.remove("hidden");
      areaTreino.innerHTML = "";

      btnSilenciarRotina.classList.add("hidden");

      renderizarSemanal(tarefas);
      return;
    }

    if (tipoRotina === "treino") {
      tabelaCard.classList.add("hidden");
      areaTreino.classList.remove("hidden");
      areaTreino.innerHTML = "";

      btnSilenciarRotina.classList.add("hidden");

      renderizarTreino(tarefas);
      return;
    }

    if (
      tipoRotina === "treino" &&
      modeloRotina === "treino_card" &&
      camposPersonalizados.length > 0
    ) {
      renderizarCardsPersonalizados(tarefas, camposPersonalizados);
      return;
    }

    if (
      tipoRotina === "treino" &&
      modeloRotina === "tabela_por_dia" &&
      camposPersonalizados.length > 0
    ) {
      renderizarTabelaPorDia(tarefas, camposPersonalizados);
      return;
    }

    // Rotinas comuns usam somente tabela
    tabelaCard.classList.remove("hidden");
    areaTreino.classList.add("hidden");
    areaTreino.innerHTML = "";

    if (!tarefas.length) {
      const totalColunas = tabelaTarefas.querySelectorAll("thead th").length;

      corpoTabelaTarefas.innerHTML = `
    <tr class="linha-vazia">
      <td colspan="${totalColunas}">Nenhuma tarefa cadastrada nessa rotina.</td>
    </tr>
      `;
      animarTransicaoRotina();
      return;
    }

    tarefas.forEach((tarefa) => {
      const tr = document.createElement("tr");

      if (tarefa.concluida) {
        tr.classList.add("tarefa-concluida");
      }

      if (modoEdicaoTabela) {
        tr.setAttribute("draggable", "true");
        tr.dataset.id = tarefa.id;
      }

      if (camposPersonalizados.length > 0) {
        tr.innerHTML = montarLinhaPersonalizada(tarefa, camposPersonalizados);
      } else {
        tr.innerHTML = montarLinhaTarefa(tarefa, tipoRotina);
      }
      const btnCheckTarefa = tr.querySelector(".check-tarefa");

      btnCheckTarefa?.addEventListener("click", async (event) => {
        event.stopPropagation();

        const novoConcluida = !tarefa.concluida;
        const novoStatus = novoConcluida ? "Concluída" : "Pendente";

        try {
          await atualizarTarefa(tarefa.id, {
  concluida: novoConcluida,
  status: novoStatus,
});

tarefa.concluida = novoConcluida;
tarefa.status = novoStatus;

aplicarEstadoConclusaoLinha(tr, btnCheckTarefa, novoConcluida);

invalidarCacheTarefas(rotinaSelecionadaId);
        } catch (erro) {
          console.error("Erro ao atualizar tarefa:", erro);
        }
      });

      const btnExcluir = tr.querySelector(".btn-excluir");

      const btnNotificacao = tr.querySelector(".btn-notificacao");

      const camposEditaveis = tr.querySelectorAll(".campo-editavel");

      camposEditaveis.forEach((campoBtn) => {
        campoBtn.addEventListener("click", (event) => {
          event.stopPropagation();

          abrirModalEditarCampo(
            tarefa.id,
            campoBtn.dataset.campo,
            campoBtn.dataset.valor,
            `Editar ${campoBtn.dataset.campo}`,
          );
        });
      });

      const btnEditarAlimentacao = tr.querySelector(".btn-editar-card");

      if (btnEditarAlimentacao) {
        btnEditarAlimentacao.addEventListener("click", (event) => {
          event.stopPropagation();
          abrirModalEditarAlimentacao(tarefa);
        });
      }

      if (btnNotificacao) {
        btnNotificacao?.addEventListener("click", async (event) => {
          event.stopPropagation();

          try {
            await fetch(`${API_BASE_URL}/tarefas/${tarefa.id}`, {
              method: "PUT",
              headers: headersAuth(),
              body: JSON.stringify({
                concluida: tarefa.concluida,
                status: tarefa.status,
                notificacao: !tarefa.notificacao,
              }),
            });

            invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
          } catch (erro) {
            console.error("Erro ao alterar notificação:", erro);
            mostrarAviso("erro", "Não foi possível alterar a notificação.");
          }
        });
      }

      btnExcluir?.addEventListener("click", async (event) => {
        event.stopPropagation();

        mostrarConfirmacao(
          `Deseja excluir a tarefa "${tarefa.titulo}"?`,
          async () => {
          },
        );

        try {
          const resposta = await fetch(
            `${API_BASE_URL}/tarefas/${tarefa.id}`,
            {
              method: "DELETE",
              headers: headersAuth(),
            },
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            mostrarAviso("erro", dados.msg || "Erro ao excluir tarefa.");
            return;
          }

          mostrarAviso("sucesso", "Tarefa excluída com sucesso!");
          invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
        } catch (erro) {
          console.error("Erro ao excluir tarefa:", erro);
          mostrarAviso("erro", "Não foi possível excluir a tarefa.");
        }
      });

      corpoTabelaTarefas.appendChild(tr);
    });

    marcarColunasOpcionaisTabela();

    if (modoEdicaoTabela) {
      ativarDragTarefasTabela();
    }

    animarTransicaoRotina();
  } catch (erro) {
    console.error("Erro ao carregar tarefas:", erro);
    mostrarAviso("erro", "Erro ao carregar tarefas.");
  }
}

function validarPrazo(prazo) {
  const formato = /^\d{2}\/\d{2}$/;
  if (!formato.test(prazo)) return false;

  const [dia, mes] = prazo.split("/").map(Number);

  if (mes < 1 || mes > 12) return false;

  const diasPorMes = [
    31,
    new Date().getFullYear() % 4 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (dia < 1 || dia > diasPorMes[mes - 1]) return false;

  return true;
}

async function salvarNovaTarefa() {
  if (!rotinaSelecionadaId) {
    mostrarAviso("aviso", "Selecione uma rotina primeiro.");
    return;
  }

  const titulo = tituloTarefaInput.value.trim().slice(0, 35);
  const tipoRotina = obterTipoRotina(tituloRotina.textContent);
  const modeloRotina = obterModeloRotinaAtual();

  let tipo = "";

  if (tipoRotina === "alimentacao") {
    tipo = tipoTarefaInput.value.trim();
  } else {
    tipo = tipoTarefaSelect?.value || "";
  }

  const disciplina = disciplinaTarefaInput.value.trim();
  const horario = horarioTarefaInput.value;
  const notificacao =
    tipoRotina === "treino" ? false : notificacaoTarefaInput.checked;
  const alarmeDaTarefa = alarmeTarefaInput?.checked !== false;
  const status = "Pendente";

  const diaSemana = diaSemanaInput?.value;
  const grupoMuscular = grupoMuscularInput?.value;
  const series = seriesInput?.value;
  const repeticoes = repeticoesInput?.value;
  const carga = cargaInput?.value;

  const linkMaterial = linkMaterialInput?.value.trim();
  const projeto = projetoInput?.value.trim();
  const prioridade = prioridadeInput?.value;
  const prazo = prazoInput?.value.trim();
  const caloriasDigitadas = caloriasInput?.value.trim();
  const calorias = validarCaloriasFormulario(caloriasDigitadas);

  if (calorias === null) return;

  if (tipoRotina === "trabalho" && prazo) {
    if (!validarPrazo(prazo)) {
      mostrarAviso(
        "aviso",
        "Digite uma data válida no formato DD/MM. Exemplo: 20/04",
      );
      return;
    }
  }

  if (!titulo) {
    mostrarAviso("Aviso", "Digite o título da tarefa.");
    return;
  }

  const campos = obterCamposDaRotinaAtual();

  let dados = {
    id: Date.now(),
    rotina_id: rotinaSelecionadaId,
    titulo,
    status: "Pendente",
    concluida: false,
  };

  if (!campos.length || campos.includes("tipo")) {
    dados.tipo = tipo;
  }

  if (!campos.length || campos.includes("disciplina")) {
    dados.disciplina = disciplina;
  }

  if (!campos.length || campos.includes("horario")) {
    dados.horario = horario;
  }

  if (!campos.length || campos.includes("notificacao")) {
    dados.notificacao = notificacao;
  }

  if (!campos.length || campos.includes("link_material")) {
    dados.link_material = linkMaterial;
  }

  if (!campos.length || campos.includes("projeto")) {
    dados.projeto = projeto;
  }

  if (!campos.length || campos.includes("prioridade")) {
    dados.prioridade = prioridade;
  }

  if (!campos.length || campos.includes("prazo")) {
    dados.prazo = prazo;
  }

  if (!campos.length || campos.includes("calorias")) {
    dados.calorias = calorias;
  }

  if (modeloRotina === "tabela_por_dia") {
    dados.dia_semana = diaSemana;
  }

  if (tipoRotina === "treino") {
    const s = Number(series);
    const r = Number(repeticoes);
    const c = Number(carga);

    if (!s || !r || carga === "") {
      mostrarAviso("Aviso", "Preencha séries, repetições e carga.");
      return;
    }

    if (s <= 0 || r <= 0 || c < 0) {
      mostrarAviso("Aviso", "Valores inválidos.");
      return;
    }

    if (s > 5) {
      mostrarAviso("Aviso", "Máximo de 5 séries.");
      return;
    }

    if (r > 25) {
      mostrarAviso("Aviso", "Máximo de 25 repetições.");
      return;
    }

    if (c > 600) {
      mostrarAviso("Aviso", "Carga máxima é 600.");
      return;
    }
  }

  if (tipoRotina === "treino") {
    dados = {
      id: Date.now(),
      rotina_id: rotinaSelecionadaId,
      titulo,
      dia_semana: diaSemana,
      grupo_muscular: grupoMuscular,
      series,
      repeticoes,
      carga,
      status: "Pendente",
      concluida: false,
    };
  }

  if (tipoRotina === "estudos") {
    dados.link_material = linkMaterial;
  }

  if (tipoRotina === "trabalho") {
    dados = {
      id: Date.now(),
      rotina_id: rotinaSelecionadaId,
      titulo,
      projeto,
      prioridade,
      prazo,
      horario,
      status: "Pendente",
      notificacao,
      concluida: false,
    };
  }

  if (tipoRotina === "alimentacao") {
    dados = {
      id: Date.now(),
      rotina_id: rotinaSelecionadaId,
      titulo,
      tipo,
      horario,
      calorias,
      status: "Pendente",
      notificacao,
      concluida: false,
    };
  }

  if (tipoRotina === "semanal") {
    dados = {
      id: Date.now(),
      rotina_id: rotinaSelecionadaId,
      titulo,
      horario,
      dia_semana: diaSemanaInput.value,
      repeticao: repeticaoSemanalInput.value,
      data_criacao: new Date().toISOString().slice(0, 10),
      ultima_semana_reset: new Date().toISOString().slice(0, 10),
      notificacao,
      status: "Pendente",
      concluida: false,
    };
  }

  if (tipoRotina === "matinal" || tipoRotina === "noturna") {
    dados = {
      id: Date.now(),
      rotina_id: rotinaSelecionadaId,
      titulo,
      horario,
      status: "Pendente",
      notificacao,
      concluida: false,
    };
  }

  if (tipoRotina !== "treino") {
    dados.alarme = alarmeDaTarefa;
  }

  try {
    const resposta = await fetch(`${API_BASE_URL}/tarefas`, {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify(dados),
    });

    const dadosResposta = await resposta.json();

    if (!resposta.ok) {
      mostrarAviso("erro", dadosResposta.msg || "Erro ao criar tarefa.");
      return;
    }

    mostrarAviso("sucesso", "Tarefa criada com sucesso!");
    if (tipoRotina !== "treino") {
      const tarefaCriadaId = dadosResposta.id || dados.id;
      salvarPreferenciaTarefa(tarefaCriadaId, { alarme: alarmeDaTarefa });
    }
    fecharModalNovaTarefa();
    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
  } catch (erro) {
    console.error("Erro completo ao criar tarefa:", erro);
    mostrarAviso(
      "erro",
      "Não foi possível criar a tarefa. Veja o console do navegador.",
    );
  }
}

//Treino
function carregarDescansosTreino() {
  const chave = `descansosTreino_${rotinaSelecionadaId}`;
  return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarDescansosTreino(descansos) {
  const chave = `descansosTreino_${rotinaSelecionadaId}`;
  localStorage.setItem(chave, JSON.stringify(descansos));
}

function ativarDragTreino() {
  const listas = document.querySelectorAll(".lista-exercicios-dia");

  listas.forEach((lista) => {
    const cards = lista.querySelectorAll(".card-exercicio[draggable='true']");

    cards.forEach((card) => {
      if (card.dataset.dragListenersAtivos === "true") return;
      card.dataset.dragListenersAtivos = "true";

      card.addEventListener("dragstart", () => {
        card.classList.add("linha-arrastando");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("linha-arrastando");
        salvarOrdemTreino();
      });
    });

    if (lista.dataset.dragListenersAtivos === "true") return;
    lista.dataset.dragListenersAtivos = "true";

    lista.addEventListener("dragover", (event) => {
      event.preventDefault();

      const cardArrastando = document.querySelector(
        ".card-exercicio.linha-arrastando",
      );
      const cardDepois = pegarCardDepoisDoMouse(lista, event.clientX);

      if (!cardArrastando) return;

      const textoVazio = lista.querySelector("p");
      if (textoVazio) textoVazio.remove();

      if (cardDepois == null) {
        lista.appendChild(cardArrastando);
      } else {
        lista.insertBefore(cardArrastando, cardDepois);
      }
    });
  });
}

function pegarCardDepoisDoMouse(container, x) {
  const cards = [
    ...container.querySelectorAll(
      ".card-exercicio[draggable='true']:not(.linha-arrastando)",
    ),
  ];

  return cards.reduce(
    (maisProximo, card) => {
      const box = card.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;

      if (offset < 0 && offset > maisProximo.offset) {
        return { offset, element: card };
      }

      return maisProximo;
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

async function salvarOrdemTreino() {
  const cards = [
    ...document.querySelectorAll(".card-exercicio[draggable='true']"),
  ];

  try {
    await Promise.all(
      cards.map((card, index) => {
        return fetch(`${API_BASE_URL}/tarefas/${card.dataset.id}`, {
          method: "PUT",
          headers: headersAuth(),
          body: JSON.stringify({
            ordem: index + 1,
            dia_semana: card.closest(".lista-exercicios-dia")?.dataset.dia,
          }),
        });
      }),
    );

    invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
  } catch (erro) {
    console.error("Erro ao salvar ordem do treino:", erro);
    mostrarAviso("erro", "Não foi possível salvar a ordem dos exercícios.");
  }
}

//Lembretes
function atualizarTextoNotificacaoLembrete() {
  if (!textoNotificacaoLembrete || !notificacaoLembreteInput) return;

  if (notificacaoLembreteInput.checked) {
    textoNotificacaoLembrete.textContent = "🔔 Notificação ativada";
    textoNotificacaoLembrete.classList.add("ativa");
  } else {
    textoNotificacaoLembrete.textContent = "🔕 Notificação desativada";
    textoNotificacaoLembrete.classList.remove("ativa");
  }
}

function abrirModalLembrete() {
  modalLembrete.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  tituloLembreteInput.value = "";
  horarioLembreteInput.value = "";
  diaMesLembreteInput.value = "";
  prioridadeLembreteInput.value = "Média";
  notificacaoLembreteInput.checked = false;
  if (alarmeLembreteInput) alarmeLembreteInput.checked = true;

  atualizarTextoNotificacaoLembrete();
  tituloLembreteInput.focus();
}

function atualizarTextoAlarmeLembreteModal(notificacaoAtiva = null) {
  if (!alarmeLembreteInput || !textoAlarmeLembrete) return;

  const podeAlarmar =
    notificacaoAtiva === null
      ? notificacaoLembreteInput?.checked
      : notificacaoAtiva;
  const alarmeAtivo = !!podeAlarmar && alarmeLembreteInput.checked;

  alarmeLembreteInput.disabled = !podeAlarmar;
  textoAlarmeLembrete.classList.toggle("ativa", alarmeAtivo);
  textoAlarmeLembrete.textContent = alarmeAtivo
    ? "Alarme ativado"
    : podeAlarmar
      ? "Apenas notificar"
      : "Ative a notificacao para usar alarme";
}

function atualizarTextoNotificacaoLembrete() {
  if (!textoNotificacaoLembrete || !notificacaoLembreteInput) return;

  const notificacaoAtiva = notificacaoLembreteInput.checked;
  textoNotificacaoLembrete.textContent = notificacaoAtiva
    ? "Notificacao ativada"
    : "Notificacao desativada";
  textoNotificacaoLembrete.classList.toggle("ativa", notificacaoAtiva);
  atualizarTextoAlarmeLembreteModal(notificacaoAtiva);
}

function abrirVisaoAnual() {
  modoCalendario = "ano";

  document.querySelector(".calendario-semana")?.classList.add("hidden");
  diasCalendario?.classList.add("hidden");
  painelEventosDia?.classList.add("hidden");

  visaoAnualCalendario?.classList.remove("hidden");

  renderizarVisaoAnual();
}

function voltarParaMes(mes) {
  modoCalendario = "mes";

  dataCalendarioAtual.setMonth(mes);

  visaoAnualCalendario?.classList.add("hidden");

  document.querySelector(".calendario-semana")?.classList.remove("hidden");
  diasCalendario?.classList.remove("hidden");

  mesAnterior?.classList.remove("hidden");
  proximoMes?.classList.remove("hidden");

  renderizarCalendario();
}

function renderizarVisaoAnual() {
  const ano = dataCalendarioAtual.getFullYear();
  const hojeISO = dataHojeISO();
  const [anoHoje, mesHoje, diaHoje] = hojeISO.split("-").map(Number);

  btnModoAno.textContent = ano;
  mesesAnoCalendario.innerHTML = "";

  const nomesMeses = MyNotePrefs.labels().months.map((mes) => mes.slice(0, 3));

  nomesMeses.forEach((nomeMes, indexMes) => {
    const cardMes = document.createElement("div");
    cardMes.classList.add("mini-mes");

    if (ano === anoHoje && indexMes === mesHoje - 1) {
      cardMes.classList.add("mini-mes-atual");
    }

    cardMes.innerHTML = `
      <h3>${nomeMes}</h3>
      <div class="mini-semana">
        ${MyNotePrefs.weekDays("weekdaysShort")
          .map((dia) => `<span>${dia.label.slice(0, 1)}</span>`)
          .join("")}
      </div>
      <div class="mini-grade-dias"></div>
    `;

    const grade = cardMes.querySelector(".mini-grade-dias");

    const primeiroDia =
      (new Date(ano, indexMes, 1).getDay() - MyNotePrefs.weekStartIndex() + 7) %
      7;
    const totalDias = new Date(ano, indexMes + 1, 0).getDate();

    const diasVazios = Array.from(
      { length: primeiroDia },
      () => `<span class="mini-dia vazio"></span>`,
    );
    const diasDoMes = Array.from({ length: totalDias }, (_, indice) => {
      const dia = indice + 1;
      const ehHoje =
        ano === anoHoje && indexMes === mesHoje - 1 && dia === diaHoje;

      return `
        <span class="mini-dia ${ehHoje ? "mini-dia-hoje" : ""}">
          ${dia}
        </span>
      `;
    });

    grade.innerHTML = [...diasVazios, ...diasDoMes].join("");

    cardMes.addEventListener("click", () => {
      voltarParaMes(indexMes);
    });

    mesesAnoCalendario.appendChild(cardMes);
  });
}

btnModoAno?.addEventListener("click", abrirVisaoAnual);

function fecharModalNovoLembrete() {
  modalLembrete.classList.add("hidden");
  document.body.style.overflow = "";
}

async function excluirLembretesConcluidos() {
  mostrarConfirmacao(
    "Deseja excluir todos os lembretes concluídos?",
    async () => {
      try {
        const resposta = await fetch(
          `${API_BASE_URL}/lembretes`,
          {
            headers: headersAuth(),
          },
        );
        const lembretes = await lerListaJson(resposta);

        const concluidos = lembretes.filter((lembrete) =>
          String(lembrete.status).toLowerCase().includes("conclu"),
        );

        if (!concluidos.length) {
          mostrarAviso("aviso", "Não há lembretes concluídos para excluir.");
          return;
        }

        await Promise.all(
          concluidos.map((lembrete) =>
            fetch(`${API_BASE_URL}/lembretes/${lembrete.id}`, {
              method: "DELETE",
              headers: headersAuth(),
            }),
          ),
        );

        opcoesLembretes.classList.add("hidden");
        carregarLembretes();
      } catch (erro) {
        console.error("Erro ao excluir lembretes concluídos:", erro);
        mostrarAviso(
          "erro",
          "Não foi possível excluir os lembretes concluídos.",
        );
      }
    },
  );
}

async function excluirTodosLembretes() {
  mostrarConfirmacao("Deseja excluir TODOS os lembretes?", async () => {
    try {
      const resposta = await fetch(
        `${API_BASE_URL}/lembretes`,
        {
          headers: headersAuth(),
        },
      );
      const lembretes = await lerListaJson(resposta);

      await Promise.all(
        lembretes.map((lembrete) =>
          fetch(`${API_BASE_URL}/lembretes/${lembrete.id}`, {
            method: "DELETE",
            headers: headersAuth(),
          }),
        ),
      );

      opcoesLembretes.classList.add("hidden");
      carregarLembretes();
    } catch (erro) {
      console.error("Erro ao excluir todos os lembretes:", erro);
      mostrarAviso("erro", "Não foi possível excluir todos os lembretes.");
    }
  });
}

function lembreteTemData(lembrete) {
  return !!(lembrete?.dia_mes && String(lembrete.dia_mes).includes("/"));
}

function obterPreferenciaLembrete(lembrete) {
  const lembreteId = lembrete?.lembreteId || lembrete?.id;
  const salva = obterPreferenciaCalendario(`lembrete-${lembreteId}`);
  const alarmeServidor =
    lembrete?.alarme === undefined || lembrete?.alarme === null
      ? true
      : Boolean(Number(lembrete.alarme));

  return {
    modo: lembreteTemData(lembrete) ? "prazo" : "horario",
    alarme:
      salva && Object.prototype.hasOwnProperty.call(salva, "alarme")
        ? salva.alarme !== false
        : alarmeServidor,
    antecedencia:
      salva?.antecedencia ||
      criarAntecedencia("minuto", antecedenciaPadraoMinutos(), true),
  };
}

function salvarAntecedenciaLembrete(lembrete, antecedencia) {
  salvarPreferenciaCalendario(`lembrete-${lembrete.id}`, {
    modo: lembreteTemData(lembrete) ? "prazo" : "horario",
    antecedencia,
  });

  fecharModalOpcoesFrequencia();
  fecharModalNumeroFrequencia();
  carregarLembretes();
  mostrarMensagem("Antecedência do lembrete atualizada!");
}

async function salvarAlarmeLembrete(lembrete, alarme) {
  salvarPreferenciaCalendario(`lembrete-${lembrete.id}`, {
    modo: lembreteTemData(lembrete) ? "prazo" : "horario",
    alarme,
  });

  try {
    await fetch(`${API_BASE_URL}/lembretes/${lembrete.id}`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({ alarme }),
    });
  } catch (erro) {
    console.warn("Nao foi possivel salvar o alarme do lembrete no servidor:", erro);
  }

  fecharModalOpcoesFrequencia();
  fecharModalNumeroFrequencia();
  carregarLembretes();
  mostrarMensagem(
    alarme
      ? "Alarme do lembrete ativado!"
      : "Este lembrete agora apenas notifica.",
  );
}

function abrirPainelFrequenciaLembrete(lembrete) {
  garantirModaisFrequencia();

  const pref = obterPreferenciaLembrete(lembrete);

  abrirModalOpcoesFrequencia(
    "Frequência do lembrete",
    lembrete.titulo || "Lembrete",
    [
      {
        titulo: "Antecedência do aviso",
        descricao: rotuloAntecedencia(pref.antecedencia),
        seta: true,
        acao: () => abrirOpcoesAntecedenciaLembrete(lembrete),
      },
      {
        titulo: "Alarme do lembrete",
        descricao: rotuloAlarmeTarefa(pref),
        seta: true,
        acao: () => abrirOpcoesAlarmeLembrete(lembrete),
      },
    ],
  );
}

function abrirOpcoesAlarmeLembrete(lembrete) {
  const pref = obterPreferenciaLembrete(lembrete);

  abrirOpcoesAlarmeGenerico({
    titulo: "Alarme do lembrete",
    subtitulo: lembrete.titulo || "Lembrete",
    alarmeAtivo: pref.alarme,
    descricaoLigado: "Toca o som e vibra quando o lembrete avisar.",
    descricaoDesligado: "Mostra o aviso sem tocar alarme neste lembrete.",
    onSave: (alarme) => salvarAlarmeLembrete(lembrete, alarme),
  });
}

function abrirOpcoesAntecedenciaLembrete(lembrete) {
  const pref = obterPreferenciaLembrete(lembrete);

  if (!lembreteTemData(lembrete)) {
    abrirModalOpcoesFrequencia(
      "Antecedência do aviso",
      lembrete.titulo || "Lembrete",
      [5, 10, 15, 30].map((minutos) => ({
        titulo: `${minutos} minutos antes`,
        ativo:
          pref.antecedencia?.unidade === "minuto" &&
          Number(pref.antecedencia.valor) === minutos,
        acao: () =>
          salvarAntecedenciaLembrete(
            lembrete,
            criarAntecedencia("minuto", minutos),
          ),
      })),
    );
    return;
  }

  abrirModalOpcoesFrequencia(
    "Antecedência do aviso",
    lembrete.titulo || "Lembrete com data",
    [
      {
        titulo: "1 hora antes",
        ativo:
          pref.antecedencia?.unidade === "hora" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaLembrete(lembrete, criarAntecedencia("hora", 1)),
      },
      {
        titulo: "1 dia antes",
        ativo:
          pref.antecedencia?.unidade === "dia" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaLembrete(lembrete, criarAntecedencia("dia", 1)),
      },
      {
        titulo: "1 semana antes",
        ativo:
          pref.antecedencia?.unidade === "semana" &&
          Number(pref.antecedencia.valor) === 1,
        acao: () =>
          salvarAntecedenciaLembrete(lembrete, criarAntecedencia("semana", 1)),
      },
      {
        titulo: "Personalizado",
        descricao: rotuloAntecedencia(pref.antecedencia),
        seta: true,
        acao: () =>
          abrirNumeroAntecedenciaPrazo({
            valorAtual: pref.antecedencia,
            onSave: (antecedencia) =>
              salvarAntecedenciaLembrete(
                lembrete,
                criarAntecedencia(antecedencia.unidade, antecedencia.valor),
              ),
          }),
      },
    ],
  );
}

async function carregarLembretes() {
  try {
    const lembretes = await buscarLembretes({ force: true });

    corpoTabelaLembretes.innerHTML = "";

    if (!lembretes.length) {
      corpoTabelaLembretes.innerHTML = `
        <tr>
          <td colspan="8">Nenhum lembrete cadastrado.</td>
        </tr>
      `;
      return;
    }

    lembretes.forEach((lembrete) => {
      const tr = document.createElement("tr");

      if (lembrete.status === "Concluído") {
        tr.classList.add("tarefa-concluida");
      }

      tr.innerHTML = `
        <td>${checkConclusaoLembrete(lembrete)} ${lembrete.titulo}</td>
        <td>${lembrete.horario ? formatarHorarioSite(lembrete.horario) : "-"}</td>
        <td>${lembrete.dia_mes || "-"}</td>
        <td><span class="${obterClassePrioridade(lembrete.prioridade)}">${lembrete.prioridade || "-"}</span></td>
        <td><span class="${obterClasseStatus(lembrete.status)}">${lembrete.status || "-"}</span></td>

        <td>
          <button 
            class="btn-notificacao btn-notificacao-lembrete ${lembrete.notificacao ? "ativa" : "desativada"}"
            type="button"
            title="Ativar/desativar notificação"
          >
            ${lembrete.notificacao ? "🔔" : "🔕"}
          </button>
        </td>

        <td class="acoes-lembrete-botoes">
          <button class="btn-frequencia-lembrete" type="button" title="Frequência">
            🔄
          </button>
          <button class="btn-excluir" type="button" data-id="${lembrete.id}" data-tipo="lembrete">
            🗑️
          </button>
        </td>
      `;

      tr.addEventListener("click", async (event) => {
        if (
          event.target.closest(".btn-excluir") ||
          event.target.closest(".btn-notificacao-lembrete") ||
          event.target.closest(".btn-frequencia-lembrete")
        )
          return;

        try {
          const novoStatus =
            lembrete.status === "Concluído" ? "Pendente" : "Concluído";

          const resposta = await fetch(
            `${API_BASE_URL}/lembretes/${lembrete.id}`,
            {
              method: "PUT",
              headers: headersAuth(),
              body: JSON.stringify({
                status: novoStatus,
              }),
            },
          );

          const dados = await resposta.json();

          if (!resposta.ok) {
            mostrarAviso("erro", dados.msg || "Erro ao atualizar lembrete.");
            return;
          }

          carregarLembretes();
        } catch (erro) {
          console.error("Erro ao atualizar lembrete:", erro);
          mostrarAviso("erro", "Erro ao atualizar lembrete.");
        }
      });

      const btnExcluir = tr.querySelector(".btn-excluir");
      const btnNotificacao = tr.querySelector(".btn-notificacao-lembrete");
      const btnFrequencia = tr.querySelector(".btn-frequencia-lembrete");

      btnFrequencia?.addEventListener("click", (event) => {
        event.stopPropagation();
        abrirPainelFrequenciaLembrete(lembrete);
      });

      btnNotificacao.addEventListener("click", async (event) => {
        event.stopPropagation();

        await fetch(`${API_BASE_URL}/lembretes/${lembrete.id}`, {
          method: "PUT",
          headers: headersAuth(),
          body: JSON.stringify({
            notificacao: !lembrete.notificacao,
          }),
        });

        carregarLembretes();
      });

      btnExcluir?.addEventListener("click", async (event) => {
        event.stopPropagation();

        mostrarConfirmacao(
          `Deseja excluir o lembrete "${lembrete.titulo}"?`,
          async () => {
            try {
              const resposta = await fetch(
                `${API_BASE_URL}/lembretes/${lembrete.id}`,
                {
                  method: "DELETE",
                  headers: headersAuth(),
                },
              );

              const dados = await resposta.json();

              if (!resposta.ok) {
                mostrarAviso("erro", dados.msg || "Erro ao excluir lembrete.");
                return;
              }

              mostrarAviso("sucesso", "Lembrete excluído com sucesso!");
              carregarLembretes();
            } catch (erro) {
              console.error("Erro ao excluir lembrete:", erro);
              mostrarAviso("erro", "Não foi possível excluir o lembrete.");
            }
          },
        );
      });

      corpoTabelaLembretes.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar lembretes:", erro);
    mostrarAviso("erro", "Erro ao carregar lembretes.");
  }
}

async function salvarNovoLembrete() {
  if (lembreteCalendarioEmEdicao) {
    const dados = {
      titulo: tituloLembreteInput.value.trim(),
      horario: horarioLembreteInput.value,
      dia_mes: diaMesLembreteInput.value.trim(),
      prioridade: prioridadeLembreteInput.value,
      notificacao: notificacaoLembreteInput.checked,
      alarme: alarmeLembreteInput?.checked !== false,
    };

    await fetch(
      `${API_BASE_URL}/lembretes/${lembreteCalendarioEmEdicao.lembreteId}`,
      {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify(dados),
      },
    );

    salvarPreferenciaCalendario(
      `lembrete-${lembreteCalendarioEmEdicao.lembreteId}`,
      {
        modo: dados.dia_mes ? "prazo" : "horario",
        alarme: dados.alarme,
      },
    );

    lembreteCalendarioEmEdicao = null;
    salvarLembrete.textContent = "Salvar";

    fecharModalNovoLembrete();
    await carregarLembretes();
    await renderizarCalendario();

    if (dataSelecionadaCalendario) {
      mostrarEventosDoDia(dataSelecionadaCalendario);
    }

    return;
  }

  const titulo = tituloLembreteInput.value.trim();
  const horario = horarioLembreteInput.value;
  const diaMes = diaMesLembreteInput.value.trim();
  const prioridade = prioridadeLembreteInput.value;
  const notificacao = notificacaoLembreteInput.checked;
  const alarme = notificacao && alarmeLembreteInput?.checked !== false;

  if (!titulo) {
    mostrarAviso("aviso", "Digite o título do lembrete.");
    return;
  }

  const lembreteEditandoId = salvarLembrete.dataset.editandoId;

  try {
    const resposta = await fetch(
      lembreteEditandoId
        ? `${API_BASE_URL}/lembretes/${lembreteEditandoId}`
        : `${API_BASE_URL}/lembretes`,
      {
        method: lembreteEditandoId ? "PUT" : "POST",
        headers: headersAuth(),
        body: JSON.stringify({
          titulo,
          horario: horario || null,
          dia_mes: diaMes || null,
          prioridade,
          status: "Pendente",
          notificacao,
          alarme,
          oculto: false,
        }),
      },
    );

    const dados = await lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      console.error("Erro ao salvar lembrete:", dados);
      mostrarAviso(
        "erro",
        dados.detalhe || dados.msg || "Erro ao criar lembrete.",
      );
      return;
    }

    mostrarAviso("sucesso", "Lembrete criado com sucesso!");
    const lembreteSalvoId = lembreteEditandoId || dados.id;
    if (lembreteSalvoId) {
      salvarPreferenciaCalendario(`lembrete-${lembreteSalvoId}`, {
        modo: diaMes ? "prazo" : "horario",
        alarme,
      });
    }
    delete salvarLembrete.dataset.editandoId;

    fecharModalNovoLembrete();
    carregarLembretes();
  } catch (erro) {
    console.error("Erro ao criar lembrete:", erro);
    mostrarAviso("erro", "Erro ao criar lembrete.");
  }
}

corpoTabelaLembretes.addEventListener("click", async (event) => {
  const btnCheck = event.target.closest(".check-lembrete");
  if (!btnCheck) return;

  event.stopPropagation();

  const lembreteId = btnCheck.dataset.id;
  const concluidaAtual = btnCheck.dataset.concluida === "true";

  try {
    await fetch(`${API_BASE_URL}/lembretes/${lembreteId}`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({
        status: concluidaAtual ? "Pendente" : "Concluída",
      }),
    });

    carregarLembretes();
  } catch (erro) {
    console.error("Erro ao concluir lembrete:", erro);
    mostrarAviso("erro", "Não foi possível atualizar o lembrete.");
  }
});

//Notas
campoNotas.addEventListener("blur", async () => {
  if (!rotinaSelecionadaId) return;

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/rotinas/${rotinaSelecionadaId}/notas`,
      {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({
          notas: campoNotas.value,
        }),
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarAviso("erro", dados.msg || "Erro ao salvar notas.");
    }
  } catch (erro) {
    console.error("Erro ao salvar notas:", erro);
    mostrarAviso("erro", "Não foi possível salvar as notas.");
  }
});

//Eventos da sidebar
btnLembretes.addEventListener("click", () => {
  btnHojeCalendario?.classList.add("hidden");
  btnAdicionarEventoCalendario?.classList.add("hidden");
  ativarItemSidebar(btnLembretes);
  mostrarSecaoLembretes();
  carregarLembretes();
});

btnConfiguracoes.addEventListener("click", () => {
  ativarItemSidebar(btnConfiguracoes);
  window.location.href = "configuracoes.html";
});

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    window.location.href = LOGIN_PAGE;
  });
}

btnHojeCalendario?.addEventListener("click", voltarParaHojeCalendario);

//Eventos da rotina
btnNovaRotina.addEventListener("click", abrirModalRotina);
fecharModalRotina.addEventListener("click", fecharModalNovaRotina);
cancelarRotina.addEventListener("click", fecharModalNovaRotina);

nomeRotinaInput?.addEventListener("input", () => {
  nomeRotinaInput.dataset.editadoManual = "true";
});

salvarRotina.addEventListener("click", async () => {
  let nome = nomeRotinaInput.value.trim();
  const templateSelecionado =
    modelosRotinaProntos[rotinaTemplateAtual] ||
    modelosRotinaProntos.personalizada;
  const tipoModeloRotina = obterModeloTemplateRotinaAtual();

  let camposSelecionados = normalizarCamposRotina(
    obterCamposTemplateRotinaAtual(),
  );
  camposSelecionados = ajustarCamposParaRotina(
    camposSelecionados,
    rotinaTemplateAtual === "alimentacao" ? "alimentacao" : "",
  );
  const emojiPersonalizado =
    rotinaTemplateAtual === "personalizada"
      ? normalizarEmojiRotina(emojiRotinaPersonalizadaInput?.value || "🗂️")
      : "";

  if (!nome && rotinaTemplateAtual !== "personalizada") {
    nome = templateSelecionado.nome;
  }

  if (nome.toLowerCase() === "estudar") {
    nome = "Estudos";
  }

  if (!nome) {
    mostrarAviso("aviso", "Digite o nome da rotina.");
    return;
  }

  if (!camposSelecionados.includes("titulo")) {
    mostrarAviso(
      "aviso",
      "A rotina precisa ter pelo menos o campo Título/Tarefa.",
    );
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE_URL}/rotinas`, {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({
        nome,
        tipo_modelo: tipoModeloRotina,
        campos_config: camposSelecionados,
      }),
    });

    const dados = await lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      console.error("Erro ao salvar rotina:", dados);
      mostrarAviso(
        "erro",
        dados.detalhe || dados.msg || "Erro ao criar rotina.",
      );
      return;
    }

    salvarTemplateModalRotina(dados.id, nome, rotinaTemplateAtual);

    if (rotinaTemplateAtual === "personalizada") {
      if (dados.id) {
        salvarEmojiRotinaPersonalizada(dados.id, emojiPersonalizado);
      }
    }

    mostrarAviso("sucesso", "Rotina criada com sucesso!");
    fecharModalNovaRotina();
    invalidarCacheRotinas();
    carregarRotinas();
  } catch (erro) {
    console.error("Erro ao criar rotina:", erro);
    mostrarAviso("erro", "Não foi possível criar a rotina.");
  }
});

modalRotina.addEventListener("click", (event) => {
  if (event.target === modalRotina) {
    fecharModalNovaRotina();
  }
});

btnMenuRotina.addEventListener("click", () => {
  if (!rotinaSelecionadaId) {
    mostrarAviso("aviso", "Selecione uma rotina primeiro.");
    return;
  }

  opcoesRotina.classList.toggle("hidden");
});

btnMenuRotinaTreino?.addEventListener("click", (event) => {
  event.stopPropagation();
  opcoesRotina.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".menu-rotina") &&
    !opcoesRotina.classList.contains("hidden")
  ) {
    opcoesRotina.classList.add("hidden");
  }
});

btnFrequenciaRotina?.addEventListener("click", () =>
  abrirModalFrequenciaRotina(),
);

btnEditarTabela.addEventListener("click", () => {
  if (!rotinaSelecionadaId) return;

  modoEdicaoTabela = !modoEdicaoTabela;

  btnEditarTabela.textContent = modoEdicaoTabela
    ? "🔒 Sair da edição"
    : "✏️ Editar Tabela";

  opcoesRotina.classList.add("hidden");

  invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
});

btnExcluirRotina.addEventListener("click", excluirRotinaSelecionada);

//Eventos da tarefa
fecharModalEditarCampo.addEventListener("click", fecharModalEditarCampoFunc);
cancelarEditarCampo.addEventListener("click", fecharModalEditarCampoFunc);
salvarEditarCampo.addEventListener("click", salvarCampoEditado);
btnSilenciarRotina.addEventListener("click", alternarSilencioRotina);

corpoTabelaTarefas.addEventListener("click", async (event) => {
  const btnCheck = event.target.closest(".check-tarefa");

  if (!btnCheck) return;

  event.stopPropagation();

  const tarefaId = btnCheck.dataset.id;
  const concluidaAtual = btnCheck.dataset.concluida === "true";

  try {
    const novaConcluida = !concluidaAtual;

    await atualizarTarefa(tarefaId, {
      concluida: novaConcluida,
      status: novaConcluida ? "Concluída" : "Pendente",
    });

    aplicarEstadoConclusaoLinha(btnCheck.closest("tr"), btnCheck, novaConcluida);
    invalidarCacheTarefas(rotinaSelecionadaId);
  } catch (erro) {
    console.error("Erro ao concluir tarefa:", erro);
    mostrarAviso("erro", "Não foi possível atualizar a tarefa.");
  }
});

modalEditarCampo.addEventListener("click", (event) => {
  if (event.target === modalEditarCampo) {
    fecharModalEditarCampoFunc();
  }
});

btnNovaTarefa.addEventListener("click", () => {
  if (!rotinaSelecionadaId) {
    mostrarAviso("aviso", "Selecione uma rotina primeiro.");
    return;
  }

  abrirModalTarefa();
});

fecharModalTarefa.addEventListener("click", fecharModalNovaTarefa);
cancelarTarefa.addEventListener("click", fecharModalNovaTarefa);
salvarTarefa.addEventListener("click", salvarNovaTarefa);

modalTarefa.addEventListener("click", (event) => {
  if (event.target === modalTarefa) {
    fecharModalNovaTarefa();
  }
});

fecharModalEditarTreino.addEventListener("click", fecharModalEditarTreinoFunc);
cancelarEditarTreino.addEventListener("click", fecharModalEditarTreinoFunc);
salvarEditarTreino.addEventListener("click", salvarEdicaoTreino);

modalEditarTreino.addEventListener("click", (e) => {
  if (e.target === modalEditarTreino) {
    fecharModalEditarTreinoFunc();
  }
});

function salvarComEnter(inputs, funcaoSalvar) {
  inputs.forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        funcaoSalvar();
      }
    });
  });
}

salvarComEnter(
  [editarSeriesInput, editarRepeticoesInput, editarCargaInput],
  salvarEdicaoTreino,
);

salvarComEnter(
  [editarAlimentoInput, editarHorarioAlimentacaoInput, editarCaloriasInput],
  salvarEdicaoAlimentacao,
);

salvarComEnter([inputEditarCampo], salvarCampoEditado);

fecharModalAviso.addEventListener("click", fecharModalAvisoFunc);

modalAviso.addEventListener("click", (event) => {
  if (event.target === modalAviso) {
    fecharModalAvisoFunc();
  }
});

//Eventos dos lembretes
btnNovoLembrete.addEventListener("click", abrirModalLembrete);
fecharModalLembrete.addEventListener("click", fecharModalNovoLembrete);
cancelarLembrete.addEventListener("click", fecharModalNovoLembrete);
salvarLembrete.addEventListener("click", salvarNovoLembrete);
notificacaoLembreteInput.addEventListener(
  "change",
  atualizarTextoNotificacaoLembrete,
);
alarmeLembreteInput?.addEventListener("change", () =>
  atualizarTextoAlarmeLembreteModal(),
);

btnMenuLembretes?.addEventListener("click", (event) => {
  event.stopPropagation();
  opcoesLembretes.classList.toggle("hidden");
});

btnLimparLembretesConcluidos?.addEventListener(
  "click",
  excluirLembretesConcluidos,
);

btnExcluirTodosLembretes?.addEventListener("click", excluirTodosLembretes);

document.addEventListener("click", (event) => {
  if (
    opcoesLembretes &&
    !opcoesLembretes.classList.contains("hidden") &&
    !event.target.closest(".menu-lembretes-topo")
  ) {
    opcoesLembretes.classList.add("hidden");
  }
});

modalLembrete.addEventListener("click", (event) => {
  if (event.target === modalLembrete) {
    fecharModalNovoLembrete();
  }
});

//Eventos modal alimentação
fecharModalEditarAlimentacao.addEventListener(
  "click",
  fecharModalEditarAlimentacaoFunc,
);

cancelarEditarAlimentacao.addEventListener(
  "click",
  fecharModalEditarAlimentacaoFunc,
);

salvarEditarAlimentacao.addEventListener("click", salvarEdicaoAlimentacao);

modalEditarAlimentacao.addEventListener("click", (event) => {
  if (event.target === modalEditarAlimentacao) {
    fecharModalEditarAlimentacaoFunc();
  }
});

// ===============================
// 🔗 EVENTOS PRINCIPAIS
// ===============================

notificacaoTarefaInput.addEventListener(
  "change",
  atualizarTextoNotificacaoModal,
);

alarmeTarefaInput?.addEventListener("change", atualizarTextoAlarmeTarefaModal);

document.querySelectorAll("input[name='tipoModeloRotina']").forEach((radio) => {
  radio.addEventListener("change", atualizarCamposModeloRotina);
});

camposRotinaCheck.forEach((campo) => {
  campo.addEventListener("change", () => {
    if (rotinaTemplateAtual !== "personalizada") return;
    atualizarPreviewTemplateRotina("personalizada");
  });
});

// ===============================
// CALENDÁRIO DO DASHBOARD
// ===============================

const btnCalendario = document.getElementById("btnCalendario");
const areaCalendario = document.getElementById("areaCalendario");
const mesAnterior = document.getElementById("mesAnterior");
const proximoMes = document.getElementById("proximoMes");
const tituloCalendario = document.getElementById("tituloCalendario");
const diasCalendario = document.getElementById("diasCalendario");

const painelEventosDia = document.getElementById("painelEventosDia");
const tituloEventosDia = document.getElementById("tituloEventosDia");
const listaEventosDia = document.getElementById("listaEventosDia");

const btnAdicionarEventoCalendario = document.getElementById(
  "btnAdicionarEventoCalendario",
);
const modalEventoCalendario = document.getElementById("modalEventoCalendario");
const fecharModalEvento = document.getElementById("fecharModalEvento");
const salvarEventoCalendario = document.getElementById(
  "salvarEventoCalendario",
);

const dataEventoInput = document.getElementById("dataEventoInput");
const tituloEventoInput = document.getElementById("tituloEventoInput");
const horarioEventoInput = document.getElementById("horarioEventoInput");

let dataCalendarioAtual = new Date();
let dataSelecionadaCalendario = null;
let eventosCalendario = [];
let eventosManuaisCache = null;
let eventosManuaisSincronizados = false;
let envioEventosManuaisTimer = null;

function chaveEventosCalendario() {
  return `eventosCalendario_${usuario.id}`;
}

function agruparEventosPorData(eventos) {
  return eventos.reduce((mapa, evento) => {
    if (!mapa.has(evento.data)) {
      mapa.set(evento.data, []);
    }
    mapa.get(evento.data).push(evento);
    return mapa;
  }, new Map());
}

function obterEventosDoDiaCalendario(dataISO) {
  return eventosPorDataCalendario.get(dataISO) || [];
}

function normalizarEventoManual(evento) {
  const normalizado = { ...(evento || {}) };

  if (normalizado.aniversario) {
    normalizado.tipoEvento = "permanente";
    normalizado.excecoes = [];
    if (normalizado.frequencia?.repeticao) {
      normalizado.frequencia = {
        ...normalizado.frequencia,
        repeticao: null,
      };
    }
  }

  return normalizado;
}

function filtrarEventosManuaisValidos(eventos) {
  const hoje = dataHojeISO();
  return (Array.isArray(eventos) ? eventos : [])
    .filter(Boolean)
    .map(normalizarEventoManual)
    .filter((evento) => {
      if (evento.tipoEvento === "permanente") return true;
      return evento.data >= hoje;
    });
}

function carregarEventosManuaisLocais() {
  try {
    return JSON.parse(localStorage.getItem(chaveEventosCalendario())) || [];
  } catch {
    return [];
  }
}

function mesclarEventosManuais(...listas) {
  const mapa = new Map();

  listas.flat().filter(Boolean).forEach((evento) => {
    mapa.set(String(evento.id), evento);
  });

  return filtrarEventosManuaisValidos([...mapa.values()]);
}

function carregarEventosManuais() {
  const eventos = Array.isArray(eventosManuaisCache)
    ? eventosManuaisCache
    : carregarEventosManuaisLocais();
  const eventosValidos = filtrarEventosManuaisValidos(eventos);

  if (eventosValidos.length !== eventos.length) {
    salvarEventosManuais(eventosValidos, { sincronizar: false });
  }

  eventosManuaisCache = eventosValidos;
  return eventosValidos;
}

function salvarEventosManuais(eventos, { sincronizar = true } = {}) {
  const eventosValidos = filtrarEventosManuaisValidos(eventos);
  eventosManuaisCache = eventosValidos;
  localStorage.setItem(chaveEventosCalendario(), JSON.stringify(eventosValidos));

  if (sincronizar) {
    agendarEnvioEventosManuais(eventosValidos);
  }

  return eventosValidos;
}

function agendarEnvioEventosManuais(eventos) {
  clearTimeout(envioEventosManuaisTimer);
  envioEventosManuaisTimer = setTimeout(() => {
    enviarEventosManuaisParaServidor(eventos).catch((erro) =>
      console.warn("Nao foi possivel sincronizar eventos:", erro),
    );
  }, 350);
}

async function enviarEventosManuaisParaServidor(eventos) {
  const resposta = await fetch(`${API_BASE_URL}/eventos-calendario`, {
    method: "PUT",
    headers: headersAuth(),
    body: JSON.stringify({ eventos: filtrarEventosManuaisValidos(eventos) }),
  });

  if (!resposta.ok) {
    throw new Error("Falha ao salvar eventos do calendario.");
  }
}

async function sincronizarEventosManuais({ force = false } = {}) {
  if (!force && eventosManuaisSincronizados) return carregarEventosManuais();

  try {
    const resposta = await fetch(`${API_BASE_URL}/eventos-calendario`, {
      headers: headersAuth(),
    });

    if (!resposta.ok) throw new Error("Falha ao buscar eventos.");

    const eventosServidor = filtrarEventosManuaisValidos(await resposta.json());
    const eventosLocais = filtrarEventosManuaisValidos(
      carregarEventosManuaisLocais(),
    );
    const eventos = mesclarEventosManuais(eventosLocais, eventosServidor);
    eventosManuaisCache = eventos;
    eventosManuaisSincronizados = true;
    localStorage.setItem(chaveEventosCalendario(), JSON.stringify(eventos));

    if (eventos.length !== eventosServidor.length) {
      enviarEventosManuaisParaServidor(eventos).catch((erro) =>
        console.warn("Nao foi possivel enviar eventos locais:", erro),
      );
    }

    return eventos;
  } catch (erro) {
    eventosManuaisSincronizados = false;
    console.warn("Usando eventos locais do calendario:", erro);
    return carregarEventosManuais();
  }
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataBR(dataISO) {
  return MyNotePrefs.formatDisplayDateISO(dataISO);
}

function converterPrazoParaISO(prazo, anoReferencia) {
  if (!prazo) return null;

  const partes = prazo.split("/");
  if (partes.length < 2) return null;

  const dia = partes[0].padStart(2, "0");
  const mes = partes[1].padStart(2, "0");
  const ano = partes[2] || anoReferencia;

  return `${ano}-${mes}-${dia}`;
}

async function carregarEventosDasTarefas() {
  const eventos = [];
  const anoAtual = dataCalendarioAtual.getFullYear();

  try {
    const rotinas = await buscarRotinas();
    const tarefasPorRotina = await Promise.all(
      rotinas.map(async (rotina) => ({
        rotina,
        tarefas: await buscarTarefasDaRotina(rotina.id),
      })),
    );

    tarefasPorRotina.forEach(({ rotina, tarefas }) => {
      tarefas.forEach((tarefa) => {
        if (!tarefa.prazo) return;

        const dataISO = converterPrazoParaISO(tarefa.prazo, anoAtual);
        if (!dataISO) return;

        eventos.push({
          id: `tarefa-${tarefa.id}`,
          tipo: "tarefa",
          data: dataISO,
          titulo: tarefa.titulo,
          horario: tarefa.horario || "",
          origem: rotina.nome,
          tarefaId: tarefa.id,
          rotinaId: rotina.id,
          prazo: tarefa.prazo,
        });
      });
    });
  } catch (erro) {
    console.error("Erro ao carregar tarefas para o calendário:", erro);
  }

  return eventos;
}

function obterClasseEventoLembrete(prioridade) {
  const valor = (prioridade || "").toLowerCase();

  if (valor.includes("alta")) return "evento-lembrete-alta";
  if (valor.includes("média") || valor.includes("media"))
    return "evento-lembrete-media";
  if (valor.includes("baixa")) return "evento-lembrete-baixa";

  return "evento-lembrete-media";
}

async function carregarEventosDosLembretes() {
  const eventos = [];
  const anoAtual = dataCalendarioAtual.getFullYear();

  try {
    const lembretes = await buscarLembretes();

    lembretes.forEach((lembrete) => {
      if (!lembrete.dia_mes) return;

      const dataISO = converterPrazoParaISO(lembrete.dia_mes, anoAtual);
      if (!dataISO) return;

      eventos.push({
        id: `lembrete-${lembrete.id}`,
        tipo: "lembrete",
        data: dataISO,
        titulo: lembrete.titulo,
        horario: lembrete.horario || "",
        prioridade: lembrete.prioridade,
        classeEvento: obterClasseEventoLembrete(lembrete.prioridade),
        lembreteId: lembrete.id,
      });
    });
  } catch (erro) {
    console.error("Erro ao carregar lembretes para o calendário:", erro);
  }

  return eventos;
}

async function atualizarEventosCalendario() {
  const anoAtual = dataCalendarioAtual.getFullYear();
  const eventosLembretes = await carregarEventosDosLembretes();
  const eventosFeriados = carregarEventosFeriados(anoAtual);

  const mesAtual = dataCalendarioAtual.getMonth();

  const eventosManuais = carregarEventosManuais().flatMap((evento) =>
    gerarOcorrenciasEventoManual(evento, anoAtual, mesAtual),
  );

  const eventosTarefas = await carregarEventosDasTarefas();

  eventosCalendario = [
    ...eventosManuais,
    ...eventosTarefas,
    ...eventosLembretes,
    ...eventosFeriados,
  ];
  eventosPorDataCalendario = agruparEventosPorData(eventosCalendario);
}

async function renderizarCalendario({ atualizarEventos = true } = {}) {
  const hojeISO = dataHojeISO();

  if (btnHojeCalendario) {
    btnHojeCalendario.textContent = Number(hojeISO.slice(8, 10));
  }

  if (!areaCalendario) return;

  if (atualizarEventos) {
    await atualizarEventosCalendario();
  }

  diasCalendario.innerHTML = "";
  const fragmentoDias = document.createDocumentFragment();

  const ano = dataCalendarioAtual.getFullYear();
  const mes = dataCalendarioAtual.getMonth();

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  btnModoAno.textContent = `${nomesMeses[mes]} ${ano}`;

  renderizarCabecalhoSemanaCalendario();

  const primeiroDiaMes = new Date(ano, mes, 1);
  const diaSemanaInicio =
    (primeiroDiaMes.getDay() - MyNotePrefs.weekStartIndex() + 7) % 7;
  const totalDias = diasNoMes(mes, ano);

  for (let i = 0; i < diaSemanaInicio; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("dia-calendario", "dia-vazio");
    fragmentoDias.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const dataISO = formatarDataISO(data);

    const eventosDoDia = obterEventosDoDiaCalendario(dataISO);

    const cardDia = document.createElement("div");
    cardDia.classList.add("dia-calendario");
    cardDia.dataset.data = dataISO;

    if (dataISO === hojeISO) {
      cardDia.classList.add("dia-hoje");
    }

    if (dataSelecionadaCalendario === dataISO) {
      cardDia.classList.add("dia-selecionado");
    }

    cardDia.innerHTML = `
      <span class="numero-dia">${dia}</span>
      <div class="eventos-mini"></div>
    `;

    const areaMiniEventos = cardDia.querySelector(".eventos-mini");

    eventosDoDia.slice(0, 3).forEach((evento) => {
      const item = document.createElement("div");
      item.classList.add("evento-mini");

      if (evento.classeEvento) {
        item.classList.add(evento.classeEvento);
      }

      if (evento.tipo === "feriado") {
        item.classList.add("evento-feriado");
      } else if (evento.tipo === "tarefa") {
        item.classList.add("evento-tarefa");
      } else if (evento.aniversario) {
        item.classList.add("evento-aniversario");
      } else if (evento.tipoEvento === "permanente") {
        item.classList.add("evento-permanente");
      } else {
        item.classList.add("evento-unico");
      }

      item.textContent = evento.aniversario
        ? `🎂 ${evento.titulo}`
        : evento.horario
          ? `${formatarHorarioSite(evento.horario)} ${evento.titulo}`
          : evento.titulo;

      areaMiniEventos.appendChild(item);
    });

    if (eventosDoDia.length > 3) {
      const mais = document.createElement("div");
      mais.classList.add("evento-mais");
      mais.textContent = `+${eventosDoDia.length - 3} ${MyNotePrefs.t("eventos")}`;
      areaMiniEventos.appendChild(mais);
    }

    cardDia.addEventListener("click", () => {
      dataSelecionadaCalendario = dataISO;
      mostrarEventosDoDia(dataISO);
      renderizarCalendario({ atualizarEventos: false });
    });

    fragmentoDias.appendChild(cardDia);
  }

  diasCalendario.appendChild(fragmentoDias);
}

function mostrarEventosDoDia(dataISO) {
  const eventosDoDia = [...obterEventosDoDiaCalendario(dataISO)].sort((a, b) =>
    (a.horario || "").localeCompare(b.horario || ""),
  );

  painelEventosDia.classList.remove("hidden");
  tituloEventosDia.textContent = `${MyNotePrefs.t("Eventos de")} ${formatarDataBR(dataISO)}`;
  listaEventosDia.innerHTML = "";

  if (!eventosDoDia.length) {
    listaEventosDia.innerHTML = `<p>${MyNotePrefs.t("Nenhum evento nesse dia.")}</p>`;
    return;
  }

  eventosDoDia.forEach((evento) => {
    const item = document.createElement("div");
    item.classList.add("evento-dia-item");

    item.innerHTML = `
  <div class="evento-dia-info">
    <strong>${evento.titulo}</strong>
    <span>${evento.horario || "Sem horário"}</span>
    <small>${evento.tipo === "feriado" ? MyNotePrefs.t("Feriado brasileiro") : evento.tipo === "lembrete" ? MyNotePrefs.t("Lembrete") : evento.tipo === "tarefa" ? `${MyNotePrefs.t("Rotina")}: ${evento.origem || MyNotePrefs.t("Tarefa")}` : MyNotePrefs.t("Evento manual")}</small>
  </div>

  <div class="evento-dia-acoes">
    <button class="btn-frequencia-evento-dia" type="button" title="Frequência">🔄</button>
    ${evento.tipo === "feriado" ? "" : `<button class="btn-editar-evento-dia" type="button">✏️</button>`}
    ${evento.tipo === "feriado" ? "" : `<button class="btn-excluir-evento-dia" type="button">🗑️</button>`}
  </div>
`;

    item
      .querySelector(".btn-frequencia-evento-dia")
      ?.addEventListener("click", (event) => {
        event.stopPropagation();
        abrirModalFrequenciaEvento(evento);
      });

    item
      .querySelector(".btn-editar-evento-dia")
      ?.addEventListener("click", (eventClick) => {
        eventClick.stopPropagation();

        if (evento.tipo === "lembrete") {
          abrirModalEditarLembreteDoCalendario(evento);
        } else if (evento.tipo === "manual") {
          abrirModalEditarEventoManual(evento);
        } else {
          mostrarAviso(
            "aviso",
            "Eventos vindos de tarefas devem ser editados dentro da rotina.",
          );
        }
      });

    item
      .querySelector(".btn-excluir-evento-dia")
      ?.addEventListener("click", async (eventClick) => {
        eventClick.stopPropagation();

        if (
          evento.tipo === "manual" &&
          (evento.tipoEvento === "permanente" || evento.frequencia?.repeticao)
        ) {
          mostrarConfirmacaoExclusaoEventoRelacionado(evento, dataISO);
          return;
        }

        mostrarConfirmacao(`Excluir "${evento.titulo}"?`, async () => {
          if (evento.tipo === "lembrete") {
            await fetch(
              `${API_BASE_URL}/lembretes/${evento.lembreteId}`,
              {
                method: "DELETE",
                headers: headersAuth(),
              },
            );
            invalidarCacheLembretes();
          } else if (evento.tipo === "manual") {
            const eventos = carregarEventosManuais().filter(
              (ev) => String(ev.id) !== String(evento.id),
            );
            salvarEventosManuais(eventos);
          } else {
            mostrarAviso(
              "aviso",
              "Esse evento veio de uma tarefa. Exclua pela rotina.",
            );
            return;
          }

          await renderizarCalendario();
          mostrarEventosDoDia(dataISO);
          carregarLembretes();
        });
      });

    listaEventosDia.appendChild(item);
  });
}

function dataValida(dia, mes, ano) {
  return dia <= diasNoMes(mes, ano);
}

function abrirModalEventoCalendario() {
  modalEventoCalendario.classList.remove("hidden");

  if (dataSelecionadaCalendario) {
    dataEventoInput.value = dataSelecionadaCalendario;
  } else {
    dataEventoInput.value = dataHojeISO();
  }

  tipoEventoInput.value = "unico";
  tipoEventoInput.disabled = false;
  tituloEventoInput.value = "";
  horarioEventoInput.value = "";
  aniversarioEventoInput.checked = false;
  horarioEventoInput.disabled = false;

  tituloEventoInput.focus();
}

function fecharModalEventoCalendario() {
  modalEventoCalendario.classList.add("hidden");
  tipoEventoInput.disabled = false;
}

function mostrarCalendarioDashboard() {
  const hoje = new Date();

  rotinaSelecionadaId = null;
  rotinaSelecionadaNome = "";
  rotinaAtual = null;
  modoCalendario = "mes";
  dataCalendarioAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  dataSelecionadaCalendario = null;

  mostrarSecaoRotinas();
  limparAtivosSidebar();

  tituloRotina.textContent = "Calendário";

  areaCalendario?.classList.remove("hidden");
  tabelaCard?.classList.add("hidden");
  cardNotasRotina?.classList.add("hidden");
  areaTreino?.classList.add("hidden");
  areaTreino.innerHTML = "";
  visaoAnualCalendario?.classList.add("hidden");
  document.querySelector(".calendario-semana")?.classList.remove("hidden");
  diasCalendario?.classList.remove("hidden");
  painelEventosDia?.classList.add("hidden");

  btnNovaTarefa?.classList.add("hidden");
  btnMenuRotina?.classList.add("hidden");
  btnFrequenciaRotina?.classList.add("hidden");

  fixarAcoesDoCalendarioNaTela();
  btnHojeCalendario?.classList.remove("hidden");
  btnAdicionarEventoCalendario?.classList.remove("hidden");
  mesAnterior?.classList.remove("hidden");
  proximoMes?.classList.remove("hidden");

  renderizarCalendario();
}

btnCalendario?.addEventListener("click", () => {
  mostrarCalendarioDashboard();
  definirTelaMobileDashboard("calendario");
});

mesAnterior?.addEventListener("click", () => {
  if (modoCalendario === "ano") {
    dataCalendarioAtual.setFullYear(dataCalendarioAtual.getFullYear() - 1);
    renderizarVisaoAnual();
    return;
  }

  dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() - 1);
  renderizarCalendario();
});

proximoMes?.addEventListener("click", () => {
  if (modoCalendario === "ano") {
    dataCalendarioAtual.setFullYear(dataCalendarioAtual.getFullYear() + 1);
    renderizarVisaoAnual();
    return;
  }

  dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() + 1);
  renderizarCalendario();
});

btnAdicionarEventoCalendario?.addEventListener(
  "click",
  abrirModalEventoCalendario,
);
fecharModalEvento?.addEventListener("click", fecharModalEventoCalendario);
salvarEventoCalendario?.addEventListener("click", salvarNovoEventoCalendario);

modalEventoCalendario?.addEventListener("click", (event) => {
  if (event.target === modalEventoCalendario) {
    fecharModalEventoCalendario();
  }
});

// ===== CORREÇÃO GERAL DE EXCLUSÃO DE TAREFAS =====
document.addEventListener(
  "click",
  (event) => {
    const btn = event.target.closest(".btn-excluir");

    if (!btn) return;
    if (btn.dataset.tipo === "lembrete") return;

    const item = btn.closest("[data-id]");
    const tarefaId = btn.dataset.id || item?.dataset.id;

    if (!tarefaId) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const nome =
      item?.querySelector(".titulo-semanal")?.textContent ||
      item?.querySelector("strong")?.textContent ||
      item
        ?.querySelector("td")
        ?.textContent?.replace("⬜", "")
        .replace("✅", "")
        .trim() ||
      "esta tarefa";

    tituloModalAviso.textContent = "Confirmar exclusão";
    textoModalAviso.textContent = `Deseja excluir "${nome}"?`;

    modalAviso.classList.remove("hidden");
    okModalAviso.textContent = MyNotePrefs.t("Excluir");

    okModalAviso.onclick = async () => {
      try {
        const resposta = await fetch(
          `${API_BASE_URL}/tarefas/${tarefaId}`,
          {
            method: "DELETE",
            headers: headersAuth(),
          },
        );

        if (!resposta.ok) {
          mostrarAviso("erro", "Erro ao excluir tarefa.");
          return;
        }

        modalAviso.classList.add("hidden");
        okModalAviso.textContent = "OK";

        invalidarCacheTarefas(rotinaSelecionadaId);
      carregarTarefas(rotinaSelecionadaId, tituloRotina.textContent);
        mostrarMensagem("Tarefa excluída com sucesso!");
      } catch (erro) {
        console.error("Erro ao excluir tarefa:", erro);
        mostrarAviso("erro", "Não foi possível excluir a tarefa.");
      }
    };
  },
  true,
);

//Inicialização
async function executarVerificacoesNotificacao() {
  if (verificacoesNotificacaoEmExecucao) return;

  verificacoesNotificacaoEmExecucao = true;
  try {
    await Promise.all([
      verificarLembretesComAntecedencia(),
      verificarTarefasComAntecedencia(),
    ]);
    verificarEventosCalendarioComAntecedencia();
    verificarFeriadosComAntecedencia();
  } finally {
    verificacoesNotificacaoEmExecucao = false;
  }
}

async function inicializarDashboard() {
  await carregarTemaDashboard();
  registrarServiceWorkerDashboard().catch((erro) => {
    console.warn("Nao foi possivel registrar service worker:", erro);
  });
  inicializarPermissaoNotificacao().catch((erro) => {
    console.warn("Nao foi possivel inicializar notificacoes:", erro);
  });
  prepararPedidoPermissaoNotificacaoPorInteracao();
  await Promise.allSettled([
    comTimeout(carregarRotinas(), 8000, "carregar rotinas"),
    comTimeout(carregarLembretes(), 8000, "carregar lembretes"),
    comTimeout(
      sincronizarEventosManuais({ force: true }),
      5000,
      "sincronizar calendario",
    ),
  ]);

  // Roda o reset depois que a tela já carregou, sem travar o usuário
  setTimeout(() => {
    verificarResetTarefas();
  }, 3000);

  mostrarCalendarioDashboard();
  definirTelaMobileDashboard(estaEmMobileDashboard() ? "home" : "");
  processarAcaoInicialNotificacao();

  setTimeout(mostrarResumoDiario, 1500);
  iniciarOnboardingPrimeiroAcesso();

  setTimeout(executarVerificacoesNotificacao, 2000);
  setInterval(executarVerificacoesNotificacao, 30000);
  setInterval(() => sincronizarDadosCompartilhados(), 60000);
  window.addEventListener("focus", () =>
    sincronizarDadosCompartilhados({ force: true }),
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sincronizarDadosCompartilhados({ force: true });
  });
}

inicializarDashboard();
