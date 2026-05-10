const cron = require("node-cron");

const db = require("../config/db");
const { enviarPush } = require("./pushService");

function partesAgoraBrasil() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const obter = (tipo) => partes.find((parte) => parte.type === tipo)?.value;

  return {
    hora: `${obter("hour")}:${obter("minute")}`,
    diaMes: `${obter("day")}/${obter("month")}`,
  };
}

function lembreteValeParaHoje(lembrete, diaMesHoje) {
  const diaMes = String(lembrete.dia_mes || "").trim().toLowerCase();

  if (!diaMes) return true;
  if (diaMes.includes("todo")) return true;
  return diaMes === diaMesHoje;
}

function iniciarSchedulerNotificacoes() {
  cron.schedule("* * * * *", async () => {
    try {
      const { hora: horaAtual, diaMes: diaMesHoje } = partesAgoraBrasil();

      db.query(
        `
        SELECT * FROM lembretes
        WHERE horario = ?
        AND (status IS NULL OR status != 'Concluído')
        AND (oculto = false OR oculto IS NULL)
        AND (notificacao = true OR notificacao = 1)
        `,
        [horaAtual],
        async (err, lembretes) => {
          if (err) {
            console.error("Erro scheduler lembretes:", err);
            return;
          }

          for (const lembrete of lembretes.filter((item) =>
            lembreteValeParaHoje(item, diaMesHoje),
          )) {
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
                        {
                          alarme: lembrete.alarme !== 0,
                          url: "/dashboard.html",
                        },
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
  }, {
    timezone: "America/Sao_Paulo",
  });
}

module.exports = {
  iniciarSchedulerNotificacoes,
};
