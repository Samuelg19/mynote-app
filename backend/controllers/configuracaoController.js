const db = require("../config/db");

exports.buscar = (req, res) => {
  const usuario_id = req.usuario.id;

  db.query(
    "SELECT * FROM configuracoes WHERE usuario_id = ?",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.json(results[0]);
      }

      db.query(
        `INSERT INTO configuracoes (
          usuario_id,
          tema,
          tema_fundo,
          idioma,
          fuso_horario,
          formato_hora,
          inicio_semana,
          notificacoes_gerais,
          notificacoes_navegador,
          notificacoes_por_rotina,
          antecedencia_lembrete,
          som_notificacao,
          resumo_diario,
          cor_destaque,
          tamanho_fonte,
          ordenacao_tarefas,
          mostrar_colunas,
          backup_automatico,
          modo_foco,
          tempo_padrao_tarefas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usuario_id,
          "claro",
          "creme",
          "pt-BR",
          "America/Sao_Paulo",
          "24",
          "monday",
          true,
          true,
          true,
          "15 minutos antes",
          true,
          true,
          "ciano",
          "Médio",
          "Por horário",
          true,
          true,
          false,
          "15 minutos"
        ],
        (insertErr) => {
          if (insertErr) return res.status(500).json(insertErr);

          db.query(
            "SELECT * FROM configuracoes WHERE usuario_id = ?",
            [usuario_id],
            (selectErr, newResults) => {
              if (selectErr) return res.status(500).json(selectErr);
              res.json(newResults[0]);
            }
          );
        }
      );
    }
  );
};

exports.salvar = (req, res) => {
  const usuario_id = req.usuario.id;

  const {
    tema = "claro",
    tema_fundo = "creme",
    idioma = "pt-BR",
    fuso_horario = "America/Sao_Paulo",
    formato_hora = "24",
    inicio_semana = "monday",
    notificacoes_gerais = true,
    notificacoes_navegador = true,
    notificacoes_por_rotina = true,
    antecedencia_lembrete = "15 minutos antes",
    som_notificacao = true,
    resumo_diario = true,
    cor_destaque = "ciano",
    tamanho_fonte = "Médio",
    ordenacao_tarefas = "Por horário",
    mostrar_colunas = true,
    backup_automatico = true,
    modo_foco = false,
    tempo_padrao_tarefas = "15 minutos"
  } = req.body;

  const sql = `
    INSERT INTO configuracoes (
      usuario_id,
      tema,
      tema_fundo,
      idioma,
      fuso_horario,
      formato_hora,
      inicio_semana,
      notificacoes_gerais,
      notificacoes_navegador,
      notificacoes_por_rotina,
      antecedencia_lembrete,
      som_notificacao,
      resumo_diario,
      cor_destaque,
      tamanho_fonte,
      ordenacao_tarefas,
      mostrar_colunas,
      backup_automatico,
      modo_foco,
      tempo_padrao_tarefas
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      tema = VALUES(tema),
      tema_fundo = VALUES(tema_fundo),
      idioma = VALUES(idioma),
      fuso_horario = VALUES(fuso_horario),
      formato_hora = VALUES(formato_hora),
      inicio_semana = VALUES(inicio_semana),
      notificacoes_gerais = VALUES(notificacoes_gerais),
      notificacoes_navegador = VALUES(notificacoes_navegador),
      notificacoes_por_rotina = VALUES(notificacoes_por_rotina),
      antecedencia_lembrete = VALUES(antecedencia_lembrete),
      som_notificacao = VALUES(som_notificacao),
      resumo_diario = VALUES(resumo_diario),
      cor_destaque = VALUES(cor_destaque),
      tamanho_fonte = VALUES(tamanho_fonte),
      ordenacao_tarefas = VALUES(ordenacao_tarefas),
      mostrar_colunas = VALUES(mostrar_colunas),
      backup_automatico = VALUES(backup_automatico),
      modo_foco = VALUES(modo_foco),
      tempo_padrao_tarefas = VALUES(tempo_padrao_tarefas)
  `;

  db.query(
    sql,
    [
      usuario_id,
      tema,
      tema_fundo,
      idioma,
      fuso_horario,
      formato_hora,
      inicio_semana,
      notificacoes_gerais,
      notificacoes_navegador,
      notificacoes_por_rotina,
      antecedencia_lembrete,
      som_notificacao,
      resumo_diario,
      cor_destaque,
      tamanho_fonte,
      ordenacao_tarefas,
      mostrar_colunas,
      backup_automatico,
      modo_foco,
      tempo_padrao_tarefas
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Configurações salvas com sucesso" });
    }
  );
};
