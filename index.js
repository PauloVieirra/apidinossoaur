const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

app.get("/dinosaurs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dinosaurs");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dinossauros" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
