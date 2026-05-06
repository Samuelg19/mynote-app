require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const rotinaRoutes = require("./routes/rotinaRoutes");
const tarefaRoutes = require("./routes/tarefaRoutes");
const lembreteRoutes = require("./routes/lembreteRoutes");
const configuracaoRoutes = require("./routes/configuracaoRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://mynote-app-six.vercel.app",
  "https://mynote-7w8dckqne-samuelg19s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());
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
