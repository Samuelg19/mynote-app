(function iniciarModuloAnotacoes() {
  const contexto = window.MyNoteDashboardContext;
  const secao = document.getElementById("secaoAnotacoes");

  if (!contexto || !secao) return;

  const LIMITE_ANEXOS = 5;
  const LIMITE_ANEXO_BYTES = 1_500_000;
  const LIMITE_TOTAL_ANEXOS_BYTES = 4_000_000;
  const LIMITE_IMAGEM_BYTES = 950_000;
  const LIMITE_CONTEUDO = 4_000_000;
  const EXTENSOES_BLOQUEADAS =
    /\.(?:exe|msi|bat|cmd|com|scr|js|mjs|cjs|html?|svg)$/i;
  const TIPOS_ANEXO_PERMITIDOS = new Set([
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  const elementos = {
    inicio: document.getElementById("anotacoesInicio"),
    detalheCategoria: document.getElementById("detalheCategoriaAnotacoes"),
    editor: document.getElementById("editorAnotacao"),
    tabGerais: document.getElementById("tabAnotacoesGerais"),
    tabCategorias: document.getElementById("tabAnotacoesCategorias"),
    painelGerais: document.getElementById("painelAnotacoesGerais"),
    painelCategorias: document.getElementById("painelAnotacoesCategorias"),
    listaGerais: document.getElementById("listaAnotacoesGerais"),
    listaCategorias: document.getElementById("listaCategoriasAnotacoes"),
    listaCategoria: document.getElementById("listaAnotacoesCategoria"),
    btnAdicionar: document.getElementById("btnAdicionarAnotacao"),
    btnAdicionarCategoria: document.getElementById(
      "btnAdicionarAnotacaoCategoria",
    ),
    btnVoltarCategorias: document.getElementById("btnVoltarCategorias"),
    categoriaEmoji: document.getElementById("categoriaDetalheEmoji"),
    categoriaNome: document.getElementById("categoriaDetalheNome"),
    categoriaContagem: document.getElementById("categoriaDetalheContagem"),
    btnVoltarEditor: document.getElementById("btnVoltarEditorAnotacao"),
    btnSalvar: document.getElementById("btnSalvarAnotacao"),
    btnExcluirEditor: document.getElementById("btnExcluirAnotacaoEditor"),
    tituloInput: document.getElementById("tituloAnotacaoInput"),
    conteudoEditor: document.getElementById("conteudoAnotacaoEditor"),
    toolbar: document.getElementById("toolbarAnotacao"),
    btnDesfazer: document.getElementById("btnDesfazerAnotacao"),
    btnRefazer: document.getElementById("btnRefazerAnotacao"),
    btnAnexar: document.getElementById("btnAnexarArquivoAnotacao"),
    inputImagem: document.getElementById("inputImagemAnotacao"),
    inputArquivo: document.getElementById("inputArquivoAnotacao"),
    areaAnexos: document.getElementById("areaAnexosAnotacao"),
    listaAnexos: document.getElementById("listaAnexosAnotacao"),
    dataEditor: document.getElementById("dataAnotacaoEditor"),
    contadorEditor: document.getElementById("contadorAnotacaoEditor"),
    modalCategoria: document.getElementById("modalCategoriaAnotacao"),
    fecharModalCategoria: document.getElementById(
      "fecharModalCategoriaAnotacao",
    ),
    cancelarCategoria: document.getElementById("cancelarCategoriaAnotacao"),
    salvarCategoria: document.getElementById("salvarCategoriaAnotacao"),
    tituloModalCategoria: document.getElementById(
      "tituloModalCategoriaAnotacao",
    ),
    nomeCategoriaInput: document.getElementById("nomeCategoriaAnotacao"),
    emojiCategoriaInput: document.getElementById("emojiCategoriaAnotacao"),
    opcoesEmoji: document.getElementById("opcoesEmojiCategoriaAnotacao"),
  };

  let abaAtual = "gerais";
  let categoriaAtiva = null;
  let categoriaEmEdicao = null;
  let notaEmEdicao = null;
  let categoriaDestinoEditor = null;
  let origemEditor = "gerais";
  let snapshotEditor = "";
  let carregamentoInicialFeito = false;
  let editorQuill = null;
  let anexosEditor = [];

  function plural(quantidade, singular, pluralTexto) {
    return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
  }

  function formatarBytes(bytes) {
    const valor = Number(bytes || 0);
    if (valor < 1024) return `${valor} B`;
    if (valor < 1024 * 1024) return `${(valor / 1024).toFixed(0)} KB`;
    return `${(valor / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatarDataRelativa(valor) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";

    const agora = new Date();
    const diferencaMs = Math.max(0, agora.getTime() - data.getTime());
    const minutos = Math.floor(diferencaMs / 60000);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos} min atrás`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `${dias}d atrás`;

    const semanas = Math.floor(dias / 7);
    if (semanas < 5) {
      return `${semanas} ${semanas === 1 ? "semana" : "semanas"} atrás`;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      ...(data.getFullYear() === agora.getFullYear()
        ? {}
        : { year: "numeric" }),
    })
      .format(data)
      .replace(/\./g, "");
  }

  function formatarDataEditor(valor) {
    if (!valor) return "Nova anotação";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Anotação";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  }

  function mostrarCarregando(container, texto = "Carregando...") {
    container.replaceChildren();
    const vazio = document.createElement("div");
    vazio.className = "anotacoes-vazio";
    vazio.textContent = texto;
    container.appendChild(vazio);
  }

  function mostrarVazio(container, titulo, texto) {
    container.replaceChildren();
    const vazio = document.createElement("div");
    vazio.className = "anotacoes-vazio";
    const conteudo = document.createElement("div");
    const destaque = document.createElement("strong");
    const descricao = document.createElement("span");

    destaque.textContent = titulo;
    descricao.textContent = texto;
    conteudo.append(destaque, descricao);
    vazio.appendChild(conteudo);
    container.appendChild(vazio);
  }

  async function requisicao(endpoint, opcoes = {}) {
    const resposta = await fetch(`${contexto.apiBaseUrl}${endpoint}`, {
      ...opcoes,
      headers: {
        ...contexto.headersAuth(),
        ...(opcoes.headers || {}),
      },
    });

    contexto.validarRespostaAutenticada(resposta);
    const dados = await contexto.lerRespostaJsonSegura(resposta);

    if (!resposta.ok) {
      throw new Error(dados.msg || "Não foi possível concluir a operação.");
    }

    return dados;
  }

  function tratarErro(erro, mensagemPadrao) {
    console.error(mensagemPadrao, erro);
    contexto.mostrarAviso("erro", erro?.message || mensagemPadrao);
  }

  function criarBotaoIcone(classe, texto, titulo, aoClicar) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    botao.title = titulo;
    botao.setAttribute("aria-label", titulo);
    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      aoClicar();
    });
    return botao;
  }

  function sanitizarHtml(html) {
    const limpo = window.DOMPurify
      ? window.DOMPurify.sanitize(String(html || ""), {
          ADD_ATTR: ["target", "rel", "data-list"],
        })
      : String(html || "");
    const recipiente = document.createElement("div");
    recipiente.innerHTML = limpo;
    recipiente.querySelectorAll("a").forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    return recipiente.innerHTML;
  }

  function criarCardAnotacao(nota) {
    const card = document.createElement("article");
    card.className = "anotacao-card";

    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "anotacao-card-conteudo";
    abrir.addEventListener("click", () => abrirEditor(nota));

    const titulo = document.createElement("h2");
    titulo.textContent = nota.titulo?.trim() || "Sem título";

    const preview = document.createElement("p");
    preview.className = "anotacao-card-preview";
    preview.textContent =
      nota.resumo?.replace(/\s+/g, " ").trim() || "Anotação sem texto.";

    const rodape = document.createElement("div");
    rodape.className = "anotacao-card-rodape";
    const data = document.createElement("time");
    data.className = "anotacao-card-data";
    data.dateTime = nota.criado_em || "";
    data.textContent = formatarDataRelativa(nota.criado_em);
    rodape.appendChild(data);

    if (nota.anexos?.length) {
      const anexos = document.createElement("span");
      anexos.className = "anotacao-card-anexos";
      anexos.textContent = `📎 ${nota.anexos.length}`;
      anexos.title = plural(nota.anexos.length, "anexo", "anexos");
      rodape.appendChild(anexos);
    }

    abrir.append(titulo, preview, rodape);

    const excluir = criarBotaoIcone(
      "anotacao-card-excluir",
      "🗑️",
      `Excluir ${titulo.textContent}`,
      () => confirmarExclusaoNota(nota),
    );

    card.append(abrir, excluir);
    return card;
  }

  function renderizarNotas(container, notas, contextoVazio) {
    container.replaceChildren();

    if (!notas.length) {
      mostrarVazio(container, contextoVazio.titulo, contextoVazio.descricao);
      return;
    }

    const fragmento = document.createDocumentFragment();
    notas.forEach((nota) => fragmento.appendChild(criarCardAnotacao(nota)));
    container.appendChild(fragmento);
  }

  function criarCardCategoria(categoria) {
    const card = document.createElement("article");
    card.className = "categoria-anotacao-card";

    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "categoria-card-conteudo";
    abrir.addEventListener("click", () => abrirCategoria(categoria));

    const emoji = document.createElement("span");
    emoji.className = "categoria-card-emoji";
    emoji.textContent = categoria.emoji || "📁";

    const texto = document.createElement("span");
    texto.className = "categoria-card-texto";

    const nome = document.createElement("span");
    nome.className = "categoria-card-titulo";
    nome.textContent = categoria.nome;

    const contagem = document.createElement("span");
    contagem.className = "categoria-card-contagem";
    contagem.textContent = plural(
      Number(categoria.quantidade_anotacoes || 0),
      "anotação",
      "anotações",
    );

    texto.append(nome, contagem);
    abrir.append(emoji, texto);

    const editar = criarBotaoIcone(
      "categoria-card-editar",
      "✏️",
      `Editar categoria ${categoria.nome}`,
      () => abrirModalCategoria(categoria),
    );
    const excluir = criarBotaoIcone(
      "categoria-card-excluir",
      "🗑️",
      `Excluir categoria ${categoria.nome}`,
      () => confirmarExclusaoCategoria(categoria),
    );

    card.append(abrir, editar, excluir);
    return card;
  }

  function renderizarCategorias(categorias) {
    elementos.listaCategorias.replaceChildren();

    if (!categorias.length) {
      mostrarVazio(
        elementos.listaCategorias,
        "Nenhuma categoria criada",
        "Use o botão + para organizar suas anotações.",
      );
      return;
    }

    const fragmento = document.createDocumentFragment();
    categorias.forEach((categoria) =>
      fragmento.appendChild(criarCardCategoria(categoria)),
    );
    elementos.listaCategorias.appendChild(fragmento);
  }

  async function carregarNotasGerais() {
    mostrarCarregando(elementos.listaGerais);

    try {
      const notas = await requisicao("/anotacoes?categoria=gerais");
      renderizarNotas(elementos.listaGerais, notas, {
        titulo: "Nenhuma anotação geral",
        descricao: "Use o botão + para registrar sua primeira ideia.",
      });
    } catch (erro) {
      mostrarVazio(
        elementos.listaGerais,
        "Não foi possível carregar",
        "Tente novamente em alguns instantes.",
      );
      tratarErro(erro, "Não foi possível carregar as anotações.");
    }
  }

  async function carregarCategorias() {
    mostrarCarregando(elementos.listaCategorias);

    try {
      const categorias = await requisicao("/anotacoes/categorias");
      renderizarCategorias(categorias);
    } catch (erro) {
      mostrarVazio(
        elementos.listaCategorias,
        "Não foi possível carregar",
        "Tente novamente em alguns instantes.",
      );
      tratarErro(erro, "Não foi possível carregar as categorias.");
    }
  }

  async function carregarNotasCategoria() {
    if (!categoriaAtiva) return;

    mostrarCarregando(elementos.listaCategoria);

    try {
      const notas = await requisicao(
        `/anotacoes?categoria_id=${encodeURIComponent(categoriaAtiva.id)}`,
      );
      categoriaAtiva.quantidade_anotacoes = notas.length;
      elementos.categoriaContagem.textContent = plural(
        notas.length,
        "anotação",
        "anotações",
      );
      renderizarNotas(elementos.listaCategoria, notas, {
        titulo: "Categoria vazia",
        descricao: "Use o botão + para criar uma anotação nesta categoria.",
      });
    } catch (erro) {
      mostrarVazio(
        elementos.listaCategoria,
        "Não foi possível carregar",
        "Tente novamente em alguns instantes.",
      );
      tratarErro(erro, "Não foi possível carregar a categoria.");
    }
  }

  function alternarAba(aba) {
    abaAtual = aba;
    const geraisAtiva = aba === "gerais";

    elementos.tabGerais.classList.toggle("ativo", geraisAtiva);
    elementos.tabCategorias.classList.toggle("ativo", !geraisAtiva);
    elementos.tabGerais.setAttribute("aria-selected", String(geraisAtiva));
    elementos.tabCategorias.setAttribute("aria-selected", String(!geraisAtiva));
    elementos.painelGerais.hidden = !geraisAtiva;
    elementos.painelCategorias.hidden = geraisAtiva;
    elementos.btnAdicionar.setAttribute(
      "aria-label",
      geraisAtiva ? "Criar anotação" : "Criar categoria",
    );
    elementos.btnAdicionar.title = geraisAtiva
      ? "Criar anotação"
      : "Criar categoria";

    if (geraisAtiva) carregarNotasGerais();
    else carregarCategorias();
  }

  function ajustarVoltarGlobal(visivel) {
    if (!contexto.estaEmMobileDashboard()) return;
    contexto.btnVoltarMobile?.classList.toggle("hidden", !visivel);
  }

  function mostrarSomente(view) {
    elementos.inicio.hidden = view !== "inicio";
    elementos.detalheCategoria.hidden = view !== "categoria";
    elementos.editor.hidden = view !== "editor";
    ajustarVoltarGlobal(view === "inicio");
    window.scrollTo(0, 0);
  }

  async function abrirCategoria(categoria) {
    categoriaAtiva = { ...categoria };
    elementos.categoriaEmoji.textContent = categoria.emoji || "📁";
    elementos.categoriaNome.textContent = categoria.nome;
    elementos.categoriaContagem.textContent = plural(
      Number(categoria.quantidade_anotacoes || 0),
      "anotação",
      "anotações",
    );
    mostrarSomente("categoria");
    await carregarNotasCategoria();
  }

  function inicializarEditorRico() {
    if (editorQuill) return true;

    if (!window.Quill || !window.DOMPurify) {
      contexto.mostrarAviso(
        "erro",
        "O editor de anotações não pôde ser carregado. Atualize a página.",
      );
      return false;
    }

    editorQuill = new window.Quill(elementos.conteudoEditor, {
      theme: "snow",
      placeholder: "Comece a escrever...",
      modules: {
        history: {
          delay: 700,
          maxStack: 100,
          userOnly: true,
        },
        toolbar: {
          container: elementos.toolbar,
          handlers: {
            image: () => elementos.inputImagem.click(),
          },
        },
      },
    });

    const rotulosToolbar = {
      ".ql-bold": "Negrito",
      ".ql-italic": "Itálico",
      ".ql-underline": "Sublinhado",
      ".ql-strike": "Tachado",
      '.ql-list[value="ordered"]': "Lista numerada",
      '.ql-list[value="bullet"]': "Lista com marcadores",
      '.ql-list[value="check"]': "Checklist",
      ".ql-blockquote": "Citação",
      ".ql-link": "Inserir link",
      ".ql-image": "Inserir imagem",
      ".ql-clean": "Limpar formatação",
    };
    Object.entries(rotulosToolbar).forEach(([seletor, rotulo]) => {
      const controle = elementos.toolbar.querySelector(seletor);
      if (!controle) return;
      controle.title = rotulo;
      controle.setAttribute("aria-label", rotulo);
    });

    editorQuill.on("text-change", atualizarContadorEditor);
    elementos.btnDesfazer.addEventListener("click", () =>
      editorQuill.history.undo(),
    );
    elementos.btnRefazer.addEventListener("click", () =>
      editorQuill.history.redo(),
    );
    elementos.btnAnexar.addEventListener("click", () =>
      elementos.inputArquivo.click(),
    );
    return true;
  }

  function htmlEditor() {
    if (!editorQuill) return "";
    const html = sanitizarHtml(editorQuill.root.innerHTML);
    return html === "<p><br></p>" ? "" : html;
  }

  function textoEditor() {
    return editorQuill?.getText().replace(/\s+/g, " ").trim() || "";
  }

  function assinaturaAnexos() {
    return anexosEditor.map((anexo) => ({
      id: anexo.id,
      nome: anexo.nome,
      tipo: anexo.tipo,
      tamanho: anexo.tamanho,
      tamanhoDados: anexo.dados?.length || 0,
    }));
  }

  function snapshotAtual() {
    return JSON.stringify({
      titulo: elementos.tituloInput.value,
      conteudo: htmlEditor(),
      anexos: assinaturaAnexos(),
      categoria_id: categoriaDestinoEditor,
    });
  }

  function editorTemAlteracoes() {
    return snapshotAtual() !== snapshotEditor;
  }

  function atualizarContadorEditor() {
    const quantidade = editorQuill
      ? Math.max(0, editorQuill.getLength() - 1)
      : 0;
    elementos.contadorEditor.textContent = plural(
      quantidade,
      "caractere",
      "caracteres",
    );
  }

  function carregarConteudoNoEditor(conteudo) {
    editorQuill.setText("");
    const valor = String(conteudo || "");

    if (!valor) return;
    if (/<[a-z][\s\S]*>/i.test(valor)) {
      editorQuill.clipboard.dangerouslyPasteHTML(sanitizarHtml(valor));
    } else {
      editorQuill.setText(valor);
    }
  }

  function iconeAnexo(tipo, nome) {
    if (tipo?.startsWith("image/")) return "🖼️";
    if (tipo === "application/pdf") return "📕";
    if (/spreadsheet|excel|csv/i.test(tipo || nome)) return "📊";
    if (/presentation|powerpoint/i.test(tipo || nome)) return "📽️";
    if (/word|document/i.test(tipo || nome)) return "📘";
    if (/zip/i.test(tipo || nome)) return "🗜️";
    return "📄";
  }

  function renderizarAnexosEditor() {
    elementos.listaAnexos.replaceChildren();
    elementos.areaAnexos.hidden = !anexosEditor.length;

    const fragmento = document.createDocumentFragment();
    anexosEditor.forEach((anexo) => {
      const item = document.createElement("article");
      item.className = "anexo-anotacao-item";

      const icone = document.createElement("span");
      icone.className = "anexo-anotacao-icone";
      icone.textContent = iconeAnexo(anexo.tipo, anexo.nome);

      const dados = document.createElement("div");
      dados.className = "anexo-anotacao-dados";
      const nome = document.createElement("strong");
      nome.textContent = anexo.nome;
      const tamanho = document.createElement("span");
      tamanho.textContent = formatarBytes(anexo.tamanho);
      dados.append(nome, tamanho);

      const acoes = document.createElement("div");
      acoes.className = "anexo-anotacao-acoes";

      if (anexo.dados) {
        const baixar = document.createElement("a");
        baixar.className = "anexo-anotacao-acao";
        baixar.href = anexo.dados;
        baixar.download = anexo.nome;
        baixar.title = "Baixar anexo";
        baixar.setAttribute("aria-label", `Baixar ${anexo.nome}`);
        baixar.textContent = "↓";
        acoes.appendChild(baixar);
      }

      const remover = criarBotaoIcone(
        "anexo-anotacao-acao anexo-anotacao-remover",
        "×",
        `Remover ${anexo.nome}`,
        () => {
          anexosEditor = anexosEditor.filter((itemAtual) => itemAtual.id !== anexo.id);
          renderizarAnexosEditor();
        },
      );
      acoes.appendChild(remover);
      item.append(icone, dados, acoes);
      fragmento.appendChild(item);
    });

    elementos.listaAnexos.appendChild(fragmento);
  }

  async function abrirEditor(nota = null, categoriaId = undefined) {
    try {
      await contexto.garantirEditorAnotacoes?.();
    } catch (erro) {
      tratarErro(erro, "NÃ£o foi possÃ­vel carregar o editor formatado.");
      return;
    }

    if (!inicializarEditorRico()) return;

    origemEditor = categoriaAtiva ? "categoria" : "gerais";
    categoriaDestinoEditor =
      categoriaId !== undefined
        ? categoriaId
        : nota?.categoria_id ?? categoriaAtiva?.id ?? null;
    notaEmEdicao = nota ? { ...nota } : null;

    elementos.tituloInput.value = nota?.titulo || "";
    carregarConteudoNoEditor("");
    anexosEditor = [];
    renderizarAnexosEditor();
    elementos.dataEditor.textContent = nota
      ? "Carregando anotação..."
      : formatarDataEditor();
    elementos.btnExcluirEditor.hidden = !nota;
    elementos.btnSalvar.disabled = Boolean(nota);
    elementos.btnSalvar.textContent = nota ? "Carregando..." : "Salvar";
    atualizarContadorEditor();
    mostrarSomente("editor");

    if (nota?.id) {
      try {
        const completa = await requisicao(`/anotacoes/${nota.id}`);
        notaEmEdicao = completa;
        categoriaDestinoEditor = completa.categoria_id ?? null;
        elementos.tituloInput.value = completa.titulo || "";
        carregarConteudoNoEditor(completa.conteudo || "");
        anexosEditor = Array.isArray(completa.anexos)
          ? completa.anexos.map((anexo) => ({ ...anexo }))
          : [];
        renderizarAnexosEditor();
        elementos.dataEditor.textContent = formatarDataEditor(completa.criado_em);
        elementos.btnSalvar.disabled = false;
        elementos.btnSalvar.textContent = "Salvar";
      } catch (erro) {
        tratarErro(erro, "Não foi possível abrir a anotação.");
        if (origemEditor === "categoria" && categoriaAtiva) {
          mostrarSomente("categoria");
        } else {
          mostrarSomente("inicio");
        }
        return;
      }
    }

    atualizarContadorEditor();
    snapshotEditor = snapshotAtual();
    elementos.tituloInput.focus();
  }

  function voltarDoEditor(forcar = false) {
    if (
      !forcar &&
      editorTemAlteracoes() &&
      !window.confirm("Descartar as alterações não salvas?")
    ) {
      return;
    }

    notaEmEdicao = null;
    if (origemEditor === "categoria" && categoriaAtiva) {
      mostrarSomente("categoria");
      carregarNotasCategoria();
    } else {
      mostrarSomente("inicio");
      alternarAba("gerais");
    }
  }

  async function salvarNota() {
    const titulo = elementos.tituloInput.value.trim();
    const conteudo = htmlEditor();
    const resumo = textoEditor().slice(0, 500);
    const temImagem = /<img\b/i.test(conteudo);

    if (!titulo && !resumo && !temImagem && !anexosEditor.length) {
      contexto.mostrarAviso(
        "aviso",
        "Escreva um título, conteúdo ou adicione um anexo antes de salvar.",
      );
      return;
    }
    if (conteudo.length > LIMITE_CONTEUDO) {
      contexto.mostrarAviso(
        "aviso",
        "A anotação ficou muito grande. Remova ou reduza algumas imagens.",
      );
      return;
    }

    elementos.btnSalvar.disabled = true;
    elementos.btnSalvar.textContent = "Salvando...";

    try {
      const endpoint = notaEmEdicao
        ? `/anotacoes/${notaEmEdicao.id}`
        : "/anotacoes";
      const method = notaEmEdicao ? "PUT" : "POST";

      await requisicao(endpoint, {
        method,
        body: JSON.stringify({
          titulo,
          conteudo,
          resumo,
          anexos: anexosEditor,
          categoria_id: categoriaDestinoEditor,
        }),
      });

      snapshotEditor = snapshotAtual();
      voltarDoEditor(true);
    } catch (erro) {
      tratarErro(erro, "Não foi possível salvar a anotação.");
    } finally {
      elementos.btnSalvar.disabled = false;
      elementos.btnSalvar.textContent = "Salvar";
    }
  }

  function confirmarExclusaoNota(nota) {
    contexto.mostrarConfirmacao(
      `Excluir definitivamente a anotação "${nota.titulo?.trim() || "Sem título"}"?`,
      async () => {
        try {
          await requisicao(`/anotacoes/${nota.id}`, { method: "DELETE" });

          if (notaEmEdicao?.id === nota.id) {
            snapshotEditor = snapshotAtual();
            voltarDoEditor(true);
          } else if (categoriaAtiva) {
            await carregarNotasCategoria();
          } else {
            await carregarNotasGerais();
          }
        } catch (erro) {
          tratarErro(erro, "Não foi possível excluir a anotação.");
        }
      },
    );
  }

  function marcarEmojiSelecionado(emoji) {
    const selecionado = emoji || "📁";
    elementos.opcoesEmoji
      .querySelectorAll("[data-emoji]")
      .forEach((botao) => {
        const ativo = botao.dataset.emoji === selecionado;
        botao.classList.toggle("ativo", ativo);
        botao.setAttribute("aria-pressed", String(ativo));
      });
  }

  function abrirModalCategoria(categoria = null) {
    categoriaEmEdicao = categoria ? { ...categoria } : null;
    elementos.tituloModalCategoria.textContent = categoria
      ? "Editar categoria"
      : "Nova categoria";
    elementos.salvarCategoria.textContent = categoria ? "Salvar" : "Criar";
    elementos.nomeCategoriaInput.value = categoria?.nome || "";
    elementos.emojiCategoriaInput.value = categoria?.emoji || "📁";
    marcarEmojiSelecionado(elementos.emojiCategoriaInput.value);
    elementos.modalCategoria.classList.remove("hidden");
    window.setTimeout(() => elementos.nomeCategoriaInput.focus(), 40);
  }

  function fecharModalCategoria() {
    elementos.modalCategoria.classList.add("hidden");
    categoriaEmEdicao = null;
  }

  async function salvarCategoria() {
    const nome = elementos.nomeCategoriaInput.value.trim();
    const emoji = elementos.emojiCategoriaInput.value.trim() || "📁";

    if (!nome) {
      contexto.mostrarAviso("aviso", "Informe o nome da categoria.");
      return;
    }

    elementos.salvarCategoria.disabled = true;

    try {
      const endpoint = categoriaEmEdicao
        ? `/anotacoes/categorias/${categoriaEmEdicao.id}`
        : "/anotacoes/categorias";
      const method = categoriaEmEdicao ? "PUT" : "POST";
      const categoriaSalva = await requisicao(endpoint, {
        method,
        body: JSON.stringify({ nome, emoji }),
      });

      if (categoriaAtiva?.id === categoriaSalva.id) {
        categoriaAtiva = { ...categoriaAtiva, ...categoriaSalva };
        elementos.categoriaNome.textContent = categoriaAtiva.nome;
        elementos.categoriaEmoji.textContent = categoriaAtiva.emoji;
      }

      fecharModalCategoria();
      await carregarCategorias();
    } catch (erro) {
      tratarErro(erro, "Não foi possível salvar a categoria.");
    } finally {
      elementos.salvarCategoria.disabled = false;
    }
  }

  function confirmarExclusaoCategoria(categoria) {
    const quantidade = Number(categoria.quantidade_anotacoes || 0);
    const complemento = quantidade
      ? ` e ${plural(quantidade, "anotação", "anotações")} dentro dela`
      : "";

    contexto.mostrarConfirmacao(
      `Excluir definitivamente a categoria "${categoria.nome}"${complemento}?`,
      async () => {
        try {
          await requisicao(`/anotacoes/categorias/${categoria.id}`, {
            method: "DELETE",
          });

          if (categoriaAtiva?.id === categoria.id) {
            categoriaAtiva = null;
            mostrarSomente("inicio");
          }
          await carregarCategorias();
        } catch (erro) {
          tratarErro(erro, "Não foi possível excluir a categoria.");
        }
      },
    );
  }

  function lerArquivoComoDataUrl(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result || ""));
      leitor.onerror = () => reject(new Error(`Não foi possível ler ${arquivo.name}.`));
      leitor.readAsDataURL(arquivo);
    });
  }

  function carregarImagem(dataUrl) {
    return new Promise((resolve, reject) => {
      const imagem = new Image();
      imagem.onload = () => resolve(imagem);
      imagem.onerror = () => reject(new Error("A imagem selecionada é inválida."));
      imagem.src = dataUrl;
    });
  }

  function tamanhoDataUrl(dataUrl) {
    const base64 = String(dataUrl).split(",")[1] || "";
    return Math.ceil((base64.length * 3) / 4);
  }

  async function comprimirImagem(arquivo) {
    const original = await lerArquivoComoDataUrl(arquivo);
    const imagem = await carregarImagem(original);
    const escala = Math.min(1, 1280 / Math.max(imagem.width, imagem.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imagem.width * escala));
    canvas.height = Math.max(1, Math.round(imagem.height * escala));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    let qualidade = 0.88;
    let resultado = canvas.toDataURL("image/webp", qualidade);
    while (tamanhoDataUrl(resultado) > LIMITE_IMAGEM_BYTES && qualidade > 0.5) {
      qualidade -= 0.08;
      resultado = canvas.toDataURL("image/webp", qualidade);
    }

    if (tamanhoDataUrl(resultado) > 1_200_000) {
      throw new Error("A imagem ficou muito grande mesmo após a redução.");
    }
    return resultado;
  }

  async function inserirImagemSelecionada() {
    const arquivo = elementos.inputImagem.files?.[0];
    elementos.inputImagem.value = "";
    if (!arquivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      contexto.mostrarAviso("aviso", "Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }

    try {
      const dataUrl = await comprimirImagem(arquivo);
      const selecao = editorQuill.getSelection(true);
      const indice = selecao?.index ?? editorQuill.getLength();
      editorQuill.insertEmbed(indice, "image", dataUrl, "user");
      editorQuill.setSelection(indice + 1, 0, "silent");
    } catch (erro) {
      tratarErro(erro, "Não foi possível inserir a imagem.");
    }
  }

  function tipoArquivo(arquivo) {
    if (arquivo.type) return arquivo.type.toLowerCase();
    const extensao = arquivo.name.split(".").pop()?.toLowerCase();
    const mapa = {
      pdf: "application/pdf",
      zip: "application/zip",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    return mapa[extensao] || "";
  }

  async function adicionarArquivosSelecionados() {
    const arquivos = Array.from(elementos.inputArquivo.files || []);
    elementos.inputArquivo.value = "";
    if (!arquivos.length) return;

    if (anexosEditor.length + arquivos.length > LIMITE_ANEXOS) {
      contexto.mostrarAviso(
        "aviso",
        `Cada anotação pode ter no máximo ${LIMITE_ANEXOS} anexos.`,
      );
      return;
    }

    let total = anexosEditor.reduce(
      (soma, anexo) => soma + Number(anexo.tamanho || 0),
      0,
    );

    try {
      for (const arquivo of arquivos) {
        const tipo = tipoArquivo(arquivo);
        if (
          EXTENSOES_BLOQUEADAS.test(arquivo.name) ||
          !TIPOS_ANEXO_PERMITIDOS.has(tipo)
        ) {
          throw new Error(`O arquivo "${arquivo.name}" não é permitido.`);
        }
        if (!arquivo.size || arquivo.size > LIMITE_ANEXO_BYTES) {
          throw new Error(`"${arquivo.name}" deve ter no máximo 1,5 MB.`);
        }

        total += arquivo.size;
        if (total > LIMITE_TOTAL_ANEXOS_BYTES) {
          throw new Error("Os anexos ultrapassam o limite total de 4 MB.");
        }

        anexosEditor.push({
          id: `anexo-${Date.now()}-${anexosEditor.length}`,
          nome: arquivo.name.slice(0, 180),
          tipo,
          tamanho: arquivo.size,
          dados: await lerArquivoComoDataUrl(arquivo),
        });
      }
      renderizarAnexosEditor();
    } catch (erro) {
      tratarErro(erro, "Não foi possível anexar o arquivo.");
    }
  }

  async function abrir() {
    categoriaAtiva = null;
    mostrarSomente("inicio");
    contexto.definirTelaMobileDashboard("anotacoes");

    if (!carregamentoInicialFeito) {
      carregamentoInicialFeito = true;
      alternarAba("gerais");
      return;
    }

    if (abaAtual === "gerais") await carregarNotasGerais();
    else await carregarCategorias();
  }

  elementos.tabGerais.addEventListener("click", () => alternarAba("gerais"));
  elementos.tabCategorias.addEventListener("click", () =>
    alternarAba("categorias"),
  );
  elementos.btnAdicionar.addEventListener("click", () => {
    if (abaAtual === "categorias") abrirModalCategoria();
    else abrirEditor(null, null);
  });
  elementos.btnAdicionarCategoria.addEventListener("click", () =>
    abrirEditor(null, categoriaAtiva?.id ?? null),
  );
  elementos.btnVoltarCategorias.addEventListener("click", () => {
    categoriaAtiva = null;
    mostrarSomente("inicio");
    alternarAba("categorias");
  });
  elementos.btnVoltarEditor.addEventListener("click", () => voltarDoEditor());
  elementos.btnSalvar.addEventListener("click", salvarNota);
  elementos.btnExcluirEditor.addEventListener("click", () => {
    if (notaEmEdicao) confirmarExclusaoNota(notaEmEdicao);
  });
  elementos.tituloInput.addEventListener("input", atualizarContadorEditor);
  elementos.inputImagem.addEventListener("change", inserirImagemSelecionada);
  elementos.inputArquivo.addEventListener("change", adicionarArquivosSelecionados);
  elementos.fecharModalCategoria.addEventListener("click", fecharModalCategoria);
  elementos.cancelarCategoria.addEventListener("click", fecharModalCategoria);
  elementos.salvarCategoria.addEventListener("click", salvarCategoria);
  elementos.modalCategoria.addEventListener("click", (evento) => {
    if (evento.target === elementos.modalCategoria) fecharModalCategoria();
  });
  elementos.nomeCategoriaInput.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") salvarCategoria();
  });
  elementos.opcoesEmoji.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-emoji]");
    if (!botao) return;
    elementos.emojiCategoriaInput.value = botao.dataset.emoji;
    marcarEmojiSelecionado(botao.dataset.emoji);
  });
  elementos.emojiCategoriaInput.addEventListener("input", () =>
    marcarEmojiSelecionado(elementos.emojiCategoriaInput.value.trim()),
  );

  window.addEventListener("beforeunload", (evento) => {
    if (!elementos.editor.hidden && editorTemAlteracoes()) {
      evento.preventDefault();
      evento.returnValue = "";
    }
  });

  window.MyNoteAnotacoes = { abrir };
})();
