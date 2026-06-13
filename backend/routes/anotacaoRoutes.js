const express = require("express");
const router = express.Router();
const anotacao = require("../controllers/anotacaoController");
const autenticarToken = require("../middlewares/authMiddleware");

router.get("/categorias", autenticarToken, anotacao.listarCategorias);
router.post("/categorias", autenticarToken, anotacao.criarCategoria);
router.put(
  "/categorias/:id",
  autenticarToken,
  anotacao.atualizarCategoria,
);
router.delete(
  "/categorias/:id",
  autenticarToken,
  anotacao.excluirCategoria,
);

router.get("/", autenticarToken, anotacao.listar);
router.post("/", autenticarToken, anotacao.criar);
router.get("/:id", autenticarToken, anotacao.buscar);
router.put("/:id", autenticarToken, anotacao.atualizar);
router.delete("/:id", autenticarToken, anotacao.excluir);

module.exports = router;
