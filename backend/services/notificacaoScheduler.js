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

function diaSemanaAtualBrasil() {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
  })
    .format(new Date())
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tarefaValeParaHoje(tarefa, diaSemanaHoje) {
  const diaSemana = String(tarefa.dia_semana || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!diaSemana) return true;
  return diaSemanaHoje.includes(diaSemana) || diaSemana.includes(diaSemanaHoje);
}

function valorAlarmeAtivo(valor) {
  if (valor === undefined || valor === null) return true;
  return valor !== false && valor !== 0 && valor !== "0";
}

function listarSubscriptions(usuarioId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM push_subscriptions WHERE usuario_id = ?",
      [usuarioId],
      (err, subscriptions) => {
        if (err) return reject(err);
        resolve(subscriptions || []);
      },
    );
  });
}

function jaEnviouNotificacao({ usuarioId, tipo, referenciaId, chaveEnvio }) {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT id FROM notificacoes_enviadas
      WHERE usuario_id = ?
      AND tipo = ?
      AND referencia_id = ?
      AND chave_envio = ?
      `,
      [usuarioId, tipo, referenciaId, chaveEnvio],
      (err, results) => {
        if (err) return reject(err);
        resolve((results || []).length > 0);
      },
    );
  });
}

function registrarNotificacaoEnviada({ usuarioId, tipo, referenciaId, chaveEnvio }) {
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
    [usuarioId, tipo, referenciaId, chaveEnvio],
  );
}

async function enviarPushParaUsuario(usuarioId, titulo, mensagem, extras = {}) {
  const subscriptions = await listarSubscriptions(usuarioId);

  for (const sub of subscriptions) {
    await enviarPush(sub, titulo, mensagem, extras);
  }
}

function iniciarSchedulerNotificacoes() {
  cron.schedule("* * * * *", async () => {
    try {
      const { hora: horaAtual, diaMes: diaMesHoje } = partesAgoraBrasil();
      const diaSemanaHoje = diaSemanaAtualBrasil();

      db.query(
        `
        SELECT * FROM lembretes
        WHERE horario = ?
        AND (status IS NULL OR status NOT LIKE 'Conclu%')
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
                          alarme: valorAlarmeAtivo(lembrete.alarme),
                          tipo: "lembrete",
                          lembreteId: lembrete.id,
                          horario: lembrete.horario,
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

      db.query(
        `
        SELECT t.*, r.usuario_id, r.nome AS rotina_nome
        FROM tarefas t
        JOIN rotinas r ON t.rotina_id = r.id
        WHERE t.horario = ?
        AND (t.status IS NULL OR t.status NOT LIKE 'Conclu%')
        AND (t.concluida = false OR t.concluida IS NULL)
        AND (t.notificacao = true OR t.notificacao = 1)
        `,
        [horaAtual],
        async (err, tarefas) => {
          if (err) {
            console.error("Erro scheduler tarefas:", err);
            return;
          }

          for (const tarefa of (tarefas || []).filter((item) =>
            tarefaValeParaHoje(item, diaSemanaHoje),
          )) {
            const chaveEnvio = `tarefa-${tarefa.id}-${horaAtual}`;
            const jaExiste = await jaEnviouNotificacao({
              usuarioId: tarefa.usuario_id,
              tipo: "tarefa",
              referenciaId: tarefa.id,
              chaveEnvio,
            });

            if (jaExiste) continue;

            await enviarPushParaUsuario(
              tarefa.usuario_id,
              "Agora!",
              tarefa.titulo,
              {
                alarme: valorAlarmeAtivo(tarefa.alarme),
                tipo: "tarefa",
                tarefaId: tarefa.id,
                rotinaId: tarefa.rotina_id,
                horario: tarefa.horario,
                url: "/dashboard.html",
              },
            );

            registrarNotificacaoEnviada({
              usuarioId: tarefa.usuario_id,
              tipo: "tarefa",
              referenciaId: tarefa.id,
              chaveEnvio,
            });
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
