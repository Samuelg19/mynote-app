const db = require("../config/db");

const CALORIAS_MAXIMAS = 5000;

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function formatarDataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function garantirColunaAlarmeTarefas() {
  db.query(
    "ALTER TABLE tarefas ADD COLUMN alarme TINYINT(1) DEFAULT 1",
    (err) => {
      if (err && err.code !== "ER_DUP_FIELDNAME") {
        console.warn(
          "Nao foi possivel garantir coluna alarme em tarefas:",
          err.message,
        );
      }
    },
  );
}

garantirColunaAlarmeTarefas();

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

      db.query("INSERT INTO tarefas SET ?", tarefa, (err, result) => {
        if (err) {
          console.error("Erro ao criar tarefa:", err);
          return res.status(500).json(err);
        }
        res.json({ msg: "Tarefa criada", id: tarefa.id || result.insertId });
      });
    },
  );
};

function listarTarefasLegado(req, res) {
  const { rotina_id } = req.query;
  const usuario_id = req.usuario.id;

  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  const segundaFeira = new Date(hoje);
  segundaFeira.setDate(hoje.getDate() + diferencaParaSegunda);

  const semanaAtual = formatarDataLocal(segundaFeira);
  const dataHoje = formatarDataLocal(hoje);

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
}

exports.listar = async (req, res) => {
  const { rotina_id } = req.query;
  const usuario_id = req.usuario.id;

  if (!Number.isInteger(Number(rotina_id)) || Number(rotina_id) <= 0) {
    return res.status(400).json({ msg: "Rotina invalida." });
  }

  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segundaFeira = new Date(hoje);
  segundaFeira.setDate(hoje.getDate() + diferencaParaSegunda);

  const semanaAtual = formatarDataLocal(segundaFeira);
  const dataHoje = formatarDataLocal(hoje);

  try {
    await Promise.all([
      queryAsync(
        `
        DELETE t FROM tarefas t
        JOIN rotinas r ON r.id = t.rotina_id
        WHERE t.rotina_id = ?
          AND r.usuario_id = ?
          AND LOWER(t.repeticao) IN ('unico', 'único')
          AND (
            t.concluida = true
            OR t.data_criacao < ?
          )
        `,
        [rotina_id, usuario_id, dataHoje],
      ),
      queryAsync(
        `
        UPDATE tarefas t
        JOIN rotinas r ON r.id = t.rotina_id
        SET
          t.concluida = false,
          t.status = 'Pendente',
          t.ultima_semana_reset = ?
        WHERE t.rotina_id = ?
          AND r.usuario_id = ?
          AND t.repeticao = 'Semanal'
          AND (
            t.ultima_semana_reset IS NULL
            OR t.ultima_semana_reset < ?
          )
        `,
        [semanaAtual, rotina_id, usuario_id, semanaAtual],
      ),
    ]);

    const resultados = await queryAsync(
      `
      SELECT r.id AS rotina_autorizada, t.*
      FROM rotinas r
      LEFT JOIN tarefas t ON t.rotina_id = r.id
      WHERE r.id = ? AND r.usuario_id = ?
      ORDER BY t.ordem IS NULL, t.ordem ASC, t.id ASC
      `,
      [rotina_id, usuario_id],
    );

    if (!resultados.length) {
      return res.status(403).json({ msg: "Acesso negado." });
    }

    const tarefas = resultados
      .filter((resultado) => resultado.id !== null)
      .map(({ rotina_autorizada, ...tarefa }) => tarefa);

    return res.json(tarefas);
  } catch (err) {
    console.error("Erro ao listar tarefas:", err);
    return res.status(500).json({
      msg: "Nao foi possivel listar as tarefas.",
      detalhe: err?.sqlMessage || err?.message || "Erro interno do banco.",
    });
  }
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
    "alarme",
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

  if (Object.prototype.hasOwnProperty.call(dados, "alarme")) {
    dados.alarme =
      dados.alarme === true || dados.alarme === 1 || dados.alarme === "true";
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
