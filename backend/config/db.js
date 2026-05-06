const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "33044270s",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "rotina_app",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err.message);
  } else {
    console.log("MySQL conectado!");
  }
});

module.exports = db;