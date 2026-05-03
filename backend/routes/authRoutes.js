const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.post("/cadastro", auth.cadastro);
router.post("/login", auth.login);
router.put("/alterar-senha", auth.alterarSenha);
router.delete("/excluir-conta", auth.excluirConta);
router.post("/restaurar-backup", auth.restaurarBackup);
router.post("/esqueci-senha", auth.esqueciSenha);
router.post("/redefinir-senha", auth.redefinirSenha);
router.post("/google", auth.googleLogin);

module.exports = router;
