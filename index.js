const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Verifica se a variável de ambiente está definida
if (!process.env.SUPABASE_DB_URL) {
  console.error("ERRO: A variável SUPABASE_DB_URL não está definida.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Rota para buscar dinossauros
app.get("/dinosaurs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dinosaurs");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar dinossauros:", error.message);
    res.status(500).json({ error: "Erro ao buscar dinossauros" });
  }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
