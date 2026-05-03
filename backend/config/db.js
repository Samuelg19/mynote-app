const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "33044270s",
  database: "rotina_app",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  } else {
    console.log("MySQL conectado!");
  }
});

module.exports = db;
