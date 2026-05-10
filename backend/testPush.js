require("dotenv").config();

const db = require("./config/db");
const { enviarPush } = require("./services/pushService");

db.query(
  "SELECT * FROM push_subscriptions LIMIT 1",
  async (err, results) => {
    if (err) {
      console.error(err);
      process.exit();
    }

    if (!results.length) {
      console.log("Nenhuma inscrição encontrada.");
      process.exit();
    }

    await enviarPush(
      results[0],
      "MyNote",
      "Push funcionando com sucesso 🚀",
    );

    console.log("Push enviado.");
    process.exit();
  },
);