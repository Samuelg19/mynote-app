const db = require("../config/db");

const camposPermitidosLembrete = [
  "titulo",
  "horario",
  "dia_mes",
  "prioridade",
  "status",
  "notificacao",
  "oculto",
  "concluido",
];

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function erroBancoLembrete(err, res, acao) {
  console.error(`Erro ao ${acao} lembrete:`, err);
  return res.status(500).json({
    msg: `Nao foi possivel ${acao} o lembrete.`,
    detalhe: err?.sqlMessage || err?.message || "Erro interno do banco.",
  });
}

function normalizarValorOpcional(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto || null;
}

function obterCampoInexistente(err) {
  const mensagem = err?.sqlMessage || err?.message || "";
  const encontrado = mensagem.match(/Unknown column '([^']+)'/i);
  return encontrado?.[1] || "";
}

function removerCampoInexistente(dados, err) {
  const campo = obterCampoInexistente(err);
  if (!campo || !Object.prototype.hasOwnProperty.call(dados, campo)) return false;
  delete dados[campo];
  return true;
}

function normalizarLembreteSaida(lembrete) {
  const status =
    lembrete.status || (lembrete.concluido ? "Concluído" : "Pendente");

  return {
    ...lembrete,
    status,
    oculto: Boolean(lembrete.oculto),
  };
}

function limparDadosLembrete(dados, usuarioId) {
  const lembrete = Object.fromEntries(
    Object.entries(dados || {}).filter(([campo]) =>
      camposPermitidosLembrete.includes(campo),
    ),
  );

  if (Object.prototype.hasOwnProperty.call(lembrete, "horario")) {
    lembrete.horario = normalizarValorOpcional(lembrete.horario);
  }

  if (Object.prototype.hasOwnProperty.call(lembrete, "dia_mes")) {
    lembrete.dia_mes = normalizarValorOpcional(lembrete.dia_mes);
  }

  if (Object.prototype.hasOwnProperty.call(lembrete, "status")) {
    lembrete.concluido = String(lembrete.status)
      .toLowerCase()
      .includes("conclu")
      ? 1
      : 0;
  }

  if (Object.prototype.hasOwnProperty.call(lembrete, "notificacao")) {
    lembrete.notificacao = lembrete.notificacao ? 1 : 0;
  }

  if (Object.prototype.hasOwnProperty.call(lembrete, "oculto")) {
    lembrete.oculto = lembrete.oculto ? 1 : 0;
  }

  if (usuarioId) {
    lembrete.usuario_id = usuarioId;
  }

  return lembrete;
}

function inserirLembreteComFallback(lembrete, callback) {
  const dados = { ...lembrete };

  function tentarInserir() {
    db.query("INSERT INTO lembretes SET ?", dados, (err) => {
      if (err && removerCampoInexistente(dados, err)) {
        tentarInserir();
        return;
      }

      callback(err);
    });
  }

  tentarInserir();
}

async function listarLembretesUsuario(usuarioId) {
  const tentativas = [
    {
      sql: "SELECT * FROM lembretes WHERE usuario_id = ? AND (oculto = false OR oculto IS NULL) ORDER BY horario ASC",
      params: [usuarioId],
    },
    {
      sql: "SELECT * FROM lembretes WHERE usuario_id = ? ORDER BY horario ASC",
      params: [usuarioId],
    },
    {
      sql: "SELECT * FROM lembretes WHERE usuario_id = ? ORDER BY id ASC",
      params: [usuarioId],
    },
  ];

  let ultimoErro;

  for (const tentativa of tentativas) {
    try {
      const resultados = await queryAsync(tentativa.sql, tentativa.params);
      return resultados.map(normalizarLembreteSaida);
    } catch (err) {
      ultimoErro = err;
    }
  }

  throw ultimoErro;
}

function atualizarLembreteComFallback(id, usuarioId, dados, callback) {
  const campos = { ...dados };

  function tentarAtualizar() {
    db.query(
      "UPDATE lembretes SET ? WHERE id = ? AND usuario_id = ?",
      [campos, id, usuarioId],
      (err) => {
        if (err && removerCampoInexistente(campos, err)) {
          if (!Object.keys(campos).length) return callback(null);
          tentarAtualizar();
          return;
        }

        callback(err);
      },
    );
  }

  tentarAtualizar();
}

exports.criar = (req, res) => {
  const lembrete = limparDadosLembrete(req.body, req.usuario.id);

  inserirLembreteComFallback(lembrete, (err) => {
    if (err) return erroBancoLembrete(err, res, "criar");
    res.json({ msg: "Lembrete criado com sucesso" });
  });
};

exports.listar = async (req, res) => {
  try {
    const lembretes = await listarLembretesUsuario(req.usuario.id);
    res.json(lembretes);
  } catch (err) {
    return erroBancoLembrete(err, res, "listar");
  }
};

exports.concluir = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  atualizarLembreteComFallback(
    id,
    usuario_id,
    { status: "Concluído", concluido: 1 },
    (err) => {
      if (err) return erroBancoLembrete(err, res, "concluir");
      res.json({ msg: "Lembrete concluído com sucesso" });
    },
  );
};

exports.excluir = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  db.query(
    "DELETE FROM lembretes WHERE id = ? AND usuario_id = ?",
    [id, usuario_id],
    (err) => {
      if (err) return erroBancoLembrete(err, res, "excluir");
      res.json({ msg: "Lembrete excluído com sucesso" });
    },
  );
};

exports.atualizarLembrete = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  const dados = limparDadosLembrete(req.body);

  if (!Object.keys(dados).length) {
    return res.status(400).json({ msg: "Nenhum campo valido para atualizar." });
  }

  atualizarLembreteComFallback(id, usuario_id, dados, (err) => {
    if (err) return erroBancoLembrete(err, res, "atualizar");
    res.json({ msg: "Lembrete atualizado com sucesso" });
  });
};
