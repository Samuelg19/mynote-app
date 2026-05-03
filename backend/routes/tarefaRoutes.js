const express = require("express");
const router = express.Router();
const tarefa = require("../controllers/tarefaController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/", autenticarToken, tarefa.criar);
router.get("/", autenticarToken, tarefa.listar);
router.put("/:id", autenticarToken, tarefa.atualizarStatus);
router.delete("/:id", autenticarToken, tarefa.excluir);

module.exports = router;