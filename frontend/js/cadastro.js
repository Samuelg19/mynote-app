const API_URL = "https://mynote-app-production-cb61.up.railway.app";
const formCadastro = document.getElementById("formCadastro");

const nomeCadastro = document.getElementById("nomeCadastro");
const emailCadastro = document.getElementById("emailCadastro");
const senhaCadastro = document.getElementById("senhaCadastro");
const confirmarSenhaCadastro = document.getElementById(
  "confirmarSenhaCadastro",
);
const btnAppleCadastro = document.getElementById("btnAppleCadastro");

btnAppleCadastro?.addEventListener("click", () => {
  alert("Cadastro com Apple ainda nao esta disponivel.");
});

formCadastro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = nomeCadastro.value.trim();
  const email = emailCadastro.value.trim();
  const senha = senhaCadastro.value;
  const confirmarSenha = confirmarSenhaCadastro.value;

  if (!nome || !email || !senha || !confirmarSenha) {
    alert(MyNotePrefs.t("Preencha todos os campos."));
    return;
  }

  if (senha !== confirmarSenha) {
    alert(MyNotePrefs.t("As senhas não coincidem."));
    return;
  }

  if (senha.length < 6) {
    alert(MyNotePrefs.t("A senha precisa ter pelo menos 6 caracteres."));
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
      method: "POST", // ← ESSENCIAL
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || MyNotePrefs.t("Erro ao criar conta."));
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(dados.user));
    localStorage.setItem("token", dados.token);
    localStorage.setItem(`mynote_onboarding_pendente_${dados.user.id}`, "true");
    localStorage.removeItem(`mynote_onboarding_concluido_${dados.user.id}`);

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    alert(MyNotePrefs.t("Não foi possível criar a conta."));
  }
});
