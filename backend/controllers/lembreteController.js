const db = require("../config/db");

const camposPermitidosLembrete = [
  "titulo",
  "horario",
  "dia_mes",
  "prioridade",
  "status",
  "notificacao",
  "oculto",
];

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

function inserirLembreteComFallback(lembrete, callback) {
  const dados = { ...lembrete };

  function tentarInserir() {
    db.query("INSERT INTO lembretes SET ?", dados, (err) => {
      const campoInexistente = obterCampoInexistente(err);

      if (campoInexistente && Object.prototype.hasOwnProperty.call(dados, campoInexistente)) {
        delete dados[campoInexistente];
        tentarInserir();
        return;
      }

      callback(err);
    });
  }

  tentarInserir();
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

exports.criar = (req, res) => {
  const lembrete = limparDadosLembrete(req.body, req.usuario.id);

  inserirLembreteComFallback(lembrete, (err) => {
    if (err) return erroBancoLembrete(err, res, "criar");
    res.json({ msg: "Lembrete criado com sucesso" });
  });
};

exports.listar = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM lembretes WHERE usuario_id = ? AND oculto = false ORDER BY horario ASC",
    [usuario_id],
    (err, results) => {
      if (err) return erroBancoLembrete(err, res, "listar");
      res.json(results);
    }
  );
};

exports.concluir = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM lembretes WHERE id = ? AND usuario_id = ?",
    [id, usuario_id],
    (err, results) => {
      if (err) return erroBancoLembrete(err, res, "processar");

      if (results.length === 0) {
        return res.status(404).json({ msg: "Lembrete não encontrado" });
      }

      const lembrete = results[0];
      const repeticaoNormalizada = (lembrete.repeticao || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (repeticaoNormalizada === "unico") {
        db.query(
          "UPDATE lembretes SET status = ?, oculto = true WHERE id = ? AND usuario_id = ?",
          ["Concluído", id, usuario_id],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ msg: "Lembrete único concluído e ocultado" });
          }
        );
      } else {
        db.query(
          "UPDATE lembretes SET status = ? WHERE id = ? AND usuario_id = ?",
          ["Concluído", id, usuario_id],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ msg: "Lembrete recorrente concluído" });
          }
        );
      }
    }
  );
};

exports.excluir = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  db.query(
    "DELETE FROM lembretes WHERE id = ? AND usuario_id = ?",
    [id, usuario_id],
    (err) => {
      if (err) return erroBancoLembrete(err, res, "processar");
      res.json({ msg: "Lembrete excluído com sucesso" });
    }
  );
};

exports.atualizarLembrete = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  const dados = limparDadosLembrete(req.body);

  if (!Object.keys(dados).length) {
    return res.status(400).json({ msg: "Nenhum campo valido para atualizar." });
  }

  db.query(
    "UPDATE lembretes SET ? WHERE id = ? AND usuario_id = ?",
    [dados, id, usuario_id],
    (err) => {
      if (err) return erroBancoLembrete(err, res, "atualizar");
      res.json({ msg: "Lembrete atualizado com sucesso" });
    }
  );
};
