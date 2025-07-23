const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// const { MongoClient } = require('mongodb');
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar MongoDB Atlas (COMENTADO PARA DESARROLLO LOCAL)
// const mongoUrl = process.env.MONGODB_URI;
// const dbName = 'estilo-casa';
// const collectionName = 'encuestas';

// if (!mongoUrl) {
//   console.error('❌ Error: MONGODB_URI debe estar configurado en las variables de entorno');
//   process.exit(1);
// }

// let db;

// Conectar a MongoDB con configuración SSL (COMENTADO PARA DESARROLLO LOCAL)
// async function connectToMongo() {
//   try {
//     const client = new MongoClient(mongoUrl, {
//       serverSelectionTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });
    
//     await client.connect();
//     db = client.db(dbName);
//     console.log('✅ Conectado a MongoDB Atlas');
    
//     // Crear índice para timestamp si no existe
//     await db.collection(collectionName).createIndex({ timestamp: -1 });
    
//     return client;
//   } catch (error) {
//     console.error('❌ Error conectando a MongoDB:', error.message);
//     process.exit(1);
//   }
// }

// Inicializar conexión (COMENTADO PARA DESARROLLO LOCAL)
// let mongoClient;
// connectToMongo().then(client => {
//   mongoClient = client;
// });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas API (COMENTADAS PARA DESARROLLO LOCAL)
app.post('/api/survey', async (req, res) => {
  try {
    const surveyData = req.body;
    console.log('📝 Encuesta recibida (modo local):', surveyData);
    
    // Simular respuesta exitosa sin guardar en base de datos
    res.json({
      success: true,
      message: 'Encuesta procesada en modo local (sin base de datos)',
      responseId: 'local-' + Date.now()
    });
  } catch (error) {
    console.error('❌ Error al procesar la encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la encuesta',
      error: error.message
    });
  }
});

app.get('/api/survey/stats', async (req, res) => {
  try {
    // Simular estadísticas para desarrollo local
    res.json({
      success: true,
      stats: {
        totalRespuestas: 0,
        respuestasHoy: 0,
        tipoViviendaMasPopular: 'N/A',
        estiloMasPopular: 'N/A',
        distribucionVivienda: {},
        distribucionEstilo: {}
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

app.get('/api/survey/all', async (req, res) => {
  try {
    // Simular respuesta vacía para desarrollo local
    res.json({
      success: true,
      responses: []
    });
  } catch (error) {
    console.error('❌ Error al obtener todas las encuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener encuestas',
      error: error.message
    });
  }
});

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Modo: DESARROLLO LOCAL (sin base de datos)`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Manejo de cierre graceful (COMENTADO PARA DESARROLLO LOCAL)
// process.on('SIGINT', async () => {
//   console.log('\n🛑 Cerrando servidor...');
//   if (mongoClient) {
//     await mongoClient.close();
//     console.log('✅ Conexión a MongoDB cerrada');
//   }
//   process.exit(0);
// }); 