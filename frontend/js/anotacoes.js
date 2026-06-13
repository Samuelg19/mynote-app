(function iniciarModuloAnotacoes() {
  const contexto = window.MyNoteDashboardContext;
  const secao = document.getElementById("secaoAnotacoes");

  if (!contexto || !secao) return;

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
    conteudoInput: document.getElementById("conteudoAnotacaoInput"),
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
  };

  let abaAtual = "gerais";
  let categoriaAtiva = null;
  let categoriaEmEdicao = null;
  let notaEmEdicao = null;
  let categoriaDestinoEditor = null;
  let origemEditor = "gerais";
  let snapshotEditor = "";
  let carregamentoInicialFeito = false;

  function plural(quantidade, singular, pluralTexto) {
    return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
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

    const opcoes = {
      day: "2-digit",
      month: "short",
      ...(data.getFullYear() === agora.getFullYear()
        ? {}
        : { year: "numeric" }),
    };

    return new Intl.DateTimeFormat("pt-BR", opcoes)
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
      nota.conteudo?.replace(/\s+/g, " ").trim() || "Anotação sem conteúdo.";

    const data = document.createElement("time");
    data.className = "anotacao-card-data";
    data.dateTime = nota.criado_em || "";
    data.textContent = formatarDataRelativa(nota.criado_em);

    abrir.append(titulo, preview, data);

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
      mostrarVazio(
        container,
        contextoVazio.titulo,
        contextoVazio.descricao,
      );
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
    elementos.tabCategorias.setAttribute(
      "aria-selected",
      String(!geraisAtiva),
    );
    elementos.painelGerais.hidden = !geraisAtiva;
    elementos.painelCategorias.hidden = geraisAtiva;
    elementos.btnAdicionar.setAttribute(
      "aria-label",
      geraisAtiva ? "Criar anotação" : "Criar categoria",
    );
    elementos.btnAdicionar.title = geraisAtiva
      ? "Criar anotação"
      : "Criar categoria";

    if (geraisAtiva) {
      carregarNotasGerais();
    } else {
      carregarCategorias();
    }
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

  function snapshotAtual() {
    return JSON.stringify({
      titulo: elementos.tituloInput.value,
      conteudo: elementos.conteudoInput.value,
      categoria_id: categoriaDestinoEditor,
    });
  }

  function editorTemAlteracoes() {
    return snapshotAtual() !== snapshotEditor;
  }

  function atualizarContadorEditor() {
    const quantidade = elementos.conteudoInput.value.length;
    elementos.contadorEditor.textContent = plural(
      quantidade,
      "caractere",
      "caracteres",
    );
  }

  function abrirEditor(nota = null, categoriaId = undefined) {
    notaEmEdicao = nota ? { ...nota } : null;
    origemEditor = categoriaAtiva ? "categoria" : "gerais";
    categoriaDestinoEditor =
      categoriaId !== undefined
        ? categoriaId
        : nota?.categoria_id ?? categoriaAtiva?.id ?? null;

    elementos.tituloInput.value = nota?.titulo || "";
    elementos.conteudoInput.value = nota?.conteudo || "";
    elementos.dataEditor.textContent = formatarDataEditor(nota?.criado_em);
    elementos.btnExcluirEditor.hidden = !nota;
    elementos.btnSalvar.disabled = false;
    elementos.btnSalvar.textContent = "Salvar";
    atualizarContadorEditor();
    snapshotEditor = snapshotAtual();
    mostrarSomente("editor");
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
    const conteudo = elementos.conteudoInput.value;

    if (!titulo && !conteudo.trim()) {
      contexto.mostrarAviso(
        "aviso",
        "Escreva um título ou algum conteúdo antes de salvar.",
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

  function abrirModalCategoria(categoria = null) {
    categoriaEmEdicao = categoria ? { ...categoria } : null;
    elementos.tituloModalCategoria.textContent = categoria
      ? "Editar categoria"
      : "Nova categoria";
    elementos.salvarCategoria.textContent = categoria ? "Salvar" : "Criar";
    elementos.nomeCategoriaInput.value = categoria?.nome || "";
    elementos.emojiCategoriaInput.value = categoria?.emoji || "📁";
    elementos.modalCategoria.classList.remove("hidden");
    elementos.nomeCategoriaInput.focus();
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

  async function abrir() {
    categoriaAtiva = null;
    mostrarSomente("inicio");
    contexto.definirTelaMobileDashboard("anotacoes");

    if (!carregamentoInicialFeito) {
      carregamentoInicialFeito = true;
      alternarAba("gerais");
      return;
    }

    if (abaAtual === "gerais") {
      await carregarNotasGerais();
    } else {
      await carregarCategorias();
    }
  }

  elementos.tabGerais.addEventListener("click", () => alternarAba("gerais"));
  elementos.tabCategorias.addEventListener("click", () =>
    alternarAba("categorias"),
  );
  elementos.btnAdicionar.addEventListener("click", () => {
    if (abaAtual === "categorias") {
      abrirModalCategoria();
    } else {
      abrirEditor(null, null);
    }
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
  elementos.conteudoInput.addEventListener("input", atualizarContadorEditor);
  elementos.fecharModalCategoria.addEventListener(
    "click",
    fecharModalCategoria,
  );
  elementos.cancelarCategoria.addEventListener("click", fecharModalCategoria);
  elementos.salvarCategoria.addEventListener("click", salvarCategoria);
  elementos.modalCategoria.addEventListener("click", (evento) => {
    if (evento.target === elementos.modalCategoria) fecharModalCategoria();
  });
  elementos.nomeCategoriaInput.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") salvarCategoria();
  });

  window.addEventListener("beforeunload", (evento) => {
    if (!elementos.editor.hidden && editorTemAlteracoes()) {
      evento.preventDefault();
      evento.returnValue = "";
    }
  });

  window.MyNoteAnotacoes = { abrir };
})();
