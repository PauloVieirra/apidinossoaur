const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("Conectando ao banco:", process.env.SUPABASE_DB_URL);

// Verifica se a variável de ambiente está definida
if (!process.env.SUPABASE_DB_URL) {
  console.error("ERRO: A variável SUPABASE_DB_URL não está definida.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔥 GET - Buscar todos os dinossauros
app.get("/dinosaurs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dinosaurs");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar dinossauros:", error.message);
    res.status(500).json({ error: "Erro ao buscar dinossauros" });
  }
});

// 🔥 POST - Adicionar um novo dinossauro
app.post("/dinosaurs", async (req, res) => {
  const {
    popular_name,
    scientific_name,
    adult_size,
    diet,
    lived_period,
    reproduction,
    region,
    image_alive,
    image_fossil,
    short_description,
    long_description
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO dinosaurs 
      (popular_name, scientific_name, adult_size, diet, lived_period, reproduction, region, image_alive, image_fossil, short_description, long_description) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [popular_name, scientific_name, adult_size, diet, lived_period, reproduction, region, image_alive, image_fossil, short_description, long_description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar dinossauro:", error.message);
    res.status(500).json({ error: "Erro ao adicionar dinossauro" });
  }
});

// 🔥 PATCH - Atualizar parcialmente um dinossauro
app.patch("/dinosaurs/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
  const values = Object.values(updates);

  try {
    const result = await pool.query(
      `UPDATE dinosaurs SET ${fields.join(", ")} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Dinossauro não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar dinossauro:", error.message);
    res.status(500).json({ error: "Erro ao atualizar dinossauro" });
  }
});

// 🔥 PUT - Atualizar completamente um dinossauro
app.put("/dinosaurs/:id", async (req, res) => {
  const { id } = req.params;
  const {
    popular_name,
    scientific_name,
    adult_size,
    diet,
    lived_period,
    reproduction,
    region,
    image_alive,
    image_fossil,
    short_description,
    long_description
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE dinosaurs SET 
      popular_name = $1, scientific_name = $2, adult_size = $3, diet = $4, lived_period = $5, 
      reproduction = $6, region = $7, image_alive = $8, image_fossil = $9, short_description = $10, long_description = $11
      WHERE id = $12 RETURNING *`,
      [popular_name, scientific_name, adult_size, diet, lived_period, reproduction, region, image_alive, image_fossil, short_description, long_description, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Dinossauro não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao editar dinossauro:", error.message);
    res.status(500).json({ error: "Erro ao editar dinossauro" });
  }
});

// 🔥 DELETE - Remover um dinossauro
app.delete("/dinosaurs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM dinosaurs WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Dinossauro não encontrado" });
    }
    res.json({ message: "Dinossauro deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar dinossauro:", error.message);
    res.status(500).json({ error: "Erro ao deletar dinossauro" });
  }
});

// 🚀 Servidor rodando
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
