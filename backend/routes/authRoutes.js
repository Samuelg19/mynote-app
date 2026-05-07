const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/cadastro", auth.cadastro);
router.post("/login", auth.login);
router.put("/alterar-senha", autenticarToken, auth.alterarSenha);
router.delete("/excluir-conta", autenticarToken, auth.excluirConta);
router.post("/restaurar-backup", autenticarToken, auth.restaurarBackup);
router.post("/esqueci-senha", auth.esqueciSenha);
router.post("/redefinir-senha", auth.redefinirSenha);
router.post("/google", auth.googleLogin);

module.exports = router;
