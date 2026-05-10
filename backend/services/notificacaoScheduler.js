const cron = require("node-cron");

const db = require("../config/db");
const { enviarPush } = require("./pushService");

function iniciarSchedulerNotificacoes() {
  cron.schedule("* * * * *", async () => {
    try {
      const agora = new Date();

      const horaAtual = agora.toTimeString().slice(0, 5);

      db.query(
        `
        SELECT * FROM lembretes
        WHERE horario = ?
        AND status != 'Concluído'
        AND oculto = false
        `,
        [horaAtual],
        async (err, lembretes) => {
          if (err) {
            console.error("Erro scheduler lembretes:", err);
            return;
          }

          for (const lembrete of lembretes) {
            const chaveEnvio = `lembrete-${lembrete.id}-${horaAtual}`;

            db.query(
              `
              SELECT id FROM notificacoes_enviadas
              WHERE usuario_id = ?
              AND tipo = 'lembrete'
              AND referencia_id = ?
              AND chave_envio = ?
              `,
              [
                lembrete.usuario_id,
                lembrete.id,
                chaveEnvio,
              ],
              async (err2, jaExiste) => {
                if (err2) {
                  console.error(err2);
                  return;
                }

                if (jaExiste.length) return;

                db.query(
                  `
                  SELECT * FROM push_subscriptions
                  WHERE usuario_id = ?
                  `,
                  [lembrete.usuario_id],
                  async (err3, subscriptions) => {
                    if (err3) {
                      console.error(err3);
                      return;
                    }

                    for (const sub of subscriptions) {
                      await enviarPush(
                        sub,
                        "Lembrete",
                        lembrete.titulo,
                      );
                    }

                    db.query(
                      `
                      INSERT INTO notificacoes_enviadas
                      (
                        usuario_id,
                        tipo,
                        referencia_id,
                        chave_envio
                      )
                      VALUES (?, ?, ?, ?)
                      `,
                      [
                        lembrete.usuario_id,
                        "lembrete",
                        lembrete.id,
                        chaveEnvio,
                      ],
                    );
                  },
                );
              },
            );
          }
        },
      );
    } catch (erro) {
      console.error("Erro geral scheduler:", erro);
    }
  });
}

module.exports = {
  iniciarSchedulerNotificacoes,
};