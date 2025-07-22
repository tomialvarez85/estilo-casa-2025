const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL pool
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

// Crear tabla si no existe
const createTableQuery = `
CREATE TABLE IF NOT EXISTS encuestas (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo_vivienda VARCHAR(50),
  estilo VARCHAR(50),
  presupuesto VARCHAR(50),
  prioridad VARCHAR(50)
);
`;
pool.query(createTableQuery)
  .then(() => console.log('✅ Tabla "encuestas" lista en PostgreSQL'))
  .catch(err => console.error('Error creando tabla:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas API
app.post('/api/survey', async (req, res) => {
  try {
    const surveyData = req.body;
    const { tipoVivienda, estilo, presupuesto, prioridad } = surveyData;
    const insertQuery = `
      INSERT INTO encuestas (tipo_vivienda, estilo, presupuesto, prioridad)
      VALUES ($1, $2, $3, $4) RETURNING id, timestamp;
    `;
    const values = [tipoVivienda, estilo, presupuesto, prioridad];
    const result = await pool.query(insertQuery, values);
    res.json({
      success: true,
      message: 'Encuesta guardada exitosamente en la base de datos',
      responseId: result.rows[0].id,
      timestamp: result.rows[0].timestamp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al guardar la encuesta en la base de datos',
      error: error.message
    });
  }
});

app.get('/api/survey/stats', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) FROM encuestas');
    const todayRes = await pool.query('SELECT COUNT(*) FROM encuestas WHERE DATE(timestamp) = CURRENT_DATE');
    const popularAreas = await pool.query(`
      SELECT tipo_vivienda as area, COUNT(*) as count
      FROM encuestas
      GROUP BY tipo_vivienda
      ORDER BY count DESC
      LIMIT 3
    `);
    const popularStyles = await pool.query(`
      SELECT estilo, COUNT(*) as count
      FROM encuestas
      GROUP BY estilo
      ORDER BY count DESC
    `);
    res.json({
      success: true,
      stats: {
        totalResponses: parseInt(totalRes.rows[0].count),
        todayResponses: parseInt(todayRes.rows[0].count),
        popularAreas: popularAreas.rows,
        popularStyles: popularStyles.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

app.get('/api/survey/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM encuestas ORDER BY timestamp DESC');
    res.json({
      success: true,
      responses: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las respuestas',
      error: error.message
    });
  }
});

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 Aplicación disponible en http://localhost:${PORT}`);
}); 