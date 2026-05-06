const API = "https://mynote-app-production.up.railway.app/tarefas";

let tarefas = [];

//Carregar tarefas do backend
async function carregarTarefas() {
  const resposta = await fetch(API);
  tarefas = await resposta.json();
  renderizar();
}

//Adicionar tarefa no backend
async function adicionarTarefa() {
  const texto = document.getElementById("tarefaInput").value;
  const hora = document.getElementById("horaInput").value;

  if (texto === "" || hora === "") {
    alert("Preencha tudo!");
    return;
  }

  const tarefa = {
    id: Date.now(),
    texto,
    hora,
    concluida: false,
  };

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tarefa),
  });

  carregarTarefas();

  document.getElementById("tarefaInput").value = "";
}

//Concluir tarefa
async function toggleTarefa(id) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
  });

  carregarTarefas();
}

//Renderizar na tela
function renderizar() {
  const lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";

  tarefas.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.texto} - ${t.hora}`;

    if (t.concluida) {
      li.classList.add("concluida");
    }

    li.onclick = () => toggleTarefa(t.id);

    lista.appendChild(li);
  });
}

//Iniciar
carregarTarefas();
