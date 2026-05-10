const express = require("express");
const router = express.Router();

const push = require("../controllers/pushController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/subscribe", autenticarToken, push.salvarInscricao);
router.get("/teste", autenticarToken, push.testePush);

module.exports = router;