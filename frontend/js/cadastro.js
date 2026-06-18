const API_URL = "https://mynote-app-production-cb61.up.railway.app";
const GOOGLE_WEB_CLIENT_ID =
  "889270972410-j0gvc2qd8ls2ssrkig8187kf95rdnthb.apps.googleusercontent.com";
const GOOGLE_CADASTRO_CREDENTIAL_KEY = "mynote_google_cadastro_credential";

const formCadastro = document.getElementById("formCadastro");
const nomeCadastro = document.getElementById("nomeCadastro");
const emailCadastro = document.getElementById("emailCadastro");
const senhaCadastro = document.getElementById("senhaCadastro");
const confirmarSenhaCadastro = document.getElementById(
  "confirmarSenhaCadastro",
);
const btnGoogleCadastro = document.getElementById("btnGoogleCadastro");
const btnAppleCadastro = document.getElementById("btnAppleCadastro");
const modalCadastroAviso = document.getElementById("modalCadastroAviso");
const modalCadastroAvisoTitulo = document.getElementById(
  "modalCadastroAvisoTitulo",
);
const modalCadastroAvisoMensagem = document.getElementById(
  "modalCadastroAvisoMensagem",
);
const fecharModalCadastroAviso = document.getElementById(
  "fecharModalCadastroAviso",
);
const okModalCadastroAviso = document.getElementById("okModalCadastroAviso");

let destinoAposModalCadastro = "";
let socialLoginGoogleInicializado = null;

function ehAppNativoCapacitor() {
  return (
    !!window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === "capacitor:" ||
    window.location.origin === "https://localhost"
  );
}

function obterSocialLoginPlugin() {
  return window.Capacitor?.Plugins?.SocialLogin;
}

async function inicializarSocialLoginGoogle() {
  const SocialLogin = obterSocialLoginPlugin();
  if (!SocialLogin) {
    throw new Error("Plugin SocialLogin nao encontrado no app.");
  }

  if (!socialLoginGoogleInicializado) {
    socialLoginGoogleInicializado = SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        mode: "online",
        scopes: ["email", "profile"],
      },
    });
  }

  await socialLoginGoogleInicializado;
  return SocialLogin;
}

function normalizarCredentialGoogle(valor) {
  if (!valor) return null;
  if (typeof valor === "string") return valor;
  if (typeof valor.token === "string") return valor.token;
  if (typeof valor.idToken === "string") return valor.idToken;
  if (typeof valor.id_token === "string") return valor.id_token;
  return null;
}

function extrairCredentialGoogle(login) {
  const resultado = login?.result || login || {};

  return (
    normalizarCredentialGoogle(resultado.idToken) ||
    normalizarCredentialGoogle(resultado.id_token) ||
    normalizarCredentialGoogle(resultado.authentication?.idToken) ||
    normalizarCredentialGoogle(resultado.authentication?.id_token) ||
    normalizarCredentialGoogle(resultado.accessToken) ||
    normalizarCredentialGoogle(resultado.access_token) ||
    normalizarCredentialGoogle(login?.idToken) ||
    normalizarCredentialGoogle(login?.id_token) ||
    null
  );
}

function mostrarModalCadastroAviso(
  mensagem,
  { titulo = "Aviso", destino = "" } = {},
) {
  if (!modalCadastroAviso || !modalCadastroAvisoMensagem) {
    alert(mensagem);
    if (destino) window.location.href = destino;
    return;
  }

  destinoAposModalCadastro = destino;
  if (modalCadastroAvisoTitulo) modalCadastroAvisoTitulo.textContent = titulo;
  modalCadastroAvisoMensagem.textContent = mensagem;
  modalCadastroAviso.classList.remove("hidden");
  okModalCadastroAviso?.focus();
}

function fecharAvisoCadastro() {
  modalCadastroAviso?.classList.add("hidden");
  const destino = destinoAposModalCadastro;
  destinoAposModalCadastro = "";
  if (destino) window.location.href = destino;
}

fecharModalCadastroAviso?.addEventListener("click", fecharAvisoCadastro);
okModalCadastroAviso?.addEventListener("click", fecharAvisoCadastro);
modalCadastroAviso?.addEventListener("click", (event) => {
  if (event.target === modalCadastroAviso) fecharAvisoCadastro();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !modalCadastroAviso?.classList.contains("hidden")
  ) {
    fecharAvisoCadastro();
  }
});

btnAppleCadastro?.addEventListener("click", () => {
  mostrarModalCadastroAviso("Cadastro com Apple ainda não está disponível.");
});

async function cadastrarComGoogleNoBackend(credential) {
  const resposta = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential, mode: "register" }),
  });

  const dados = await resposta.json();
  const usuario = dados.user || dados.usuario;

  if (dados.code === "GOOGLE_ACCOUNT_ALREADY_EXISTS") {
    sessionStorage.removeItem(GOOGLE_CADASTRO_CREDENTIAL_KEY);
    mostrarModalCadastroAviso(
      "Esta conta do Google já está cadastrada. Você será levado para a tela de login.",
      {
        titulo: "Conta já cadastrada",
        destino: "index.html",
      },
    );
    return;
  }

  if (!resposta.ok || !usuario || !dados.token) {
    mostrarModalCadastroAviso(
      dados.msg || "Não foi possível criar a conta com Google.",
      { titulo: "Erro ao criar conta" },
    );
    return;
  }

  sessionStorage.removeItem(GOOGLE_CADASTRO_CREDENTIAL_KEY);
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  localStorage.setItem("token", dados.token);
  localStorage.setItem(`mynote_onboarding_pendente_${usuario.id}`, "true");
  localStorage.removeItem(`mynote_onboarding_concluido_${usuario.id}`);
  window.location.href = "dashboard.html";
}

async function cadastroGoogleNativo() {
  try {
    const SocialLogin = await inicializarSocialLoginGoogle();
    const login = await SocialLogin.login({
      provider: "google",
      options: {
        style: "bottom",
        filterByAuthorizedAccounts: false,
      },
    });

    const credential = extrairCredentialGoogle(login);
    if (!credential) {
      mostrarModalCadastroAviso("O Google não retornou o token de cadastro.");
      return;
    }

    await cadastrarComGoogleNoBackend(credential);
  } catch (erro) {
    if (erro?.code === "USER_CANCELLED") return;
    console.error("Erro no cadastro nativo com Google:", erro);
    mostrarModalCadastroAviso(
      "Não foi possível cadastrar com Google no app.",
      { titulo: "Erro ao criar conta" },
    );
  }
}

btnGoogleCadastro?.addEventListener("click", async () => {
  const credentialPendente = sessionStorage.getItem(
    GOOGLE_CADASTRO_CREDENTIAL_KEY,
  );

  if (credentialPendente) {
    await cadastrarComGoogleNoBackend(credentialPendente);
    return;
  }

  if (ehAppNativoCapacitor()) {
    await cadastroGoogleNativo();
    return;
  }

  if (!window.google?.accounts?.id) {
    mostrarModalCadastroAviso("Cadastro com Google ainda está carregando.");
    return;
  }

  window.google.accounts.id.prompt();
});

async function cadastroComGoogle(response) {
  if (!response?.credential) {
    mostrarModalCadastroAviso("O Google não retornou o token de cadastro.");
    return;
  }

  await cadastrarComGoogleNoBackend(response.credential);
}

window.cadastroComGoogle = cadastroComGoogle;

formCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = nomeCadastro.value.trim();
  const email = emailCadastro.value.trim();
  const senha = senhaCadastro.value;
  const confirmarSenha = confirmarSenhaCadastro.value;

  if (!nome || !email || !senha || !confirmarSenha) {
    mostrarModalCadastroAviso(MyNotePrefs.t("Preencha todos os campos."));
    return;
  }

  if (senha !== confirmarSenha) {
    mostrarModalCadastroAviso(MyNotePrefs.t("As senhas não coincidem."));
    return;
  }

  if (senha.length < 6) {
    mostrarModalCadastroAviso(
      MyNotePrefs.t("A senha precisa ter pelo menos 6 caracteres."),
    );
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarModalCadastroAviso(
        dados.msg || MyNotePrefs.t("Erro ao criar conta."),
      );
      return;
    }

    sessionStorage.removeItem(GOOGLE_CADASTRO_CREDENTIAL_KEY);
    localStorage.setItem("usuarioLogado", JSON.stringify(dados.user));
    localStorage.setItem("token", dados.token);
    localStorage.setItem(`mynote_onboarding_pendente_${dados.user.id}`, "true");
    localStorage.removeItem(`mynote_onboarding_concluido_${dados.user.id}`);
    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    mostrarModalCadastroAviso(
      MyNotePrefs.t("Não foi possível criar a conta."),
      { titulo: "Erro ao criar conta" },
    );
  }
});
