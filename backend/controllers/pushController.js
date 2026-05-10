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
      if (err) return res.status(500).json(err);

      db.query(
        `INSERT INTO push_subscriptions 
         (usuario_id, endpoint, p256dh, auth) 
         VALUES (?, ?, ?, ?)`,
        [usuario_id, endpoint, keys.p256dh, keys.auth],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ msg: "Inscrição push salva com sucesso." });
        },
      );
    },
  );
};