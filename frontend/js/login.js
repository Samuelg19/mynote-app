const form = document.getElementById("loginForm");

const lembrarUsuario = document.getElementById("lembrarUsuario");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const emailSalvo = localStorage.getItem("emailLembrado");

if (emailSalvo) {
  emailInput.value = emailSalvo;
  lembrarUsuario.checked = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  try {
    const resposta = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || MyNotePrefs.t("Erro ao fazer login"));
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(dados.user));
    localStorage.setItem("token", dados.token);

    if (lembrarUsuario.checked) {
      localStorage.setItem("emailLembrado", email);
    } else {
      localStorage.removeItem("emailLembrado");
    }

    alert(MyNotePrefs.t("Login realizado com sucesso!"));
    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro no login:", erro);
    alert(MyNotePrefs.t("Não foi possível conectar ao servidor."));
  }
});

function loginComGoogle(response) {
  fetch("http://localhost:3000/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential: response.credential,
    }),
  })
    .then(async (res) => {
      const dados = await res.json();
      return { ok: res.ok, dados };
    })
    .then(({ ok, dados }) => {
      if (!ok) {
        alert(dados.msg || "Erro ao fazer login com Google.");
        return;
      }

      // 👉 SALVA USUÁRIO
      localStorage.setItem("usuarioLogado", JSON.stringify(dados.user));
      localStorage.setItem("token", dados.token);

      // 👉 REDIRECIONA
      window.location.href = "dashboard.html";
    })
    .catch((erro) => {
      console.error("Erro no login com Google:", erro);
      alert("Não foi possível fazer login com Google.");
    });
}
