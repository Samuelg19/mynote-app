const form = document.getElementById("loginForm");

const lembrarUsuario = document.getElementById("lembrarUsuario");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const modalLoginErro = document.getElementById("modalLoginErro");
const modalLoginErroTitulo = document.getElementById("modalLoginErroTitulo");
const modalLoginErroMensagem = document.getElementById("modalLoginErroMensagem");
const fecharModalLoginErro = document.getElementById("fecharModalLoginErro");
const okModalLoginErro = document.getElementById("okModalLoginErro");
const modalLoginSucesso = document.getElementById("modalLoginSucesso");
const okModalLoginSucesso = document.getElementById("okModalLoginSucesso");
const btnGoogleLogin = document.getElementById("btnGoogleLogin");
const btnAppleLogin = document.getElementById("btnAppleLogin");
const API_URL = "https://mynote-app-production-cb61.up.railway.app";
const GOOGLE_WEB_CLIENT_ID =
  "889270972410-j0gvc2qd8ls2ssrkig8187kf95rdnthb.apps.googleusercontent.com";
let focoAntesDoModalLoginErro = null;
let destinoAposModalLoginErro = "";
let loginConfirmado = false;
const GOOGLE_CADASTRO_CREDENTIAL_KEY = "mynote_google_cadastro_credential";
let socialLoginGoogleInicializado = null;

function ehAppNativoCapacitor() {
  return Boolean(
    window.Capacitor?.isNativePlatform?.() ||
      window.location.protocol === "capacitor:" ||
      window.location.origin === "https://localhost",
  );
}

function restaurarSessaoSalvaNoApp() {
  if (!ehAppNativoCapacitor()) return false;

  const tokenSalvo = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  if (!tokenSalvo || !usuarioSalvo) return false;

  try {
    const usuario = JSON.parse(usuarioSalvo);
    if (!usuario?.id) throw new Error("Usuario salvo invalido.");
  } catch {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    return false;
  }

  window.location.replace("dashboard.html");
  return true;
}

restaurarSessaoSalvaNoApp();

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

function esconderModalLoginErro() {
  if (!modalLoginErro) return;

  modalLoginErro.classList.add("hidden");
  const destino = destinoAposModalLoginErro;
  destinoAposModalLoginErro = "";

  if (destino) {
    window.location.href = destino;
    return;
  }

  if (focoAntesDoModalLoginErro) {
    focoAntesDoModalLoginErro.focus();
    focoAntesDoModalLoginErro = null;
  }
}

function mostrarModalLoginErro(
  mensagem,
  { titulo = "Erro ao fazer login", destino = "" } = {},
) {
  if (!modalLoginErro || !modalLoginErroMensagem) {
    alert(mensagem);
    if (destino) window.location.href = destino;
    return;
  }

  focoAntesDoModalLoginErro = document.activeElement;
  destinoAposModalLoginErro = destino;
  if (modalLoginErroTitulo) modalLoginErroTitulo.textContent = titulo;
  modalLoginErroMensagem.textContent =
    mensagem || MyNotePrefs.t("Erro ao fazer login");
  modalLoginErro.classList.remove("hidden");
  okModalLoginErro?.focus();
}

function irParaDashboard() {
  window.location.href = "dashboard.html";
}

function mostrarModalLoginSucesso() {
  if (!modalLoginSucesso) {
    irParaDashboard();
    return;
  }

  loginConfirmado = true;
  modalLoginSucesso.classList.remove("hidden");
  okModalLoginSucesso?.focus();
}

function confirmarLoginSucesso() {
  if (!loginConfirmado) return;
  irParaDashboard();
}

fecharModalLoginErro?.addEventListener("click", esconderModalLoginErro);
okModalLoginErro?.addEventListener("click", esconderModalLoginErro);
okModalLoginSucesso?.addEventListener("click", confirmarLoginSucesso);

modalLoginSucesso?.addEventListener("click", (event) => {
  if (event.target === modalLoginSucesso) {
    confirmarLoginSucesso();
  }
});

modalLoginErro?.addEventListener("click", (event) => {
  if (event.target === modalLoginErro) {
    esconderModalLoginErro();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalLoginErro?.classList.contains("hidden")) {
    esconderModalLoginErro();
  }

  if (
    event.key === "Escape" &&
    !modalLoginSucesso?.classList.contains("hidden")
  ) {
    confirmarLoginSucesso();
  }
});

btnAppleLogin?.addEventListener("click", () => {
  mostrarModalLoginErro("Login com Apple ainda nao esta disponivel.");
});

btnGoogleLogin?.addEventListener("click", async () => {
  if (ehAppNativoCapacitor()) {
    await loginComGoogleNativo();
    return;
  }

  if (!window.google?.accounts?.id) {
    mostrarModalLoginErro("Login com Google ainda esta carregando.");
    return;
  }

  window.google.accounts.id.prompt();
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

async function autenticarComGoogleNoBackend(credential) {
  const resposta = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential, mode: "login" }),
  });

  const dados = await resposta.json();
  const usuario = dados.user || dados.usuario;

  if (dados.code === "GOOGLE_ACCOUNT_NOT_REGISTERED") {
    sessionStorage.setItem(GOOGLE_CADASTRO_CREDENTIAL_KEY, credential);
    mostrarModalLoginErro(
      "Esta conta do Google ainda não foi cadastrada. Você será levado para criar sua conta.",
      {
        titulo: "Conta não cadastrada",
        destino: "cadastro.html",
      },
    );
    return;
  }

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
  mostrarModalLoginSucesso();
}

async function loginComGoogleNativo() {
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
      console.error("Resposta Google sem credential:", login);
      mostrarModalLoginErro("O Google nao retornou o token de login.");
      return;
    }

    await autenticarComGoogleNoBackend(credential);
  } catch (erro) {
    if (erro?.code === "USER_CANCELLED") return;

    console.error("Erro no login nativo com Google:", erro);
    mostrarModalLoginErro("Nao foi possivel fazer login com Google no app.");
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

    mostrarModalLoginSucesso();
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

    await autenticarComGoogleNoBackend(response.credential);
  } catch (erro) {
    console.error("Erro no login com Google:", erro);
    mostrarModalLoginErro("Nao foi possivel fazer login com Google.");
  }
}

window.loginComGoogle = loginComGoogle;
