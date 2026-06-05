// Usuário autenticado
const LOGIN_PAGE = "index.html";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const token = localStorage.getItem("token");
const API_BASE_URL = "https://mynote-app-production-cb61.up.railway.app";

if (!usuario || !token) {
  alert(MyNotePrefs.t("Você precisa fazer login primeiro."));
  window.location.href = LOGIN_PAGE;
  throw new Error("Usuário não autenticado.");
}

function headersAuth() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function lerRespostaJsonSegura(resposta) {
  try {
    return await resposta.json();
  } catch {
    return {};
  }
}

async function fetchJson(endpoint, options = {}) {
  const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headersAuth(),
      ...(options.headers || {}),
    },
  });
  const dados = await lerRespostaJsonSegura(resposta);

  if (!resposta.ok) {
    const erro = new Error(dados.msg || "Erro na requisicao.");
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }

  return dados;
}

function garantirLista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function carregarRotinasComTarefas() {
  const rotinas = garantirLista(await fetchJson("/rotinas"));
  const tarefasPorRotina = await Promise.all(
    rotinas.map((rotina) =>
      fetchJson(`/tarefas?rotina_id=${encodeURIComponent(rotina.id)}`).then(
        garantirLista,
      ),
    ),
  );

  return rotinas.map((rotina, index) => ({
    ...rotina,
    tarefas: tarefasPorRotina[index] || [],
  }));
}

function mensagemErroConfiguracoes(erro) {
  if (erro instanceof TypeError) {
    return `Nao foi possivel conectar ao backend em ${API_BASE_URL}. Verifique se o servidor esta rodando.`;
  }

  return "Erro ao salvar configuracoes.";
}

// Elementos da tela
const temaEscuro = document.getElementById("temaEscuro");
const corDestaque = document.getElementById("corDestaque");
const btnSalvarConfiguracoes = document.getElementById(
  "btnSalvarConfiguracoes",
);
const btnVoltarDashboard = document.getElementById("btnVoltarDashboard");
const btnVoltarDashboardMobile = document.getElementById(
  "btnVoltarDashboardMobile",
);
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
const apenasNotificarTarefas = document.getElementById(
  "apenasNotificarTarefas",
);
const somNotificacaoArquivo = document.getElementById("somNotificacaoArquivo");
const nomeSomNotificacao = document.getElementById("nomeSomNotificacao");
const testarSomNotificacao = document.getElementById("testarSomNotificacao");
const limparSomNotificacao = document.getElementById("limparSomNotificacao");
const labelSomNotificacaoArquivo = document.getElementById(
  "labelSomNotificacaoArquivo",
);
const opcoesSomDispositivo = document.getElementById("opcoesSomDispositivo");
const opcoesModoSomDispositivo = document.querySelectorAll(
  'input[name="modoSomDispositivo"]',
);
const btnEscolherSomDispositivo = document.getElementById(
  "btnEscolherSomDispositivo",
);
const nomeSomDispositivo = document.getElementById("nomeSomDispositivo");
const btnLogoutConta = document.getElementById("btnLogoutConta");
const btnAlterarSenha = document.getElementById("btnAlterarSenha");
const btnExcluirConta = document.getElementById("btnExcluirConta");
const modalAlterarSenha = document.getElementById("modalAlterarSenha");
const modalExcluirConta = document.getElementById("modalExcluirConta");
const btnFecharModalExcluirConta = document.getElementById("btnFecharModalExcluirConta");
const btnCancelarExcluirConta = document.getElementById("btnCancelarExcluirConta");
const btnConfirmarExcluirConta = document.getElementById("btnConfirmarExcluirConta");
const mensagemExcluirConta = document.getElementById("mensagemExcluirConta");
const formAlterarSenha = document.getElementById("formAlterarSenha");
const btnFecharModalSenha = document.getElementById("btnFecharModalSenha");
const btnCancelarSenha = document.getElementById("btnCancelarSenha");
const btnSalvarSenha = document.getElementById("btnSalvarSenha");
const senhaAtualConta = document.getElementById("senhaAtualConta");
const novaSenhaConta = document.getElementById("novaSenhaConta");
const confirmarNovaSenhaConta = document.getElementById(
  "confirmarNovaSenhaConta",
);
const mensagemSenhaConta = document.getElementById("mensagemSenhaConta");
const btnExportarPDF = document.getElementById("btnExportarPDF");
const btnExportarExcel = document.getElementById("btnExportarExcel");
const btnSincronizarBackup = document.getElementById("btnSincronizarBackup");
const btnRestaurarBackup = document.getElementById("btnRestaurarBackup");
const inputRestaurarBackup = document.getElementById("inputRestaurarBackup");
const btnFecharModalFeedback = document.getElementById("btnFecharModalFeedback");
const btnOkModalFeedback = document.getElementById("btnOkModalFeedback");
const modalFeedbackConfiguracoes = document.getElementById("modalFeedbackConfiguracoes");
const tituloModalFeedbackConfiguracoes = document.getElementById("tituloModalFeedbackConfiguracoes");
const textoModalFeedbackConfiguracoes = document.getElementById("textoModalFeedbackConfiguracoes");
const iconeModalFeedbackConfiguracoes = document.getElementById("iconeModalFeedbackConfiguracoes");

//tema de fundo (bolinhas)
const opcoesFundo = document.querySelectorAll(".cor-opcao");

let temaFundoSelecionado = "creme";
let preferenciasGerais = MyNotePrefs.loadLocal();
const APP_NATIVO_CAPACITOR =
  !!window.Capacitor?.isNativePlatform?.() ||
  window.location.protocol === "capacitor:" ||
  window.location.origin === "https://localhost";
const DeviceSound = window.Capacitor?.Plugins?.DeviceSound;
const MODO_SOM_DISPOSITIVO_PADRAO = "device-default";
const MODO_SOM_MYNOTES = "mynotes";
const MODO_SOM_DISPOSITIVO_ESCOLHIDO = "device-picked";
const SOM_ALARME_PADRAO = "assets/alarme-mynote-editado.mp3";

document.body?.classList.toggle("app-nativo-capacitor", APP_NATIVO_CAPACITOR);

function chaveSomNotificacaoUsuario() {
  return `somNotificacaoPersonalizado_${usuario.id}`;
}

function chaveNomeSomNotificacaoUsuario() {
  return `nomeSomNotificacaoPersonalizado_${usuario.id}`;
}

function chaveModoSomDispositivoUsuario() {
  return `modoSomDispositivo_${usuario.id}`;
}

function chaveUriSomDispositivoUsuario() {
  return `uriSomDispositivo_${usuario.id}`;
}

function chaveNomeSomDispositivoUsuario() {
  return `nomeSomDispositivo_${usuario.id}`;
}

function chaveApenasNotificarTarefasUsuario() {
  return `apenasNotificarTarefas_${usuario.id}`;
}

function chavePadroesNotificacaoUsuario() {
  return `padroesNotificacaoHora24Aplicados_${usuario.id}`;
}

function chavePadraoBackupUsuario() {
  return `padraoBackupAutomaticoAplicado_${usuario.id}`;
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

function aplicarPadraoBackupAutomatico(config = {}) {
  if (localStorage.getItem(chavePadraoBackupUsuario()) === "true") {
    return { config, alterado: false };
  }

  localStorage.setItem(chavePadraoBackupUsuario(), "true");

  if (valorConfigAtivo(config.backup_automatico, true)) {
    return { config, alterado: false };
  }

  return {
    config: {
      ...config,
      backup_automatico: true,
    },
    alterado: true,
  };
}

function obterPreferenciaSomDispositivo() {
  return {
    modo:
      localStorage.getItem(chaveModoSomDispositivoUsuario()) ||
      MODO_SOM_DISPOSITIVO_PADRAO,
    uri: localStorage.getItem(chaveUriSomDispositivoUsuario()) || "",
    nome: localStorage.getItem(chaveNomeSomDispositivoUsuario()) || "",
  };
}

function salvarPreferenciaSomDispositivo({ modo, uri, nome } = {}) {
  if (modo) localStorage.setItem(chaveModoSomDispositivoUsuario(), modo);
  if (uri !== undefined) {
    if (uri) localStorage.setItem(chaveUriSomDispositivoUsuario(), uri);
    else localStorage.removeItem(chaveUriSomDispositivoUsuario());
  }
  if (nome !== undefined) {
    if (nome) localStorage.setItem(chaveNomeSomDispositivoUsuario(), nome);
    else localStorage.removeItem(chaveNomeSomDispositivoUsuario());
  }
}

function obterSomNotificacaoConfigurado() {
  if (APP_NATIVO_CAPACITOR) return SOM_ALARME_PADRAO;

  return (
    localStorage.getItem(chaveSomNotificacaoUsuario()) ||
    SOM_ALARME_PADRAO
  );
}

function atualizarControleSomDispositivo() {
  const boxAudio = somNotificacaoArquivo?.closest(".audio-notificacao-box");
  boxAudio?.classList.toggle("modo-app-nativo", APP_NATIVO_CAPACITOR);

  if (labelSomNotificacaoArquivo) {
    labelSomNotificacaoArquivo.textContent = APP_NATIVO_CAPACITOR
      ? "Áudio alarme/notificação"
      : "Áudio do alarme";
  }

  opcoesSomDispositivo?.classList.toggle("hidden", !APP_NATIVO_CAPACITOR);

  if (!APP_NATIVO_CAPACITOR) return;

  const pref = obterPreferenciaSomDispositivo();
  opcoesModoSomDispositivo.forEach((opcao) => {
    opcao.checked = opcao.value === pref.modo;
  });

  if (nomeSomDispositivo) {
    nomeSomDispositivo.textContent = pref.uri
      ? pref.nome || "Som escolhido do dispositivo."
      : "Nenhum som escolhido.";
  }

  if (limparSomNotificacao) {
    limparSomNotificacao.textContent = "Usar padrão do dispositivo";
  }
}

function atualizarNomeSomNotificacao() {
  if (nomeSomNotificacao) {
    nomeSomNotificacao.textContent =
      localStorage.getItem(chaveNomeSomNotificacaoUsuario()) ||
      MyNotePrefs.t("Som padrão");
  }
  atualizarControleSomDispositivo();
}

function valorConfigAtivo(valor, padrao = true) {
  if (valor === undefined || valor === null || valor === "") return padrao;
  return valor !== false && valor !== 0 && valor !== "0";
}

function carregarApenasNotificarTarefasLocal() {
  return localStorage.getItem(chaveApenasNotificarTarefasUsuario()) === "true";
}

function salvarApenasNotificarTarefasLocal() {
  localStorage.setItem(
    chaveApenasNotificarTarefasUsuario(),
    apenasNotificarTarefas?.checked ? "true" : "false",
  );
}

async function tocarSomDispositivoNativo(type = "alarm") {
  if (!APP_NATIVO_CAPACITOR || !DeviceSound) return false;

  const pref = obterPreferenciaSomDispositivo();
  if (pref.modo === MODO_SOM_MYNOTES) return false;

  const opcoes = { type, mode: "system" };
  if (pref.modo === MODO_SOM_DISPOSITIVO_ESCOLHIDO && pref.uri) {
    opcoes.mode = "selected";
    opcoes.uri = pref.uri;
  }

  await DeviceSound.play(opcoes);
  return true;
}

async function tocarSomNotificacaoConfigurado() {
  if (!somNotificacao.checked) return;

  try {
    if (await tocarSomDispositivoNativo("alarm")) return;
  } catch (erro) {
    console.warn("Não foi possível tocar o som do dispositivo:", erro);
  }

  const audio = new Audio(obterSomNotificacaoConfigurado());
  audio
    .play()
    .catch((erro) => console.warn("Não foi possível tocar o som:", erro));
}

async function escolherSomDispositivo() {
  if (!APP_NATIVO_CAPACITOR || !DeviceSound) {
    mostrarModalFeedbackConfiguracoes({
      titulo: MyNotePrefs.t("Recurso indisponível"),
      mensagem: MyNotePrefs.t("Este recurso só funciona no app Android."),
      tipo: "erro",
    });
    return;
  }

  try {
    const pref = obterPreferenciaSomDispositivo();
    const resultado = await DeviceSound.pick({
      type: "alarm",
      currentUri: pref.uri || "",
    });

    if (resultado?.cancelled) {
      atualizarControleSomDispositivo();
      return;
    }

    if (resultado?.uri) {
      salvarPreferenciaSomDispositivo({
        modo: MODO_SOM_DISPOSITIVO_ESCOLHIDO,
        uri: resultado.uri,
        nome: resultado.name || "Som escolhido do dispositivo.",
      });
      atualizarControleSomDispositivo();
    }
  } catch (erro) {
    console.warn("Não foi possível escolher som do dispositivo:", erro);
    mostrarModalFeedbackConfiguracoes({
      titulo: MyNotePrefs.t("Erro ao escolher som"),
      mensagem: MyNotePrefs.t("Não foi possível abrir os sons do dispositivo."),
      tipo: "erro",
    });
  }
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
  salvarApenasNotificarTarefasLocal();

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
    const respostaConfig = await fetchJson("/configuracoes");
    const migracaoPadroes = aplicarPadroesIniciais(respostaConfig);
    const migracaoBackup = aplicarPadraoBackupAutomatico(
      migracaoPadroes.config,
    );
    const config = MyNotePrefs.normalize(migracaoBackup.config);

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
    backupAutomatico.checked = valorConfigAtivo(config.backup_automatico, true);
    modoFoco.checked = !!config.modo_foco;
    if (apenasNotificarTarefas) {
      apenasNotificarTarefas.checked = carregarApenasNotificarTarefasLocal();
    }
    atualizarNomeSomNotificacao();

    opcoesFundo.forEach((btn) => {
      btn.classList.toggle("ativa", btn.dataset.fundo === temaFundoSelecionado);
    });

    if (migracaoPadroes.alterado || migracaoBackup.alterado) {
      await fetchJson("/configuracoes", {
        method: "PUT",
        body: JSON.stringify(montarPayloadConfiguracoes()),
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar configurações:", erro);
    aplicarCamposGerais(preferenciasGerais);
  }
}

async function pedirPermissaoNotificacaoConfiguracoes() {
  if (!("Notification" in window)) return;
  if (!notificacoesGerais.checked || !notificacoesNavegador.checked) return;
  if (Notification.permission !== "default") return;

  try {
    await Notification.requestPermission();
  } catch (erro) {
    console.warn("Nao foi possivel pedir permissao de notificacao:", erro);
  }
}

async function salvarConfiguracoes() {
  try {
    await pedirPermissaoNotificacaoConfiguracoes();

    const payload = {
      ...montarPayloadConfiguracoes(),
      preferencias_salvas_em: Date.now(),
    };
    preferenciasGerais = MyNotePrefs.saveLocal(payload);
    MyNotePrefs.translateDOM(document);

    const resposta = await fetch(`${API_BASE_URL}/configuracoes`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify(payload),
    });

    const dados = await lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      console.error("Erro ao salvar configuracoes:", dados);
      mostrarModalFeedbackConfiguracoes({
        titulo: MyNotePrefs.t("Erro ao salvar"),
        mensagem: dados.msg || MyNotePrefs.t("Erro ao salvar configuracoes."),
        tipo: "erro",
      });
      return;
    }

    mostrarModalFeedbackConfiguracoes({
      titulo: MyNotePrefs.t("Tudo certo"),
      mensagem: MyNotePrefs.t("Configurações salvas com sucesso!"),
      tipo: "sucesso",
    });
  } catch (erro) {
    console.error("Erro ao salvar configurações:", erro);
    mostrarModalFeedbackConfiguracoes({
      titulo: MyNotePrefs.t("Erro ao salvar"),
      mensagem: MyNotePrefs.t(mensagemErroConfiguracoes(erro)),
      tipo: "erro",
    });
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
  if (APP_NATIVO_CAPACITOR) return;
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
  if (APP_NATIVO_CAPACITOR) {
    salvarPreferenciaSomDispositivo({
      modo: MODO_SOM_DISPOSITIVO_PADRAO,
      uri: "",
      nome: "",
    });
    atualizarControleSomDispositivo();
    return;
  }

  localStorage.removeItem(chaveSomNotificacaoUsuario());
  localStorage.removeItem(chaveNomeSomNotificacaoUsuario());
  if (somNotificacaoArquivo) somNotificacaoArquivo.value = "";
  atualizarNomeSomNotificacao();
});

opcoesModoSomDispositivo.forEach((opcao) => {
  opcao.addEventListener("change", async () => {
    if (!opcao.checked) return;

    if (opcao.value === MODO_SOM_DISPOSITIVO_ESCOLHIDO) {
      const pref = obterPreferenciaSomDispositivo();
      if (!pref.uri) {
        await escolherSomDispositivo();
        return;
      }
    }

    salvarPreferenciaSomDispositivo({ modo: opcao.value });
    atualizarControleSomDispositivo();
  });
});

btnEscolherSomDispositivo?.addEventListener("click", escolherSomDispositivo);

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

btnVoltarDashboardMobile?.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

btnLogoutConta?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = LOGIN_PAGE;
});


function fecharModalFeedbackConfiguracoes() {
  if (!modalFeedbackConfiguracoes) return;
  modalFeedbackConfiguracoes.classList.add("hidden");
  modalFeedbackConfiguracoes.setAttribute("aria-hidden", "true");
}

function mostrarModalFeedbackConfiguracoes({
  titulo = "Tudo certo",
  mensagem = "Configurações salvas com sucesso!",
  tipo = "sucesso",
} = {}) {
  if (!modalFeedbackConfiguracoes) {
    alert(mensagem);
    return;
  }

  tituloModalFeedbackConfiguracoes.textContent = titulo;
  textoModalFeedbackConfiguracoes.textContent = mensagem;
  iconeModalFeedbackConfiguracoes.textContent = tipo === "erro" ? "!" : "✓";
  iconeModalFeedbackConfiguracoes.classList.toggle(
    "config-modal-icon-danger",
    tipo === "erro",
  );
  iconeModalFeedbackConfiguracoes.classList.toggle(
    "config-modal-icon-success",
    tipo !== "erro",
  );

  modalFeedbackConfiguracoes.classList.remove("hidden");
  modalFeedbackConfiguracoes.setAttribute("aria-hidden", "false");
  setTimeout(() => btnOkModalFeedback?.focus(), 0);
}

btnFecharModalFeedback?.addEventListener("click", fecharModalFeedbackConfiguracoes);
btnOkModalFeedback?.addEventListener("click", fecharModalFeedbackConfiguracoes);
modalFeedbackConfiguracoes
  ?.querySelector("[data-fechar-modal-feedback]")
  ?.addEventListener("click", fecharModalFeedbackConfiguracoes);

function mostrarMensagemSenha(mensagem, tipo = "erro") {
  if (!mensagemSenhaConta) return;
  mensagemSenhaConta.textContent = mensagem;
  mensagemSenhaConta.classList.toggle("sucesso", tipo === "sucesso");
}

function limparFormularioSenha() {
  formAlterarSenha?.reset();
  mostrarMensagemSenha("");
}

function abrirModalSenha() {
  if (!modalAlterarSenha) return;
  limparFormularioSenha();
  modalAlterarSenha.classList.remove("hidden");
  modalAlterarSenha.setAttribute("aria-hidden", "false");
  setTimeout(() => senhaAtualConta?.focus(), 0);
}

function fecharModalSenha() {
  if (!modalAlterarSenha) return;
  modalAlterarSenha.classList.add("hidden");
  modalAlterarSenha.setAttribute("aria-hidden", "true");
  limparFormularioSenha();
}

btnAlterarSenha?.addEventListener("click", abrirModalSenha);
btnFecharModalSenha?.addEventListener("click", fecharModalSenha);
btnCancelarSenha?.addEventListener("click", fecharModalSenha);

modalAlterarSenha
  ?.querySelector("[data-fechar-modal-senha]")
  ?.addEventListener("click", fecharModalSenha);

document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape") return;

  if (
    modalAlterarSenha &&
    !modalAlterarSenha.classList.contains("hidden")
  ) {
    fecharModalSenha();
  }

  if (
    modalExcluirConta &&
    !modalExcluirConta.classList.contains("hidden")
  ) {
    fecharModalExcluirConta();
  }

  if (
    modalFeedbackConfiguracoes &&
    !modalFeedbackConfiguracoes.classList.contains("hidden")
  ) {
    fecharModalFeedbackConfiguracoes();
  }
});

formAlterarSenha?.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const senhaAtual = senhaAtualConta?.value.trim();
  const novaSenha = novaSenhaConta?.value.trim();
  const confirmarNovaSenha = confirmarNovaSenhaConta?.value.trim();

  if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
    mostrarMensagemSenha("Preencha todos os campos.");
    return;
  }

  if (novaSenha.length < 6) {
    mostrarMensagemSenha("A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  if (novaSenha !== confirmarNovaSenha) {
    mostrarMensagemSenha("A confirmacao precisa ser igual a nova senha.");
    return;
  }

  btnSalvarSenha.disabled = true;
  btnSalvarSenha.textContent = "Salvando...";
  mostrarMensagemSenha("");

  try {
    const resposta = await fetch(`${API_BASE_URL}/auth/alterar-senha`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({
        senhaAtual,
        novaSenha,
      }),
    });

    const dados = await lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      mostrarMensagemSenha(dados.msg || "Erro ao alterar senha.");
      return;
    }

    mostrarMensagemSenha("Senha alterada com sucesso!", "sucesso");
    setTimeout(fecharModalSenha, 900);
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);
    mostrarMensagemSenha("Nao foi possivel alterar a senha.");
  } finally {
    btnSalvarSenha.disabled = false;
    btnSalvarSenha.textContent = "Salvar senha";
  }
});

function abrirModalExcluirConta() {
  if (!modalExcluirConta) return;
  mensagemExcluirConta.textContent = "";
  modalExcluirConta.classList.remove("hidden");
  modalExcluirConta.setAttribute("aria-hidden", "false");
  setTimeout(() => btnCancelarExcluirConta?.focus(), 0);
}

function fecharModalExcluirConta() {
  if (!modalExcluirConta) return;
  modalExcluirConta.classList.add("hidden");
  modalExcluirConta.setAttribute("aria-hidden", "true");
}

btnExcluirConta?.addEventListener("click", abrirModalExcluirConta);
btnFecharModalExcluirConta?.addEventListener("click", fecharModalExcluirConta);
btnCancelarExcluirConta?.addEventListener("click", fecharModalExcluirConta);
modalExcluirConta
  ?.querySelector("[data-fechar-modal-excluir-conta]")
  ?.addEventListener("click", fecharModalExcluirConta);

btnConfirmarExcluirConta?.addEventListener("click", async () => {
  mensagemExcluirConta.textContent = "";
  btnConfirmarExcluirConta.disabled = true;
  btnConfirmarExcluirConta.textContent = "Excluindo...";

  try {
    const resposta = await fetch(`${API_BASE_URL}/auth/excluir-conta`, {
      method: "DELETE",
      headers: headersAuth(),
      body: JSON.stringify({ usuario_id: usuario.id }),
    });

    const dados = await lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      mensagemExcluirConta.textContent = dados.msg || "Erro ao excluir conta.";
      return;
    }

    localStorage.clear();
    window.location.href = LOGIN_PAGE;
  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    mensagemExcluirConta.textContent = "Nao foi possivel excluir a conta.";
  } finally {
    btnConfirmarExcluirConta.disabled = false;
    btnConfirmarExcluirConta.textContent = "Excluir conta";
  }
});
btnExportarPDF?.addEventListener("click", async () => {
  try {
    const rotinasComTarefas = await carregarRotinasComTarefas();

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

    for (const rotina of rotinasComTarefas) {
      const tarefas = rotina.tarefas || [];

      html += `
        <div class="rotina">
          <h2>${escaparHtml(rotina.nome)}</h2>
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
              <td>${escaparHtml(tarefa.titulo || "-")}</td>
              <td>${escaparHtml(tarefa.tipo || "-")}</td>
              <td>${escaparHtml(tarefa.horario || "-")}</td>
              <td>${escaparHtml(tarefa.status || "Pendente")}</td>
              <td>${escaparHtml(tarefa.prioridade || "-")}</td>
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
    const rotinasComTarefas = await carregarRotinasComTarefas();

    let csv =
      "Rotina,Tarefa,Tipo,Status,Horário,Prioridade,Prazo,Data de criação\n";

    for (const rotina of rotinasComTarefas) {
      const tarefas = rotina.tarefas || [];

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
    const [rotinasComTarefas, lembretes, configuracoes] = await Promise.all([
      carregarRotinasComTarefas(),
      fetchJson("/lembretes").then(garantirLista),
      fetchJson("/configuracoes"),
    ]);

    const backup = {
      app: "MyNote",
      versao: "2.6.0",
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
        `${API_BASE_URL}/auth/restaurar-backup`,
        {
          method: "POST",
          headers: headersAuth(),
body: JSON.stringify({
  backup,
}),
        },
      );

      const dados = await lerRespostaJsonSegura(resposta);

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


