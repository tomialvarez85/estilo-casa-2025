const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Crear conexión a SQLite (archivo local)
const db = new sqlite3.Database('./encuestas.db', (err) => {
  if (err) {
    console.error('Error conectando a SQLite:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
  }
});

// Crear tabla si no existe
const createTableQuery = `
CREATE TABLE IF NOT EXISTS encuestas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo_vivienda TEXT,
  estilo TEXT,
  presupuesto TEXT,
  prioridad TEXT
);
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creando tabla:', err.message);
  } else {
    console.log('✅ Tabla "encuestas" lista en SQLite');
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas API
app.post('/api/survey', (req, res) => {
  try {
    const surveyData = req.body;
    const { tipoVivienda, estilo, presupuesto, prioridad } = surveyData;
    
    const insertQuery = `
      INSERT INTO encuestas (tipo_vivienda, estilo, presupuesto, prioridad)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [tipoVivienda, estilo, presupuesto, prioridad], function(err) {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error al guardar la encuesta en la base de datos',
          error: err.message
        });
      } else {
        res.json({
          success: true,
          message: 'Encuesta guardada exitosamente en SQLite',
          responseId: this.lastID
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar la encuesta',
      error: error.message
    });
  }
});

app.get('/api/survey/stats', (req, res) => {
  try {
    // Contar total de respuestas
    db.get('SELECT COUNT(*) as total FROM encuestas', (err, totalRow) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error al obtener estadísticas',
          error: err.message
        });
        return;
      }

      // Contar respuestas de hoy
      db.get('SELECT COUNT(*) as today FROM encuestas WHERE DATE(timestamp) = DATE("now")', (err, todayRow) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: err.message
          });
          return;
        }

        // Obtener tipos de vivienda más populares
        db.all('SELECT tipo_vivienda as area, COUNT(*) as count FROM encuestas GROUP BY tipo_vivienda ORDER BY count DESC LIMIT 3', (err, areasRows) => {
          if (err) {
            res.status(500).json({
              success: false,
              message: 'Error al obtener estadísticas',
              error: err.message
            });
            return;
          }

          // Obtener estilos más populares
          db.all('SELECT estilo, COUNT(*) as count FROM encuestas GROUP BY estilo ORDER BY count DESC', (err, stylesRows) => {
            if (err) {
              res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: err.message
              });
              return;
            }

            res.json({
              success: true,
              stats: {
                totalResponses: totalRow.total,
                todayResponses: todayRow.today,
                popularAreas: areasRows,
                popularStyles: stylesRows
              }
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

app.get('/api/survey/all', (req, res) => {
  try {
    db.all('SELECT * FROM encuestas ORDER BY timestamp DESC', (err, rows) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error al obtener las respuestas',
          error: err.message
        });
      } else {
        res.json({
          success: true,
          responses: rows
        });
      }
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
  console.log(`💾 Base de datos SQLite: encuestas.db`);
}); 