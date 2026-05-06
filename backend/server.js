require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const rotinaRoutes = require("./routes/rotinaRoutes");
const tarefaRoutes = require("./routes/tarefaRoutes");
const lembreteRoutes = require("./routes/lembreteRoutes");
const configuracaoRoutes = require("./routes/configuracaoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", app: "MyNote API" });
});

app.use("/auth", authRoutes);
app.use("/rotinas", rotinaRoutes);
app.use("/tarefas", tarefaRoutes);
app.use("/lembretes", lembreteRoutes);
app.use("/configuracoes", configuracaoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
