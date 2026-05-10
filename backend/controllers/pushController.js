const db = require("../config/db");
const { enviarPush } = require("../services/pushService");

exports.salvarInscricao = (req, res) => {
  const usuario_id = req.usuario.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ msg: "Inscricao push invalida." });
  }

  db.query(
    `DELETE FROM push_subscriptions
     WHERE usuario_id = ? AND endpoint = ?`,
    [usuario_id, endpoint],
    (err) => {
      if (err) {
        console.error("Erro ao remover inscricao push antiga:", err);
        return res.status(500).json({
          msg: "Erro ao remover inscricao antiga.",
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
            console.error("Erro ao salvar inscricao push:", err2);
            return res.status(500).json({
              msg: "Erro ao salvar inscricao push.",
              erro: err2.sqlMessage || err2.message,
            });
          }

          res.json({ msg: "Inscricao push salva com sucesso." });
        },
      );
    },
  );
};

exports.testePush = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM push_subscriptions WHERE usuario_id = ?",
    [usuario_id],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (!results.length) {
        return res.status(404).json({ msg: "Nenhuma inscricao push encontrada." });
      }

      await Promise.all(
        results.map((inscricao) =>
          enviarPush(inscricao, "Agora!", "Teste de alarme do MyNote", {
            alarme: true,
            tipo: "teste",
            url: "/dashboard.html",
          }),
        ),
      );

      res.json({ msg: "Push de teste enviado." });
    },
  );
};
