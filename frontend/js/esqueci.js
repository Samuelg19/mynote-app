const form = document.getElementById("formEsqueci");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  try {
    const resposta = await fetch("http://localhost:3000/auth/esqueci-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.msg || "Erro ao enviar email.");
      return;
    }

    alert("Email enviado! Verifique sua caixa de entrada.");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao enviar email.");
  }
});
