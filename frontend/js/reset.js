const form = document.getElementById("formReset");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const novaSenha = document.getElementById("novaSenha").value;
  const confirmar = document.getElementById("confirmarSenha").value;

  if (novaSenha !== confirmar) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const resposta = await fetch("https://mynote-app-production.up.railway.app/auth/redefinir-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        novaSenha,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || "Erro ao redefinir senha.");
      return;
    }

    alert("Senha alterada com sucesso!");
    window.location.href = "index.html";
  } catch (erro) {
    console.error(erro);
    alert("Erro ao redefinir senha.");
  }
});
