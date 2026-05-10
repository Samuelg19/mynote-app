const db = require("../config/db");

let tabelaPronta = false;

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function garantirTabelaEventos() {
  if (tabelaPronta) return;

  await queryAsync(`
    CREATE TABLE IF NOT EXISTS eventos_calendario (
      usuario_id INT NOT NULL PRIMARY KEY,
      eventos_json LONGTEXT NOT NULL,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  tabelaPronta = true;
}

function normalizarEvento(evento) {
  const normalizado = { ...(evento || {}) };

  if (normalizado.aniversario) {
    normalizado.tipoEvento = "permanente";
    if (normalizado.frequencia?.repeticao) {
      normalizado.frequencia = {
        ...normalizado.frequencia,
        repeticao: null,
      };
    }
    normalizado.excecoes = [];
  }

  return normalizado;
}

function normalizarEventos(eventos) {
  if (!Array.isArray(eventos)) return [];
  return eventos.filter(Boolean).map(normalizarEvento);
}

exports.listar = async (req, res) => {
  try {
    await garantirTabelaEventos();

    const resultados = await queryAsync(
      "SELECT eventos_json FROM eventos_calendario WHERE usuario_id = ?",
      [req.usuario.id],
    );

    if (!resultados.length) return res.json([]);

    try {
      return res.json(normalizarEventos(JSON.parse(resultados[0].eventos_json)));
    } catch {
      return res.json([]);
    }
  } catch (err) {
    console.error("Erro ao listar eventos do calendario:", err);
    res.status(500).json({ msg: "Nao foi possivel listar eventos." });
  }
};

exports.salvar = async (req, res) => {
  try {
    await garantirTabelaEventos();

    const eventos = normalizarEventos(req.body?.eventos);
    const json = JSON.stringify(eventos);

    await queryAsync(
      `
      INSERT INTO eventos_calendario (usuario_id, eventos_json)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE eventos_json = VALUES(eventos_json)
      `,
      [req.usuario.id, json],
    );

    res.json({ msg: "Eventos sincronizados com sucesso.", eventos });
  } catch (err) {
    console.error("Erro ao salvar eventos do calendario:", err);
    res.status(500).json({ msg: "Nao foi possivel salvar eventos." });
  }
};
