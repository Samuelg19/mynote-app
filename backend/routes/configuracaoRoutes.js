const express = require("express");
const router = express.Router();
const configuracao = require("../controllers/configuracaoController");
const autenticarToken = require("../middlewares/authMiddleware");

router.get("/", autenticarToken, configuracao.buscar);
router.put("/", autenticarToken, configuracao.salvar);

module.exports = router;