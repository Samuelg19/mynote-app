const db = require("../config/db");

const CALORIAS_MAXIMAS = 5000;

function normalizarCalorias(valor) {
  if (valor === undefined || valor === null || valor === "") return valor;

  const calorias = Number(valor);

  if (!Number.isFinite(calorias) || calorias < 0 || calorias > CALORIAS_MAXIMAS) {
    return null;
  }

  return Math.round(calorias);
}

function validarCalorias(dados, res) {
  if (!Object.prototype.hasOwnProperty.call(dados, "calorias")) return true;

  const calorias = normalizarCalorias(dados.calorias);

  if (calorias === null) {
    res.status(400).json({
      msg: `Calorias devem ficar entre 0 e ${CALORIAS_MAXIMAS}.`,
    });
    return false;
  }

  dados.calorias = calorias;
  return true;
}

exports.criar = (req, res) => {
  const tarefa = req.body;
  const usuario_id = req.usuario.id;

  if (!validarCalorias(tarefa, res)) return;

  // 🔐 Verifica se a rotina pertence ao usuário
  db.query(
    "SELECT * FROM rotinas WHERE id = ? AND usuario_id = ?",
    [tarefa.rotina_id, usuario_id],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(403).json({ msg: "Acesso negado à rotina." });
      }

      db.query("INSERT INTO tarefas SET ?", tarefa, (err) => {
        if (err) {
          console.error("Erro ao criar tarefa:", err);
          return res.status(500).json(err);
        }
        res.json({ msg: "Tarefa criada" });
      });
    },
  );
};

exports.listar = (req, res) => {
  const { rotina_id } = req.query;
  const usuario_id = req.usuario.id;

  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  const segundaFeira = new Date(hoje);
  segundaFeira.setDate(hoje.getDate() + diferencaParaSegunda);

  const semanaAtual = segundaFeira.toISOString().slice(0, 10);
  const dataHoje = hoje.toISOString().slice(0, 10);

  // 🔐 Verifica se a rotina pertence ao usuário
  db.query(
    "SELECT * FROM rotinas WHERE id = ? AND usuario_id = ?",
    [rotina_id, usuario_id],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(403).json({ msg: "Acesso negado." });
      }

      // 🔄 Limpeza automática
      db.query(
        `
        DELETE FROM tarefas
        WHERE rotina_id = ?
          AND repeticao = 'Único'
          AND (
            concluida = true
            OR data_criacao < ?
          )
        `,
        [rotina_id, dataHoje],
        (erroLimpeza) => {
          if (erroLimpeza) {
            console.error("Erro na limpeza automática:", erroLimpeza);
            return res.status(500).json(erroLimpeza);
          }

          // 🔄 Reset semanal
          db.query(
            `
            UPDATE tarefas
            SET 
              concluida = false,
              status = 'Pendente',
              ultima_semana_reset = ?
            WHERE rotina_id = ?
              AND repeticao = 'Semanal'
              AND (
                ultima_semana_reset IS NULL
                OR ultima_semana_reset < ?
              )
            `,
            [semanaAtual, rotina_id, semanaAtual],
            (erroReset) => {
              if (erroReset) {
                console.error("Erro no reset semanal:", erroReset);
                return res.status(500).json(erroReset);
              }

              // 📦 Buscar tarefas
              db.query(
                `
                SELECT t.* FROM tarefas t
                JOIN rotinas r ON t.rotina_id = r.id
                WHERE t.rotina_id = ? AND r.usuario_id = ?
                ORDER BY t.ordem IS NULL, t.ordem ASC, t.id ASC
                `,
                [rotina_id, usuario_id],
                (err, results) => {
                  if (err) return res.status(500).json(err);
                  res.json(results);
                },
              );
            },
          );
        },
      );
    },
  );
};

exports.atualizarStatus = (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  const usuario_id = req.usuario.id;

  delete campos.id;
  delete campos.rotina_id;

  const camposPermitidos = [
    "titulo",
    "tipo",
    "disciplina",
    "horario",
    "status",
    "prioridade",
    "prazo",
    "notificacao",
    "concluida",
    "dia_semana",
    "grupo_muscular",
    "series",
    "repeticoes",
    "carga",
    "calorias",
    "repeticao",
    "ordem",
    "link_material",
    "projeto",
  ];

  const dados = Object.fromEntries(
    Object.entries(campos).filter(([campo]) =>
      camposPermitidos.includes(campo),
    ),
  );

  if (Object.prototype.hasOwnProperty.call(dados, "concluida")) {
    const concluida =
      dados.concluida === true ||
      dados.concluida === 1 ||
      dados.concluida === "true";

    dados.concluida = concluida;
    dados.status = concluida ? "Concluída" : "Pendente";
  }

  if (!validarCalorias(dados, res)) return;

  if (!Object.keys(dados).length) {
    return res.status(400).json({ msg: "Nenhum campo valido para atualizar." });
  }

  const camposSql = Object.keys(dados).map((campo) => `t.\`${campo}\` = ?`);
  const valores = Object.values(dados);

  // Atualiza somente campos enviados e somente tarefas do usuario autenticado.
  db.query(
    `
    UPDATE tarefas t
    JOIN rotinas r ON t.rotina_id = r.id
    SET ${camposSql.join(", ")}
    WHERE t.id = ? AND r.usuario_id = ?
    `,
    [...valores, id, usuario_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Tarefa atualizada com sucesso" });
    },
  );
};
exports.excluir = (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  // 🔐 Deleta só se for do usuário
  db.query(
    `
    DELETE t FROM tarefas t
    JOIN rotinas r ON t.rotina_id = r.id
    WHERE t.id = ? AND r.usuario_id = ?
    `,
    [id, usuario_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Tarefa excluída com sucesso" });
    },
  );
};
