const db = require("../config/db");

exports.criar = (req, res) => {
  const lembrete = {
    ...req.body,
    usuario_id: req.usuario.id
  };

  db.query("INSERT INTO lembretes SET ?", lembrete, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Lembrete criado com sucesso" });
  });
};

exports.listar = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM lembretes WHERE usuario_id = ? AND oculto = false ORDER BY horario ASC",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
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
      if (err) return res.status(500).json(err);

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
      if (err) return res.status(500).json(err);
      res.json({ msg: "Lembrete excluído com sucesso" });
    }
  );
};

exports.atualizarLembrete = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  const dados = req.body;

  delete dados.usuario_id;

  db.query(
    "UPDATE lembretes SET ? WHERE id = ? AND usuario_id = ?",
    [dados, id, usuario_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Lembrete atualizado com sucesso" });
    }
  );
};