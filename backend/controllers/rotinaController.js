const db = require("../config/db");

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function erroBancoRotina(err, res, acao) {
  console.error(`Erro ao ${acao} rotina:`, err);
  return res.status(500).json({
    msg: `Nao foi possivel ${acao} a rotina.`,
    detalhe: err?.sqlMessage || err?.message || "Erro interno do banco.",
  });
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

function normalizarRotinaSaida(rotina) {
  return {
    ...rotina,
    campos_config: rotina.campos_config || "[]",
    tipo_modelo: rotina.tipo_modelo || "tabela",
    notas: rotina.notas || "",
  };
}

function inserirRotinaComFallback(dados, callback) {
  const rotina = { ...dados };

  function tentarInserir() {
    db.query("INSERT INTO rotinas SET ?", rotina, (err, result) => {
      if (err && removerCampoInexistente(rotina, err)) {
        tentarInserir();
        return;
      }

      callback(err, result);
    });
  }

  tentarInserir();
}

async function listarRotinasUsuario(usuarioId) {
  const tentativas = [
    {
      sql: "SELECT * FROM rotinas WHERE usuario_id = ? ORDER BY ordem ASC, criado_em ASC",
      params: [usuarioId],
    },
    {
      sql: "SELECT * FROM rotinas WHERE usuario_id = ? ORDER BY ordem ASC, id ASC",
      params: [usuarioId],
    },
    {
      sql: "SELECT * FROM rotinas WHERE usuario_id = ? ORDER BY id ASC",
      params: [usuarioId],
    },
  ];

  let ultimoErro;

  for (const tentativa of tentativas) {
    try {
      const resultados = await queryAsync(tentativa.sql, tentativa.params);
      return resultados.map(normalizarRotinaSaida);
    } catch (err) {
      ultimoErro = err;
    }
  }

  throw ultimoErro;
}

exports.criar = (req, res) => {
  const { nome, tipo_modelo, campos_config } = req.body;
  const usuario_id = req.usuario.id;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ msg: "Informe o nome da rotina." });
  }

  inserirRotinaComFallback(
    {
      usuario_id,
      nome: String(nome).trim(),
      tipo_modelo: tipo_modelo || "tabela",
      campos_config: JSON.stringify(campos_config || []),
    },
    (err, result) => {
      if (err) return erroBancoRotina(err, res, "criar");
      res.json({ msg: "Rotina criada com sucesso!", id: result.insertId });
    },
  );
};

exports.atualizarNotas = (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;

  db.query(
    "UPDATE rotinas SET notas = ? WHERE id = ? AND usuario_id = ?",
    [notas, id, req.usuario.id],
    (err) => {
      if (err) return erroBancoRotina(err, res, "atualizar");
      res.json({ msg: "Notas atualizadas com sucesso" });
    },
  );
};

exports.buscarPorId = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM rotinas WHERE id = ? AND usuario_id = ?",
    [id, req.usuario.id],
    (err, results) => {
      if (err) return erroBancoRotina(err, res, "buscar");

      if (results.length === 0) {
        return res.status(404).json({ msg: "Rotina não encontrada" });
      }

      res.json(normalizarRotinaSaida(results[0]));
    },
  );
};

exports.excluir = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM rotinas WHERE id = ? AND usuario_id = ?",
    [id, req.usuario.id],
    (err) => {
      if (err) return erroBancoRotina(err, res, "excluir");
      res.json({ msg: "Rotina excluída com sucesso" });
    },
  );
};

exports.atualizarOrdem = (req, res) => {
  const { rotinas } = req.body;

  if (!Array.isArray(rotinas)) {
    return res.status(400).json({ msg: "Lista de rotinas inválida" });
  }

  const queries = rotinas.map((rotina, index) => {
    return new Promise((resolve) => {
      db.query(
        "UPDATE rotinas SET ordem = ? WHERE id = ? AND usuario_id = ?",
        [index, rotina.id, req.usuario.id],
        () => resolve(),
      );
    });
  });

  Promise.all(queries)
    .then(() => res.json({ msg: "Ordem atualizada com sucesso" }))
    .catch((err) => erroBancoRotina(err, res, "ordenar"));
};

exports.listar = async (req, res) => {
  try {
    const rotinas = await listarRotinasUsuario(req.usuario.id);
    res.json(rotinas);
  } catch (err) {
    return erroBancoRotina(err, res, "listar");
  }
};
