const db = require("../config/db");

exports.salvarInscricao = (req, res) => {
  const usuario_id = req.usuario.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ msg: "Inscrição push inválida." });
  }

  db.query(
    `DELETE FROM push_subscriptions 
     WHERE usuario_id = ? AND endpoint = ?`,
    [usuario_id, endpoint],
    (err) => {
      if (err) {
        console.error("Erro ao remover inscrição push antiga:", err);
        return res.status(500).json({
          msg: "Erro ao remover inscrição antiga.",
          erro: err.sqlMessage || err.message,
        });
      }

      db.query(
        `INSERT INTO push_subscriptions 
         (usuario_id, endpoint, p256dh, auth) 
         VALUES (?, ?, ?, ?)`,
        [usuario_id, endpoint, keys.p256dh, keys.auth],
        (err2) => {
          if (err2) {
            console.error("Erro ao salvar inscrição push:", err2);
            return res.status(500).json({
              msg: "Erro ao salvar inscrição push.",
              erro: err2.sqlMessage || err2.message,
            });
          }

          res.json({ msg: "Inscrição push salva com sucesso." });
        },
      );
    },
  );
};

const { enviarPush } = require("../services/pushService");

exports.testePush = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM push_subscriptions WHERE usuario_id = ? LIMIT 1",
    [usuario_id],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (!results.length) {
        return res.status(404).json({ msg: "Nenhuma inscrição push encontrada." });
      }

      await enviarPush(
        results[0],
        "MyNote",
        "Notificação push funcionando 🚀"
      );

      res.json({ msg: "Push de teste enviado." });
    }
  );
};