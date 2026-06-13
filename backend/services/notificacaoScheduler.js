const cron = require("node-cron");

const db = require("../config/db");
const { enviarPush } = require("./pushService");

function partesAgoraBrasil() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const obter = (tipo) => partes.find((parte) => parte.type === tipo)?.value;

  return {
    hora: `${obter("hour")}:${obter("minute")}`,
    diaMes: `${obter("day")}/${obter("month")}`,
    dataISO: `${obter("year")}-${obter("month")}-${obter("day")}`,
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

function minutosDoHorario(horario) {
  const [hora, minuto] = String(horario || "")
    .slice(0, 5)
    .split(":")
    .map(Number);
  if (!Number.isInteger(hora) || !Number.isInteger(minuto)) return null;
  return hora * 60 + minuto;
}

function minutosAteHorario(horario, horaAtual) {
  const alvo = minutosDoHorario(horario);
  const atual = minutosDoHorario(horaAtual);
  if (alvo === null || atual === null) return null;
  return alvo - atual;
}

function antecedenciaEmMinutos(valor) {
  const texto = String(valor || "").toLowerCase();
  const numero = Number(texto.match(/\d+/)?.[0] || 15);

  if (texto.includes("hora")) return numero * 60;
  if (texto.includes("dia")) return numero * 1440;
  return numero;
}

function configuracaoAtiva(valor, padrao = true) {
  if (valor === undefined || valor === null) return padrao;
  return valor !== false && valor !== 0 && valor !== "0";
}

function agruparPorUsuario(itens) {
  return itens.reduce((grupos, item) => {
    const chave = String(item.usuario_id);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(item);
    return grupos;
  }, new Map());
}

function listarTarefasAtivas() {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT
        t.*,
        r.usuario_id,
        r.nome AS rotina_nome,
        c.notificacoes_gerais,
        c.notificacoes_navegador,
        c.notificacoes_por_rotina,
        c.antecedencia_lembrete
      FROM tarefas t
      JOIN rotinas r ON t.rotina_id = r.id
      LEFT JOIN configuracoes c ON c.usuario_id = r.usuario_id
      WHERE t.horario IS NOT NULL
      AND t.horario <> ''
      AND (t.status IS NULL OR t.status NOT LIKE 'Conclu%')
      AND (t.concluida = false OR t.concluida IS NULL)
      AND (t.notificacao = true OR t.notificacao = 1)
      `,
      (err, tarefas) => {
        if (err) return reject(err);
        resolve(tarefas || []);
      },
    );
  });
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

async function filtrarNaoEnviadas(itens, tipo, chavePorItem) {
  const resultado = [];

  for (const item of itens) {
    const chaveEnvio = chavePorItem(item);
    const enviada = await jaEnviouNotificacao({
      usuarioId: item.usuario_id,
      tipo,
      referenciaId: item.id,
      chaveEnvio,
    });
    if (!enviada) resultado.push({ item, chaveEnvio });
  }

  return resultado;
}

function registrarGrupoEnviado(itens, tipo) {
  itens.forEach(({ item, chaveEnvio }) => {
    registrarNotificacaoEnviada({
      usuarioId: item.usuario_id,
      tipo,
      referenciaId: item.id,
      chaveEnvio,
    });
  });
}

async function enviarGrupoTarefas(usuarioId, tarefas, { antecipado = false } = {}) {
  if (!tarefas.length) return;

  const titulo = antecipado
    ? tarefas.length > 1
      ? `${tarefas.length} tarefas proximas`
      : "Tarefa proxima"
    : tarefas.length > 1
      ? `${tarefas.length} tarefas acontecendo agora`
      : "Agora!";
  const mensagem = tarefas
    .map((tarefa) =>
      antecipado
        ? `${tarefa.titulo} as ${String(tarefa.horario).slice(0, 5)}`
        : `${tarefa.titulo} - ${tarefa.rotina_nome || "Rotina"}`,
    )
    .join(" • ");
  const primeira = tarefas[0];

  await enviarPushParaUsuario(usuarioId, titulo, mensagem, {
    alarme:
      !antecipado && tarefas.some((tarefa) => valorAlarmeAtivo(tarefa.alarme)),
    tipo: "tarefa",
    tarefaId: primeira.id,
    rotinaId: primeira.rotina_id,
    horario: String(primeira.horario).slice(0, 5),
    antecipado,
    tarefas: tarefas.map((tarefa) => ({
      tarefaId: tarefa.id,
      rotinaId: tarefa.rotina_id,
      titulo: tarefa.titulo,
      rotinaNome: tarefa.rotina_nome,
      horario: String(tarefa.horario).slice(0, 5),
      alarme: valorAlarmeAtivo(tarefa.alarme),
    })),
    url: "/dashboard.html",
  });
}

function iniciarSchedulerNotificacoes() {
  cron.schedule("* * * * *", async () => {
    try {
      const {
        hora: horaAtual,
        diaMes: diaMesHoje,
        dataISO,
      } = partesAgoraBrasil();
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
            const chaveEnvio = `lembrete-${lembrete.id}-${dataISO}-${horaAtual}`;

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

      const tarefas = (await listarTarefasAtivas()).filter(
        (tarefa) =>
          tarefaValeParaHoje(tarefa, diaSemanaHoje) &&
          configuracaoAtiva(tarefa.notificacoes_gerais) &&
          configuracaoAtiva(tarefa.notificacoes_navegador) &&
          configuracaoAtiva(tarefa.notificacoes_por_rotina),
      );

      const tarefasNoHorario = tarefas.filter(
        (tarefa) => minutosAteHorario(tarefa.horario, horaAtual) === 0,
      );
      const tarefasAntecipadas = tarefas.filter((tarefa) => {
        const antecedencia = antecedenciaEmMinutos(
          tarefa.antecedencia_lembrete,
        );
        return minutosAteHorario(tarefa.horario, horaAtual) === antecedencia;
      });

      for (const [usuarioId, grupo] of agruparPorUsuario(
        tarefasNoHorario,
      )) {
        const naoEnviadas = await filtrarNaoEnviadas(
          grupo,
          "tarefa",
          (tarefa) => `tarefa-${tarefa.id}-${dataISO}-${horaAtual}`,
        );
        if (!naoEnviadas.length) continue;
        await enviarGrupoTarefas(
          usuarioId,
          naoEnviadas.map(({ item }) => item),
        );
        registrarGrupoEnviado(naoEnviadas, "tarefa");
      }

      for (const [usuarioId, grupo] of agruparPorUsuario(
        tarefasAntecipadas,
      )) {
        const naoEnviadas = await filtrarNaoEnviadas(
          grupo,
          "tarefa-antecipada",
          (tarefa) =>
            `tarefa-antecipada-${tarefa.id}-${dataISO}-${horaAtual}`,
        );
        if (!naoEnviadas.length) continue;
        await enviarGrupoTarefas(
          usuarioId,
          naoEnviadas.map(({ item }) => item),
          { antecipado: true },
        );
        registrarGrupoEnviado(naoEnviadas, "tarefa-antecipada");
      }
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
