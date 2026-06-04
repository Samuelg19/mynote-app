const form = document.getElementById("loginForm");

const lembrarUsuario = document.getElementById("lembrarUsuario");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const modalLoginErro = document.getElementById("modalLoginErro");
const modalLoginErroMensagem = document.getElementById("modalLoginErroMensagem");
const fecharModalLoginErro = document.getElementById("fecharModalLoginErro");
const okModalLoginErro = document.getElementById("okModalLoginErro");
const API_URL = "https://mynote-app-production-cb61.up.railway.app";
let focoAntesDoModalLoginErro = null;

function esconderModalLoginErro() {
  if (!modalLoginErro) return;

  modalLoginErro.classList.add("hidden");

  if (focoAntesDoModalLoginErro) {
    focoAntesDoModalLoginErro.focus();
    focoAntesDoModalLoginErro = null;
  }
}

function mostrarModalLoginErro(mensagem) {
  if (!modalLoginErro || !modalLoginErroMensagem) {
    alert(mensagem);
    return;
  }

  focoAntesDoModalLoginErro = document.activeElement;
  modalLoginErroMensagem.textContent =
    mensagem || MyNotePrefs.t("Erro ao fazer login");
  modalLoginErro.classList.remove("hidden");
  okModalLoginErro?.focus();
}

fecharModalLoginErro?.addEventListener("click", esconderModalLoginErro);
okModalLoginErro?.addEventListener("click", esconderModalLoginErro);

modalLoginErro?.addEventListener("click", (event) => {
  if (event.target === modalLoginErro) {
    esconderModalLoginErro();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalLoginErro?.classList.contains("hidden")) {
    esconderModalLoginErro();
  }
});

const mensagemLoginPendente = sessionStorage.getItem("mynote_mensagem_login");

if (mensagemLoginPendente) {
  sessionStorage.removeItem("mynote_mensagem_login");
  mostrarModalLoginErro(mensagemLoginPendente);
}

const emailSalvo = localStorage.getItem("emailLembrado");

if (emailSalvo) {
  emailInput.value = emailSalvo;
  lembrarUsuario.checked = true;
}

async function sincronizarPreferenciasDaConta(token) {
  try {
    const resposta = await fetch(`${API_URL}/configuracoes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resposta.ok) return;

    const configuracoes = await resposta.json();
    MyNotePrefs.saveLocal(configuracoes);
  } catch (erro) {
    console.warn("Nao foi possivel sincronizar preferencias no login:", erro);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarModalLoginErro(dados.msg || MyNotePrefs.t("Erro ao fazer login"));
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(dados.user));
    localStorage.setItem("token", dados.token);
    await sincronizarPreferenciasDaConta(dados.token);

    if (lembrarUsuario.checked) {
      localStorage.setItem("emailLembrado", email);
    } else {
      localStorage.removeItem("emailLembrado");
    }

    alert(MyNotePrefs.t("Login realizado com sucesso!"));
    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro no login:", erro);
    mostrarModalLoginErro("Nao foi possivel conectar ao servidor.");
  }
});

async function loginComGoogle(response) {
  try {
    if (!response?.credential) {
      mostrarModalLoginErro("Erro ao fazer login com Google.");
      return;
    }

    const resposta = await fetch(`${API_URL}/auth/google`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ credential: response.credential })
});

    const dados = await resposta.json();
    const usuario = dados.user || dados.usuario;

    if (!resposta.ok || !usuario || !dados.token) {
      mostrarModalLoginErro(dados.msg || "Erro ao fazer login com Google.");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    localStorage.setItem("token", dados.token);

    if (String(dados.msg || "").toLowerCase().includes("criado")) {
      localStorage.setItem(`mynote_onboarding_pendente_${usuario.id}`, "true");
      localStorage.removeItem(`mynote_onboarding_concluido_${usuario.id}`);
    }

    await sincronizarPreferenciasDaConta(dados.token);

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro no login com Google:", erro);
    mostrarModalLoginErro("Nao foi possivel fazer login com Google.");
  }
}
