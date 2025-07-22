const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar MongoDB Atlas
const mongoUrl = process.env.MONGODB_URI;
const dbName = 'estilo-casa';
const collectionName = 'encuestas';

if (!mongoUrl) {
  console.error('❌ Error: MONGODB_URI debe estar configurado en las variables de entorno');
  process.exit(1);
}

let db;

// Conectar a MongoDB con configuración SSL
async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(dbName);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Crear índice para timestamp si no existe
    await db.collection(collectionName).createIndex({ timestamp: -1 });
    
    return client;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

// Inicializar conexión
let mongoClient;
connectToMongo().then(client => {
  mongoClient = client;
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas API
app.post('/api/survey', async (req, res) => {
  try {
    const surveyData = req.body;
    const { tipoVivienda, estilo, presupuesto, prioridad } = surveyData;

    const encuesta = {
      timestamp: new Date(),
      tipo_vivienda: tipoVivienda,
      estilo: estilo,
      presupuesto: presupuesto,
      prioridad: prioridad
    };

    const result = await db.collection(collectionName).insertOne(encuesta);

    console.log('✅ Encuesta guardada en MongoDB:', result.insertedId);
    res.json({
      success: true,
      message: 'Encuesta guardada exitosamente en MongoDB',
      responseId: result.insertedId
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
    // Obtener total de respuestas
    const totalCount = await db.collection(collectionName).countDocuments();

    // Obtener respuestas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await db.collection(collectionName).countDocuments({
      timestamp: { $gte: today }
    });

    // Obtener estadísticas por tipo de vivienda
    const viviendaStats = await db.collection(collectionName).aggregate([
      { $group: { _id: '$tipo_vivienda', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const viviendaCount = {};
    viviendaStats.forEach(item => {
      viviendaCount[item._id] = item.count;
    });

    const tipoViviendaMasPopular = viviendaStats.length > 0 ? viviendaStats[0]._id : 'N/A';

    // Obtener estadísticas por estilo
    const estiloStats = await db.collection(collectionName).aggregate([
      { $group: { _id: '$estilo', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const estiloCount = {};
    estiloStats.forEach(item => {
      estiloCount[item._id] = item.count;
    });

    const estiloMasPopular = estiloStats.length > 0 ? estiloStats[0]._id : 'N/A';

    res.json({
      success: true,
      stats: {
        totalRespuestas: totalCount,
        respuestasHoy: todayCount,
        tipoViviendaMasPopular,
        estiloMasPopular,
        distribucionVivienda: viviendaCount,
        distribucionEstilo: estiloCount
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
    const responses = await db.collection(collectionName)
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    res.json({
      success: true,
      responses: responses
    });
  } catch (error) {
    console.error('❌ Error al obtener encuestas:', error);
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
  console.log(`💾 Base de datos MongoDB Atlas: ${dbName}`);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
  process.exit(0);
}); 