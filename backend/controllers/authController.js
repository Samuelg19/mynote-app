const db = require("../config/db");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");

function gerarTokenUsuario(user) {
  return jwt.sign(
    {
      id: user.id,
      nome: user.nome,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

exports.cadastro = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ msg: "Preencha todos os campos" });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (results.length > 0) {
        return res.status(400).json({ msg: "Email já cadastrado" });
      }

      const hash = await bcrypt.hash(senha, 10);

      db.query(
        "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
        [nome, email, hash],
        (err, results) => {
          if (err) return res.status(500).json(err);

          const novoUsuario = {
            id: results.insertId,
            nome,
            email,
          };

          res.json({
            msg: "Usuário criado!",
            token: gerarTokenUsuario(novoUsuario),
            user: novoUsuario,
          });
        },
      );
    },
  );
};

exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ msg: "Preencha email e senha" });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      const user = results[0];
      const ok = await bcrypt.compare(senha, user.senha);

      if (!ok) {
        return res.status(401).json({ msg: "Senha incorreta" });
      }

      const usuarioLogado = {
        id: user.id,
        nome: user.nome,
        email: user.email,
      };

      res.json({
        msg: "Login ok",
        token: gerarTokenUsuario(usuarioLogado),
        user: usuarioLogado,
      });
    },
  );
};

exports.alterarSenha = (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  const usuario_id = req.usuario?.id || req.body.usuario_id;

  if (!usuario_id || !senhaAtual || !novaSenha) {
    return res.status(400).json({ msg: "Preencha todos os campos." });
  }

  db.query(
    "SELECT * FROM usuarios WHERE id = ?",
    [usuario_id],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ msg: "Usuário não encontrado." });
      }

      const user = results[0];
      const senhaCorreta = await bcrypt.compare(senhaAtual, user.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ msg: "Senha atual incorreta." });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      db.query(
        "UPDATE usuarios SET senha = ? WHERE id = ?",
        [novaSenhaHash, usuario_id],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ msg: "Senha alterada com sucesso." });
        },
      );
    },
  );
};

exports.excluirConta = (req, res) => {
  const usuario_id = req.usuario?.id || req.body.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ msg: "Usuário inválido." });
  }

  db.query(
    "DELETE FROM tarefas WHERE rotina_id IN (SELECT id FROM rotinas WHERE usuario_id = ?)",
    [usuario_id],
    (err) => {
      if (err) return res.status(500).json(err);

      db.query(
        "DELETE FROM lembretes WHERE usuario_id = ?",
        [usuario_id],
        (err) => {
          if (err) return res.status(500).json(err);

          db.query(
            "DELETE FROM configuracoes WHERE usuario_id = ?",
            [usuario_id],
            (err) => {
              if (err) return res.status(500).json(err);

              db.query(
                "DELETE FROM rotinas WHERE usuario_id = ?",
                [usuario_id],
                (err) => {
                  if (err) return res.status(500).json(err);

                  db.query(
                    "DELETE FROM usuarios WHERE id = ?",
                    [usuario_id],
                    (err) => {
                      if (err) return res.status(500).json(err);

                      res.json({ msg: "Conta excluída com sucesso." });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
};

exports.restaurarBackup = (req, res) => {
  const { usuario_id, backup } = req.body;

  if (!usuario_id || !backup || !Array.isArray(backup.rotinas)) {
    return res.status(400).json({ msg: "Backup inválido." });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "DELETE FROM tarefas WHERE rotina_id IN (SELECT id FROM rotinas WHERE usuario_id = ?)",
      [usuario_id],
      (err) => {
        if (err) return db.rollback(() => res.status(500).json(err));

        db.query(
          "DELETE FROM lembretes WHERE usuario_id = ?",
          [usuario_id],
          (err) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            db.query(
              "DELETE FROM rotinas WHERE usuario_id = ?",
              [usuario_id],
              async (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));

                try {
                  for (const rotina of backup.rotinas) {
                    const novaRotinaId = await inserirRotinaBackup(
                      usuario_id,
                      rotina,
                    );

                    const tarefas = Array.isArray(rotina.tarefas)
                      ? rotina.tarefas
                      : [];

                    for (const tarefa of tarefas) {
                      await inserirTarefaBackup(novaRotinaId, tarefa);
                    }
                  }

                  const lembretes = Array.isArray(backup.lembretes)
                    ? backup.lembretes
                    : [];

                  for (const lembrete of lembretes) {
                    await inserirLembreteBackup(usuario_id, lembrete);
                  }

                  db.commit((err) => {
                    if (err)
                      return db.rollback(() => res.status(500).json(err));
                    res.json({ msg: "Backup restaurado com sucesso." });
                  });
                } catch (erro) {
                  db.rollback(() => res.status(500).json(erro));
                }
              },
            );
          },
        );
      },
    );
  });
};

function inserirRotinaBackup(usuario_id, rotina) {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO rotinas 
      (usuario_id, nome, campos_config, tipo_modelo, ordem)
      VALUES (?, ?, ?, ?, ?)`,
      [
        usuario_id,
        rotina.nome || "Rotina restaurada",
        rotina.campos_config || "[]",
        rotina.tipo_modelo || "normal",
        rotina.ordem || 999999,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      },
    );
  });
}

function inserirTarefaBackup(rotina_id, tarefa) {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO tarefas 
      (rotina_id, titulo, tipo, disciplina, horario, status, prioridade, prazo, notificacao, concluida, dia_semana, grupo_muscular, series, repeticoes, carga, calorias, repeticao, ordem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rotina_id,
        tarefa.titulo || "",
        tarefa.tipo || "",
        tarefa.disciplina || "",
        tarefa.horario || null,
        tarefa.status || "Pendente",
        tarefa.prioridade || "Média",
        tarefa.prazo || "",
        tarefa.notificacao ? 1 : 0,
        tarefa.concluida ? 1 : 0,
        tarefa.dia_semana || "",
        tarefa.grupo_muscular || "",
        tarefa.series || "",
        tarefa.repeticoes || "",
        tarefa.carga || "",
        tarefa.calorias || "",
        tarefa.repeticao || "",
        tarefa.ordem || 999999,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

function inserirLembreteBackup(usuario_id, lembrete) {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO lembretes
      (usuario_id, titulo, horario, dia_mes, prioridade, notificacao, concluido)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        lembrete.titulo || "",
        lembrete.horario || null,
        lembrete.dia_mes || "",
        lembrete.prioridade || "Média",
        lembrete.notificacao ? 1 : 0,
        lembrete.concluido ? 1 : 0,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.esqueciSenha = (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ msg: "Email não encontrado." });
      }

      const user = results[0];

      const token = crypto.randomBytes(32).toString("hex");
      const expira = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

      db.query(
        "UPDATE usuarios SET token_reset = ?, token_reset_expira = ? WHERE id = ?",
        [token, expira, user.id],
        async (err) => {
          if (err) return res.status(500).json(err);

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const link = `${process.env.FRONTEND_URL}/reset.html?token=${token}`;

          await transporter.sendMail({
            to: email,
            subject: "Recuperação de senha - MyNote",
            html: `
              <h2>Recuperação de senha</h2>
              <p>Clique no link abaixo para redefinir sua senha:</p>
              <a href="${link}">${link}</a>
              <p>Esse link expira em 15 minutos.</p>
            `,
          });

          res.json({ msg: "Email enviado com sucesso." });
        },
      );
    },
  );
};

exports.redefinirSenha = (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res
      .status(400)
      .json({ msg: "Token e nova senha são obrigatórios." });
  }

  if (novaSenha.length < 6) {
    return res
      .status(400)
      .json({ msg: "A senha precisa ter pelo menos 6 caracteres." });
  }

  db.query(
    "SELECT * FROM usuarios WHERE token_reset = ? AND token_reset_expira > NOW()",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(400).json({ msg: "Token inválido ou expirado." });
      }

      const user = results[0];
      const hash = await bcrypt.hash(novaSenha, 10);

      db.query(
        "UPDATE usuarios SET senha = ?, token_reset = NULL, token_reset_expira = NULL WHERE id = ?",
        [hash, user.id],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ msg: "Senha redefinida com sucesso." });
        },
      );
    },
  );
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ msg: "Token do Google não enviado." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const nome = payload.name;
    const email = payload.email;

    db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length > 0) {
          const user = results[0];
          const usuarioLogado = {
            id: user.id,
            nome: user.nome,
            email: user.email,
          };

          return res.json({
            msg: "Login Google ok",
            token: gerarTokenUsuario(usuarioLogado),
            user: usuarioLogado,
          });
        }

        db.query(
          "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
          [nome, email, "GOOGLE_LOGIN"],
          (err, result) => {
            if (err) return res.status(500).json(err);

            const novoUsuario = {
              id: result.insertId,
              nome,
              email,
            };

            res.json({
              msg: "Usuário Google criado",
              token: gerarTokenUsuario(novoUsuario),
              user: novoUsuario,
            });
          },
        );
      },
    );
  } catch (erro) {
    console.error("Erro no login Google:", erro);
    res.status(401).json({ msg: "Login com Google inválido." });
  }
};


