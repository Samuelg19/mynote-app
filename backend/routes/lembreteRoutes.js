const express = require("express");
const router = express.Router();
const lembrete = require("../controllers/lembreteController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/", autenticarToken, lembrete.criar);
router.get("/", autenticarToken, lembrete.listar);
router.put("/:id/concluir", autenticarToken, lembrete.concluir);
router.put("/:id", autenticarToken, lembrete.atualizarLembrete);
router.delete("/:id", autenticarToken, lembrete.excluir);

module.exports = router;