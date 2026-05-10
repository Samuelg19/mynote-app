const express = require("express");
const router = express.Router();
const eventosCalendario = require("../controllers/eventoCalendarioController");
const autenticarToken = require("../middlewares/authMiddleware");

router.get("/", autenticarToken, eventosCalendario.listar);
router.put("/", autenticarToken, eventosCalendario.salvar);

module.exports = router;
