const db = require("../config/db");

// Todas as rotinas são filtradas pelo usuário autenticado.
exports.criar = (req, res) => {
  const { nome, tipo_modelo, campos_config } = req.body;
  const usuario_id = req.usuario.id;

  db.query(
    `INSERT INTO rotinas 
     (usuario_id, nome, tipo_modelo, campos_config) 
     VALUES (?, ?, ?, ?)`,
    [
      usuario_id,
      nome,
      tipo_modelo || "tabela",
      JSON.stringify(campos_config || []),
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
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
      if (err) return res.status(500).json(err);
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
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ msg: "Rotina não encontrada" });
      }

      res.json(results[0]);
    },
  );
};

exports.excluir = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM rotinas WHERE id = ? AND usuario_id = ?",
    [id, req.usuario.id],
    (err) => {
      if (err) return res.status(500).json(err);
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
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE rotinas SET ordem = ? WHERE id = ? AND usuario_id = ?",
        [index, rotina.id, req.usuario.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  });

  Promise.all(queries)
    .then(() => res.json({ msg: "Ordem atualizada com sucesso" }))
    .catch((err) => res.status(500).json(err));
};

exports.listar = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM rotinas WHERE usuario_id = ? ORDER BY ordem ASC, criado_em ASC",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    },
  );
};
