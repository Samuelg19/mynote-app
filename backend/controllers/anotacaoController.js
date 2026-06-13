const db = require("../config/db");

let tabelasPromise = null;

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function garantirTabelasAnotacoes() {
  if (tabelasPromise) return tabelasPromise;

  tabelasPromise = (async () => {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS categorias_anotacoes (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        nome VARCHAR(80) NOT NULL,
        emoji VARCHAR(32) NOT NULL DEFAULT '📁',
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_categoria_anotacao_usuario_nome (usuario_id, nome),
        KEY idx_categoria_anotacao_usuario (usuario_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryAsync(`
      CREATE TABLE IF NOT EXISTS anotacoes (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        categoria_id INT NULL,
        titulo VARCHAR(160) NOT NULL DEFAULT '',
        conteudo LONGTEXT NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_anotacao_usuario_criacao (usuario_id, criado_em),
        KEY idx_anotacao_categoria (categoria_id),
        CONSTRAINT fk_anotacoes_categoria
          FOREIGN KEY (categoria_id)
          REFERENCES categorias_anotacoes (id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  })().catch((err) => {
    tabelasPromise = null;
    throw err;
  });

  return tabelasPromise;
}

garantirTabelasAnotacoes().catch((err) => {
  console.warn("Nao foi possivel preparar as tabelas de anotacoes:", err.message);
});

function responderErro(res, err, mensagem) {
  console.error(mensagem, err);
  return res.status(500).json({
    msg: mensagem,
    detalhe: err?.sqlMessage || err?.message || "Erro interno do banco.",
  });
}

function textoLimitado(valor, limite) {
  return String(valor ?? "").trim().slice(0, limite);
}

function conteudoLimitado(valor) {
  return String(valor ?? "").slice(0, 100000);
}

function emojiValido(valor) {
  const emoji = String(valor ?? "").trim();
  return emoji ? emoji.slice(0, 32) : "📁";
}

async function buscarCategoriaDoUsuario(categoriaId, usuarioId) {
  if (categoriaId === null || categoriaId === undefined || categoriaId === "") {
    return null;
  }

  const id = Number(categoriaId);
  if (!Number.isInteger(id) || id <= 0) return false;

  const categorias = await queryAsync(
    "SELECT id FROM categorias_anotacoes WHERE id = ? AND usuario_id = ?",
    [id, usuarioId],
  );

  return categorias[0] || false;
}

function normalizarNota(nota) {
  return {
    ...nota,
    id: Number(nota.id),
    usuario_id: Number(nota.usuario_id),
    categoria_id:
      nota.categoria_id === null ? null : Number(nota.categoria_id),
  };
}

exports.garantirTabelasAnotacoes = garantirTabelasAnotacoes;

exports.listar = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const usuarioId = req.usuario.id;
    const categoria = String(req.query.categoria ?? "").trim();
    const params = [usuarioId];
    let filtro = "";

    if (categoria === "gerais") {
      filtro = " AND n.categoria_id IS NULL";
    } else if (req.query.categoria_id !== undefined) {
      const categoriaId = Number(req.query.categoria_id);
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({ msg: "Categoria invalida." });
      }
      filtro = " AND n.categoria_id = ?";
      params.push(categoriaId);
    }

    const notas = await queryAsync(
      `SELECT
        n.id,
        n.usuario_id,
        n.categoria_id,
        n.titulo,
        n.conteudo,
        n.criado_em,
        n.atualizado_em,
        c.nome AS categoria_nome,
        c.emoji AS categoria_emoji
      FROM anotacoes n
      LEFT JOIN categorias_anotacoes c
        ON c.id = n.categoria_id
        AND c.usuario_id = n.usuario_id
      WHERE n.usuario_id = ?${filtro}
      ORDER BY n.criado_em DESC, n.id DESC`,
      params,
    );

    res.json(notas.map(normalizarNota));
  } catch (err) {
    responderErro(res, err, "Nao foi possivel listar as anotacoes.");
  }
};

exports.buscar = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const notas = await queryAsync(
      `SELECT
        n.*,
        c.nome AS categoria_nome,
        c.emoji AS categoria_emoji
      FROM anotacoes n
      LEFT JOIN categorias_anotacoes c
        ON c.id = n.categoria_id
        AND c.usuario_id = n.usuario_id
      WHERE n.id = ? AND n.usuario_id = ?`,
      [req.params.id, req.usuario.id],
    );

    if (!notas.length) {
      return res.status(404).json({ msg: "Anotacao nao encontrada." });
    }

    res.json(normalizarNota(notas[0]));
  } catch (err) {
    responderErro(res, err, "Nao foi possivel carregar a anotacao.");
  }
};

exports.criar = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const usuarioId = req.usuario.id;
    const titulo = textoLimitado(req.body?.titulo, 160);
    const conteudo = conteudoLimitado(req.body?.conteudo);
    const categoria = await buscarCategoriaDoUsuario(
      req.body?.categoria_id,
      usuarioId,
    );

    if (!titulo && !conteudo.trim()) {
      return res
        .status(400)
        .json({ msg: "Escreva um titulo ou algum conteudo antes de salvar." });
    }

    if (categoria === false) {
      return res.status(404).json({ msg: "Categoria nao encontrada." });
    }

    const result = await queryAsync(
      `INSERT INTO anotacoes
        (usuario_id, categoria_id, titulo, conteudo)
      VALUES (?, ?, ?, ?)`,
      [usuarioId, categoria?.id || null, titulo, conteudo],
    );

    const notas = await queryAsync(
      "SELECT * FROM anotacoes WHERE id = ? AND usuario_id = ?",
      [result.insertId, usuarioId],
    );

    res.status(201).json(normalizarNota(notas[0]));
  } catch (err) {
    responderErro(res, err, "Nao foi possivel criar a anotacao.");
  }
};

exports.atualizar = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const usuarioId = req.usuario.id;
    const atuais = await queryAsync(
      "SELECT * FROM anotacoes WHERE id = ? AND usuario_id = ?",
      [req.params.id, usuarioId],
    );

    if (!atuais.length) {
      return res.status(404).json({ msg: "Anotacao nao encontrada." });
    }

    const atual = atuais[0];
    const titulo =
      req.body?.titulo === undefined
        ? atual.titulo
        : textoLimitado(req.body.titulo, 160);
    const conteudo =
      req.body?.conteudo === undefined
        ? atual.conteudo
        : conteudoLimitado(req.body.conteudo);
    let categoriaId = atual.categoria_id;

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "categoria_id")) {
      const categoria = await buscarCategoriaDoUsuario(
        req.body.categoria_id,
        usuarioId,
      );

      if (categoria === false) {
        return res.status(404).json({ msg: "Categoria nao encontrada." });
      }

      categoriaId = categoria?.id || null;
    }

    if (!titulo && !conteudo.trim()) {
      return res
        .status(400)
        .json({ msg: "Uma anotacao nao pode ficar totalmente vazia." });
    }

    await queryAsync(
      `UPDATE anotacoes
      SET titulo = ?, conteudo = ?, categoria_id = ?
      WHERE id = ? AND usuario_id = ?`,
      [titulo, conteudo, categoriaId, req.params.id, usuarioId],
    );

    const notas = await queryAsync(
      "SELECT * FROM anotacoes WHERE id = ? AND usuario_id = ?",
      [req.params.id, usuarioId],
    );

    res.json(normalizarNota(notas[0]));
  } catch (err) {
    responderErro(res, err, "Nao foi possivel atualizar a anotacao.");
  }
};

exports.excluir = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const result = await queryAsync(
      "DELETE FROM anotacoes WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuario.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ msg: "Anotacao nao encontrada." });
    }

    res.json({ msg: "Anotacao excluida com sucesso." });
  } catch (err) {
    responderErro(res, err, "Nao foi possivel excluir a anotacao.");
  }
};

exports.listarCategorias = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const categorias = await queryAsync(
      `SELECT
        c.id,
        c.usuario_id,
        c.nome,
        c.emoji,
        c.criado_em,
        c.atualizado_em,
        COUNT(n.id) AS quantidade_anotacoes
      FROM categorias_anotacoes c
      LEFT JOIN anotacoes n
        ON n.categoria_id = c.id
        AND n.usuario_id = c.usuario_id
      WHERE c.usuario_id = ?
      GROUP BY c.id
      ORDER BY c.criado_em DESC, c.id DESC`,
      [req.usuario.id],
    );

    res.json(
      categorias.map((categoria) => ({
        ...categoria,
        id: Number(categoria.id),
        usuario_id: Number(categoria.usuario_id),
        quantidade_anotacoes: Number(categoria.quantidade_anotacoes || 0),
      })),
    );
  } catch (err) {
    responderErro(res, err, "Nao foi possivel listar as categorias.");
  }
};

exports.criarCategoria = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const nome = textoLimitado(req.body?.nome, 80);
    const emoji = emojiValido(req.body?.emoji);

    if (!nome) {
      return res.status(400).json({ msg: "Informe o nome da categoria." });
    }

    const result = await queryAsync(
      `INSERT INTO categorias_anotacoes (usuario_id, nome, emoji)
      VALUES (?, ?, ?)`,
      [req.usuario.id, nome, emoji],
    );

    res.status(201).json({
      id: Number(result.insertId),
      nome,
      emoji,
      quantidade_anotacoes: 0,
    });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ msg: "Voce ja possui uma categoria com esse nome." });
    }
    responderErro(res, err, "Nao foi possivel criar a categoria.");
  }
};

exports.atualizarCategoria = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const categorias = await queryAsync(
      "SELECT * FROM categorias_anotacoes WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuario.id],
    );

    if (!categorias.length) {
      return res.status(404).json({ msg: "Categoria nao encontrada." });
    }

    const atual = categorias[0];
    const nome =
      req.body?.nome === undefined
        ? atual.nome
        : textoLimitado(req.body.nome, 80);
    const emoji =
      req.body?.emoji === undefined ? atual.emoji : emojiValido(req.body.emoji);

    if (!nome) {
      return res.status(400).json({ msg: "Informe o nome da categoria." });
    }

    await queryAsync(
      `UPDATE categorias_anotacoes
      SET nome = ?, emoji = ?
      WHERE id = ? AND usuario_id = ?`,
      [nome, emoji, req.params.id, req.usuario.id],
    );

    res.json({ id: Number(req.params.id), nome, emoji });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ msg: "Voce ja possui uma categoria com esse nome." });
    }
    responderErro(res, err, "Nao foi possivel atualizar a categoria.");
  }
};

exports.excluirCategoria = async (req, res) => {
  try {
    await garantirTabelasAnotacoes();

    const result = await queryAsync(
      "DELETE FROM categorias_anotacoes WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuario.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ msg: "Categoria nao encontrada." });
    }

    res.json({
      msg: "Categoria e suas anotacoes foram excluidas com sucesso.",
    });
  } catch (err) {
    responderErro(res, err, "Nao foi possivel excluir a categoria.");
  }
};
