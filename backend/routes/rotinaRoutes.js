const express = require("express");
const router = express.Router();
const rotina = require("../controllers/rotinaController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/", autenticarToken, rotina.criar);
router.get("/", autenticarToken, rotina.listar);
router.get("/:id", autenticarToken, rotina.buscarPorId);
router.put("/:id/notas", autenticarToken, rotina.atualizarNotas);
router.delete("/:id", autenticarToken, rotina.excluir);
router.put("/ordem/atualizar", autenticarToken, rotina.atualizarOrdem);

module.exports = router;
